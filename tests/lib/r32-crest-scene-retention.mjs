import {restoreR33CaptureIfPresent, restoreR33ScenePartIfPresent, restoreR33SceneRowIfPresent} from './r33-scene-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const sha = value => createHash('sha256').update(value).digest('hex');
const hash = value => sha(JSON.stringify(value));
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
export function validateR32CrestSceneRegistry(bytes) {
  assert.equal(sha(bytes), 'a5afb05ec3adee06387dea5bb998703e82c169dbbf71b1475290cc56e675d886', 'immutable R32 crest scene registry');
  return freeze(JSON.parse(bytes));
}
export const r32CrestScene = validateR32CrestSceneRegistry(
  fs.readFileSync(new URL('../fixtures/r32-crest-scene-delta.json', import.meta.url))
);

// JSON identities alone cannot bind undefined properties, negative zero or
// nonfinite values. Only the independently observed runtime sidecar is allowed.
function runtimeValues(value, path = [], found = []) {
  if (value === undefined) found.push({path: [...path], type: 'undefined'});
  else if (Object.is(value, -0)) found.push({path: [...path], type: 'negative-zero'});
  else if (typeof value === 'number' && !Number.isFinite(value)) found.push({path: [...path], type: String(value)});
  else if (typeof value === 'function' || typeof value === 'symbol') found.push({path: [...path], type: typeof value});
  else if (value && typeof value === 'object') for (const key of Object.keys(value)) {
    path.push(key);
    // JSON also omits non-index array properties, even when their value is
    // an ordinary number. None exists in the independently captured inputs.
    if (Array.isArray(value) && (String(Number(key)) !== key || !Number.isInteger(Number(key)) || Number(key) < 0 || Number(key) >= value.length)) {
      found.push({path: [...path], type: 'non-index-array-property'});
    }
    runtimeValues(value[key], path, found); path.pop();
  }
  return found;
}
function matchesRuntime(value, delta) {
  const actual = runtimeValues(value);
  return actual.length === 0 || hash(actual) === hash(delta.runtimeValues);
}
function assertRuntime(value, delta, label) {
  assert.ok(matchesRuntime(value, delta), label + ' runtime representation');
}

// Bind the entire capture/list before reversing only explicitly registered
// fields at exact paths, including the exact registered byte-budget delta.
// No name filtering, normalization or count-only acceptance is permitted.
// Unknown bytes remain available to older guards.
function restore(value, delta, label) {
  if (hash(value) === delta.beforeSHA256) {assertRuntime(value, delta, label); return value;}
  assert.equal(hash(value), delta.afterSHA256, label);
  assertRuntime(value, delta, label);
  const restored = structuredClone(value);
  for (const change of delta.changes) {
    let target = restored;
    for (const key of change.path.slice(0, -1)) target = target[key];
    const key = change.path.at(-1);
    assert.equal(Object.hasOwn(target, key), !change.afterAbsent, label + ' exact field presence');
    if (!change.afterAbsent) assert.deepEqual(target[key], change.after, label + ' exact field');
    if (change.beforeAbsent) delete target[key];
    else target[key] = structuredClone(change.before);
  }
  assert.equal(hash(restored), delta.beforeSHA256, label + ' restored baseline');
  assertRuntime(restored, delta, label);
  return restored;
}
function ifPresent(value, delta, label) {
  return hash(value) === delta.afterSHA256 && matchesRuntime(value, delta) ? restore(value, delta, label) : value;
}

export const restorePreR32CrestCapture = value => restore(restoreR33CaptureIfPresent(value), r32CrestScene.capture, 'exact R32 crest complete capture');
export const restoreR32CrestCaptureIfPresent = value => ifPresent(restoreR33CaptureIfPresent(value), r32CrestScene.capture, 'exact R32 crest complete capture');
export function restoreR32CrestScenePartIfPresent(kind, value) {
  assert.ok(['rows', 'meshes', 'graph', 'materials'].includes(kind), 'registered R32 crest scene part');
  return ifPresent(restoreR33ScenePartIfPresent(kind, value), r32CrestScene.parts[kind], 'exact R32 crest ' + kind);
}

export function restoreR32CrestSceneRowIfPresent(name, value) {
  value = restoreR33SceneRowIfPresent(name, value);
  const delta = r32CrestScene.sceneRows[name];
  return delta ? ifPresent(value, delta, 'exact R32 crest scene row') : value;
}

// These exact source-rebuilt attributes belong only to five frozen near crowns.
// Full-level identities bind all other attributes, transforms and ordering first.
export function restorePreR32CrestCentralLevel(kind, value) {
  assert.ok(kind === 'near' || kind === 'far', 'registered R32 crest central level');
  assert.equal(value.length, r32CrestScene.central[kind].count, 'exact R32 crest central count');
  return restore(value, r32CrestScene.central[kind], 'exact R32 crest central ' + kind);
}
export function restoreR32CrestCentralLevelIfPresent(kind, value) {
  assert.ok(kind === 'near' || kind === 'far', 'registered R32 crest central level');
  return ifPresent(value, r32CrestScene.central[kind], 'exact R32 crest central ' + kind);
}
