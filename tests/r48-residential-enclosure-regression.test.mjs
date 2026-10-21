import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { CourtKit } from '../src/scene/palace/kit.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { CollisionManager } from '../src/utils/Collision.js';
import { resolveRemainingProfile, buildRemainingHall } from '../src/scene/palace/special/RemainingResidentialHalls.js';
const scope=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/residential-scope.json',import.meta.url)));
function fixture(name){const row=scope.find(r=>r.name===name),item=structuredClone(row.baselineItem),p=resolveRemainingProfile(row.zone,item),kit=new CourtKit(library(),row.zone),built=buildRemainingHall(kit,item,p);kit.root.updateMatrixWorld(true);return{item,p,kit,...built};}
for(const name of ['翊坤宫后殿','太极殿']){
 test(`R48 ${name} removes actual old side-wall vertices instead of relying on lost BoxGeometry parameters`,()=>{const{item,p,kit,f}=fixture(name),red=kit.lib.material('wall_red'),rear=item.z+item.d/2-p.rearInset;const walls=f.children.filter(o=>o.isMesh&&o.material===red&&Math.abs(Math.abs(o.position.x)-item.w/2)<1e-6);assert.equal(walls.length,2,'one side wall per side, no ghost full-depth walls');for(const m of walls){const b=new THREE.Box3().setFromObject(m);assert.ok(b.max.z<=rear+1e-5,`actual side-wall vertex reaches ${b.max.z}, beyond recessed plane ${rear}`);}});
 test(`R48 ${name} final merged rear porch has clear visible and collidable lateral passage`,()=>{const{item,p,kit}=fixture(name),cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);const merged=kit.finish();merged.updateMatrixWorld(true);const z=item.z+item.d/2-p.rearInset/2,y=item.ph+1.7;for(const s of[-1,1]){const x=item.x+s*item.w/2;assert.equal(cm.checkCollision(new THREE.Vector3(x,y,z)),false);const ray=new THREE.Raycaster(new THREE.Vector3(x-s*1.0,y,z),new THREE.Vector3(s,0,0),0,2);const hits=ray.intersectObject(merged,true);assert.equal(hits.length,0,`visible obstruction at rear side ${s}`);}kit.dispose(merged);});
}
test('R48 Tihe rear threshold moves with its real recessed rear door',()=>{const{item,p,kit,f}=fixture('翊坤宫后殿'),wood=kit.lib.material('wood_column');const thresholds=f.children.filter(o=>{if(!o.isMesh||o.material!==wood)return false;o.geometry.computeBoundingBox();const size=o.geometry.boundingBox.getSize(new THREE.Vector3());return Math.abs(size.y-.22)<1e-5&&Math.abs(size.z-.3)<1e-5;});assert.equal(thresholds.length,2);assert.ok(thresholds.some(o=>Math.abs(o.position.z-(item.d/2-p.rearInset))<1e-6));assert.equal(thresholds.some(o=>Math.abs(o.position.z-item.d/2)<1e-6),false);});
