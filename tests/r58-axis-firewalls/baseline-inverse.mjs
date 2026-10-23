// QA fixture only. Never import/call from a live-world consumer or application.
// A verified inverse delta is allowed ONLY to reproduce the frozen 755dd9a
// pre-hook fragment for builder-unit tests. This is not a production rollback.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {hash,serial} from '../lib/inner-palace-fixture.mjs';
import {createTaiheEastFirewallProfile} from '../../src/scene/palace/special/AxisFirewallProfiles.js';

export const FROZEN_AXIS_FIREWALL_BASELINE=Object.freeze({
 sourceCommit:'755dd9ac5c6f8a8766c1db3e8e4f8fe17fa142da',
 fullGeometryHash:'50fce1db91b0443e82a3fa775fc64c1b97507858ea55aa6d276fb185251d06fc',
 boundsGeometryHash:'74373988d8df7dadf19164381953d4782c234dcb5da4eeadb7f96949fe4e4d83',
 collidersHash:'bf3a7c5625825970d89c6b3486f4f1b508dccb63582bec0ee3fc26e670104809',
 walkablesHash:'32b15efb70507cb286185e43dc85e056a271d0e916560b9e6611547017ef0b09',
 meshes:1177,colliders:1532,walkables:77,ownedMaterials:36,
});
const WALL_GEOMETRY_HASH='32cdc909c66b6b77b194730fe318e83323a775aada77ef601e5309c67ee1083d';
function geometryRows(root,exclude=null){
 root.updateMatrixWorld(true);const rows=[];
 root.traverse(m=>{if(!m.isMesh)return;for(let p=m;p;p=p.parent)if(p===exclude)return;
  rows.push({name:m.name,matrix:m.matrixWorld.toArray(),visible:m.visible,material:Array.isArray(m.material)?m.material.map(v=>v.name):m.material.name,
   attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,v])=>[k,{itemSize:v.itemSize,normalized:v.normalized,array:[...v.array]}])),index:m.geometry.index?[...m.geometry.index.array]:null,groups:m.geometry.groups,
   drawRange:{start:m.geometry.drawRange.start,count:Number.isFinite(m.geometry.drawRange.count)?m.geometry.drawRange.count:'Infinity'}});
 });return rows;
}
function snapshot(W,{exclude=null,colliderIndices=new Set(),materials=new Set()}={}){
 const rows=geometryRows(W.scene,exclude),bounds=[];
 W.scene.traverse(m=>{if(!m.isMesh)return;for(let p=m;p;p=p.parent)if(p===exclude)return;const b=new THREE.Box3().setFromObject(m);bounds.push({name:m.name,material:m.material.name,min:b.min.toArray(),max:b.max.toArray(),triangles:(m.geometry.index?.count??m.geometry.attributes.position.count)/3});});
 const colliders=[...W.builder.colliders.filter((_,i)=>!colliderIndices.has(i)),...W.kit.colliders],walkables=[...W.builder.walkables,...W.kit.walkables];
 return {fullGeometryHash:hash(rows),boundsGeometryHash:hash(bounds),collidersHash:hash(colliders.map(serial)),walkablesHash:hash(walkables),meshes:rows.length,colliders:colliders.length,walkables:walkables.length,ownedMaterials:W.builder.ownedMaterials.filter(m=>!materials.has(m)).length};
}
function verifyFrozen(snapshot){for(const [key,value] of Object.entries(FROZEN_AXIS_FIREWALL_BASELINE))if(key!=='sourceCommit')assert.equal(snapshot[key],value,`Frozen axis firewall baseline mismatch: ${key}`);}

/** Recognizes exact dedicated pre-merge group and exact six solid boxes. Both
 * the removal set AND the entire would-be original geometry/physics snapshot
 * are checked before any array or parent/child mutation. Extra geometry, a
 * changed vertex, missing/duplicate collider or unrelated edit fails closed.
 */
