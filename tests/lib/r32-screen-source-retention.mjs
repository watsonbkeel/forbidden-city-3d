import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const REGISTRY_SHA256 = '2d359fc84375bb3da5c1943f6358412fcb4224440e7084bdcef5f32c62bd87bf';
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function validateR32ScreenSourceRegistry(raw) {
  assert.equal(sha(raw), REGISTRY_SHA256, 'immutable R32 screen source registry');
  return freeze(JSON.parse(raw));
}

export const r32ScreenSource = validateR32ScreenSourceRegistry(
  fs.readFileSync(new URL('../fixtures/r32-screen-source-delta.json', import.meta.url))
);

/** Historical bytes only: bind the complete frozen a9f0c51 candidate, reverse
 * five unique exact hunks, then bind the complete afb369c result. This does
 * not adapt scenes or runtime behavior and does not depend on checkout HEAD. */
export function restorePreR32ScreenSource(path, bytes) {
  const delta = r32ScreenSource.files[path];
  if (!delta || sha(bytes) === delta.baselineSHA256) return bytes;
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R32 screen source candidate: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R32 screen source byte count: ' + path);
  let restored = bytes.toString('utf8');
  for (const hunk of [...delta.deltas].reverse()) {
    assert.ok(hunk.before.length && hunk.after.length, 'nonempty R32 screen reverse hunk: ' + path);
    assert.notEqual(hunk.before, hunk.after, 'changed R32 screen reverse hunk: ' + path);
    assert.equal(restored.split(hunk.after).length, 2, 'one exact R32 screen reverse hunk: ' + path);
    restored = restored.replace(hunk.after, hunk.before);
  }
  const result = Buffer.from(restored, 'utf8');
  assert.equal(sha(result), delta.baselineSHA256, 'exact frozen afb369c source restored: ' + path);
  assert.equal(result.length, delta.baselineBytes, 'exact afb369c source byte count: ' + path);
  return result;
}

/** Only registered full a9f0c51 identities are dispatched. Unknown bytes remain
 * unchanged so the existing historical guards can reject their own drift. */
export function restoreR32ScreenSourceIfPresent(path, bytes) {
  const delta = r32ScreenSource.files[path];
  return delta && sha(bytes) === delta.candidateSHA256 ? restorePreR32ScreenSource(path, bytes) : bytes;
}

export function assertR32ScreenAddedSource(path, bytes) {
  assert.ok(Object.hasOwn(r32ScreenSource.addedFiles, path), 'registered R32 screen added source: ' + path);
  const delta = r32ScreenSource.addedFiles[path];
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R32 screen added source: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R32 screen added source byte count: ' + path);
  return bytes;
}
