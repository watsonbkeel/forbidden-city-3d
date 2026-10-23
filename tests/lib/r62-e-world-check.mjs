// Consumers of the same already-built world. No reconstruction, loading or repair.
import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {assertFengxianFrontInWorld,assertYongheKneesInWorld,replayFirstBatchRoute} from './r62-first-batch-world-check.mjs';
import {assertJingyangRearFacadeInWorld,replayJingyangRearFacadeInWorld} from './r62-jingyang-rear-world-check.mjs';
import {assertJingrenSouthWindowsInWorld,replayJingrenDoorsInWorld} from './r62-jingren-south-window-world-check.mjs';
import {assertJingrenRearWindowsInWorld,replayJingrenRearDoorInWorld} from './r62-jingren-rear-window-world-check.mjs';
import {assertFengxianRearInWorld,replayFengxianRearInWorld} from './r62-fengxian-rear-world-check.mjs';
import {assertEastUnknownThroneInventoryInWorld} from './r62-east-unknown-throne-world-check.mjs';
import {assertEastUnknownAnnexInventoryInWorld} from './r62-east-unknown-annex-world-check.mjs';
import {assertEastFiveRoofBeastsInWorld} from './r62-e-five-roof-beasts-world-check.mjs';
import {replayTerrace,traceTerraceGround} from './terrace-walk.mjs';
const config=JSON.parse(fs.readFileSync(new URL('../../data/zones/east-six.json',import.meta.url)));
const annex=[3,4,5,10,11,12,17,18,19,24,25,26,31,32,33,38,39,40,44,45,46,47,48,54];
export function assertR62EInWorld(W){
 const results={};
 for(const[name,fn]of Object.entries({fengxianFront:assertFengxianFrontInWorld,yonghe:assertYongheKneesInWorld,jingyang:assertJingyangRearFacadeInWorld,jingrenSouth:assertJingrenSouthWindowsInWorld,jingrenRear:assertJingrenRearWindowsInWorld,fengxianRear:assertFengxianRearInWorld,thrones:assertEastUnknownThroneInventoryInWorld,annex:assertEastUnknownAnnexInventoryInWorld,beasts:assertEastFiveRoofBeastsInWorld})){
  results[name]=fn(W);global.gc?.(); // Return only compact observations, not triangle lookup maps.
 }
 const delta=JSON.parse(fs.readFileSync(new URL('../fixtures/r62-e/integrated-collider-delta.json',import.meta.url)));
 assert.equal(delta.beforeSourceCommit,'6b396800b6a03582aebf513fcef4966e9f5d0db3');
 assert.equal(results.annex.absentColliders,168);assert.equal(results.thrones.absentColliders,5);
 assert.equal(delta.totalDelta,-18-6-18-results.thrones.absentColliders-results.annex.absentColliders);
 return{scope:'NINE_BOUNDED_E_CHANGES_IN_ACTUAL_WORLD_NOT_SECTION_OR_BROWSER_ACCEPTANCE',...results,verifiedColliderDelta:delta.totalDelta};
}
export function replayR62ERoutes(t,W,{release=()=>{}}={}){
 const rows=[],save=(label,r,options={})=>{assert.equal(r.arrived,true,label);rows.push({label,...options,arrived:r.arrived,frames:r.frames?.length??r.frames,maxFeet:r.maxFeet,startFeet:r.startFeet,end:r.end});release(label);};
 for(const which of['fengxian','yonghe'])for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])save(which,replayFirstBatchRoute(t,W,{which,fps,sprint,backward}),{fps,sprint,backward});
 for(const fps of[10,60]){
  save('jingyang-rear',replayJingyangRearFacadeInWorld(t,W,{fps}),{fps});
  for(const side of['south','north'])save('jingren-main-'+side,replayJingrenDoorsInWorld(t,W,{fps,side}),{fps});
  save('jingren-rear',replayJingrenRearDoorInWorld(t,W,{fps}),{fps});
  save('fengxian-rear',replayFengxianRearInWorld(t,W,{fps}),{fps});
 }
 for(const index of annex){
  const target=`east-six/items/${index}`,matches=W.rooms.filter(r=>r.furnishingPolicy?.target===target);assert.equal(matches.length,1,target);const room=matches[0],d=room.doors[0],dx=(room.min.x+room.max.x)/2-d.x,dz=(room.min.z+room.max.z)/2-d.z,length=Math.hypot(dx,dz),nx=dx/length,nz=dz/length;
  // Two isolated three-metre starts meet neighboring architecture in the
  // actual zone. Keep those legacy starts as negative witnesses, and use
  // existing lateral ground approaches, never changed physics or rescue.
  const go=index===3?[[d.x-4,d.z-2.4],[d.x,d.z-2.4],[d.x,d.z+2.2]]:index===24?[[d.x-14,d.z-1.5],[d.x,d.z-1.5],[d.x,d.z+2.2]]:[[d.x-nx*3,d.z-nz*3],[d.x+nx*2.2,d.z+nz*2.2]];
  const points=[...go,...go.slice(0,-1).reverse()];
  for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){
   const trace=traceTerraceGround(W.cm,{flights:[]});let r;try{r=replayTerrace(t,W,points,{fps,sprint,backward,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({target,fps,sprint,backward,end:r.end}));assert.equal(r.startFeet,0,target+': legal ground approach');assert.ok(Math.abs(r.maxFeet-config.items[index].ph)<.001,target+': actual retained floor');assert.equal(trace.samples.some(s=>s.source==='rescue'||s.source==='unverified'),false);for(const f of r.frames)assert.equal(W.cm.checkCollision(new THREE.Vector3(f.x,f.ground+1.7,f.z),.5),false,target+': real body');}finally{trace.restore();}save(target,r,{fps,sprint,backward});
  }
 }
 assert.equal(rows.length,218);return rows;
}
