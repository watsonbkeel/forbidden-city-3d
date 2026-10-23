import assert from 'node:assert/strict';
import * as THREE from 'three';
import {assertTongdaoRoofInWorld} from './r63-tongdao-roof-world-check.mjs';
import {assertWestRearSouthWindowsInWorld,replayWestRearSouthDoorInWorld} from './r63-west-rear-windows-world-check.mjs';
import {assertWestUnknownAnnexInventoryInWorld,westUnknownAnnexEntryPoints} from './r63-west-unknown-annex-world-check.mjs';
import {assertQinzhengFootstoolInWorld,replayQinzhengFootstoolInWorld} from './r63-qinzheng-footstool-world-check.mjs';
import {replayTerrace,traceTerraceGround} from './terrace-walk.mjs';

/** Read the supplied actual world only. No construction, physics repair, load,
 * actor binding or acceptance-state mutation is performed by this consumer. */
export function assertR63FInWorld(W,{layer='B',interiorLoader}={}) {
  const roof=assertTongdaoRoofInWorld(W),windows=assertWestRearSouthWindowsInWorld(W),
    inventory=assertWestUnknownAnnexInventoryInWorld(W),
    footstool=assertQinzhengFootstoolInWorld(W,{layer,interiorLoader});
  assert.equal(inventory.halls,13);assert.equal(inventory.absentMeshes,80);
  assert.equal(inventory.absentColliders,80);assert.equal(inventory.removedCover,14);
  assert.equal(footstool.colliders,5);assert.equal(footstool.supports,1);
  return {scope:'FIVE_BOUNDED_WORK_ITEMS_NOT_F55_OR_BROWSER_ACCEPTANCE',roof,windows,inventory,footstool,
    verifiedColliderDelta:footstool.colliders-inventory.absentColliders,
    verifiedSupportDelta:footstool.supports};
}

/** All new applicable route modes, with each call's assertions consumed before
 * its test-only mock history is released. Older A-E routes remain elsewhere. */
export function replayR63FRoutes(t,W,{release=()=>{}}={}) {
  const rows=[];
  for(const index of [24,47])for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true]) {
    const r=replayWestRearSouthDoorInWorld(t,W,{index,fps,sprint,backward,compoundApproach:true});
    rows.push({scope:'REAR_SOUTH_DOOR',index,fps,sprint,backward,arrived:r.arrived,frames:r.frames.length,headClearance:r.headClearance});
    release('r63-rear-south-door');
  }
  const rooms=W.zoneManager?.allRooms??W.rooms;
  const targets=rooms.filter(r=>r.furnishingPolicy?.scope==='r63-west-13-unnamed-annex-furnish-room-only');
  assert.equal(targets.length,13);
  for(const room of targets)for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true]) {
    const trace=traceTerraceGround(W.cm,{flights:[]});
    try {
      const r=replayTerrace(t,W,westUnknownAnnexEntryPoints(room),{fps,sprint,backward,recordFrames:true});
      assert.ok(r.arrived,JSON.stringify({target:room.furnishingPolicy.target,fps,sprint,backward,end:r.end}));
      assert.ok(!trace.samples.some(s=>['rescue','unverified'].includes(s.source)));
      for(const f of r.frames)assert.equal(W.cm.checkCollision(new THREE.Vector3(f.x,f.feet+1.7,f.z),.5),false);
      rows.push({scope:'UNKNOWN_ANNEX_RETAINED_ENTRANCE',target:room.furnishingPolicy.target,fps,sprint,backward,arrived:r.arrived,frames:r.frames.length,noRescue:true});
    } finally {trace.restore();}
    release('r63-annex-route');
  }
  for(const route of ['step','retained'])for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true]) {
    rows.push({scope:'QINZHENG_FOOTSTOOL_B',...replayQinzhengFootstoolInWorld(t,W,{route,fps,sprint,backward})});
    release('r63-qinzheng-route');
  }
  assert.equal(rows.length,136);
  return rows;
}
