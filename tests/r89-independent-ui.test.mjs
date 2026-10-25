import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createDOM} from './lib/ui-dom.mjs';
import {DayNightPanel} from '../src/ui/DayNightPanel.js';
import {getBeijingDayCycle} from '../src/scene/sky/BeijingDayCycle.js';
import {FirstPersonControls} from '../src/controls/FirstPerson.js';
import {CollisionManager} from '../src/utils/Collision.js';
import {SettingsMenu} from '../src/ui/SettingsMenu.js';
import {SettingsTourSession} from '../src/ui/SettingsTourSession.js';

function setup(t,{map=false,mobile=false}={}){
 const saved=Object.fromEntries(['document','window','navigator'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)])),dom=createDOM();
 dom.document.head=dom.document.createElement('head');dom.document.head.parentNode=dom.document;
 for(const[k,v]of Object.entries({document:dom.document,window:dom.window,navigator:{userAgent:mobile?'iPhone':'CPU DOM desktop'}}))Object.defineProperty(globalThis,k,{value:v,configurable:true});
 // Native blur returns keyboard focus to the document body, not to a detached input.
 dom.Element.prototype.blur=function(){if(document.activeElement===this)document.activeElement=document.body;};
 document.body.ownerDocument=document;
 document.body.requestPointerLock=()=>{document.pointerLockElement=document.body;dom.dispatch(document,'pointerlockchange');};
 document.exitPointerLock=()=>{document.pointerLockElement=null;dom.dispatch(document,'pointerlockchange');};
 const calls=[],environment={previewDate:null,dayCycle:getBeijingDayCycle(new Date('2026-10-25T12:34:00+08:00')),setTimePreview(date){this.previewDate=date;this.dayCycle=getBeijingDayCycle(date??new Date());calls.push(date);}};
 const panel=new DayNightPanel(environment);const controls=new FirstPersonControls(new THREE.PerspectiveCamera(),document.body,new CollisionManager());controls.setPosition(0,1.7,0);
 if(map)controls.setFreeMove(true);else controls.lock();
 const session=new SettingsTourSession({controls,isMobile:mobile,minimap:{visible:map},welcomeOverlay:{style:{display:'none'}}});
 const menu=new SettingsMenu(document.body);menu.init({onOpen:()=>session.open(),onResume:()=>session.resume()});
 let now=performance.now();t.mock.method(performance,'now',()=>now);const frame=()=>{now+=1000/60;session.updateControls();};
 t.after(()=>{menu.dispose();panel.dispose();controls.dispose();for(const[k,d]of Object.entries(saved)){if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}});
 return{...dom,panel,environment,calls,controls,session,menu,frame};
}
function fields(panel){const hour=panel.root.querySelector('#beijing-hour'),minute=panel.root.querySelector('#beijing-minute'),apply=panel.root.querySelector('#beijing-apply');assert.ok(hour&&minute&&apply,'separate hour/minute inputs and an explicit Apply button');return{hour,minute,apply};}

test('separate numeric fields apply 21:00 once, only on Apply or Enter; drafts survive clock refresh',t=>{
 const {panel,environment,calls,dispatch}=setup(t),{hour,minute,apply}=fields(panel);
 assert.equal(hour.getAttribute('min'),'0');assert.equal(hour.getAttribute('max'),'23');assert.equal(minute.getAttribute('max'),'59');
 hour.value='21';minute.value='00';hour.focus();dispatch(hour,'input');panel.update();assert.equal(hour.value,'21');assert.equal(calls.length,0);
 apply.click();assert.equal(environment.dayCycle.beijingTime.minutesOfDay,1260);assert.equal(calls.length,1);
 hour.value='06';minute.value='00';dispatch(hour,'input');dispatch(minute,'keydown',{key:'Enter',code:'Enter'});assert.equal(environment.dayCycle.beijingTime.minutesOfDay,360);assert.equal(calls.length,2);
});
for(const [hourValue,minuteValue]of [['','00'],['24','00'],['-1','00'],['21','60'],['21','-1'],['21.5','00'],['21','0.5'],['NaN','00']])test(`reject invalid clock ${hourValue}:${minuteValue} without changing simulation`,t=>{
 const {panel,calls}=setup(t),{hour,minute,apply}=fields(panel);hour.value=hourValue;minute.value=minuteValue;apply.click();assert.equal(calls.length,0);assert.match(panel.root.querySelector('#beijing-time-error').textContent,/00.*23|0.*23/);
});
for(const [h,m,n]of [['00','00',0],['23','59',1439]])test(`accept boundary ${h}:${m} and preserve slider/live controls`,t=>{
 const {panel,environment,calls,dispatch}=setup(t),{hour,minute,apply}=fields(panel);hour.value=h;minute.value=m;apply.click();assert.equal(environment.dayCycle.beijingTime.minutesOfDay,n);assert.equal(Number(panel.range.value),n);
 panel.range.value='1260';dispatch(panel.range,'change');assert.equal(environment.dayCycle.beijingTime.minutesOfDay,1260);assert.equal(hour.value,'21');assert.equal(minute.value,'00');
 panel.live.click();assert.equal(environment.previewDate,null);assert.equal(calls.at(-1),null);
});

