import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import * as THREE from 'three';
import { createDOM } from './lib/ui-dom.mjs';
import { FirstPersonControls } from '../src/controls/FirstPerson.js';
import { FlightTour } from '../src/scene/flight/FlightTour.js';
import { FlightEnvelope } from '../src/scene/flight/FlightEnvelope.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { SettingsTourSession } from '../src/ui/SettingsTourSession.js';

const mainURL=new URL('../main.js',import.meta.url),mainSource=readFileSync(mainURL,'utf8');
// Suppress only automatic renderer/bootstrap startup. The actual current app
// class, event methods, FlightTour, FirstPerson and Three PointerLockControls
// execute unchanged. This is DOM/event-chain coverage, NOT native browser QA.
const hook=registerHooks({load(url,context,next){
  if(url===mainURL.href){const marker='// 本地开发暴露实例用于回归测试；生产页面不增加调试入口。';
    assert.equal(mainSource.split(marker).length,2,'recognizable startup boundary');
    return{format:'module',source:mainSource.split(marker)[0]+'\nexport { ForbiddenCityApp };',shortCircuit:true};}
  if(url.endsWith('.json'))return next(url,{...context,importAttributes:{...context.importAttributes,type:'json'}});
  return next(url,context);
}});
const {ForbiddenCityApp}=await import(mainURL.href);hook.deregister();

