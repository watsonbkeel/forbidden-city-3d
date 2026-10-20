import {restoreR33SourceIfPresent} from './r33-source-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {restoreR32FollowthroughSourceIfPresent} from './r32-followthrough-source-retention.mjs';
import {restoreR32ScreenSourceIfPresent} from './r32-screen-source-retention.mjs';
import {restoreR32FriezeSourceIfPresent} from './r32-frieze-source-retention.mjs';
import {restoreR32CrestSourceIfPresent} from './r32-crest-source-retention.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const REGISTRY_SHA256 = '233e700c22d2fc2bc1db1049ab9b8aca98ae88bea0a0596ab282dbf70e4013aa';
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function validateR32SourceRegistry(raw) {
  assert.equal(sha(raw), REGISTRY_SHA256, 'immutable R32 source registry');
  return freeze(JSON.parse(raw));
}

export const r32Source = validateR32SourceRegistry(
  fs.readFileSync(new URL('../fixtures/r32-source-delta.json', import.meta.url))
);

/** Historical source guards only. First bind the complete frozen candidate;
 * reverse unique, exact hunks without normalization; then bind the complete
 * R31 result. Current R32 behavior is verified independently on real sources. */
export function restorePreR32Source(path, bytes) {
  bytes = restoreR33SourceIfPresent(path, bytes);
  bytes = restoreR32CrestSourceIfPresent(path, bytes);
  bytes = restoreR32FriezeSourceIfPresent(path, bytes);
  bytes = restoreR32ScreenSourceIfPresent(path, bytes);
  bytes = restoreR32FollowthroughSourceIfPresent(path, bytes);
  const delta = r32Source.files[path];
  if (!delta || sha(bytes) === delta.baselineSHA256) return bytes;
  assert.equal(sha(bytes), delta.candidateSHA256, 'exact R32 source candidate: ' + path);
  assert.equal(bytes.length, delta.candidateBytes, 'exact R32 source byte count: ' + path);
  let restored = bytes.toString('utf8');
  for (const hunk of [...delta.deltas].reverse()) {
    assert.ok(hunk.before.length && hunk.after.length, 'nonempty R32 reverse hunk: ' + path);
    assert.notEqual(hunk.before, hunk.after, 'changed R32 reverse hunk: ' + path);
    assert.equal(restored.split(hunk.after).length, 2, 'one exact R32 reverse hunk: ' + path);
    restored = restored.replace(hunk.after, hunk.before);
  }
  const result = Buffer.from(restored, 'utf8');
  assert.equal(sha(result), delta.baselineSHA256, 'exact frozen R31 source restored: ' + path);
  assert.equal(result.length, delta.baselineBytes, 'exact R31 source byte count: ' + path);
  return result;
}

/** Dispatch only the one full registered R32 identity. Unknown bytes remain
 * unchanged so each older strict guard can reject them against its own epoch. */
export function restoreR32SourceIfPresent(path, bytes) {
  bytes = restoreR33SourceIfPresent(path, bytes);
  bytes = restoreR32CrestSourceIfPresent(path, bytes);
  bytes = restoreR32FriezeSourceIfPresent(path, bytes);
  bytes = restoreR32ScreenSourceIfPresent(path, bytes);
  bytes = restoreR32FollowthroughSourceIfPresent(path, bytes);
  const delta = r32Source.files[path];
  return delta && sha(bytes) === delta.candidateSHA256 ? restorePreR32Source(path, bytes) : bytes;
}

export function assertR32AddedSource(path, bytes) {
  assert.ok(Object.hasOwn(r32Source.addedFiles, path), 'registered R32 added source: ' + path);
  const delta = r32Source.addedFiles[path];
  const historical = restoreR32FollowthroughSourceIfPresent(path, restoreR32FriezeSourceIfPresent(path, restoreR33SourceIfPresent(path, bytes)));
  assert.equal(sha(historical), delta.candidateSHA256, 'exact R32 added source: ' + path);
  assert.equal(historical.length, delta.candidateBytes, 'exact R32 added source byte count: ' + path);
  return bytes;
}
