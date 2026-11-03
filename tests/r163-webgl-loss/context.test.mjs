import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {fixture} from '../r163-failure-recovery/fixture.mjs';
import {FlightTour} from '../../src/scene/flight/FlightTour.js';
import {FlightEnvelope} from '../../src/scene/flight/FlightEnvelope.js';

function graphics(f, initiallyLost=false){
 const canvas=f.document.createElement('canvas');f.document.body.appendChild(canvas);let lost=initiallyLost;
 f.a.renderer.domElement=canvas;f.a.renderer.getContext=()=>({isContextLost:()=>lost});
 // Direct target delivery models the non-bubbling canvas event. No real GPU.
 const emit=(type)=>{if(type==='webglcontextlost')lost=true;if(type==='webglcontextrestored')lost=false;
  const event={type,target:canvas,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;}};
  for(const {listener} of [...(canvas.listeners.get(type)??[])])listener(event);return event;
 };
 return{canvas,emit,setLost:value=>lost=value};
}
function recovery(f){const b=f.document.getElementById('tour-reload-btn');assert.ok(b,'graphics loss needs a visible reload action');assert.match(f.document.getElementById('tour-failure-description').textContent,/图形.*中断/);assert.match(f.document.getElementById('tour-failure-description').textContent,/起点/);return b;}
function flightFor(f){
 f.document.head=f.document.createElement('head');const proto=Object.getPrototypeOf(f.document.body);proto.blur=function(){if(f.document.activeElement===this)f.document.activeElement=f.document.body;};
 Object.defineProperty(proto,'dataset',{configurable:true,get(){return Object.fromEntries([...this.attributes].filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));},set(value){Object.defineProperty(this,'dataset',{value,writable:true,configurable:true});}});
 const callback=f.source.match(/isPaused:\s*\(\)\s*=>\s*([^,\n]+),/);assert.ok(callback);
 const flight=new FlightTour({scene:new THREE.Scene(),camera:f.camera,controls:f.c,collisionManager:f.cm,zoneManager:f.a.zoneManager,envelope:new FlightEnvelope(),isPaused:new Function(`return (${callback[1]});`).bind(f.a)});f.a.flight=flight;f.c.setPosition(22,1.7,-494);assert.equal(flight.board(),true);return flight;
}
test('direct canvas loss truly terminates the main loop and preserves other context listeners',async t=>{
 const f=await fixture(t),g=graphics(f);let foreignLost=0,foreignRestored=0;g.canvas.addEventListener('webglcontextlost',()=>foreignLost++);g.canvas.addEventListener('webglcontextrestored',()=>foreignRestored++);
 f.a.startAnimationLoop();f.tick();const frames=f.renders.length,event=g.emit('webglcontextlost');
 assert.equal(event.defaultPrevented,true);const b=recovery(f);assert.equal(f.queue.size,0);assert.equal(f.a.frameLoop.running,false);assert.equal(f.c.controls.isLocked,false);
 for(let i=0;i<20;i++){g.emit('webglcontextlost');g.emit('webglcontextrestored');f.visibility(true);f.tick(1000);f.visibility(false);f.a.frameLoop.setMode(i%2?'eco':'smooth');f.a.startAnimationLoop();f.tick();}
 assert.equal(f.renders.length,frames);assert.equal(f.queue.size,0);assert.equal(f.errors.length,1);assert.equal(foreignLost,21);assert.equal(foreignRestored,20);assert.equal(f.document.body.querySelectorAll('#tour-failure-dialog').length,1);b.click();b.click();assert.equal(f.reloads(),1);
});
test('an already-lost context is detected before the first simulation or render frame',async t=>{
 const f=await fixture(t);graphics(f,true);f.a.startAnimationLoop();assert.equal(f.queue.size,0);assert.equal(f.renders.length,0);recovery(f);assert.equal(f.errors.length,1);
});
test('loss while hidden cannot restart on visibility or restored events',async t=>{
 const f=await fixture(t),g=graphics(f);f.a.startAnimationLoop();f.tick();f.visibility(true);g.emit('webglcontextlost');const b=recovery(f);g.emit('webglcontextrestored');f.tick(86400000);f.visibility(false);f.tick();assert.equal(f.queue.size,0);assert.equal(f.renders.length,1);assert.equal(f.document.activeElement,b);
});
test('visible reset detects a lost context even when its event was missed during hidden time',async t=>{
 const f=await fixture(t),g=graphics(f);f.a.startAnimationLoop();f.tick();f.visibility(true);g.setLost(true);f.tick(3600000);f.visibility(false);assert.equal(f.queue.size,0);recovery(f);f.tick();assert.equal(f.renders.length,1);
});
for(const gpuFirst of [false,true])test(`first failure wins across JS and graphics errors (graphicsFirst=${gpuFirst})`,async t=>{
 const f=await fixture(t),g=graphics(f);f.a.startAnimationLoop();f.tick();
 if(gpuFirst)g.emit('webglcontextlost');else{f.setFail(true);f.tick();}
 const first=f.a.frameFailure,text=f.document.getElementById('tour-failure-description')?.textContent;
 if(gpuFirst)f.a.handleFrameFailure(new Error('later frame failure'));else g.emit('webglcontextlost');
 assert.equal(f.a.frameFailure,first);assert.equal(f.errors.length,1);assert.equal(f.document.getElementById('tour-failure-description').textContent,text);assert.equal(f.queue.size,0);
 if(gpuFirst)recovery(f);else assert.doesNotMatch(text,/图形.*中断/);
});
for(const mobile of [false,true])test(`context loss preserves settings/map failure input ownership (mobile=${mobile})`,async t=>{
 const f=await fixture(t,{mobile}),g=graphics(f);f.map.toggle();f.menu.show();f.a.startAnimationLoop();g.emit('webglcontextlost');const b=recovery(f),pose=f.camera.position.toArray();
 for(const code of ['Escape','Tab','KeyW','KeyH'])f.dispatch(b,'keydown',{code,key:code==='Tab'?'Tab':code==='Escape'?'Escape':code.slice(3).toLowerCase()});
 assert.equal(f.menu.visible,false);assert.equal(f.settingsSession.paused,true);assert.equal(f.map.visible,true);assert.equal(f.map.container.inert,true);assert.equal(f.document.activeElement,b);assert.equal(f.c.controls.isLocked,false);assert.deepEqual(f.camera.position.toArray(),pose);assert.equal(f.queue.size,0);
});
for(const settings of [false,true])test(`context loss preserves real flight and late pointer-lock ownership (settings=${settings})`,async t=>{
 const f=await fixture(t),g=graphics(f),flight=flightFor(f);if(settings)f.menu.show();f.a.startAnimationLoop();g.emit('webglcontextlost');const b=recovery(f),pose=f.camera.position.toArray();
 for(const code of ['KeyH','Escape','Tab','KeyF','KeyW'])f.dispatch(b,'keydown',{code,key:code==='Tab'?'Tab':code==='Escape'?'Escape':code.slice(3).toLowerCase()});
 f.document.pointerLockElement=f.c.domElement;f.dispatch(f.document,'pointerlockchange');assert.equal(flight.occupied,true);assert.equal(f.c.controls.isLocked,false);assert.equal(f.document.activeElement,b);assert.deepEqual(f.camera.position.toArray(),pose);assert.equal(flight.keys.size,0);assert.equal(f.queue.size,0);
});
test('real application disposal removes the canvas observer and stale callbacks cannot show a new notice',async t=>{
 const f=await fixture(t),g=graphics(f);f.a.startAnimationLoop();const registered=[...(g.canvas.listeners.get('webglcontextlost')??[])];assert.equal(registered.length,1);
 for(const key of ['characters','palaceBuilder','enclosure','garden','interiors','zoneManager','environment','ambience','postProcessing','renderer'])f.a[key].dispose??=()=>{};
 f.a.dispose();assert.equal((g.canvas.listeners.get('webglcontextlost')??[]).length,0);assert.equal(f.queue.size,0);
 for(const {listener}of registered)listener({preventDefault(){}});g.emit('webglcontextlost');assert.equal(f.errors.length,0);assert.equal(f.document.getElementById('tour-failure-dialog'),null);
});
for(const mode of ['eco','smooth'])for(const hiddenMs of [60000,3600000,86400000])test(`healthy ${mode} context resumes after ${hiddenMs}ms without a false failure`,async t=>{
 const f=await fixture(t),g=graphics(f);f.a.performanceMode=mode;f.a.startAnimationLoop();f.tick();const before=f.camera.position.toArray(),frames=f.renders.length;f.c.moveForward=true;f.c.jumpQueued=true;f.visibility(true);f.tick(hiddenMs);assert.equal(f.renders.length,frames);assert.equal(f.queue.size,0);
 g.emit('webglcontextrestored');f.visibility(false);f.tick();assert.equal(f.renders.length,frames+1);assert.deepEqual(f.camera.position.toArray(),before);assert.equal(f.c.moveForward,false);assert.equal(f.c.jumpQueued,false);assert.equal(f.queue.size,1);assert.equal(f.errors.length,0);assert.equal(f.document.getElementById('tour-failure-dialog'),null);
});
