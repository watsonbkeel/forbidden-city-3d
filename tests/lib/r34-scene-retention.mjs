import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';

const sha = value => createHash('sha256').update(value).digest('hex');
const hash = value => sha(JSON.stringify(value));
const REGISTRY_SHA256 = '1c89802c181cd8de83b416c88e7eb3fc7788f898fc28bd2326b51f2147379a85';
function freeze(value) {
  if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);}
  return value;
}
export function validateR34SceneRegistry(bytes) {
  assert.equal(sha(bytes), REGISTRY_SHA256, 'immutable R34 scene registry');
  return freeze(JSON.parse(bytes));
}
export const r34Scene = validateR34SceneRegistry(fs.readFileSync(new URL('../fixtures/r34-scene-delta.json', import.meta.url)));

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
    assert.ok(['undefined', 'negative-zero'].includes(type), 'registered R34 runtime sidecar type');
    let target = value;
    for (const key of path.slice(0, -1)) target = target[key];
    target[path.at(-1)] = type === 'undefined' ? undefined : -0;
  }
}

// Historical assertions only. Bind the entire ordered object and its runtime
// representation before reversing finite exact fields/splices, then bind the
// complete independently captured R33 result. Unknown values stay unchanged.
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
  assert.equal(hash(restored), delta.beforeSHA256, label + ' restored frozen R33 baseline');
  assert.ok(matchesRuntime(restored, delta.runtimeValues.before), label + ' restored runtime representation');
  return restored;
}
function ifPresent(value, delta, label) {
  return hash(value) === delta.afterSHA256 && matchesRuntime(value, delta.runtimeValues.after) ? restore(value, delta, label) : value;
}
export const restorePreR34Capture = value => restore(value, r34Scene.capture, 'exact R34 complete capture');
export const restoreR34CaptureIfPresent = value => ifPresent(value, r34Scene.capture, 'exact R34 complete capture');
export const restorePreR34Navigation = value => restore(value, r34Scene.navigation, 'exact R34 ordered navigation');
export const restoreR34NavigationIfPresent = value => ifPresent(value, r34Scene.navigation, 'exact R34 ordered navigation');
export function restorePreR34ScenePart(kind, value) {
  assert.ok(Object.hasOwn(r34Scene.parts, kind), 'registered R34 scene part');
  return restore(value, r34Scene.parts[kind], 'exact R34 scene ' + kind);
}
export function restoreR34ScenePartIfPresent(kind, value) {
  assert.ok(Object.hasOwn(r34Scene.parts, kind), 'registered R34 scene part');
  return ifPresent(value, r34Scene.parts[kind], 'exact R34 scene ' + kind);
}
export function restoreR34SceneRowIfPresent(name, value) {
  return Object.hasOwn(r34Scene.sceneRows, name) ? ifPresent(value, r34Scene.sceneRows[name], 'exact R34 scene row') : value;
}

/** Exact full near/far central arrays, with attribute/index bytes retained.
 * Only historical crest/frieze/screen contracts use this finite projection. */
export function restorePreR34CentralLevel(kind, value) {
  assert.ok(kind === 'near' || kind === 'far', 'registered R34 central level');
  return restore(value, r34Scene.central[kind], 'exact R34 central ' + kind);
}
export function restoreR34CentralLevelIfPresent(kind, value) {
  assert.ok(kind === 'near' || kind === 'far', 'registered R34 central level');
  return ifPresent(value, r34Scene.central[kind], 'exact R34 central ' + kind);
}
