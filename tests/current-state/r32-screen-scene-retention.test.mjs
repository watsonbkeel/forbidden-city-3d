import {restoreR33CaptureIfPresent} from '../lib/r33-scene-retention.mjs';
import {historicalR32ModuleURL} from '../lib/historical-r32-scene-dependencies.mjs';
import test from 'node:test';
import {restoreR32CrestCaptureIfPresent, restoreR32CrestCentralLevelIfPresent} from '../lib/r32-crest-scene-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {restoreR32FriezeCaptureIfPresent} from '../lib/r32-frieze-scene-retention.mjs';

const root = new URL('../../', import.meta.url);
const helper = new URL('../lib/r32-screen-scene-retention.mjs', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hash = value => sha(JSON.stringify(value));
const read = path => fs.readFileSync(new URL(path, root));
const fixturePath = 'tests/fixtures/r32-screen-scene-delta.json';
const fixture = JSON.parse(read(fixturePath));
async function load() {
  assert.ok(fs.existsSync(helper), 'exact screen UV and metadata scene helper is required');
  return import(helper);
}

registerHooks({load(url, context, next) {
  if (url.endsWith('.json')) return {format: 'module', source: 'export default ' + fs.readFileSync(new URL(url), 'utf8'), shortCircuit: true};
  return next(url, context);
}});

// Execute independently stored afb source bytes. Do not derive expected UVs
// with the adapter under test, patch the current mapper, or reset attributes.
async function historicalModules(includeOldCeiling = false) {
  const sources = {...fixture.baselineSources};
  if (!includeOldCeiling) delete sources['src/scene/palace/QianqingCeiling.js'];
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
    const old = await historicalModules(), original = await historicalModules(true);
    const levels = module => Object.fromEntries([['near', true], ['far', false]].map(([kind, fine]) =>
      [kind, captureLevel(module.buildQianqingCentralLevel(new T.MeshBasicMaterial(), fixture.central.frame, fine))]));
    // Exact later crest identity is reversed only for this frozen historical contract.
    return {T, current, old, currentLevels: Object.fromEntries(Object.entries(levels(current)).map(([kind, rows]) => [kind, restoreR32CrestCentralLevelIfPresent(kind, rows)])), oldLevels: levels(old.central),
      // Preserve this frozen a9 contract after the independently bound final
      // frieze metadata is removed; the new test checks raw d5 product captures.
      capture: restoreR32FriezeCaptureIfPresent(restoreR32CrestCaptureIfPresent(restoreR33CaptureIfPresent(captureJiaotaiScene(PalaceBuilder)))), oldCapture: captureJiaotaiScene(old.Builder), originalCapture: captureJiaotaiScene(original.Builder)};
  })();
  return builds;
}

test('immutable screen registry preserves exact source provenance and separately bounded screen/ceiling epochs', async () => {
  const {r32ScreenScene: registry, validateR32ScreenSceneRegistry: validate} = await load();
  assert.deepEqual(registry, fixture);
  assert.equal(registry.baseline, 'afb369cc533ecd82b1241db9f549ca9dd7e05509');
  assert.equal(registry.candidate, 'a9f0c51af9b0090491c388c156d1f46eb610ac0c');
  assert.equal(registry.ceilingBaseline, '86a751056d9062299999c10cbfb0e2b58f0594a4');
  assert.equal(sha(read('tests/fixtures/r32-qianqing-screen-geometry-baseline.json')), registry.geometryProofSHA256);
  const source = JSON.parse(read('tests/fixtures/r32-screen-source-delta.json'));
  for (const [name, row] of Object.entries(registry.baselineSources)) {
    assert.equal(sha(Buffer.from(row.utf8)), row.sha256);
    if (source.files[name]) assert.equal(row.sha256, source.files[name].baselineSHA256);
  }
  assert.equal(registry.screen.capture.changes.length, 11);
  assert.deepEqual(registry.ceiling.capture.changes.map(row => row.path), [
    ['graph', '201', 'userData', 'paintStatus'], ['graph', '201', 'userData', 'paintState'], ['graph', '201', 'userData', 'paintSource']
  ]);
  assert.ok(Object.isFrozen(registry.central.near.uv[0].before));
  for (const mutate of [r => {r.screen.capture.afterSHA256 = '0'.repeat(64);}, r => {r.central.near.uv.pop();},
    r => {r.ceiling.capture.changes.pop();}, r => {Object.values(r.baselineSources)[0].utf8 += '\n';},
    r => {r.central.far.nonUVSHA256 = '0'.repeat(64);}]) {
    const bad = structuredClone(fixture); mutate(bad);
    assert.throws(() => validate(Buffer.from(JSON.stringify(bad, null, 2) + '\n')), /immutable R32 screen scene registry/);
  }
  for (const bad of [Buffer.alloc(0), Buffer.concat([read(fixturePath), Buffer.from('\n')])]) {
    assert.throws(() => validate(bad), /immutable R32 screen scene registry/);
  }
});

