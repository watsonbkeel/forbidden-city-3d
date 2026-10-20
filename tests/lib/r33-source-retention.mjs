import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const REGISTRY_SHA256 = '31f70c59c0841453ff0987c1b7fbd0f71ae696ca8f3d249b68f01981dde18158';
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function validateR33SourceRegistry(raw) {
  assert.equal(sha(raw), REGISTRY_SHA256, 'immutable R33 source registry');
  return freeze(JSON.parse(raw));
}

export const r33Source = validateR33SourceRegistry(
  fs.readFileSync(new URL('../fixtures/r33-source-delta.json', import.meta.url))
);

/** Historical source bytes only. Bind the complete frozen c5a1cc2 candidate,
 * reverse 37 unique finite text hunks, then bind each independently read
 * 1fb8592 baseline blob. Added binary assets are not source substitutions. */
export function restorePreR33Source(path, bytes) {
  const delta = Object.hasOwn(r33Source.files, path) ? r33Source.files[path] : undefined;
  if (!delta || sha(bytes) === delta.baselineSHA256) return bytes;
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R33 source candidate: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R33 source byte count: ' + path);
  let restored = bytes.toString('utf8');
  for (const hunk of [...delta.deltas].reverse()) {
    assert.ok(hunk.before.length && hunk.after.length, 'nonempty R33 reverse hunk: ' + path);
    assert.notEqual(hunk.before, hunk.after, 'changed R33 reverse hunk: ' + path);
    assert.equal(restored.split(hunk.after).length, 2, 'one exact R33 reverse hunk: ' + path);
    restored = restored.replace(hunk.after, hunk.before);
  }
  const result = Buffer.from(restored, 'utf8');
  assert.equal(sha(result), delta.baselineSHA256, 'exact frozen R32 source restored: ' + path);
  assert.equal(result.length, delta.baselineBytes, 'exact R32 source byte count: ' + path);
  return result;
}

/** Dispatch only the one registered full candidate identity. Unknown bytes
 * remain unchanged so older strict guards reject them at their own boundary. */
export function restoreR33SourceIfPresent(path, bytes) {
  const delta = Object.hasOwn(r33Source.files, path) ? r33Source.files[path] : undefined;
  return delta && sha(bytes) === delta.candidateSHA256 ? restorePreR33Source(path, bytes) : bytes;
}

export function assertR33AddedSource(path, bytes) {
  assert.ok(Object.hasOwn(r33Source.addedFiles, path), 'registered R33 added source: ' + path);
  const delta = r33Source.addedFiles[path];
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R33 added source: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R33 added source byte count: ' + path);
  return bytes;
}

export function assertR33AddedAsset(path, bytes) {
  assert.ok(Object.hasOwn(r33Source.addedAssets, path), 'registered R33 added asset: ' + path);
  const delta = r33Source.addedAssets[path];
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R33 added asset: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R33 added asset byte count: ' + path);
  return bytes;
}
