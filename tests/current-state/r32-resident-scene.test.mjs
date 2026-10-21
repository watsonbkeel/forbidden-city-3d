import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';

registerHooks({load(url, context, next) {
  if (url.endsWith('.json')) return {format: 'module', source: 'export default ' + fs.readFileSync(new URL(url), 'utf8'), shortCircuit: true};
  return next(url, context);
}});
const {PalaceBuilder} = await import('../../src/scene/PalaceBuilder.js');
const {captureJiaotaiScene} = await import('../lib/r27-jiaotai-capture.mjs');
const {restoreR32ArtworkCaptureIfPresent} = await import('../lib/r32-screen-scene-retention.mjs');
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
// This historical contract first binds/reverses the exact later artwork bytes.
// R33 is first bound and reversed by the exact R33 scene layer. The live a9 capture and independently rebuilt afb UVs are checked separately
// by r32-screen-scene-retention; no current behavior uses this test adapter.
const current = restoreR32ArtworkCaptureIfPresent(captureJiaotaiScene(PalaceBuilder));
const helper = new URL('../lib/r32-scene-retention.mjs', import.meta.url);
const getHelper = async () => {
  assert.ok(fs.existsSync(helper), 'strict R32 historical scene adapter is required');
  return import(helper);
};

// The frozen R32 resident contract includes both LOD levels and excludes
// streamed zones and optional GLBs; it is not a full-world budget.
test('historical R32 resident scene binds every captured byte and its retained resident cost', async () => {
  const {r32Scene: delta} = await getHelper();
  assert.equal(hash(current), '837008a062244fb9faad2e9bb5b2ae5963c0a4287a1bf305169e5df40706de37');
  assert.equal(hash(current), delta.afterCaptureSHA256);
  assert.deepEqual({triangles: Object.values(current.rows).reduce((n, row) => n + row.triangles, 0), meshes: current.meshes.length,
    geometryBytes: current.geometryBytes, materials: current.uniqueMaterials, textures: current.uniqueTextures,
    colliders: current.navigation.colliders.length, walkables: current.navigation.walkables.length},
  {triangles: 208177, meshes: 178, geometryBytes: 20216972, materials: 93, textures: 25, colliders: 2827, walkables: 230});
  assert.equal(current.rows['金水河'].triangles, 13700);
  assert.equal(current.rows['后三宫'].triangles, 59296);
  assert.equal(Object.hasOwn(current.rows, ''), false);
  assert.equal(Object.values(current.rows).reduce((n, row) => n + row.meshes, 0), current.meshes.length);
  assert.equal(current.graph.filter(node => node.type === 'Mesh').length, current.meshes.length);
  for (const [name, costs] of [['qianqing-permanent-display', [2912, 664]], ['qianqing-panelled-ceiling-r32', [446, 2]]]) {
    const lod = current.graph.find(node => node.name === name);
    assert.equal(lod.type, 'LOD');
    assert.deepEqual(lod.levels.map(level => [level.distance, level.hysteresis]), [[0, 0], [90, .1]]);
    assert.deepEqual(lod.levels.map(level => current.graph.find(node => node.path === level.object).visible), [true, false]);
    assert.deepEqual(lod.levels.map(level => current.graph.filter(node => node.type === 'Mesh' && node.path.startsWith(level.object + '.')).reduce((n, node) => n + node.triangles, 0)), costs);
  }
});

test('new distance-detail graph binds both levels, exact transforms, ordered children and visibility', async () => {
  const {restorePreR32SceneList, restoreR32SceneRowsIfPresent} = await getHelper();
  for (const name of ['qianqing-permanent-display', 'qianqing-panelled-ceiling-r32']) {
    const index = current.graph.findIndex(node => node.name === name);
    const farIndex = current.graph.findIndex(node => node.path === current.graph[index].levels[1].object);
    for (const mutate of [
      rows => {rows[index].levels[1].distance += .001;},
      rows => {rows[index].levels[1].hysteresis += .001;},
      rows => {rows[index].matrixWorld[13] += .001;},
      rows => {rows[index].children.reverse();},
      rows => {rows[index].levels.reverse();},
      rows => {rows[farIndex].visible = true;}
    ]) {
      const bad = structuredClone(current.graph); mutate(bad);
      assert.throws(() => restorePreR32SceneList('graph', bad), /exact R32/);
      assert.equal(restoreR32SceneRowsIfPresent('graph', bad), bad);
    }
  }
});

