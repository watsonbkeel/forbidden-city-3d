import{captureTishunDelta}from'../r165-tishun-south-beam/production-delta.mjs';
import{runTishunRoutes}from'../r165-tishun-south-beam/route-runner.mjs';
// Heavy actual west-six comparison, excluded from the bounded manifest.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createCanvas} from '@napi-rs/canvas';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
import {rawSnapshot, hash} from '../r164-three-entry-navigation/snapshot.mjs';
import {hashColliderSequence} from '../r165-guhua-roof/collider-hash.mjs';
import {captureYanxiDelta} from '../r165-yanxi-rear-ear/production-delta.mjs';
import {runYanxiRoutes} from '../r165-yanxi-rear-ear/route-runner.mjs';
import {captureCompanionDelta} from './production-delta.mjs';
import {runOld, runNew} from './route-runner.mjs';
import {YANGXIN_COMPANION_FIT} from '../../src/scene/palace/special/YangxinCompanionHalls.js';

const oldBytes = fs.readFileSync(new URL('./frozen/ZoneBase.c598.js', import.meta.url));
assert.equal(createHash('sha256').update(oldBytes).digest('hex'), '70e314ef08649bfc02ae213f8a92cd240411a3759f67ab34b08a8fcee99ec285');
const origin = new URL('../../src/scene/zones/ZoneBase.js', import.meta.url);
const source = oldBytes.toString().replace(/from\s*(['"])([^'"]+)\1/g, (_, q, p) =>
  'from ' + JSON.stringify(p === 'three' ? import.meta.resolve(p) : p.startsWith('.') ? new URL(p, origin).href : p));
const {ZoneBase: BeforeZone} = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));

function fields(k, root = k.root) {
  const proof = {}, out = {raw: rawSnapshot(root)};
  global.gc?.();
  out.colliders = hashColliderSequence(k.colliders, {proof});
  out.colliderProof = proof;
  for (const key of ['walkables', 'rooms', 'mapItems', 'regions']) {
    global.gc?.();
    out[key] = hash(k[key]);
  }
  if (k.plaques) out.plaques = hash(k.plaques.map(p => Object.fromEntries(Object.entries(p).map(([key, value]) =>
    [key, value?.isObject3D ? {objectUUID: value.uuid, objectName: value.name} : value]))));
  const architecture = root.userData?.architecture ?? [];
  if (!root.userData?.architecture) root.traverse(m => { if (m.userData.structure) architecture.push(m.userData.structure); });
  out.architecture = hash(architecture);
  return out;
}

function run(Builder, t, after) {
  const oldDoc = globalThis.document;
  globalThis.document = {createElement: tag => { assert.equal(tag, 'canvas'); return createCanvas(1, 1); }};
  const a = createActualLibrary();
  const zone = JSON.parse(fs.readFileSync(new URL('../../data/zones/west-six.json', import.meta.url)));
  const b = new Builder(a.library, zone);
  let delta, yanxi, beam, pre;
  const finish = b.kit.finish;
  b.kit.finish = function () {
    if (after) beam = captureTishunDelta(this);
    const priorBeam = beam?.projectKit(this) ?? this;
    if (after) yanxi = captureYanxiDelta(priorBeam);
    const retained = yanxi?.projectKit(priorBeam) ?? priorBeam;
    if (after) delta = captureCompanionDelta(retained);
    pre = fields(delta?.projectKit(retained) ?? retained);
    return finish.call(this);
  };
  try {
    const data = b.build(), priorBeam = beam?.projectData(data) ?? data, retained = yanxi?.projectData(priorBeam) ?? priorBeam, view = delta?.projectData(retained) ?? retained;
    const post = fields({...view, root: view.group});
    const routes = runOld(t, {...data, root: data.group});
    const newRoutes = after ? runNew(t, data, YANGXIN_COMPANION_FIT) : undefined;
    const yanxiRoutes = after ? runYanxiRoutes(t, data) : undefined;
    const beamRoutes = after ? runTishunRoutes(t, {...data,root:data.group}) : undefined;
    const actualRaw = rawSnapshot(data.group), projectedRaw = rawSnapshot(priorBeam.group);
    if(after){assert.equal(actualRaw.meshes,projectedRaw.meshes);assert.equal(actualRaw.triangles-projectedRaw.triangles,32);assert.equal(data.group.userData.architecture.length-priorBeam.group.userData.architecture.length,1)}
    b.releaseConstructionReferences();
    return {pre, post, routes, newRoutes, yanxiRoutes, beamRoutes, beam:beam?.proof, actualRaw, projectedRaw, actualComplete:{colliders:data.colliders.length,walkables:data.walkables.length,architecture:data.group.userData.architecture.length}, yanxi: yanxi?.proof, delta: delta?.proof, totalComplete: {colliders:priorBeam.colliders.length,walkables:priorBeam.walkables.length,architecture:priorBeam.group.userData.architecture.length}, complete: {
      colliders: retained.colliders.length, walkables: retained.walkables.length,
      architecture: retained.group.userData.architecture.length,
    }};
  } finally {
    beam?.dispose(); b.dispose(); a.dispose(); globalThis.document = oldDoc; global.gc?.();
  }
}

