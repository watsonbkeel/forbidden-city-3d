import test from'node:test';import assert from'node:assert/strict';import * as T from'three';import{recoveryFixture}from'./recovery-fixture.mjs';import{createAuthoredWuyingCrownRecovery}from'../../../../src/scene/palace/special/WuyingThreeBridgeRails.js';import{characterBody,bodyPenetration}from'../../../../src/scene/characters/CharacterBody.js';
const attempt=h=>{const q=h.pose(),from=new T.Vector3(q.x,q.feet+1.7,q.z),to=from.clone().add(new T.Vector3(-.1,0,0));return{q,from,to,allow:(changes={})=>{const previous=h.camera.position.clone();h.camera.position.copy(to);try{return h.ctrl._wuyingRecovery.withMovement(from,to,()=>h.contract.allowsRiver(changes.manager??h.cm,changes.river??h.river,changes.from??from,changes.to??to,changes.radius??.5,changes.fromFeet??q.feet,changes.toFeet??q.feet));}finally{h.camera.position.copy(previous);}}};};
test('Capability requires actual crown body contact, explicit inward jump input, no velocity or foot-ground fiction',async t=>{const h=await recoveryFixture(t);try{
 h.drop();assert.equal(h.ctrl.airborne,true);const q=h.pose();assert.ok(q.feet>1.8&&q.feet<1.82);h.aim(-1,0);h.ctrl.velocity.set(0,0,3);
 assert.equal(h.ctrl._wuyingRecovery.tryJump(),null,'no jump input');h.ctrl.jump();h.ctrl.velocity.set(0,0,0);assert.equal(h.ctrl._wuyingRecovery.tryJump(),null,'no inward movement');h.ctrl.velocity.z=3;h.aim(1,0);assert.equal(h.ctrl._wuyingRecovery.tryJump(),null,'outward intent');h.aim(0,1);assert.equal(h.ctrl._wuyingRecovery.tryJump(),null,'along-water intent');h.aim(-1,0);
 h.ctrl.verticalVelocity=.01;assert.equal(h.ctrl._wuyingRecovery.tryJump(),null,'not stationary contact');h.ctrl.verticalVelocity=0;h.ctrl.feetY+=.1;assert.equal(h.ctrl._wuyingRecovery.tryJump(),null,'air near a crown is not contact');h.ctrl.feetY=q.feet;h.ctrl.airborne=false;assert.equal(h.ctrl._wuyingRecovery.tryJump(),null,'normal grounded jump is not a recovery grant');h.ctrl.airborne=true;
 assert.equal(h.grant(),4.8);assert.equal(h.ctrl.groundY,0,'no synthetic support datum');assert.equal(h.ctrl.airborne,true);assert.equal(h.ctrl._wuyingRecovery.tryJump(),null,'no double jump');
 }finally{h.dispose();}});
test('Private ticket cannot be forged, passed to another manager/river/factory, or used outside its monotonic inward segment',async t=>{const h=await recoveryFixture(t);try{
 h.drop();let a=attempt(h);assert.equal(a.allow(),false);h.cm.wuyingTicket={bridgeId:'wuying-2',valid:true};assert.equal(a.allow(),false,'plain JSON is not an issued capability');assert.equal(h.grant(),4.8);a=attempt(h);assert.equal(a.allow(),true);
 const other=new h.CollisionManager();other.addColliders(h.water.colliders);other.addWalkables(h.water.walkables);assert.equal(a.allow({manager:other}),false);assert.equal(a.allow({river:{...h.river}}),false);assert.equal(createAuthoredWuyingCrownRecovery().allowsRiver(h.cm,h.river,a.from,a.to,.5,a.q.feet,a.q.feet),false);
 for(const changes of[{radius:.4},{to:a.from.clone().add(new T.Vector3(.1,0,0))},{to:a.from.clone().add(new T.Vector3(0,0,.1))},{to:a.from.clone().add(new T.Vector3(-.3,0,0))},{fromFeet:a.q.feet+.9,toFeet:a.q.feet+.9},{toFeet:a.q.feet+.01},{from:new T.Vector3(0,a.from.y,0),to:new T.Vector3(-.1,a.from.y,0)}])assert.equal(a.allow(changes),false);
 h.ctrl.collisionManager=other;assert.equal(a.allow(),false,'controller cannot carry capability across scenes');h.ctrl.collisionManager=h.cm;assert.equal(a.allow(),false,'revoked scene token does not revive');
 }finally{h.dispose();}});