test('historical R32 ordered navigation retains every frozen collider and walking surface', async () => {
  const {r32Scene: delta} = await getHelper();
  assert.equal(hash(current.navigation), '0abd676091d1fc28e7392565a41782326ff04ab679ec1c395356e5efe49ce68b');
  assert.equal(hash(current.navigation), delta.navigation.afterSHA256);
  for (const kind of ['colliders', 'walkables']) {
    assert.equal(hash(current.navigation[kind]), delta.navigation[kind].afterSHA256);
    assert.equal(current.navigation[kind].length, delta.navigation[kind].afterCount);
  }
  for (const collider of current.navigation.colliders) for (const axis of ['x', 'y', 'z']) {
    assert.ok(Number.isFinite(collider.min[axis]) && Number.isFinite(collider.max[axis]));
    assert.ok(collider.min[axis] <= collider.max[axis]);
  }
  for (const surface of current.navigation.walkables) assert.ok(['box', 'ramp'].includes(surface.type));
});

test('immutable R32 scene registry binds exact R31 and R32 capture identities and cannot be edited in memory', async () => {
  const {r32Scene: delta, validateR32SceneRegistry} = await getHelper();
  const bytes = fs.readFileSync(new URL('../fixtures/r32-scene-delta.json', import.meta.url));
  assert.deepEqual(validateR32SceneRegistry(bytes), delta);
  assert.equal(delta.baseline, 'c02ee53be5b0d6c6ced0837f7b76eabc008a7cd2');
  assert.equal(delta.beforeCaptureSHA256, '659b7c98d423bc28ece6ed97e6e81fb45d35f7fc523b686206451c3a1d7aa5a9');
  assert.ok(Object.isFrozen(delta));
  assert.ok(Object.isFrozen(delta.navigation.colliders.changes[0].after));
  for (const bad of [Buffer.alloc(0), Buffer.concat([bytes, Buffer.from('\n')])]) {
    assert.throws(() => validateR32SceneRegistry(bad), /immutable R32 scene registry/);
  }
  for (const mutate of [
    d => {d.beforeCaptureSHA256 = '0'.repeat(64);},
    d => {d.afterCaptureSHA256 = '0'.repeat(64);},
    d => {d.meshes.changes.pop();},
    d => {d.graph.changes[0].after.reverse();},
    d => {d.navigation.colliders.changes[0].after.pop();},
    d => {d.geometryBytes.after++;}
  ]) {
    const bad = structuredClone(delta); mutate(bad);
    assert.throws(() => validateR32SceneRegistry(Buffer.from(JSON.stringify(bad, null, 2) + '\n')), /immutable R32 scene registry/);
  }
});

