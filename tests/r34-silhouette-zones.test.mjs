import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {buildSilhouette} from '../src/render/SilhouetteBuilder.js';
import {library} from './lib/inner-palace-fixture.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
function expandedBytes(geometry){const p=geometry.attributes.position,index=geometry.index,result=new Float32Array((index?.count??p.count)*3);for(let i=0;i<result.length/3;i++){const n=index?index.getX(i):i;result.set(p.array.subarray(n*3,n*3+3),i*3);}return Buffer.from(result.buffer);}
function sourceFingerprint(root){const chunks=[];root.traverse(o=>{if(!o.isMesh)return;for(const a of Object.values(o.geometry.attributes))chunks.push(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));if(o.geometry.index)chunks.push(Buffer.from(o.geometry.index.array.buffer));});return sha(Buffer.concat(chunks));}
for(const file of fs.readdirSync(new URL('../data/zones/',import.meta.url)).filter(f=>f.endsWith('.json')))test(`${file}: every far triangle stays bit exact and source geometry is untouched`,()=>{
 const config=JSON.parse(fs.readFileSync(new URL('../data/zones/'+file,import.meta.url))),builder=new ZoneBase(library(),config),data=builder.build();
 data.group.updateMatrixWorld(true);const before=sourceFingerprint(data.group),expected=[];
 data.group.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||!/roof_tile|kit_roof/.test(o.material.name))return;const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);expected.push(expandedBytes(geometry));geometry.dispose();});
 const mesh=buildSilhouette(data.group);
 assert.ok(mesh);assert.equal(sha(expandedBytes(mesh.geometry)),sha(Buffer.concat(expected)));
 assert.equal(sourceFingerprint(data.group),before);
 assert.equal(mesh.material.type,'MeshBasicMaterial');assert.equal(mesh.material.color.getHex(),0xb58c36);assert.equal(mesh.material.fog,true);
 assert.equal(mesh.visible,false);assert.equal(mesh.castShadow,false);assert.equal(mesh.receiveShadow,false);assert.equal(mesh.renderOrder,0);assert.equal(mesh.userData.noMerge,true);
 assert.deepEqual(Object.keys(mesh.geometry.attributes),['position']);assert.equal(mesh.geometry.drawRange.start,0);assert.equal(mesh.geometry.drawRange.count,Infinity);
 let geometryDisposals=0,materialDisposals=0;mesh.geometry.addEventListener('dispose',()=>geometryDisposals++);mesh.material.addEventListener('dispose',()=>materialDisposals++);
 builder.dispose();assert.equal(geometryDisposals,0);assert.equal(materialDisposals,0,'source zone must not own silhouette');
 mesh.geometry.dispose();mesh.material.dispose();assert.equal(geometryDisposals,1);assert.equal(materialDisposals,1);
});
