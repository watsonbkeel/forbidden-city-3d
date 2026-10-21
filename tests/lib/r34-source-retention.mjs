import {restoreR35SourceIfPresent} from './r35-source-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
const REGISTRY_SHA256 = 'be99c7be90a828a53025be8099a7f896d21286121e41ac28f08813d46e3521c6';
function freeze(value) {
  if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);}
  return value;
}
export function validateR34SourceRegistry(bytes) {
  assert.equal(sha(bytes), REGISTRY_SHA256, 'immutable R34 integrated source registry');
  return freeze(JSON.parse(bytes));
}
export const r34Source = validateR34SourceRegistry(fs.readFileSync(new URL('../fixtures/r34-source-delta.json', import.meta.url)));
function bind(bytes, delta, prefix, label) {
  assert.equal(sha(bytes), delta[prefix + 'SHA256'], label);
  assert.equal(bytes.length, delta[prefix + 'Bytes'], label + ' byte count');
  assert.equal(blob(bytes), delta[prefix + 'GitBlob'], label + ' Git blob');
}

/** Historical assertions only. Full candidate identity precedes finite unique
 * reverse hunks. Each result binds an independently read frozen R33 Git blob.
 * Raw product code and runtime acceptance never use this projection. */
export function restorePreR34Source(path, bytes) {
  const delta = Object.hasOwn(r34Source.files, path) ? r34Source.files[path] : undefined;
  if (!delta || sha(bytes) === delta.baselineSHA256) return bytes;
  bind(bytes, delta, 'candidate', 'exact R34 integrated source candidate: ' + path);
  let restored = bytes.toString('utf8');
  for (const hunk of [...delta.deltas].reverse()) {
    assert.ok(hunk.before.length && hunk.after.length, 'nonempty R34 reverse hunk');
    assert.notEqual(hunk.before, hunk.after, 'changed R34 reverse hunk');
    assert.equal(restored.split(hunk.after).length, 2, 'unique R34 reverse hunk: ' + path);
    restored = restored.replace(hunk.after, hunk.before);
  }
  const result = Buffer.from(restored);
  bind(result, delta, 'baseline', 'exact frozen R33 source restored: ' + path);
  return result;
}
export function restoreR34SourceIfPresent(path, bytes) {
  bytes = restoreR35SourceIfPresent(path, bytes);
  const delta = Object.hasOwn(r34Source.files, path) ? r34Source.files[path] : undefined;
  return delta && sha(bytes) === delta.candidateSHA256 ? restorePreR34Source(path, bytes) : bytes;
}
export function assertR34AddedSource(path, bytes) {
  assert.ok(Object.hasOwn(r34Source.addedFiles, path), 'registered R34 added source: ' + path);
  bind(bytes, r34Source.addedFiles[path], 'candidate', 'exact R34 added source: ' + path);
  return bytes;
}
/** Independently recorded baseline, not a reconstructed expected source. */
export function independentR33Source(path) {
  assert.ok(Object.hasOwn(r34Source.files, path), 'registered independent R33 source: ' + path);
  const delta = r34Source.files[path], bytes = Buffer.from(delta.baselineUTF8);
  bind(bytes, delta, 'baseline', 'independent frozen R33 source: ' + path);
  return bytes;
}
