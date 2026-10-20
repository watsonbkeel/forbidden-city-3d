import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const sha = value => createHash('sha256').update(value).digest('hex');
const hash = value => sha(JSON.stringify(value));
const REGISTRY_SHA256 = '0bf0b4c638f63f997b787b53aace34f827abe6ed0687e9f226832d98f3de73e9';
function freeze(value) {
  if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);}
  return value;
}
export function validateR33SceneRegistry(bytes) {
  assert.equal(sha(bytes), REGISTRY_SHA256, 'immutable R33 scene registry');
  return freeze(JSON.parse(bytes));
}
export const r33Scene = validateR33SceneRegistry(fs.readFileSync(new URL('../fixtures/r33-scene-delta.json', import.meta.url)));

// JSON does not bind omitted properties, negative zero, nonfinite values, or
// non-index array properties. Only each independently captured sidecar is valid.
function runtimeValues(value, path = [], found = []) {
  if (value === undefined) found.push({path: [...path], type: 'undefined'});
  else if (Object.is(value, -0)) found.push({path: [...path], type: 'negative-zero'});
  else if (typeof value === 'number' && !Number.isFinite(value)) found.push({path: [...path], type: String(value)});
  else if (typeof value === 'function' || typeof value === 'symbol') found.push({path: [...path], type: typeof value});
  else if (value && typeof value === 'object') for (const key of Object.keys(value)) {
    path.push(key);
    if (Array.isArray(value) && (String(Number(key)) !== key || !Number.isInteger(Number(key)) || Number(key) < 0 || Number(key) >= value.length)) {
      found.push({path: [...path], type: 'non-index-array-property'});
    }
    runtimeValues(value[key], path, found); path.pop();
  }
  return found;
}
function matchesRuntime(value, records) {
  const actual = runtimeValues(value);
  return actual.length === 0 || hash(actual) === hash(records);
}
function hydrate(value, records) {
  for (const {path, type} of records) {
    assert.ok(['undefined', 'negative-zero'].includes(type), 'registered R33 runtime sidecar type');
    let target = value;
    for (const key of path.slice(0, -1)) target = target[key];
    target[path.at(-1)] = type === 'undefined' ? undefined : -0;
  }
}

// Historical assertions only. Bind the entire ordered object and its runtime
// representation before reversing finite exact fields/splices, then bind the
// complete independently captured R32 result. Unknown values stay unchanged.
function restore(value, delta, label) {
  if (hash(value) === delta.beforeSHA256) {
    assert.ok(matchesRuntime(value, delta.runtimeValues.before), label + ' baseline runtime representation');
    return value;
  }
  assert.equal(hash(value), delta.afterSHA256, label);
  assert.ok(matchesRuntime(value, delta.runtimeValues.after), label + ' runtime representation');
  const restored = structuredClone(value);
  for (const change of [...delta.changes].reverse()) {
    let target = restored;
    if (change.kind === 'splice') {
      for (const key of change.path) target = target[key];
      assert.ok(Array.isArray(target), label + ' registered array splice');
      assert.deepEqual(target.slice(change.afterIndex, change.afterIndex + change.after.length), change.after, label + ' exact ordered splice');
      target.splice(change.afterIndex, change.after.length, ...structuredClone(change.before));
    } else {
      for (const key of change.path.slice(0, -1)) target = target[key];
      const key = change.path.at(-1);
      assert.equal(Object.hasOwn(target, key), !change.afterAbsent, label + ' exact field presence');
      if (!change.afterAbsent) assert.deepEqual(target[key], change.after, label + ' exact field');
      if (change.beforeAbsent) delete target[key];
      else target[key] = structuredClone(change.before);
    }
  }
  hydrate(restored, delta.runtimeValues.before);
  assert.equal(hash(restored), delta.beforeSHA256, label + ' restored frozen R32 baseline');
  assert.ok(matchesRuntime(restored, delta.runtimeValues.before), label + ' restored runtime representation');
  return restored;
}
function ifPresent(value, delta, label) {
  return hash(value) === delta.afterSHA256 && matchesRuntime(value, delta.runtimeValues.after) ? restore(value, delta, label) : value;
}
export const restorePreR33Capture = value => restore(value, r33Scene.capture, 'exact R33 complete capture');
export const restoreR33CaptureIfPresent = value => ifPresent(value, r33Scene.capture, 'exact R33 complete capture');
export const restorePreR33Navigation = value => restore(value, r33Scene.navigation, 'exact R33 ordered navigation');
export const restoreR33NavigationIfPresent = value => ifPresent(value, r33Scene.navigation, 'exact R33 ordered navigation');
export function restorePreR33ScenePart(kind, value) {
  assert.ok(Object.hasOwn(r33Scene.parts, kind), 'registered R33 scene part');
  return restore(value, r33Scene.parts[kind], 'exact R33 scene ' + kind);
}
export function restoreR33ScenePartIfPresent(kind, value) {
  assert.ok(Object.hasOwn(r33Scene.parts, kind), 'registered R33 scene part');
  return ifPresent(value, r33Scene.parts[kind], 'exact R33 scene ' + kind);
}
export function restoreR33SceneRowIfPresent(name, value) {
  return Object.hasOwn(r33Scene.sceneRows, name) ? ifPresent(value, r33Scene.sceneRows[name], 'exact R33 scene row') : value;
}
