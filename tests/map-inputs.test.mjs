import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {setupMap,mapPointer,touchAt} from './lib/map-fixture.mjs';

for(const mobile of [false,true]) test(`map entry preserves already-held ${mobile?'joystick':'keyboard'} ownership and timing`,async t=>{
 const s=await setupMap(t,{mobile});
 if(mobile)s.touch('touchstart');else s.key('keydown','ArrowUp');
 for(let i=0;i<25;i++)s.frame(100);
 const velocity=s.c.velocity.z,time=mobile?s.c.runStartTime:s.c.keyPressTimes.get('ArrowUp'),generation=s.c.joystick?.sessionGeneration;
 s.map.toggle();assert.equal(s.c.mapOpen,true);assert.equal(s.c.freeMove,true);assert.equal(s.c.controls.isLocked,false);
 assert.equal(s.c.velocity.z,velocity);
 if(mobile){assert.equal(s.c.joystick.touchId,1);assert.equal(s.c.joystick.sessionGeneration,generation);}else assert.equal(s.c.pressedKeys.has('ArrowUp'),true);
 const p=s.logical();s.frame(100);assert.ok(s.logical().z<p.z);assert.equal(mobile?s.c.runStartTime:s.c.keyPressTimes.get('ArrowUp'),time);
});

test('map blank/title clicks cannot relock; close keeps explicit stop and lock-failure fallback',async t=>{
 const s=await setupMap(t);s.map.toggle();s.dispatch(s.map.container,'click');assert.equal(s.c.controls.isLocked,false);
 s.key('keydown','KeyW');s.frame(100);s.document.body.requestPointerLock=()=>{throw Error('denied');};
 s.map.toggle();assert.equal(s.c.mapOpen,false);assert.equal(s.c.freeMove,false);assert.equal(s.c.velocity.lengthSq(),0);assert.equal(s.welcomeOverlay.style.display,'flex');
});

for(const code of ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])test(`map ${code} moves without native scrolling`,async t=>{
 const s=await setupMap(t);s.map.toggle();const p=s.logical();const e=s.dispatch(s.map.canvas,'keydown',{key:code,code,repeat:false});s.frame(100);
 assert.equal(e.defaultPrevented,true);assert.ok(s.logical().distanceTo(p)>0);
 s.dispatch(s.map.container,'keyup',{code});assert.equal(s.c.pressedKeys.has(code),false);
});

for(const targetType of ['input','textarea','select','contenteditable','textbox'])test(`map text-entry ${targetType} does not walk or jump or toggle map`,async t=>{
 const s=await setupMap(t);s.map.toggle();const el=s.document.createElement(['input','textarea','select'].includes(targetType)?targetType:'div');
 if(targetType==='contenteditable'){el.setAttribute('contenteditable','true');el.isContentEditable=true;}if(targetType==='textbox')el.setAttribute('role','textbox');s.map.container.appendChild(el);
 for(const [key,code]of [['w','KeyW'],['ArrowUp','ArrowUp'],[' ','Space'],['m','KeyM']]){const e=s.dispatch(el,'keydown',{key,code,repeat:false});assert.equal(e.defaultPrevented,false);}
 assert.equal(s.c.pressedKeys.size,0);assert.equal(s.c.jumpQueued,false);assert.equal(s.map.visible,true);
});

for(const modifier of ['ctrlKey','metaKey','altKey'])test(`map preserves ${modifier} shortcuts`,async t=>{
 const s=await setupMap(t);s.map.toggle();for(const [key,code]of [['w','KeyW'],['ArrowUp','ArrowUp'],[' ','Space'],['m','KeyM'],['+','Equal']]){const e=s.dispatch(s.map.canvas,'keydown',{key,code,repeat:false,[modifier]:true});assert.equal(e.defaultPrevented,false);}
 assert.equal(s.c.pressedKeys.size,0);assert.equal(s.c.jumpQueued,false);assert.equal(s.map.visible,true);assert.equal(s.map.view.k,2);
});

test('map controls retain native Space/Enter/Tab; keyup clears movement after focus changes',async t=>{
 const s=await setupMap(t);s.map.toggle();const b=s.map.container.querySelector('button');
 for(const code of ['Space','Enter','Tab']){const e=s.dispatch(b,'keydown',{key:code==='Space'?' ':code,code,repeat:false});assert.equal(e.defaultPrevented,false);assert.equal(s.c.jumpQueued,false);}
 s.key('keydown','ArrowUp');const input=s.document.createElement('input');s.map.container.appendChild(input);s.dispatch(input,'keyup',{code:'ArrowUp'});assert.equal(s.c.moveForward,false);
});

test('successful teleport cancels movement/jump until fresh key or touch; repeats cannot re-arm',async t=>{
 const s=await setupMap(t);s.map.toggle();s.key('keydown','KeyW');s.frame(100);s.c.jump();s.c.teleportTo(0,0,0,-1);
 assert.equal(s.c.jumpQueued,false);assert.equal(s.c.velocity.lengthSq(),0);
 s.key('keydown','KeyW',{repeat:true});s.frame(100);assert.equal(s.c.moveForward,false);assert.equal(s.c.velocity.lengthSq(),0);
 s.key('keyup','KeyW');s.key('keydown','KeyW');s.frame(100);assert.ok(s.c.velocity.z>0);
});