test('a fresh world click releases old range focus and real controller moves without map teleport',t=>{
 const {panel,controls,dispatch,frame}=setup(t);controls.unlock();panel.range.focus();document.body.click();assert.equal(controls.controls.isLocked,true);
 const before=controls.camera.position.clone();dispatch(document.activeElement,'keydown',{key:'w',code:'KeyW'});for(let i=0;i<12;i++)frame();assert.ok(controls.camera.position.distanceTo(before)>.1,'WASD must not remain addressed to the old range input');
});

test('focusing a time control stops previously held input rather than drifting while editing',t=>{
 const {panel,controls,dispatch,frame}=setup(t,{map:true});dispatch(document.body,'keydown',{key:'w',code:'KeyW'});for(let i=0;i<12;i++)frame();
 panel.range.focus();dispatch(panel.range,'focusin');assert.equal(controls.pressedKeys.size,0);const before=controls.camera.position.clone();for(let i=0;i<12;i++)frame();assert.ok(controls.camera.position.distanceTo(before)<.01);
});
for(const map of[false,true])for(const close of['#settings-close-btn','#resume-btn','Escape'])test(`settings ${close}, map=${map}: former time-field focus cannot trap new movement`,t=>{
 const {panel,controls,menu,dispatch,frame}=setup(t,{map});
 for(let cycle=0;cycle<3;cycle++){
  panel.range.focus();menu.show();if(close==='Escape')dispatch(menu.panel,'keydown',{key:'Escape',code:'Escape'});else menu.panel.querySelector(close).click();
  assert.equal(menu.visible,false);const before=controls.camera.position.clone();dispatch(document.activeElement,'keydown',{key:'w',code:'KeyW'});for(let i=0;i<12;i++)frame();assert.ok(controls.camera.position.distanceTo(before)>.1);dispatch(document.activeElement,'keyup',{key:'w',code:'KeyW'});
 }
});

test('time disclosure closes by Escape/button without global settings toggle or hidden input focus',t=>{
 const {panel,dispatch}=setup(t),{hour}=fields(panel);let escaped=0;window.addEventListener('keydown',()=>escaped++);
 panel.root.open=true;hour.focus();dispatch(hour,'keydown',{key:'Escape',code:'Escape'});assert.equal(panel.root.open,false);assert.equal(escaped,0);assert.equal(document.activeElement,panel.root.querySelector('summary'));
 panel.root.open=true;hour.focus();panel.root.querySelector('#beijing-close').click();assert.equal(panel.root.open,false);assert.equal(document.activeElement,panel.root.querySelector('summary'));
});