for (const kind of ['near', 'far']) test(`${kind} central UV restoration exactly matches independent afb geometry; all other bytes remain equal`, async () => {
  const {restorePreR32ScreenCentralLevel: restore} = await load();
  const s = await scenes(), before = s.oldLevels[kind], after = s.currentLevels[kind], d = fixture.central[kind];
  assert.equal(before.length, d.count); assert.equal(after.length, d.count);
  assert.deepEqual(withoutUV(after), withoutUV(before));
  assert.equal(hash(withoutUV(before)), d.nonUVSHA256);
  assert.equal(hash(before), d.beforeSHA256); assert.equal(hash(after), d.afterSHA256);
  assert.equal(d.uv.length, 6);
  assert.deepEqual(d.uv.map(row => row.name), [...Array.from({length: 5}, (_, i) => 'qianqing-five-screen-panel-' + i), 'qianqing-throne-articulated-back']);
  assert.deepEqual(restore(kind, after), before);
  assert.equal(restore(kind, before), before);
  assert.equal(hash(after), d.afterSHA256, 'no runtime geometry mutation');
  const proof = JSON.parse(read('tests/fixtures/r32-qianqing-screen-geometry-baseline.json'));
  const oldProof = before.map(row => ({name: row.name, matrix: row.matrix,
    attrs: Object.fromEntries(Object.entries(row.attributes).filter(([key]) => key !== 'uv').map(([key, a]) => [key, {
      size: a.itemSize, count: Buffer.from(a.bytes, 'base64').length / 4 / a.itemSize, sha256: sha(Buffer.from(a.bytes, 'base64'))
    }])), index: row.index ? sha(Buffer.from(row.index.bytes, 'base64')) : null}));
  assert.equal(JSON.stringify(oldProof), JSON.stringify(proof[kind]), 'independent source rebuild reproduces the untouched old geometry proof');
  const corrupt = encoded => {const bytes = Buffer.from(encoded, 'base64'); bytes[0] ^= 1; return bytes.toString('base64');};
  for (const index of d.uv.map(row => row.index)) for (const attribute of ['uv', 'position', 'normal']) {
    const bad = structuredClone(after); bad[index].attributes[attribute].bytes = corrupt(bad[index].attributes[attribute].bytes);
    assert.throws(() => restore(kind, bad), /exact R32 screen central/);
  }
  for (const mutate of [rows => {rows.pop();}, rows => {rows.push(rows[0]);}, rows => {rows.reverse();},
    rows => {rows[0].matrix[13] += .001;}, rows => {rows[0].index.bytes = corrupt(rows[0].index.bytes);},
    rows => {rows[0].attributes.position.itemSize++;}, rows => {rows[0].unregistered = undefined;}, rows => {rows.unregistered = 1;}]) {
    const bad = structuredClone(after); mutate(bad);
    assert.throws(() => restore(kind, bad), /exact R32 screen central/);
  }
  for (const row of d.uv) {
    const partial = structuredClone(after); partial[row.index].attributes.uv = structuredClone(row.before);
    assert.throws(() => restore(kind, partial), /exact R32 screen central/);
  }
});

