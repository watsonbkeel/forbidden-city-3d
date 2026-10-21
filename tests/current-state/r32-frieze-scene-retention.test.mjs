import {restoreR33CaptureIfPresent} from '../lib/r33-scene-retention.mjs';
import {historicalR32ModuleURL} from '../lib/historical-r32-scene-dependencies.mjs';
import test from 'node:test';
import {restoreR32CrestCaptureIfPresent, restoreR32CrestCentralLevelIfPresent} from '../lib/r32-crest-scene-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';

const root = new URL('../../', import.meta.url);
const helper = new URL('../lib/r32-frieze-scene-retention.mjs', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hash = value => sha(JSON.stringify(value));
const read = path => fs.readFileSync(new URL(path, root));
const fixturePath = 'tests/fixtures/r32-frieze-scene-delta.json';
const fixture = JSON.parse(read(fixturePath));
async function load() {
  assert.ok(fs.existsSync(helper), 'exact frieze metadata scene helper is required');
  return import(helper);
}

registerHooks({load(url, context, next) {
  if (url.endsWith('.json')) return {format: 'module', source: 'export default ' + fs.readFileSync(new URL(url), 'utf8'), shortCircuit: true};
  return next(url, context);
}});

// Execute independently stored 898b4e6 source bytes. Do not derive expected material state
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
const withoutUV = rows => rows.map(row => {const copy = structuredClone(row); delete copy.attributes.uv; return copy;});
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
    // Exact later crest identity is reversed only for this frozen historical contract.
    return {T, current, old, currentLevels: Object.fromEntries(Object.entries(levels(current)).map(([kind, rows]) => [kind, restoreR32CrestCentralLevelIfPresent(kind, rows)])), oldLevels: levels(old.central),
      capture: restoreR32CrestCaptureIfPresent(restoreR33CaptureIfPresent(captureJiaotaiScene(PalaceBuilder))), oldCapture: captureJiaotaiScene(old.Builder)};
  })();
  return builds;
}

test('immutable frieze metadata registry binds exact d5e1ef0 to independent 898b4e6 capture', async () => {
  const {r32FriezeScene: registry, validateR32FriezeSceneRegistry: validate} = await load();
  assert.deepEqual(registry, fixture);
  assert.equal(registry.baseline, '898b4e6ac29150ab898521cc0112dc638202a393');
  assert.equal(registry.candidate, 'd5e1ef0454185d69a29fdb0804ff8753189657a0');
  const source = JSON.parse(read('tests/fixtures/r32-frieze-source-delta.json'));
  for (const [name, row] of Object.entries(registry.baselineSources)) {
    assert.equal(sha(Buffer.from(row.utf8)), row.sha256);
    if (source.files[name]) assert.equal(row.sha256, source.files[name].baselineSHA256);
  }
  const screen = JSON.parse(read('tests/fixtures/r32-screen-scene-delta.json'));
  assert.equal(registry.capture.beforeSHA256, screen.screen.capture.afterSHA256);
  assert.deepEqual(registry.capture.changes.map(row => row.path), [
    ['meshes', '167', 'materialSHA256'], ['meshes', '168', 'materialSHA256'],
    ...['39', '40'].flatMap(index => ['friezePaintStatus', 'friezePaintState', 'friezePaintSource']
      .map(key => ['materials', '6', '1', index, 'userData', key]))
  ]);
  assert.deepEqual(registry.parts.rows.changes, []); assert.deepEqual(registry.parts.graph.changes, []);
  assert.ok(Object.isFrozen(registry.capture.changes[0]));
  for (const mutate of [r => {r.capture.afterSHA256 = '0'.repeat(64);}, r => {r.capture.changes.pop();},
    r => {r.central.near.sha256 = '0'.repeat(64);}, r => {Object.values(r.baselineSources)[0].utf8 += '\n';}]) {
    const bad = structuredClone(fixture); mutate(bad);
    assert.throws(() => validate(Buffer.from(JSON.stringify(bad, null, 2) + '\n')), /immutable R32 frieze scene registry/);
  }
  for (const bad of [Buffer.alloc(0), Buffer.concat([read(fixturePath), Buffer.from('\n')])]) {
    assert.throws(() => validate(bad), /immutable R32 frieze scene registry/);
  }
});

