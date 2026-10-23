// Pure already-built-W consumer; no constructors, load, mutation, or recovery.
import fs from 'node:fs';import {gunzipSync} from 'node:zlib';import assert from 'node:assert/strict';import * as THREE from 'three';
import {geometryKeys,boxKey,galleryEntryPoints,runGalleryControllerRoute} from './r58-gallery-world-check.mjs';
export {galleryEntryPoints,runGalleryControllerRoute};
export const readNansansuoContract=()=>JSON.parse(gunzipSync(fs.readFileSync(new URL('../fixtures/r59-nansansuo-inventory-world-contract.json.gz',import.meta.url))));
export function assertNansansuoInventoryInWorld(W){
 assert.ok(W?.scene?.isScene&&W.cm&&Array.isArray(W.rooms));const contract=readNansansuoContract();assert.equal(contract.schema,'r59-nansansuo-unknown-contract-v1');
 const bounds=contract.rows.map(r=>new THREE.Box3(new THREE.Vector3(...r.bounds.min),new THREE.Vector3(...r.bounds.max))),keys=geometryKeys(W.scene,bounds),shapes=new Set([...keys.keys()].map(k=>JSON.stringify(JSON.parse(k)[1]))),cols=new Map();for(const c of W.cm.colliders){const k=boxKey(c.box??c);cols.set(k,(cols.get(k)??0)+1)}
 let retainedTriangles=0,absentTriangles=0,absentColliders=0;
 for(const r of contract.rows){const rooms=W.rooms.filter(q=>q.furnishingPolicy?.target===r.target);assert.equal(rooms.length,1,r.target+': unique room declaration');const {id,...room}=rooms[0];assert.deepEqual(room,r.rooms[0]);
  for(const [key,count]of r.retainedTriangles){assert.ok((keys.get(key)??0)>=count,r.target+': retained source triangle absent');retainedTriangles+=count}
  for(const [key,count]of r.removedTriangles){assert.equal(shapes.has(JSON.stringify(JSON.parse(key)[1])),false,r.target+': unsupported prop still submitted');absentTriangles+=count}
  for(const key of r.retainedColliders)assert.ok(cols.get(key)>0,r.target+': retained structural collider absent');
  for(const key of r.removedColliders){assert.equal(cols.get(key)??0,0,r.target+': ghost furniture collider');absentColliders++}
  for(const key of r.walkables)assert.ok(W.cm.walkables.some(w=>w.type==='box'&&boxKey(w.box)===key),r.target+': retained support absent');
 }
 return{scope:'UNKNOWN_INVENTORY_NOT_HISTORICAL_EMPTY_ROOM_OR_BROWSER_ACCEPTANCE',rooms:6,retainedTriangles,absentTriangles,absentColliders,geometryToleranceMeters:.001};
}