test('exact current capture restores independently rebuilt afb then original R32; navigation and costs remain unchanged', async () => {
  const helper = await load(), s = await scenes();
  const {restorePreR32ScreenCapture, restorePreR32CeilingMetadataCapture, restoreR32ArtworkCaptureIfPresent} = helper;
  assert.equal(hash(s.capture), fixture.screen.capture.afterSHA256);
  assert.equal(hash(s.oldCapture), fixture.screen.capture.beforeSHA256);
  assert.equal(hash(s.originalCapture), fixture.ceiling.capture.beforeSHA256);
  assert.deepEqual(restorePreR32ScreenCapture(s.capture), s.oldCapture);
  assert.deepEqual(restorePreR32CeilingMetadataCapture(s.oldCapture), s.originalCapture);
  assert.deepEqual(restoreR32ArtworkCaptureIfPresent(s.capture), s.originalCapture);
  for (const key of ['navigation', 'geometryBytes', 'uniqueMaterials', 'uniqueTextures']) {
    assert.deepEqual(s.capture[key], s.oldCapture[key]); assert.deepEqual(s.oldCapture[key], s.originalCapture[key]);
  }
  assert.equal(hash(s.capture.navigation), fixture.unchanged.navigationSHA256);
  assert.equal(s.capture.meshes.length, fixture.unchanged.meshes);
  assert.equal(s.capture.graph.length, fixture.unchanged.graphNodes);
  for (const module of [s.current, s.old.central]) {
    const boxes = []; module.registerQianqingCentral({col: (...args) => boxes.push(args)}, new s.T.Group(), fixture.central.frame);
    assert.deepEqual(boxes, fixture.central.navigation);
  }
  const prior = await import('../lib/r32-scene-retention.mjs');
  assert.deepEqual(prior.restorePreR32Capture(s.capture), prior.restorePreR32Capture(s.originalCapture));
  assert.deepEqual(prior.restorePreR32Capture(JSON.parse(JSON.stringify(s.capture))), prior.restorePreR32Capture(s.capture));
  for (const kind of ['rows', 'meshes', 'graph', 'materials']) {
    assert.deepEqual(helper.restoreR32ArtworkScenePartIfPresent(kind, s.capture[kind]), s.originalCapture[kind]);
    assert.deepEqual(prior.restoreR32SceneRowsIfPresent(kind, s.capture[kind]), prior.restoreR32SceneRowsIfPresent(kind, s.originalCapture[kind]));
  }
  for (const [name, row] of Object.entries(s.capture.rows)) {
    assert.deepEqual(prior.restoreR32SceneRowIfPresent(name, row), prior.restoreR32SceneRowIfPresent(name, s.originalCapture.rows[name]));
  }
});

test('UV and metadata bridges reject unknown fields, changed values, partial reversals and runtime exceptions', async () => {
  const h = await load(), s = await scenes();
  for (const [epoch, current, restore] of [['screen', s.capture, h.restorePreR32ScreenCapture], ['ceiling', s.oldCapture, h.restorePreR32CeilingMetadataCapture]]) {
    const delta = fixture[epoch].capture;
    assert.equal(restore(epoch === 'screen' ? s.oldCapture : s.originalCapture), epoch === 'screen' ? s.oldCapture : s.originalCapture);
    for (const mutate of [value => {value.geometryBytes++;}, value => {value.navigation.colliders[0].min.x += .01;},
      value => {value.meshes[167].geometrySHA256 = 'unknown UV or position';}, value => {value.graph[201].matrix[13] += .01;},
      value => {value.materials[6][1][39].roughness += .01;}, value => {value.extra = undefined;},
      value => {value.meshes.unregistered = 1;}, value => {value.graph[0].matrix[1] = -0;}]) {
      const bad = structuredClone(current); mutate(bad);
      assert.throws(() => restore(bad), /exact R32/);
      assert.equal(h.restoreR32ArtworkCaptureIfPresent(bad), bad);
    }
    for (const change of delta.changes) {
      const partial = structuredClone(current); let target = partial;
      for (const key of change.path.slice(0, -1)) target = target[key];
      const key = change.path.at(-1);
      if (change.beforeAbsent) delete target[key]; else target[key] = structuredClone(change.before);
      assert.throws(() => restore(partial), /exact R32/);
      const altered = structuredClone(current); let row = altered;
      for (const key of change.path.slice(0, -1)) row = row[key]; row[key] = 'unregistered';
      assert.throws(() => restore(altered), /exact R32/);
    }
  }
  for (const kind of ['rows', 'meshes', 'graph', 'materials']) {
    const bad = structuredClone(s.capture[kind]); bad.unregistered = undefined;
    assert.equal(h.restoreR32ArtworkScenePartIfPresent(kind, bad), bad);
    if (kind !== 'rows') {
      const extra = structuredClone(s.capture[kind]); extra.unregistered = 1;
      assert.equal(h.restoreR32ArtworkScenePartIfPresent(kind, extra), extra);
    }
  }
  assert.throws(() => h.restorePreR32ScreenCentralLevel('unknown', []), /registered R32 screen central level/);
});
