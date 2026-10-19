import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const REGISTRY_SHA256 = 'dfe07135afa71d04ec492f7d6bdc6453d09aa03f4448b8eb25887bdf650cceb2';
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function validateR32FollowthroughSourceRegistry(raw) {
  assert.equal(sha(raw), REGISTRY_SHA256, 'immutable R32 follow-through source registry');
  return freeze(JSON.parse(raw));
}

export const r32FollowthroughSource = validateR32FollowthroughSourceRegistry(
  fs.readFileSync(new URL('../fixtures/r32-followthrough-source-delta.json', import.meta.url))
);

/** Historical bytes only: bind the complete frozen 8542 candidate, reverse
 * seven unique exact hunks, then bind the complete 86a751 result. This does
 * not adapt scenes or runtime behavior and does not depend on checkout HEAD. */
export function restorePreR32FollowthroughSource(path, bytes) {
  const delta = r32FollowthroughSource.files[path];
  if (!delta || sha(bytes) === delta.baselineSHA256) return bytes;
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R32 follow-through source candidate: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R32 follow-through source byte count: ' + path);
  let restored = bytes.toString('utf8');
  for (const hunk of [...delta.deltas].reverse()) {
    assert.ok(hunk.before.length && hunk.after.length, 'nonempty R32 follow-through reverse hunk: ' + path);
    assert.notEqual(hunk.before, hunk.after, 'changed R32 follow-through reverse hunk: ' + path);
    assert.equal(restored.split(hunk.after).length, 2, 'one exact R32 follow-through reverse hunk: ' + path);
    restored = restored.replace(hunk.after, hunk.before);
  }
  const result = Buffer.from(restored, 'utf8');
  assert.equal(sha(result), delta.baselineSHA256, 'exact frozen 86a751 source restored: ' + path);
  assert.equal(result.length, delta.baselineBytes, 'exact 86a751 source byte count: ' + path);
  return result;
}

/** Only registered full 8542 identities are dispatched. Unknown bytes remain
 * unchanged so the existing historical guards can reject their own drift. */
export function restoreR32FollowthroughSourceIfPresent(path, bytes) {
  const delta = r32FollowthroughSource.files[path];
  return delta && sha(bytes) === delta.candidateSHA256 ? restorePreR32FollowthroughSource(path, bytes) : bytes;
}

export function assertR32FollowthroughAddedSource(path, bytes) {
  assert.ok(Object.hasOwn(r32FollowthroughSource.addedFiles, path), 'registered R32 follow-through added source: ' + path);
  const delta = r32FollowthroughSource.addedFiles[path];
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R32 follow-through added source: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R32 follow-through added source byte count: ' + path);
  return bytes;
}