export function restoreFrozenAxisFirewallBaseline(W){
 assert.ok(W?.qaAxisFirewallBaseline===true,'Only the explicit QA baseline fixture may request this inverse; live world consumers must not use it');
 const before=snapshot(W),groups=[];
 W.scene.traverse(o=>{if(o.name==='taihe-east-stepped-firewall'||o.userData.structure?.objectId==='FC-1ABC6622CB')groups.push(o);});
 assert.ok(groups.length<=1,'Ambiguous installed firewall baseline groups');
 if(groups.length===0){verifyFrozen(before);return{status:'ABSENT_UNCHANGED',frozenBaselineVerified:true,sourceCommit:FROZEN_AXIS_FIREWALL_BASELINE.sourceCommit,before,after:before,removed:{meshes:0,colliders:[],ownedMaterials:[]}};}
 const group=groups[0],hallIndex=W.builderData.halls.findIndex(h=>h.name==='太和殿'),profile=createTaiheEastFirewallProfile({hall:W.builderData.halls[hallIndex],rect:W.builderData.rects[hallIndex],...W.builderData.options,linkWall:W.axis.items[13]});
 assert.ok(group.isGroup&&group.parent===W.scene.children.find(o=>o.name==='三台'),'Installed firewall baseline parent is not the retained unmerged three-hall group');
 assert.equal(hash(group.userData.structure),hash(profile),'Installed firewall metadata does not match the reviewed profile');
 const wallRows=geometryRows(group);assert.equal(wallRows.length,15,'Installed firewall mesh count mismatch');assert.equal(hash(wallRows),WALL_GEOMETRY_HASH,'Installed firewall full geometry mismatch');
 const boxes=[],p=profile.passage;
 for(const s of profile.spans){const parts=s.id==='tier-3'?[[s.x0,p.centerX-p.clearWidth/2,s.floorY,s.topY],[p.centerX+p.clearWidth/2,s.x1,s.floorY,s.topY],[p.centerX-p.clearWidth/2,p.centerX+p.clearWidth/2,p.floorY+p.clearHeight,s.topY]]:[[s.x0,s.x1,s.floorY,s.topY]];for(const [x0,x1,y0,y1]of parts)boxes.push({min:[x0,y0,profile.z-profile.thickness/2],max:[x1,y1,profile.z+profile.thickness/2]});}
 const colliderIndices=new Set(),colliders=[];
 for(const box of boxes){const matches=W.builder.colliders.flatMap((b,i)=>hash(serial(b))===hash(box)?[i]:[]);assert.equal(matches.length,1,'Installed firewall collider must have exactly one exact match');colliderIndices.add(matches[0]);colliders.push({index:matches[0],...box});}
 assert.equal(colliderIndices.size,6,'Installed firewall must remove exactly six distinct colliders');
 const materials=new Set();group.traverse(o=>(o.userData.ownedMaterials??[]).forEach(m=>materials.add(m)));assert.equal(materials.size,3,'Installed firewall cap material ownership mismatch');
 const ownedMaterials=[...materials].map(m=>{const indices=W.builder.ownedMaterials.flatMap((v,i)=>v===m?[i]:[]);assert.equal(indices.length,1,'Installed firewall material must have exactly one owner');return indices[0];});
 const expectedAfter=snapshot(W,{exclude:group,colliderIndices,materials});verifyFrozen(expectedAfter);
 // No operation above changes architecture/physics. Apply only the verified set.
 group.removeFromParent();W.builder.colliders=W.builder.colliders.filter((_,i)=>!colliderIndices.has(i));W.builder.ownedMaterials=W.builder.ownedMaterials.filter(m=>!materials.has(m));
 const after=snapshot(W);verifyFrozen(after);assert.deepEqual(after,expectedAfter,'Verified firewall inverse changed another object');
 return{status:'REMOVED_VERIFIED_R58_EAST',frozenBaselineVerified:true,sourceCommit:FROZEN_AXIS_FIREWALL_BASELINE.sourceCommit,before,after,removed:{groupName:group.name,fullGeometryHash:WALL_GEOMETRY_HASH,meshes:15,colliders,ownedMaterials}};
}
