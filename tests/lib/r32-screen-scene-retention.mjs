import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {restoreR32CrestCaptureIfPresent, restoreR32CrestScenePartIfPresent, restoreR32CrestSceneRowIfPresent} from './r32-crest-scene-retention.mjs';
import {restoreR32FriezeCaptureIfPresent, restoreR32FriezeScenePartIfPresent} from './r32-frieze-scene-retention.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
const hash = value => sha(JSON.stringify(value));
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
export function validateR32ScreenSceneRegistry(bytes) {
  assert.equal(sha(bytes), '3fe73e9730e139e737bf20b1160f6bcb6d12b26f7b71e76c8d5838c174e75fd3', 'immutable R32 screen scene registry');
  return freeze(JSON.parse(bytes));
}
export const r32ScreenScene = validateR32ScreenSceneRegistry(
  fs.readFileSync(new URL('../fixtures/r32-screen-scene-delta.json', import.meta.url))
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
// fields at exact paths. No name filtering, normalization, UV reset or costs
// adjustment is permitted. Unknown bytes remain available to older guards.
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

export const restorePreR32ScreenCapture = value => restore(value, r32ScreenScene.screen.capture, 'exact R32 screen complete capture');
export const restorePreR32CeilingMetadataCapture = value => restore(value, r32ScreenScene.ceiling.capture, 'exact R32 ceiling metadata complete capture');

export function restoreR32ArtworkCaptureIfPresent(value) {
  value = restoreR32CrestCaptureIfPresent(value);
  value = restoreR32FriezeCaptureIfPresent(value);
  value = ifPresent(value, r32ScreenScene.screen.capture, 'exact R32 screen complete capture');
  return ifPresent(value, r32ScreenScene.ceiling.capture, 'exact R32 ceiling metadata complete capture');
}
export function restoreR32ArtworkScenePartIfPresent(kind, value) {
  assert.ok(['rows', 'meshes', 'graph', 'materials'].includes(kind), 'registered R32 artwork scene part');
  value = restoreR32CrestScenePartIfPresent(kind, value);
  value = restoreR32FriezeScenePartIfPresent(kind, value);
  value = ifPresent(value, r32ScreenScene.screen[kind], 'exact R32 screen ' + kind);
  return ifPresent(value, r32ScreenScene.ceiling[kind], 'exact R32 ceiling metadata ' + kind);
}
export function restoreR32ArtworkSceneRowIfPresent(name, value) {
  value = restoreR32CrestSceneRowIfPresent(name, value);
  for (const epoch of ['screen', 'ceiling']) {
    const delta = r32ScreenScene[epoch].sceneRows[name];
    if (delta) value = ifPresent(value, delta, 'exact R32 ' + epoch + ' scene row');
  }
  return value;
}

// This unmerged central-level proof is separate from resident capture hashes.
// Every attribute byte, index, transform and row is bound; only the twelve
// registered UV attributes are replaced with independently rebuilt afb bytes.
export function restorePreR32ScreenCentralLevel(kind, value) {
  assert.ok(kind === 'near' || kind === 'far', 'registered R32 screen central level');
  const delta = r32ScreenScene.central[kind], label = 'exact R32 screen central ' + kind;
  if (hash(value) === delta.beforeSHA256) {assertRuntime(value, delta, label); return value;}
  assert.equal(hash(value), delta.afterSHA256, label);
  assertRuntime(value, delta, label);
  assert.equal(value.length, delta.count, label + ' count');
  const restored = structuredClone(value);
  for (const row of delta.uv) {
    assert.equal(restored[row.index].name, row.name, label + ' UV owner');
    assert.deepEqual(restored[row.index].attributes.uv, row.after, label + ' UV bytes');
    restored[row.index].attributes.uv = structuredClone(row.before);
  }
  assert.equal(hash(restored), delta.beforeSHA256, label + ' restored baseline');
  return restored;
}
