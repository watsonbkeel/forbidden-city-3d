// Pure existing-W consumer. Never builds a world, reconstructs rooms or repairs geometry.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {assertGalleryInventoryInWorld,geometryKeys,boxKey,galleryEntryPoints,runGalleryControllerRoute} from './r58-gallery-world-check.mjs';
export {galleryEntryPoints,runGalleryControllerRoute};
export const declarationContractURL=new URL('../fixtures/r58-declaration-inventory-world-contract.json.gz',import.meta.url);
export const readDeclarationContract=()=>JSON.parse(gunzipSync(fs.readFileSync(declarationContractURL)));
const shapeKey=key=>JSON.stringify(JSON.parse(key)[1]);
// Explicit probe choices, not repairs: two inherited candidate endpoints intersect
// the unchanged global river mask. Keep those failed probes visible separately.
export const routeSelection=Object.freeze({26:{entry:0,frontage:[0,9],riverMaskBlocked:[]},27:{entry:1,frontage:[1,5],riverMaskBlocked:[0]},32:{entry:0,frontage:[0,9],riverMaskBlocked:[]},33:{entry:0,frontage:[0,4],riverMaskBlocked:[5]}});
export function assertDeclarationInventoryInWorld(W){
 assert.ok(W?.scene?.isScene&&W.cm&&Array.isArray(W.rooms),'Supply actual existing scene, collision manager and room registrations; no reconstruction fallback');
 const contract=readDeclarationContract(),bounds=contract.rows.map(r=>new THREE.Box3(new THREE.Vector3(...r.bounds.min),new THREE.Vector3(...r.bounds.max))),keys=geometryKeys(W.scene,bounds),shapes=new Set([...keys.keys()].map(shapeKey)),colliders=new Map();
 for(const c of W.cm.colliders){const k=boxKey(c.box??c);colliders.set(k,(colliders.get(k)??0)+1)}
 let rooms=0,retainedTriangles=0,absentTriangles=0,retainedColliders=0,absentColliders=0,retainedSupports=0;
 for(const row of contract.rows){
  const actual=W.rooms.filter(r=>r.furnishingPolicy?.target===row.target);assert.equal(actual.length,row.rooms.length,`${row.target}: exact candidate-room count`);
  for(const expected of row.rooms){const matches=actual.filter(a=>JSON.stringify(a.min)===JSON.stringify(expected.min)&&JSON.stringify(a.max)===JSON.stringify(expected.max));assert.equal(matches.length,1,`${row.target}: one exact inherited candidate boundary`);const{id,...rest}=matches[0];assert.deepEqual(rest,expected);rooms++;}
  for(const[key,count]of row.retainedTriangles){assert.ok((keys.get(key)??0)>=count,`${row.target}: retained triangle absent: ${key}`);retainedTriangles+=count;}
  for(const[key,count]of row.removedTriangles){assert.equal(shapes.has(shapeKey(key)),false,`${row.target}: unsupported prop shape remains`);absentTriangles+=count;}
  for(const[key,count]of row.retainedColliders){assert.ok((colliders.get(key)??0)>=count,`${row.target}: retained structural collider absent`);retainedColliders+=count;}
  for(const[key,count]of row.removedColliders){assert.equal(colliders.get(key)??0,0,`${row.target}: ghost prop collider remains`);absentColliders+=count;}
  for(const key of row.walkables){assert.ok(W.cm.walkables.some(w=>w.type==='box'&&boxKey(w.box)===key),`${row.target}: retained support absent`);retainedSupports++;}
 }
 const previous=assertGalleryInventoryInWorld(W);
 assert.equal(previous.rooms,52,'previous eight policies retain their frozen room contract');
 return{scope:'DECLARATION_ONLY_UNKNOWN_INVENTORY_NOT_NAMED_ROOM_RECONSTRUCTION',baselineCommit:contract.baselineCommit,declarations:4,rooms,retainedTriangles,absentTriangles,retainedColliders,absentColliders,retainedSupports,previous,cumulativeDeclarations:12,cumulativeRooms:rooms+previous.rooms,inventory:'UNKNOWN',layout:'UNVERIFIED',boundaryValidation:'NOT_VALIDATED',navigationValidation:'NOT_VALIDATED',geometryQuantizationMeters:.001};
}
// Routes are derived only from actual registered room doors/bounds, never names.
export function declarationEntranceRoutes(W){
 assert.ok(Array.isArray(W?.rooms),'Actual registered rooms required');
 return readDeclarationContract().rows.map(({index,target,runtimeInventoryId,rooms:expected})=>{
  const actual=W.rooms.filter(r=>r.furnishingPolicy?.target===target);assert.equal(actual.length,expected.length);
  const rooms=expected.map(e=>{const matches=actual.filter(r=>JSON.stringify(r.min)===JSON.stringify(e.min)&&JSON.stringify(r.max)===JSON.stringify(e.max));assert.equal(matches.length,1,'One actual candidate registration per canonical boundary');return matches[0]});
  const selection=routeSelection[index];
  return{target,runtimeInventoryId,selection,entryRoundTrip:galleryEntryPoints(rooms[selection.entry]),frontage:selection.frontage.map(i=>galleryEntryPoints(rooms[i])[0]),inheritedRiverMaskBlocked:selection.riverMaskBlocked.map(i=>({candidateOrdinal:i,points:galleryEntryPoints(rooms[i])})),allCandidateEntries:rooms.map(room=>({bounds:{min:room.min,max:room.max},floorY:room.floorY,points:galleryEntryPoints(room)}))};
 });
}
