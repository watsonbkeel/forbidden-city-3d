import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {gzipSync,gunzipSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
import * as THREE from 'three';
import {CHARACTER_REGISTRY as base} from '../data/characters/index.js';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
import {observeCharacterSubmissions} from './lib/r52-character-scene.mjs';
import {withR53LifeCandidates} from './lib/r53-life-candidates.mjs';
const fragment=JSON.parse(fs.readFileSync('data/characters/fragments/r53-household-life.json'));
const registry=withR53LifeCandidates(base,fragment);
const fixture=()=>({scene:new THREE.Scene(),cm:{colliders:[],walkables:[]},zoneManager:{loaded:new Map(),getLoadedIds:()=>[]},dom:{document:{hidden:false}}});
const makeSystem=W=>new CharacterSystem({scene:W.scene,camera:new THREE.PerspectiveCamera(),collisionManager:W.cm,zoneManager:W.zoneManager,registry,documentObject:W.dom.document});

test('proof context owns default resources but never disposes supplied system or observer',async()=>{
 const {acquireR53LifeProofContext}=await import('./lib/r53-life-proof-context.mjs');
 const W=fixture(),owned=acquireR53LifeProofContext(W,registry);assert.equal(owned.ownsSystem,true);owned.dispose();assert.equal(owned.system.disposed,true);owned.dispose();
 const system=makeSystem(W),observer=observeCharacterSubmissions(system),render=system.renderer.render,clear=system.renderer.clear;let disposed=0;const dispose=observer.dispose;observer.dispose=()=>{disposed++;dispose();};
 try{const ctx=acquireR53LifeProofContext(W,registry,{externalSystem:system,externalObserver:observer});assert.equal(ctx.system,system);assert.equal(ctx.camera,system.camera);system.renderer.render([]);ctx.dispose();assert.equal(system.disposed,false);assert.equal(disposed,0);assert.equal(system.renderer.render,render);assert.equal(system.renderer.clear,clear);
 const localObserver=acquireR53LifeProofContext(W,registry,{externalSystem:system});localObserver.dispose();assert.equal(system.disposed,false);assert.equal(system.renderer.render,render);
 }finally{observer.dispose();system.dispose();}
});

test('proof context rejects wrong world, registry, observer and disposed ownership before running',async()=>{
 const {acquireR53LifeProofContext}=await import('./lib/r53-life-proof-context.mjs');const W=fixture(),system=makeSystem(W),observer=observeCharacterSubmissions(system);
 try{
  assert.throws(()=>acquireR53LifeProofContext(W,registry,{externalObserver:observer}),/externalSystem/);
  for(const key of ['scene','cm','zoneManager'])assert.throws(()=>acquireR53LifeProofContext({...W,[key]:{}},registry,{externalSystem:system}),/world|scene|collision|zone/i);
  for(const invalid of [{},false,null])assert.throws(()=>acquireR53LifeProofContext(W,registry,{externalSystem:invalid}),/CharacterSystem/);
  for(const invalid of [{},false,null])assert.throws(()=>acquireR53LifeProofContext(W,registry,{externalSystem:system,externalObserver:invalid}),/observer/i);
  const old=system.manager.states.get(registry.actors[0].id).actor;system.manager.states.get(old.id).actor={...old,required:false};assert.throws(()=>acquireR53LifeProofContext(W,registry,{externalSystem:system}),/actor records/);system.manager.states.get(old.id).actor=old;
  const stale={submitted:[{id:'foreign'}],meshes(){return[];},dispose(){throw Error('Caller observer must not be disposed');}},ctx=acquireR53LifeProofContext(W,registry,{externalSystem:system,externalObserver:stale});assert.throws(()=>system.renderer.render([]),/same renderer/);ctx.dispose();assert.equal(system.disposed,false);
 }finally{observer.dispose();system.dispose();}
 assert.throws(()=>acquireR53LifeProofContext(W,registry,{externalSystem:system}),/disposed/);
});

test('proof paths require explicit world identity and cannot overwrite frozen evidence or geometry',async()=>{
 const {r53LifeProofOptions}=await import('./lib/r53-life-proof-context.mjs');assert.throws(()=>r53LifeProofOptions({}),/worldState/);assert.throws(()=>r53LifeProofOptions({worldState:'pretend'}),/worldState/);
 for(const out of ['reports/r53-life-candidates','reports/r53-life-candidates/sub'])assert.throws(()=>r53LifeProofOptions({worldState:'integrated-r53',out}),/frozen/);
 assert.throws(()=>r53LifeProofOptions({worldState:'integrated-r53',geometryOut:'/tmp/r53-life-candidates-geometry'}),/frozen/);
 assert.throws(()=>r53LifeProofOptions({worldState:'integrated-r53',geometryOut:'reports/r53-life-candidates'}),/frozen/);
 assert.throws(()=>r53LifeProofOptions({worldState:'integrated-r53',out:'/tmp/r53-life-candidates-geometry'}),/frozen/);
 const a=r53LifeProofOptions({worldState:'integrated-r53'}),b=r53LifeProofOptions({worldState:'integrated-r53'});assert.notEqual(a.out,b.out);assert.notEqual(a.geometryOut,b.geometryOut);assert.match(a.boundary,/integrated R53/);assert.doesNotMatch(a.boundary,/on frozen R52/);
 assert.match(r53LifeProofOptions({worldState:'frozen-r52'}).boundary,/frozen R52/);
});


test('proof finally preserves external resources even when an early assertion fails',async()=>{
 const {proveR53LifeCandidates}=await import('./lib/r53-life-candidate-proof.mjs');const W=fixture(),system=makeSystem(W),observer=observeCharacterSubmissions(system),render=system.renderer.render;
 const out=fs.mkdtempSync(path.join(os.tmpdir(),'r53-life-proof-error-'));system.setEnabled(false);const originalError=console.error;console.error=()=>{};
 try{await assert.rejects(proveR53LifeCandidates(W,{externalSystem:system,externalObserver:observer,worldState:'integrated-r53',out,exports:false}),/false !== true/);assert.equal(system.disposed,false);assert.equal(system.renderer.render,render);const report=JSON.parse(gunzipSync(fs.readFileSync(path.join(out,'candidate-world-proof.json.gz'))));assert.equal(report.success,false);assert.equal(report.worldState,'integrated-r53');assert.equal(report.frozen71Hash,'bc42abd8b0fcd448d95eb72b95577c97992acd93f95845301229d960c7013098');}
 finally{console.error=originalError;observer.dispose();system.dispose();fs.rmSync(out,{recursive:true,force:true});}
});

test('a frozen-R52 label rejects changed source fingerprints rather than relabeling an integrated world',async()=>{
 const {assertR53LifeWorldState}=await import('./lib/r53-life-proof-context.mjs');const frozen=JSON.parse(gunzipSync(fs.readFileSync('reports/r53-life-candidates/candidate-world-proof.json.gz'))).sourceHashes;
 assert.doesNotThrow(()=>assertR53LifeWorldState('frozen-r52',frozen));assert.throws(()=>assertR53LifeWorldState('frozen-r52',{...frozen,'data/zones/west-six.json':'changed'}),/exact frozen/);assert.doesNotThrow(()=>assertR53LifeWorldState('integrated-r53',{...frozen,'data/zones/west-six.json':'changed'}));
});

test('raster world label is explicit while the original default caption is preserved',()=>{
 // Empty diagnostic input is deliberately rejected for acceptance. Its emitted
 // metadata lets this lightweight test inspect captions without any world run.
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'r53-life-caption-')),source=path.join(dir,'empty.json.gz');fs.writeFileSync(source,gzipSync(JSON.stringify({camera:{position:[0,0,0],matrixWorldInverse:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],fov:65},triangles:[],sourceCharacterInstances:0})));
 try{for(const label of [null,'actual integrated-R53 scene']){const out=path.join(dir,label?'integrated.png':'default.png'),args=['tests/lib/r53-life-raster.py',source,out,...(label?['--world-label',label]:[])],r=spawnSync('python',args,{encoding:'utf8'});assert.equal(r.status,1);assert.match(r.stderr,/No visible character pixels/);const data=JSON.parse(fs.readFileSync(out.replace('.png','.json')));assert.equal(data.worldLabel,label??'actual frozen-R52 scene');assert.equal(data.caption,'R53 CANDIDATE: EMPTY | '+(label??'actual frozen-R52 scene')+' + submitted instance buffers');}}
 finally{fs.rmSync(dir,{recursive:true,force:true});}
});
