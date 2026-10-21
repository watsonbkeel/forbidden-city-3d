import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
const configs=['east-six','west-six'].map(id=>JSON.parse(readFileSync(new URL(`../data/zones/${id}.json`,import.meta.url))));
const targets=configs.flatMap(c=>c.items.filter(i=>i.rearHallProfile).map(i=>[c,i]));
test('R39 independent: six source-selected roofs close both gable planes, including rake, soffit and ridge, in merged geometry',()=>{
 assert.equal(targets.length,6);
 for(const [c,item] of targets){const b=new ZoneBase(library(),c),{f}=b.buildHall(item),roof=f.children.find(x=>x.userData.hardGableEnd);assert.ok(roof);roof.updateMatrixWorld(true);const wall=[];
 roof.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){assert.ok(Number.isFinite(a.getX(i))&&Number.isFinite(a.getY(i))&&Number.isFinite(a.getZ(i)));assert.ok(Math.abs(a.getX(i))<=item.w/2+1e-5,`${item.rearHallProfile} ${o.material.name} oversails end plane`);}if(o.material.name==='wall_red')wall.push(o);});
 assert.ok(wall.length>0);for(const side of[-1,1]){let planeVertices=0;for(const o of wall){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){assert.ok(Math.abs(Math.abs(a.getX(i))-item.w/2)<1e-5,'gable and rake must share end planes');if(Math.sign(a.getX(i))===side)planeVertices++;}}assert.ok(planeVertices>12,'both gable ends have surfaces, not labels alone');}
 const roofMeshes=[];roof.traverse(o=>{if(o.isMesh)roofMeshes.push(o);});const tile=roofMeshes.find(o=>o.material.name==='roof_tile');assert.ok(tile);const before=new THREE.Box3().setFromObject(tile),mat=tile.material;const merged=b.kit.finish();merged.updateMatrixWorld(true);const after=new THREE.Box3();merged.traverse(o=>{if(o.isMesh&&o.material===mat)after.union(new THREE.Box3().setFromObject(o));});assert.ok(before.min.distanceTo(after.min)<1e-4&&before.max.distanceTo(after.max)<1e-4,'final zone merge retains source-selected roof bounds');b.kit.dispose(merged);
 }
});
test('R39 independent: unrelated Jingyang rear roof remains xieshan and has no hard-gable profile',()=>{
 const c=configs.find(c=>c.id==='east-six');
 const candidates=c.items.filter(i=>i.kind==='hall'&&i.x < -130&&i.z>440&&i.z<480);assert.equal(candidates.length,1);const rear=candidates[0];assert.equal(rear.roof,'xieshan');assert.equal(rear.rearHallProfile,undefined);const b=new ZoneBase(library(),c),{f}=b.buildHall(rear);assert.equal(f.children.some(o=>o.userData.hardGableEnd),false);b.kit.dispose(b.kit.root);
});
