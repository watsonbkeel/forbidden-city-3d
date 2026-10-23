import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import * as THREE from 'three';
import {ZoneBase} from '../src/scene/zones/ZoneBase.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
import {PLAYER} from '../src/config/constants.js';
import {replayTerrace} from './lib/terrace-walk.mjs';
import {KNEE_ROLE,meshes,arrowKneeSnapshot,auditArrowSouthKnees,kneeMeshHealth} from './lib/r59-arrow-knees-qa.mjs';
const url=new URL('../src/scene/palace/special/ArrowSouthKnees.js',import.meta.url),api=existsSync(url)?await import(url):{};
const data=JSON.parse(readFileSync(new URL('../data/zones/outer-east.json',import.meta.url))),item=data.items.find(i=>i.name==='箭亭');
const frozen=JSON.parse(readFileSync(new URL('./fixtures/r59-arrow-knees-baseline.json',import.meta.url)));
function fixture(add=true){
 const builder=new ZoneBase(library(),data),{f:frame}=builder.buildHall(item),kit=builder.kit;
 if(add){assert.equal(typeof api.buildArrowSouthKnees,'function','bounded Arrow knee builder must exist');if(!meshes(frame).some(m=>m.userData.role===KNEE_ROLE))api.buildArrowSouthKnees(kit,frame,item);}
 kit.root.updateMatrixWorld(true);const cm=new CollisionManager();cm.rivers=[];cm.addColliders(kit.colliders);cm.addWalkables(kit.walkables);
 return{kit,frame,cm,dispose:()=>kit.dispose(kit.root)};
}

test('only two inward south-central gray knee solids are added; all old mesh bytes and registrations remain exact',()=>{
 const f=fixture();try{const qa=auditArrowSouthKnees({...f,baseline:frozen.snapshot});assert.equal(qa.kneeCount,2);assert.equal(qa.oldColumnCount,20);assert.equal(qa.retainedExact,true);assert.equal(qa.kneeMaterialOwnedExactlyOnce,true);
 const knees=meshes(f.frame).filter(m=>m.userData.role===KNEE_ROLE);assert.deepEqual(knees.map(m=>m.userData.columnX),[-2.75,2.75]);assert.deepEqual(knees.map(m=>m.userData.inward),[1,-1]);
 for(const m of knees){assert.equal(m.position.z,-8.8);assert.equal(m.userData.entityId,'FC-AF36D75128');assert.equal(m.userData.visualAcceptance,'VERIFY_PENDING');assert.equal(m.userData.captureDate,null);assert.equal(m.material.map,null);assert.equal(m.material.side,THREE.FrontSide);assert.equal(m.material.emissive.getHex(),0);assert.ok(m.castShadow&&m.receiveShadow);}
 }finally{f.dispose();}
});

test('actual added triangles are finite, nondegenerate, outward-wound closed solids and symmetric',()=>{
 const f=fixture();try{const knees=meshes(f.frame).filter(m=>m.userData.role===KNEE_ROLE);for(const m of knees){const h=kneeMeshHealth(m);assert.ok(h.finite&&h.closed);assert.ok(h.minArea>1e-7);assert.ok(h.signedVolume>0);assert.ok(h.triangles>=32&&h.triangles<=96);}
 const vertices=m=>{const p=m.geometry.attributes.position;return Array.from({length:p.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrix).toArray());};
 const keys=v=>v.map(p=>p.map(x=>Math.abs(x)<1e-6?'0':x.toFixed(5)).join(',')).sort();assert.deepEqual(keys(vertices(knees[0]).map(([x,y,z])=>[-x,y,z])),keys(vertices(knees[1])));
 }finally{f.dispose();}
});

test('two real knee top/root surfaces overlap only their retained beam and column attachment volumes',()=>{
 const f=fixture();try{for(const m of meshes(f.frame).filter(m=>m.userData.role===KNEE_ROLE)){
  const {columnX,inward}=m.userData,toWorld=p=>f.frame.localToWorld(new THREE.Vector3(...p));
  const x=columnX+inward*.24,rootY=8.53-.62*.7;
  const rootHit=new THREE.Raycaster(toWorld([x,rootY,-9.3]),new THREE.Vector3(0,0,1),0,1).intersectObject(m)[0];assert.ok(rootHit,'root skin exists');
  const column=meshes(f.frame).find(c=>c.userData.role==='arrow-column'&&c.position.x===columnX&&c.position.z===-8.8);
  const columnHit=new THREE.Raycaster(toWorld([x,rootY,-9.3]),new THREE.Vector3(0,0,1),0,1).intersectObject(column)[0];assert.ok(columnHit,'same sampled line intersects actual retained column');assert.ok(rootHit.distance>columnHit.distance,'closed root lies within real cylinder, not floating outside');
  const topHit=new THREE.Raycaster(toWorld([columnX+inward*.8,9,-8.8]),new THREE.Vector3(0,-1,0),0,1).intersectObject(m)[0];assert.ok(topHit);assert.ok(topHit.point.y>8.5&&topHit.point.y<8.56);
  const beam=meshes(f.frame).find(c=>c.name==='arrow-frame-beam'&&c.position.z===-8.8);assert.ok(new THREE.Box3().setFromObject(beam).containsPoint(topHit.point));
 }}finally{f.dispose();}
});

