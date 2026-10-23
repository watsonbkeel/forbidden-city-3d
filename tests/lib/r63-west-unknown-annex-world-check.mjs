// Pure existing-W consumer. No production builders, new scene construction,
// collider repair, fixtures, actor creation, or character rebinding.
import fs from 'node:fs';import {createHash} from 'node:crypto';import {gunzipSync} from 'node:zlib';import assert from 'node:assert/strict';import * as THREE from 'three';
import {geometryKeys,boxKey} from './r58-gallery-world-check.mjs';
const deepFreeze=value=>{if(value&&typeof value==='object'){for(const v of Object.values(value))deepFreeze(v);Object.freeze(value)}return value};
export function readWestUnknownAnnexContract(){
 const bytes=fs.readFileSync(new URL('../fixtures/r63-west-unknown-annex-world-contract.json.gz',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'e3aaf5d00785ca7580a2a77a3d866e899e53f3af3dbd1fda3073b5673a812d37','frozen R62 baseline/withheld contract integrity');
 return deepFreeze(JSON.parse(gunzipSync(bytes)));
}
const shape=k=>JSON.stringify(JSON.parse(k)[1]);
export function assertWestUnknownAnnexInventoryInWorld(W){
 assert.ok(W?.scene?.isScene&&W.cm&&Array.isArray(W.rooms),'Supply existing W.scene, W.cm and W.rooms');
 const contract=readWestUnknownAnnexContract(),bounds=contract.halls.map(r=>new THREE.Box3(new THREE.Vector3(...r.bounds[0]),new THREE.Vector3(...r.bounds[1]))),triangles=geometryKeys(W.scene,bounds),shapes=new Set([...triangles.keys()].map(shape)),colliders=new Map();
 for(const c of W.cm.colliders){const k=boxKey(c.box??c);colliders.set(k,(colliders.get(k)??0)+1)}
 const records=[];W.scene.traverse(o=>{if(o.userData.architecture)records.push(...o.userData.architecture);else if(o.userData.structure?.inventoryBinding)records.push(o.userData.structure)});
 let absentTriangles=0,retainedTriangles=0,retainedColliders=0,retainedFloorTriangles=0,absentMeshes=0,absentColliders=0,removedCover=0;
 for(const h of contract.halls){
  const rs=records.filter(r=>r.inventoryBinding===h.target);assert.equal(rs.length,1,h.target+': unique unnamed-shell inventory binding');const r=rs[0];assert.equal(r.id,h.target,h.target+': declaration ID, not invented historical identity');
  for(const [key,value]of Object.entries({inventoryStatus:'UNKNOWN',accepted:false,knownEmpty:false,presetUseStatus:'UNVERIFIED',roomBoundsStatus:'NOT_VALIDATED',furnitureStatus:'UNKNOWN_INVENTORY_WITHHELD_NOT_KNOWN_EMPTY'}))assert.equal(r[key],value,h.target+': explicit evidence '+key);
  const room=W.rooms.filter(r=>r.furnishingPolicy?.target===h.target);assert.equal(room.length,1,h.target+': unique candidate room');
  for(const [key,value]of Object.entries(h.room))assert.deepEqual(room[0][key],value,h.target+': retained room '+key);
  for(const [key,count]of h.removedTriangles){assert.equal(shapes.has(shape(key)),false,h.target+': unsupported generic annex triangle remains');absentTriangles+=count}
  for(const [key,count]of h.retainedFloorTriangles){assert.ok((triangles.get(key)??0)>=count,h.target+': retained floor triangle absent');retainedFloorTriangles+=count}
  for(const [key,count]of h.retainedTriangles){assert.ok((triangles.get(key)??0)>=count,h.target+': retained architecture triangle absent');retainedTriangles+=count}
  for(const key of h.retainedColliders){assert.ok(colliders.get(key)>0,h.target+': retained structure collider absent');retainedColliders++}
  for(const key of h.removedColliders){assert.equal(colliders.get(key)??0,0,h.target+': ghost annex collider');absentColliders++}
  for(const key of h.retainedPlatformColliders)assert.ok(colliders.get(key)>0,h.target+': retained platform collider absent');
  for(const key of h.floorSupports)assert.ok(W.cm.walkables.some(w=>w.type==='box'&&boxKey(w.box)===key),h.target+': retained floor support absent');
  absentMeshes+=h.removedMeshes;removedCover+=h.room.removedCoverCount;
 }
 return {scope:'13_EXACT_UNNAMED_ANNEX_PLACEHOLDERS_WITHHELD_NOT_HISTORICAL_EMPTY_ROOMS_OR_INTERIOR_ACCEPTANCE',halls:13,absentMeshes,absentTriangles,absentColliders,removedCover,retainedTriangles,retainedColliders,retainedFloorTriangles,inventory:'UNKNOWN',presetUse:'UNVERIFIED',roomBounds:'NOT_VALIDATED',geometryQuantizationMeters:.001};
}
/** Exact bounded-controller round trip; works for south/east/west-facing frames.
 * Consumes the retained original room registration, never changes navigation. */
export function westUnknownAnnexEntryPoints(room){
 const door=room?.doors?.[0],dx=(room?.min?.x+room?.max?.x)/2-door?.x,dz=(room?.min?.z+room?.max?.z)/2-door?.z,len=Math.hypot(dx,dz);
 assert.ok(Number.isFinite(len)&&len>0,'Supply a retained room with a finite nonzero door-to-center vector');
 const nx=dx/len,nz=dz/len;
 return [[door.x-nx*3,door.z-nz*3],[door.x+nx*2.2,door.z+nz*2.2],[door.x-nx*3,door.z-nz*3]];
}
