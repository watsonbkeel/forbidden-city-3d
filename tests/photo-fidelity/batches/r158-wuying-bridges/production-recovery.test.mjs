// Real production controls and collision: no in-memory hook injection here.
import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import * as T from'three';
import{recoveryFixture as fixture}from'./recovery-fixture.mjs';import{createRecoveryHarness}from'./recovery-harness.mjs';import{OriginalControls}from'./first-person-baseline.mjs';import{createAuthoredWuyingCrownRecovery,attachWuyingCrownRecovery}from'../../../../src/scene/palace/special/WuyingThreeBridgeRails.js';import{CollisionManager as OriginalCollision}from'../../../../src/utils/Collision.js';import{innerJinshuiProfile}from'../../../../src/scene/palace/special/InnerJinshui.js';import{characterBody,bodyPenetration}from'../../../../src/scene/characters/CharacterBody.js';
const recoveryFixture=t=>fixture(t,{production:true});
const manager=(C,h)=>{const cm=new C();cm.addColliders(h.water.colliders);cm.addWalkables(h.water.walkables);return cm;};
test('Production controls contain only the exact independently reviewed hooks over frozen 3e9 source bytes',async()=>{
 const expected=await createRecoveryHarness(createAuthoredWuyingCrownRecovery()),url=new URL('../../../../src/controls/FirstPerson.js',import.meta.url),source=fs.readFileSync(url,'utf8'),prefix="import {attachWuyingCrownRecovery} from '../scene/palace/special/WuyingThreeBridgeRails.js';\n";
 assert.ok(source.startsWith(prefix));const normalize=s=>s.replace(/(from\s*['"])([^'"]+)(['"])/g,(_,a,name,b)=>a+(name.startsWith('.')?new URL(name,url).href:import.meta.resolve(name))+b);
 const actual=normalize(source.slice(prefix.length).replace('attachWuyingCrownRecovery(this)','recovery.attach(this)'));assert.ok(actual===expected.instrumentedControlsSource,'unapproved controls change beyond the reviewed finite hooks');
 assert.ok(actual.includes('Math.exp(-10 * delta)'));const mutation=actual.replace('Math.exp(-10 * delta)','Math.exp(-11 * delta)');assert.ok(mutation!==actual&&mutation!==expected.instrumentedControlsSource,'negative source mutation remains detectable');
});
test('Controls outside a real palace manager receive no capability and preserve original movement/height passthrough',()=>{const s=attachWuyingCrownRecovery({camera:new T.PerspectiveCamera(),collisionManager:{}});assert.equal(s.tryJump(),null);assert.equal(s.limitVertical(1,2),2);const result={};assert.equal(s.withMovement(null,null,()=>result),result);s.observe();s.cancel();s.reset();s.dispose();assert.ok(Object.isFrozen(s));});
test('PRODUCTION: Tall inward walls and actual NPC capsules remain solid throughout every recovery frame at 10/30/60Hz',async t=>{
 for(const fps of[10,30,60])for(const kind of['wall','npc']){const h=await recoveryFixture(t);try{h.drop(fps);const q=h.pose();let wall,npc;
  if(kind==='wall'){wall=new T.Box3(new T.Vector3(q.x-.75,q.feet-.1,q.z-2),new T.Vector3(q.x-.62,q.feet+5,q.z+2));h.cm.addCollider(wall,'proof-inward-wall');}
  else{npc=characterBody({id:'proof-guard',pose:'standing'},{position:[q.x-.9,q.feet,q.z]});h.cm.setDynamicBodies('proof',[npc]);}
  for(let i=0;i<fps*4;i++){const p=h.frame(fps,-1,0,i%fps===0),box=new T.Box3(new T.Vector3(p.x-.5,p.feet+1e-6,p.z-.5),new T.Vector3(p.x+.5,p.feet+1.7,p.z+.5));if(wall)assert.equal(box.intersectsBox(wall),false,`${fps} wall ${i}`);if(npc)assert.ok(bodyPenetration(npc,{position:[p.x,p.feet,p.z],radius:.5,height:1.7})<=1e-7,`${fps} NPC ${i}`);assert.ok(p.x>q.x-.5,'must not tunnel through blocker');}
 }finally{h.dispose();}}
});

