import {restoreR33SourceIfPresent} from './r33-source-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const REGISTRY_SHA256 = '4998d76b66b08d12a34774de4267f7046b35afb7009c0e6df16b15399e48412e';
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function validateR32FriezeSourceRegistry(raw) {
  assert.equal(sha(raw), REGISTRY_SHA256, 'immutable R32 frieze source registry');
  return freeze(JSON.parse(raw));
}

export const r32FriezeSource = validateR32FriezeSourceRegistry(
  fs.readFileSync(new URL('../fixtures/r32-frieze-source-delta.json', import.meta.url))
);

/** Historical bytes only: bind the complete frozen d5e1ef0 candidate, reverse
 * three unique exact hunks, then bind the complete 898b4e6 result. This does
 * not adapt scenes or runtime behavior and does not depend on checkout HEAD. */
export function restorePreR32FriezeSource(path, bytes) {
  bytes = restoreR33SourceIfPresent(path, bytes);
  const delta = r32FriezeSource.files[path];
  if (!delta || sha(bytes) === delta.baselineSHA256) return bytes;
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R32 frieze source candidate: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R32 frieze source byte count: ' + path);
  let restored = bytes.toString('utf8');
  for (const hunk of [...delta.deltas].reverse()) {
    assert.ok(hunk.before.length && hunk.after.length, 'nonempty R32 frieze reverse hunk: ' + path);
    assert.notEqual(hunk.before, hunk.after, 'changed R32 frieze reverse hunk: ' + path);
    assert.equal(restored.split(hunk.after).length, 2, 'one exact R32 frieze reverse hunk: ' + path);
    restored = restored.replace(hunk.after, hunk.before);
  }
  const result = Buffer.from(restored, 'utf8');
  assert.equal(sha(result), delta.baselineSHA256, 'exact frozen 898b4e6 source restored: ' + path);
  assert.equal(result.length, delta.baselineBytes, 'exact 898b4e6 source byte count: ' + path);
  return result;
}

/** Only registered full d5e1ef0 identities are dispatched. Unknown bytes remain
 * unchanged so the existing historical guards can reject their own drift. */
export function restoreR32FriezeSourceIfPresent(path, bytes) {
  bytes = restoreR33SourceIfPresent(path, bytes);
  const delta = r32FriezeSource.files[path];
  return delta && sha(bytes) === delta.candidateSHA256 ? restorePreR32FriezeSource(path, bytes) : bytes;
}

export function assertR32FriezeAddedSource(path, bytes) {
  assert.ok(Object.hasOwn(r32FriezeSource.addedFiles, path), 'registered R32 frieze added source: ' + path);
  const delta = r32FriezeSource.addedFiles[path];
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R32 frieze added source: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R32 frieze added source byte count: ' + path);
  return bytes;
}
