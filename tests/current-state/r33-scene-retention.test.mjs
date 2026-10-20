import {restoreR34CaptureIfPresent} from '../lib/r34-scene-retention.mjs';
import {restoreR34SourceIfPresent} from '../lib/r34-source-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {r33Scene, validateR33SceneRegistry, restorePreR33Capture, restoreR33CaptureIfPresent,
  restorePreR33Navigation, restoreR33NavigationIfPresent, restorePreR33ScenePart,
  restoreR33ScenePartIfPresent, restoreR33SceneRowIfPresent} from '../lib/r33-scene-retention.mjs';
import {historicalR32ModuleURL} from '../lib/historical-r32-scene-dependencies.mjs';

registerHooks({load(url, context, next) {
  if (url.endsWith('.json')) return {format: 'module', source: 'export default ' + fs.readFileSync(new URL(url), 'utf8'), shortCircuit: true};
  return next(url, context);
}});
const root = new URL('../../', import.meta.url);
const raw = fs.readFileSync(new URL('../fixtures/r33-scene-delta.json', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hash = value => sha(JSON.stringify(value));
const {PalaceBuilder} = await import('../../src/scene/PalaceBuilder.js');
const {captureJiaotaiScene} = await import('../lib/r27-jiaotai-capture.mjs');
// Explicit historical R33 boundary; raw current R34 capture has separate acceptance.
const current = restoreR34CaptureIfPresent(captureJiaotaiScene(PalaceBuilder));
const oldBuilder = (await import(historicalR32ModuleURL('src/scene/PalaceBuilder.js'))).PalaceBuilder;
// Expected R32 output is executed from independent baseline module bytes, never
// derived from the scene restoration helper under test.
const historical = captureJiaotaiScene(oldBuilder);
const costs = value => ({triangles: Object.values(value.rows).reduce((n, row) => n + row.triangles, 0),
  meshes: value.meshes.length, graphNodes: value.graph.length, geometryBytes: value.geometryBytes,
  uniqueMaterials: value.uniqueMaterials, uniqueTextures: value.uniqueTextures,
  colliders: value.navigation.colliders.length, walkables: value.navigation.walkables.length});

test('R33 immutable registry binds the frozen product and independent R32 sources without changing prior fixtures', () => {
  assert.equal(r33Scene.schema, 1);
  assert.equal(r33Scene.baseline, '1fb85925f7ab6358661df9a1ac564ad70013d7f7');
  assert.equal(r33Scene.candidate, '21472ee195555bd6438a94634c93fe183d24f977');
  assert.deepEqual(validateR33SceneRegistry(raw), r33Scene);
  assert.ok(Object.isFrozen(r33Scene.capture.changes));
  assert.ok(Object.isFrozen(r33Scene.capture.changes[0]));
  assert.ok(Object.isFrozen(r33Scene.baselineSources));
  assert.equal(Object.keys(r33Scene.baselineSources).length, 11);
  assert.equal(Object.keys(r33Scene.retainedSources).length, 169);
  for (const [path, record] of Object.entries(r33Scene.baselineSources)) {
    assert.equal(sha(Buffer.from(record.utf8)), record.sha256, path);
    assert.equal(Buffer.byteLength(record.utf8), record.bytes, path);
  }
  const crest = JSON.parse(fs.readFileSync(new URL('../fixtures/r32-crest-scene-delta.json', import.meta.url)));
  assert.equal(r33Scene.capture.beforeSHA256, crest.capture.afterSHA256);
  assert.equal(r33Scene.baselineSources['src/scene/PalaceBuilder.js'].sha256, crest.retainedBuilderSHA256);
  for (const [path, digest] of Object.entries(r33Scene.retainedSources)) assert.equal(sha(restoreR34SourceIfPresent(path, fs.readFileSync(new URL(path, root)))), digest, path);
});

test('R33 registry rejects altered, truncated, appended and same-length-corrupted identities, patches and independent sources', () => {
  const corrupted = Buffer.from(raw); corrupted[Math.floor(corrupted.length / 2)] ^= 1;
  for (const bytes of [Buffer.alloc(0), corrupted, raw.subarray(1), Buffer.concat([raw, Buffer.from('\n')])]) {
    assert.throws(() => validateR33SceneRegistry(bytes), /immutable R33 scene registry/);
  }
  for (const change of [r => {r.candidate = '0'.repeat(40);}, r => {r.capture.afterSHA256 = '0'.repeat(64);},
    r => {r.capture.changes.pop();}, r => {r.navigation.changes[0].after.pop();},
    r => {r.capture.runtimeValues.after.push({path: ['extra'], type: 'undefined'});},
    r => {r.baselineSources['src/scene/PalaceBuilder.js'].utf8 += '\n';},
    r => {delete r.retainedSources['src/scene/Layout.js'];}, r => {r.costs.after.geometryBytes++;}]) {
    const bad = structuredClone(r33Scene); change(bad);
    assert.throws(() => validateR33SceneRegistry(Buffer.from(JSON.stringify(bad, null, 2) + '\n')), /immutable R33 scene registry/);
  }
});

test('historical R33 resident capture binds complete geometry, materials, metadata, budgets and current ordered navigation', () => {
  assert.equal(hash(current), r33Scene.capture.afterSHA256);
  assert.equal(hash(historical), r33Scene.capture.beforeSHA256);
  assert.deepEqual(costs(current), r33Scene.costs.after);
  assert.deepEqual(costs(historical), r33Scene.costs.before);
  assert.deepEqual(costs(current), {triangles: 210859, meshes: 178, graphNodes: 207, geometryBytes: 20474444,
    uniqueMaterials: 93, uniqueTextures: 25, colliders: 2845, walkables: 230});
  assert.equal(current.geometryBytes - historical.geometryBytes, 99072);
  assert.equal(costs(current).triangles - costs(historical).triangles, 1032);
  assert.deepEqual(Object.keys(r33Scene.sceneRows), ['三台', '后三宫']);
  for (const name of Object.keys(current.rows)) if (!Object.hasOwn(r33Scene.sceneRows, name)) assert.deepEqual(current.rows[name], historical.rows[name]);
  assert.deepEqual(current.materials, historical.materials);
  assert.deepEqual(current.navigation.walkables, historical.navigation.walkables);
  assert.equal(current.navigation.colliders.length - historical.navigation.colliders.length, 18);
  assert.equal(hash(current.navigation), r33Scene.navigation.afterSHA256);
});

test('only exact R33 scene identities restore independent R32 captures and every existing historical entry chain', async () => {
  const original = hash(current);
  assert.deepEqual(restorePreR33Capture(current), historical);
  assert.deepEqual(restorePreR33Capture(JSON.parse(JSON.stringify(current))), historical);
  assert.deepEqual(restoreR33CaptureIfPresent(current), historical);
  assert.equal(restorePreR33Capture(historical), historical);
  assert.equal(restoreR33CaptureIfPresent(historical), historical);
  for (const kind of ['rows', 'meshes', 'graph', 'materials']) {
    assert.deepEqual(restorePreR33ScenePart(kind, current[kind]), historical[kind]);
    assert.deepEqual(restoreR33ScenePartIfPresent(kind, current[kind]), historical[kind]);
  }
  for (const [name, row] of Object.entries(current.rows)) assert.deepEqual(restoreR33SceneRowIfPresent(name, row), historical.rows[name]);
  assert.deepEqual(restorePreR33Navigation(current.navigation), historical.navigation);
  assert.deepEqual(restoreR33NavigationIfPresent(current.navigation), historical.navigation);
  const r32 = await import('../lib/r32-scene-retention.mjs');
  const r31 = await import('../lib/r31-qianqing-surface-retention.mjs');
  const r30 = await import('../lib/r30-qianqing-passage-retention.mjs');
  for (const restore of [r32.restorePreR32Capture, r31.restorePreR31SurfaceCapture, r30.restorePreR30Capture]) {
    assert.deepEqual(restore(current), restore(historical));
  }
  for (const kind of ['rows', 'meshes', 'graph', 'materials']) assert.deepEqual(r32.restoreR32SceneRowsIfPresent(kind, current[kind]), r32.restoreR32SceneRowsIfPresent(kind, historical[kind]));
  assert.deepEqual(r30.restorePreR30Navigation(current.navigation), r30.restorePreR30Navigation(historical.navigation));
  assert.equal(hash(current), original, 'current capture is never mutated');
});

test('unknown complete captures fail closed for changed and retained geometry, budget, material, metadata, navigation and runtime fields', () => {
  for (const mutate of [c => {c.meshes[0].geometrySHA256 = 'unknown';}, c => {c.meshes[167].geometrySHA256 = 'unknown';},
    c => {c.geometryBytes++;}, c => {c.uniqueMaterials++;}, c => {c.uniqueTextures++;},
    c => {c.graph[0].matrix[13] += .01;}, c => {c.materials[0][1][0].roughness += .01;},
    c => {c.navigation.colliders[0].min.x += .01;}, c => {c.navigation.walkables.pop();},
    c => {c.meshes.reverse();}, c => {c.graph.push(c.graph.at(-1));},
    c => {c.extra = undefined;}, c => {c.meshes.extra = 1;}, c => {c.graph[0].matrix[1] = -0;}]) {
    const bad = structuredClone(current); mutate(bad);
    assert.throws(() => restorePreR33Capture(bad), /exact R33/);
    assert.equal(restoreR33CaptureIfPresent(bad), bad, 'unknown identity receives no restoration');
  }
  for (const source of [current, historical]) {
    const bad = {...source, unregistered: undefined};
    assert.throws(() => restorePreR33Capture(bad), /exact R33/);
    assert.equal(restoreR33CaptureIfPresent(bad), bad);
  }
});

test('scene parts and ordered navigation reject omitted, duplicated, reordered, partial and extra values', () => {
  for (const kind of ['meshes', 'graph', 'materials']) {
    for (const mutate of [rows => rows.slice(1), rows => [...rows, rows.at(-1)], rows => rows.toReversed(), rows => {rows.extra = undefined; return rows;}]) {
      const bad = mutate(structuredClone(current[kind]));
      assert.throws(() => restorePreR33ScenePart(kind, bad), /exact R33/);
      assert.equal(restoreR33ScenePartIfPresent(kind, bad), bad);
    }
  }
  for (const kind of ['colliders', 'walkables']) {
    for (const mutate of [rows => rows.slice(1), rows => [...rows, rows.at(-1)], rows => rows.toReversed()]) {
      const bad = structuredClone(current.navigation); bad[kind] = mutate(bad[kind]);
      assert.throws(() => restorePreR33Navigation(bad), /exact R33/);
      assert.equal(restoreR33NavigationIfPresent(bad), bad);
    }
  }
  const partial = structuredClone(current); partial.geometryBytes = historical.geometryBytes;
  assert.throws(() => restorePreR33Capture(partial), /exact R33/);
  assert.equal(restoreR33CaptureIfPresent(partial), partial);
  const badRow = {...current.rows['后三宫'], triangles: current.rows['后三宫'].triangles + 1};
  assert.equal(restoreR33SceneRowIfPresent('后三宫', badRow), badRow);
  assert.equal(restoreR33SceneRowIfPresent('__proto__', badRow), badRow);
  assert.throws(() => restorePreR33ScenePart('__proto__', current.rows), /registered R33 scene part/);
});
