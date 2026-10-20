import {restoreR35SourceIfPresent} from '../lib/r35-source-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import {r34Scene, validateR34SceneRegistry, restorePreR34Capture, restoreR34CaptureIfPresent,
  restorePreR34Navigation, restoreR34NavigationIfPresent, restorePreR34ScenePart,
  restoreR34ScenePartIfPresent, restoreR34SceneRowIfPresent} from '../lib/r34-scene-retention.mjs';
import {r33Scene, restorePreR33Capture} from '../lib/r33-scene-retention.mjs';
import {historicalR33ModuleURL} from '../lib/historical-r33-scene-dependencies.mjs';
import {r34Source} from '../lib/r34-source-retention.mjs';
registerHooks({load(url, context, next) {
  if (url.endsWith('.json')) return {format: 'module', source: 'export default ' + fs.readFileSync(new URL(url), 'utf8'), shortCircuit: true};
  return next(url, context);
}});
const root = new URL('../../', import.meta.url);
const raw = fs.readFileSync(new URL('../fixtures/r34-scene-delta.json', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const hash = value => sha(JSON.stringify(value));
const {PalaceBuilder} = await import('../../src/scene/PalaceBuilder.js');
const {captureJiaotaiScene} = await import('../lib/r27-jiaotai-capture.mjs');
const current = captureJiaotaiScene(PalaceBuilder);
const oldBuilder = (await import(historicalR33ModuleURL('src/scene/PalaceBuilder.js'))).PalaceBuilder;
// Expected R33 output executes independent Git blob sources. Neither the new
// scene reversal nor source reversal creates the expected historical capture.
const historical = captureJiaotaiScene(oldBuilder);
const costs = value => ({triangles: Object.values(value.rows).reduce((n, row) => n + row.triangles, 0),
  meshes: value.meshes.length, graphNodes: value.graph.length, geometryBytes: value.geometryBytes,
  uniqueMaterials: value.uniqueMaterials, uniqueTextures: value.uniqueTextures,
  colliders: value.navigation.colliders.length, walkables: value.navigation.walkables.length});

test('R34 scene registry binds independent R33 sources and exact source/capture checkpoints', () => {
  assert.equal(r34Scene.schema, 1);
  assert.equal(r34Scene.baseline, r34Source.baseline);
  assert.equal(r34Scene.candidate, r34Source.candidate);
  assert.deepEqual(validateR34SceneRegistry(raw), r34Scene);
  assert.ok(Object.isFrozen(r34Scene.capture.changes));
  assert.ok(Object.isFrozen(r34Scene.baselineSources));
  assert.equal(r34Scene.capture.beforeSHA256, r33Scene.capture.afterSHA256);
  for (const [path, record] of Object.entries(r34Scene.baselineSources)) {
    assert.equal(sha(Buffer.from(record.utf8)), record.sha256, path);
    assert.equal(Buffer.byteLength(record.utf8), record.bytes, path);
    assert.equal(record.sha256, r34Source.files[path].baselineSHA256, path);
    assert.equal(record.utf8, r34Source.files[path].baselineUTF8, path);
  }
  for (const [path, digest] of Object.entries(r34Scene.retainedSources)) assert.equal(sha(restoreR35SourceIfPresent(path, fs.readFileSync(new URL(path, root)))), digest, path);
});

test('R34 registry rejects corruption, changed identities, missing bindings and altered independent sources', () => {
  const corrupted = Buffer.from(raw); corrupted[Math.floor(corrupted.length / 2)] ^= 1;
  for (const bytes of [Buffer.alloc(0), corrupted, raw.subarray(1), Buffer.concat([raw, Buffer.from('\n')])]) assert.throws(() => validateR34SceneRegistry(bytes), /immutable R34 scene registry/);
  for (const change of [r => {r.candidate = '0'.repeat(40);}, r => {r.capture.afterSHA256 = '0'.repeat(64);},
    r => {r.capture.changes.push({kind:'field',path:['extra'],before:0,after:1});},
    r => {r.capture.runtimeValues.after.push({path:['extra'],type:'undefined'});},
    r => {Object.values(r.baselineSources)[0].utf8 += '\n';},
    r => {delete r.retainedSources['src/scene/Layout.js'];}, r => {r.costs.after.geometryBytes++;}]) {
    const bad = structuredClone(r34Scene); change(bad);
    assert.throws(() => validateR34SceneRegistry(Buffer.from(JSON.stringify(bad, null, 2) + '\n')), /immutable R34 scene registry/);
  }
});

test('raw R34 resident geometry, materials, metadata, budgets and ordered navigation match the bound complete identity', () => {
  assert.equal(hash(current), r34Scene.capture.afterSHA256);
  assert.equal(hash(historical), r34Scene.capture.beforeSHA256);
  assert.deepEqual(costs(current), r34Scene.costs.after);
  assert.deepEqual(costs(historical), r34Scene.costs.before);
  assert.deepEqual(costs(historical), {triangles:210859,meshes:178,graphNodes:207,geometryBytes:20474444,uniqueMaterials:93,uniqueTextures:25,colliders:2845,walkables:230});
  for (const name of Object.keys(current.rows)) if (!Object.hasOwn(r34Scene.sceneRows, name)) assert.deepEqual(current.rows[name], historical.rows[name]);
  assert.equal(hash(current.navigation), r34Scene.navigation.afterSHA256);
});

test('only complete exact R34 scene identities restore independent R33 capture and older strict chains', () => {
  const original = hash(current);
  assert.deepEqual(restorePreR34Capture(current), historical);
  assert.equal(hash(restorePreR34Capture(JSON.parse(JSON.stringify(current)))), hash(historical));
  assert.deepEqual(restoreR34CaptureIfPresent(current), historical);
  assert.equal(restorePreR34Capture(historical), historical);
  assert.equal(restoreR34CaptureIfPresent(historical), historical);
  for (const kind of ['rows','meshes','graph','materials']) {
    assert.deepEqual(restorePreR34ScenePart(kind, current[kind]), historical[kind]);
    assert.deepEqual(restoreR34ScenePartIfPresent(kind, current[kind]), historical[kind]);
  }
  for (const [name,row] of Object.entries(current.rows)) assert.deepEqual(restoreR34SceneRowIfPresent(name,row), historical.rows[name]);
  assert.deepEqual(restorePreR34Navigation(current.navigation), historical.navigation);
  assert.deepEqual(restoreR34NavigationIfPresent(current.navigation), historical.navigation);
  assert.deepEqual(restorePreR33Capture(restorePreR34Capture(current)), restorePreR33Capture(historical));
  assert.equal(hash(current), original);
});

test('unregistered changes to geometry, materials, transforms, metadata, navigation and runtime representation fail closed', () => {
  for (const mutate of [c=>{c.meshes[0].geometrySHA256='unknown';},c=>{c.meshes.at(-1).geometrySHA256='unknown';},
    c=>{c.geometryBytes++;},c=>{c.uniqueMaterials++;},c=>{c.uniqueTextures++;},
    c=>{c.graph[0].matrix[13]+=.01;},c=>{c.materials[0][1][0].roughness+=.01;},
    c=>{c.navigation.colliders[0].min.x+=.01;},c=>{c.navigation.walkables.pop();},
    c=>{c.meshes.reverse();},c=>{c.graph.push(c.graph.at(-1));},
    c=>{c.extra=undefined;},c=>{c.meshes.extra=1;},c=>{c.graph[0].matrix[1]=-0;}]) {
    const bad = structuredClone(current); mutate(bad);
    assert.throws(()=>restorePreR34Capture(bad), /exact R34/);
    assert.equal(restoreR34CaptureIfPresent(bad), bad);
  }
  for (const source of [current,historical]) {
    const bad = {...source,unregistered:undefined};
    assert.throws(()=>restorePreR34Capture(bad), /exact R34/);
    assert.equal(restoreR34CaptureIfPresent(bad), bad);
  }
});

test('R34 parts and navigation reject omitted, duplicate, reordered and non-index fields', () => {
  for (const kind of ['meshes','graph','materials']) for (const mutate of [rows=>rows.slice(1),rows=>[...rows,rows.at(-1)],rows=>rows.toReversed(),rows=>{rows.extra=undefined;return rows;}]) {
    const bad = mutate(structuredClone(current[kind]));
    assert.throws(()=>restorePreR34ScenePart(kind,bad), /exact R34/);
    assert.equal(restoreR34ScenePartIfPresent(kind,bad),bad);
  }
  for (const kind of ['colliders','walkables']) for (const mutate of [rows=>rows.slice(1),rows=>[...rows,rows.at(-1)],rows=>rows.toReversed()]) {
    const bad = structuredClone(current.navigation); bad[kind]=mutate(bad[kind]);
    assert.throws(()=>restorePreR34Navigation(bad), /exact R34/);
    assert.equal(restoreR34NavigationIfPresent(bad),bad);
  }
  const badRow={...current.rows['后三宫'],triangles:current.rows['后三宫'].triangles+1};
  assert.equal(restoreR34SceneRowIfPresent('后三宫',badRow),badRow);
  assert.equal(restoreR34SceneRowIfPresent('__proto__',badRow),badRow);
  assert.throws(()=>restorePreR34ScenePart('__proto__',current.rows),/registered R34 scene part/);
});

function captureCentralLevel(root) {
  return root.children.map(object => ({name:object.name,matrix:(object.updateMatrix(),object.matrix.toArray()),
    attributes:Object.fromEntries(Object.entries(object.geometry.attributes).map(([key,a]) => [key,{
      itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,
      bytes:Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength).toString('base64')
    }])), index:object.geometry.index ? {type:object.geometry.index.array.constructor.name,
      bytes:Buffer.from(object.geometry.index.array.buffer,object.geometry.index.array.byteOffset,object.geometry.index.array.byteLength).toString('base64')} : null,
    groups:object.geometry.groups,drawRange:{start:object.geometry.drawRange.start,count:String(object.geometry.drawRange.count)}}));
}
for (const [kind,fine] of [['near',true],['far',false]]) test(`raw R34 central ${kind} attributes, index bytes and transforms bind the independent R33 control`, async () => {
  const T=await import('three');
  const live=await import('../../src/scene/palace/QianqingCentralSetting.js');
  const old=await import(historicalR33ModuleURL('src/scene/palace/QianqingCentralSetting.js'));
  const {restorePreR34CentralLevel:restore,restoreR34CentralLevelIfPresent:conditional}=await import('../lib/r34-scene-retention.mjs');
  const before=captureCentralLevel(old.buildQianqingCentralLevel(new T.MeshBasicMaterial(),r34Scene.centralFrame,fine));
  const after=captureCentralLevel(live.buildQianqingCentralLevel(new T.MeshBasicMaterial(),r34Scene.centralFrame,fine));
  assert.equal(hash(before),r34Scene.central[kind].beforeSHA256);
  assert.equal(hash(after),r34Scene.central[kind].afterSHA256);
  assert.deepEqual(restore(kind,after),before);
  assert.deepEqual(conditional(kind,after),before);
  for (const mutate of [rows=>{rows.pop();},rows=>{rows.push(rows.at(-1));},rows=>{rows.reverse();},
    rows=>{rows[0].matrix[12]+=.01;},rows=>{rows[0].attributes.position.bytes+='AA';},rows=>{rows.extra=undefined;}]) {
    const bad=structuredClone(after);mutate(bad);
    assert.throws(()=>restore(kind,bad),/exact R34 central/);
    assert.equal(conditional(kind,bad),bad);
  }
});
