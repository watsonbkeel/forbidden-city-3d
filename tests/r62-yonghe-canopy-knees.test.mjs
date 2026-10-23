import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import * as THREE from 'three';
import {fixture,liveFixture,meshes,ROLE,item,snapshot,audit,kneeMeshHealth} from './lib/r62-yonghe-knees-qa.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
import {PLAYER} from '../src/config/constants.js';
import {replayTerrace} from './lib/terrace-walk.mjs';
const url=new URL('../src/scene/palace/special/YongheCanopyKnees.js',import.meta.url),api=existsSync(url)?await import(url):{};
function add(f){assert.equal(typeof api.buildYongheCanopyKnees,'function','bounded Yonghe knee helper must exist');return api.buildYongheCanopyKnees(f.kit,f.frame,item);}
function collision(f){const cm=new CollisionManager();cm.rivers=[];cm.addColliders(f.kit.colliders);cm.addWalkables(f.kit.walkables);return cm;}
test('actual original builder has no old knee profile; six closed additions leave every old mesh and registration exact',()=>{
 const f=fixture();try{assert.equal(meshes(f.frame).filter(m=>m.userData.role===ROLE).length,0);const before=snapshot(f);const knees=add(f);assert.equal(knees.length,6);assert.deepEqual(snapshot(f),before);assert.equal(meshes(f.frame).filter(m=>m.userData.role==='yonghe-canopy-column').length,4);assert.equal(meshes(f.frame).filter(m=>m.userData.role==='yonghe-curved-rafter').length,208);
 for(const m of knees){assert.equal(m.material.map,null);assert.equal(m.material.side,THREE.FrontSide);assert.equal(m.material.emissive.getHex(),0);assert.ok(m.castShadow&&m.receiveShadow);assert.match(m.userData.dimensionStatus,/FIT_NOT_SURVEYED/);assert.equal(m.userData.captureDate,null);assert.match(m.userData.patternStatus,/UNKNOWN/);}
 }finally{f.dispose();}
});
test('actual triangle bounds separate every new knee from every original mesh with no beam or column penetration',()=>{
 const f=fixture();try{add(f);const a=audit(f);assert.equal(a.count,6);assert.equal(a.positiveVolumeAabbIntersectionsWithRetained.length,0,JSON.stringify(a.positiveVolumeAabbIntersectionsWithRetained));assert.ok(a.lowestY-item.ph>5.3);for(const h of a.health){assert.ok(h.finite&&h.closed);assert.ok(h.signedVolume>0);assert.ok(h.minArea>1e-7);assert.ok(h.triangles>=30&&h.triangles<=100);}
 }finally{f.dispose();}
});
test('paired shoulders are mirrored, curved at their underside, and keep each bay center open',()=>{
 const f=fixture();try{const knees=add(f);f.frame.updateMatrixWorld(true);for(let bay=0;bay<3;bay++){const pair=knees.filter(m=>m.userData.bay===bay);assert.equal(pair.length,2);const boxes=pair.map(m=>new THREE.Box3().setFromObject(m));assert.ok(boxes[1].min.x-boxes[0].max.x>3);const center=(boxes[0].min.x+boxes[1].max.x)/2;assert.ok(Math.abs((boxes[0].max.x+boxes[1].min.x)/2-center)<1e-5);}
 const knee=knees[0],x=knee.position.x,top=knee.position.y;
 const hit=(u,drop)=>new THREE.Raycaster(f.frame.localToWorld(new THREE.Vector3(x+u,top-drop,-8.6)),new THREE.Vector3(0,0,1),0,1).intersectObject(knee).length>0;
 for(const [u,inside,outside]of[[.08,.43,.58],[.43,.26,.46],[.83,.04,.21]]){assert.equal(hit(u,inside),true);assert.equal(hit(u,outside),false);}
 assert.equal(hit(.43,.33),true,'middle droop is not a straight triangular wedge');
 }finally{f.dispose();}
});
test('identity, missing or moved hosts, and duplicates fail before any mesh or material allocation',()=>{
 assert.equal(typeof api.buildYongheCanopyKnees,'function');
 for(const patch of[{name:'钟粹宫'},{x:0},{w:30},{ph:1},{colH:7},{facadeProfile:'wrong'},{rot:.1}]){const f=fixture();try{const before=snapshot(f),owned=f.kit.owned.length;assert.throws(()=>api.buildYongheCanopyKnees(f.kit,f.frame,{...item,...patch}),/Yonghe canopy knees/);assert.deepEqual(snapshot(f),before);assert.equal(f.kit.owned.length,owned);}finally{f.dispose();}}
 for(const role of['yonghe-canopy-column','yonghe-canopy-front-beam']){const f=fixture();try{const host=meshes(f.frame).find(m=>m.userData.role===role);host.position.y+=.2;const before=snapshot(f),owned=f.kit.owned.length;assert.throws(()=>add(f),/host/);assert.deepEqual(snapshot(f),before);assert.equal(f.kit.owned.length,owned);}finally{f.dispose();}}
 const f=fixture();try{add(f);const n=f.kit.owned.length;assert.throws(()=>add(f),/already/);assert.equal(f.kit.owned.length,n);assert.throws(()=>api.buildYongheCanopyKnees(f.kit,new THREE.Group(),item),/host/);}finally{f.dispose();}
});
for(const fps of[10,60])test(`one local production hall retains real controller canopy and room traversal at ${fps} Hz`,t=>{
 const f=fixture();try{const before=snapshot(f);add(f);const cm=collision(f),points=[[0,-11.3],[0,-7.3],[-7,-7.3],[7,-7.3],[0,-7.3],[0,-2],[0,-11.3],[0,-2],[0,-11.3]].map(([x,z])=>[item.x+x,item.z+z]);const r=replayTerrace(t,{cm,THREE},points,{fps,sprint:false,recordFrames:true});assert.equal(r.arrived,true);assert.deepEqual(snapshot(f),before);}finally{f.dispose();}
});
for(const fps of[10,60])test(`repeated real standing jumps never reach the added overhead solids at ${fps} Hz`,t=>{
 const f=fixture(),oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{};globalThis.document={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.window={addEventListener:noop,removeEventListener:noop};let now=0;const clock=t.mock.method(performance,'now',()=>now);
 try{add(f);const cm=collision(f),lowest=audit(f).lowestY;for(const x of[-7.5,-2,2,7.5]){const camera=new THREE.PerspectiveCamera(),controls=new FirstPersonControls(camera,{ownerDocument:globalThis.document,addEventListener:noop,removeEventListener:noop},cm);controls.controls.isLocked=true;controls.setPosition(item.x+x,item.ph+PLAYER.HEIGHT,item.z-8.2);let maxFeet=item.ph;try{for(let i=0;i<fps*5;i++){if(i===fps||i===fps*3)controls.jump();now+=1000/fps;controls.update();maxFeet=Math.max(maxFeet,controls.feetY);assert.ok(camera.position.y+.5<lowest);}assert.ok(maxFeet>item.ph+1);assert.ok(Math.abs(controls.feetY-item.ph)<1e-7);}finally{controls.dispose();}}}finally{clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;f.dispose();}
});
test('six solids merge under one owned plain material and dispose once without disposing borrowed materials',()=>{
 const f=fixture(),knees=add(f),watched=new Map(),watch=o=>{if(watched.has(o))return;watched.set(o,0);o.addEventListener('dispose',()=>watched.set(o,watched.get(o)+1));};for(const m of knees)watch(m.geometry);watch(knees[0].material);assert.equal(new Set(knees.map(m=>m.material)).size,1);assert.equal(f.kit.owned.filter(m=>m===knees[0].material).length,1);const borrowed=new Set(meshes(f.frame).map(m=>m.material).filter(m=>m&&!f.kit.owned.includes(m)));let disposed=0;for(const m of borrowed)m.addEventListener('dispose',()=>disposed++);const triangles=knees.reduce((n,m)=>n+kneeMeshHealth(m).triangles,0),merged=f.kit.finish(),parts=meshes(merged).filter(m=>m.material===knees[0].material);assert.equal(parts.length,1);assert.equal(kneeMeshHealth(parts[0]).triangles,triangles);watch(parts[0].geometry);f.kit.dispose(merged);assert.ok([...watched.values()].every(n=>n===1));assert.equal(disposed,0);
});

test('current ZoneBase local consumer accepts exactly one Yonghe addition and rejects double hooks',()=>{
 const f=liveFixture();try{const initial=meshes(f.frame).filter(m=>m.userData.role===ROLE);if(process.env.R62_REQUIRE_YONGHE_HOOK==='1')assert.equal(initial.length,6,'owner integration hook required');if(initial.length===0)add(f);else assert.equal(initial.length,6);assert.equal(audit(f).count,6);assert.equal(audit(f).positiveVolumeAabbIntersectionsWithRetained.length,0);assert.throws(()=>add(f),/already/);}finally{f.dispose();}
});
