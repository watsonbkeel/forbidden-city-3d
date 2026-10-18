import {TAIHE_PLAQUE_FRAME}from'../src/scene/palace/special/TaihePlaqueFrame.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import fs from 'node:fs';
import {captureTaiheControl,hash} from './lib/taihe-core-fixture.mjs';
import {TAIHE_CORE as P} from '../src/scene/palace/special/TaiheCoreProfile.js';
const capture=()=>captureTaiheControl('太和殿');
const tris=m=>(m.geometry.index?.count??m.geometry.attributes.position.count)/3;
test('six central bay beams have real side and underside faces, staying in the existing 18000 loaded-core allowance',()=>{
 const {builder,group}=capture();const beams=group.children.filter(o=>o.userData.taihePermanent==='central-beam');
 assert.equal(beams.length,6);assert.equal(beams.reduce((n,m)=>n+tris(m),0),60);
 const cfg=JSON.parse(fs.readFileSync(new URL('../data/interiors/taihe.json',import.meta.url)));const bytes=fs.readFileSync(new URL('../public'+cfg.model,import.meta.url));const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());const assetTris=gltf.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+gltf.accessors[p.indices].count/3,0);assert.equal(assetTris,17924);assert.ok(assetTris+TAIHE_PLAQUE_FRAME.addedTriangles-TAIHE_PLAQUE_FRAME.removedTriangles+60<=P.budgets.sVisibleTriangles);
 for(const mesh of beams){const a=mesh.geometry.attributes;assert.equal(tris(mesh),10);assert.ok([...a.position.array].every(Number.isFinite));assert.ok([...a.uv.array].every(Number.isFinite));assert.ok([...a.normal.array].every(Number.isFinite));assert.equal(mesh.castShadow,true);assert.equal(mesh.receiveShadow,true);for(let i=0;i<a.normal.count;i++)assert.ok(a.normal.getY(i)<.99,'only concealed upper faces omitted');}
 builder.dispose();
});
test('beam stations follow retained columns without crossing the unchanged caisson opening or plaque',()=>{
 const {builder,group}=capture();const beams=group.children.filter(o=>o.userData.taihePermanent==='central-beam');assert.equal(beams.length,6);
 const opening=new THREE.Box3(new THREE.Vector3(-3,P.frame.floorY+8.5,P.caisson.z-3),new THREE.Vector3(3,P.frame.floorY+P.caisson.topY,P.caisson.z+3));
 const plaque=new THREE.Box3(new THREE.Vector3(-P.plaque.width/2,P.frame.floorY+P.plaque.bottomY,P.plaque.z-.08),new THREE.Vector3(P.plaque.width/2,P.frame.floorY+P.plaque.bottomY+P.plaque.height,P.plaque.z+.08));
 for(const m of beams){const b=new THREE.Box3().setFromObject(m);assert.ok(!b.intersectsBox(opening));assert.ok(!b.intersectsBox(plaque));assert.ok(Math.abs(b.max.y-(P.frame.floorY+P.ceilingY))<1e-5);assert.ok(b.min.y>P.frame.floorY+8.69);assert.ok(m.material===builder.library.material('caihua_beam'));}
 const transverse=beams.filter(o=>o.userData.taiheBeamDirection==='transverse');assert.deepEqual(transverse.map(o=>o.position.z),[P.columns.redCompanionZ,...P.columns.goldZ]);
 const longitudinal=beams.filter(o=>o.userData.taiheBeamDirection==='longitudinal');assert.deepEqual(longitudinal.map(o=>o.position.x),P.columns.x);builder.dispose();
});
test('beam builder itself never registers collision or walkable geometry',async()=>{
 const {buildTaiheBeamFrame}=await import('../src/scene/palace/special/TaiheBeamFrame.js');
 const {builder}=capture();const before=hash({colliders:builder.colliders,walkables:builder.walkables});
 const group=new THREE.Group();buildTaiheBeamFrame(builder,group,{x0:0,z0:0,y:9.9375});
 assert.equal(hash({colliders:builder.colliders,walkables:builder.walkables}),before);
 assert.equal(group.children.filter(o=>o.userData.taihePermanent==='central-beam').length,6);builder.dispose();
});
test('beam material reuses the hall batch; exact additive source restoration rejects an unscoped change',async()=>{
 const {mergeByMaterial}=await import('../src/utils/MergeUtils.js');const {restorePreR7Beams}=await import('./lib/r7-taihe-beam-retention.mjs');
 const {builder,group}=capture(),beams=group.children.filter(o=>o.userData.taihePermanent==='central-beam'),mat=beams[0].material;
 assert.ok(group.children.some(o=>!beams.includes(o)&&o.isMesh&&o.material===mat));const merged=mergeByMaterial(group);assert.equal(merged.children.filter(o=>o.material===mat).length,1);
 const path='src/scene/palace/special/TaiheCore.js',bytes=fs.readFileSync(new URL('../'+path,import.meta.url)),delta=JSON.parse(fs.readFileSync(new URL('./fixtures/r7-taihe-beam-source-delta.json',import.meta.url)));
 assert.equal(hash(restorePreR7Beams(path,bytes).toString()),delta.baselineSHA256);assert.throws(()=>restorePreR7Beams(path,Buffer.concat([bytes,Buffer.from('\n')])));builder.dispose();
});