test('actual west-six c598 full fields and40 controller routes remain exact after precise two-ID pair projection', t => {
  const before = run(BeforeZone, t, false), after = run(ZoneBase, t, true);
  assert.deepEqual(after.pre, before.pre, 'all old premerge fields');
  assert.deepEqual(after.post, before.post, 'all old final merged fields');
  assert.deepEqual(after.routes, before.routes, 'complete original controller frames with full actual collision data');
  assert.equal(after.beamRoutes.length,12);
  assert.equal(after.beam.triangleDelta,32);
  assert.equal(after.actualComplete.architecture-after.totalComplete.architecture,1);
  assert.equal(after.newRoutes.routes.length, 12);
  assert.equal(after.newRoutes.closedDoors.length, 2);
  assert.equal(after.newRoutes.stoneSupports.length, 6);
  assert.equal(after.complete.colliders - before.complete.colliders, 144);
  assert.equal(after.yanxiRoutes.routes.length, 6);
  assert.equal(after.yanxiRoutes.closedDoors.length, 1);
  assert.equal(after.yanxiRoutes.stoneSupports.length, 4);
  assert.equal(after.totalComplete.colliders - after.complete.colliders, 84);
  assert.equal(after.totalComplete.walkables - after.complete.walkables, 4);
  assert.equal(after.totalComplete.architecture - after.complete.architecture, 1);
  assert.equal(after.complete.walkables - before.complete.walkables, 6);
  assert.equal(after.complete.architecture - before.complete.architecture, 2);
  const report = {scope: 'ACTUAL_WEST_SIX_BEFORE_AFTER_NOT_WORLD_GPU_BUILD_OR_PERFORMANCE',
    sourceBase: 'c598e52cc185ebb46183f9a1473a562f049f456b', before, after, maxRSSKiB: process.resourceUsage().maxRSS};
  if (process.env.YANGXIN_COMPANION_EVIDENCE_DIR) {
    fs.mkdirSync(process.env.YANGXIN_COMPANION_EVIDENCE_DIR, {recursive: true});
    fs.writeFileSync(process.env.YANGXIN_COMPANION_EVIDENCE_DIR + '/production-west-six.json', JSON.stringify(report, null, 2) + '\n');
  }
  console.log(JSON.stringify({delta: after.delta, complete: after.complete, yanxi: after.yanxi, totalComplete: after.totalComplete, yanxiRouteRuns: after.yanxiRoutes.routes.length, newRouteRuns: after.newRoutes.routes.length, maxRSSKiB: report.maxRSSKiB}));
});