function actualModeCallback(app){
  const method=mainSource.match(/onModeChange:\s*occupied\s*=>\s*this\.(\w+)\(occupied\)/);
  if(method)return occupied=>app[method[1]](occupied);
  const body=mainSource.match(/onModeChange:occupied=>\{([\s\S]*?)\n\s*\}\}\);/);
  assert.ok(body,'load the actual main callback instead of inventing a test substitute');
  return new Function('occupied',body[1]).bind(app);
}
function fixture(t,{mobile=false}={}){
  const dom=createDOM(),old={document:globalThis.document,window:globalThis.window},nav=Object.getOwnPropertyDescriptor(globalThis,'navigator');
  Object.assign(globalThis,{document:dom.document,window:dom.window});
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{userAgent:mobile?'iPhone':'Desktop',maxTouchPoints:mobile?5:0}});
  Object.assign(dom.window,{innerWidth:1000,innerHeight:800});
  dom.document.head=dom.document.createElement('head');dom.document.head.parentNode=dom.document;
  Object.defineProperty(dom.Element.prototype,'ownerDocument',{get:()=>dom.document});
  Object.defineProperty(dom.Element.prototype,'parentElement',{get(){return this.parentNode instanceof dom.Element?this.parentNode:null;}});
  Object.defineProperty(dom.Element.prototype,'dataset',{get(){return Object.fromEntries([...this.attributes].filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));}});
  dom.Element.prototype.blur=function(){if(dom.document.activeElement===this)dom.document.activeElement=dom.document.body;};
  dom.Element.prototype.getBoundingClientRect=function(){return{left:28,top:620,width:120,height:120,right:148,bottom:740};};
  dom.Element.prototype.setPointerCapture=()=>{};dom.Element.prototype.releasePointerCapture=()=>{};
  const welcome=dom.document.createElement('div');welcome.id='welcome-overlay';welcome.style.display='flex';dom.document.body.appendChild(welcome);
  const canvas=dom.document.createElement('canvas');dom.document.body.appendChild(canvas);
  let now=0,requests=0,deferred=false;const pending=[];const clock=t.mock.method(performance,'now',()=>now);
  dom.document.pointerLockElement=null;
  dom.document.body.requestPointerLock=()=>{requests++;if(!deferred){pending.push({});return;}return new Promise((resolve,reject)=>pending.push({resolve,reject}));};
  const unlock=()=>{dom.document.pointerLockElement=null;dom.dispatch(dom.document,'pointerlockchange');};
  dom.document.exitPointerLock=unlock;
  const grant=()=>{assert.ok(pending.length>0,'a real request must precede native lock success');const request=pending.shift();dom.document.pointerLockElement=dom.document.body;dom.dispatch(dom.document,'pointerlockchange');request.resolve?.();};
  const reject=()=>{assert.ok(pending.length>0);pending.shift().reject?.(new Error('native pointer lock denied'));};
  const cm=new CollisionManager(),camera=new THREE.PerspectiveCamera(),controls=new FirstPersonControls(camera,dom.document.body,cm);
  controls.setPosition(22,1.7,-494);
  const app=Object.create(ForbiddenCityApp.prototype),suspensions=[];
  Object.assign(app,{controls,camera,isMobile:mobile,minimap:{visible:false},settingsMenu:{visible:false},interiors:{setSuspended:v=>suspensions.push(v)}});
  app.settingsTourSession=new SettingsTourSession({controls,isMobile:mobile,minimap:app.minimap,welcomeOverlay:welcome});
  app.bindWelcomeOverlay();
  let settingsToggles=0;app.settingsMenu.toggle=()=>{settingsToggles++;app.settingsMenu.visible=!app.settingsMenu.visible;app.settingsTourSession[app.settingsMenu.visible?'open':'resume']();};
  // Exercise the actual main Escape listener, with only the modal presentation
  // boundary replaced. Flight capture must win while boarded, not after exit.
  const escapeBinding=mainSource.match(/    this\._onKeyDown = \(event\) => \{[\s\S]*?window\.addEventListener\('keydown', this\._onKeyDown\);/);
  assert.ok(escapeBinding,'actual main Escape binding remains available');
  new Function('window',escapeBinding[0]).call(app,dom.window);
  const f=new FlightTour({scene:new THREE.Scene(),camera,controls,collisionManager:cm,zoneManager:{ensureLoadedAt(){}},envelope:new FlightEnvelope(),
    isPaused:()=>app.settingsTourSession.paused,onModeChange:actualModeCallback(app)});app.flight=f;
  const key=(code,extra={})=>dom.dispatch(dom.document.body,'keydown',{code,key:code.replace('Key','').toLowerCase(),...extra});
  const up=code=>dom.dispatch(dom.document.body,'keyup',{code});
  const mouse=(x=35,y=7)=>dom.dispatch(dom.document,'mousemove',{movementX:x,movementY:y});
  const tick=()=>{now+=200;if(!f.occupied)app.settingsTourSession.updateControls();else controls.prevTime=now;f.update(.1,now);};
  const lockWalking=()=>{controls.lock();grant();assert.equal(controls.controls.isLocked,true);};
  t.after(()=>{f.dispose();dom.window.removeEventListener('keydown',app._onKeyDown);controls.controls.removeEventListener('lock',app._onLock);controls.controls.removeEventListener('unlock',app._onUnlock);controls.dispose();clock.mock.restore();Object.assign(globalThis,old);if(nav)Object.defineProperty(globalThis,'navigator',nav);else delete globalThis.navigator;});
  return{...dom,app,f,cm,camera,controls,welcome,canvas,key,up,mouse,tick,grant,unlock,lockWalking,suspensions,
    requestCount:()=>requests,pending:()=>pending.length,reject,deferLock:()=>{deferred=true;},settingsToggles:()=>settingsToggles};
}
const visible=element=>{for(let e=element;e?.style;e=e.parentNode)if(e.hidden||e.style.display==='none')return false;return true;};

test('R36 helicopter proximity is a non-modal enter/leave/re-enter interaction, not persistent flight UI',t=>{
  const s=fixture(t),{f,controls,document}=s;controls.setPosition(60,1.7,-494);s.tick();
  assert.equal(visible(f.panel),false,'ordinary distant walking has no aircraft control panel');
  s.lockWalking();const focus=document.activeElement,requests=s.requestCount();
  for(const x of[22,60,22]){controls.setPosition(x,1.7,-494);s.tick();assert.equal(visible(f.boardingPrompt),x===22);assert.equal(visible(f.panel),false);assert.equal(f.panel.inert,true);assert.equal(f.occupied,false);assert.equal(f.operationsOpen,false);assert.equal(document.activeElement,focus);assert.equal(s.requestCount(),requests);assert.equal(document.pointerLockElement,document.body);}
  assert.equal(f.boardingButton.disabled,false);assert.equal(f.boardingPrompt.getAttribute('aria-modal'),null);assert.equal(f.panel.getAttribute('aria-modal'),null);
});

