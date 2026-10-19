import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createDOM } from '../lib/ui-dom.mjs';
import { FlightTour } from '../../src/scene/flight/FlightTour.js';
import { FlightEnvelope } from '../../src/scene/flight/FlightEnvelope.js';
import { CollisionManager } from '../../src/utils/Collision.js';

function fixture(t,{mobile=false}={}){
  const d=createDOM(),old={document:globalThis.document,window:globalThis.window};
  Object.assign(globalThis,{document:d.document,window:d.window});
  d.document.head=d.document.createElement('head');
  Object.defineProperty(d.Element.prototype,'dataset',{get(){return Object.fromEntries([...this.attributes].filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));}});
  d.Element.prototype.blur=function(){if(d.document.activeElement===this)d.document.activeElement=d.document.body;};
  const camera=new THREE.PerspectiveCamera(),canvas=d.document.createElement('canvas');d.document.body.appendChild(canvas);camera.position.set(22,1.7,-494);
  let locks=0,unlocks=0,stops=0,paused=false;
  const controls={camera,domElement:canvas,isMobile:mobile,mapOpen:false,controls:{isLocked:false},motion:{},stop(){stops++;},lock(){locks++;},unlock(){unlocks++;d.document.pointerLockElement=null;d.dispatch(d.document,'pointerlockchange');},setPosition(x,y,z){camera.position.set(x,y,z);},lookAt(x,z){camera.lookAt(x,camera.position.y,z);}};
  const f=new FlightTour({scene:new THREE.Scene(),camera,controls,collisionManager:new CollisionManager(),zoneManager:{ensureLoadedAt(){}},envelope:new FlightEnvelope(),isPaused:()=>paused});
  t.after(()=>{f.dispose();Object.assign(globalThis,old);});
  const lock=()=>{d.document.pointerLockElement=canvas;d.dispatch(d.document,'pointerlockchange');controls.controls.isLocked=true;};
  const unlock=()=>{d.document.pointerLockElement=null;d.dispatch(d.document,'pointerlockchange');controls.controls.isLocked=false;};
  const key=(code,extra={})=>d.dispatch(d.document.body,'keydown',{code,...extra});
  const board=()=>{assert(f.board());lock();};
  return {...d,f,controls,board,lock,unlock,key,setPaused:v=>paused=v,counts:()=>({locks,unlocks,stops})};
}
test('native unlock alone opens clickable paused operations and preserves the auto route',t=>{
  const {f,board,unlock,document}=fixture(t);board();f.state.position.y=20;f.state.startTour();f.keys.add('Space');f.pointers.set(1,{axis:'forward',value:1});
  unlock();assert.equal(f.operationsOpen,true);assert.equal(document.pointerLockElement,null);assert.equal(f.panel.open,true);assert.equal(f.keys.size,0);assert.equal(f.pointers.size,0);
  const p={...f.position},path=JSON.stringify(f.state.path);for(let i=0;i<10;i++)f.update(.1,i*100);
  assert.deepEqual(f.position,p);assert.equal(JSON.stringify(f.state.path),path);assert.equal(f.state.mode,'auto');assert.match(f.pauseNotice.textContent,/暂停/);assert.equal(f.boardButton.disabled,true);
});
test('Escape before or after unlock is idempotent; repeated Escape cannot resume flight',t=>{
  const {f,board,key,unlock,counts}=fixture(t);board();key('Escape');assert(f.operationsOpen);unlock();const n=counts().unlocks;key('Escape');assert(f.operationsOpen);assert.equal(counts().unlocks,n);
});
test('map release alone keeps flight moving; panel with map wins until explicit resume',t=>{
  const {f,board,unlock,controls,key,counts}=fixture(t);board();f.state.position.y=10;controls.mapOpen=true;unlock();assert(!f.operationsOpen);key('KeyW');const z=f.position.z;f.update(.1,100);assert(f.position.z>z);
  key('Escape');assert(f.operationsOpen);assert(!key('KeyM').defaultPrevented);const p={...f.position};f.update(.1,200);assert.deepEqual(f.position,p);
  const n=counts().locks;assert(f.resumeOperations());assert(!f.operationsOpen);assert.equal(counts().locks,n);key('KeyW');f.update(.1,300);assert(f.position.z>p.z);
});
test('resume requests pointer lock once, stays paused until actual success, clears stale repeats',t=>{
  const {f,board,unlock,key,lock,counts}=fixture(t);board();f.state.position.y=20;key('Space');unlock();assert(f.resumeOperations());assert(f.operationsOpen);assert.equal(counts().locks,1);f.resumeOperations();assert.equal(counts().locks,1);
  lock();assert(!f.operationsOpen);assert.equal(f.keys.size,0);key('Space',{repeat:true});assert.equal(f.axes().vertical,0);key('Space');assert.equal(f.axes().vertical,1);
});
test('pointer lock failure retains visible paused controls and permits a fresh click retry',t=>{
  const {f,board,unlock,dispatch,document,counts}=fixture(t);board();unlock();f.resumeOperations();dispatch(document,'pointerlockerror');assert(f.operationsOpen);assert(!f.resumePending);assert.match(f.pauseNotice.textContent,/鼠标/);f.resumeOperations();assert.equal(counts().locks,2);
});
for(const mode of ['manual','auto'])test(`${mode} descent opens operations only after airborne aircraft stops on ground`,t=>{
  const {f,board,document}=fixture(t);board();f.update(.1,1);assert(!f.operationsOpen);f.state.position.y=1.8;
  if(mode==='auto'){f.state.mode='auto';f.state.path=[{...f.position,y:0,name:'降落'}];}else f.keys.add('KeyC');
  for(let i=0;i<8&&!f.operationsOpen;i++)f.update(.1,100+i*100);
  assert(f.state.grounded);assert.equal(f.state.speed,0);assert(f.operationsOpen);assert.equal(document.pointerLockElement,null);assert.equal(f.boardButton.disabled,false);assert.equal(f.boardButton.textContent,'下飞机 H');
});
test('real exit from operations restores walking camera, clears input, remains outside parked collision, can reboard',t=>{
  const {f,board,key,controls}=fixture(t);board();f.setView('overhead');f.updateCamera();key('Escape');f.keys.add('KeyW');assert(f.exit());assert(!f.occupied);assert(!f.operationsOpen);assert.equal(f.keys.size,0);assert.deepEqual(f.camera.up.toArray(),[0,1,0]);assert(!f.cm.checkCollision(f.camera.position,.5));assert.equal(controls.lookLocked,undefined);assert(f.canBoard());assert(f.board());assert(!f.operationsOpen);
});
test('airborne exit rejected, settings pause keeps input clear, and mobile explicit resume needs no lock',t=>{
  const {f,board,setPaused,key,counts}=fixture(t,{mobile:true});board();f.state.position.y=10;key('Escape');assert(!f.exit());assert(f.occupied);assert(f.resumeOperations());assert(!f.operationsOpen);assert.equal(counts().locks,0);setPaused(true);key('Space');f.update(.1,100);assert.equal(f.keys.size,0);assert.equal(f.position.y,10);
});
test('all three view switches leave paused pose and route unchanged',t=>{
  const {f,board,key}=fixture(t);board();f.state.position.y=15;f.state.startTour();key('Escape');const p={...f.position},path=JSON.stringify(f.state.path);for(const view of['pilot','follow','overhead']){assert(f.setView(view));f.update(.1,100);assert.deepEqual(f.position,p);assert.equal(JSON.stringify(f.state.path),path);assert(f.camera.quaternion.toArray().every(Number.isFinite));}
});
test('Space on a focused operations button retains native click activation',t=>{
  const {f,board,key,dispatch}=fixture(t);board();key('Escape');const e=dispatch(f.resumeButton,'keydown',{code:'Space',key:' '});assert(!e.defaultPrevented);assert.equal(f.keys.size,0);
});
test('a missing pointer lock result expires only the request, never silently resumes',t=>{
  t.mock.timers.enable({apis:['setTimeout']});const {f,board,unlock,counts}=fixture(t);board();unlock();f.resumeOperations();assert(f.resumePending);t.mock.timers.tick(3001);assert(f.operationsOpen);assert(!f.resumePending);assert(!f.resumeButton.disabled);f.resumeOperations();assert.equal(counts().locks,2);
});
test('own unlock preserves landing notice and duplicate notifications do not reset resume request',t=>{
  const {f,board,document}=fixture(t);board();f.openOperations('landed');assert.match(f.pauseNotice.textContent,/安全停稳/);assert.equal(document.pointerLockElement,null);f.resumeOperations();const timer=f.resumeTimer;f.openOperations();assert(f.resumePending);assert.equal(f.resumeTimer,timer);
});
test('map opened while lock request is pending remains unlocked when late lock succeeds',t=>{
  const {f,board,key,controls,lock,document}=fixture(t);board();key('Escape');f.resumeOperations();controls.mapOpen=true;lock();assert(!f.operationsOpen);assert.equal(document.pointerLockElement,null);assert.equal(controls.mapOpen,true);
});
test('Escape on the final ground-contact frame can disembark without resuming one extra frame',t=>{
  const {f,board,key}=fixture(t);board();f.hasFlown=true;f.state.position.y=0;f.state.speed=9;key('Escape');assert(f.operationsOpen);assert(f.canExit());assert(!f.boardButton.disabled);assert(f.exit());assert(!f.occupied);
});
test('a late lock cannot resume through generic settings ownership',t=>{
  const {f,board,key,setPaused,lock,document}=fixture(t);board();key('Escape');f.resumeOperations();setPaused(true);lock();assert(f.operationsOpen);assert.equal(document.pointerLockElement,null);assert(!f.resumePending);
});
test('map focus restoration outside operations is reclaimed and Tab stays in the panel',t=>{
  const {f,board,key,document,dispatch}=fixture(t);board();key('Escape');document.body.focus();dispatch(document.body,'focusin');assert(f.panel.contains(document.activeElement));document.body.focus();key('Tab');assert(f.panel.contains(document.activeElement));
});