test('Owner mutation, duplicate owner, missing deck, river replacement and elapsed time all revoke capabilities',async t=>{
 for(const kind of['vertex','duplicate','deck','river','expired']){const h=await recoveryFixture(t);try{h.drop();assert.equal(h.grant(),4.8);const a=attempt(h);assert.equal(a.allow(),true);
  if(kind==='vertex')h.cm.colliders.find(c=>c.triangleSupport?.id==='wuying-bridge-rails:wuying-2:1:post:3').triangleSupport.template.triangles[0].triangle.a.y+=.001;
  if(kind==='duplicate')h.cm.colliders.push(h.cm.colliders.find(c=>c.triangleSupport?.id==='wuying-bridge-rails:wuying-2:1:post:3'));
  if(kind==='deck')h.cm.walkables=[];if(kind==='river')h.cm.rivers=h.cm.rivers.map(r=>r===h.river?{...r}:r);if(kind==='expired')h.advance(1051);
  assert.equal(a.allow(),false,kind);
 }finally{h.dispose();}}
});
test('Recovery is rate limited after cancellation, and normal input clearing never invents a second airborne jump',async t=>{const h=await recoveryFixture(t);try{h.drop();assert.equal(h.grant(),4.8);h.ctrl._wuyingRecovery.cancel();h.ctrl.verticalVelocity=0;assert.equal(h.grant(),null);h.advance(1599);assert.equal(h.grant(),null);h.advance(1);assert.equal(h.grant(),4.8);h.ctrl.jump();assert.equal(h.ctrl._wuyingRecovery.tryJump(),null);h.ctrl.stop();assert.equal(attempt(h).allow(),false);}finally{h.dispose();}});
test('Headroom and NPC overhead are checked using full upward body sweep before any grant',async t=>{
 for(const kind of['ceiling','npc']){const h=await recoveryFixture(t);try{h.drop();const q=h.pose();
  if(kind==='ceiling')h.cm.addCollider(new T.Box3(new T.Vector3(q.x-.6,q.feet+1.75,q.z-.6),new T.Vector3(q.x+.6,q.feet+2,q.z+.6)),'proof-overhead');
  else h.cm.setDynamicBodies('proof',[characterBody({id:'proof-overhead',pose:'standing'},{position:[q.x,q.feet+1.85,q.z]})]);
  assert.equal(h.grant(),null,kind);assert.equal(attempt(h).allow(),false);
 }finally{h.dispose();}}
});
test('Tall inward walls and actual NPC capsules remain solid throughout every recovery frame at 10/30/60Hz',async t=>{
 for(const fps of[10,30,60])for(const kind of['wall','npc']){const h=await recoveryFixture(t);try{h.drop(fps);const q=h.pose();let wall,npc;
  if(kind==='wall'){wall=new T.Box3(new T.Vector3(q.x-.75,q.feet-.1,q.z-2),new T.Vector3(q.x-.62,q.feet+5,q.z+2));h.cm.addCollider(wall,'proof-inward-wall');}
  else{npc=characterBody({id:'proof-guard',pose:'standing'},{position:[q.x-.9,q.feet,q.z]});h.cm.setDynamicBodies('proof',[npc]);}
  for(let i=0;i<fps*4;i++){const p=h.frame(fps,-1,0,i%fps===0),box=new T.Box3(new T.Vector3(p.x-.5,p.feet+1e-6,p.z-.5),new T.Vector3(p.x+.5,p.feet+1.7,p.z+.5));if(wall)assert.equal(box.intersectsBox(wall),false,`${fps} wall ${i}`);if(npc)assert.ok(bodyPenetration(npc,{position:[p.x,p.feet,p.z],radius:.5,height:1.7})<=1e-7,`${fps} NPC ${i}`);assert.ok(p.x>q.x-.5,'must not tunnel through blocker');}
 }finally{h.dispose();}}
});
test('A ceiling or NPC introduced after takeoff cannot be crossed by subsequent vertical recovery frames',async t=>{
 for(const fps of[10,30,60])for(const kind of['ceiling','npc']){const h=await recoveryFixture(t);try{h.drop(fps);h.frame(fps,-1,0,true);const q=h.pose();assert.ok(h.ctrl.verticalVelocity>0);let ceiling,npc;
  if(kind==='ceiling'){ceiling=new T.Box3(new T.Vector3(q.x-4,q.feet+1.75,q.z-2),new T.Vector3(q.x+1,q.feet+2,q.z+2));h.cm.addCollider(ceiling,'proof-late-ceiling');}
  else{npc=characterBody({id:'proof-late-overhead',pose:'standing'},{position:[q.x-.1,q.feet+1.75,q.z]});h.cm.setDynamicBodies('proof',[npc]);}
  for(let i=0;i<fps*2;i++){const p=h.frame(fps,-1,0),box=new T.Box3(new T.Vector3(p.x-.5,p.feet+1e-6,p.z-.5),new T.Vector3(p.x+.5,p.feet+1.7,p.z+.5));if(ceiling)assert.equal(box.intersectsBox(ceiling),false,`${fps} late ceiling ${i}`);if(npc)assert.ok(bodyPenetration(npc,{position:[p.x,p.feet,p.z],radius:.5,height:1.7})<=1e-7,`${fps} late NPC ${i}`);}
 }finally{h.dispose();}}
});
test('All three bridge instances on both outside sides recover to real deck at 10/30/60Hz',async t=>{
 for(const fps of[10,30,60])for(let index=0;index<3;index++)for(const side of[-1,1]){const h=await recoveryFixture(t);try{const b=h.water.profile.bridges.find(b=>b.id===`wuying-${index+1}`);h.position(b.x+side*(b.width/2+.53),b.z-3,6);for(let i=0;i<fps*2;i++)h.frame(fps);assert.equal(h.ctrl.airborne,true);let escaped=false;
  for(let i=0;i<fps*4;i++){const p=h.frame(fps,-side,0,i%fps===0);if(Math.abs(p.x-b.x)<b.width/2-.6&&p.feet<.5&&!h.ctrl.airborne){escaped=true;break;}}
  assert.ok(escaped,`${b.id}/${side}/${fps}`);
 }finally{h.dispose();}}
});
test('Keyboard nonrepeat Space and the same mobile jump action can request recovery; focused/repeated input cannot',async t=>{
 for(const input of['keyboard','mobile-action']){const h=await recoveryFixture(t);try{h.drop();h.aim(-1,0);h.ctrl.velocity.z=3;h.ctrl.onKeyDown({code:'KeyW',repeat:false,preventDefault(){}});
  h.ctrl.onKeyDown({code:'Space',repeat:true,preventDefault(){}});assert.equal(h.ctrl.jumpQueued,false);h.ctrl.onKeyDown({code:'Space',target:{closest(){return {tagName:'INPUT'};}},preventDefault(){}});assert.equal(h.ctrl.jumpQueued,false);
  if(input==='keyboard')h.ctrl.onKeyDown({code:'Space',repeat:false,preventDefault(){}});else{const old=document.createElement;try{const handlers={};document.createElement=()=>({style:{},setAttribute(){},addEventListener:(kind,fn)=>{handlers[kind]=fn;},removeEventListener(){},remove(){}});h.ctrl.domElement.appendChild=()=>{};h.ctrl.createJumpButton();handlers.touchstart({preventDefault(){},stopPropagation(){}});}finally{document.createElement=old;}}const before=h.ctrl.feetY;h.advance(1000/30);h.ctrl.update();assert.ok(h.ctrl.verticalVelocity>0&&h.ctrl.feetY>before,input);
 }finally{h.dispose();}}
});
test('Nonfinite velocity and malformed mutable scene state fail closed before or after issuance',async t=>{const h=await recoveryFixture(t);try{h.drop();h.aim(-1,0);h.ctrl.velocity.z=3;h.ctrl.jump();h.ctrl._wuyingRecovery.observe({forward:3,right:0});h.ctrl.verticalVelocity=NaN;assert.equal(h.ctrl._wuyingRecovery.tryJump(),null,'NaN is not stationary');h.ctrl.verticalVelocity=0;assert.equal(h.grant(),4.8);h.ctrl.verticalVelocity=NaN;assert.equal(attempt(h).allow(),false,'NaN cannot sustain a flight token');h.ctrl.verticalVelocity=0;h.advance(1600);const rivers=h.cm.rivers;h.cm.rivers=null;h.ctrl.jump();assert.equal(h.ctrl._wuyingRecovery.tryJump(),null);h.cm.rivers=rivers;assert.equal(h.grant(),4.8);h.cm.rivers=null;assert.equal(attempt(h).allow(),false);h.cm.rivers=rivers;}finally{h.dispose();}});
test('Even a valid ticket grants no other caller a manager-wide river exception outside its player movement transaction',async t=>{const h=await recoveryFixture(t);try{h.drop();assert.equal(h.grant(),4.8);const a=attempt(h);assert.equal(h.contract.allowsRiver(h.cm,h.river,a.from,a.to,.5,a.q.feet,a.q.feet),false);assert.equal(a.allow(),true,'actual private player movement transaction still gets its scoped decision');assert.equal(h.contract.allowsRiver(h.cm,h.river,a.from,a.to,.5,a.q.feet,a.q.feet),false,'transaction must close after the decision');}finally{h.dispose();}});
test('The movement window attests actual frame origin and proposed camera target and closes on throw',async t=>{const h=await recoveryFixture(t);try{h.drop();assert.equal(h.grant(),4.8);const a=attempt(h),decide=()=>h.contract.allowsRiver(h.cm,h.river,a.from,a.to,.5,a.q.feet,a.q.feet),session=h.ctrl._wuyingRecovery;
 assert.equal(session.withMovement(a.from,a.to,decide),false,'camera is not at the claimed proposed target');const original=h.camera.position.clone();h.camera.position.copy(a.to);
 assert.equal(session.withMovement(a.from.clone().add(new T.Vector3(.001,0,0)),a.to,decide),false,'forged frame origin');
 assert.throws(()=>session.withMovement(a.from,a.to,()=>session.withMovement(a.from,a.to,decide)),/non-reentrant/);assert.equal(decide(),false);
 assert.throws(()=>session.withMovement(a.from,a.to,()=>{assert.equal(decide(),true);throw Error('movement aborted');}),/movement aborted/);assert.equal(decide(),false,'failed movement cannot leave privilege active');h.camera.position.copy(original);
 }finally{h.dispose();}});
