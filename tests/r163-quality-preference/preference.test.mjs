import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as THREE from 'three';
import { SettingsMenu } from '../../src/ui/SettingsMenu.js';
import { SettingsTourSession } from '../../src/ui/SettingsTourSession.js';
import { ShadowSetup } from '../../src/render/ShadowSetup.js';
import { setBuildingDetailQuality } from '../../src/render/BuildingDetailQuality.js';
import * as performancePreference from '../../src/render/TourPerformancePreference.js';
import { PERFORMANCE, LAYOUT } from '../../src/config/constants.js';
import { INITIAL_VIEW_POSITION } from '../../src/config/initialView.js';
import { createDOM } from '../lib/ui-dom.mjs';
let preference = {};
try { preference = await import('../../src/render/QualityPreference.js'); }
catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
const KEY = 'fc3d-quality-v1';
const source = fs.readFileSync(new URL('../../main.js', import.meta.url), 'utf8');
function storage(initial = {}) {
  const data = new Map(Object.entries(initial)), writes = [];
  return {data, writes, getItem: key => data.get(key) ?? null, setItem(key,value) {writes.push([key,value]);data.set(key,value);}};
}
function ready() { assert.equal(typeof preference.readQualityPreference, 'function', 'quality restore is missing'); }
function environment(t, store, {mobile = false} = {}) {
  const dom = createDOM(), old = Object.fromEntries(['document','window','localStorage'].map(k => [k,Object.getOwnPropertyDescriptor(globalThis,k)]));
  Object.assign(dom.window, {innerWidth:1000, innerHeight:700, devicePixelRatio:2});
  Object.assign(globalThis, {document:dom.document,window:dom.window});
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:store});
  const menus=[];
  t.after(() => {for(const menu of menus)menu.dispose();for(const [key,desc] of Object.entries(old)){if(desc)Object.defineProperty(globalThis,key,desc);else delete globalThis[key];}});
  class Renderer {
    constructor() {this.domElement=dom.document.createElement('canvas');this.shadowMap={};}
    setSize(w,h) {this.width=w;this.height=h;}
    setPixelRatio(value) {this.ratio=value;}
    getPixelRatio() {return this.ratio;}
  }
  class Teleport {constructor(){this.targets=new Map();}}
  class Minimap {constructor(){this.visible=false;this.container=dom.document.createElement('div');}}
  const context = {document:dom.document,window:dom.window,navigator:{userAgent:mobile?'iPhone':'Macintosh',maxTouchPoints:mobile?5:0},
    performance:{now:()=>100},THREE:{...THREE,WebGLRenderer:Renderer},ShadowSetup,PERFORMANCE,LAYOUT,INITIAL_VIEW_POSITION,
    ...performancePreference,...preference,setBuildingDetailQuality,SettingsMenu,SettingsTourSession,
    HelpPanel:class {},Teleport,Minimap,MapTourSession:class {},FLIGHT_BOUNDS:{},console,
    setTimeout:fn=>fn(),clearTimeout(){},requestAnimationFrame:fn=>fn()};
  const body=source.slice(source.indexOf('class ForbiddenCityApp'),source.indexOf('// 本地开发暴露')).replaceAll('import.meta.env','({DEV:false,BASE_URL:"/forbidden-city-3d/"})');
  const App=vm.runInNewContext(`${body};ForbiddenCityApp`,context);
  const create=()=>new App();
  function ui(app) {
    app.controls={controls:{isLocked:false},freeMove:true,motion:{},stop(){},setFreeMove(v){this.freeMove=v;},unlock(){}};
    app.zoneManager={getMapItems:()=>[],invalidateBuildingDetailPrebuilt(){}};
    app.library={};app.camera={updateProjectionMatrix(){}};
    app.renderer=new Renderer();app.renderer.setPixelRatio(app.getPixelRatio(app.currentQuality));
    app.postProcessing={quality:app.currentQuality,setQuality(q){this.quality=q;},onResize(){}};
    app.environment={setQuality(){}};app.shadowSetup={setQuality(){}};
    app.createUI();menus.push(app.settingsMenu);return app.settingsMenu;
  }
  return {create,ui,dom,context};
}