test('broad shoulders narrow along a curved multi-segment underside rather than a rectangular or straight wedge insert',()=>{
 const f=fixture();try{const m=meshes(f.frame).find(m=>m.userData.role===KNEE_ROLE&&m.userData.inward===1),hit=(x,drop)=>new THREE.Raycaster(f.frame.localToWorld(new THREE.Vector3(-2.75+.22+x,8.53-drop,-9.3)),new THREE.Vector3(0,0,1),0,1).intersectObject(m).length>0;
 for(const [x,inside,outside]of[[.12,.52,.65],[.65,.30,.50],[1.12,.12,.35]]){assert.equal(hit(x,inside),true);assert.equal(hit(x,outside),false);}
 assert.equal(hit(.65,.38),true,'middle underside falls below the straight root-to-tip chord');
 }finally{f.dispose();}
});

test('invalid identity/dimensions, a missing host, and duplicate additions reject before new allocations or mutations',()=>{
 assert.equal(typeof api.buildArrowSouthKnees,'function');
 for(const change of[{name:'临溪亭'},{w:30},{d:18},{colH:7},{ph:1},{x:0},{rot:Math.PI},{enclosureProfile:'other'}]){const f=fixture(false),before=arrowKneeSnapshot(f),n=f.kit.owned.length;try{assert.throws(()=>api.buildArrowSouthKnees(f.kit,f.frame,{...item,...change}),/Arrow south knees/);assert.deepEqual(arrowKneeSnapshot(f),before);assert.equal(f.kit.owned.length,n);}finally{f.dispose();}}
 const f=fixture();try{const count=f.kit.owned.length;assert.throws(()=>api.buildArrowSouthKnees(f.kit,f.frame,item),/already/);assert.equal(f.kit.owned.length,count);assert.throws(()=>api.buildArrowSouthKnees(f.kit,new THREE.Group(),item),/host/);}finally{f.dispose();}
});

for(const fps of[10,60])for(const backward of[false,true])test(`unchanged real controller traverses Arrow N/S doors and both galleries at ${fps} Hz ${backward?'S':'W'}`,t=>{
 const f=fixture();try{const points=[[0,-13],[0,-7.8],[14.65,-7.8],[14.65,7.8],[0,7.8],[0,13],[0,0],[0,-7.8],[-14.65,-7.8],[-14.65,7.8],[0,7.8],[0,-13]].map(([x,z])=>[x+item.x,z+item.z]);const r=replayTerrace(t,{THREE,cm:f.cm},points,{fps,backward,sprint:true,recordFrames:true});assert.equal(r.arrived,true);assert.ok(r.frames.every(p=>Number.isFinite(p.feet)&&Number.isFinite(p.ground)));assert.equal(arrowKneeSnapshot(f).physics,frozen.snapshot.physics);
 }finally{f.dispose();}
});

for(const fps of[10,60])test(`actual repeated standing jumps remain clear below both added members at ${fps} Hz`,t=>{
 const f=fixture(),oldDoc=globalThis.document,oldWindow=globalThis.window,noop=()=>{};globalThis.document={...oldDoc,addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.window={addEventListener:noop,removeEventListener:noop};let now=0;const clock=t.mock.method(performance,'now',()=>now);
 try{const lowest=auditArrowSouthKnees(f).lowestWorldY;assert.ok(Math.abs(lowest-7.91)<1e-5);for(const x of[-1.75,0,1.75]){const camera=new THREE.PerspectiveCamera(),controls=new FirstPersonControls(camera,{ownerDocument:globalThis.document,addEventListener:noop,removeEventListener:noop},f.cm);controls.controls.isLocked=true;controls.setPosition(item.x+x,item.ph+PLAYER.HEIGHT,item.z-8.8);let maxFeet=item.ph;
  try{for(let i=0;i<fps*6;i++){if(i===fps||i===fps*3)controls.jump();now+=1000/fps;controls.update();maxFeet=Math.max(maxFeet,controls.feetY);assert.ok(camera.position.y+.5<lowest,'full conservative head/radius envelope below new triangles');}assert.ok(maxFeet>item.ph+1);assert.ok(Math.abs(controls.feetY-item.ph)<1e-7);}finally{controls.dispose();}
 }}finally{clock.mock.restore();globalThis.document=oldDoc;globalThis.window=oldWindow;f.dispose();}
});

test('private material and each closed geometry dispose exactly once through real merge lifecycle; borrowed materials untouched',()=>{
 const f=fixture(),knees=meshes(f.frame).filter(m=>m.userData.role===KNEE_ROLE),watched=new Map(),watch=o=>{if(watched.has(o))return;watched.set(o,0);o.addEventListener('dispose',()=>watched.set(o,watched.get(o)+1));};
 for(const m of knees)watch(m.geometry);watch(knees[0].material);const borrowed=new Set(meshes(f.frame).map(m=>m.material).filter(m=>m&&!f.kit.owned.includes(m)));let borrowedDisposed=0;for(const m of borrowed)m.addEventListener('dispose',()=>borrowedDisposed++);
 const sourceTriangles=knees.reduce((n,m)=>n+kneeMeshHealth(m).triangles,0),merged=f.kit.finish(),result=meshes(merged).filter(m=>m.material===knees[0].material);assert.equal(result.length,1);assert.equal(kneeMeshHealth(result[0]).triangles,sourceTriangles);watch(result[0].geometry);for(const m of knees)assert.equal(watched.get(m.geometry),1);assert.equal(watched.get(knees[0].material),0);f.kit.dispose(merged);for(const count of watched.values())assert.equal(count,1);assert.equal(borrowedDisposed,0);
});
