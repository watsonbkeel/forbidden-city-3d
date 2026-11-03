import '../lib/inner-palace-fixture.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PalaceBuilder} from '../../src/scene/PalaceBuilder.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {withTerrainController} from '../lib/r91-controller-clock.mjs';
import {qianqingGroundedFloorHandoff,furnitureBodySweep} from '../../src/controls/FurnitureMotion.js';

// Real retained gate, common terrace, hall lip, folded doors and furnishings.
// Only unrelated zones and browser transport are omitted from this CPU fixture.
const builder=new PalaceBuilder(new THREE.Scene(),realTextureLibrary());
builder.buildAll(PALACE_LAYOUT.filter(p=>['乾清门','乾清宫','交泰殿','坤宁宫'].includes(p.name)));
const cm=new CollisionManager();cm.addColliders(builder.colliders,'static');cm.addWalkables(builder.walkables,'static');
const W={THREE,cm};
for(const x of [-2,0,2])for(const fps of [60,10])for(const sprint of [false,true])for(const backward of [false,true]) {
 test(`Qianqing south approach and door roundtrip x=${x}, ${fps}Hz, sprint=${sprint}, backward=${backward}`,t=>{
  const result=replayKunning(t,W,[[x,294],[x,314],[x,294]],{startFeet:1.5,fps,sprint,backward,recordFrames:true});
  assert.equal(result.arrived,true);
  const unsafe=result.frames.filter(f=>!Number.isFinite(f.feet)||f.feet<1.45||f.ground<1.45);
  assert.deepEqual(unsafe.slice(0,2),[],'native-to-exact floor handoff cannot discard the existing 2m terrace');
  assert.ok(result.maxFeet>=2.16,'must enter the hall, not merely report an XZ endpoint below it');
  assert.equal(result.end[2],1.5);
 });
}
for(const fps of [60,10])test(`release and reverse immediately after the south-domain boundary ${fps}Hz`,()=>{
 withTerrainController(cm,(c,camera,tick)=>{
  c.setPosition(0,3.2,294);camera.lookAt(0,3.2,314);camera.updateMatrixWorld(true);
  c.moveForward=true;c.canSprint=true;
  for(let n=0;camera.position.z<301.5&&n<fps*3;n++)tick(fps);
  assert.ok(camera.position.z>=301.5);assert.ok(c.feetY>=2);assert.equal(c.airborne,false);
  c.stop();for(let n=0;n<fps;n++)tick(fps);
  assert.ok(c.feetY>=2);assert.equal(c.airborne,false);
  c.moveBackward=true;for(let n=0;n<fps*2;n++)tick(fps);
  c.stop();for(let n=0;n<fps;n++)tick(fps);
  assert.ok(camera.position.z<298);assert.equal(c.feetY,1.5);assert.equal(c.airborne,false);
 });
});
test('handoff requires the live exact floor, grounded player, bounded lag and unobstructed full-body lift',()=>{
 const from=new THREE.Vector3(0,1.9,301.4),to=new THREE.Vector3(0,1.9,301.6),motion={kind:'player',airborne:false};
 const query=(m=motion,g=2,p=from)=>qianqingGroundedFloorHandoff(cm,p,to,g,m,.5);
 assert.equal(query(),2);
 assert.equal(query({...motion,airborne:true}),null);
 assert.equal(query({kind:'kinematic',airborne:false}),null);
 assert.equal(query(motion,2,new THREE.Vector3(0,1.3,301.4)),null);
 assert.equal(query(motion,1.5),null);
 const index=cm.walkables.findIndex(w=>w.type==='box'&&w.box.min.x===-28&&w.box.min.z===298.3&&w.box.max.y===2),floor=cm.walkables[index];
 assert.ok(index>=0);cm.walkables.splice(index,1);
 try{assert.equal(query(),null,'removed source cannot leave a synthetic floor');}finally{cm.walkables.splice(index,0,floor);}
 cm.walkables[index]={...floor,box:floor.box.clone().translate(new THREE.Vector3(0,.1,0))};
 try{assert.equal(query(),null,'changed source cannot retain the previous floor');}finally{cm.walkables[index]=floor;}
 cm.addCollider(new THREE.Box3(new THREE.Vector3(-1,3.65,300.8),new THREE.Vector3(1,3.75,302)),'handoff-head-blocker');
 try{assert.equal(query(),false,'blocked lift is distinct from an inapplicable handoff');}finally{cm.removeByTag('handoff-head-blocker');}
 cm.setDynamicBodies('handoff-actor',[{id:'handoff-actor',parts:[{ax:0,az:301.4,bx:0,bz:301.4,radius:.2,minY:3.65,maxY:3.75}]}]);
 try{assert.equal(query(),false,'dynamic bodies must also block the lift');}finally{cm.clearDynamicBodies('handoff-actor');}
});
for(const blockerKind of ['static','dynamic'])for(const fps of [60,10])test(`${blockerKind} blocked sprint handoff holds a safe pose and resumes after clearance ${fps}Hz`,()=>{
 withTerrainController(cm,(c,camera,tick)=>{
  c.setPosition(0,3.2,294);camera.lookAt(0,3.2,314);camera.updateMatrixWorld(true);
  c.moveForward=true;c.canSprint=true;
  // Approach at 60Hz, then include a frame-rate drop to 10Hz. Preserve the
  // real smoothed feet instead of manufacturing a controller state.
  for(let n=0;camera.position.z<301.2&&n<180;n++)tick(60);
  const capY=c.feetY+1.7+.001;
  if(blockerKind==='dynamic')cm.setDynamicBodies('entry-head-blocker',[{id:'entry-head-blocker',parts:[{ax:0,az:301.4,bx:0,bz:301.4,radius:.6,minY:capY,maxY:3.9}]}]);
  else cm.addCollider(new THREE.Box3(new THREE.Vector3(-.6,capY,300.8),new THREE.Vector3(.6,3.9,302)),'entry-head-blocker');
  try{
   for(let n=0;n<fps*2;n++){
    tick(fps);
    assert.ok(c.feetY>=1.45,'blocked handoff must never start falling through the terrace');
    assert.equal(c.airborne,false,'blocking the clearance must not lose grounded contact');
    const feet=new THREE.Vector3(camera.position.x-c.bobOffset.x,c.feetY,camera.position.z-c.bobOffset.z);
    assert.equal(furnitureBodySweep(cm,feet,feet,.5),null,'hold keeps the complete body outside all static and dynamic blockers');
   }
   c.stop();for(let n=0;n<fps;n++)tick(fps);
   assert.ok(c.feetY>=1.45);assert.equal(c.airborne,false);
   c.jump();tick(fps);assert.ok(c.feetY>=1.45);assert.equal(c.airborne,false,'a blocked pending handoff cannot initiate a below-floor jump');
  }finally{cm.clearDynamicBodies('entry-head-blocker');cm.removeByTag('entry-head-blocker');}
  c.moveForward=true;c.canSprint=true;
  for(let n=0;camera.position.z<313&&n<fps*3;n++)tick(fps);
  assert.ok(camera.position.z>=313,'clearing the obstruction must restore normal entry');
  assert.ok(c.feetY>=2.16);assert.equal(c.airborne,false);
 });
});
test('a blocked pending handoff cannot cache a removed terrace floor',()=>{
 const from=new THREE.Vector3(0,1.9,301.4),motion={kind:'player',airborne:false};
 cm.setDynamicBodies('pending-floor-blocker',[{id:'pending-floor-blocker',parts:[{ax:0,az:301.4,bx:0,bz:301.4,radius:.2,minY:3.65,maxY:3.75}]}]);
 const index=cm.walkables.findIndex(w=>w.type==='box'&&w.box.min.x===-28&&w.box.min.z===298.3&&w.box.max.y===2),floor=cm.walkables[index];
 const state={x:0,z:301.4,feetY:1.9,groundY:2,airborne:false,verticalVelocity:0};
 try{
  assert.equal(qianqingGroundedFloorHandoff(cm,from,from,2,motion),false);
  const held=cm.resolveFurnitureVertical(state,.1,.5);assert.equal(held.feetY,1.9);assert.equal(held.groundY,2);
  cm.walkables.splice(index,1);
  const noFloor=cm.resolveFurnitureVertical(state,.1,.5);assert.ok(noFloor.feetY<1.9);assert.equal(noFloor.airborne,true);
 }finally{if(!cm.walkables.includes(floor))cm.walkables.splice(index,0,floor);cm.clearDynamicBodies('pending-floor-blocker');}
});
