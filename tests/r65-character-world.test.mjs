import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gzipSync} from 'node:zlib';
import {registerHooks} from 'node:module';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {buildR52World} from './lib/r52-world.mjs';
import {CHARACTER_REGISTRY as registry} from '../data/characters/index.js';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
import {characterBody,bodyIntersectsPlayer} from '../src/scene/characters/CharacterBody.js';
import {observeCharacterSubmissions,actualTriangleRays,visibleArchitecture} from './lib/r52-character-scene.mjs';
import {visiblePatrolViewpoint} from './lib/r54-patrol-viewpoint.mjs';
import {lifeSoleContacts,assertLifeSoleSupport} from './lib/r53-life-contact.mjs';
import {actualYangxinRoot} from './r53-yangxin/glb-fixture.mjs';
import {yangxinWorldRoute,auditYangxinWorld} from './r53-yangxin/world-audit.mjs';
import {actualKunningRoot,assertKunningStovesInWorld,R55_KUNNING_OBSERVATION_ROUTE} from './lib/r55-kunning-world.mjs';
import {actualHuangjiRoot,auditHuangjiLoadedInWorld} from './lib/r57-huangji-streaming.mjs';
import {replayKunning} from './lib/kunning-walk.mjs';
import {createBoundedQaMocks} from './lib/bounded-qa-clock.mjs';
import {sourceFingerprint} from '../scripts/build-identity.mjs';
import {getBeijingDayCycle} from '../src/scene/sky/BeijingDayCycle.js';
const phase=process.env.R65_WORLD_STAGE;assert.ok(['B','yangxin','kunning','huangji'].includes(phase));
const out=`reports/r65-character-experience/world-${phase}-${process.env.R65_ATTEMPT??'01'}`;fs.mkdirSync(out,{recursive:true});
const report={phase,testSha256:createHash('sha256').update(fs.readFileSync(import.meta.filename)).digest('hex'),sourceFingerprint:sourceFingerprint(process.cwd()),startedAt:new Date().toISOString(),boundary:'CPU actual cumulative world, actual CharacterSystem/instancing/CollisionManager and configured GLB Loader. Four independently initialized stages; not GPU/browser/mobile or a claim that 108 are simultaneously visible. No architecture, actor data, Kit or routes changed.',views:[],paths:[],interactions:[],lifecycle:[],checkpoints:[],pass:false};
function save(label){if(global.gc)global.gc();report.checkpoints.push({label,memory:process.memoryUsage()});fs.writeFileSync(out+'/progress.json.gz',gzipSync(JSON.stringify(report)+'\n'));console.log('R65_WORLD '+label);}
const ids=registry.actors.map(a=>a.id),sha=b=>createHash('sha256').update(b).digest('hex');
test(`R65 full108 independent world ${phase}`,async nodeTestContext=>{
 const mocks=createBoundedQaMocks(nodeTestContext),t=mocks.context;
 const W=await buildR52World({loadAll:false});for(const id of W.zoneManager.zones.keys())if(id!=='ningshou')W.zoneManager.loadZone(id);W.scene.updateMatrixWorld(true);
 const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});let InteriorLoader,INTERIORS;try{({InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js'));({INTERIORS}=await import('../src/scene/interior/registry.js'));}finally{hook.deregister();}
 const interiors=new InteriorLoader(W.scene,W.cm,{registry:{yangxin:INTERIORS.yangxin,kunning:INTERIORS.kunning,huangji:INTERIORS.huangji}}),camera=new THREE.PerspectiveCamera(65,16/9,.1,2000);camera.position.set(0,1.7,-494);camera.lookAt(0,1,-480);let player=null;
 const system=new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,interiors,registry,documentObject:W.dom.document,getPlayerState:()=>player}),observer=observeCharacterSubmissions(system);
 report.cpuUpdateMs=[];report.maxSubmitted={instances:0,triangles:0,batches:0};
 const tick=async(dt=1/60,daylight=0,quality='high')=>{const started=performance.now();camera.updateMatrixWorld(true);system.update(dt,{daylight,quality,viewportHeight:1080});await Promise.resolve();assert.equal(system.lastError,null);assert.ok(system.manager.stats.near<=2);assert.ok(observer.submitted.length<=(quality==='low'?32:64));assert.equal(new Set(observer.submitted.map(a=>a.id)).size,observer.submitted.length);const stats=system.renderer.last;assert.ok(stats.trianglesEstimate<=(quality==='low'?90000:180000));assert.ok(stats.batches<=(quality==='low'?30:60));for(const [key,value]of Object.entries({instances:stats.renderCopies,triangles:stats.trianglesEstimate,batches:stats.batches}))report.maxSubmitted[key]=Math.max(report.maxSubmitted[key],value);report.cpuUpdateMs.push(performance.now()-started);};
 async function settle(wanted=ids){for(let n=0;n<20000;n++){await tick();if(wanted.every(id=>{const s=system.manager.states.get(id);return s.binding?.status==='ready'&&s.readiness===1}))return n+1;}throw Error('Preparation incomplete '+JSON.stringify(system.statusSnapshot()));}
 function validateBindings(label){
  assert.equal(system.manager.stats.loaded,108);assert.equal(system.manager.stats.errors,0);assert.equal(system.renderer.root.parent,W.scene);
  const rows=[];for(const s of system.manager.states.values()){assert.equal(s.binding.status,'ready');assert.equal(s.revision,system.world.getRevision(s.actor));rows.push({id:s.actor.id,revision:s.revision,position:s.binding.position,bindingSha256:sha(JSON.stringify(s.binding))});}
  for(const path of registry.paths){const s=[...system.manager.states.values()].find(s=>s.actor.placement.pathRef===path.id),p=s.binding.path;assert.equal(p.status,'ready');assert.ok(p.samples.length>1);for(let i=0;i<p.samples.length;i++){if(i)assert.ok(p.samples[i].distanceMeters-p.samples[i-1].distanceMeters<=.2500001);assert.equal(system.world._blockedSegment(p.samples[i].position,p.samples[i].position,path.radiusMeters+path.safetyMarginMeters,1.85),null);}report.paths.push({label,id:path.id,samples:p.samples.length,points:p.points,generation:p.validationGeneration});}
  report[label+'Bindings']=rows;assert.equal(report.paths.filter(p=>p.label===label).length,24);
 }
 async function proveView(actor,label){
  const s=system.interaction.samples.get(actor.id);assert.ok(s);let accepted=null;
  const inspect=async({camera:pos,target})=>{
   camera.position.fromArray(pos);camera.lookAt(...target);await tick(0);W.scene.updateMatrixWorld(true);
   if(!observer.submitted.some(a=>a.id===actor.id))return 0;
   const copies=observer.meshes();try{const targetCopy=copies.find(c=>c.actor.id===actor.id),architecture=visibleArchitecture(W.scene),rays=actualTriangleRays(camera,targetCopy,[...architecture,...copies.map(c=>c.mesh)]);
    if(rays.visible){const contact=assertLifeSoleSupport(lifeSoleContacts(targetCopy,architecture),targetCopy.actor.animation?.walkSpeed??targetCopy.mesh.geometry.attributes.characterAnim.getZ(targetCopy.index));accepted={label,id:actor.id,camera:pos,target,position:targetCopy.actor.position,lod:targetCopy.actor.lod,visibility:targetCopy.visibility,raysVisible:rays.visible,raysTotal:rays.total,contact,bodyPresent:W.cm.dynamicBodies.get(system.interaction)?.some(b=>b.id===actor.id)};assert.equal(accepted.visibility,1);assert.equal(accepted.bodyPresent,true);}return rays.visible;
   }finally{for(const c of copies)c.mesh.geometry.dispose();}
  };
  const special=actor.id==='taihe-emperor-01'?{camera:[0,11.6375,0],target:[0,13.1,9.01]}:actor.id.includes('taihe-attendant')?{camera:[0,11.6375,-4],target:[0,10.9,2]}:actor.id==='chuxiu-consort-01'?{camera:[101.5,2.3,435],target:[100.22,1.6,438.16]}:null;
  if(special){assert.equal(W.cm.checkCollision(new THREE.Vector3(...special.camera),.5),false);assert.ok(await inspect(special),actor.id+' special actual view');}
  else {
   const p=s.position,h=s.rotationYRad,attempts=[];
   for(const distance of[1.5,2,3]){for(const angle of[Math.PI/2,-Math.PI/2,Math.PI/4,-Math.PI/4,0,Math.PI]){
    const x=p[0]+Math.sin(h+angle)*distance,z=p[2]+Math.cos(h+angle)*distance,ground=W.cm.getGroundHeight(x,z,p[1],.03),pos=[x,ground+1.7,z],target=[p[0],p[1]+.9,p[2]],collision=W.cm.checkCollision(new THREE.Vector3(...pos),.5);attempts.push({pos,ground,collision});
    // Player controller support and NPC visible surface may legitimately differ
    // by the existing 20/30mm fitted floor finish. Use actual player ground,
    // not an unsupported camera artificially copied from NPC foot elevation.
    if(collision||Math.abs(ground-p[1])>.15)continue;
    if(await inspect({camera:pos,target}))break;
   }if(accepted)break;}
   assert.ok(accepted,actor.id+' supported actual observer '+JSON.stringify(attempts));
  }
  assert.ok(accepted,actor.id+' actual visible triangles');report.views.push(accepted);
 }
 async function views(label){player=null;for(const actor of registry.actors){await proveView(actor,label);if(report.views.length%18===0)save(label+'-views-'+report.views.length);}assert.equal(report.views.filter(v=>v.label===label).length,108);}
 try{
  assert.equal(registry.actors.length,108);assert.equal(registry.paths.length,24);assert.equal(W.zoneManager.loaded.has('ningshou'),false);const coldIds=registry.actors.filter(a=>a.zoneRef!=='ningshou').map(a=>a.id);await settle(coldIds);assert.equal(system.manager.stats.loaded,103);assert.ok(observer.submitted.every(a=>a.zoneRef!=='ningshou'));W.zoneManager.loadZone('ningshou');W.scene.updateMatrixWorld(true);report.preparationFrames=await settle();save('fresh108');
  const staticBefore={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length};report.architecture=staticBefore;validateBindings('initial');
  if(phase==='B'){
   await views('B-night');
   const timeRows=['2026-10-23T17:24:00','2026-10-23T17:25:00','2026-10-23T17:26:00','2026-10-23T20:00:00','2026-10-24T00:00:00','2026-10-24T05:00:00','2026-10-24T07:00:00'];report.times=[];
   camera.position.set(0,1.7,-137);camera.lookAt(0,1,-80);
   for(const time of timeRows){const daylight=getBeijingDayCycle(new Date(time+'+08:00')).lighting.daylight;for(let i=0;i<25;i++)await tick(.1,daylight);assert.ok([...system.manager.states.values()].every(s=>s.activeSchedule&&s.visibility===1));assert.ok(observer.submitted.some(a=>a.templateId==='official-ceremonial'));report.times.push({beijing:time,daylight,eligible:108,actualVisible:observer.submitted.map(a=>a.id)});}
   await tick(0,0,'low');assert.equal(observer.submitted.filter(a=>a.templateId==='official-ceremonial').length,12);assert.ok([...W.cm.dynamicBodies.values()].flat().every(b=>!b.id.includes('official')||observer.submitted.some(a=>a.id===b.id)));await tick(0);
   const moving=[...system.manager.states.values()].filter(s=>s.patrol),duration=Math.max(...moving.map(s=>s.patrol.cycleSeconds))*2,previous=new Map();report.motion={duration,frames:0,maxStep:0,actors:moving.map(s=>s.actor.id)};
   for(let time=0;time<=duration;time+=.1){await tick(.1);for(const s of moving){const p=system.interaction.samples.get(s.actor.id).position,last=previous.get(s.actor.id);if(last){const step=Math.hypot(...p.map((v,i)=>v-last[i]));assert.ok(step<=.075001,s.actor.id+' bounded route step');report.motion.maxStep=Math.max(report.motion.maxStep,step);}previous.set(s.actor.id,[...p]);}report.motion.frames++;}save('24-routes-two-periods');
   for(const path of registry.paths){
    const members=moving.filter(s=>s.actor.placement.pathRef===path.id),lead=members[0],g=system.interaction.groups.get(path.id);let candidate=null;
    for(const offset of[2,4,6,8,10,12]){const p=lead.patrol.sample(g.time+offset,lead.actor.behavior.followerIndex??0).position,eye=new THREE.Vector3(p[0],p[1]+1.7,p[2]);if(!W.cm.checkCollision(eye,.5)&&Math.abs(W.cm.getGroundHeight(p[0],p[2],p[1],.03)-p[1])<.001){candidate=p;break;}}
    assert.ok(candidate,path.id+' legal standing pedestrian on route');player={position:[...candidate],radius:.5,height:1.7};let blocked=false,retreated=false,maxStep=0;const previous=new Map(members.map(s=>[s.actor.id,system.interaction.samples.get(s.actor.id).position]));
    camera.position.set(candidate[0]+2,candidate[1]+1.7,candidate[2]+2);camera.lookAt(candidate[0],candidate[1]+1,candidate[2]);
    for(let frame=0;frame<220;frame++){await tick(.1);blocked||=g.blockedSeconds>0;retreated||=g.retreat;for(const s of members){const sample=system.interaction.samples.get(s.actor.id);assert.ok(sample);assert.equal(bodyIntersectsPlayer(characterBody(s.actor,sample),player),false,s.actor.id+' cannot cross player');const last=previous.get(s.actor.id),step=Math.hypot(...sample.position.map((v,i)=>v-last[i]));assert.ok(step<=.075001);maxStep=Math.max(maxStep,step);previous.set(s.actor.id,[...sample.position]);}}
    assert.ok(blocked,path.id+' actual route reaches obstacle');const before=g.time;player=null;for(let i=0;i<10;i++)await tick(.1);assert.ok(g.time>before,path.id+' resumes after player leaves');report.interactions.push({path:path.id,player:candidate,members:members.map(s=>s.actor.id),blocked,retreated,maxStep});
   }save('24-real-route-player-blocks');
   for(const zone of['east-six','west-six','axis-courts','ningshou','garden']){const affected=registry.actors.filter(a=>a.zoneRef===zone).map(a=>a.id),old=system.world.getGeneration(zone);W.zoneManager.unloadZone(zone);await tick();assert.ok(affected.every(id=>!system.manager.states.get(id).binding));assert.ok([...W.cm.dynamicBodies.values()].flat().every(b=>!affected.includes(b.id)));W.zoneManager.loadZone(zone);W.scene.updateMatrixWorld(true);await settle();assert.notEqual(system.world.getGeneration(zone),old);report.lifecycle.push({zone,affected:affected.length,freshReady:108});}
   W.dom.document.hidden=true;system._visibility();assert.equal(W.cm.dynamicBodies.size,0);W.dom.document.hidden=false;system._visibility();await tick();await settle();assert.ok(W.cm.dynamicBodies.size>0);
  }else{
   const before=new Map(registry.actors.map(a=>[a.id,system.world.getRevision(a)]));
   const audit=async layer=>phase==='yangxin'?auditYangxinWorld({...W,rooms:W.zoneManager.allRooms},{layer}):phase==='kunning'?await assertKunningStovesInWorld(W,{interiors,layer}):await auditHuangjiLoadedInWorld(W,{interiors,layer});
   report.beforeAudit=await audit('B');if(phase==='yangxin')assert.equal(report.beforeAudit.ok,true);
   interiors.gltf.load=(url,ok,_p,error)=>{assert.equal(url,`${interiors.base}${interiors.halls.get(phase).cfg.model}`);({yangxin:actualYangxinRoot,kunning:actualKunningRoot,huangji:actualHuangjiRoot}[phase])().then(root=>ok({scene:root}),error);};
   assert.equal(await interiors.load(phase),true);interiors.update({yangxin:{x:108.6,z:277.5},kunning:{x:-5,z:386.1},huangji:{x:-293.2,z:287.7}}[phase],performance.now()+500);W.scene.updateMatrixWorld(true);report.loadedAudit=await audit('S');if(phase==='yangxin')assert.equal(report.loadedAudit.ok,true);await settle();validateBindings('S');
   for(const s of system.manager.states.values())assert.notEqual(s.revision,before.get(s.actor.id));await views('S-night');
   report.loadedPedestrianProbes=[];
   for(const actor of registry.actors){const sample=system.interaction.samples.get(actor.id),body=characterBody(actor,sample),p=body.parts[0],feet=sample.position[1],eye=new THREE.Vector3((p.ax+p.bx)/2,feet+1.7,(p.az+p.bz)/2);assert.equal(W.cm.checkDynamicCollision(eye,.5),true,actor.id+' remains physically present after S');report.loadedPedestrianProbes.push(actor.id);}
   // Actual existing S-room routes with the now-live NPC body channel retained.
   // No new people are invented inside modern exhibition rooms.
   const route=phase==='yangxin'?yangxinWorldRoute():phase==='kunning'?R55_KUNNING_OBSERVATION_ROUTE:null;
   report.sRoomRoutes=[];
   if(route)for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){const ground=W.cm.getGroundHeight(route[0][0],route[0][1],0,.6),r=replayKunning(t,W,route,{fps,sprint,backward,startFeet:ground,recordFrames:false});assert.ok(r.arrived,JSON.stringify(r));report.sRoomRoutes.push({fps,sprint,backward,...r});mocks.release('s-room-route');}

   interiors.unload(phase);W.scene.updateMatrixWorld(true);report.returnAudit=await audit('B');await settle();validateBindings('returnedB');for(const s of system.manager.states.values())assert.notEqual(s.revision,report.SBindings.find(b=>b.id===s.actor.id).revision);
   assert.deepEqual({colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},staticBefore);assert.equal(interiors.halls.get(phase).group,null);assert.equal(interiors.halls.get(phase).state,'idle');await views('returnedB-night');
  }
  assert.deepEqual({colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},staticBefore);
  system.setEnabled(false);assert.equal(W.cm.dynamicBodies.size,0);assert.equal(observer.submitted.length,0);assert.equal(system.world.work.jobs.size,0);system.setEnabled(true);await settle();assert.equal(system.manager.stats.loaded,108);assert.ok(W.cm.dynamicBodies.size>0);system.setEnabled(false);assert.equal(W.cm.dynamicBodies.size,0);assert.equal(sourceFingerprint(process.cwd()),report.sourceFingerprint);const sorted=[...report.cpuUpdateMs].sort((a,b)=>a-b);report.cpuFunctionalTiming={samples:sorted.length,totalMs:sorted.reduce((n,v)=>n+v,0),p95Ms:sorted[Math.floor((sorted.length-1)*.95)],maxMs:sorted.at(-1),boundary:'Actual CPU system tick includes queue and submission, no WebGL frame, shared QA host not isolated device benchmark'};report.pass=true;save('pass');
 }finally{observer.dispose();system.dispose();interiors.dispose();W.dispose();report.endedAt=new Date().toISOString();fs.writeFileSync(out+'/result.json.gz',gzipSync(JSON.stringify(report)+'\n'));}
});
