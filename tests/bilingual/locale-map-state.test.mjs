import test from 'node:test';
import assert from 'node:assert/strict';
import {setupMap} from '../lib/map-fixture.mjs';
import {localeStore} from '../../src/i18n/LocaleStore.js';
for(const mobile of [false,true]) test(`language switch updates open card and keeps ${mobile?'touch':'keyboard'} movement and map state`,async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t,{mobile});t.after(()=>localeStore.setLocale('zh-CN'));
 s.map.hasTeleportTarget=name=>name==='太和殿';s.map.toggle();
 const query=s.map.container.querySelector('#place-search');query.value='taihe';s.dispatch(query,'input');
 const entries=s.map.placeList.querySelectorAll('button').filter(x=>!x.hidden);assert.ok(entries.some(x=>x.textContent==='太和殿'),'pinyin search works in Chinese UI');
 s.map.showPlace('taihe');const previous=s.map.placePanel.element.querySelector('#place-travel');previous.focus();s.map.container.scrollTop=91;s.map.placePanel.element.scrollTop=17;
 if(mobile)s.touch('touchstart');else s.key('keydown','KeyW');s.frame(100);
 const start=mobile?s.c.runStartTime:s.c.keyPressTimes.get('KeyW'),generation=s.c.joystick?.sessionGeneration,view={...s.map.view},selection={...s.map.selection};
 const ids={map:s.map,controls:s.c,panel:s.map.placePanel,catalog:s.map.placeCatalog};
 localeStore.setLocale('en');
 assert.match(s.map.placePanel.element.querySelector('#place-title').textContent,/Taihe|Supreme Harmony/);
 assert.match(s.map.placePanel.element.textContent,/project translation/i);
 assert.equal(s.map.placePanel.element.getAttribute('lang'),'en');
 assert.deepEqual(s.map.selection,selection);assert.deepEqual(s.map.view,view);assert.equal(query.value,'taihe');assert.equal(s.map.container.scrollTop,91);assert.equal(s.map.placePanel.element.scrollTop,17);
 assert.equal(s.map.selectedPlaceId,'taihe');assert.deepEqual({map:s.map,controls:s.c,panel:s.map.placePanel,catalog:s.map.placeCatalog},ids);
 assert.equal(mobile?s.c.runStartTime:s.c.keyPressTimes.get('KeyW'),start);if(mobile)assert.equal(s.c.joystick.sessionGeneration,generation);
 previous.click();assert.deepEqual(s.teleports,[],'detached pre-switch travel button cannot travel');
 const current=s.map.placePanel.element.querySelector('#place-travel');assert.equal(s.document.activeElement,current);current.click();assert.deepEqual(s.teleports,['太和殿'],'English label never changes target key');
});
test('English search and Chinese historical aliases remain usable across language changes',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();
 const input=s.map.container.querySelector('#place-search');
 for(const lang of ['en','zh-CN']){
  localeStore.setLocale(lang);
  for(const text of ['Taihe Hall','taihedian','tai he dian','奉天殿']){input.value=text;s.dispatch(input,'input');const found=s.map.placeList.querySelectorAll('button').filter(x=>!x.hidden);assert.equal(found.length,1,text);found[0].click();assert.equal(s.map.selectedPlaceId,'taihe');s.map.backToMap();}
 }
 assert.deepEqual(s.teleports,[]);
});
test('all four bridge groups keep bilingual and pinyin search without becoming travel targets',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();
 const input=s.map.container.querySelector('#place-search');
 for(const [query,name]of [['Inner Jinshui','内金水桥'],['wuyingmen','武英门前三座石桥'],['Banbi Bridge','半壁桥'],['sanzuomen','三座门外三座石桥']]){
  input.value=query;s.dispatch(input,'input');const found=s.map.bridgeFacilityList.querySelectorAll('button').filter(x=>!x.hidden);assert.equal(found.length,1,query);found[0].click();assert.equal(s.map.selection.name,name);assert.equal(s.map.placePanel.element.querySelector('#place-travel'),null);localeStore.setLocale('en');assert.doesNotMatch(s.map.placePanel.element.textContent,/[\u3400-\u9fff]|unavailable/u);s.map.backToMap();localeStore.setLocale('zh-CN');
 }
 assert.deepEqual(s.teleports,[]);
});
test('source link focus and panel scroll survive each direction of locale change',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();s.map.showPlace('taihe');
 const panel=s.map.placePanel.element,oldLink=panel.querySelectorAll('a')[0],href=oldLink.getAttribute('href');oldLink.focus();panel.scrollTop=83;
 for(const locale of ['en','zh-CN']){localeStore.setLocale(locale);await Promise.resolve();const active=s.document.activeElement;assert.ok(panel.contains(active),'focused link belongs to current rendered card');assert.equal(active.tagName,'A');assert.equal(active.getAttribute('href'),href);assert.equal(panel.scrollTop,83);}
});
test('a visible source link retains its viewport position when translated preceding content changes height',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));const create=s.document.createElement;
 s.document.createElement=tag=>{const el=create(tag);if(tag==='a'){const offset=localeStore.locale==='en'?450:250;el.getBoundingClientRect=()=>({top:100+offset-s.map.placePanel.element.scrollTop,bottom:120+offset-s.map.placePanel.element.scrollTop});}return el;};
 s.map.toggle();s.map.showPlace('taihe');const panel=s.map.placePanel.element;panel.getBoundingClientRect=()=>({top:100,bottom:300});panel.scrollTop=83;panel.querySelectorAll('a')[0].focus();const originalTop=s.document.activeElement.getBoundingClientRect().top;
 localeStore.setLocale('en');assert.equal(s.document.activeElement.getBoundingClientRect().top,originalTop);assert.equal(panel.scrollTop,283);
 localeStore.setLocale('zh-CN');assert.equal(s.document.activeElement.getBoundingClientRect().top,originalTop);assert.equal(panel.scrollTop,83);
});
