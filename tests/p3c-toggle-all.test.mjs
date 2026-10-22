import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { SettingsMenu } from '../src/ui/SettingsMenu.js';
import { CharacterSystem, CHARACTER_ROLLOUT_APPROVED } from '../src/scene/characters/CharacterSystem.js';
import { CHARACTER_REGISTRY } from '../data/characters/index.js';
import { createDOM } from './lib/ui-dom.mjs';
// Isolated UI/lifecycle test: clustered ready bindings are a fixture, not an
// architecture-support claim. The separate joint-world test verifies support.
test('settings off removes all 38 logical actors from real instance streams without changing requirements', t => {
 const saved={document:globalThis.document,window:globalThis.window},dom=createDOM();Object.assign(globalThis,dom);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,1,.1,1000);camera.position.set(0,1.6,8);camera.lookAt(0,1,0);camera.updateMatrixWorld();
 let resolves=0,cancels=0;
 const adapter={getRevision:()=>1,resolve:actor=>{resolves++;return {status:'ready',position:[0,0,0],rotationYRad:0,zoneRef:actor.zoneRef,support:{},...(actor.placement.mode==='path'?{path:{status:'ready',id:actor.placement.pathRef,points:[[0,0,0],[0,0,20]],formationSize:3}}:{})};},cancelPending(){cancels++;},dispose(){}};
 const system=new CharacterSystem({scene,camera,adapter,registry:CHARACTER_REGISTRY,documentObject:dom.document,contentApproved:true});
 const menu=new SettingsMenu(dom.document.body);let calls=0;menu.init({onCharactersToggle:enabled=>{calls++;system.setEnabled(enabled);}});
 t.after(()=>{menu.dispose();system.dispose();Object.assign(globalThis,saved);});
 const required=CHARACTER_REGISTRY.actors.filter(a=>a.required).map(a=>a.id),button=menu.panel.querySelector('#characters-toggle-btn');
 for(let cycle=0;cycle<20;cycle++){
  for(let frame=0;frame<4;frame++)system.update(.1,{daylight:1});
  assert.equal(system.snapshot().loaded,38);assert.ok(system.snapshot().visible>0);assert.equal(system.snapshot().lastError,null);assert.ok(system.renderer.batches.size>0);
  menu.show();button.click();
  assert.equal(system.enabled,false);assert.equal(system.snapshot().registered,38);assert.equal(system.snapshot().loaded,0);assert.equal(system.snapshot().renderCopies,0);assert.equal(system.renderer.batches.size,0);assert.equal(system.renderer.root.children.length,0);assert.equal(system.pool.stats().references,0);
  for(const state of system.manager.states.values()){assert.equal(state.binding,null);assert.equal(state.request,null);assert.equal(state.patrol,null);}
  const time=system.manager.simulationSeconds,count=resolves;system.update(30,{daylight:1});assert.equal(system.manager.simulationSeconds,time);assert.equal(resolves,count);
  button.click();assert.equal(system.enabled,true);assert.equal(menu.visible,true);
 }
 assert.equal(calls,40);assert.equal(cancels,20);assert.deepEqual(CHARACTER_REGISTRY.actors.filter(a=>a.required).map(a=>a.id),required);assert.equal(required.length,38);assert.equal(CHARACTER_ROLLOUT_APPROVED,false);
});
