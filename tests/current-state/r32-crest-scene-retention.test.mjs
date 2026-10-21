import {restoreR33CaptureIfPresent} from '../lib/r33-scene-retention.mjs';
import {historicalR32ModuleURL} from '../lib/historical-r32-scene-dependencies.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';

const root = new URL('../../', import.meta.url);
const helper = new URL('../lib/r32-crest-scene-retention.mjs', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hash = value => sha(JSON.stringify(value));
const read = path => fs.readFileSync(new URL(path, root));
const fixturePath = 'tests/fixtures/r32-crest-scene-delta.json';
const fixture = JSON.parse(read(fixturePath));
async function load() {
  assert.ok(fs.existsSync(helper), 'exact crest geometry scene helper is required');
  return import(helper);
}

registerHooks({load(url, context, next) {
  if (url.endsWith('.json')) return {format: 'module', source: 'export default ' + fs.readFileSync(new URL(url), 'utf8'), shortCircuit: true};
  return next(url, context);
}});

// Execute independently stored 8ba57d6 source bytes. Do not derive expected crest geometry
// with the adapter under test, patch the current mapper, or reset attributes.
async function historicalModules() {
  const sources = {...fixture.baselineSources};
  const moduleURL = path => historicalR32ModuleURL(path, sources);
  return {central: await import(moduleURL('src/scene/palace/QianqingCentralSetting.js')),
    Builder: (await import(moduleURL('src/scene/PalaceBuilder.js'))).PalaceBuilder};
}

function captureLevel(root) {
  return root.children.map(object => ({name: object.name, matrix: (object.updateMatrix(), object.matrix.toArray()),
    attributes: Object.fromEntries(Object.entries(object.geometry.attributes).map(([key, a]) => [key, {
      itemSize: a.itemSize, normalized: a.normalized, type: a.array.constructor.name,
      bytes: Buffer.from(a.array.buffer, a.array.byteOffset, a.array.byteLength).toString('base64')
    }])), index: object.geometry.index ? {type: object.geometry.index.array.constructor.name,
      bytes: Buffer.from(object.geometry.index.array.buffer, object.geometry.index.array.byteOffset, object.geometry.index.array.byteLength).toString('base64')} : null,
    groups: object.geometry.groups, drawRange: {start: object.geometry.drawRange.start, count: String(object.geometry.drawRange.count)}}));
}
let builds;
async function scenes() {
  await load();
  if (!builds) builds = (async () => {
    const T = await import('three');
    const {captureJiaotaiScene} = await import('../lib/r27-jiaotai-capture.mjs');
    const {PalaceBuilder} = await import('../../src/scene/PalaceBuilder.js');
    const current = await import('../../src/scene/palace/QianqingCentralSetting.js');
    const old = await historicalModules();
    const levels = module => Object.fromEntries([['near', true], ['far', false]].map(([kind, fine]) =>
      [kind, captureLevel(module.buildQianqingCentralLevel(new T.MeshBasicMaterial(), fixture.frame, fine))]));
    return {T, current, old, currentLevels: levels(current), oldLevels: levels(old.central),
      capture: restoreR33CaptureIfPresent(captureJiaotaiScene(PalaceBuilder)), oldCapture: captureJiaotaiScene(old.Builder)};
  })();
  return builds;
}

const totalTriangles = rows => rows.reduce((n, row) => n + (row.index ? Buffer.from(row.index.bytes, 'base64').length / ({Uint16Array:2, Uint32Array:4}[row.index.type]) : Buffer.from(row.attributes.position.bytes, 'base64').length / 4 / 3) / 3, 0);
const costs = capture => ({triangles: Object.values(capture.rows).reduce((n, row) => n + row.triangles, 0),
  geometryBytes: capture.geometryBytes, uniqueMaterials: capture.uniqueMaterials, uniqueTextures: capture.uniqueTextures,
  meshes: capture.meshes.length, graphNodes: capture.graph.length, colliders: capture.navigation.colliders.length, walkables: capture.navigation.walkables.length});
const corrupt = encoded => {const bytes = Buffer.from(encoded, 'base64'); bytes[0] ^= 1; return bytes.toString('base64');};

test('immutable crest registry binds exact f7f65fd geometry to independently rebuilt 8ba57d6', async () => {
  const {r32CrestScene: registry, validateR32CrestSceneRegistry: validate} = await load();
  assert.deepEqual(registry, fixture);
  assert.equal(registry.baseline, '8ba57d6d41919fc345e4baf8f3af2adcadb314c5');
  assert.equal(registry.candidate, 'f7f65fd1b5d4a69551f24e0c3057664c8042d0c2');
  assert.equal(sha(read('tests/fixtures/r32-qianqing-crest-baseline.json')), registry.geometryProofSHA256);
  const source = JSON.parse(read('tests/fixtures/r32-crest-source-delta.json'));
  for (const [name, row] of Object.entries(registry.baselineSources)) {
    assert.equal(sha(Buffer.from(row.utf8)), row.sha256);
    if (source.files[name]) assert.equal(row.sha256, source.files[name].baselineSHA256);
  }
  const frieze = JSON.parse(read('tests/fixtures/r32-frieze-scene-delta.json'));
  assert.equal(registry.capture.beforeSHA256, frieze.capture.afterSHA256);
  assert.deepEqual(registry.capture.changes.map(row => row.path), [
    ['rows', '后三宫', 'triangles'], ['rows', '后三宫', 'hash'], ['meshes', '167', 'geometrySHA256'],
    ['geometryBytes'], ['graph', '189', 'triangles']
  ]);
  assert.deepEqual(registry.crestIndices, [18, 22, 26, 30, 34]);
  assert.deepEqual(registry.central.near.changes.map(row => row.path), registry.crestIndices.flatMap(index =>
    ['position', 'uv', 'normal'].map(key => [String(index), 'attributes', key, 'bytes'])));
  assert.deepEqual(registry.central.far.changes, []); assert.deepEqual(registry.parts.materials.changes, []);
  assert.ok(Object.isFrozen(registry.central.near.changes[0]));
  for (const mutate of [r => {r.capture.afterSHA256 = '0'.repeat(64);}, r => {r.capture.changes.pop();},
    r => {r.central.near.changes[0].before += 'AA';}, r => {r.costs.after.geometryBytes++;},
    r => {Object.values(r.baselineSources)[0].utf8 += '\n';}, r => {r.crestIndices.push(17);}]) {
    const bad = structuredClone(fixture); mutate(bad);
    assert.throws(() => validate(Buffer.from(JSON.stringify(bad, null, 2) + '\n')), /immutable R32 crest scene registry/);
  }
  for (const bad of [Buffer.alloc(0), Buffer.concat([read(fixturePath), Buffer.from('\n')])]) {
    assert.throws(() => validate(bad), /immutable R32 crest scene registry/);
  }
});

for (const kind of ['near', 'far']) test(`${kind} exact crest geometry reverses only five registered crowns; all other bytes remain identical`, async () => {
  const h = await load(), s = await scenes(), before = s.oldLevels[kind], after = s.currentLevels[kind];
  const d = fixture.central[kind];
  assert.equal(before.length, d.count); assert.equal(after.length, d.count);
  assert.equal(hash(before), d.beforeSHA256); assert.equal(hash(after), d.afterSHA256);
  assert.deepEqual(h.restorePreR32CrestCentralLevel(kind, after), before);
  assert.equal(h.restorePreR32CrestCentralLevel(kind, before), before);
  const indices = kind === 'near' ? fixture.crestIndices : [];
  for (let i = 0; i < before.length; i++) {
    if (!indices.includes(i)) assert.deepEqual(after[i], before[i], 'unchanged full object ' + i);
    else {
      assert.equal(after[i].name, 'qianqing-open-carved-crest-' + indices.indexOf(i));
      const {attributes: ba, ...br} = before[i], {attributes: aa, ...ar} = after[i];
      assert.deepEqual(ar, br, 'crest transforms/topology metadata stay unchanged');
      assert.deepEqual(Object.keys(aa), Object.keys(ba));
      for (const key of Object.keys(aa)) {
        const {bytes: ab, ...am} = aa[key], {bytes: bb, ...bm} = ba[key];
        assert.deepEqual(am, bm); assert.notEqual(ab, bb);
      }
    }
  }
  assert.equal(totalTriangles(before), kind === 'near' ? 2048 : 268);
  assert.equal(totalTriangles(after), kind === 'near' ? 3698 : 268);
  const proof = JSON.parse(read('tests/fixtures/r32-qianqing-crest-baseline.json'));
  const rows = before.map(row => ({name: row.name, matrix: row.matrix,
    attrs: Object.fromEntries(Object.entries(row.attributes).map(([key, a]) => [key, {size: a.itemSize,
      count: Buffer.from(a.bytes, 'base64').length / 4 / a.itemSize, sha256: sha(Buffer.from(a.bytes, 'base64'))}])),
    index: row.index ? sha(Buffer.from(row.index.bytes, 'base64')) : null}));
  assert.equal(JSON.stringify(rows), JSON.stringify(proof[kind]), 'independent rebuild reproduces original crest proof');
  for (const index of [0, ...indices]) for (const attribute of ['position', 'normal', 'uv']) {
    const bad = structuredClone(after), size = bad[index].attributes[attribute].bytes.length;
    bad[index].attributes[attribute].bytes = corrupt(bad[index].attributes[attribute].bytes);
    assert.equal(bad[index].attributes[attribute].bytes.length, size, 'mutation preserves byte/vertex count');
    assert.equal(totalTriangles(bad), totalTriangles(after));
    assert.throws(() => h.restorePreR32CrestCentralLevel(kind, bad), /exact R32 crest central/);
    assert.equal(h.restoreR32CrestCentralLevelIfPresent(kind, bad), bad);
  }
  for (const mutate of [rows => {rows[0].matrix[13] += .001;}, rows => {rows[0].index.bytes = corrupt(rows[0].index.bytes);},
    rows => {rows.pop();}, rows => {rows.push(rows[0]);}, rows => {rows.reverse();}, rows => {rows.unregistered = 1;}]) {
    const bad = structuredClone(after); mutate(bad);
    assert.throws(() => h.restorePreR32CrestCentralLevel(kind, bad), /exact R32 crest central/);
  }
  for (const change of d.changes) {
    const bad = structuredClone(after); bad[change.path[0]].attributes[change.path[2]].bytes = change.before;
    assert.throws(() => h.restorePreR32CrestCentralLevel(kind, bad), /exact R32 crest central/);
  }
});

test('actual same-count rebuilt crest from unknown source never acquires the frozen geometry exception', async () => {
  const h = await load(), s = await scenes();
  const path = 'src/scene/palace/QianqingScreenCrest.js', original = read(path).toString();
  assert.equal(original.split('height:.43').length, 2);
  const changed = original.replace('height:.43', 'height:.42');
  assert.equal(changed.length, original.length);
  const {assertR32CrestAddedSource} = await import('../lib/r32-crest-source-retention.mjs');
  assert.throws(() => assertR32CrestAddedSource(path, Buffer.from(changed)), /exact R32 crest added source/);
  function importURL(source, name) {
    const url = new URL(name, root);
    const code = source.replace(/^([ \t]*import\b[^;]*?\bfrom\s*)(['"])([^'"]+)\2/gm, (_, prefix, quote, specifier) =>
      prefix + JSON.stringify(specifier.startsWith('three') ? import.meta.resolve(specifier) : new URL(specifier, url).href));
    return 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
  }
  const alteredCrest = importURL(changed, path);
  const setting = 'src/scene/palace/QianqingCentralSetting.js';
  const source = read(setting).toString().replace("'./QianqingScreenCrest.js'", JSON.stringify(alteredCrest));
  const module = await import(importURL(source, setting));
  const bad = captureLevel(module.buildQianqingCentralLevel(new s.T.MeshBasicMaterial(), fixture.frame, true));
  assert.equal(bad.length, s.currentLevels.near.length);
  assert.equal(totalTriangles(bad), 3698);
  assert.notEqual(hash(bad), fixture.central.near.afterSHA256);
  assert.throws(() => h.restorePreR32CrestCentralLevel('near', bad), /exact R32 crest central/);
  assert.equal(h.restoreR32CrestCentralLevelIfPresent('near', bad), bad);
});

test('independent full crest capture binds exact total budget and byte-identical navigation through every old entry point', async () => {
  const h = await load(), s = await scenes();
  assert.equal(hash(s.capture), fixture.capture.afterSHA256); assert.equal(hash(s.oldCapture), fixture.capture.beforeSHA256);
  assert.deepEqual(h.restorePreR32CrestCapture(s.capture), s.oldCapture);
  assert.equal(h.restorePreR32CrestCapture(s.oldCapture), s.oldCapture);
  assert.deepEqual(costs(s.capture), fixture.costs.after); assert.deepEqual(costs(s.oldCapture), fixture.costs.before);
  assert.equal(fixture.costs.after.triangles - fixture.costs.before.triangles, 1650);
  assert.equal(fixture.costs.after.geometryBytes - fixture.costs.before.geometryBytes, 158400);
  assert.deepEqual(Buffer.from(JSON.stringify(s.capture.navigation)), Buffer.from(JSON.stringify(s.oldCapture.navigation)));
  assert.equal(hash(s.capture.navigation), fixture.navigationSHA256);
  assert.deepEqual(s.capture.materials, s.oldCapture.materials);
  for (const module of [s.current, s.old.central]) {
    const boxes = []; module.registerQianqingCentral({col: (...args) => boxes.push(args)}, new s.T.Group(), fixture.frame);
    assert.deepEqual(boxes, fixture.centralNavigation);
  }
  const prior = await import('../lib/r32-scene-retention.mjs');
  assert.deepEqual(prior.restorePreR32Capture(s.capture), prior.restorePreR32Capture(s.oldCapture));
  assert.deepEqual(prior.restorePreR32Capture(JSON.parse(JSON.stringify(s.capture))), prior.restorePreR32Capture(s.capture));
  for (const kind of ['rows', 'meshes', 'graph', 'materials']) {
    assert.deepEqual(h.restoreR32CrestScenePartIfPresent(kind, s.capture[kind]), s.oldCapture[kind]);
    assert.deepEqual(prior.restoreR32SceneRowsIfPresent(kind, s.capture[kind]), prior.restoreR32SceneRowsIfPresent(kind, s.oldCapture[kind]));
  }
  for (const [name, row] of Object.entries(s.capture.rows)) {
    assert.deepEqual(h.restoreR32CrestSceneRowIfPresent(name, row), s.oldCapture.rows[name]);
    assert.deepEqual(prior.restoreR32SceneRowIfPresent(name, row), prior.restoreR32SceneRowIfPresent(name, s.oldCapture.rows[name]));
  }
});

test('crest scene binding rejects unknown equal-count geometry, costs, collisions, partial restoration and runtime mutations', async () => {
  const h = await load(), s = await scenes();
  for (const mutate of [value => {value.meshes[167].geometrySHA256 = 'unknown same-count geometry';},
    value => {value.geometryBytes++;}, value => {value.navigation.colliders[0].min.x += .01;},
    value => {value.graph[189].matrix[13] += .01;}, value => {value.materials[6][1][39].roughness += .01;},
    value => {value.extra = undefined;}, value => {value.meshes.unregistered = 1;}, value => {value.graph[0].matrix[1] = -0;}]) {
    const bad = structuredClone(s.capture); mutate(bad);
    assert.equal(bad.meshes.length, s.capture.meshes.length); assert.equal(bad.graph.length, s.capture.graph.length);
    assert.throws(() => h.restorePreR32CrestCapture(bad), /exact R32 crest/);
    assert.equal(h.restoreR32CrestCaptureIfPresent(bad), bad);
  }
  for (const change of fixture.capture.changes) {
    const partial = structuredClone(s.capture); let target = partial;
    for (const key of change.path.slice(0, -1)) target = target[key];
    target[change.path.at(-1)] = structuredClone(change.before);
    assert.throws(() => h.restorePreR32CrestCapture(partial), /exact R32 crest/);
  }
  for (const kind of ['rows', 'meshes', 'graph', 'materials']) {
    const bad = structuredClone(s.capture[kind]); bad.unregistered = undefined;
    assert.equal(h.restoreR32CrestScenePartIfPresent(kind, bad), bad);
  }
  const row = structuredClone(s.capture.rows['后三宫']); row.hash = 'unknown same-count row';
  assert.equal(h.restoreR32CrestSceneRowIfPresent('后三宫', row), row);
  assert.equal(h.restoreR32CrestSceneRowIfPresent('unknown group', s.capture.rows['后三宫']), s.capture.rows['后三宫']);
  assert.equal(hash(s.capture), fixture.capture.afterSHA256, 'input capture never mutated');
});
