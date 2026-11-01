import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PalaceBuilder} from '../../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../../src/scene/Layout.js';
import {CollisionManager} from '../../../src/utils/Collision.js';
import {library} from '../../lib/inner-palace-fixture.mjs';
import {replayKunning} from '../../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../../lib/bounded-qa-clock.mjs';
import {preserveTaihemenStairContactOwner,resolveTaihemenStairContact} from '../../../src/scene/palace/TaihemenStairContact.js';
function fixture(){const scene=new THREE.Scene(),b=new PalaceBuilder(scene,library());b.buildAll(PALACE_LAYOUT.filter(p=>p.name==='太和门'));const cm=new CollisionManager();cm.rivers=[];cm.addColliders(b.colliders);cm.addWalkables(b.walkables);return{THREE,scene,b,cm,dispose:()=>b.dispose()};}
for(const fps of[10,60])for(const sprint of[false,true])test(`actual Taihemen three stairs stay within 0.3m while walking up/down ${fps}/${sprint}`,t=>{
 const w=fixture();try{for(const x of[-6.8719407496977025,6.8719407496977025]){
  const points=[[0,-194.2],[0,-204],[0,-228.29343409915356],[x,-228.29343409915356],[x,-242.48634824667474]],r=withBoundedQaMocks(t,c=>replayKunning(c,w,[...points,...points.slice(0,-1).reverse()],{fps,sprint,startFeet:0,recordFrames:true}));
  assert.equal(r.arrived,true);const max=Math.max(...r.frames.map(f=>Math.abs(f.feet-f.ground)));assert.ok(max<=.3,`actual foot/ground difference ${max}`);
 }}finally{w.dispose();}
});
function pose(w,x,z){const y=w.cm.getGroundHeight(x,z,4,.6);return{x,z,feetY:y,groundY:y,airborne:false,verticalVelocity:0};}
test('actual dispatch preserves exactly three existing ramp and two existing deck owners without new support',()=>{
 const w=fixture();try{const owned=w.cm.walkables.filter(r=>r.taihemenStairContactId);assert.equal(owned.length,5);assert.equal(owned.filter(r=>r.type==='ramp').length,3);assert.equal(w.cm.walkables.length,w.b.walkables.length);
  for(const p of owned.filter(r=>r.type==='ramp')){const x=(p.minX+p.maxX)/2,z=p.a0+(p.a1-p.a0)*.5,first=pose(w,x,z),next={...first,z:z+Math.sign(p.a1-p.a0)*.15};assert.equal(resolveTaihemenStairContact(w.cm,first,1/60),null);const r=resolveTaihemenStairContact(w.cm,next,1/60);assert.ok(r?.taihemenStairContact);assert.equal(r.feetY,w.cm.getGroundHeight(next.x,next.z,4,.6));}
 }finally{w.dispose();}
});
test('jump, high fall, high/stale pose and teleport do not acquire stair contact',()=>{
 for(const change of[s=>({...s,airborne:true,verticalVelocity:6.7}),s=>({...s,airborne:true,feetY:8,verticalVelocity:-10}),s=>({...s,feetY:s.feetY+2}),s=>({...s,groundY:s.groundY+2}),s=>({...s,z:s.z+2})]){
  const w=fixture();try{const first=pose(w,0,-201.5),next={...first,z:-201.35};resolveTaihemenStairContact(w.cm,first,1/60);assert.equal(resolveTaihemenStairContact(w.cm,change(next),1/60),null);}finally{w.dispose();}
 }
});
test('removed, duplicate or modified actual owners fail closed and are never replaced with synthetic support',()=>{
 for(const change of[cm=>cm.walkables.splice(cm.walkables.findIndex(w=>w.taihemenStairContactId),1),cm=>cm.walkables.push({...cm.walkables.find(w=>w.taihemenStairContactId)}),cm=>{cm.walkables.find(w=>w.taihemenStairContactId&&w.type==='ramp').y0+=1;}]){
  const w=fixture();try{const first=pose(w,0,-201.5),next={...first,z:-201.35};resolveTaihemenStairContact(w.cm,first,1/60);change(w.cm);const n=w.cm.walkables.length;assert.equal(resolveTaihemenStairContact(w.cm,next,1/60),null);assert.equal(w.cm.walkables.length,n);}finally{w.dispose();}
 }
 assert.throws(()=>preserveTaihemenStairContactOwner({}, {taihemenStairContactId:'foreign'}));
});
test('side edges and foreign ordinary ground never receive toe or deck support',()=>{
 const w=fixture();try{const first=pose(w,4.8,-201.5),next={...first,x:5.1,z:-201.35};resolveTaihemenStairContact(w.cm,first,.1);assert.equal(resolveTaihemenStairContact(w.cm,next,.1),null);
  for(const[x,z]of[[0,-180],[0,-239],[15,-235],[-103,50],[100,100]])assert.equal(resolveTaihemenStairContact(w.cm,{x,z,feetY:1,groundY:1,airborne:false,verticalVelocity:0},.1),null);
 }finally{w.dispose();}
});
test('continuous ordinary and dynamic body obstacles remain authoritative',()=>{
 const w=fixture();try{const first=pose(w,0,-201.5),next={...first,z:-200.3},ground=w.cm.getGroundHeight(next.x,next.z,4,.6);
  w.cm.addCollider(new THREE.Box3(new THREE.Vector3(-1,3.6,-200.96),new THREE.Vector3(1,4,-200.84)),'contact-thin-obstacle');
  assert.equal(w.cm.checkCollision(new THREE.Vector3(next.x,ground+1.7,next.z),.5),false);resolveTaihemenStairContact(w.cm,first,.1);assert.equal(resolveTaihemenStairContact(w.cm,next,.1),null,'cannot tunnel a thin obstacle between clear endpoints');
  w.cm.removeByTag('contact-thin-obstacle');w.cm.setDynamicBodies('contact-person',[{id:'person',pose:'standing',parts:[{ax:0,az:-200.8,bx:0,bz:-200.8,radius:.3,minY:3,maxY:4.7}]}]);
  resolveTaihemenStairContact(w.cm,first,.1);assert.equal(resolveTaihemenStairContact(w.cm,{...first,z:-201.35},.1),null,'real registered pedestrian remains solid');
 }finally{w.dispose();}
});
