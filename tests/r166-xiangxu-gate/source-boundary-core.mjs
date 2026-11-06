import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const validPath = p => {
  assert.equal(typeof p, 'string');
  assert.match(p, /^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/);
  assert.ok(!p.split('/').some(s => s === '.' || s === '..'));
  return p;
};
/** Exact source-only inverse. Never changes files, imports or global IO. */
export function createXiangxuBoundary(manifest, {baseManifestBytes, readCurrent, listCurrent}) {
  assert.equal(manifest.schemaVersion, 1);
  assert.ok(Buffer.isBuffer(baseManifestBytes));
  assert.equal(sha(baseManifestBytes), manifest.baseRuntimeManifestSha256, 'Frozen bilingual manifest bytes');
  const base = JSON.parse(baseManifestBytes), baseline = new Map(base.files.map(r => [r.path, r]));
  assert.equal(baseline.size, base.files.length);
  assert.equal(manifest.baseRuntimeInputCount, baseline.size);
  assert.deepEqual(manifest.scope, base.scope);
  const rows = new Map();
  for (const row of manifest.files) {
    validPath(row.path); assert.ok(!rows.has(row.path), 'Duplicate input path');
    assert.match(row.after, /^[a-f0-9]{64}$/);
    assert.ok(['100644', '100755'].includes(row.mode));
    if (row.before !== null) {
      assert.match(row.before, /^[a-f0-9]{64}$/);
      assert.equal(row.before, baseline.get(row.path)?.after, row.path + ' exact original baseline');
      assert.equal(row.mode, baseline.get(row.path)?.mode);
    } else assert.ok(!baseline.has(row.path));
    rows.set(row.path, row);
  }
  const added = [...rows.values()].filter(r => r.before === null).map(r => r.path).sort();
  assert.deepEqual(added, [...manifest.additionalPaths].sort(), 'Only declared extra paths');
  assert.deepEqual([...rows.keys()].sort(), [...baseline.keys(), ...added].sort(), 'Exact extended path set');
  const modified = [...rows.values()].filter(r => r.before !== null && r.before !== r.after);
  assert.deepEqual(Object.keys(manifest.inverseEdits).sort(), modified.map(r => r.path).sort());
  for (const row of modified) {
    const edits = manifest.inverseEdits[row.path]; assert.ok(Array.isArray(edits) && edits.length);
    for (const edit of edits) { assert.equal(typeof edit.before, 'string'); assert.equal(typeof edit.after, 'string'); assert.ok(edit.after); }
  }
  function stripXiangxuDelta(path, bytes) {
    const row = rows.get(path);
    if (!row || row.before === row.after) return bytes;
    assert.equal(sha(bytes), row.after, path + ' exact E46 after bytes');
    if (row.before === null) return null;
    let text = bytes.toString();
    for (const edit of manifest.inverseEdits[path]) {
      assert.equal(text.split(edit.after).length, 2, path + ' unique inverse fragment');
      text = text.replace(edit.after, edit.before);
    }
    assert.equal(sha(text), row.before, path + ' exact reconstructed before hash');
    return typeof bytes === 'string' ? text : Buffer.from(text);
  }
  function verifyCurrent() {
    const paths = listCurrent();
    assert.equal(new Set(paths).size, paths.length, 'Duplicate physical input paths');
    assert.deepEqual([...paths].sort(), [...rows.keys()].sort(), 'Complete physical candidate paths');
    for (const row of rows.values()) {
      const current = readCurrent(row.path);
      assert.ok(current.regular, row.path + ' regular file required');
      assert.equal(current.mode, row.mode, row.path + ' exact mode');
      assert.ok(Buffer.isBuffer(current.bytes));
      assert.equal(sha(current.bytes), row.after, row.path + ' exact candidate hash');
      const prior = stripXiangxuDelta(row.path, current.bytes);
      if (row.before !== null) assert.equal(sha(prior), baseline.get(row.path).after);
    }
    return {files: rows.size, modified: modified.length, added: added.length};
  }
  function historicalPaths(paths) {
    verifyCurrent();
    for (const path of paths) assert.ok(rows.has(path), 'Unexpected historical enumeration input: ' + path);
    return paths.filter(path => rows.get(path).before !== null);
  }
  return {stripXiangxuDelta, verifyCurrent, historicalPaths};
}
