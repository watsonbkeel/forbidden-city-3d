import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const REGISTRY_SHA256 = '7df3d1aa468a0219b5d9fe17a9891dfec457a7b89f4e5dc2f3dc90e24ecd7ec9';
function freeze(value) {
  if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);}
  return value;
}
export function validateR35SourceRegistry(bytes) {
  assert.equal(sha(bytes), REGISTRY_SHA256, 'immutable R35 source registry');
  return freeze(JSON.parse(bytes));
}
export const r35Source = validateR35SourceRegistry(fs.readFileSync(new URL('../fixtures/r35-source-delta.json', import.meta.url)));
function bind(bytes, delta, prefix, label) {
  assert.equal(sha(bytes), delta[prefix + 'SHA256'], label);
  assert.equal(bytes.length, delta[prefix + 'Bytes'], label + ' byte count');
  assert.equal(blob(bytes), delta[prefix + 'GitBlob'], label + ' Git blob');
}

/** Historical assertions only. Full candidate identity precedes finite unique
 * reverse hunks. Each result binds an independently read frozen R34 Git blob.
 * Raw product/runtime acceptance never uses this projection. */
export function restorePreR35Source(path, bytes) {
  const delta = Object.hasOwn(r35Source.files, path) ? r35Source.files[path] : undefined;
  if (!delta) return bytes;
  if (sha(bytes) === delta.baselineSHA256) {
    bind(bytes, delta, 'baseline', 'exact frozen R34 source: ' + path);
    return bytes;
  }
  bind(bytes, delta, 'candidate', 'exact R35 source candidate: ' + path);
  let restored = bytes.toString('utf8');
  for (const hunk of [...delta.deltas].reverse()) {
    assert.ok(hunk.before.length && hunk.after.length, 'nonempty R35 reverse hunk');
    assert.notEqual(hunk.before, hunk.after, 'changed R35 reverse hunk');
    assert.equal(restored.split(hunk.after).length, 2, 'unique R35 reverse hunk: ' + path);
    restored = restored.replace(hunk.after, hunk.before);
  }
  const result = Buffer.from(restored);
  bind(result, delta, 'baseline', 'exact frozen R34 source restored: ' + path);
  return result;
}
export function restoreR35SourceIfPresent(path, bytes) {
  const delta = Object.hasOwn(r35Source.files, path) ? r35Source.files[path] : undefined;
  return delta && sha(bytes) === delta.candidateSHA256 ? restorePreR35Source(path, bytes) : bytes;
}
/** Independent Git blob bytes, never reconstructed from the candidate. */
export function independentR34Source(path) {
  assert.ok(Object.hasOwn(r35Source.files, path), 'registered independent R34 source: ' + path);
  const delta = r35Source.files[path], bytes = Buffer.from(delta.baselineUTF8);
  bind(bytes, delta, 'baseline', 'independent frozen R34 source: ' + path);
  return bytes;
}
export function assertR35RetainedSource(path, bytes) {
  assert.ok(Object.hasOwn(r35Source.retainedFiles, path), 'registered R35 retained source: ' + path);
  bind(bytes, r35Source.retainedFiles[path], 'baseline', 'exact retained R34 source: ' + path);
  return bytes;
}