test('editing time during map-open flight clears held flight keys without dismounting or locking',async t=>{
 const {panel,controls,dispatch}=setup(t,{map:true});
 const {FlightTour}=await import('../src/scene/flight/FlightTour.js'),{FlightEnvelope}=await import('../src/scene/flight/FlightEnvelope.js');
 const Element=document.body.constructor;Object.defineProperty(Element.prototype,'dataset',{configurable:true,get(){return Object.fromEntries([...this.attributes].filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5),v]));}});
 controls.setMapOpen(true);controls.setPosition(22,1.7,-494);
 const flight=new FlightTour({scene:new THREE.Scene(),camera:controls.camera,controls,collisionManager:controls.collisionManager,zoneManager:{ensureLoadedAt(){}},envelope:new FlightEnvelope()});
 try{assert.equal(flight.board(),true);dispatch(document.body,'keydown',{key:'w',code:'KeyW'});assert.ok(flight.keys.has('KeyW'));
  const {hour,minute,apply}=fields(panel);hour.focus();dispatch(hour,'focusin');assert.equal(flight.keys.size,0,'previous flight movement must stop while time is edited');hour.value='21';minute.value='00';apply.click();panel.close();
  assert.equal(flight.occupied,true);assert.equal(controls.mapOpen,true);assert.equal(controls.controls.isLocked,false);
  dispatch(document.body,'keydown',{key:'w',code:'KeyW'});assert.ok(flight.keys.has('KeyW'));
 }finally{flight.dispose();}
});

// Independent review extensions: CPU event/focus semantics only, not device acceptance.
test('draft blur, Escape, close and reopen never apply a hidden or invalid clock',t=>{
 const {panel,environment,calls,dispatch}=setup(t),{hour,minute}=fields(panel);
 const initial=environment.dayCycle.beijingTime.minutesOfDay;
 for(const [h,m] of [['21','00'],['1e1','00'],['Infinity','00'],['12','59.1'],['  ','00'],['12','+2']]) {
  panel.root.open=true;hour.value=h;minute.value=m;hour.focus();dispatch(hour,'input');hour.blur();dispatch(hour,'blur');panel.update();
  assert.equal(environment.dayCycle.beijingTime.minutesOfDay,initial);assert.equal(calls.length,0);
  hour.focus();dispatch(hour,'keydown',{key:'Escape',code:'Escape'});panel.root.open=true;dispatch(panel.root,'toggle');panel.update();assert.equal(calls.length,0);
  panel.closeButton.click();assert.equal(calls.length,0);
 }
 panel.live.click();assert.equal(panel.dirty,false);assert.equal(environment.previewDate,null);assert.equal(calls.length,1);
});
test('input-focus listener stops mobile joystick, release and resume require no pointer lock',t=>{
 const {panel,controls,session,menu,dispatch,frame,Element}=setup(t,{mobile:true});let lockCalls=0;document.body.requestPointerLock=()=>{lockCalls++;throw Error('mobile must not lock');};
 Element.prototype.getBoundingClientRect=function(){return{left:0,top:0,width:120,height:120};};
 controls.joystick.active=true;controls.joystick.touchId=10;controls.joystick.deltaY=-1;
 panel.hour.focus();dispatch(panel.hour,'focusin');assert.equal(controls.joystick.active,false);assert.equal(controls.joystick.touchId,null);assert.equal(controls.lookTouchId,null);
 menu.show();menu.panel.querySelector('#resume-btn').click();assert.equal(session.paused,false);assert.equal(document.activeElement,document.body);assert.equal(lockCalls,0);
 panel.close();const before=controls.camera.position.clone();const touch={identifier:11,clientX:60,clientY:20,target:document.body};dispatch(document.body,'touchstart',{changedTouches:[touch],touches:[touch]});
 for(let i=0;i<12;i++)frame();assert.ok(controls.camera.position.distanceTo(before)>.1);assert.equal(lockCalls,0);assert.equal(controls.controls.isLocked,false);
});
test('real unlock and subsequent lock event release stale number focus without claiming lock early',t=>{
 const {panel,controls,dispatch}=setup(t);controls.unlock();panel.hour.focus();document.body.requestPointerLock=()=>Promise.resolve();
 document.body.click();assert.equal(controls.controls.isLocked,false);assert.equal(document.activeElement,document.body);
 panel.hour.focus();document.pointerLockElement=document.body;dispatch(document,'pointerlockchange');assert.equal(controls.controls.isLocked,true);assert.equal(document.activeElement,document.body);
});
