import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {CHARACTER_REGISTRY} from '../data/characters/index.js';
import {validateCharacterRegistry} from '../src/scene/characters/CharacterSchema.js';
import {CharacterManager} from '../src/scene/characters/CharacterManager.js';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
import {CharacterWorkQueue} from '../src/scene/characters/CharacterWorkQueue.js';

// Synthetic capacity fixtures, not an assertion that 128 historical occupants
// are shipped. Preserve every real actor and add explicitly test-only guard IDs.
function capacityRegistry(count=128){
 const registry=structuredClone(CHARACTER_REGISTRY),guard=registry.actors.find(a=>a.templateId==='guard-duty'&&a.placement.mode==='surface');
 registry.scope.registeredHardLimit=128;
 while(registry.actors.length<count){const i=registry.actors.length;registry.actors.push({...structuredClone(guard),id:`capacity-fixture-${i}`,required:false,sceneId:'capacity-test',sceneRef:'capacity-test',behavior:{...guard.behavior,seed:200000+i}});}
 return registry;
}
test('runtime schema accepts 128 unique logical records, rejects 129 even if caller raises its own scope',()=>{
 assert.equal(validateCharacterRegistry(capacityRegistry()).valid,true);
 const oversized=capacityRegistry(129);oversized.scope.registeredHardLimit=999;
 assert.equal(validateCharacterRegistry(oversized).valid,false);
 const forged=capacityRegistry();forged.scope.registeredHardLimit=999;assert.equal(validateCharacterRegistry(forged).valid,false);
});
test('direct Manager constructor permits 128 but never silently truncates 129',()=>{
 const registry=capacityRegistry();let manager;assert.doesNotThrow(()=>manager=new CharacterManager({registry,adapter:{},renderer:{dispose(){}}}));
 assert.equal(manager.states.size,128);manager.dispose();
 assert.throws(()=>new CharacterManager({registry:capacityRegistry(129),adapter:{},renderer:{}}),/128 logical actors/);
 const oversizedList=new Proxy(new Array(129),{get(target,key){if(key===Symbol.iterator)throw Error('Must reject before iteration/allocation');return Reflect.get(target,key);}});
 assert.throws(()=>new CharacterManager({registry:{actors:oversizedList},adapter:{},renderer:{}}),/128 logical actors/);
});
test('JSON document/combined schemas and scope agree on 128; LOD capacity is independent',()=>{
 const schema=JSON.parse(fs.readFileSync(new URL('../data/characters/schema.json',import.meta.url)));
 assert.equal(schema.properties.actors.maxItems,128);assert.equal(schema.$defs.actorsDocument.properties.actors.maxItems,128);
 assert.equal(schema.$defs.scope.properties.registeredHardLimit.const,128);assert.equal(CHARACTER_REGISTRY.scope.registeredHardLimit,128);
 assert.equal(schema.$defs.actor.properties.formation.properties.index.maximum,15);
});
for(const cost of [1.25,2])test(`128 real resource preparations progress under controlled ${cost}ms submission pressure; high64/low32/near2`,async()=>{
 const registry=capacityRegistry(),queue=new CharacterWorkQueue(),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(70,1,.1,1000);
 camera.position.set(0,1.7,-8);camera.lookAt(0,1,0);camera.updateMatrixWorld(true);
 let clock=0,revision=1,system;const descriptor=Object.getOwnPropertyDescriptor(performance,'now');Object.defineProperty(performance,'now',{configurable:true,value:()=>clock});
 const adapter={work:queue,stats:{},getRevision:()=>revision,request(actor,prepare){const version=revision;return queue.request(actor.id,function*(){
   const geometrySteps=prepare(actor);let step;while(!(step=geometrySteps.next()).done){clock+=.01;yield step.value;}
   for(let i=0;i<20;i++){clock+=.01;yield{kind:'synthetic-capacity-support',workUnits:1,maxWorkUnits:1};}
   return{status:'ready',position:[0,0,0],rotationYRad:0,support:{generation:version},path:{status:'ready',points:[[0,0,0],[0,0,20]],formationSize:3}};
 },{version,identity:actor.id,isCurrent:()=>revision===version});},advance:o=>queue.advance({...o,version:revision}),cancelPending:()=>queue.cancel(),dispose:()=>queue.dispose()};
 const document={hidden:false,addEventListener(){},removeEventListener(){}};
 try{
  system=new CharacterSystem({scene,camera,registry,adapter,documentObject:document});assert.equal(system.validation.valid,true);
  const render=system.renderer.render.bind(system.renderer);system.renderer.render=(...args)=>{const result=render(...args);clock+=cost;return result;};
  const tick=async(quality='high')=>{system.update(1/60,{quality,daylight:1});await Promise.resolve();assert.equal(system.lastError,null);};
  let frames=0;while(system.manager.stats.loaded<128&&frames++<1400)await tick();assert.equal(system.manager.stats.loaded,128,'every registered job must finish, not only the selected 64');
  for(let i=0;i<25;i++)await tick();assert.equal(system.manager.stats.visible,64);assert.equal(system.manager.stats.near,2);assert.equal(system.manager.stats.renderCopies,64);
  assert.equal([...system.renderer.batches.values()].reduce((n,b)=>n+b.mesh.count,0),64);assert.ok(system.pool.stats().entries<=63);
  assert.ok([...system.renderer.batches.values()].every(b=>b.mesh.geometry.attributes.characterAnim.count===96),'per-batch GPU buffer remains96, not128');
  await tick('low');assert.equal(system.manager.stats.visible,32);assert.equal(system.manager.stats.near,0);
  assert.ok(queue.stats.steps>0);assert.ok(queue.stats.maxFrameMs<=.26+1e-6,'controlled .25 deadline plus one bounded .01 step');assert.ok(system.totalUpdateSamples.some(v=>v>cost),'honestly counts preparation outside the nominal1ms target');
  system.setEnabled(false);assert.equal(system.renderer.batches.size,0);assert.equal(system.pool.stats().references,0);const steps=queue.stats.steps;for(let i=0;i<10;i++)await tick();assert.equal(queue.stats.steps,steps);
  revision++;system.setEnabled(true);frames=0;while(system.manager.stats.loaded<128&&frames++<1400)await tick();assert.equal(system.manager.stats.loaded,128);assert.ok([...system.manager.states.values()].every(s=>s.binding.support.generation===revision));
  assert.equal(new Set([...system.manager.states.keys()]).size,128);
 }finally{system?.dispose();if(descriptor)Object.defineProperty(performance,'now',descriptor);else delete performance.now;}
});
