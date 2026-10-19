import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {restoreR32ArtworkCaptureIfPresent, restoreR32ArtworkScenePartIfPresent, restoreR32ArtworkSceneRowIfPresent} from './r32-screen-scene-retention.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
const hash = value => sha(JSON.stringify(value));
const REGISTRY_SHA256 = '680a44ba6c076ae2ba8e78e88842d85fd262e39df38443733415f761c2840a4c';
const listKinds = ['meshes', 'graph', 'materials'];
function freeze(value) {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function validateR32SceneRegistry(bytes) {
  assert.equal(sha(bytes), REGISTRY_SHA256, 'immutable R32 scene registry');
  return freeze(JSON.parse(bytes));
}

export const r32Scene = validateR32SceneRegistry(
  fs.readFileSync(new URL('../fixtures/r32-scene-delta.json', import.meta.url))
);

// JSON omits undefined material names and converts negative zero to zero.
// Bind the exact observed runtime exceptions, rather than normalizing arbitrary
// input. The sidecars were captured independently in both frozen checkouts.
function runtimeValues(value, path = [], found = []) {
  if (value === undefined) found.push({path: [...path], type: 'undefined'});
  else if (Object.is(value, -0)) found.push({path: [...path], type: 'negative-zero'});
  else if (typeof value === 'number' && !Number.isFinite(value)) found.push({path: [...path], type: String(value)});
  else if (typeof value === 'function' || typeof value === 'symbol') found.push({path: [...path], type: typeof value});
  else if (value && typeof value === 'object') for (const key of Object.keys(value)) {
    path.push(key); runtimeValues(value[key], path, found); path.pop();
  }
  return found;
}
function matchesRuntime(value, expected) {
  const actual = runtimeValues(value);
  return actual.length === 0 || hash(actual) === hash(expected ?? []);
}
function captureRuntime(epoch) {
  return ['rows', 'meshes', 'materials', 'graph'].flatMap(kind =>
    (r32Scene[kind].runtimeValues?.[epoch] ?? []).map(record => ({...record, path: [kind, ...record.path]})));
}
function assertRuntime(value, expected, label) {
  const actual = runtimeValues(value);
  if (actual.length) assert.deepEqual(actual, expected ?? [], 'exact R32 ' + label + ' runtime representation');
  return actual.length > 0;
}
function hydrate(value, records = [], offset = 0) {
  for (const {path, type} of records) {
    const index = Number(path[0]) - offset;
    if (index < 0 || index >= value.length) continue;
    let target = value[index];
    for (const key of path.slice(1, -1)) target = target[key];
    target[path.at(-1)] = type === 'undefined' ? undefined : -0;
  }
  return value;
}

// Test-only historical restoration. Every complete candidate is bound before
// any exact, position-bound splice; no filtering by names, location or cost.
function spliceBack(value, delta, label, orderedObject = false) {
  if (hash(value) === delta.beforeSHA256) {
    assertRuntime(value, delta.runtimeValues?.before, label);
    return value;
  }
  assert.equal(hash(value), delta.afterSHA256, 'exact R32 ' + label);
  const runtime = assertRuntime(value, delta.runtimeValues?.after, label);
  const rows = structuredClone(orderedObject ? Object.entries(value) : value);
  assert.equal(rows.length, delta.afterCount, 'exact R32 ' + label + ' count');
  for (const splice of [...delta.changes].reverse()) {
    const expected = structuredClone(splice.after);
    if (runtime) hydrate(expected, delta.runtimeValues?.after, splice.afterIndex);
    assert.deepEqual(rows.slice(splice.afterIndex, splice.afterIndex + splice.after.length), expected, 'exact R32 ' + label + ' splice');
    rows.splice(splice.afterIndex, splice.after.length, ...structuredClone(splice.before));
  }
  assert.equal(rows.length, delta.beforeCount, 'exact R31 ' + label + ' count');
  hydrate(rows, delta.runtimeValues?.before);
  const restored = orderedObject ? Object.fromEntries(rows) : rows;
  assert.equal(hash(restored), delta.beforeSHA256, 'exact frozen R31 ' + label + ' restored');
  return restored;
}

export const restorePreR32SceneRows = value => spliceBack(restoreR32ArtworkScenePartIfPresent('rows', value), r32Scene.rows, 'ordered scene groups', true);

export function restorePreR32SceneList(kind, value) {
  assert.ok(listKinds.includes(kind), 'registered R32 scene list: ' + kind);
  value = restoreR32ArtworkScenePartIfPresent(kind, value);
  return spliceBack(value, r32Scene[kind], kind);
}

export function restorePreR32Navigation(value) {
  const delta = r32Scene.navigation;
  if (hash(value) === delta.beforeSHA256) {
    assertRuntime(value, [], 'ordered navigation');
    return value;
  }
  assert.equal(hash(value), delta.afterSHA256, 'exact R32 ordered navigation');
  assertRuntime(value, [], 'ordered navigation');
  const restored = {
    colliders: spliceBack(value.colliders, delta.colliders, 'ordered colliders'),
    walkables: spliceBack(value.walkables, delta.walkables, 'ordered walkables')
  };
  assert.equal(hash(restored), delta.beforeSHA256, 'exact frozen R31 ordered navigation restored');
  return restored;
}

export function restorePreR32Capture(value) {
  value = restoreR32ArtworkCaptureIfPresent(value);
  if (hash(value) === r32Scene.beforeCaptureSHA256) {
    assertRuntime(value, captureRuntime('before'), 'complete capture');
    return value;
  }
  assert.equal(hash(value), r32Scene.afterCaptureSHA256, 'exact R32 complete capture');
  assertRuntime(value, captureRuntime('after'), 'complete capture');
  const restored = structuredClone(value);
  restored.rows = restorePreR32SceneRows(value.rows);
  for (const kind of listKinds) restored[kind] = restorePreR32SceneList(kind, value[kind]);
  restored.navigation = restorePreR32Navigation(value.navigation);
  for (const key of ['geometryBytes', 'uniqueMaterials', 'uniqueTextures']) {
    assert.equal(value[key], r32Scene[key].after, 'exact R32 resident cost: ' + key);
    restored[key] = r32Scene[key].before;
  }
  assert.equal(hash(restored), r32Scene.beforeCaptureSHA256, 'exact frozen R31 complete capture restored');
  return restored;
}

// Conditional dispatch never normalizes unknown values. They remain unchanged
// so an older strict guard can reject them against its own frozen epoch.
export function restoreR32SceneRowsIfPresent(kind, value) {
  assert.ok(kind === 'rows' || listKinds.includes(kind), 'registered R32 scene rows: ' + kind);
  value = restoreR32ArtworkScenePartIfPresent(kind, value);
  if (hash(value) !== r32Scene[kind].afterSHA256 || !matchesRuntime(value, r32Scene[kind].runtimeValues?.after)) return value;
  return kind === 'rows' ? restorePreR32SceneRows(value) : restorePreR32SceneList(kind, value);
}

export function restoreR32SceneRowIfPresent(name, value) {
  value = restoreR32ArtworkSceneRowIfPresent(name, value);
  for (const splice of r32Scene.rows.changes) {
    const after = splice.after.find(([key]) => key === name);
    const before = splice.before.find(([key]) => key === name);
    if (after && before && hash(value) === hash(after[1]) && matchesRuntime(value, [])) return structuredClone(before[1]);
  }
  return value;
}

export const restoreR32NavigationIfPresent = value => hash(value) === r32Scene.navigation.afterSHA256 && matchesRuntime(value, []) ? restorePreR32Navigation(value) : value;
export const restoreR32CaptureIfPresent = value => {
  value = restoreR32ArtworkCaptureIfPresent(value);
  return hash(value) === r32Scene.afterCaptureSHA256 && matchesRuntime(value, captureRuntime('after')) ? restorePreR32Capture(value) : value;
};
