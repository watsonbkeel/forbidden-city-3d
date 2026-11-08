import test from 'node:test';import assert from 'node:assert/strict';
import{setupMap}from'../lib/map-fixture.mjs';import{localeStore}from'../../src/i18n/LocaleStore.js';import{translateText,missingTranslations}from'../../src/i18n/Messages.js';import{localizeDom}from'../../src/i18n/DomLocalization.js';
const cards=[['qinan','钦安殿','Hall of Imperial Peace'],['place-east-six-1400b5fc62','延禧宫','Yanxi Palace']];
// Only text-node storage is adapted; the actual Panel and localizer are used.
function localizeButton(node){
 const text={nodeType:3,parentNode:node,get nodeValue(){return node._text;},set nodeValue(v){node._text=v;}};
 node.nodeType=1;Object.defineProperty(node,'childNodes',{get:()=>[text]});const contains=node.contains.bind(node);node.contains=n=>n===text||contains(n);
 return localizeDom(node,{store:localeStore,translate:translateText,MutationObserver:null});
}
for(const[id,zh,en]of cards)test(`real exterior-view Panel exposes the complete English accessible destination: ${id}`,async t=>{
 localeStore.setLocale('en');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.hasTeleportTarget=()=>true;s.map.toggle();s.map.showPlace(id);
 const p=s.map.placeCatalog.get(id);assert.equal(p.modelExperience.navigationMode,'exterior-view');assert.equal(p.modelExperience.teleportTargetName,zh);
 const button=s.map.placePanel.element.querySelector('#place-travel');assert.ok(button);const local=localizeButton(button);t.after(()=>local.dispose());
 assert.equal(button.getAttribute('aria-label'),`Go to the exterior viewing point for ${en}`);assert.deepEqual([...missingTranslations],[]);
});
for(const[id,zh,en]of cards)test(`language round trips preserve exterior-only permission and the canonical travel key: ${id}`,async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.hasTeleportTarget=()=>true;s.map.toggle();s.map.showPlace(id);
 const panel=s.map.placePanel.element,selection={...s.map.selection},view={...s.map.view},camera=s.logical().toArray(),stale=panel.querySelector('#place-travel');let local=null;
 t.after(()=>local?.dispose());
 for(const lang of ['zh-CN','en','zh-CN','en']){
  local?.dispose();localeStore.setLocale(lang);await Promise.resolve();const button=panel.querySelector('#place-travel');local=localizeButton(button);
  assert.equal(s.map.placePanel.element,panel);assert.deepEqual(s.map.selection,selection);assert.deepEqual(s.map.view,view);assert.deepEqual(s.logical().toArray(),camera);assert.deepEqual(s.teleports,[]);
  assert.equal(button.getAttribute('aria-label'),lang==='en'?`Go to the exterior viewing point for ${en}`:`前往${zh}外观观览点`);
  assert.equal(s.map.placeCatalog.get(id).modelExperience.navigationMode,'exterior-view');assert.deepEqual([...missingTranslations],[]);
 }
 stale.click();assert.deepEqual(s.teleports,[],'detached action never acquires a current destination');panel.querySelector('#place-travel').click();assert.deepEqual(s.teleports,[zh]);
});
for(const[id]of cards)test(`translation does not grant an unavailable exterior travel target: ${id}`,async t=>{
 localeStore.setLocale('en');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.hasTeleportTarget=()=>false;s.map.toggle();s.map.showPlace(id);
 assert.equal(s.map.placePanel.element.querySelector('#place-travel'),null);assert.deepEqual(s.teleports,[]);
});
test('unknown exterior destination still reports missing text instead of hiding the error',()=>{
 assert.deepEqual([...missingTranslations],[]);
 assert.equal(translateText('前往未核未知宫外观观览点','en'),'Go to the exterior viewing point for English text unavailable.');
 assert.deepEqual([...missingTranslations],['未核未知宫']);
});
