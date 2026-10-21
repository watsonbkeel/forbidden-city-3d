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
export function validateR32FriezeSceneRegistry(bytes) {
  assert.equal(sha(bytes), 'bd0c9ece44c818aae25d5c2ad8394b5f3d2b5ff5f660145e1746d9a79896c42f', 'immutable R32 frieze scene registry');
  return freeze(JSON.parse(bytes));
}
export const r32FriezeScene = validateR32FriezeSceneRegistry(
  fs.readFileSync(new URL('../fixtures/r32-frieze-scene-delta.json', import.meta.url))
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

export const restorePreR32FriezeCapture = value => restore(value, r32FriezeScene.capture, 'exact R32 frieze complete capture');
export const restoreR32FriezeCaptureIfPresent = value => ifPresent(value, r32FriezeScene.capture, 'exact R32 frieze complete capture');
export function restoreR32FriezeScenePartIfPresent(kind, value) {
  assert.ok(['rows', 'meshes', 'graph', 'materials'].includes(kind), 'registered R32 frieze scene part');
  return ifPresent(value, r32FriezeScene.parts[kind], 'exact R32 frieze ' + kind);
}

// The final artwork changes no UVs or other geometry. This assertion never
// restores anything: it binds the independently rebuilt entire central level.
export function assertR32FriezeCentralLevel(kind, value) {
  assert.ok(kind === 'near' || kind === 'far', 'registered R32 frieze central level');
  const delta = r32FriezeScene.central[kind], label = 'exact R32 frieze unchanged central ' + kind;
  assert.equal(hash(value), delta.sha256, label);
  assertRuntime(value, delta, label);
  assert.equal(value.length, delta.count, label + ' count');
  return value;
}
