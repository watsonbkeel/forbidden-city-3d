import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CollisionManager} from '../../src/utils/Collision.js';
import {fixture,world,parts,dispose} from '../lib/r63-west-rear-south-window-fixture.mjs';
const qa=await import('../lib/r63-west-rear-windows-world-check.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return{};throw e;});
const check=(W,index)=>{assert.equal(typeof qa.assertWestRearSouthWindowsInWorld,'function');return qa.assertWestRearSouthWindowsInWorld(W,index);};
for(const index of[24,47]){
 test(`${index}: merged actual triangles establish sill, glazing, lattice and unchanged closed-window/open-door states`,()=>{const f=fixture(index,true),W=world(f),before=JSON.stringify({c:W.cm.colliders,w:W.cm.walkables}),r=check(W,index);assert.equal(r.windowCount,4);assert.equal(r.openPortalRays,3);assert.equal(r.triangleContacts.length,index===24?20:16);assert.equal(JSON.stringify({c:W.cm.colliders,w:W.cm.walkables}),before);dispose(f);});
 for(const fps of[10,60])for(const backward of[false,true])for(const sprint of[false,true])test(`${index}: ${fps}Hz ${backward?'S':'W'} ${sprint?'sprint input':'walk'} repeated facade center route`,t=>{const f=fixture(index,true),W=world(f);assert.equal(typeof qa.replayWestRearSouthDoorInWorld,'function');const r=qa.replayWestRearSouthDoorInWorld(t,W,{index,fps,backward,sprint});assert.equal(r.arrived,true);assert.equal(r.startFeet,0);assert.ok(Math.abs(r.end[2])<1e-6);assert.ok(r.headClearance.samples>10);t.diagnostic(JSON.stringify({index,fps,backward,sprint,frames:r.frames.length,maxFeet:r.maxFeet,maxSpeed:r.maxSpeed,headClearance:r.headClearance}));dispose(f);});
}
test('triangle consumer rejects removed actual components and missing collision, not only metadata',()=>{for(const role of['masonry-sill','lower-glazed-field','upper-diagonal-lattice','frame-and-rectangular-lattice']){const f=fixture(24,true);parts(f).filter(m=>m.userData.westRearSouthWindow.role===role).forEach(m=>m.removeFromParent());assert.throws(()=>check(world(f),24));dispose(f);}const f=fixture(47,true),W=world(f);W.cm.colliders=[];assert.throws(()=>check(W,47));dispose(f);});

test('default parent consumer checks both distinct halls in one existing scene',()=>{const fixtures=[fixture(24,true),fixture(47,true)],scene=new THREE.Scene(),cm=new CollisionManager();cm.rivers=[];for(const f of fixtures){const W=world(f);scene.add(W.scene.children[0]);cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);}const r=qa.assertWestRearSouthWindowsInWorld({scene,cm});assert.deepEqual(r.targets.map(t=>t.itemIndex),[24,47]);assert.equal(r.targets.reduce((n,t)=>n+t.triangleContacts.length,0),36);fixtures.forEach(dispose);});

function removeTongdaoUpperInterior(f,onlyWindow){
 let removed=0;
 for(const m of parts(f).filter(m=>m.userData.westRearSouthWindow.role==='frame-and-rectangular-lattice'&&(onlyWindow===undefined||m.userData.westRearSouthWindow.windowIndex===onlyWindow))){
  const old=m.geometry,p=old.attributes.position,cx=m.parent.userData.westRearSouthWindow.centerX,kept=[];
  assert.equal(old.index,null);
  for(let i=0;i<p.count;i+=3){const cut=[0,1,2].every(j=>p.getX(i+j)>cx-2.181&&p.getX(i+j)<cx+2.181&&p.getY(i+j)>=3.0849&&p.getY(i+j)<=4.6304);if(cut)removed++;else kept.push(i,i+1,i+2);}
  const g=new THREE.BufferGeometry();for(const[name,a]of Object.entries(old.attributes)){const values=new a.array.constructor(kept.length*a.itemSize);kept.forEach((v,i)=>values.set(a.array.subarray(v*a.itemSize,(v+1)*a.itemSize),i*a.itemSize));g.setAttribute(name,new THREE.BufferAttribute(values,a.itemSize,a.normalized));}m.geometry=g;old.dispose();
 }
 return removed;
}
test('Tongdao supplied-world consumer rejects the exact 5,344-triangle upper-interior removal',()=>{const f=fixture(47,true);assert.equal(removeTongdaoUpperInterior(f),5344);assert.throws(()=>check(world(f),47),/upper rectangular/);dispose(f);});
for(const windowIndex of[0,1,2,3])test(`Tongdao supplied-world consumer rejects upper-interior deletion in window ${windowIndex} alone`,()=>{const f=fixture(47,true);assert.equal(removeTongdaoUpperInterior(f,windowIndex),1336);assert.throws(()=>check(world(f),47),/upper rectangular/);dispose(f);});
test('Tongdao supplied-world consumer samples every upper rectangular grille and interconnection',()=>{const f=fixture(47,true),r=check(world(f),47);assert.equal(r.triangleContacts.length,16,'all original contacts retained');assert.equal(r.upperRectangularContacts?.length,216);assert.deepEqual([...new Set(r.upperRectangularContacts.map(c=>c.windowIndex))],[0,1,2,3]);assert.equal(r.upperRectangularContacts.filter(c=>c.role==='horizontal-interconnection').length,24);dispose(f);});
test('every Tongdao upper horizontal interconnection is independently required by actual front triangles',()=>{
 for(let windowIndex=0;windowIndex<4;windowIndex++)for(let fieldIndex=0;fieldIndex<2;fieldIndex++)for(const fraction of[.25,.5,.75]){
  const f=fixture(47,true),cx=[-10.48,-5.24,5.24,10.48][windowIndex],left=cx-2.18+fieldIndex*2.18+(fieldIndex?.055:0),x=left+.02,y=3.085+(4.63032-3.085)*fraction;
  f.frame.updateMatrixWorld(true);const h=new THREE.Raycaster(new THREE.Vector3(f.item.x+x,y,f.item.z-7.1),new THREE.Vector3(0,0,1),0,1.1).intersectObject(f.frame,true)[0];assert.equal(h?.object.userData.westRearSouthWindow.role,'frame-and-rectangular-lattice');
  const m=h.object,old=m.geometry,kept=[];assert.equal(old.index,null);for(let i=0;i<old.attributes.position.count;i++)if(Math.floor(i/3)!==h.faceIndex)kept.push(i);
  const g=new THREE.BufferGeometry();for(const[name,a]of Object.entries(old.attributes)){const values=new a.array.constructor(kept.length*a.itemSize);kept.forEach((v,i)=>values.set(a.array.subarray(v*a.itemSize,(v+1)*a.itemSize),i*a.itemSize));g.setAttribute(name,new THREE.BufferAttribute(values,a.itemSize,a.normalized));}m.geometry=g;old.dispose();
  assert.throws(()=>check(world(f),47),/upper rectangular horizontal-interconnection/);dispose(f);
 }
});
