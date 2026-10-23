// Pure existing-W consumer. No ZoneBase, world builder, geometry repair or actor creation.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {PLAYER} from '../../src/config/constants.js';
import {createPhysicalWaypointDriver} from './physical-waypoints.mjs';
export const contractURL=new URL('../fixtures/r58-gallery-world-contract.json.gz',import.meta.url);
const rounded=v=>Math.round(Math.fround(v)*1000); // Merge-to-Float32 comparison tolerance, not a survey precision claim.
export const triangleKey=(material,vertices)=>JSON.stringify([material?.replace(/_material$/,''),vertices.map(v=>v.map(rounded)).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))]);
export function geometryKeys(root, bounds = null){const keys=new Map();root.updateMatrixWorld(true);root.traverse(m=>{
 if(!m.isMesh)return;
 if(bounds){const box=new THREE.Box3().setFromObject(m);if(!bounds.some(b=>b.intersectsBox(box)))return;}
 if(m.isInstancedMesh){if(m.userData.characterBatch===true)return;throw new Error('Unsupported instanced architecture in gallery consumer scope');}for(let o=m;o;o=o.parent)if(!o.visible)return;
 if(Array.isArray(m.material))throw new Error('Unsupported multi-material architecture in gallery consumer scope');
 if(m.material.visible===false||m.material.colorWrite===false||m.material.opacity===0)return;
 const g=m.geometry,p=g.attributes.position,index=g.index,start=g.drawRange.start,end=Math.min(index?.count??p.count,start+g.drawRange.count);
 if(!Number.isInteger(start)||start<0||start%3!==0)throw new Error('Unsupported non-triangle gallery drawRange');
 for(let i=start;i+2<end;i+=3){const vertices=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(m.matrixWorld).toArray());const key=triangleKey(solidMaterialNameAt(m,i/3),vertices);keys.set(key,(keys.get(key)??0)+1);}
 });return keys;}
const shapeKey=key=>JSON.stringify(JSON.parse(key)[1]);
const boxKey=b=>JSON.stringify([b.min.toArray().map(v=>+v.toFixed(7)),b.max.toArray().map(v=>+v.toFixed(7))]);
export function assertGalleryInventoryInWorld(W){
 assert.ok(W?.scene?.isScene&&W.cm&&Array.isArray(W.rooms),'Supply actual existing scene, collision manager and room registrations; no reconstruction fallback');
 const contract=JSON.parse(gunzipSync(fs.readFileSync(contractURL))),bounds=contract.rows.map(r=>new THREE.Box3(new THREE.Vector3(...r.bounds.min),new THREE.Vector3(...r.bounds.max))),keys=geometryKeys(W.scene,bounds),shapes=new Set([...keys.keys()].map(shapeKey)),colliders=new Map();
 for(const row of W.cm.colliders){const key=boxKey(row.box??row);colliders.set(key,(colliders.get(key)??0)+1)}
 let rooms=0,retainedTriangles=0,absentTriangles=0,retainedColliders=0,absentColliders=0;
 for(const row of contract.rows){const actual=W.rooms.filter(r=>r.furnishingPolicy?.target===row.target);assert.equal(actual.length,row.rooms.length,`${row.target}: exact candidate-room count`);
 for(const expected of row.rooms){const matches=actual.filter(a=>JSON.stringify(a.min)===JSON.stringify(expected.min)&&JSON.stringify(a.max)===JSON.stringify(expected.max));assert.equal(matches.length,1,'one exact candidate room bounds registration');const {id,...rest}=matches[0];assert.deepEqual(rest,expected);rooms++;}
 for(const [key,count] of row.retainedTriangles){assert.ok((keys.get(key)??0)>=count,`${row.target}: positive retained triangle absent: ${key}`);retainedTriangles+=count;}
 for(const [key,count] of row.removedTriangles){assert.equal(shapes.has(shapeKey(key)),false,`${row.target}: removed prop shape remains`);absentTriangles+=count;}
 for(const key of row.retainedColliders){assert.ok(colliders.get(key)>0,`${row.target}: retained structural collider absent`);retainedColliders++;}
 for(const key of row.removedColliders){assert.equal(colliders.get(key)??0,0,`${row.target}: ghost prop collider remains`);absentColliders++;}
 for(const expected of row.walkables){assert.ok(W.cm.walkables.some(w=>w.type==='box'&&boxKey(w.box)===expected),'retained low plinth support missing');}
 }
 return {scope:'UNKNOWN_INVENTORY_FALLBACK_NOT_RECONSTRUCTION_OR_INTERIOR_ACCEPTANCE',rooms,retainedTriangles,absentTriangles,retainedColliders,absentColliders,geometryQuantizationMeters:.001,inventory:'UNKNOWN',layout:'UNVERIFIED'};
}
export function runGalleryControllerRoute(W,points,{fps=60,sprint=false,backward=false,tick,initialFeet=0}={}){
 const {camera,controls}=W;assert.equal(controls.collisionManager,W.cm);assert.ok([10,60].includes(fps));
 controls.setPosition(points[0][0],initialFeet+PLAYER.HEIGHT,points[0][1]);controls.moveForward=!backward;controls.moveBackward=backward;
 const driver=createPhysicalWaypointDriver(points),physical=()=>[camera.position.x-controls.bobOffset.x,camera.position.z-controls.bobOffset.z];let frames=0,minFeet=controls.feetY,maxFeet=controls.feetY,maxSpeed=0;
 try{while(!driver.complete&&frames<fps*40){const before=physical(),command=driver.command(before,sprint),[x,z]=command.target;controls.canSprint=command.canSprint;camera.position.sub(controls.bobOffset);camera.lookAt(backward?2*camera.position.x-x:x,camera.position.y,backward?2*camera.position.z-z:z);camera.position.add(controls.bobOffset);camera.updateMatrixWorld(true);if(tick)tick(1000/fps);else controls.prevTime=performance.now()-1000/fps;controls.update();camera.updateMatrixWorld(true);frames++;minFeet=Math.min(minFeet,controls.feetY);maxFeet=Math.max(maxFeet,controls.feetY);maxSpeed=Math.max(maxSpeed,controls.motion.speed);driver.observe(before,physical());}
 return {arrived:driver.complete,frames,fps,sprint,backward,minFeet,maxFeet,maxSpeed,end:physical(),driver:driver.diagnostics};
 }finally{controls.moveForward=controls.moveBackward=controls.canSprint=false;controls.stop();}
}
export function galleryEntryPoints(room){const d=room.doors[0],cx=(room.min.x+room.max.x)/2,cz=(room.min.z+room.max.z)/2,dx=cx-d.x,dz=cz-d.z,len=Math.hypot(dx,dz),nx=dx/len,nz=dz/len;return [[d.x-nx*2.5,d.z-nz*2.5],[d.x+nx*1.65,d.z+nz*1.65],[d.x-nx*2.5,d.z-nz*2.5]];}
export {boxKey};
