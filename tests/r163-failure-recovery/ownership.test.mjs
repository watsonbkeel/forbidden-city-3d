import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture} from './fixture.mjs';
import {FlightTour} from '../../src/scene/flight/FlightTour.js';
import {FlightEnvelope} from '../../src/scene/flight/FlightEnvelope.js';

for(const mobile of [false,true])for(const map of [false,true])test(`terminal recovery takes settings ownership without resume (mobile=${mobile}, map=${map})`,async t=>{
 const f=await fixture(t,{mobile});if(map)f.map.toggle();
 const normal=f.document.createElement('button'),priorInert=f.document.createElement('div');priorInert.inert=true;f.document.body.append(normal,priorInert);
 let resumes=0;const resume=f.menu.onResume;f.menu.onResume=()=>{resumes++;resume();};
 f.menu.show();assert.equal(f.settingsSession.paused,true);assert.equal(normal.inert,true);
 f.a.startAnimationLoop();f.tick();f.setFail(true);f.tick();
 const b=f.document.getElementById('tour-reload-btn'),dialog=f.document.getElementById('tour-failure-dialog');assert.ok(b);
 for(const key of ['Escape','Tab','Enter',' ','Escape']){
  f.dispatch(b,'keydown',{key,code:key===' '?'Space':key});f.dispatch(b,'keyup',{key,code:key===' '?'Space':key});
  assert.equal(resumes,0,'fatal shutdown must never call settings resume');
  assert.notEqual(f.document.pointerLockElement,f.c.domElement);assert.equal(f.document.activeElement,b);
  assert.equal(normal.inert,true);assert.equal(priorInert.inert,true);assert.equal(f.map.container.inert,true);
 }
 assert.equal(f.menu.visible,false);assert.equal(f.menu.overlay,null);assert.equal(f.menu.inertBeforeOpen.size,0);assert.equal(f.map.visible,map);assert.equal(f.queue.size,0);
 f.menu.show();f.menu.hide();f.menu.dispose();assert.equal(resumes,0);assert.equal(normal.inert,true,'late settings cleanup cannot strip recovery inert');
 normal.focus();f.dispatch(normal,'focusin');assert.equal(f.document.activeElement,b);
 b.click();b.click();assert.equal(f.reloads(),1);assert.equal(f.document.body.querySelectorAll('#tour-failure-dialog').length,1);
 f.a.failureNotice.dispose();assert.equal(normal.inert,false,'restore pre-settings, not stale modal inert');assert.equal(priorInert.inert,true);assert.equal(dialog.isConnected,false);
});

for(const operationsOpen of [false,true])for(const settingsOpen of [false,true])test(`terminal recovery prevents actual flight capture and late lock (operationsOpen=${operationsOpen}, settingsOpen=${settingsOpen})`,async t=>{
 const f=await fixture(t);f.document.head=f.document.createElement('head');
 const proto=Object.getPrototypeOf(f.document.body);proto.blur=function(){if(f.document.activeElement===this)f.document.activeElement=f.document.body;};
 Object.defineProperty(proto,'dataset',{configurable:true,get(){return Object.fromEntries([...this.attributes].filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));},set(value){Object.defineProperty(this,'dataset',{value,writable:true,configurable:true});}});
 const paused=f.source.match(/isPaused:\s*\(\)\s*=>\s*([^,\n]+),/);assert.ok(paused,'use exact main flight pause callback');
 const flight=new FlightTour({scene:new THREE.Scene(),camera:f.camera,controls:f.c,collisionManager:f.cm,zoneManager:f.a.zoneManager,envelope:new FlightEnvelope(),isPaused:new Function(`return (${paused[1]});`).bind(f.a)});
 f.a.flight=flight;f.c.setPosition(22,1.7,-494);assert.equal(flight.board(),true);
 if(operationsOpen)flight.openOperations();if(settingsOpen)f.menu.show();const pose=f.camera.position.toArray();f.a.handleFrameFailure(f.error);
 const b=f.document.getElementById('tour-reload-btn');assert.ok(b);
 for(const code of ['KeyH','Escape','Tab','KeyW','KeyF','KeyV','KeyL','KeyT','Space']){
  f.dispatch(b,'keydown',{code,key:code==='Tab'?'Tab':code==='Escape'?'Escape':code==='Space'?' ':code.slice(3).toLowerCase()});
  f.dispatch(b,'keyup',{code});assert.equal(flight.occupied,true);assert.deepEqual(f.camera.position.toArray(),pose);assert.equal(f.document.activeElement,b);assert.equal(flight.keys.size,0);
 }
 assert.equal(flight.isPaused(),true);
 f.document.pointerLockElement=f.c.domElement;f.dispatch(f.document,'pointerlockchange');assert.notEqual(f.document.pointerLockElement,f.c.domElement,'a delayed lock must be released');assert.equal(f.c.controls.isLocked,false);
 for(const child of f.document.body.children)if(child.id!=='tour-failure-dialog')assert.equal(child.inert,true,'late handlers must preserve recovery background');
 assert.equal(flight.occupied,true);assert.equal(f.document.activeElement,b);assert.deepEqual(f.camera.position.toArray(),pose);assert.equal(flight.resumeOperations(),false);
 b.click();assert.equal(f.reloads(),1);
});
