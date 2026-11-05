import {captureDanyuanDelta} from '../r165-danyuan-eleven-bay/production-delta.mjs';
import {runDanyuanRoutes} from '../r165-danyuan-eleven-bay/route-runner.mjs';
import {runGroundAccess} from '../r165-danyuan-eleven-bay/route-baseline.mjs';
import {loadDanyuanBaseline} from '../r165-danyuan-eleven-bay/baseline-reader.mjs';
import {captureZhongzhengDelta} from '../r165-zhongzheng-main/production-delta.mjs';
import {runZhongzhengRoutes} from '../r165-zhongzheng-main/route-runner.mjs';
import {runOldAccess} from '../r165-zhongzheng-main/route-baseline.mjs';
import {loadZhongzhengBaseline} from '../r165-zhongzheng-main/baseline-reader.mjs';
import {captureWatchDelta} from '../r165-xihua-north-house/production-delta.mjs';
import {loadWatchRouteBaseline} from '../r165-xihua-north-house/route-baseline.mjs';
import {captureFuyiDelta} from '../r165-fuyi-three-bay/production-delta.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as T from 'three';
import '../lib/inner-palace-fixture.mjs';
import {ZoneBase} from '../../src/scene/zones/ZoneBase.js';
import {createActualLibrary} from '../r158-cumulative-1600/library.mjs';
import {rawSnapshot, hash} from '../r164-three-entry-navigation/snapshot.mjs';
import {hashColliderSequence} from '../r165-guhua-roof/collider-hash.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../lib/bounded-qa-clock.mjs';

export function validateProductionBaselineBytes(bytes) {
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '64c3b0a4130cf43da1b6ef8231f3a3d00ebe08a2379c454d8b46f3db00a80764', 'immutable actual public-ad0 region baseline');
  return JSON.parse(bytes);
}
const baseline = validateProductionBaselineBytes(fs.readFileSync(new URL('./production-baseline.ad0.json', import.meta.url)));
const OLD_SOURCE_SHA = 'ce02417888b50ac22803ba344005756d697fca26b6e61e97fd39ede2e9568a2c';
const excludeObjects = (root, objects) => ({
  updateWorldMatrix: (...args) => root.updateWorldMatrix(...args),
  traverse: fn => root.traverse(m => { if (!objects.has(m)) fn(m); }),
});
const collectMeshes = root => {
  const rows = [];
  root.traverse(m => { if (m.isMesh) rows.push(m); });
  return rows;
};

/** CPU production ZoneBase/TextureLibrary/merge/physics only, not default World.
 * No source loader or product geometry mutation is left active by this harness.
 * Additional full-region negative hashes are separated by optional test-only GC;
 * this limits evidence allocations and is not a production memory/perf change. */
