import './lib/inner-palace-fixture.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';import {CollisionManager} from '../src/utils/Collision.js';
import {library,hash,serial} from './lib/inner-palace-fixture.mjs';import {applyFengxianFrontWindows} from '../src/scene/palace/special/FengxianFrontWindows.js';import {replayTerrace} from './lib/terrace-walk.mjs';
const cfg=JSON.parse(fs.readFileSync(new URL('../data/zones/east-six.json',import.meta.url))),baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/r62-e/east-six-r61.json',import.meta.url))),item=cfg.items[53];
const now=new ZoneBase(library(),cfg),old=new ZoneBase(library(),baseline),f=now.buildHall(item).f,previous=old.buildHallBaseline(baseline.items[53]).f;
f.updateMatrixWorld(true);previous.updateMatrixWorld(true);
const nav=z=>({walkables:z.kit.walkables,map:z.kit.mapItems,rooms:z.kit.rooms});
const sig=m=>hash({p:m.position.toArray(),q:m.quaternion.toArray(),scale:m.scale.toArray(),mat:m.material?.name??null,attrs:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),index:m.geometry.index?[...m.geometry.index.array]:null});
test.after(()=>{now.kit.dispose(f);old.kit.dispose(previous);});
test('only exact front declaration differs; rear hall and other 55 declarations remain R61',()=>{
 const a=structuredClone(cfg),b=structuredClone(baseline);a.items[53]=b.items[53];assert.deepEqual(a,b);
 const allowed=['layers','bays','baysSource','baySpacingStatus'],n={...item};for(const k of allowed)delete n[k];const o={...baseline.items[53]};for(const k of allowed)delete o[k];assert.deepEqual(n,o);assert.equal(item.layers,2);assert.equal(item.bays,9);assert.equal(item.throne,false);assert.equal(item.interior,'empty');
});
test('actual front/back column rows contain nine bays, not just metadata',()=>{
 const cols=f.children.filter(m=>m.geometry?.type==='CylinderGeometry');assert.equal(cols.length,20);for(const z of[-item.d/2,item.d/2]){const row=cols.filter(m=>Math.abs(m.position.z-z)<1e-7).sort((a,b)=>a.position.x-b.position.x);assert.equal(row.length,10);for(let k=0;k<row.length;k++)assert.ok(Math.abs(row[k].position.x-(-item.w/2+k*item.w/9))<1e-7);}
 const roof=f.children.find(m=>m.userData.doubleEaveMountingBand);assert.ok(roof);assert.ok(roof.userData.doubleEaveMountingBand.upperY>roof.userData.doubleEaveMountingBand.lowerY);
 const ray=new THREE.Raycaster(new THREE.Vector3(item.x,40,item.z),new THREE.Vector3(0,-1,0));assert.ok(ray.intersectObject(roof,true).some(h=>h.object.material.name==='roof_tile'));
});
test('four real raised windows / four closed middle doors / one open centre, with physical body boundary',()=>{
 const fields=f.userData.fengxianFrontWindows.fields;assert.deepEqual(fields.map(x=>x.bay),[0,1,7,8]);assert.equal(f.children.filter(m=>m.userData.fengxianFrontSill).length,4);
 for(const field of fields){const panel=f.children.find(m=>m.userData.fengxianFrontWindow?.bay===field.bay),b=new THREE.Box3().setFromObject(panel);assert.ok(Math.abs(b.min.y-(item.ph+1.05))<1e-6);assert.ok(Math.abs(b.max.y-field.topY)<1e-6);const hit=new THREE.Raycaster(new THREE.Vector3(item.x+field.x,item.ph+.5,item.z-item.d/2-1),new THREE.Vector3(0,0,1),0,2).intersectObject(f,true)[0];assert.ok(hit?.object.userData.fengxianFrontSill);}
 const cm=new CollisionManager();cm.rivers=[];cm.addColliders(now.kit.colliders);cm.addWalkables(now.kit.walkables);
 for(let k=0;k<9;k++){const x=item.x-item.w/2+(k+.5)*item.w/9;assert.equal(cm.checkCollision(new THREE.Vector3(x,item.ph+1.7,item.z-item.d/2),.45),k!==4);}
});
test('platform/floor/ceiling and walls retain R61; central stair width change is explicit and bounded',()=>{
 assert.deepEqual(now.kit.walkables.filter(w=>w.type==='box'),old.kit.walkables.filter(w=>w.type==='box'));const nr=now.kit.walkables.find(w=>w.type==='ramp'),or=old.kit.walkables.find(w=>w.type==='ramp');assert.ok(Math.abs((or.maxX-or.minX)-3.682)<1e-7);assert.ok(Math.abs((nr.maxX-nr.minX)-4.6)<1e-7);assert.deepEqual({...nr,minX:or.minX,maxX:or.maxX},or);assert.deepEqual(now.kit.mapItems,old.kit.mapItems);
 for(const k of['minX','maxX','minZ','maxZ','floorY','ceilingY','y','height','kind'])assert.deepEqual(now.kit.rooms[0][k],old.kit.rooms[0][k]);
 const retained=m=>m.isMesh&&m.geometry.type!=='CylinderGeometry'&&m.position.z>=-(item.d+2*item.pad)/2&&!(m.position.z<0&&m.position.y>item.ph+.1);
 const a=f.children.filter(retained).map(sig).sort(),b=previous.children.filter(retained).map(sig).sort();assert.deepEqual(a,b);
 for(const solid of old.kit.colliders.filter(b=>b.max.y<=item.ph||(b.max.x-b.min.x)>item.w*.9||(b.max.z-b.min.z)>item.d*.9))assert.ok(now.kit.colliders.some(b=>hash(serial(b))===hash(serial(solid))));
});
test('whole registered plaque/frame fit actual upper/lower roof surfaces with unchanged original size cap',()=>{
 const p=now.kit.plaques.find(p=>p.text==='奉先殿'),r=p.frame.userData.hallNameboardMount,box=new THREE.Box3().setFromObject(p.frame);assert.equal(r.name,'奉先殿');assert.equal(r.surfaceProbes,12);assert.ok(r.sizeScale>=.7&&r.sizeScale<=1);assert.ok(box.min.y>=r.lowerY+.03-1e-5);assert.ok(box.max.y<=r.upperY-.03+1e-5);assert.ok(p.frame.position.y>item.ph+item.colH);assert.ok(p.mesh.position.z<p.frame.position.z);assert.equal(p.frame.userData.hallNameboardMount.source,'https://www.dpm.org.cn/explore/building/236430.html');
});
test('exact binding rejects drift/duplicates; unrelated halls have no state changes',()=>{
 for(const patch of[{bays:15},{layers:1},{x:item.x+1},{d:item.d+.1}])assert.throws(()=>applyFengxianFrontWindows(now.kit,'east-six',{...item,...patch},{f}),/mismatch/);
 assert.throws(()=>applyFengxianFrontWindows(now.kit,'east-six',item,{f}),/twice/);const before=JSON.stringify(f.userData);assert.equal(applyFengxianFrontWindows(now.kit,'west-six',item,{f}),false);assert.equal(JSON.stringify(f.userData),before);
});
test('bounded actual geometry, unknown ritual inventory and inherited texture limits stay explicit',()=>{
 let tris=0;f.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position;for(const v of p.array)assert.ok(Number.isFinite(v));tris+=(m.geometry.index?.count??p.count)/3;});assert.ok(tris<4000);assert.equal(now.kit.rooms.length,1);assert.equal(now.kit.rooms[0].kind,'empty');assert.equal(f.children.filter(m=>m.userData.role==='retained-throne-component').length,0);assert.equal(f.userData.fengxianFrontWindows.accepted,false);assert.match(f.userData.fengxianFrontWindows.residual,/not a faithful/);
});
const cm=new CollisionManager();cm.rivers=[];cm.addColliders(now.kit.colliders);cm.addWalkables(now.kit.walkables);const W={THREE,cm};
for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`actual central stair/door/room round trip ${fps}/${sprint}/${backward}`,t=>{
 const z=item.z-item.d/2,points=[[item.x,z-6],[item.x,z-2.1],[item.x,z+.9],[item.x,item.z],[item.x,z+.9],[item.x,z-2.1],[item.x,z-6]];const r=replayTerrace(t,W,points,{fps,sprint,backward,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({stuckAt:r.stuckAt,end:r.end}));assert.equal(r.startFeet,0);assert.ok(r.maxFeet>=item.ph);assert.ok(Math.abs(r.end[2])<1e-7);for(const p of r.frames)assert.equal(cm.checkCollision(new THREE.Vector3(p.x,p.ground+1.7,p.z),.45),false);
});
