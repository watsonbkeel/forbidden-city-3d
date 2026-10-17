import test from 'node:test';
import assert from 'node:assert/strict';
import {setupMap,mapPointer,touchAt} from './lib/map-fixture.mjs';

for(const type of ['pointerup','pointercancel','lostpointercapture'])test(`unowned ${type} cannot end a map gesture or teleport`,async t=>{
 const s=await setupMap(t);s.map.toggle();let taps=0;s.map.handleMapClick=()=>taps++;
 mapPointer(s,'pointerdown',1);mapPointer(s,type,2);assert.equal(taps,0);mapPointer(s,'pointermove',1,250,80);mapPointer(s,'pointerup',1);assert.equal(taps,0);
});

test('pinch with no motion cannot turn the last finger lift into a teleport',async t=>{
 const s=await setupMap(t);s.map.toggle();let taps=0;s.map.handleMapClick=()=>taps++;
 mapPointer(s,'pointerdown',1);mapPointer(s,'pointerdown',2,270,90);mapPointer(s,'pointerup',1);mapPointer(s,'pointerup',2,270,90);assert.equal(taps,0);
 mapPointer(s,'pointerdown',3);mapPointer(s,'pointerup',3);assert.equal(taps,1,'fresh single tap still works');
});

for(const end of ['pointercancel','lostpointercapture','close'])test(`${end} clears map capture and a fresh one-finger drag is independent`,async t=>{
 const s=await setupMap(t);s.map.toggle();let taps=0;s.map.handleMapClick=()=>taps++;
 mapPointer(s,'pointerdown',1);
 if(end==='close'){s.map.toggle();s.map.toggle();}else mapPointer(s,end,1);
 const before=s.map.view.cx;mapPointer(s,'pointerdown',2);mapPointer(s,'pointermove',2,260,70);assert.notEqual(s.map.view.cx,before);
 mapPointer(s,'pointerup',2);assert.equal(taps,0);
});

test('held look/joystick touch remains independent while another finger drags map',async t=>{
 const s=await setupMap(t,{mobile:true});s.touch('touchstart',1);s.touch('touchstart',2,100,700);assert.equal(s.c.lookTouchId,2);s.map.toggle();
 mapPointer(s,'pointerdown',3);mapPointer(s,'pointermove',3,280,80);assert.equal(s.c.joystick.touchId,1);assert.equal(s.c.lookTouchId,2);
 mapPointer(s,'pointerup',3);s.touch('touchmove',2,100,710);s.touch('touchend',2);assert.equal(s.c.lookTouchId,null);assert.equal(s.c.joystick.touchId,1);
});

test('second-finger preview opens exactly once while joystick stays held',async t=>{
 const s=await setupMap(t,{mobile:true});s.touch('touchstart',1);const held={identifier:1,target:s.document.body,clientX:88,clientY:230};
 touchAt(s,s.map.preview,'touchstart',2,350,60,[held]);touchAt(s,s.map.preview,'touchend',2,350,60,[held]);assert.equal(s.map.visible,true);assert.equal(s.c.joystick.touchId,1);
 s.dispatch(s.map.preview,'click',{detail:1});assert.equal(s.map.visible,true,'compatibility click cannot toggle a second time');
 s.dispatch(s.map.preview,'click',{detail:0});assert.equal(s.map.visible,false,'keyboard click remains usable');
});

test('second-finger toolbar tap activates once; a cancelled or dragged tap does not',async t=>{
 const s=await setupMap(t,{mobile:true});s.map.toggle();s.touch('touchstart',1);const held={identifier:1,target:s.document.body,clientX:88,clientY:230};const button=s.map.container.querySelectorAll('button').find(b=>b.title==='放大');
 touchAt(s,button,'touchstart',2,200,100,[held]);touchAt(s,button,'touchend',2,200,100,[held]);assert.ok(s.map.view.k>2);const zoom=s.map.view.k;
 s.dispatch(button,'click',{detail:1});assert.equal(s.map.view.k,zoom);
 touchAt(s,button,'touchstart',3,200,100,[held]);touchAt(s,button,'touchmove',3,230,100,[held]);touchAt(s,button,'touchend',3,230,100,[held]);assert.equal(s.map.view.k,zoom);
 touchAt(s,button,'touchstart',4,200,100,[held]);touchAt(s,button,'touchcancel',4,200,100,[held]);assert.equal(s.map.view.k,zoom);
});

for(const cancel of ['pointerup','pointercancel','lostpointercapture'])test(`three-contact sequence remains ineligible for tap after ${cancel}`,async t=>{
 const s=await setupMap(t);s.map.toggle();let taps=0;s.map.handleMapClick=()=>taps++;
 for(const id of [1,2,3])mapPointer(s,'pointerdown',id,220+id*15,60);
 mapPointer(s,cancel,2);mapPointer(s,'pointerup',1);mapPointer(s,'pointerup',3);assert.equal(taps,0);
 mapPointer(s,'pointerdown',4);mapPointer(s,'pointerup',4);assert.equal(taps,1);
});

for(const boundary of ['close','dispose'])test(`${boundary} clears pending secondary button taps and map captures`,async t=>{
 const s=await setupMap(t,{mobile:true});s.map.toggle();const button=s.map.container.querySelectorAll('button').find(b=>b.title==='放大');
 const held={identifier:1,target:s.document.body,clientX:88,clientY:230};
 touchAt(s,button,'touchstart',2,200,100,[held]);mapPointer(s,'pointerdown',4);
 if(boundary==='close'){s.map.toggle();s.map.toggle();}else s.map.dispose();
 const zoom=s.map.view.k;touchAt(s,button,'touchend',2,200,100,[held]);assert.equal(s.map.view.k,zoom);assert.equal(s.map.canvas.hasPointerCapture(4),false);
});
