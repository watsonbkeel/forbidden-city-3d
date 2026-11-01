import test from 'node:test';import assert from 'node:assert/strict';
import {bPracticalFixture} from '../../lib/b-practical-stair-fixture.mjs';
import {replayKunning} from '../../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../../lib/bounded-qa-clock.mjs';
import {taiheFrontPoints} from '../../lib/taihe-front-route.mjs';
import {resolveBPrincipalStairContact,preserveBPrincipalStairOwner} from '../../../src/scene/palace/BPrincipalStairContact.js';
const pose=(w,x,z)=>{const y=w.cm.getGroundHeight(x,z,10,.6);return{x,z,feetY:y,groundY:y,airborne:false,verticalVelocity:0};};
for(const fps of[10,60])for(const sprint of[false,true])test(`unchanged principal south stairs have bounded contact on a real round trip ${fps}/${sprint}`,t=>{
 const w=bPracticalFixture();try{const go=taiheFrontPoints(w.b.taiheSouthTiers,-1,1.12),r=withBoundedQaMocks(t,c=>replayKunning(c,w,[...go,...go.slice(0,-1).reverse()],{fps,sprint,startFeet:0,recordFrames:true}));assert.equal(r.arrived,true);const worst=r.frames.reduce((a,b)=>Math.abs(a.feet-a.ground)>Math.abs(b.feet-b.ground)?a:b);assert.ok(Math.abs(worst.feet-worst.ground)<=.3,JSON.stringify(worst));}finally{w.dispose();}
});
test('exact allowlist marks 43 genuine slopes and 14 existing landings, not dais, closed side inclines or upper floors',()=>{
 const w=bPracticalFixture();try{const owned=w.cm.walkables.filter(p=>p.bPrincipalStairId);assert.equal(owned.length,57);assert.equal(owned.filter(p=>p.type==='ramp').length,43);assert.equal(w.cm.walkables.length,w.groups.reduce((n,g)=>n+g.walkables.length,0));
  for(const r of owned.filter(p=>p.type==='ramp')){const x=(r.minX+r.maxX)/2,z=(r.minZ+r.maxZ)/2,first=pose(w,x,z),next={...first,[r.axis]:(r.axis==='x'?x:z)+Math.sign(r.a1-r.a0)*.15};resolveBPrincipalStairContact(w.cm,first,1/60);const result=resolveBPrincipalStairContact(w.cm,next,1/60);assert.ok(result?.bPrincipalStairContact,r.bPrincipalStairId);assert.equal(result.feetY,w.cm.getGroundHeight(next.x,next.z,10,.6));}
  for(const g of w.groups.filter(g=>g.id!=='three-halls'))assert.equal(g.walkables.filter(p=>p.bPrincipalStairId&&p.type==='ramp').length,2);
 }finally{w.dispose();}
});
test('jump, high fall, high/stale position and fast teleport keep native physics',()=>{
 const w=bPracticalFixture();try{for(const change of[s=>({...s,airborne:true,verticalVelocity:6.7}),s=>({...s,airborne:true,feetY:18,verticalVelocity:-12}),s=>({...s,feetY:s.feetY+2}),s=>({...s,groundY:s.groundY+2}),s=>({...s,z:s.z+2})]){const first=pose(w,-10.5,-45),next={...first,z:-45.15};resolveBPrincipalStairContact(w.cm,first,1/60);assert.equal(resolveBPrincipalStairContact(w.cm,change(next),1/60),null);}}finally{w.dispose();}
});
test('missing, duplicated and changed registrations disable only the affected group',()=>{
 const w=bPracticalFixture();try{const saved=w.cm.walkables,first=pose(w,-10.5,-45),next={...first,z:-45.15};for(const change of[a=>a.filter(r=>r.bPrincipalStairId!=='three-halls/taihe-south-separated-approaches:1:-10.5'),a=>[...a,{...a.find(r=>r.bPrincipalStairId?.startsWith('three-halls/'))}],a=>a.map(r=>r.bPrincipalStairId==='three-halls/taihe-south-separated-approaches:1:-10.5'?{...r,y0:r.y0+1}:r)]){w.cm.walkables=saved;resolveBPrincipalStairContact(w.cm,first,1/60);w.cm.walkables=change(saved);assert.equal(resolveBPrincipalStairContact(w.cm,next,1/60),null);}w.cm.walkables=saved;assert.throws(()=>preserveBPrincipalStairOwner({}, {bPrincipalStairId:'unregistered'}));}finally{w.dispose();}
});
test('side departure cannot acquire a lower terrace and ordinary foreign ground remains unmodified',()=>{
 const w=bPracticalFixture();try{const first=pose(w,-9.05,-45),next={...first,x:-8.8,z:-45.1};resolveBPrincipalStairContact(w.cm,first,.1);assert.equal(resolveBPrincipalStairContact(w.cm,next,.1),null);
  for(const[x,z]of[[0,-240],[0,-410],[100,100],[-70,-144],[0,5]])assert.equal(resolveBPrincipalStairContact(w.cm,{x,z,feetY:9,groundY:9,airborne:false,verticalVelocity:0},.1),null);
 }finally{w.dispose();}
});
test('real thin solid and registered NPC remain authoritative',()=>{
 const w=bPracticalFixture();try{const first=pose(w,-10.5,-45),next={...first,z:-46.2},y=w.cm.getGroundHeight(next.x,next.z,10,.6);
  w.cm.addCollider(new w.THREE.Box3(new w.THREE.Vector3(-11.5,7.25,-45.66),new w.THREE.Vector3(-9.5,7.65,-45.54)),'thin-test');
  assert.equal(w.cm.checkCollision(new w.THREE.Vector3(next.x,y+1.7,next.z),.5),false);resolveBPrincipalStairContact(w.cm,first,.1);assert.equal(resolveBPrincipalStairContact(w.cm,next,.1),null);w.cm.removeByTag('thin-test');
  w.cm.setDynamicBodies('person',[{id:'actual-npc',parts:[{ax:-10.5,az:-45.7,bx:-10.5,bz:-45.7,radius:.3,minY:6,maxY:8.5}]}]);resolveBPrincipalStairContact(w.cm,first,.1);assert.equal(resolveBPrincipalStairContact(w.cm,{...first,z:-45.15},.1),null);w.cm.clearDynamicBodies('person');
 }finally{w.dispose();}
});
