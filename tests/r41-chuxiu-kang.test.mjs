import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {hallSignature} from './lib/r40-hall-signature.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
const config=JSON.parse(readFileSync(new URL('../data/zones/west-six.json',import.meta.url))),item=config.items.find(i=>i.name==='储秀宫'&&i.kind==='hall');
const source='https://www.dpm.org.cn/Uploads/File/2024/07/22/u669dcd8dc5647.pdf';
function fixture(whole=false){const b=new ZoneBase(library(),config);let f;if(whole){b.build();}else({f}=b.buildHall(item));b.kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.kit.colliders);cm.addWalkables(b.kit.walkables);const meshes=[];b.kit.root.traverse(o=>{if(o.userData.role==='chuxiu-restored-kang')meshes.push(o);});return{b,f,cm,meshes};}
test('R41 exactly three restored-display kang contours carry room, cardinal and dated source ownership',()=>{
 const{b,f,meshes}=fixture();assert.equal(meshes.length,3);assert.equal(f.userData.structure.restoredDisplay.source,source);assert.equal(f.userData.structure.restoredDisplay.sourcePage,265);assert.equal(f.userData.structure.restoredDisplay.currentInventoryVerified,false);
 assert.deepEqual(meshes.map(m=>[m.userData.bay,m.userData.side]),[['west-next','north'],['west-next','south'],['west-end','south']]);
 for(const m of meshes){assert.equal(m.userData.source,source);assert.match(m.userData.state,/1982/);assert.match(m.userData.dimensionStatus,/FIT/);assert.ok(m.position.x>0);const box=new THREE.Box3().setFromObject(m);assert.ok(box.max.z<item.z-2-.5||box.min.z>item.z+.4+.5);assert.ok(box.min.z>item.z-5&&box.max.z<item.z+6.9);assert.ok(box.min.y>=item.ph-1e-6&&box.max.y<=item.ph+.451);assert.ok(b.kit.colliders.some(c=>c.min.distanceTo(box.min)<1e-5&&c.max.distanceTo(box.max)<1e-5),'visible contour owns identical collider');}
 assert.equal(b.kit.rooms.length,5);assert.equal(b.kit.mapItems.filter(m=>m.name==='储秀宫').length,1);b.dispose();
});
test('R41 removing only new kang meshes and matching colliders restores entire original Chuxiu signature',()=>{
 const{b,meshes}=fixture();assert.equal(meshes.length,3);for(const m of meshes){const box=new THREE.Box3().setFromObject(m),i=b.kit.colliders.findIndex(c=>c.min.distanceTo(box.min)<1e-5&&c.max.distanceTo(box.max)<1e-5);assert.ok(i>=0);b.kit.colliders.splice(i,1);m.removeFromParent();m.geometry.dispose();}
 const base=JSON.parse(readFileSync(new URL('./fixtures/r41-halls-baseline.json',import.meta.url))).halls['west-six/23'];assert.deepEqual(hallSignature(b.kit),{geometry:base.geometry,navigation:base.navigation});b.dispose();
});
for(const fps of[10,60])test(`R41 full west zone repeats all four Chuxiu apertures and three kang viewpoints at${fps}Hz`,t=>{
 const{b,cm,meshes}=fixture(true);assert.equal(meshes.length,3);const local=[[0,-9],[0,-.8],[-10.8,-.8],[10.8,-.8],[10.8,-2],[10.8,-.8],[5.42,-.8],[5.42,-2],[5.42,-.8],[5.42,2.5],[5.42,-.8],[-10.8,-.8],[10.8,-.8],[0,-.8],[0,-9],[0,-.8],[10.8,-.8],[-10.8,-.8],[0,-.8],[0,-9]],points=local.map(([x,z])=>[item.x+x,item.z+z]),trace=traceTerraceGround(cm,{flights:[]});try{const r=replayTerrace(t,{cm,THREE},points,{fps,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(r.startFeet,0);assert.equal(trace.samples.some(s=>s.source==='rescue'),false);for(const f of r.frames)assert.ok(Number.isFinite(f.feet)&&Number.isFinite(f.ground));}finally{trace.restore();b.dispose();}
});
test('R41 all121 other halls retain independently captured R40 geometry/material/navigation',()=>{
 const old=JSON.parse(readFileSync(new URL('./fixtures/r41-halls-baseline.json',import.meta.url))).halls,seen=[];let count=0;for(const file of readdirSync(new URL('../data/zones/',import.meta.url)).filter(s=>s.endsWith('.json'))){const d=JSON.parse(readFileSync(new URL('../data/zones/'+file,import.meta.url)));for(const[i,it]of d.items.entries()){if(it.kind!=='hall')continue;const key=d.id+'/'+i;seen.push(key);assert.equal(old[key].name,it.name??null);if(key==='west-six/23')continue;const b=new ZoneBase(library(),d);b.buildHall(it);assert.deepEqual(hallSignature(b.kit),{geometry:old[key].geometry,navigation:old[key].navigation},key);b.dispose();count++;}}assert.equal(count,121);assert.deepEqual(seen.sort(),Object.keys(old).sort());
});
