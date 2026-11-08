import {legacyPhysicsView} from '../r177-dafotang-layout/physics-view.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import * as T from 'three';
import {createCanvas} from '@napi-rs/canvas';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {buildRemainingHall,resolveRemainingProfile} from '../../src/scene/palace/special/RemainingOuterHalls.js';
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function upward(mesh, low=.89, high=.91){const a=mesh.geometry.attributes.position,idx=mesh.geometry.index,result=[];for(let i=0;i<(idx?.count??a.count);i+=3){const p=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(a,idx?idx.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld));const tri=new T.Triangle(...p);if(tri.getNormal(new T.Vector3()).y>.99999&&p.every(v=>v.y>low&&v.y<high))result.push(p.map(v=>v.toArray()));}return result;}
function physics(kit){kit=legacyPhysicsView(kit);return hash({colliders:kit.colliders.map(c=>({min:c.min.toArray(),max:c.max.toArray(),triangle:c.triangleSupport?{id:c.triangleSupport.id.replace(/\/[\da-f-]{36}$/, ''),offset:c.triangleSupport.offset.toArray(),triangles:c.triangleSupport.template.triangles.map(t=>[t.triangle.a.toArray(),t.triangle.b.toArray(),t.triangle.c.toArray()])}:null})),walkables:kit.walkables,rooms:kit.rooms,regions:kit.regions,mapItems:kit.mapItems});}
// Independent frozen ba42917 single-host receipt, generated before the fix.
const expectedPhysics='e0054a4bbcbb05825b9a2d6ca0dcfd9c8b1d6c4132a93742cda1d3c26fe19cb6';
test('Dafotang stair landing retains one visible top and the exact original physics after merge',()=>{
 const oldDocument=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1)};
 const lib=realTextureLibrary(),kit=new CourtKit(lib,'outer-west');let merged;
 try{const item=JSON.parse(fs.readFileSync('data/zones/outer-west.json')).items.find(i=>i.name==='大佛堂');const built=buildRemainingHall(kit,item,resolveRemainingProfile('outer-west',item));kit.root.updateMatrixWorld(true);
 const band=built.f.children.find(m=>m.isMesh&&m.material===lib.material('sumeru_band'));
 const slab=built.f.children.find(m=>m.isMesh&&m.material===lib.material('stone_slab'));
 assert.equal(upward(band).length,0,'hidden band top must not fight the visible slab');assert.equal(upward(slab).length,2);
 assert.equal(band.geometry.index.count,30,'only two of the twelve band triangles removed');
 assert.equal(physics(kit),expectedPhysics);assert.deepEqual([legacyPhysicsView(kit).colliders.length,kit.walkables.length,kit.rooms.length],[366,2,1]);
 merged=kit.finish();merged.updateMatrixWorld(true);const rows=[];merged.traverse(m=>{if(m.isMesh&&[lib.material('sumeru_band'),lib.material('stone_slab')].includes(m.material))rows.push(...upward(m));});assert.equal(rows.length,2,'merged landing has a single covering surface');assert.equal(physics(kit),expectedPhysics);
 }finally{kit.dispose(merged);lib.dispose();globalThis.document=oldDocument;}
});