test('valid remembered quality overrides only the platform fallback, without writes',()=>{
  ready();for(const fallback of ['high','low'])for(const value of ['high','low']){
    const s=storage({[KEY]:value});assert.equal(preference.readQualityPreference(fallback,s),value);assert.equal(s.writes.length,0);
  }
});
test('absent or invalid quality retains original desktop/mobile defaults and is not migrated',()=>{
  ready();for(const value of [undefined,'','medium','HIGH',' low ','null','{}'])for(const fallback of ['high','low']){
    const s=storage(value===undefined?{quality:'low'}:{[KEY]:value,quality:'low'});
    assert.equal(preference.readQualityPreference(fallback,s),fallback);assert.equal(s.writes.length,0);
  }
});
test('saving explicit quality touches only its own key and rejects invalid values before writing',()=>{
  ready();const initial={quality:'legacy','fc3d-performance-mode-v1':'smooth',sound:'off',characters:'off',map:'open'},s=storage(initial);
  assert.equal(preference.writeQualityPreference('low',s),true);assert.equal(preference.writeQualityPreference('high',s),true);
  assert.deepEqual(s.writes,[[KEY,'low'],[KEY,'high']]);for(const [k,v]of Object.entries(initial))assert.equal(s.data.get(k),v);
  for(const value of ['medium','',null,undefined])assert.throws(()=>preference.writeQualityPreference(value,s));assert.equal(s.writes.length,2);
});
test('missing storage, throwing storage getter and read/write failures are safe',t=>{
  ready();const desc=Object.getOwnPropertyDescriptor(globalThis,'localStorage');t.after(()=>{if(desc)Object.defineProperty(globalThis,'localStorage',desc);else delete globalThis.localStorage;});
  delete globalThis.localStorage;assert.equal(preference.readQualityPreference('low'),'low');assert.equal(preference.writeQualityPreference('high'),false);
  Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('denied');}});
  assert.equal(preference.readQualityPreference('high'),'high');assert.equal(preference.writeQualityPreference('low'),false);
  const broken={getItem(){throw Error('read denied');},setItem(){throw Error('quota');}};
  assert.equal(preference.readQualityPreference('low',broken),'low');assert.equal(preference.writeQualityPreference('high',broken),false);
});
test('actual startup retains platform defaults, and restores a valid explicit choice without writes',t=>{
  const s=storage(),f=environment(t,s);
  for(const [mobile,value,want] of [[false,undefined,'high'],[true,undefined,'low'],[false,'bad','high'],[true,'bad','low'],[false,'low','low'],[true,'high','high']]){
    if(value===undefined)s.data.delete(KEY);else s.data.set(KEY,value);
    f.context.navigator.userAgent=mobile?'iPhone':'Macintosh';f.context.navigator.maxTouchPoints=mobile?5:0;
    const a=f.create();assert.equal(a.currentQuality,want);assert.equal(a.performanceMode,'eco');assert.equal(s.writes.length,0);
  }
});
test('actual first startup stage and initial renderer use restored quality, not the device default',async t=>{
  const s=storage({[KEY]:'low'}),f=environment(t,s),a=f.create();
  a.showLoading=()=>{};a.updateLoadingProgress=()=>{};a.showLoadingError=error=>{throw error;};
  // Stop after the normal renderer/shadow startup stage, before any World builders.
  f.context.requestAnimationFrame=fn=>{a.disposed=true;fn();};
  await a.init();assert.equal(a.currentQuality,'low');assert.equal(a.renderer.getPixelRatio(),1);assert.equal(a.shadowSetup.quality,'low');assert.equal(s.writes.length,0);
});
test('real quality button applies and persists one selection; a fresh application restores it',t=>{
  const s=storage({'fc3d-performance-mode-v1':'smooth',sound:'off',characters:'off'}),f=environment(t,s),a=f.create(),menu=f.ui(a);
  assert.equal(a.currentQuality,'high');menu.show();menu.hide();assert.equal(s.writes.length,0);
  const button=menu.panel.querySelector('#quality-toggle-btn');button.click();
  assert.equal(a.currentQuality,'low');assert.equal(a.postProcessing.quality,'low');assert.equal(a.renderer.getPixelRatio(),1);
  assert.deepEqual(s.writes,[[KEY,'low']]);assert.equal(f.create().currentQuality,'low');assert.equal(a.performanceMode,'smooth');
  button.click();assert.equal(a.currentQuality,'high');assert.equal(a.renderer.getPixelRatio(),2);assert.equal(f.create().currentQuality,'high');
  assert.deepEqual(s.writes,[[KEY,'low'],[KEY,'high']]);assert.equal(s.data.get('sound'),'off');assert.equal(s.data.get('characters'),'off');
});
test('storage write failure does not undo the real UI selection or corrupt the next startup default',t=>{
  const broken={getItem(){return null;},setItem(){throw Error('quota');}},f=environment(t,broken),a=f.create(),menu=f.ui(a);
  assert.doesNotThrow(()=>menu.panel.querySelector('#quality-toggle-btn').click());assert.equal(a.currentQuality,'low');
  assert.equal(menu.currentQuality,'low');assert.equal(a.postProcessing.quality,'low');assert.equal(f.create().currentQuality,'high');
});
test('programmatic quality changes and performance toggles never save a quality preference',t=>{
  const s=storage(),f=environment(t,s),a=f.create();f.ui(a);
  a.toggleQuality('low');assert.equal(a.currentQuality,'low');assert.equal(s.writes.length,0);
  a.setPerformanceMode('smooth');assert.deepEqual(s.writes,[['fc3d-performance-mode-v1','smooth']]);assert.equal(f.create().currentQuality,'high');
});