for(const exitBy of['keyboard','button'])test(`R36 ${exitBy} exit after native Escape restores real walking mouse and releases every aircraft input`,t=>{
  const s=fixture(t),{f,controls,camera}=s;s.lockWalking();s.key('KeyW');assert.equal(controls.moveForward,true);
  s.key('KeyH');assert.equal(f.occupied,true);assert.equal(controls.pressedKeys.size,0);assert.equal(controls.lookLocked,true);
  s.key('Space');s.key('KeyW');assert.ok(f.keys.size>0);s.unlock();s.key('Escape');assert.equal(f.operationsOpen,true);assert.equal(s.settingsToggles(),0,'flight captures Escape before main settings');
  assert.equal(f.keys.size,0);assert.equal(controls.moveForward,false);
  const requestBefore=s.requestCount();
  if(exitBy==='keyboard')s.key('KeyH');else s.dispatch(f.boardButton,'click',{detail:1});
  assert.equal(f.occupied,false);assert.equal(f.operationsOpen,false);assert.equal(controls.lookLocked,false);assert.equal(controls.headBobEnabled,true);
  assert.equal(f.keys.size,0);assert.equal(f.pointers.size,0);assert.equal(controls.jumpQueued,false);assert.equal(f.touch.hidden,true);
  assert.deepEqual(camera.up.toArray(),[0,1,0]);assert.equal(s.cm.checkCollision(camera.position,.5),false);
  assert.ok(s.requestCount()>requestBefore,'both user exit actions must request restoration, not just the button wrapper');
  s.grant();const q=camera.quaternion.clone(),flightYaw=f.lookYaw;s.mouse();assert.ok(q.angleTo(camera.quaternion)>.01,'real Three mouse listener rotates walking camera');assert.equal(f.lookYaw,flightYaw);
  const after=camera.quaternion.clone();s.tick();assert.ok(after.angleTo(camera.quaternion)<1e-7,'parked aircraft must not overwrite walking view');
  s.key('KeyW');assert.equal(controls.moveForward,true);assert.equal(f.keys.size,0);s.up('KeyW');assert.equal(controls.moveForward,false);
  const p=camera.position.clone();s.key('KeyS');s.tick();s.up('KeyS');assert.ok(Math.hypot(camera.position.x-p.x,camera.position.z-p.z)>.1,'real walking update moves away from the parked craft');assert.equal(controls.feetY,0);
  assert.deepEqual(s.suspensions,[true,false]);
  s.controls.setPosition(60,1.7,-494);s.tick();s.unlock();assert.equal(visible(f.walkingResumeButton),false,'a completed dismount must not own later ordinary walking unlocks');s.key('Escape');assert.equal(s.settingsToggles(),1,'walking Escape returns to actual main settings binding');assert.equal(s.app.settingsTourSession.paused,true);
});

test('R36 leaving and approaching again permits a second real boarding without stale focus or flight state',t=>{
  const s=fixture(t);s.lockWalking();s.key('KeyH');s.unlock();s.key('KeyH');while(s.pending())s.grant();
  s.controls.setPosition(60,1.7,-494);s.tick();assert.equal(visible(s.f.panel),false);assert.equal(s.f.state.mode,'parked');
  s.controls.setPosition(22,1.7,-494);s.tick();assert.equal(visible(s.f.boardingPrompt),true);assert.equal(visible(s.f.panel),false);s.unlock();s.dispatch(s.f.boardingButton,'click',{detail:1});assert.equal(s.f.occupied,true);assert.equal(s.controls.lookLocked,true);assert.equal(s.f.operationsOpen,true);assert.equal(s.f.resumePending,true);s.grant();assert.equal(s.f.operationsOpen,false);assert.equal(s.f.keys.size,0);assert.equal(visible(s.f.boardingPrompt),false);assert.equal(visible(s.f.panel),true);
  assert.deepEqual(s.suspensions,[true,false,true]);
});

test('R36 map-open disembark preserves the existing unlocked walking-map ownership',t=>{
  const s=fixture(t);s.lockWalking();s.key('KeyH');s.app.minimap.visible=true;s.controls.setMapOpen(true);s.unlock();
  const requests=s.requestCount();s.key('KeyH');assert.equal(s.f.occupied,false);assert.equal(s.controls.freeMove,true);assert.equal(s.controls.mapOpen,true);assert.equal(s.document.pointerLockElement,null);assert.equal(s.requestCount(),requests);
  s.key('KeyW');assert.equal(s.controls.moveForward,true);assert.equal(s.f.keys.size,0);s.up('KeyW');
});

