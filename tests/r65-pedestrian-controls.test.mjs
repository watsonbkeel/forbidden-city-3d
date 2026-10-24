import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {createDOM} from './lib/ui-dom.mjs';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {PLAYER} from '../src/config/constants.js';
import {characterBody,bodyIntersectsPlayer} from '../src/scene/characters/CharacterBody.js';
import {CharacterInteraction} from '../src/scene/characters/CharacterInteraction.js';
import {FlightTour} from '../src/scene/flight/FlightTour.js';
import {FlightEnvelope} from '../src/scene/flight/FlightEnvelope.js';

// CPU input integration, not browser/GPU evidence. Real production controllers,
// pointer-lock mouse listeners, physics and aircraft exit selection run unchanged.
function fixture(t,{position=[0,0,3]}={}) {
  const d=createDOM(),saved=new Map(['document','window','navigator','performance'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  let now=1000;
  for(const [key,value] of Object.entries({document:d.document,window:d.window,navigator:{userAgent:'R65 desktop fixture',maxTouchPoints:0},performance:{now:()=>now}}))Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
  d.document.head=d.document.createElement('head');
  Object.defineProperty(d.Element.prototype,'ownerDocument',{get:()=>d.document});
  Object.defineProperty(d.Element.prototype,'dataset',{get(){return Object.fromEntries([...this.attributes].filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));}});
  d.Element.prototype.blur=function(){if(d.document.activeElement===this)d.document.activeElement=d.document.body;};
  const canvas=d.document.createElement('canvas');d.document.body.appendChild(canvas);
  canvas.requestPointerLock=()=>{d.document.pointerLockElement=canvas;d.dispatch(d.document,'pointerlockchange');};
  d.document.exitPointerLock=()=>{d.document.pointerLockElement=null;d.dispatch(d.document,'pointerlockchange');};
  const camera=new THREE.PerspectiveCamera(),cm=new CollisionManager(),controls=new FirstPersonControls(camera,canvas,cm);
  controls.setHeadBob(false);controls.setPosition(position[0],position[1]+PLAYER.HEIGHT,position[2]);controls.lock();
  let flight;
  t.after(()=>{flight?.dispose();controls.dispose();for(const [k,v]of saved){if(v)Object.defineProperty(globalThis,k,v);else delete globalThis[k];}});
  const key=(code,type='keydown',extra={})=>d.dispatch(d.document.body,type,{code,...extra});
  return {...d,camera,cm,controls,key,
    mouse(x,y=0){d.dispatch(d.document,'mousemove',{movementX:x,movementY:y});},
    step(dt=1/60){now+=dt*1000;controls.update();},
    player(){return{position:[camera.position.x-controls.bobOffset.x,controls.feetY,camera.position.z-controls.bobOffset.z],radius:.5,height:PLAYER.HEIGHT};},
    flight(){flight=new FlightTour({scene:new THREE.Scene(),camera,controls,collisionManager:cm,zoneManager:{ensureLoadedAt(){}},envelope:new FlightEnvelope()});return flight;},
  };
}
function person(pose='standing',position=[0,0,0],id='person',variant='standard') {
  return characterBody({id,templateId:'guard-duty',behavior:{basePose:pose,seatVariant:variant}},{position,rotationYRad:0});
}
function assertClear(f,body,message='player must not penetrate a pedestrian') {assert.equal(bodyIntersectsPlayer(body,f.player()),false,message);}

const starts={KeyW:[0,0,3],KeyS:[0,0,-3],KeyA:[3,0,0],KeyD:[-3,0,0]};
for(const fps of [10,60])for(const pose of ['standing','seated'])for(const sprint of [false,true])for(const code of Object.keys(starts)) {
  test(`real PC ${code}, ${pose}, ${sprint?'sprint':'walk'}, ${fps} fps blocks without tunnelling`,t=>{
    const f=fixture(t,{position:starts[code]}),body=person(pose);f.cm.setDynamicBodies('people',[body]);
    const before=f.camera.position.clone();f.key(code);if(sprint)f.key('ShiftLeft');
    for(let i=0;i<Math.ceil(fps*1.2);i++){f.step(1/fps);assertClear(f,body,`${code} frame ${i}`);assert.equal(f.controls.feetY,0);}
    assert.ok(f.camera.position.distanceTo(before)>1,'actual keyboard events must move the player before contact');
    assert.ok(f.camera.position.x*before.x+f.camera.position.z*before.z>0,'cannot cross through the person');
    assert.equal(f.controls.airborne,false);assert.equal(f.cm.supportHeight(0,0,10),-Infinity);assert.equal(f.cm.getGroundHeight(0,0,10),0);
  });
}
for(const fps of [10,60])test(`real mouse yaw changes WASD direction before same-frame dynamic collision at ${fps} fps`,t=>{
  const f=fixture(t,{position:[3,0,0]}),body=person();f.cm.setDynamicBodies('people',[body]);
  f.mouse(-Math.PI/(2*.002),150);f.key('KeyW');f.key('ShiftLeft');
  for(let i=0;i<fps;i++){f.step(1/fps);assertClear(f,body);}
  assert.ok(f.camera.position.x<2&&f.camera.position.x>.65);assert.ok(Math.abs(f.camera.position.z)<1e-8);assert.equal(f.controls.feetY,0);
});
test('real controller movement rejects a short grazing chord whose two endpoints are clear',t=>{
  const f=fixture(t,{position:[-.125,0,.837]}),body=person();f.cm.setDynamicBodies('people',[body]);
  assertClear(f,body);assert.equal(f.cm.checkDynamicCollision(new THREE.Vector3(.125,PLAYER.HEIGHT,.837)),false);
  // 5 m/s for 0.05 s is one 0.25 m solver substep. Both endpoints
  // are clear, but its interior crosses the torso capsule by 3 mm.
  f.controls.velocity.x=PLAYER.MOVE_SPEED;f.key('KeyD');f.step(.05);
  assertClear(f,body);assert.ok(f.camera.position.x<0,'do not accept an endpoint-only grazing sweep');
});
for(const pose of ['standing','seated'])for(const fps of [10,60])test(`real jump hits ${pose} lower body from below at ${fps} fps`,t=>{
  const f=fixture(t,{position:[0,0,0]}),body=person(pose,[0,2.5,0]);f.cm.setDynamicBodies('people',[body]);
  f.key('Space');let highest=0,sawContact=false;
  for(let i=0;i<fps;i++){f.step(1/fps);highest=Math.max(highest,f.controls.feetY);sawContact||=f.controls.airborne&&f.controls.verticalVelocity===0;assertClear(f,body);}
  assert.ok(highest>.3&&highest<=.8000001);assert.ok(sawContact,'upward body sweep must cancel vertical velocity');assert.equal(f.controls.groundY,0);
});
for(const pose of ['standing','seated'])for(const fps of [10,60])test(`downward ${pose} contact is not ground or a jump reset at ${fps} fps`,t=>{
  const f=fixture(t,{position:[0,0,0]}),body=person(pose);f.cm.setDynamicBodies('people',[body]);
  f.controls.feetY=4;f.controls.airborne=true;f.controls.verticalVelocity=-6;f.camera.position.y=4+PLAYER.HEIGHT;
  const top=Math.max(...body.parts.map(p=>p.maxY));
  for(let i=0;i<fps*2;i++){f.step(1/fps);assertClear(f,body);assert.equal(f.controls.groundY,0);assert.equal(f.controls.onSupport,false);assert.equal(f.controls._landed,false);}
  assert.ok(Math.abs(f.controls.feetY-top)<1e-7);assert.equal(f.controls.airborne,true);
  f.key('Space');f.step(1/fps);assert.ok(Math.abs(f.controls.feetY-top)<1e-7,'body contact must not permit a second jump');assert.equal(f.controls.jumpQueued,false);
  f.key('KeyD');for(let i=0;i<fps*2;i++){f.step(1/fps);assertClear(f,body);}
  assert.equal(f.controls.feetY,0);assert.equal(f.controls.airborne,false);assert.ok(f.camera.position.x>2,'leaving temporary contact must continue normal fall');
});
for(const fps of [10,60])test(`real controller can traverse another floor above a person at ${fps} fps`,t=>{
  const f=fixture(t,{position:[-3,0,0]}),body=person();f.cm.setDynamicBodies('people',[body]);
  f.cm.addWalkable({type:'box',box:new THREE.Box3(new THREE.Vector3(-20,2.8,-20),new THREE.Vector3(20,3,20)),rescue:false},'upper-floor');
  f.controls.setPosition(-3,3+PLAYER.HEIGHT,0);f.key('KeyD');
  for(let i=0;i<fps*1.5;i++){f.step(1/fps);assertClear(f,body);assert.equal(f.controls.feetY,3);}
  assert.ok(f.camera.position.x>3);assert.equal(f.controls.airborne,false);
});
test('dynamic contact leaves normal ground jump and landing behavior intact',t=>{
  const f=fixture(t,{position:[3,0,0]}),body=person();f.cm.setDynamicBodies('people',[body]);f.key('Space');let top=0,landed=false;
  for(let i=0;i<150;i++){f.step(1/60);assertClear(f,body);top=Math.max(top,f.controls.feetY);landed||=f.controls._landed;}
  assert.ok(top>1.5);assert.ok(landed);assert.equal(f.controls.airborne,false);assert.equal(f.controls.feetY,0);
});
function exitCandidates(flight) {
  const offsets=[...flight.model.exitOffsets,...flight.model.exitOffsets.map(p=>new THREE.Vector3(p.x*2,0,p.z))],c=Math.cos(flight.state.yaw),s=Math.sin(flight.state.yaw);
  return offsets.map(p=>new THREE.Vector3(flight.position.x+p.x*c+p.z*s,PLAYER.HEIGHT,flight.position.z-p.x*s+p.z*c));
}
for(const blocked of [1,3])test(`actual FlightTour exit skips ${blocked} NPC-blocked candidate${blocked===1?'':'s'} and chooses next safe exit`,t=>{
  const f=fixture(t,{position:[22,0,-494]}),flight=f.flight();assert.ok(flight.board());const exits=exitCandidates(flight);
  f.cm.setDynamicBodies('exit-people',exits.slice(0,blocked).map((p,i)=>person('standing',[p.x,0,p.z],`exit-${i}`)));
  assert.ok(flight.exit());assert.equal(flight.occupied,false);assert.ok(f.camera.position.distanceTo(exits[blocked])<1e-8);assert.equal(f.cm.checkCollision(f.camera.position,.5),false);assert.equal(f.controls.airborne,false);assert.equal(f.controls.feetY,0);
});
test('actual FlightTour rejects disembarkation when all four candidates are occupied by NPCs',t=>{
  const f=fixture(t,{position:[22,0,-494]}),flight=f.flight();assert.ok(flight.board());const exits=exitCandidates(flight),before=f.camera.position.clone();
  f.cm.setDynamicBodies('exit-people',exits.map((p,i)=>person('seated',[p.x,0,p.z],`exit-${i}`)));
  assert.equal(flight.exit(),false);assert.equal(flight.occupied,true);assert.deepEqual(f.camera.position.toArray(),before.toArray());assert.match(flight.state.status,/受阻/);
});
test('actual FlightTour exit ignores a different-floor NPC rather than rejecting a safe ground exit',t=>{
  const f=fixture(t,{position:[22,0,-494]}),flight=f.flight();assert.ok(flight.board());const exits=exitCandidates(flight);
  f.cm.setDynamicBodies('upstairs',[person('standing',[exits[0].x,3,exits[0].z])]);assert.ok(flight.exit());assert.ok(f.camera.position.distanceTo(exits[0])<1e-8);
});
test('production main callback passes null in every actual flight view and restores feet, not follow-camera body',t=>{
  const f=fixture(t,{position:[22,0,-494]}),flight=f.flight(),app={flight,camera:f.camera,controls:f.controls};
  const main=readFileSync(new URL('../main.js',import.meta.url),'utf8');
  const match=main.match(/getPlayerState:(\(\)=>[\s\S]*?height:PLAYER\.HEIGHT})\s*}\);/);
  assert.ok(match,'locate the actual production callback rather than silently substituting test behavior');
  const getPlayerState=Function('PLAYER',`return (${match[1]});`).call(app,PLAYER);
  const interaction=new CharacterInteraction({collisionManager:f.cm,getPlayerState,registry:{actors:[]}});t.after(()=>interaction.dispose());
  assert.deepEqual(getPlayerState().position,[22,0,-494]);assert.ok(flight.board());
  for(const view of ['pilot','follow','overhead']){flight.setView(view);flight.updateCamera();assert.equal(getPlayerState(),null);interaction.begin([],1/60);assert.equal(interaction.player,null);}
  assert.ok(flight.exit());const p=getPlayerState();assert.equal(p.position[1],f.controls.feetY);assert.equal(p.height,PLAYER.HEIGHT);assert.equal(p.radius,.5);
  f.controls.bobOffset.set(.012,.035,-.008);f.camera.position.add(f.controls.bobOffset);assert.ok(Math.abs(getPlayerState().position[0]-p.position[0])<1e-8);assert.ok(Math.abs(getPlayerState().position[2]-p.position[2])<1e-8);
  f.controls.groundY=2;assert.equal(getPlayerState().position[1],2);f.controls.airborne=true;f.controls.feetY=.8;assert.equal(getPlayerState().position[1],.8);
});
for(const pose of ['standing','seated'])for(const fps of [10,60])test(`combined sprint and jump never penetrates ${pose} body at ${fps} fps`,t=>{
  const f=fixture(t,{position:[0,0,3]}),body=person(pose);f.cm.setDynamicBodies('people',[body]);
  f.key('KeyW');f.key('ShiftLeft');f.key('Space');let rose=false;
  for(let i=0;i<fps*2;i++){f.step(1/fps);rose||=f.controls.feetY>.3;assertClear(f,body,`combined jump and sprint frame ${i}`);}
  assert.ok(rose,'jump input must really execute');assert.equal(f.controls.groundY,0);assert.equal(f.controls.onSupport,false);
});
for(const fps of [10,60])test(`real controls escape an existing overlap outward without crossing the body at ${fps} fps`,t=>{
  const f=fixture(t,{position:[.1,0,0]}),body=person();f.cm.setDynamicBodies('people',[body]);assert.equal(bodyIntersectsPlayer(body,f.player()),true);
  f.key('KeyD');let previous=.1;
  for(let i=0;i<fps;i++){f.step(1/fps);assert.ok(f.camera.position.x>=previous-1e-8);previous=f.camera.position.x;}
  assertClear(f,body);assert.ok(f.camera.position.x>3);
});
test('default head bob does not accumulate or turn an NPC into ground while movement is blocked',t=>{
  const f=fixture(t),body=person();f.cm.setDynamicBodies('people',[body]);f.controls.setHeadBob(true);f.key('KeyW');f.key('ShiftLeft');
  for(let i=0;i<180;i++){f.step(1/60);assertClear(f,body);assert.equal(f.controls.feetY,0);assert.equal(f.controls.groundY,0);}
  assert.ok(f.controls.bobOffset.length()<1e-5);assert.ok(Math.abs(f.camera.position.y-PLAYER.HEIGHT)<1e-5);
});
