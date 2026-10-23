// Pure existing-W consumer. No ZoneBase, world builder, geometry repair or actor creation.
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {solidMaterialNameAt} from '../../src/render/SolidMaterialBatch.js';
import {PLAYER} from '../../src/config/constants.js';
import {createPhysicalWaypointDriver} from './physical-waypoints.mjs';
export const contractURL=new URL('../fixtures/r61-d/gallery-world-contract.json.gz',import.meta.url);
import {geometryKeys,boxKey} from './r58-gallery-world-check.mjs';
const shapeKey=key=>JSON.stringify(JSON.parse(key)[1]);
export function assertInnerGalleryInventoryInWorld(W){
 assert.ok(W?.scene?.isScene&&W.cm&&Array.isArray(W.rooms),'Supply actual existing scene, collision manager and room registrations; no reconstruction fallback');
 const contract=JSON.parse(gunzipSync(fs.readFileSync(contractURL)));assert.equal(contract.schema,'r61-inner-gallery-unknown-contract-v1');const bounds=contract.rows.map(r=>new THREE.Box3(new THREE.Vector3(...r.bounds.min),new THREE.Vector3(...r.bounds.max))),keys=geometryKeys(W.scene,bounds),shapes=new Set([...keys.keys()].map(shapeKey)),colliders=new Map();
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
