import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {restoreR32SourceIfPresent} from './r32-source-retention.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const raw = fs.readFileSync(new URL('../fixtures/r31-combined-source-delta.json', import.meta.url));
assert.equal(sha(raw), '01ba78d08a080327678aaef06f448e1855b5ab6c6ab20ef059b2af2dd2c941b4', 'immutable R31 combined source registry');
export const r31CombinedSource = JSON.parse(raw);

/** Historical bytes only: bind the entire reviewed candidate, reverse each
 * unique exact hunk, and verify the original 2be1751 bytes. No scene adapter. */
export function restorePreR31CombinedSource(path, bytes) {
  bytes = restoreR32SourceIfPresent(path, bytes);
  const delta = r31CombinedSource.files[path];
  if (!delta || sha(bytes) === delta.baselineSHA256) return bytes;
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R31 combined source: ' + path);
  let restored = bytes.toString();
  for (const hunk of [...delta.deltas].reverse()) {
    assert.ok(hunk.before.length && hunk.after.length, 'nonempty R31 reverse hunk: ' + path);
    assert.equal(restored.split(hunk.after).length, 2, 'one exact R31 combined hunk: ' + path);
    restored = restored.replace(hunk.after, hunk.before);
  }
  assert.equal(sha(restored), delta.baselineSHA256, 'exact 2be1751 source restored: ' + path);
  return Buffer.from(restored);
}

/** Older guards accept several older revisions. Only this full candidate
 * identity is dispatched; unknown bytes pass unchanged to their strict guard. */
export function restoreR31CombinedSourceIfPresent(path, bytes) {
  bytes = restoreR32SourceIfPresent(path, bytes);
  const delta = r31CombinedSource.files[path];
  return delta && sha(bytes) === delta.candidateSHA256 ? restorePreR31CombinedSource(path, bytes) : bytes;
}

export function assertR31CombinedAddedSource(path, bytes) {
  assert.ok(Object.hasOwn(r31CombinedSource.addedFiles, path), 'registered R31 added product: ' + path);
  assert.equal(sha(bytes), r31CombinedSource.addedFiles[path].candidateSHA256, 'exact R31 added product: ' + path);
  return bytes;
}