test('PRODUCTION: A ceiling or NPC introduced after takeoff cannot be crossed by subsequent vertical recovery frames',async t=>{
 for(const fps of[10,30,60])for(const kind of['ceiling','npc']){const h=await recoveryFixture(t);try{h.drop(fps);h.frame(fps,-1,0,true);const q=h.pose();assert.ok(h.ctrl.verticalVelocity>0);let ceiling,npc;
  if(kind==='ceiling'){ceiling=new T.Box3(new T.Vector3(q.x-4,q.feet+1.75,q.z-2),new T.Vector3(q.x+1,q.feet+2,q.z+2));h.cm.addCollider(ceiling,'proof-late-ceiling');}
  else{npc=characterBody({id:'proof-late-overhead',pose:'standing'},{position:[q.x-.1,q.feet+1.75,q.z]});h.cm.setDynamicBodies('proof',[npc]);}
  for(let i=0;i<fps*2;i++){const p=h.frame(fps,-1,0),box=new T.Box3(new T.Vector3(p.x-.5,p.feet+1e-6,p.z-.5),new T.Vector3(p.x+.5,p.feet+1.7,p.z+.5));if(ceiling)assert.equal(box.intersectsBox(ceiling),false,`${fps} late ceiling ${i}`);if(npc)assert.ok(bodyPenetration(npc,{position:[p.x,p.feet,p.z],radius:.5,height:1.7})<=1e-7,`${fps} late NPC ${i}`);}
 }finally{h.dispose();}}
});

test('PRODUCTION: All three bridge instances on both outside sides recover to real deck at 10/30/60Hz',async t=>{
 for(const fps of[10,30,60])for(let index=0;index<3;index++)for(const side of[-1,1]){const h=await recoveryFixture(t);try{const b=h.water.profile.bridges.find(b=>b.id===`wuying-${index+1}`);h.position(b.x+side*(b.width/2+.53),b.z-3,6);for(let i=0;i<fps*2;i++)h.frame(fps);assert.equal(h.ctrl.airborne,true);let escaped=false;
  for(let i=0;i<fps*4;i++){const p=h.frame(fps,-side,0,i%fps===0);if(Math.abs(p.x-b.x)<b.width/2-.6&&p.feet<.5&&!h.ctrl.airborne){escaped=true;break;}}
  assert.ok(escaped,`${b.id}/${side}/${fps}`);
 }finally{h.dispose();}}
});

test('PRODUCTION: Expiry, stop, cancel, owner loss and scene/camera replacement retain residual special-hop ceiling safety',async t=>{
 for(const fps of[10,30,60])for(const mode of['expire','stop','cancel','owner-loss','scene','camera']){const h=await recoveryFixture(t);try{
  h.drop(fps);h.frame(fps,-1,0,true);const q=h.pose(),ceiling=new T.Box3(new T.Vector3(q.x-4,q.feet+1.75,q.z-2),new T.Vector3(q.x+1,q.feet+2,q.z+2));h.cm.addCollider(ceiling,'review-late-ceiling');
  if(mode==='expire')h.advance(1051);if(mode==='stop')h.ctrl.stop();if(mode==='cancel')h.ctrl._wuyingRecovery.cancel();if(mode==='owner-loss')h.cm.walkables=[];
  if(mode==='scene'){const other=new h.CollisionManager();other.addColliders(h.water.colliders);other.addWalkables(h.water.walkables);other.addCollider(ceiling,'other-scene-ceiling');h.ctrl.collisionManager=other;}
  if(mode==='camera')h.ctrl.camera=h.camera.clone();
  const p=h.frame(fps,-1,0),camera=h.ctrl.camera,box=new T.Box3(new T.Vector3(camera.position.x-.5,h.ctrl.feetY+1e-6,camera.position.z-.5),new T.Vector3(camera.position.x+.5,h.ctrl.feetY+1.7,camera.position.z+.5));assert.equal(box.intersectsBox(ceiling),false,`${fps}/${mode}`);assert.equal(h.ctrl.verticalVelocity,0);assert.ok(h.ctrl.airborne,'no rescue floor or false landing');
 }finally{h.dispose();}}
});