export function actualOuterWest() {
  assert.equal(baseline.publicBase, 'ad0f3086e32d8f101bb29c1a7a7b04fc441861ab');
  assert.equal(baseline.publicZoneBaseSha256, OLD_SOURCE_SHA);
  const fixtureBytes = fs.readFileSync(new URL('./frozen/ZoneBase.ad0.js', import.meta.url));
  assert.equal(createHash('sha256').update(fixtureBytes).digest('hex'), OLD_SOURCE_SHA);
  const {library, dispose} = createActualLibrary();
  const zone = JSON.parse(fs.readFileSync(new URL('../../data/zones/outer-west.json', import.meta.url)));
  const builder = new ZoneBase(library, zone);
  const record = {scope: 'ACTUAL_OUTER_WEST_ONLY_NOT_WORLD_GPU_OR_MOBILE', publicBase: baseline.publicBase};
  const newObjects = new Set(), newMaterials = new Set(), newUUIDs = new Set(), stoneTops = [];
  let oldState, oldMerged, data, fuyi, watch, zhongzheng, danyuan;
  const originalFinish = builder.kit.finish;
  builder.kit.finish = function () {
    danyuan = captureDanyuanDelta(this);
    const danyuanRetained = danyuan.projectKit(this);
    zhongzheng = captureZhongzhengDelta(danyuanRetained);
    const zhongzhengRetained = zhongzheng.projectKit(danyuanRetained);
    watch = captureWatchDelta(zhongzhengRetained);
    const watchRetained = watch.projectKit(zhongzhengRetained);
    fuyi = captureFuyiDelta(watchRetained);
    const retained = fuyi.projectKit(watchRetained);
    const targets = retained.root.children.filter(m => m.userData.structure?.sourceObjectId === 'FC-73284DA281');
    assert.equal(targets.length, 1, 'one exact K19 owner');
    const frame = targets[0];
    frame.traverse(m => {
      newObjects.add(m);
      if (!m.isMesh) return;
      newUUIDs.add(m.uuid); newMaterials.add(m.material);
      if (m.userData.xuanshouStone) {
        const top = new T.Box3().setFromObject(m); top.min.y = top.max.y;
        stoneTops.push(top);
      }
    });
    assert.equal(newUUIDs.size, 110); assert.equal(stoneTops.length, 4);
    const oldColliders = retained.colliders.filter(c => !newUUIDs.has(c.xuanshouMesh));
    const newColliders = retained.colliders.filter(c => newUUIDs.has(c.xuanshouMesh));
    const oldWalkables = retained.walkables.filter(w => !stoneTops.some(b => w.box?.equals(b)));
    assert.equal(newColliders.length, 110);
    assert.equal(retained.walkables.length - oldWalkables.length, 4);
    const oldMeshes = collectMeshes(retained.root).filter(m => !newObjects.has(m));
    const oldBounds = oldMeshes.map(m => new T.Box3().setFromObject(m));
    for (const m of collectMeshes(frame)) {
      const box = new T.Box3().setFromObject(m);
      assert.ok(!oldBounds.some(old => box.intersectsBox(old)), 'retained full-region render contact: ' + m.name);
    }
    for (const box of newColliders) assert.ok(!oldColliders.some(old => box.intersectsBox(old)), 'retained full-region collider contact');
    record.separation = {oldMeshes: oldMeshes.length, newMeshes: newUUIDs.size, oldColliders: oldColliders.length, newColliders: newColliders.length, renderContacts: 0, colliderContacts: 0};
    const oldRoot = excludeObjects(retained.root, newObjects);
    const raw = rawSnapshot(oldRoot), architecture = [];
    retained.root.traverse(m => { if (m.userData.structure && !newObjects.has(m)) architecture.push(m.userData.structure); });
    global.gc?.();
    const colliderProof = {};
    oldState = {
      raw, colliderCount: oldColliders.length, colliders: hashColliderSequence(oldColliders, {proof: colliderProof}), colliderProof,
      walkableCount: oldWalkables.length, walkables: hash(oldWalkables), rooms: hash(retained.rooms), maps: hash(retained.mapItems), regions: hash(retained.regions),
      plaques: hash(retained.plaques.map(p => Object.fromEntries(Object.entries(p).map(([k,v]) => [k,v?.isObject3D ? {objectUUID:v.uuid,objectName:v.name} : v])))),
      architecture: hash(architecture),
    };
    assert.deepEqual(oldState, baseline.old, 'every old full-region geometry/material/contact/record value remains exact');
    // Real old geometry drift, same complete old raw oracle; never refresh fixture.
    const position = oldMeshes.find(m => m.geometry.attributes.position.count > 12).geometry.attributes.position.array;
    const beforeVertex = position[0];
    try {
      position[0] += .01;
      assert.notEqual(rawSnapshot(oldRoot).geometry, baseline.old.raw.geometry, 'actual unrelated old vertex drift detected');
    } finally { position[0] = beforeVertex; }
    assert.deepEqual(rawSnapshot(oldRoot), baseline.old.raw, 'old vertex restored exactly');
    // Real old collider drift, same complete all-field sequence hash.
    const collider = oldColliders.find(c => !c.triangleSupport), beforeContact = collider.min.x;
    global.gc?.();
    try {
      collider.min.x += .01;
      assert.notEqual(hashColliderSequence(oldColliders), baseline.old.colliders, 'actual unrelated old contact drift detected');
    } finally { collider.min.x = beforeContact; }
    assert.equal(collider.min.x, beforeContact);
    record.negatives = {oldVertex: 'REAL_MUTATION_FULL_RAW_HASH_REJECTED_AND_RESTORED', oldContact: 'REAL_MUTATION_FULL_SEQUENCE_HASH_REJECTED_AND_RESTORED'};
    global.gc?.();
    return originalFinish.call(this);
  };
  return {
    verify(t) {
      const completeData = builder.build();
      const danyuanRetained = danyuan.projectData(completeData);
      record.danyuan = danyuan.proof;
      record.withoutDanyuanMerged = rawSnapshot(danyuanRetained.group);
      const zhongzhengRetained = zhongzheng.projectData(danyuanRetained);
      record.zhongzheng = zhongzheng.proof;
      record.withoutZhongzhengMerged = rawSnapshot(zhongzhengRetained.group);
      const watchRetained = watch.projectData(zhongzhengRetained);
      record.watch = watch.proof;
      record.withoutWatchMerged = rawSnapshot(watchRetained.group);
      data = fuyi.projectData(watchRetained);
      record.fuyi = fuyi.proof;
      record.completeActualMerged = rawSnapshot(completeData.group);
      const mergedNew = new Set();
      data.group.traverse(m => { if (m.isMesh && newMaterials.has(m.material)) mergedNew.add(m); });
      oldMerged = rawSnapshot(excludeObjects(data.group, mergedNew));
      assert.deepEqual(oldMerged, baseline.mergedOld, 'every old merged geometry/material value remains exact');
      record.old = oldState; record.mergedOld = oldMerged; record.allMerged = rawSnapshot(data.group);
      record.counts = {colliders:data.colliders.length, walkables:data.walkables.length, rooms:data.rooms.length, maps:data.mapItems.length, architecture:data.group.userData.architecture.length};
      assert.equal(record.counts.colliders - baseline.counts.colliders, 110);
      assert.equal(record.counts.walkables - baseline.counts.walkables, 4);
      assert.equal(record.counts.rooms, baseline.counts.rooms); assert.equal(record.counts.maps, baseline.counts.maps);
      assert.equal(record.counts.architecture - baseline.counts.architecture, 1);
      assert.equal(record.allMerged.triangles - baseline.mergedOld.triangles, 5936);
      const cm = new CollisionManager(); cm.rivers = []; cm.addColliders(completeData.colliders); cm.addWalkables(completeData.walkables);
      record.routes = [];
      const oldRoute = [[277,372],[295.1,372],[295.1,438.6],[290.4,438.6],[295.1,438.6],[295.1,372],[277,372]];
      const replay = (points, fps) => withBoundedQaMocks(t, mock => replayKunning(mock, {THREE:T,cm}, points, {fps,sprint:true,startFeet:0,recordFrames:true}));
      const summarize = (q,kind,fps) => ({kind,fps,arrived:q.arrived,end:q.end,maxFeet:q.maxFeet,frames:q.frames.length,frameHash:hash(q.frames)});
      for (const fps of [10,60]) {
        const old = replay(oldRoute, fps); assert.equal(old.arrived, true, 'retained route fps' + fps);
        record.routes.push(summarize(old, 'retained-outside-observation-return', fps));
        const up = [[277,372],[295.1,372],[295.1,438.6],[290.4,438.6],[290.4,442.4]];
        const added = replay([...up,...up.slice(0,-1).reverse()], fps);
        assert.equal(added.arrived, true, 'new step/porch/return fps' + fps);
        assert.ok(added.frames.some(f => f.z > 441.9 && f.feet > .59)); assert.ok(Math.abs(added.end[2]) < 1e-6);
        record.routes.push(summarize(added, 'new-stone-steps-porch-return', fps));
      }
      assert.deepEqual(record.routes.filter(r => r.kind === 'retained-outside-observation-return'), baseline.routes, 'entire old route frame hashes remain exact');
      for (const fps of [10,60]) {
        const up = [[277,372],[258.5,372],[258.5,438.6],[263.4,438.6],[263.4,442.3]];
        const added = replay([...up,...up.slice(0,-1).reverse()], fps);
        assert.equal(added.arrived, true, 'K18 actual east bypass/steps/veranda/return fps' + fps);
        assert.ok(added.frames.some(f => f.z > 441.9 && f.feet > .299));
        assert.ok(Math.abs(added.end[2]) < 1e-6);
        record.routes.push(summarize(added, 'K18-two-fitted-steps-south-veranda-return', fps));
      }
      assert.equal(record.withoutWatchMerged.triangles - record.allMerged.triangles, 248, 'independent K18 complete-region delta');

      for (const route of loadWatchRouteBaseline().routes) {
        const result = replay(route.points, route.fps);
        assert.equal(result.arrived, true, route.kind);
        assert.equal(hash(result.frames), route.frameHash, 'exact pre-L3 route frames '+route.kind);
        assert.equal(result.frames.length, route.frames);
        record.routes.push(summarize(result, route.kind, route.fps));
      }
      for (const fps of [10,60]) {
        const up = [[333,-260],[333,-228.8],[350,-228.8],[350,-232.5]];
        const result = replay([...up,...up.slice(0,-1).reverse()], fps);
        assert.equal(result.arrived, true, 'L3 actual west road/north treads/porch/return fps'+fps);
        assert.ok(result.frames.some(q=>q.z < -232.2 && q.x > 349 && q.feet > .249));
        assert.ok(Math.abs(result.end[2]) < 1e-6);
        record.routes.push(summarize(result, 'L3-two-fitted-treads-north-front-return', fps));
      }
      assert.equal(record.withoutZhongzhengMerged.triangles - record.withoutWatchMerged.triangles, 2216, 'independent L3 complete-region delta');
      assert.equal(record.withoutDanyuanMerged.triangles - record.withoutZhongzhengMerged.triangles, 1248, 'independent H29 complete-region delta');
      assert.equal(record.completeActualMerged.triangles - record.withoutDanyuanMerged.triangles, 1052, 'independent H30 complete-region delta');

      record.zhongzhengOldAccess = runOldAccess(t, completeData);
      assert.deepEqual(record.zhongzhengOldAccess, loadZhongzhengBaseline().routes, 'exact pre-H29 existing gate-bypass frames on complete zone data');
      record.zhongzhengRoutes = runZhongzhengRoutes(t, completeData);
      assert.equal(record.zhongzhengRoutes.routes.length, 6);
      assert.equal(record.zhongzhengRoutes.stoneSupports.length, 6);
      assert.equal(record.zhongzhengRoutes.historicalAxisBlocked, true);
      record.danyuanOldAccess = runGroundAccess(t, completeData);
      assert.deepEqual(record.danyuanOldAccess, loadDanyuanBaseline().ground, 'exact pre-H30 ground-bypass frames on complete zone data');
      record.danyuanRoutes = runDanyuanRoutes(t, completeData);
      assert.equal(record.danyuanRoutes.routes.length, 6);
      assert.equal(record.danyuanRoutes.stoneSupports.length, 4);
      assert.equal(record.danyuanRoutes.historicalAxisBlocked, true);
      record.maxRSSKiB = process.resourceUsage().maxRSS; record.memory = process.memoryUsage(); record.execArgv = process.execArgv;
      record.routeLimits = 'Sprint flag walks within2m of turns/endpoints; not full-speed staircase running. Actual outer-west only.';
      record.complete = true;
      return record;
    },
    dispose() { builder.dispose(); dispose(); },
  };
}