test('R36 mobile exit returns actual touch look and joystick ownership without requesting desktop pointer lock',t=>{
  const s=fixture(t,{mobile:true}),{f,controls,camera,canvas}=s;
  const touch=(identifier,x,y)=>({identifier,clientX:x,clientY:y,target:canvas});
  const drag=()=>{s.dispatch(canvas,'touchstart',{changedTouches:[touch(7,600,250)]});s.dispatch(canvas,'touchmove',{changedTouches:[touch(7,640,260)]});s.dispatch(canvas,'touchend',{changedTouches:[touch(7,640,260)]});};
  const initial=camera.quaternion.clone();drag();assert.ok(initial.angleTo(camera.quaternion)>.01);
  s.dispatch(f.boardingButton,'click',{detail:1});assert.equal(f.occupied,true);assert.equal(controls.joystick.base.style.display,'none');
  f.openOperations();s.dispatch(f.boardButton,'click',{detail:1});assert.equal(f.occupied,false);assert.equal(controls.lookLocked,false);assert.notEqual(controls.joystick.base.style.display,'none');assert.equal(f.touch.hidden,true);
  const returned=camera.quaternion.clone();drag();assert.ok(returned.angleTo(camera.quaternion)>.01,'actual walking touch listener owns look again');
  s.dispatch(canvas,'touchstart',{changedTouches:[touch(8,88,650)]});assert.equal(controls.joystick.isActive(),true);s.dispatch(canvas,'touchend',{changedTouches:[touch(8,88,650)]});assert.equal(controls.joystick.isActive(),false);assert.equal(s.requestCount(),0);
});


test('R36 asynchronous native rejection leaves walking ownership intact and explicit retry restores actual mouse look',async t=>{
  const s=fixture(t);s.lockWalking();s.key('KeyH');s.unlock();s.deferLock();s.key('KeyH');
  assert.equal(s.f.occupied,false);assert.equal(s.f.operationsOpen,false);assert.equal(visible(s.f.panel),false);s.reject();await Promise.resolve();await Promise.resolve();
  assert.equal(s.f.walkingControlNeeded,true);assert.equal(visible(s.f.walkingResumeButton),true);assert.equal(s.welcome.style.display,'flex');assert.equal(s.controls.controls.isLocked,false);assert.equal(s.controls.lookLocked,false);
  s.dispatch(s.f.walkingResumeButton,'click',{detail:1});s.grant();await Promise.resolve();
  assert.equal(s.f.walkingControlNeeded,false);assert.equal(visible(s.f.walkingResumeButton),false);assert.equal(s.welcome.style.display,'none');assert.equal(s.document.activeElement,s.document.body);
  const q=s.camera.quaternion.clone();s.mouse();assert.ok(q.angleTo(s.camera.quaternion)>.01);assert.equal(s.f.occupied,false);
});

test('R36 delayed flight lock after disembark cannot recapture a walking map or reopen aircraft controls',async t=>{
  const s=fixture(t);s.lockWalking();s.key('KeyH');s.unlock();s.deferLock();s.dispatch(s.f.resumeButton,'click',{detail:1});assert.equal(s.f.resumePending,true);
  s.key('KeyH');assert.equal(s.f.occupied,false);assert.equal(s.pending(),2,'flight resume and walking restoration may overlap');
  s.app.minimap.visible=true;s.controls.setMapOpen(true);s.controls.setFreeMove(true);
  while(s.pending()){s.grant();await Promise.resolve();assert.equal(s.document.pointerLockElement,null);assert.equal(s.controls.controls.isLocked,false);}
  assert.equal(s.f.operationsOpen,false);assert.equal(visible(s.f.panel),false);assert.equal(visible(s.f.walkingResumeButton),false);assert.equal(s.controls.freeMove,true);assert.equal(s.controls.mapOpen,true);
  const q=s.camera.quaternion.clone();s.mouse();assert.ok(q.angleTo(s.camera.quaternion)<1e-7,'map keeps its unlocked pointer');s.key('KeyW');assert.equal(s.controls.moveForward,true);assert.equal(s.f.keys.size,0);s.up('KeyW');
});