test('PRODUCTION: Real released/reversed keyboard input never inherits inward intent from smoothed velocity',async t=>{
 for(const kind of['released','reversed']){const h=await recoveryFixture(t);try{h.drop();h.aim(-1,0);h.ctrl.onKeyDown({code:'KeyW',repeat:false,preventDefault(){}});for(let i=0;i<4;i++){h.advance(1000/30);h.ctrl.update();}h.ctrl.onKeyUp({code:'KeyW'});if(kind==='reversed')h.ctrl.onKeyDown({code:'KeyS',repeat:false,preventDefault(){}});assert.ok(h.ctrl.velocity.z>0);const before=h.ctrl.feetY;h.ctrl.onKeyDown({code:'Space',repeat:false,preventDefault(){}});h.advance(1000/30);h.ctrl.update();assert.equal(h.ctrl.verticalVelocity,0,kind);assert.ok(Math.abs(h.ctrl.feetY-before)<1e-6);}finally{h.dispose();}}
});

test('PRODUCTION: Actual active joystick targets authorize inward recovery; inactive or reversed joystick inertia does not',async t=>{
 for(const kind of['inward','inactive','reversed']){const h=await recoveryFixture(t);try{h.drop();h.aim(-1,0);h.ctrl.isMobile=true;let active=true,dy=-1;h.ctrl.joystick={sessionGeneration:1,isActive:()=>active,getDelta:()=>({x:0,y:dy}),setRunning(){},reset(){active=false;},dispose(){}};
  for(let i=0;i<4;i++){h.advance(1000/30);h.ctrl.update();}if(kind==='inactive')active=false;if(kind==='reversed')dy=1;const before=h.ctrl.feetY;h.ctrl.jump();h.advance(1000/30);h.ctrl.update();assert.equal(h.ctrl.verticalVelocity>0,kind==='inward',kind);if(kind==='inward')assert.ok(h.ctrl.feetY>before);else assert.ok(Math.abs(h.ctrl.feetY-before)<1e-6);
 }finally{h.dispose();}}
});

test('PRODUCTION: Normal jumping and walking on every other bridge and its two banks stay frame-exact with original controls',async t=>{const h=await recoveryFixture(t);try{
 const bridges=[...h.water.profile.bridges.filter(b=>b.family!=='wuying'),...innerJinshuiProfile(h.river).bridges];let routes=0;
 const run=(Controls,CM,start,dir,fps)=>{h.setNow(0);const cm=manager(CM,h),camera=new T.PerspectiveCamera(),noop=()=>{},ctrl=new Controls(camera,{ownerDocument:document,addEventListener:noop,removeEventListener:noop},cm),rows=[];try{ctrl.controls.isLocked=true;ctrl.setPosition(start[0],1.7,start[1]);for(let i=0;i<fps*3;i++){h.advance(1000/fps);ctrl.moveForward=true;camera.position.sub(ctrl.bobOffset);camera.lookAt(camera.position.x+dir[0],camera.position.y,camera.position.z+dir[1]);camera.position.add(ctrl.bobOffset);camera.updateMatrixWorld(true);if(i===Math.floor(fps*.25)||i===fps*2)ctrl.jump();ctrl.update();rows.push([camera.position.x,camera.position.y,camera.position.z,ctrl.feetY,ctrl.groundY,ctrl.verticalVelocity,ctrl.airborne]);}return rows;}finally{ctrl.dispose();}};
 for(const fps of[10,30,60])for(const b of bridges)for(const end of[-1,0,1]){const axis=b.axis??'z',offset=end*(b.length/2+1),start=[b.x+(axis==='x'?offset:0),b.z+(axis==='z'?offset:0)],direction=end===1?-1:1,dir=axis==='x'?[direction,0]:[0,direction];assert.deepEqual(run(h.FirstPersonControls,h.CollisionManager,start,dir,fps),run(OriginalControls,OriginalCollision,start,dir,fps),`${b.id}/${end}/${fps}`);routes++;}
 assert.equal(routes,81);
 }finally{h.dispose();}});
