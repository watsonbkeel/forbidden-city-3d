import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {buildR52World} from './lib/r52-world.mjs';
import {cpuDracoLoader} from './lib/cpu-draco.mjs';
import {observeCharacterSubmissions,actualTriangleRays,visibleArchitecture,actualSoleContact} from './lib/r52-character-scene.mjs';
import {CHARACTER_REGISTRY} from '../data/characters/index.js';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
import {exportProductionView} from './lib/r51-production-raster.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root)),sha=b=>createHash('sha256').update(b).digest('hex');
const additions=JSON.parse(read('reports/r52-population/candidates/taihe-14.json')).actors,registry=structuredClone(CHARACTER_REGISTRY);
for(const actor of additions)if(!registry.actors.some(a=>a.id===actor.id))registry.actors.push(actor);
const floor=registry.surfaces.find(s=>s.id==='taihe-hall-floor');Object.assign(floor,{kind:'ground',expectedHeightMeters:9.9675,source:'src/scene/PalaceBuilder.js#buildHall visible 三台_taihe_square_brick_floor mesh; resolved again for each active B/S interior generation',verification:'Actual upward-facing rendered floor at feet, not lower registered collision datum; no hard-coded vertical actor offset'});
const sourceFiles=['src/scene/characters/CharacterKit.js','src/scene/characters/CharacterSystem.js','src/scene/characters/CharacterWorldAdapter.js','src/scene/interior/InteriorLoader.js','src/scene/palace/special/WuyingMoonTerrace.js','src/scene/palace/special/WuyingRepresentativeDetails.js'];
const hashes=()=>Object.fromEntries(sourceFiles.map(p=>[p,sha(read(p))]));
test('R52 Taihe fourteen additions enter actual renderer; all four attendants follow visible B/S/B floor with actual shoe contacts',async t=>{
 const W=await buildR52World(),hook=registerHooks({load(u,c,next){return next(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});
 let InteriorLoader;try{({InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js'));}finally{hook.deregister();}
 const cfg=JSON.parse(read('data/interiors/taihe.json')),interiors=new InteriorLoader(W.scene,W.cm,{registry:{taihe:cfg}}),camera=new THREE.PerspectiveCamera(65,16/9,.1,2000);
 const system=new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,interiors,registry,documentObject:W.dom.document}),observer=observeCharacterSubmissions(system);
 const attendants=registry.actors.filter(a=>a.id.startsWith('taihe-attendant')).map(a=>a.id),report={boundary:'CPU actual production geometry, instance streams and shader-equivalent deformed triangles, not browser/GPU/textures/shadows. Candidate adds only the approved14 and semantic visible-floor binding to current registry; no geometry substitutions. Unrelated characters retain approved production behavior.',registered:registry.actors.length,sourceHashes:hashes(),sourceKitExpected:'7696c28eaa608bcd726a724746a88a4770064d6b3da677445cad3dcc53a863ab',samples:[],stages:[]};
 const tick=async(daylight=1,quality='high')=>{system.update(1/60,{daylight,quality,viewportHeight:1080});await Promise.resolve();assert.equal(system.lastError,null);};
 async function settle(ids,daylight=1,quality='high'){for(let i=0;i<16000;i++){await tick(daylight,quality);if(ids.every(id=>observer.submitted.some(a=>a.id===id&&a.visibility===1)))return i+1;}throw Error('Bounded frame limit: '+JSON.stringify({ids,status:system.statusSnapshot(),states:ids.map(id=>({id,...system.manager.states.get(id)}))}));}
 async function sample(label,ids,position,target,{feet=false,exportView=false}={}){
  camera.position.fromArray(position);camera.lookAt(...target);camera.updateMatrixWorld(true);const frames=await settle(ids);W.scene.updateMatrixWorld(true);const models=observer.meshes(),arch=visibleArchitecture(W.scene),objects=[...arch,...models.map(m=>m.mesh)],row={label,camera:position,frames,cameraCollision:W.cm.checkCollision(camera.position,.5),actors:[]};
  assert.equal(row.cameraCollision,false,'Legal viewpoint '+label);
  for(const id of ids){const copies=models.filter(m=>m.actor.id===id);assert.equal(copies.length,1);const model=copies[0],rays=actualTriangleRays(camera,model,objects),binding=system.manager.states.get(id).binding;const a={id,lod:model.actor.lod,position:model.actor.position,visibility:model.visibility,rays,support:binding.support,revision:system.world.getRevision(model.actor)};assert.equal(model.visibility,1);assert.ok(rays.visible>0,'Actual visible triangles '+label+' '+id);if(feet){a.soles=actualSoleContact(model,arch);assert.ok(a.soles.every(f=>f.withinContactTolerance),'Actual shoe soles touch visible floor '+id+' '+JSON.stringify(a.soles));}row.actors.push(a);}
  if(exportView){fs.mkdirSync('/tmp/r52-taihe-geometry',{recursive:true});row.geometry=exportProductionView({scene:W.scene,camera,characters:system},`/tmp/r52-taihe-geometry/${label}.json.gz`,{far:90});}
  for(const m of models)m.mesh.geometry.dispose();report.samples.push(row);console.log(label,JSON.stringify(row.actors.map(a=>({id:a.id,lod:a.lod,clear:a.rays.visible,feet:a.soles?.every(f=>f.withinContactTolerance)}))));return row;
 }
 try{
  assert.equal(system.validation.valid,true,JSON.stringify(system.validation.errors));assert.equal(sha(read('src/scene/characters/CharacterKit.js')),report.sourceKitExpected);
  // Each of fourteen new IDs is targeted separately. Non-zero unrelated batches cannot satisfy this check.
  for(const actor of additions.filter(a=>!a.id.includes('attendant'))){const [x,,z]=actor.placement.offsetMeters;await sample('new-'+actor.id,[actor.id],[x,1.7,z-4],[x,1,z],{exportView:actor.id==='taihe-official-east-05-01'});}
  const before=await sample('B-four-attendants',attendants,[0,11.6375,-4],[0,10.9,2],{feet:true});report.stages.push({stage:'B',state:interiors.getState('taihe'),rows:before.actors.map(a=>({id:a.id,position:a.position,revision:a.revision}))});
  const bytes=read('public'+cfg.model);assert.equal(sha(bytes),cfg.asset.sha256);const decoder=new GLTFLoader().setDRACOLoader(await cpuDracoLoader()),parsed=await decoder.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length),'');
  let deliver;interiors.gltf.load=(_u,ok)=>{deliver=ok;};const loading=interiors.load('taihe');assert.equal(interiors.getState('taihe'),'loading');await tick();deliver(parsed);assert.equal(await loading,true);
  const after=await sample('S-four-attendants',attendants,[0,11.6375,-4],[0,10.9,2],{feet:true,exportView:true});report.stages.push({stage:'S',state:interiors.getState('taihe'),rows:after.actors.map(a=>({id:a.id,position:a.position,revision:a.revision}))});
  for(const a of after.actors)assert.notEqual(a.revision,before.actors.find(b=>b.id===a.id).revision,'New interior generation, not cached old support');
  interiors.unload('taihe');const restored=await sample('B-restored-four-attendants',attendants,[0,11.6375,-4],[0,10.9,2],{feet:true});report.stages.push({stage:'B-restored',rows:restored.actors.map(a=>({id:a.id,position:a.position,revision:a.revision}))});
  for(const a of restored.actors){assert.notEqual(a.revision,after.actors.find(b=>b.id===a.id).revision);assert.deepEqual(a.position,before.actors.find(b=>b.id===a.id).position);}
  // Low quality keeps exactly twelve fixed Taihe officials, not all registered rows.
  camera.position.set(0,1.7,-137);camera.lookAt(0,1,-80);camera.updateMatrixWorld(true);for(let i=0;i<180;i++)await tick(1,'low');const officials=observer.submitted.filter(a=>a.templateId==='official-ceremonial');assert.equal(officials.length,12);assert.ok(officials.every(a=>a.formation.index<6));report.lowOfficials=officials.map(a=>a.id);
  for(let i=0;i<180;i++)await tick(0);assert.ok(!observer.submitted.some(a=>a.sceneRef==='taihe'));report.nightTaihe=0;
  system.setEnabled(false);await tick();assert.equal(observer.submitted.length,0);assert.equal(system.world.work.jobs.size,0);report.off={instances:0,pending:0};system.setEnabled(true);await sample('attendants-after-off-on',attendants,[0,11.6375,-4],[0,10.9,2],{feet:true});
  report.finalSourceHashes=hashes();assert.deepEqual(report.finalSourceHashes,report.sourceHashes);report.success=true;
 }finally{fs.writeFileSync('reports/r52-population/taihe-fourteen-and-floor.json',JSON.stringify(report,null,2)+'\n');observer.dispose();system.dispose();interiors.dispose();W.dispose();}
});
