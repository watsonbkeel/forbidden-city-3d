import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { compiledCharacterPreview } from './lib/vite-character-preview.mjs';
import { createDOM } from './lib/ui-dom.mjs';
const dev=await compiledCharacterPreview(true),prod=await compiledCharacterPreview(false);
function fixture(module,options={}){
 const dom=createDOM(),camera=new THREE.PerspectiveCamera(60,1,.1,1000);camera.position.set(0,1.6,8);camera.lookAt(0,1,0);camera.updateMatrixWorld();
 let resolves=0,advances=0,cancels=0,copies=[];
 const adapter={getRevision:()=>1,resolve:actor=>{resolves++;return options.binding?.(actor)??{status:'ready',position:[0,0,0],rotationYRad:0,zoneRef:actor.zoneRef,support:{},...(actor.placement.mode==='path'?{path:{status:'ready',points:[[0,0,0],[0,0,20]],formationSize:3}}:{})};},advance(){advances++;},cancelPending(){cancels++;},dispose(){}};
 const renderer={render:actors=>{copies=actors;return{renderCopies:actors.length}},clear(){copies=[]},snapshot:()=>({renderCopies:copies.length}),dispose(){copies=[]}};
 const system=new module.CharacterSystem({scene:new THREE.Scene(),camera,adapter,renderer,documentObject:dom.document,contentEnabled:false,registry:options.registry??module.CHARACTER_REGISTRY});
 return{system,dom,resolves:()=>resolves,advances:()=>advances,cancels:()=>cancels,copies:()=>copies};
}
test('production compiler removes enabling branches; direct methods cannot open preview',()=>{
 const f=fixture(prod.module);assert.equal(prod.module.CHARACTER_ROLLOUT_APPROVED,false);
 assert.equal(f.system.setDevelopmentPreview(true),false);assert.equal(f.system.manager.setDevelopmentPreview(true),false);
 f.system.previewActive=true;f.system.manager.previewActive=true;f.system.manager.developmentPreviewAuthorized=true;
 f.system.setEnabled(true);f.system.update(.1);assert.equal(f.resolves(),0);assert.equal(f.advances(),0);assert.equal(f.system.snapshot().contentApproved,false);assert.equal(f.system.snapshot().previewActive,false);
 for(const method of [prod.module.CharacterSystem.prototype.setDevelopmentPreview,prod.module.CharacterManager.prototype.setDevelopmentPreview])assert.match(method.toString(),/\{\s*return false;?\s*\}/);
 f.system.dispose();
});
test('DEV starts gated and explicit session preview never sets formal approval',()=>{
 const f=fixture(dev.module);f.system.update(.1);assert.equal(f.resolves(),0);assert.equal(f.system.developmentPreviewActive,false);
 assert.equal(f.system.setDevelopmentPreview(true),true);for(let i=0;i<4;i++)f.system.update(.1);
 assert.equal(f.system.snapshot().registered,38);assert.equal(f.system.snapshot().loaded,38);assert.ok(f.copies().length>0);assert.ok(f.advances()>0);
 assert.equal(f.system.snapshot().rollout,'preview-unverified');assert.equal(f.system.statusSnapshot().rollout,'preview-unverified');assert.equal(f.system.manager.contentApproved,false);assert.equal(dev.module.CHARACTER_ROLLOUT_APPROVED,false);f.system.dispose();
});
test('ordinary off revokes preview, clears all 38 and cannot re-enable by ordinary on',()=>{
 const f=fixture(dev.module);
 for(let i=0;i<20;i++){
  f.system.setDevelopmentPreview(true);for(let frame=0;frame<4;frame++)f.system.update(.1);
  assert.equal(f.system.snapshot().loaded,38);f.system.setEnabled(false);
  assert.equal(f.system.snapshot().previewActive,false);assert.equal(f.copies().length,0);assert.equal(f.system.snapshot().loaded,0);
  for(const state of f.system.manager.states.values()){assert.equal(state.binding,null);assert.equal(state.request,null);assert.equal(state.patrol,null);}
  const count=f.resolves(),advances=f.advances();f.system.setEnabled(true);f.system.update(.1);assert.equal(f.resolves(),count);assert.equal(f.advances(),advances);
 }
 assert.equal(f.cancels(),20);assert.equal(f.system.snapshot().registered,38);f.system.dispose();
});
test('explicit preview off, disposal and new-page System all restore the closed gate',()=>{
 const f=fixture(dev.module);f.system.setDevelopmentPreview(true);assert.equal(f.system.setDevelopmentPreview(false),false);assert.equal(f.system.enabled,false);
 f.system.setDevelopmentPreview(true);f.system.dispose();assert.equal(f.system.setDevelopmentPreview(true),false);assert.equal(f.system.developmentPreviewActive,false);
 const fresh=fixture(dev.module);fresh.system.update(.1);assert.equal(fresh.resolves(),0);assert.equal(fresh.system.developmentPreviewActive,false);fresh.system.dispose();
});
test('DEV preview cannot override invalid registry or failed/pending support',()=>{
 const invalid=fixture(dev.module,{registry:{actors:[{id:'same'},{id:'same'}],anchors:{}}});assert.equal(invalid.system.setDevelopmentPreview(true),false);invalid.system.update(.1);assert.equal(invalid.resolves(),0);invalid.system.dispose();
 for(const status of ['error','pending']){const f=fixture(dev.module,{binding:()=>({status,reason:'required-support-not-verified'})});assert.equal(f.system.setDevelopmentPreview(true),true);f.system.update(.1);assert.equal(f.system.snapshot().loaded,0);assert.equal(f.copies().length,0);assert.equal(f.system.snapshot().registered,38);assert.equal(f.system.snapshot()[status==='error'?'errors':'pending'],38);f.system.dispose();}
});
test('night planning and background resume retain original gates during DEV preview',()=>{
 const f=fixture(dev.module);f.system.setDevelopmentPreview(true);for(let i=0;i<30;i++)f.system.update(.1,{daylight:0});
 assert.ok(f.copies().length>0);assert.ok(f.copies().every(x=>x.schedule==='guard-duty'));assert.ok(f.copies().every(x=>x.id!=='taihe-emperor'));
 f.dom.document.hidden=true;f.dom.dispatch(f.dom.document,'visibilitychange');const time=f.system.manager.simulationSeconds,queries=f.resolves();f.system.update(30);assert.equal(f.system.manager.simulationSeconds,time);assert.equal(f.resolves(),queries);
 f.dom.document.hidden=false;f.dom.dispatch(f.dom.document,'visibilitychange');f.system.update(30);assert.equal(f.system.manager.simulationSeconds,time);f.system.dispose();
});
test('runtime failure revokes preview without adding another update loop or System',()=>{
 const f=fixture(dev.module);f.system.setDevelopmentPreview(true);f.system.manager.update=()=>{throw Error('preview runtime fault')};f.system.update(.1);assert.equal(f.system.enabled,false);assert.equal(f.system.developmentPreviewActive,false);assert.match(f.system.lastError,/preview runtime fault/);f.system.dispose();
 const main=readFileSync(new URL('../main.js',import.meta.url),'utf8');assert.equal((main.match(/new CharacterSystem\(/g)||[]).length,1);assert.equal((main.match(/this\.characters\?\.update\(/g)||[]).length,1);
 assert.match(main,/if \(import\.meta\.env\?\.DEV === true\) this\._syncCharacterPreviewState/);assert.match(main,/this\._syncCharacterPreviewState\?\.\(\)/);
});

test('pending completion after preview-off cannot resurrect actors or reuse a stale request',async()=>{
 let resolve;const pending=new Promise(r=>{resolve=r;});const f=fixture(dev.module,{binding:()=>pending});
 f.system.setDevelopmentPreview(true);f.system.update(.1);assert.equal(f.system.snapshot().pending,38);
 f.system.setDevelopmentPreview(false);resolve({status:'ready',position:[0,0,0],rotationYRad:0,support:{}});await Promise.resolve();await Promise.resolve();
 f.system.setEnabled(true);f.system.update(.1);assert.equal(f.system.snapshot().loaded,0);assert.equal(f.copies().length,0);assert.equal(f.system.snapshot().previewActive,false);
 for(const state of f.system.manager.states.values())assert.equal(state.binding,null);f.system.dispose();
});

test('compiled DEV UI controls the same real System, ordinary off revokes it, and refresh starts closed',t=>{
 const prior={document:globalThis.document,window:globalThis.window};const f=fixture(dev.module);Object.assign(globalThis,{document:f.dom.document,window:f.dom.window});const menu=new dev.module.SettingsMenu(document.body);
 menu.init({charactersAvailable:false,charactersApproved:false,allowCharacterPreview:true,onCharactersToggle:enabled=>{f.system.setEnabled(enabled);if(!enabled)menu.setCharacterPreviewActive(false)},onCharacterPreviewToggle:enabled=>{const active=f.system.setDevelopmentPreview(enabled);menu.charactersEnabled=f.system.enabled;menu.updateCharactersButton();return active;}});
 t.after(()=>{menu.dispose();f.system.dispose();Object.assign(globalThis,prior)});
 const preview=menu.panel.querySelector('#characters-preview-toggle-btn'),ordinary=menu.panel.querySelector('#characters-toggle-btn');
 assert.equal(f.system.developmentPreviewActive,false);preview.click();for(let i=0;i<4;i++)f.system.update(.1);assert.equal(f.system.snapshot().loaded,38);assert.equal(menu.characterPreviewActive,true);assert.equal(f.system.snapshot().contentApproved,false);
 ordinary.click();assert.equal(menu.characterPreviewActive,false);assert.equal(f.system.snapshot().previewActive,false);assert.equal(f.copies().length,0);ordinary.click();f.system.update(.1);assert.equal(f.system.snapshot().loaded,0);
 preview.click();f.system.manager.update=()=>{throw Error('preview auto-close fixture')};f.system.update(.1);menu.setCharacterPreviewActive(f.system.developmentPreviewActive===true);assert.equal(menu.characterPreviewActive,false);assert.equal(f.system.developmentPreviewActive,false);assert.match(menu.panel.querySelector('#characters-preview-status').textContent,/关闭/);
});