test('only the exact complete R32 capture restores the complete frozen R31 capture and all earlier entrypoints', async () => {
  const {r32Scene: delta, restorePreR32Capture, restoreR32CaptureIfPresent, restorePreR32SceneRows, restorePreR32SceneList, restorePreR32Navigation} = await getHelper();
  const historical = restorePreR32Capture(current);
  assert.equal(hash(historical), delta.beforeCaptureSHA256);
  assert.equal(hash(current), delta.afterCaptureSHA256, 'restoration cannot mutate the product capture');
  assert.equal(restorePreR32Capture(historical), historical);
  assert.equal(restoreR32CaptureIfPresent(historical), historical);
  assert.deepEqual(restoreR32CaptureIfPresent(current), historical);
  assert.deepEqual(restorePreR32SceneRows(current.rows), historical.rows);
  for (const kind of ['meshes', 'graph', 'materials']) assert.deepEqual(restorePreR32SceneList(kind, current[kind]), historical[kind]);
  assert.deepEqual(restorePreR32Navigation(current.navigation), historical.navigation);
  const prior = await import('../lib/r31-qianqing-surface-retention.mjs');
  const r30 = await import('../lib/r30-qianqing-passage-retention.mjs');
  assert.deepEqual(prior.restorePreR31SurfaceCapture(current), prior.restorePreR31SurfaceCapture(historical));
  assert.deepEqual(prior.restoreR31SurfaceCaptureIfPresent(current), prior.restoreR31SurfaceCaptureIfPresent(historical));
  for (const kind of ['rows', 'meshes', 'graph', 'materials']) {
    assert.deepEqual(prior.restoreR31SurfaceRowsIfPresent(kind, current[kind]), prior.restoreR31SurfaceRowsIfPresent(kind, historical[kind]));
  }
  for (const [name, row] of Object.entries(current.rows)) {
    assert.deepEqual(prior.restoreR31SurfaceRowIfPresent(name, row), prior.restoreR31SurfaceRowIfPresent(name, historical.rows[name]));
  }
  assert.deepEqual(r30.restorePreR30Navigation(current.navigation), r30.restorePreR30Navigation(historical.navigation));
  assert.deepEqual(r30.restorePreR30Capture(current), r30.restorePreR30Capture(historical));
});

test('ordered rows, mesh bytes, graph transforms and material values reject omissions, duplicates, reorders and partial restoration', async () => {
  const {r32Scene: delta, restorePreR32SceneRows, restorePreR32SceneList, restoreR32SceneRowsIfPresent} = await getHelper();
  for (const kind of ['rows', 'meshes', 'graph', 'materials']) {
    const entries = kind === 'rows' ? Object.entries(current.rows) : current[kind];
    const restore = value => kind === 'rows' ? restorePreR32SceneRows(value) : restorePreR32SceneList(kind, value);
    const d = delta[kind], inputs = [];
    for (const index of [0, Math.floor(entries.length / 2), entries.length - 1]) {
      const omitted = structuredClone(entries); omitted.splice(index, 1); inputs.push(omitted);
      if (kind !== 'rows') {const duplicate = structuredClone(entries); duplicate.splice(index, 0, duplicate[index]); inputs.push(duplicate);}
      const changed = structuredClone(entries);
      if (kind === 'rows') changed[index][1].triangles++;
      else if (kind === 'materials') changed[index][1][0].roughness += .01;
      else changed[index].matrix[13] += .001;
      inputs.push(changed);
    }
    inputs.push(structuredClone(entries).reverse());
    for (const splice of d.changes) {
      const partial = structuredClone(entries); partial.splice(splice.afterIndex, splice.after.length, ...structuredClone(splice.before));
      if (hash(kind === 'rows' ? Object.fromEntries(partial) : partial) !== d.beforeSHA256) inputs.push(partial);
    }
    for (const entries of inputs) {
      const bad = kind === 'rows' ? Object.fromEntries(entries) : entries;
      assert.throws(() => restore(bad), /exact R32/);
      assert.equal(restoreR32SceneRowsIfPresent(kind, bad), bad, 'unknown values must reach older guards unchanged');
    }
  }
});

test('both complete capture identities reject unregistered costs, topology, fields and geometry/material identities', async () => {
  const {restorePreR32Capture, restoreR32CaptureIfPresent} = await getHelper();
  for (const source of [current, restorePreR32Capture(current)]) {
    const mutations = [];
    for (const key of ['geometryBytes', 'uniqueMaterials', 'uniqueTextures']) mutations.push({...source, [key]: source[key] + 1});
    for (const key of ['geometrySHA256', 'materialSHA256', 'name', 'group']) {
      const bad = structuredClone(source); bad.meshes[0][key] = 'unregistered'; mutations.push(bad);
    }
    const extra = structuredClone(source); extra.unregistered = true; mutations.push(extra);
    const missing = structuredClone(source); delete missing.graph; mutations.push(missing);
    for (const bad of mutations) {
      assert.throws(() => restorePreR32Capture(bad), /exact R32 complete capture/);
      assert.equal(restoreR32CaptureIfPresent(bad), bad);
    }
  }
});

