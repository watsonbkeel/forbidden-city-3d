// Consumer only: pass an already-built W. No ZoneBase, PalaceBuilder, builders,
// fixture imports, scene construction, collider mutation or character rebinding.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {geometryKeys,boxKey} from './r58-gallery-world-check.mjs';
export const readEastUnknownThroneContract=()=>JSON.parse(fs.readFileSync(new URL('../fixtures/r62-east-unknown-throne-world-contract.json',import.meta.url)));
const shape=k=>JSON.stringify(JSON.parse(k)[1]);
export function assertEastUnknownThroneInventoryInWorld(W){
 assert.ok(W?.scene?.isScene&&W.cm&&Array.isArray(W.rooms),'Supply an existing W.scene, W.cm and W.rooms');
 const contract=readEastUnknownThroneContract(),bounds=contract.halls.map(r=>new THREE.Box3(new THREE.Vector3(...r.bounds[0]),new THREE.Vector3(...r.bounds[1]))),triangles=geometryKeys(W.scene,bounds),shapes=new Set([...triangles.keys()].map(shape));
 const colliders=new Map();for(const c of W.cm.colliders){const k=boxKey(c.box??c);colliders.set(k,(colliders.get(k)??0)+1)}
 const records=[];W.scene.traverse(o=>{if(o.userData.architecture)records.push(...o.userData.architecture);else if(o.userData.structure?.id)records.push(o.userData.structure)});
 let absentTriangles=0,retainedFloorTriangles=0;
 for(const h of contract.halls){
  const rs=records.filter(r=>r.id===h.structureId);assert.equal(rs.length,1,h.target+': unique original structure id');const r=rs[0];
  for(const [key,value] of Object.entries({inventoryStatus:'UNKNOWN',accepted:false,knownEmpty:false,roomUseStatus:'UNVERIFIED',roomBoundaryStatus:'UNVERIFIED'}))assert.equal(r[key],value,h.target+': explicit evidence '+key);
  assert.equal(r.furnitureStatus,'UNKNOWN_INVENTORY_WITHHELD_NOT_KNOWN_EMPTY');
  const room=W.rooms.filter(r=>r.furnishingPolicy?.target===h.target);assert.equal(room.length,1,h.target+': unique candidate room');
  for(const [key,value]of Object.entries(h.room))assert.deepEqual(room[0][key],value,h.target+': retained room '+key);
  for(const [key,count]of h.removedTriangles){assert.equal(shapes.has(shape(key)),false,h.target+': unsupported generic throne triangle remains');absentTriangles+=count}
  for(const [key,count]of h.retainedFloorTriangles){assert.ok((triangles.get(key)??0)>=count,h.target+': retained floor triangle absent');retainedFloorTriangles+=count}
  assert.equal(colliders.get(h.removedCollider)??0,0,h.target+': ghost throne collider');
  for(const key of h.retainedPlatformColliders)assert.ok(colliders.get(key)>0,h.target+': retained structural platform collider absent');
  for(const key of h.floorSupports)assert.ok(W.cm.walkables.some(w=>w.type==='box'&&boxKey(w.box)===key),h.target+': retained floor support absent');
 }
 return {scope:'FIVE_EXACT_GENERIC_THRONES_WITHHELD_NOT_HISTORICAL_EMPTY_ROOMS_OR_FULL_INTERIOR_ACCEPTANCE',halls:5,absentMeshes:20,absentTriangles,absentColliders:5,retainedFloorTriangles,inventory:'UNKNOWN',candidateUseAndBounds:'UNVERIFIED',geometryQuantizationMeters:.001};
}
