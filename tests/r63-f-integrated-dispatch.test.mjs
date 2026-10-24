// QA integration only: actual local hall/gate dispatch, never ZoneBase.build or full world.
import './lib/inner-palace-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {library} from './lib/r58-hall-beast-fixture.mjs';
import {assertR63FInWorld} from './lib/r63-f-world-check.mjs';
import {assertTongdaoRoofInWorld} from './lib/r63-tongdao-roof-world-check.mjs';
import {assertWestRearSouthWindowsInWorld} from './lib/r63-west-rear-windows-world-check.mjs';
import {Before,config,lineage,verifyLineage,hash,annexIndices,targetIndices,allDispatchIndices,createLocal,output,meshes,meshRow,isStool,legacyWindows,legacyFurniture,exactFurnitureColliders,retainedRows} from './fixtures/r63-f-integrated/fixture.mjs';
const out=new URL('../reports/r63-f-stage/',import.meta.url);
fs.mkdirSync(out,{recursive:true});
const save=(file,value)=>fs.writeFileSync(new URL(file,out),JSON.stringify(value,null,2)+'\n');
const sourceHashes=()=>Object.fromEntries(['src/scene/zones/ZoneBase.js','src/scene/palace/special/RemainingResidentialHalls.js','src/scene/palace/special/TongdaoRoof.js','src/scene/palace/special/WestRearSouthWindows.js','src/scene/palace/special/WestUnknownAnnexInventory.js','src/scene/palace/special/QinzhengFootstool.js'].map(file=>[file,hash(fs.readFileSync(new URL('../'+file,import.meta.url)))]));
const boundary='ACTUAL_LOCAL_DISPATCH_CPU_CHECK_ONLY; NOT_FULL_WORLD_BROWSER_GPU_OR_F55_ACCEPTANCE';
// Local actual-triangle ceilings, not a frame-rate or browser performance claim.
const triangleBudgets={2:11864,24:9726,47:8982};
test('frozen R62 ZoneBase AND RemainingResidential modules have SHA-checked unchanged dependencies',()=>{
 const proof=verifyLineage();assert.equal(Object.keys(lineage.frozen).length,2);assert.equal(proof.unchangedDependencies,101);
 const f=createLocal(Before,2);try{assert.equal(f.frame.userData.qinzhengFootstool,undefined);assert.equal(meshes(f.kit.root).filter(isStool).length,0);assert.equal(f.kit.colliders.filter(b=>b.sourceRole?.startsWith('r63-qinzheng-footstool')).length,0);}finally{f.dispose();}
 save('integrated-baseline-lineage.json',{...proof,productionSourceHashes:sourceHashes(),boundary});
});
test('all west hall/gate actual dispatches retain exact non-target output and bounded target physics',()=>{
 const rows=[];let removedMeshes=0,removedColliders=0,removedCover=0,colliderDelta=0,supportDelta=0;
 for(const index of allDispatchIndices){
  let baseline,retainedBefore,removedBoxes=[],legacyCount=0,oldWindowCount=0;
  const a=createLocal(Before,index);
  try{
   baseline=output(a);retainedBefore=retainedRows(a,{baseline:true});
   if(annexIndices.includes(index)){const furniture=legacyFurniture(a);legacyCount=furniture.length;assert.equal(legacyCount,index===3?8:6,`annex ${index}: frozen generic count`);removedBoxes=exactFurnitureColliders(a,furniture).map(b=>JSON.parse(JSON.stringify(b)));removedMeshes+=legacyCount;removedColliders+=removedBoxes.length;removedCover+=baseline.rooms[0].cover.length;}
   if([24,47].includes(index)){oldWindowCount=legacyWindows(a).length;assert.equal(oldWindowCount,4);}
  }finally{a.dispose();}
  const b=createLocal(ZoneBase,index);
  try{
   const current=output(b),expectedCols=baseline.colliders.filter(c=>!removedBoxes.some(r=>JSON.stringify(r)===JSON.stringify(c)));
   assert.deepEqual(retainedRows(b),retainedBefore,`item ${index}: exact retained geometry/material/render state`);
   assert.deepEqual(current.colliders.filter(c=>!c.sourceRole?.startsWith('r63-qinzheng-footstool')),expectedCols,`item ${index}: exact retained COL`);
   assert.deepEqual(current.walkables.filter(w=>!w.sourceRole?.startsWith('r63-qinzheng-footstool')),baseline.walkables,`item ${index}: exact retained supports`);
   assert.deepEqual(current.mapItems,baseline.mapItems,`item ${index}: exact map registrations`);assert.deepEqual(current.regions,baseline.regions,`item ${index}: exact regions`);
   if(annexIndices.includes(index)){
    assert.equal(current.meshRows.length,baseline.meshRows.length-legacyCount);assert.equal(b.frame.userData.westUnknownAnnexInventory.removedMeshes,legacyCount);
    assert.equal(current.rooms.length,baseline.rooms.length);assert.deepEqual(current.rooms[0].cover,[]);
    const room={...current.rooms[0]};for(const key of Object.keys(room))if(!(key in baseline.rooms[0]))delete room[key];room.cover=baseline.rooms[0].cover;assert.deepEqual(room,baseline.rooms[0],`item ${index}: original room fields retained`);
    assert.equal(current.rooms[0].furnishingPolicy.target,`west-six/items/${index}`);assert.equal(current.rooms[0].inventoryStatus,'UNKNOWN');assert.equal(current.rooms[0].knownEmpty,false);assert.equal(current.rooms[0].accepted,false);
   }else assert.deepEqual(current.rooms,baseline.rooms,`item ${index}: all rooms unchanged`);
   if([24,47].includes(index)){assert.equal(legacyWindows(b).length,0);assert.equal(b.frame.children.filter(o=>o.userData.westRearSouthWindow).length,4);}
   if(index===2){assert.equal(meshes(b.frame).filter(isStool).length,5);assert.equal(current.colliders.length-baseline.colliders.length,5);assert.equal(current.walkables.length-baseline.walkables.length,1);}
   if(index===47){assert.equal(b.frame.userData.tongdaoRoof?.roof,'xieshan');assert.equal(b.frame.userData.structure.westRearSouthWindows.windowCount,4);}
   const dc=current.colliders.length-baseline.colliders.length,dw=current.walkables.length-baseline.walkables.length;
   assert.equal(dc,index===2?5:0-legacyCount,`item ${index}: exact COL delta`);assert.equal(dw,index===2?1:0,`item ${index}: exact support delta`);
   if(triangleBudgets[index]!==undefined)assert.ok(current.triangles<=triangleBudgets[index],`item ${index}: combined actual triangle budget exceeded`);
   if(annexIndices.includes(index))assert.equal(current.triangles,baseline.triangles-legacyCount*12);
   if(!targetIndices.includes(index))assert.deepEqual(current,baseline,`non-target item ${index}: entire output exact`);
   colliderDelta+=dc;supportDelta+=dw;
   rows.push({index,kind:b.item.kind,name:b.item.name??null,target:targetIndices.includes(index),beforeMeshes:baseline.meshRows.length,afterMeshes:current.meshRows.length,beforeTriangles:baseline.triangles,afterTriangles:current.triangles,triangleDelta:current.triangles-baseline.triangles,triangleCeiling:triangleBudgets[index]??baseline.triangles,beforeMeshSHA256:baseline.meshHash,afterMeshSHA256:current.meshHash,retainedMeshSHA256:hash(retainedBefore),beforeColliders:baseline.colliders.length,afterColliders:current.colliders.length,colliderDelta:dc,beforeSupports:baseline.walkables.length,afterSupports:current.walkables.length,supportDelta:dw,withheldFurniture:legacyCount,replacedWindowPanels:oldWindowCount,nonTargetOutputExact:!targetIndices.includes(index)});
  }finally{b.dispose();}
 }
 assert.equal(rows.length,35);assert.equal(rows.filter(r=>r.target).length,16);assert.equal(removedMeshes,80);assert.equal(removedColliders,80);assert.equal(removedCover,14);assert.equal(colliderDelta,-75);assert.equal(supportDelta,1);
 save('integrated-dispatch-delta.json',{baselineCommit:lineage.baselineCommit,productionSourceHashes:sourceHashes(),boundary,allHallGateDispatches:rows.length,exactNonTargetDispatches:rows.filter(r=>!r.target).length,annexTargets:annexIndices.length,removedMeshes,removedColliders,removedCover,colliderDelta,supportDelta,triangleBudgets,baselineTriangles:rows.reduce((n,r)=>n+r.beforeTriangles,0),currentTriangles:rows.reduce((n,r)=>n+r.afterTriangles,0),rows});
});
test('one actual integrated merged group passes R63 F B consumer with roof and windows coexisting',()=>{
 const lib=library(),z=new ZoneBase(lib,structuredClone(config));let group;
 try{
  for(const index of targetIndices)z.buildHall(z.zoneJson.items[index]);
  group=z.kit.finish();const scene=new THREE.Scene();scene.add(group);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(z.kit.colliders,'west-six');cm.addWalkables(z.kit.walkables,'west-six');
  const W={THREE,scene,cm,rooms:z.kit.rooms},r=assertR63FInWorld(W,{layer:'B'});
  assert.equal(r.verifiedColliderDelta,-75);assert.equal(r.verifiedSupportDelta,1);assert.equal(r.roof.surfaceProbes,6);assert.equal(r.windows.targets.length,2);assert.equal(r.inventory.halls,13);assert.equal(r.footstool.layer,'B');
  save('integrated-merged-consumer.json',{boundary,dispatchIndices:targetIndices,productionSourceHashes:sourceHashes(),actualCollisionManager:true,oneMergedGroup:scene.children.length===1,result:r});
 }finally{z.kit.dispose(group??z.kit.root);z.kit.root.clear();lib.mats.forEach(m=>m.dispose());}
});
test('frozen R62 actual Tongdao dispatch fails the new roof and window consumers (negative control)',()=>{
 const f=createLocal(Before,47);let group;
 try{group=f.kit.finish();const scene=new THREE.Scene();scene.add(group);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);const W={scene,cm,rooms:f.kit.rooms};assert.throws(()=>assertTongdaoRoofInWorld(W),/one actual Tongdao correction/);assert.throws(()=>assertWestRearSouthWindowsInWorld(W,47),/windowCount|undefined/);}
 finally{f.dispose(group);}
});