test('registered JSON runtime exceptions retain exact R31 values and never allow arbitrary omitted fields or negative zero', async () => {
  const {r32Scene: delta, restorePreR32Capture, restorePreR32SceneList, restoreR32CaptureIfPresent, restoreR32SceneRowsIfPresent, restorePreR32Navigation, restoreR32NavigationIfPresent} = await getHelper();
  const serialized = JSON.parse(JSON.stringify(current));
  assert.deepEqual(restorePreR32Capture(serialized), restorePreR32Capture(current));
  const historical = restorePreR32Capture(current);
  for (const {path, type} of delta.graph.runtimeValues.before) {
    const value = path.reduce((value, key) => value[key], historical.graph);
    assert.ok(type === 'undefined' ? value === undefined : Object.is(value, -0));
  }
  assert.ok(Object.is(historical.meshes[30].matrix[2], -0));
  for (const kind of ['graph', 'meshes', 'materials']) {
    const bad = structuredClone(current[kind]); bad[0].unregistered = undefined;
    assert.throws(() => restorePreR32SceneList(kind, bad), /exact R32 .* runtime representation/);
    assert.equal(restoreR32SceneRowsIfPresent(kind, bad), bad);
  }
  const bad = structuredClone(current.graph); bad[0].matrix[1] = -0;
  assert.throws(() => restorePreR32SceneList('graph', bad), /exact R32 .* runtime representation/);
  for (const source of [current, historical]) {
    const extra = {...source, unregistered: undefined};
    assert.throws(() => restorePreR32Capture(extra), /exact R32 complete capture runtime representation/);
    assert.equal(restoreR32CaptureIfPresent(extra), extra);
    const navigation = {...source.navigation, unregistered: undefined};
    assert.throws(() => restorePreR32Navigation(navigation), /exact R32 ordered navigation runtime representation/);
    assert.equal(restoreR32NavigationIfPresent(navigation), navigation);
  }
});

test('unknown ordered collisions and walking surfaces never receive historical restoration, including at the R30 bridge', async () => {
  const {r32Scene: delta, restorePreR32Navigation, restoreR32NavigationIfPresent, restorePreR32Capture} = await getHelper();
  const {restorePreR30Navigation} = await import('../lib/r30-qianqing-passage-retention.mjs');
  for (const source of [current.navigation, restorePreR32Navigation(current.navigation)]) for (const kind of ['colliders', 'walkables']) {
    const mutations = [];
    for (const index of [0, Math.floor(source[kind].length / 2), source[kind].length - 1]) {
      const missing = structuredClone(source); missing[kind].splice(index, 1); mutations.push(missing);
      const duplicate = structuredClone(source); duplicate[kind].splice(index, 0, duplicate[kind][index]); mutations.push(duplicate);
      const changed = structuredClone(source); changed[kind][index].unregistered = true; mutations.push(changed);
      const shifted = structuredClone(source), row = shifted[kind][index];
      if (row.min) row.min.x += .001; else if (row.box) row.box.min.x += .001; else row.minX += .001;
      mutations.push(shifted);
    }
    const reordered = structuredClone(source); reordered[kind].reverse(); mutations.push(reordered);
    const extra = structuredClone(source); extra.unregistered = []; mutations.push(extra);
    for (const bad of mutations) {
      assert.throws(() => restorePreR32Navigation(bad), /exact R32 ordered navigation/);
      assert.equal(restoreR32NavigationIfPresent(bad), bad);
      assert.throws(() => restorePreR30Navigation(bad), /exact R30 complete ordered navigation/);
      assert.throws(() => restorePreR32Capture({...current, navigation: bad}), /exact R32 complete capture/);
    }
  }
  for (const kind of ['colliders', 'walkables']) for (const splice of delta.navigation[kind].changes) {
    const partial = structuredClone(current.navigation);
    partial[kind].splice(splice.afterIndex, splice.after.length, ...structuredClone(splice.before));
    if (hash(partial) !== delta.navigation.beforeSHA256) assert.throws(() => restorePreR32Navigation(partial), /exact R32 ordered navigation/);
  }
});
