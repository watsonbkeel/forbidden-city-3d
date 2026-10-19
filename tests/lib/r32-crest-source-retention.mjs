import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const REGISTRY_SHA256 = '5882d02fff96235eeff75fd9c880ff4d5f1f0f71061e03a7947f6d5919a2e2db';
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function validateR32CrestSourceRegistry(raw) {
  assert.equal(sha(raw), REGISTRY_SHA256, 'immutable R32 crest source registry');
  return freeze(JSON.parse(raw));
}

export const r32CrestSource = validateR32CrestSourceRegistry(
  fs.readFileSync(new URL('../fixtures/r32-crest-source-delta.json', import.meta.url))
);

/** Historical bytes only: bind the complete frozen f7f65fd candidate, reverse
 * two unique exact hunks, then bind the complete 8ba57d6 result. This does
 * not adapt scenes or runtime behavior and does not depend on checkout HEAD. */
export function restorePreR32CrestSource(path, bytes) {
  const delta = Object.hasOwn(r32CrestSource.files, path) ? r32CrestSource.files[path] : undefined;
  if (!delta || sha(bytes) === delta.baselineSHA256) return bytes;
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R32 crest source candidate: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R32 crest source byte count: ' + path);
  let restored = bytes.toString('utf8');
  for (const hunk of [...delta.deltas].reverse()) {
    assert.ok(hunk.before.length && hunk.after.length, 'nonempty R32 crest reverse hunk: ' + path);
    assert.notEqual(hunk.before, hunk.after, 'changed R32 crest reverse hunk: ' + path);
    assert.equal(restored.split(hunk.after).length, 2, 'one exact R32 crest reverse hunk: ' + path);
    restored = restored.replace(hunk.after, hunk.before);
  }
  const result = Buffer.from(restored, 'utf8');
  assert.equal(sha(result), delta.baselineSHA256, 'exact frozen 8ba57d6 source restored: ' + path);
  assert.equal(result.length, delta.baselineBytes, 'exact 8ba57d6 source byte count: ' + path);
  return result;
}

/** Only registered full f7f65fd identities are dispatched. Unknown bytes remain
 * unchanged so the existing historical guards can reject their own drift. */
export function restoreR32CrestSourceIfPresent(path, bytes) {
  const delta = Object.hasOwn(r32CrestSource.files, path) ? r32CrestSource.files[path] : undefined;
  return delta && sha(bytes) === delta.candidateSHA256 ? restorePreR32CrestSource(path, bytes) : bytes;
}

export function assertR32CrestAddedSource(path, bytes) {
  assert.ok(Object.hasOwn(r32CrestSource.addedFiles, path), 'registered R32 crest added source: ' + path);
  const delta = r32CrestSource.addedFiles[path];
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R32 crest added source: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R32 crest added source byte count: ' + path);
  return bytes;
}
