import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const west=JSON.parse(fs.readFileSync('data/zones/west-six.json'));
test('R73 registers independent Yangxin entrance without renaming Zunyi',()=>{
 assert.equal(west.yangxinEntranceProfile,'yangxin-glazed-entrance-photo-fit-r73');
 assert.equal(west.items[0].name,'遵义门');
 assert.deepEqual([west.items[2].x,west.items[2].z,west.items[2].w,west.items[2].d],[108.6,277.5,36,12]);
});
import * as THREE from 'three';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
async function fixture(){
 assert.ok(fs.existsSync('src/scene/palace/special/YangxinCourtEntrance.js'),'dedicated glazed gateway exists');
 const {buildYangxinCourtEntrance,YANGXIN_ENTRANCE:p}=await import('../src/scene/palace/special/YangxinCourtEntrance.js');
 const kit=new CourtKit(library(),'west-six'); const frame=buildYangxinCourtEntrance(kit,west);
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders,'west-six');cm.addWalkables(kit.walkables,'west-six');return{kit,frame,cm,p};
}
test('R73 source-fit masonry portal is clear and full-height sides remain solid',async()=>{
 const {cm,p,kit,frame}=await fixture();
 assert.equal(p.dimensionStatus,'PHOTO_FIT_NOT_SURVEYED');assert.equal(p.accepted,false);
 for(const z of [-.9,0,.9])assert.equal(cm.checkCollision(new THREE.Vector3(p.x,1.9,p.z+z),.5),false);
 for(const y of [1.7,3.7])assert.equal(cm.checkCollision(new THREE.Vector3(p.x+2.6,y,p.z),.5),true);
 assert.equal(kit.mapItems.filter(i=>i.name==='养心门').length,1);
 assert.ok(frame.children.some(m=>m.userData.role==='r73-wood-screen'));
 assert.equal(kit.plaques.length,1);assert.equal(kit.plaques[0].text,'养心门');
 assert.ok(kit.plaques[0].mesh.position.y-p.plaque.height/2>p.opening.height);
 assert.ok(kit.colliders.every(b=>b.min.x>=p.x-p.totalWidth/2-1 && b.max.x<=p.x+p.totalWidth/2+1));
});
test('R73 independent wood screen has central opening and two bypasses',async()=>{
 const {cm,p}=await fixture();for(const x of [0,-p.woodScreen.width/2-1,p.woodScreen.width/2+1]){
 assert.equal(cm.checkCollision(new THREE.Vector3(p.x+x,1.8,p.z+p.woodScreen.offsetZ),.5),false);
 }
 assert.equal(cm.checkCollision(new THREE.Vector3(p.x+2,1.8,p.z+p.woodScreen.offsetZ),.5),true);
});
test('R73 rejects invalid profile before allocating geometry',async()=>{
 await fixture();const {buildYangxinCourtEntrance}=await import('../src/scene/palace/special/YangxinCourtEntrance.js');
 const kit=new CourtKit(library(),'bad');assert.throws(()=>buildYangxinCourtEntrance(kit,{...west,id:'bad'}),/Yangxin/);assert.equal(kit.root.children.length,0);
});
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
test('R73 actual merged west-six lifecycle retains one gate and releases new materials',()=>{
 const z=new ZoneBase(library(),west);const r=z.build();assert.ok(r.group.userData.architecture.some(a=>a.id==='west-six/yangxin-entrance'&&a.dimensionStatus==='PHOTO_FIT_NOT_SURVEYED'));assert.equal(r.mapItems.filter(i=>i.name==='养心门').length,1);
 const materials=z.kit.owned.filter(m=>m.name.startsWith('r73-yangxin-'));assert.equal(materials.length,5);
 let disposed=0;materials.forEach(m=>m.addEventListener('dispose',()=>disposed++));z.dispose();assert.equal(disposed,5);assert.equal(z.group,null);
 const second=new ZoneBase(library(),west);const r2=second.build();assert.equal(r2.mapItems.filter(i=>i.name==='养心门').length,1);assert.equal(r2.colliders.length,r.colliders.length);second.dispose();
});