test('map-target touch cannot acquire joystick even inside the padded joystick region',async t=>{
 const s=await setupMap(t,{mobile:true});s.map.toggle();touchAt(s,s.map.canvas,'touchstart',3,88,230);assert.equal(s.c.joystick.active,false);assert.equal(s.c.lookTouchId,null);
 s.touch('touchstart',1);assert.equal(s.c.joystick.touchId,1);
 mapPointer(s,'pointerdown',3);mapPointer(s,'pointermove',3,260,90);assert.equal(s.c.joystick.touchId,1);
 mapPointer(s,'pointercancel',3);assert.equal(s.c.joystick.touchId,1);s.touch('touchcancel',1);assert.equal(s.c.joystick.active,false);
});

test('settings from a moving map still pauses and resumes with fresh input only',async t=>{
 const s=await setupMap(t,{mobile:true});s.map.toggle();s.touch('touchstart');s.frame(100);s.c.jump();s.menu.show();
 assert.equal(s.c.joystick.active,false);assert.equal(s.c.jumpQueued,false);assert.equal(s.c.freeMove,false);assert.equal(s.c.mapOpen,true);
 const p=s.logical();s.frame(1000,()=>s.settingsSession.updateControls());assert.equal(s.logical().distanceTo(p),0);
 s.menu.hide();assert.equal(s.c.freeMove,true);s.touch('touchmove');assert.equal(s.c.joystick.active,false);
 s.touch('touchend');s.touch('touchstart');s.frame(100);assert.ok(s.logical().distanceTo(p)>0);
});

test('map accessibility is non-modal with keyboard-reachable preview and visible close',async t=>{
 const s=await setupMap(t,{mobile:true});assert.equal(s.map.preview.tagName,'BUTTON');assert.equal(s.map.preview.getAttribute('aria-controls'),'minimap');
 assert.equal(s.map.container.getAttribute('role'),'region');assert.equal(s.map.container.getAttribute('aria-modal'),null);
 s.map.preview.focus();s.map.toggle();assert.equal(s.map.preview.getAttribute('aria-expanded'),'true');
 assert.ok(s.map.container.querySelector('#minimap-close'));s.map.toggle();assert.equal(s.document.activeElement,s.map.preview);
});

test('main wires map lifecycle explicitly while original physics/render loops remain separate',()=>{
 const source=readFileSync(new URL('../main.js',import.meta.url),'utf8');assert.match(source,/new MapTourSession\(/);assert.match(source,/mapTourSession\.setVisible\(visible\)/);
});

for(const origin of ['settings','editable','modifier'])test(`a hold first started in ${origin} requires fresh admission after returning to walking`,async t=>{
 const s=await setupMap(t);s.map.toggle();let target=s.document.body;
 if(origin==='settings')s.menu.show();
 if(origin==='editable'){target=s.document.createElement('input');s.map.container.appendChild(target);}
 s.dispatch(target,'keydown',{key:'w',code:'KeyW',repeat:false,ctrlKey:origin==='modifier'});
 if(origin==='settings')s.menu.hide();
 s.key('keydown','KeyW',{repeat:true});s.frame(100);assert.equal(s.c.moveForward,false);
 s.key('keydown','KeyW');s.frame(100);assert.equal(s.c.moveForward,true);
});

test('map state changes during settings pause do not enable movement before dismissal',async t=>{
 const s=await setupMap(t);s.menu.show();s.map.toggle();assert.equal(s.c.mapOpen,true);assert.equal(s.c.freeMove,false);
 s.map.toggle();assert.equal(s.c.mapOpen,false);assert.equal(s.c.freeMove,false);
 s.map.toggle();s.menu.hide();assert.equal(s.c.freeMove,true);assert.equal(s.c.mapOpen,true);
});

for(const cancel of ['settings','close','teleport'])test(`${cancel} rejects a cancelled repeat but accepts a fresh press`,async t=>{
 const s=await setupMap(t);s.map.toggle();s.key('keydown','ArrowUp');s.frame(100);
 if(cancel==='settings'){s.menu.show();s.menu.hide();}else if(cancel==='close'){s.map.toggle();s.map.toggle();}else s.c.teleportTo(0,0,0,-1);
 s.key('keydown','ArrowUp',{repeat:true});s.frame(100);assert.equal(s.c.moveForward,false);
 s.key('keydown','ArrowUp');s.frame(100);assert.equal(s.c.moveForward,true);
});

test('short mobile map canvas uses the visual viewport and actual panel content height',async t=>{
 const s=await setupMap(t,{mobile:true});s.window.innerHeight=844;s.window.visualViewport={height:320,addEventListener(){},removeEventListener(){}};s.map.container.clientHeight=120;
 s.window.getComputedStyle=()=>({paddingTop:'16px',paddingBottom:'16px'});
 s.map.resizeCanvas();assert.ok(s.map.viewH<=88);assert.ok(s.map.viewH>0);
 s.map.container.clientHeight=0;s.map.resizeCanvas();assert.ok(s.map.viewH<=80,'hidden initialization uses a conservative viewport fallback');
});
