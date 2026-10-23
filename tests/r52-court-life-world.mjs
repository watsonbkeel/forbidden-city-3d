// Actual production scene and 38 + 10 registry actors. CPU geometry evidence only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import * as T from 'three';
import {buildR52World} from './lib/r52-court-world.mjs';
import {productionInstances,triangleRays} from './lib/r52-court-triangle-rays.mjs';
import {exportProductionView} from './lib/r51-production-raster.mjs';
import {CHARACTER_REGISTRY as base} from '../data/characters/index.js';
import {withCourtLifeFragment,original38} from './lib/r52-court-registry.mjs';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
import {CharacterWorldAdapter} from '../src/scene/characters/CharacterWorldAdapter.js';
import {createCharacterGeometry} from '../src/scene/characters/CharacterKit.js';
import {deformCharacterVertex} from '../src/scene/characters/CharacterAnimation.js';
import {characterEnvironmentMotion} from '../src/scene/characters/CharacterBehavior.js';
import {characterGeometryOptionsFor} from '../src/scene/characters/CharacterGeometryOptions.js';
const fragment=JSON.parse(fs.readFileSync(new URL('../data/characters/fragments/r52-court-life.json',import.meta.url))),registry=withCourtLifeFragment(base,fragment);
const dir='reports/r52-court-life';fs.mkdirSync(dir,{recursive:true});
const sourceFiles=['data/characters/actors.json','data/characters/anchors.json','data/characters/surfaces.json','data/characters/paths.json','data/characters/templates.json','data/zones/west-six.json','data/zones/east-six.json','src/scene/characters/CharacterSystem.js','src/scene/characters/CharacterManager.js','src/scene/characters/CharacterKit.js','src/scene/characters/CharacterRenderer.js','src/scene/characters/CharacterAnimation.js','src/scene/characters/CharacterWorldAdapter.js'];
const hashes=()=>Object.fromEntries(sourceFiles.map(p=>[p,createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
const report={baseline:'aa606946fe37c045791fd511cb224007713c5e7c',date:new Date().toISOString(),boundary:'CPU exact deformed instance triangles and real production geometry/collisions. No browser, GPU, textures, shadows, historical approval, or performance acceptance.',scene:'All PALACE_LAYOUT, real Enclosure and GardenBuilder, all zones registered/prebuilt with dynamic actual ZoneManager attachments, and actual Environment.setupGround; optional streamed interior overlays and sky omitted.',sourceHashes:hashes(),fragmentHash:createHash('sha256').update(fs.readFileSync('data/characters/fragments/r52-court-life.json')).digest('hex'),registryCount:registry.actors.length,original38Unchanged:JSON.stringify(original38(registry))===JSON.stringify(original38(base)),bodyEnvelopes:[],physical:[],samples:[],movement:[],lifecycle:[],failedRequiredIds:[]};
const world=await buildR52World({loadAll:false,initialPosition:{x:150.2,z:363}}),{scene,cm,zoneManager:zones,dom}=world;
const camera=new T.PerspectiveCamera(60,1280/720,.1,2000);camera.position.set(150.2,1.7,363);
const system=new CharacterSystem({scene,camera,collisionManager:cm,zoneManager:zones,registry,documentObject:dom.document});
const audit=new CharacterWorldAdapter({scene,collisionManager:cm,zoneManager:zones,registry});
let submitted=[],daylight=1;const render=system.renderer.render.bind(system.renderer);system.renderer.render=(actors,...args)=>{submitted=actors.map(a=>({...a,position:[...a.position]}));return render(actors,...args);};
const state=id=>{const s=system.manager.states.get(id);return{id,position:s.binding?.position,pending:s.pending,error:s.error,readiness:s.readiness,lod:s.lod,activeSchedule:s.activeSchedule,visibility:s.visibility};};
async function tick(dt=1/60){camera.updateMatrixWorld(true);zones.update(camera.position);system.update(dt,{daylight,quality:'high',viewportHeight:720});await Promise.resolve();assert.equal(system.lastError,null);}
async function frames(n,dt=1/60){for(let i=0;i<n;i++)await tick(dt);}
async function ready(ids){for(let i=0;i<9000;i++){await tick();if(ids.every(id=>submitted.some(a=>a.id===id&&a.visibility===1)))return i+1;}throw Error('Actual instance not ready: '+JSON.stringify({states:ids.map(state),queue:system.world.work.snapshot()}));}
function bodyEnvelope(actor){
 let radius=0,height=0,minY=Infinity;const options=characterGeometryOptionsFor(actor);
 for(let lod=0;lod<3;lod++){
  const g=createCharacterGeometry(actor.templateId,'standing',lod,options),a=g.attributes;
  for(let phase=0;phase<24;phase++){
   const animation=characterEnvironmentMotion(actor,phase*.137,actor.behavior.speedMetersPerSecond??0);
   for(let i=0;i<a.position.count;i++){
    const v=deformCharacterVertex([a.position.getX(i),a.position.getY(i),a.position.getZ(i)],[a.normal.getX(i),a.normal.getY(i),a.normal.getZ(i)],{part:a.characterPart.getX(i),pivot:[a.characterPivot.getX(i),a.characterPivot.getY(i),a.characterPivot.getZ(i)],weight:a.characterWeight.getX(i),torsoWeight:a.characterTorsoWeight.getX(i)},animation).position;
    radius=Math.max(radius,Math.hypot(v[0],v[2]));height=Math.max(height,v[1]);minY=Math.min(minY,v[1]);
   }
  }g.dispose();
 }
 // Additional 15 cm margin exceeds sampled breathing/cloth motion; measured
 // all three real LODs, walking/standing variant, hat, hands, robe and shoes.
 return{id:actor.id,maxDeformedRadiusMeters:radius,maxDeformedHeightMeters:height,minDeformedY:minY,clearanceRadiusMeters:Math.max(.8,radius+.15),clearanceHeightMeters:height+.1,phaseSamples:24,lods:[0,1,2]};
}
function footprint(surfaceRef,p,r,h){
 const support=audit._surfaceAt(surfaceRef,p,r);assert.equal(support.status,'ready',JSON.stringify(support));assert.equal(support.kind,'rendered-geometry');
 assert.equal(audit._blockedSegment(p,p,r,h),null,'Full-body collider clearance '+JSON.stringify(p));
 const hits=[];
 for(let i=0;i<16;i++){const a=i*Math.PI/8,q=[p[0]+Math.cos(a)*r,p[1],p[2]+Math.sin(a)*r],hit=audit.supportAt(q,p[1],.03,{renderedOnly:true});assert.equal(hit.status,'ready',JSON.stringify(hit));hits.push({position:hit.position,meshName:hit.meshName,materialName:hit.materialName});}
 return{position:p,support:{kind:support.kind,meshName:support.meshName,materialName:support.materialName},radialEdgeHits:hits.length,clearanceRadiusMeters:r,clearanceHeightMeters:h};
}
async function enter(context){
 const a=audit.resolveAnchor(context.sceneRef+'-r52-hall');assert.equal(a.status,'ready');zones.ensureLoadedAt(a.position[0],a.position[2]);
 const cp=context.cameraLocalMeters;camera.position.set(a.position[0]+cp[0],cp[1],a.position[2]+cp[2]);zones.update(camera.position);scene.updateMatrixWorld(true);
 const actors=fragment.actors.filter(x=>x.sceneRef===context.sceneRef),points=actors.flatMap(x=>x.placement.offsetMeters?[x.placement.offsetMeters]:fragment.paths.find(p=>p.id===x.placement.pathRef).pointsLocalMeters);const target=[0,1,2].map(i=>(Math.min(...points.map(p=>p[i]))+Math.max(...points.map(p=>p[i])))/2);
 camera.lookAt(a.position[0]+target[0],1,a.position[2]+target[2]);camera.updateMatrixWorld(true);
 return{anchor:a,actors};
}
async function sample(label,actors,{exportGeometry=false}={}){
 const ids=actors.map(a=>a.id),readyFrames=await ready(ids);scene.updateMatrixWorld(true);
 assert.equal(cm.checkCollision(camera.position,.5),false,'Legal camera collision '+label);
 const cameraGround=audit.supportAt([camera.position.x,0,camera.position.z],0,.03,{renderedOnly:true});assert.equal(cameraGround.status,'ready','Legal camera rendered floor '+label);
 const active=productionInstances(system,submitted),architecture=[];scene.traverse(m=>{if(!m.isMesh||m.userData.characterBatch)return;for(let p=m;p;p=p.parent)if(!p.visible)return;architecture.push(m);});
 const objects=[...architecture,...active.map(a=>a.mesh)],row={label,camera:camera.position.toArray(),cameraGround:{kind:cameraGround.kind,meshName:cameraGround.meshName},readyFrames,loadedZones:zones.getLoadedIds(),actors:[]};
 for(const id of ids){const copies=active.filter(a=>a.actor.id===id);assert.equal(copies.length,1,'One actual production instance '+id);const a=copies[0],rays=triangleRays(a,objects,camera);row.actors.push({id,position:a.actor.position,lod:a.actor.lod,visibility:a.visibility,batch:a.batch,instanceIndex:a.index,rays});console.log('RAYS',label,id,JSON.stringify({position:a.actor.position,visible:rays.visible,hits:rays.hits.filter(h=>!h.visible||!h.inViewport)}));}
 for(const a of active)a.mesh.geometry.dispose();
 if(exportGeometry){const out='/tmp/r52-court-life-'+label+'.json.gz';row.geometryExport=exportProductionView({scene,camera,characters:system},out,{far:45});}
 report.samples.push(row);for(const a of row.actors){assert.equal(a.visibility,1);assert.ok(a.rays.visible>=8,label+' '+a.id+' requires broadly visible actual triangles, got '+a.rays.visible);}console.log('SAMPLE',label,JSON.stringify(row.actors.map(a=>({id:a.id,position:a.position,lod:a.lod,visibleRays:a.rays.visible}))));return row;
}
try{
 assert.ok(report.registryCount>=48);assert.ok(report.original38Unchanged);assert.deepEqual(system.validation.errors,[]);
 for(const c of fragment.contexts){
  const {actors}=await enter(c);
  for(const actor of actors){const envelope=bodyEnvelope(actor);report.bodyEnvelopes.push(envelope);const binding=audit.resolve(actor);assert.equal(binding.status,'ready',actor.id+' '+JSON.stringify(binding));
   const r=envelope.clearanceRadiusMeters,h=envelope.clearanceHeightMeters;
   if(actor.placement.mode==='path'){
    const path=audit.validatePath(actor.placement.pathRef,{bodyRadiusMeters:r,bodyHeightMeters:h});assert.equal(path.status,'ready',JSON.stringify(path));
    const samples=path.samples.map(s=>footprint(actor.placement.surfaceRef,s.position,r,h));
    for(let i=1;i<samples.length;i++)assert.ok(new T.Vector3(...samples[i].position).distanceTo(new T.Vector3(...samples[i-1].position))<=.2500001);
    for(const p of [path.points[0],path.points.at(-1)])footprint(actor.placement.surfaceRef,p,Math.max(.85,r),h);
    report.physical.push({id:actor.id,status:'ready',mode:'path',pathRef:path.id,lengthMeters:path.lengthMeters,sampleSpacingMaxMeters:.25,turningRadiusMeters:Math.max(.85,r),samples});
   }else report.physical.push({id:actor.id,status:'ready',mode:'surface',...footprint(actor.placement.surfaceRef,binding.position,r,h)});
  }
  const before=await sample(c.sceneRef+'-day',actors,{exportGeometry:true});
  for(const actor of actors.filter(a=>a.placement.mode==='path')){
   const patrol=system.manager.states.get(actor.id).patrol;assert.ok(patrol);const start=system.manager.simulationSeconds,cycle=patrol.cycleSeconds,positions=[],stages=new Set(),renderedStages=new Set();let actualSubmittedFrames=0;
   for(let i=0;i<Math.ceil((cycle*2+1)/.1);i++){await tick(.1);const s=patrol.sample(system.manager.simulationSeconds);stages.add(s.stage);positions.push(s.position);const actual=submitted.find(a=>a.id===actor.id);if(actual){actualSubmittedFrames++;renderedStages.add(s.stage);assert.ok(new T.Vector3(...actual.position).distanceTo(new T.Vector3(...s.position))<1e-7);}}
   const span=Math.max(...positions.map(p=>p[0]))-Math.min(...positions.map(p=>p[0]))+Math.max(...positions.map(p=>p[2]))-Math.min(...positions.map(p=>p[2]));assert.ok(span>2);for(const s of ['outbound','far-turn','return','near-turn']){assert.ok(stages.has(s));assert.ok(renderedStages.has(s),'Actual renderer must submit movement stage '+s);}
   report.movement.push({id:actor.id,fromSeconds:start,toSeconds:system.manager.simulationSeconds,cycleSeconds:cycle,fullCycles:2,sampledFrames:positions.length,actualSubmittedFrames,spatialSpanMeters:span,stages:[...stages],actualSubmittedStages:[...renderedStages]});
  }
  if(actors.some(a=>a.placement.mode==='path'))await sample(c.sceneRef+'-after-movement',actors);
  daylight=0;await frames(130);assert.ok(!submitted.some(a=>actors.some(b=>a.id===b.id)));report.lifecycle.push({kind:'night-fade',context:c.sceneRef,states:actors.map(a=>state(a.id))});
  daylight=1;await sample(c.sceneRef+'-day-return',actors);
  system.setEnabled(false);await frames(2);assert.equal(system.renderer.batches.size,0);system.setEnabled(true);await sample(c.sceneRef+'-off-on',actors);report.lifecycle.push({kind:'off-on',context:c.sceneRef,clearBatches:0});
  camera.position.set(...(c.zoneRef==='east-six'?[150.2,1.7,363]:[0,1.7,-494]));camera.lookAt(camera.position.x,1,camera.position.z+10);await frames(30);assert.equal(zones.loaded.has(c.zoneRef),false);assert.ok(!submitted.some(a=>a.zoneRef===c.zoneRef));report.lifecycle.push({kind:'zone-unloaded',context:c.sceneRef,zoneRef:c.zoneRef,loadedZones:zones.getLoadedIds(),states:actors.map(a=>state(a.id))});
  await enter(c);await sample(c.sceneRef+'-zone-reentry',actors);
 }
 report.finalSourceHashes=hashes();assert.deepEqual(report.finalSourceHashes,report.sourceHashes);report.success=true;
}catch(e){report.success=false;report.error=String(e);report.failedRequiredIds=fragment.actors.filter(a=>!report.samples.some(s=>s.actors.some(x=>x.id===a.id&&x.rays.visible>=8))).map(a=>a.id);console.error(e);process.exitCode=1;
}finally{
 const raw=JSON.stringify(report,null,2)+'\n';const path=dir+'/r52-court-life-world.json';if(Buffer.byteLength(raw)>120000){fs.writeFileSync(path+'.gz',gzipSync(raw));fs.writeFileSync(dir+'/r52-court-life-world-manifest.json',JSON.stringify({file:path+'.gz',uncompressedBytes:Buffer.byteLength(raw),uncompressedSHA256:createHash('sha256').update(raw).digest('hex'),success:report.success,failedRequiredIds:report.failedRequiredIds},null,2)+'\n');}else fs.writeFileSync(path,raw);
 audit.dispose();system.dispose();world.dispose();console.log('RESULT',JSON.stringify({success:report.success,actors:report.physical.length,samples:report.samples.length,error:report.error,failedRequiredIds:report.failedRequiredIds}));
}