for (const kind of ['near', 'far']) test(`${kind} complete geometry including UVs remains byte-identical to independent 898b4e6`, async () => {
  const {assertR32FriezeCentralLevel: check} = await load(), s = await scenes();
  const before = s.oldLevels[kind], current = s.currentLevels[kind], delta = fixture.central[kind];
  assert.deepEqual(current, before);
  assert.equal(hash(current), delta.sha256); assert.equal(current.length, delta.count);
  assert.equal(check(kind, current), current);
  const corrupt = encoded => {const bytes = Buffer.from(encoded, 'base64'); bytes[0] ^= 1; return bytes.toString('base64');};
  for (const attribute of ['uv', 'position', 'normal']) {
    const bad = structuredClone(current); bad[0].attributes[attribute].bytes = corrupt(bad[0].attributes[attribute].bytes);
    assert.throws(() => check(kind, bad), /exact R32 frieze unchanged central/);
  }
  for (const mutate of [rows => {rows[0].matrix[13] += .001;}, rows => {rows[0].index.bytes = corrupt(rows[0].index.bytes);},
    rows => {rows.pop();}, rows => {rows.push(rows[0]);}, rows => {rows.reverse();}, rows => {rows.unregistered = 1;}]) {
    const bad = structuredClone(current); mutate(bad);
    assert.throws(() => check(kind, bad), /exact R32 frieze unchanged central/);
  }
});

test('actual frieze capture restores only metadata; all older exact scene entry points remain connected', async () => {
  const h = await load(), s = await scenes();
  assert.equal(hash(s.capture), fixture.capture.afterSHA256);
  assert.equal(hash(s.oldCapture), fixture.capture.beforeSHA256);
  assert.deepEqual(h.restorePreR32FriezeCapture(s.capture), s.oldCapture);
  assert.equal(h.restorePreR32FriezeCapture(s.oldCapture), s.oldCapture);
  for (const key of ['rows', 'graph', 'navigation', 'geometryBytes', 'uniqueMaterials', 'uniqueTextures']) {
    assert.deepEqual(s.capture[key], s.oldCapture[key], 'unchanged ' + key);
  }
  assert.deepEqual(s.capture.meshes.map(({materialSHA256, ...row}) => row), s.oldCapture.meshes.map(({materialSHA256, ...row}) => row));
  const materialCopy = structuredClone(s.capture.materials);
  for (const index of [39, 40]) for (const key of ['friezePaintStatus', 'friezePaintState', 'friezePaintSource']) delete materialCopy[6][1][index].userData[key];
  assert.deepEqual(materialCopy, s.oldCapture.materials, 'every material parameter and prior metadata field stays identical');
  assert.equal(hash(s.capture.navigation), fixture.unchanged.navigationSHA256);
  for (const module of [s.current, s.old.central]) {
    const boxes = []; module.registerQianqingCentral({col: (...args) => boxes.push(args)}, new s.T.Group(), fixture.frame);
    assert.deepEqual(boxes, fixture.centralNavigation);
  }
  const prior = await import('../lib/r32-scene-retention.mjs');
  assert.deepEqual(prior.restorePreR32Capture(s.capture), prior.restorePreR32Capture(s.oldCapture));
  assert.deepEqual(prior.restorePreR32Capture(JSON.parse(JSON.stringify(s.capture))), prior.restorePreR32Capture(s.capture));
  for (const kind of ['rows', 'meshes', 'graph', 'materials']) {
    assert.deepEqual(h.restoreR32FriezeScenePartIfPresent(kind, s.capture[kind]), s.oldCapture[kind]);
    assert.deepEqual(prior.restoreR32SceneRowsIfPresent(kind, s.capture[kind]), prior.restoreR32SceneRowsIfPresent(kind, s.oldCapture[kind]));
  }
});

test('frieze metadata binding rejects geometry, material, budget, collision, partial and runtime mutations', async () => {
  const h = await load(), s = await scenes();
  for (const mutate of [value => {value.geometryBytes++;}, value => {value.navigation.colliders[0].min.x += .01;},
    value => {value.meshes[167].geometrySHA256 = 'unknown UV';}, value => {value.graph[201].matrix[13] += .01;},
    value => {value.materials[6][1][39].roughness += .01;}, value => {value.extra = undefined;},
    value => {value.meshes.unregistered = 1;}, value => {value.graph[0].matrix[1] = -0;}]) {
    const bad = structuredClone(s.capture); mutate(bad);
    assert.throws(() => h.restorePreR32FriezeCapture(bad), /exact R32 frieze/);
    assert.equal(h.restoreR32FriezeCaptureIfPresent(bad), bad);
  }
  for (const change of fixture.capture.changes) {
    const partial = structuredClone(s.capture); let target = partial;
    for (const key of change.path.slice(0, -1)) target = target[key];
    const key = change.path.at(-1);
    if (change.beforeAbsent) delete target[key]; else target[key] = structuredClone(change.before);
    assert.throws(() => h.restorePreR32FriezeCapture(partial), /exact R32 frieze/);
    const altered = structuredClone(s.capture); let row = altered;
    for (const k of change.path.slice(0, -1)) row = row[k]; row[key] = 'unregistered';
    assert.throws(() => h.restorePreR32FriezeCapture(altered), /exact R32 frieze/);
  }
  for (const kind of ['rows', 'meshes', 'graph', 'materials']) {
    const bad = structuredClone(s.capture[kind]); bad.unregistered = undefined;
    assert.equal(h.restoreR32FriezeScenePartIfPresent(kind, bad), bad);
  }
});

