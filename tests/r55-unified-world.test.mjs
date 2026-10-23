import {visiblePatrolViewpoint,isGuardPatrolActor} from './lib/r54-patrol-viewpoint.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {registerHooks} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {buildR52World} from './lib/r52-world.mjs';
import {CHARACTER_REGISTRY as registry} from '../data/characters/index.js';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
import {observeCharacterSubmissions,actualTriangleRays,visibleArchitecture,actualSoleContact} from './lib/r52-character-scene.mjs';
import {patrolViewpoint} from './lib/r53-patrol-viewpoint.mjs';
import {lifeCandidateViews,R53_LIFE_IDS} from './lib/r53-life-candidates.mjs';
import {lifeSoleContacts,assertLifeSoleSupport} from './lib/r53-life-contact.mjs';
import {proveR55Staff,R55_STAFF_IDS} from './lib/r55-staff-proof.mjs';
import {assertZhongheDisplayInWorld,replayZhongheDisplayRoute} from './lib/r55-zhonghe-world-check.mjs';
import {assertJiaotaiDisplayInWorld} from './lib/r54-jiaotai-world-check.mjs';
import {assertChangchunEastInWorld} from './lib/r54-changchun-world-check.mjs';
import {sourceFingerprint} from '../scripts/build-identity.mjs';
import {courtLifeScenarios} from './lib/r52-court-life-scenarios.mjs';
import {verifySouthernMapArrivals} from './helpers/r52-southern-route-validation.mjs';
import {exportProductionView} from './lib/r51-production-raster.mjs';
import {assertShoukangEastInWorld,SHOUKANG_WORLD_ROUTE,SHOUKANG_PREFERRED_LANDING} from './lib/r53-shoukang-world-check.mjs';
import {auditYangxinWorld} from './r53-yangxin/world-audit.mjs';
import {actualYangxinRoot} from './r53-yangxin/glb-fixture.mjs';
import {actualKunningRoot,assertKunningStovesInWorld,R55_KUNNING_OBSERVATION_ROUTE} from './lib/r55-kunning-world.mjs';
import {replayKunning} from './lib/kunning-walk.mjs';
import {traceTerraceGround} from './lib/terrace-walk.mjs';
const priorStaffIds=registry.scope.releaseCoverage.R54.additionalRequiredActorIds;
const out='reports/r55-unified',sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();fs.mkdirSync(out,{recursive:true});
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifest=JSON.parse(fs.readFileSync('data/characters/world-source-freeze.json')),hashes=()=>Object.fromEntries(manifest.files.map(f=>[f.path,hash(f.path)]));
const lifeFragment=JSON.parse(fs.readFileSync('data/characters/fragments/r53-household-life.json'));
const report={sourceCommit,createdAt:new Date().toISOString(),boundary:'One actual integrated R55 static/all-zone world. All93 fresh B, Yangxin-S and Kunning-S individual instances, shader-equivalent CPU triangle visibility/contact, paths and lifecycle. No reuse of previous-world ready flags or original failed logs. No browser/WebGL, textures/shadows, GPU frame performance or physical-phone claim. 93 identities are checked separately, never simultaneously visible',sourceFingerprint:sourceFingerprint(process.cwd()),sourceHashes:hashes(),views:[],bindings:[],paths:[],lifecycle:[],flight:[],consumers:[],success:false};
test('unified R55: all93 actual bindings/submitted visible roles, seventeen paths, courtyard staffing and the Zhonghe/Kunning changes in one world',async t=>{
 const W=await buildR52World(),camera=new THREE.PerspectiveCamera(65,16/9,.1,2000);camera.position.set(0,1.7,-494);camera.lookAt(0,1,-480);camera.updateMatrixWorld(true);
 const ih=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});let InteriorLoader,INTERIORS;try{({InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js'));({INTERIORS}=await import('../src/scene/interior/registry.js'));}finally{ih.deregister();}
 const interiors=new InteriorLoader(W.scene,W.cm,{registry:{yangxin:INTERIORS.yangxin,kunning:INTERIORS.kunning}});
 const system=new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,interiors,registry,documentObject:W.dom.document}),observer=observeCharacterSubmissions(system);let teleport;
 report.submissionBudget={boundary:'CPU actual instance/index counts only, not GPU draw timing',high:{frames:0,maxInstances:0,maxTriangles:0,maxBatches:0,maxNear:0},low:{frames:0,maxInstances:0,maxTriangles:0,maxBatches:0,maxNear:0}};
 const observedRender=system.renderer.render;system.renderer.render=function(actors,options){const result=observedRender.call(this,actors,options),q=options.quality==='low'?'low':'high',limits=q==='low'?{instances:32,triangles:90000,batches:30,near:0}:{instances:64,triangles:180000,batches:60,near:2},row=report.submissionBudget[q];let triangles=0,instances=0;for(const batch of this.batches.values()){triangles+=(batch.mesh.geometry.index?.count??batch.mesh.geometry.attributes.position.count)/3*batch.mesh.count;instances+=batch.mesh.count;assert.equal(batch.mesh.parent,this.root);}const near=actors.filter(a=>a.lod===0).length;assert.equal(triangles,result.trianglesEstimate);assert.equal(instances,actors.length);assert.ok(instances<=limits.instances&&triangles<=limits.triangles&&this.batches.size<=limits.batches&&near<=limits.near,'Actual submission budget '+JSON.stringify({q,instances,triangles,batches:this.batches.size,near}));row.frames++;row.maxInstances=Math.max(row.maxInstances,instances);row.maxTriangles=Math.max(row.maxTriangles,triangles);row.maxBatches=Math.max(row.maxBatches,this.batches.size);row.maxNear=Math.max(row.maxNear,near);return result;};
 const tick=async({dt=1/60,quality='high',daylight=1}={})=>{system.update(dt,{daylight,quality,viewportHeight:1080});await Promise.resolve();assert.equal(system.lastError,null);assert.ok(system.manager.stats.near<=2);assert.ok(observer.submitted.length<=(quality==='low'?32:64));assert.equal(new Set(observer.submitted.map(a=>a.id)).size,observer.submitted.length);};
 async function settle(ids,{render=false,...options}={}){for(let frame=0;frame<20000;frame++){await tick(options);if(ids.every(id=>{const s=system.manager.states.get(id);return s.binding?.status==='ready'&&s.readiness===1&&(!render||observer.submitted.some(a=>a.id===id&&a.visibility===1));}))return frame+1;}throw Error('Bounded preparation failed '+JSON.stringify({ids,status:system.statusSnapshot(),states:ids.map(id=>{const s=system.manager.states.get(id);return{id,position:s.binding?.position,error:s.error,pending:s.pending,lod:s.lod,readiness:s.readiness};})}));}
 async function view(label,ids,pos,target,{feet=false,exportView=false,daylight=1,quality='high'}={}){
  camera.position.fromArray(pos);camera.lookAt(...target);camera.updateMatrixWorld(true);const frames=await settle(ids,{render:true,daylight,quality});W.scene.updateMatrixWorld(true);
  const copies=observer.meshes(),architecture=visibleArchitecture(W.scene),objects=[...architecture,...copies.map(c=>c.mesh)];const row={label,camera:pos,target,frames,daylight,quality,simulationSeconds:system.manager.simulationSeconds,cameraCollision:W.cm.checkCollision(camera.position,.5),renderCopies:observer.submitted.length,near:system.manager.stats.near,actors:[]};
  // Collect every bad camera/ray in one diagnostic run, then fail the suite.
  row.pass=!row.cameraCollision;
  for(const id of ids){const m=copies.filter(c=>c.actor.id===id);assert.equal(m.length,1,id);const a=m[0],rays=actualTriangleRays(camera,a,objects),state=system.manager.states.get(id);const proof={id,lod:a.actor.lod,position:a.actor.position,visibility:a.visibility,revision:system.world.getRevision(state.actor),rays};assert.equal(a.visibility,1);if(rays.visible===0)row.pass=false;if(['standing','seated'].includes(a.actor.pose)){proof.soles=lifeSoleContacts(a,architecture);const speed=system.renderer.batches.get(a.batch).mesh.geometry.attributes.characterAnim.getZ(a.index);try{proof.contact=assertLifeSoleSupport(proof.soles,speed);}catch(error){proof.contactFailure=String(error);row.pass=false;}}row.actors.push(proof);}
  if(exportView){fs.mkdirSync('/tmp/r55-unified-geometry',{recursive:true});row.geometry=exportProductionView({scene:W.scene,camera,characters:system},`/tmp/r55-unified-geometry/${label}.json.gz`,{far:70});}
  for(const c of copies)c.mesh.geometry.dispose();report.views.push(row);console.log('ROLE_VIEW '+JSON.stringify({label,ids,rays:row.actors.map(a=>a.rays.visible),copies:row.renderCopies,pass:row.pass}));return row;
 }
 async function verifyRoleViews(prefix){
  const renderView=(label,...args)=>view(prefix+label,...args);
  for(const actor of registry.actors.filter(a=>a.sceneRef==='taihe'&&!a.id.includes('attendant')&&a.behavior.basePose!=='seated')){const p=system.manager.states.get(actor.id).binding.position;await renderView(actor.id,[actor.id],[p[0],1.7,p[2]-4],[p[0],1,p[2]],{exportView:false});}
  const attendants=registry.actors.filter(a=>a.id.includes('taihe-attendant')).map(a=>a.id);await renderView('taihe-four-attendants',attendants,[0,11.6375,-4],[0,10.9,2],{feet:true,exportView:false});
  await renderView('taihe-emperor-in-hall',['taihe-emperor-01'],[0,11.6375,0],[0,13.1,9.01],{exportView:false});
  const special=new Map([['chuxiu-consort-01',[[101.5,2.3,435],[100.22,1.6,438.16]]]]);
  const life=courtLifeScenarios({registry,adapter:system.world}),newLifeIds=new Set([...life.flatMap(s=>s.actorIds),...R53_LIFE_IDS]);
  for(const actor of registry.actors.filter(a=>a.sceneRef!=='taihe'&&!newLifeIds.has(a.id))){const state=system.manager.states.get(actor.id),s=state.patrol?.sample(system.manager.simulationSeconds,actor.behavior.followerIndex??0)??state.binding,p=s.position,h=s.rotationYRad;let [pos,target]=special.get(actor.id)??[[p[0]+Math.sin(h)*3+(state.patrol?2:0),p[1]+1.7,p[2]+Math.cos(h)*3],[p[0],p[1]+.9,p[2]]];if(state.patrol&&isGuardPatrolActor(actor)){const legal=await visiblePatrolViewpoint(W,s,async candidate=>{camera.position.fromArray(candidate.camera);camera.lookAt(...candidate.target);camera.updateMatrixWorld(true);await settle([actor.id],{render:true});const copies=observer.meshes();try{const targetCopy=copies.find(c=>c.actor.id===actor.id);return actualTriangleRays(camera,targetCopy,[...visibleArchitecture(W.scene),...copies.map(c=>c.mesh)]).visible;}finally{for(const c of copies)c.mesh.geometry.dispose();}});pos=legal.camera;target=legal.target;(report.patrolObserverCandidates??=[]).push({phase:prefix,id:actor.id,...legal});}else if(state.patrol||R55_STAFF_IDS.includes(actor.id)||priorStaffIds.includes(actor.id)){const legal=patrolViewpoint(W,s);pos=legal.camera;target=legal.target;}await renderView(actor.id,[actor.id],pos,target,{exportView:false});}
  for(const scenario of life)await renderView(scenario.sceneRef,scenario.actorIds,scenario.camera,scenario.lookAt,{exportView:false});
  for(const v of lifeCandidateViews(lifeFragment,system.world)) await renderView(v.label,v.actorIds,v.camera,v.target);
 }
 try{
  assert.equal(registry.actors.length,93);assert.equal(system.validation.valid,true);assert.equal(system.enabled,true);assert.equal(system.snapshot().contentApproved,false);
  report.initialPreparationFrames=await settle(registry.actors.map(a=>a.id));assert.equal(system.manager.stats.loaded,93);assert.equal(system.manager.stats.errors,0);assert.equal(system.renderer.root.parent,W.scene);
  report.world={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length,zones:[...W.zoneManager.loaded.keys()]};
  for(const {actor,binding,revision}of system.manager.states.values()){assert.equal(binding.status,'ready',actor.id);report.bindings.push({id:actor.id,pose:actor.behavior.basePose,templateId:actor.templateId,sceneRef:actor.sceneRef,zoneRef:actor.zoneRef,revision,fullBindingSha256:createHash('sha256').update(JSON.stringify(binding)).digest('hex'),binding:{status:binding.status,zoneRef:binding.zoneRef,position:binding.position,rotationYRad:binding.rotationYRad,support:binding.support,path:binding.path?{id:binding.path.id,points:binding.path.points,lengthMeters:binding.path.lengthMeters,sampleCount:binding.path.samples.length,validationGeneration:binding.path.validationGeneration}:undefined},evidenceBoundary:'Unique full route sample positions are recorded once in report.paths, not duplicated per formation follower.'});}
  {
  for(const path of registry.paths){const actor=registry.actors.find(a=>a.placement.pathRef===path.id),binding=system.manager.states.get(actor.id).binding,p=binding.path;assert.ok(p.samples.length>1);for(let i=0;i<p.samples.length;i++){const s=p.samples[i];if(i)assert.ok(s.distanceMeters-p.samples[i-1].distanceMeters<=.2500001);assert.equal(system.world._blockedSegment(s.position,s.position,path.radiusMeters+path.safetyMarginMeters,1.85),null);}report.paths.push({id:path.id,samples:p.samples.length,lengthMeters:p.lengthMeters,bodyRadiusPlusMargin:path.radiusMeters+path.safetyMarginMeters,samplePositions:p.samples.map(s=>s.position),generation:system.world.getGeneration(actor.zoneRef)});}
  // Every shipped ID must appear in a real instance with unobstructed in-frustum
  // deformed triangles from a legal viewpoint. Generic nonzero counts cannot pass.
  await verifyRoleViews('B/');
  const proven=new Set(report.views.flatMap(v=>v.actors.map(a=>a.id)));assert.equal(proven.size,93);assert.deepEqual([...proven].sort(),registry.actors.map(a=>a.id).sort());report.individuallyVisibleIds=[...proven].sort();
  // Observe real production patrol time over two complete periods without
  // rewriting positions. All movement and turn states come from System update.
  const patrolStates=[...system.manager.states.values()].filter(s=>s.patrol),duration=Math.max(...patrolStates.map(s=>s.patrol.cycleSeconds))*2,seen=new Map(patrolStates.map(s=>[s.actor.id,{previous:null,samples:0,maxStep:0}]));
  for(let seconds=0;seconds<=duration+.05;seconds+=.1){await tick({dt:.1});for(const state of patrolStates){const sample=state.patrol.sample(system.manager.simulationSeconds,state.actor.behavior.followerIndex??0),path=registry.paths.find(p=>p.id===state.actor.placement.pathRef),r=seen.get(state.actor.id);assert.equal(system.world._blockedSegment(sample.position,sample.position,path.radiusMeters+path.safetyMarginMeters,1.85),null);if(r.previous){const step=Math.hypot(...sample.position.map((v,i)=>v-r.previous[i]));r.maxStep=Math.max(r.maxStep,step);assert.ok(step<=.2,'No teleport during path turn '+state.actor.id);}r.previous=sample.position;r.samples++;}}
  report.motion={durationSeconds:duration,actors:[...seen].map(([id,s])=>({id,samples:s.samples,maxStepMeters:s.maxStep}))};
  camera.position.set(0,1.7,-137);camera.lookAt(0,1,-80);camera.updateMatrixWorld(true);for(let i=0;i<180;i++)await tick({quality:'low'});report.lowCourt=observer.submitted.filter(a=>a.templateId==='official-ceremonial').map(a=>a.id);assert.equal(report.lowCourt.length,12);
  for(let i=0;i<180;i++)await tick({daylight:0});assert.equal(observer.submitted.some(a=>a.sceneRef==='taihe'),false);report.nightEligibleIds=[...system.manager.states.values()].filter(s=>s.activeSchedule===true).map(s=>s.actor.id);assert.equal(report.nightEligibleIds.length,18);
  const night=registry.actors.find(a=>a.id==='donghua-guard-north-01'),np=system.manager.states.get(night.id).binding.position;await view('night-donghua',[night.id],[np[0]+3,1.7,np[2]],[np[0],.9,np[2]],{daylight:0});
  const counts={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length};
  for(const zone of ['east-six','west-six','outer-east','outer-west','axis-courts']){const ids=registry.actors.filter(a=>a.zoneRef===zone).map(a=>a.id),old=system.world.getGeneration(zone);W.zoneManager.unloadZone(zone);await tick();assert.ok(ids.every(id=>!system.manager.states.get(id).binding));assert.ok(observer.submitted.every(a=>!ids.includes(a.id)));W.zoneManager.loadZone(zone);W.scene.updateMatrixWorld(true);const generation=system.world.getGeneration(zone);assert.notEqual(generation,old);const frames=await settle(ids);assert.equal(system.manager.states.size,93);assert.deepEqual({colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},counts);report.lifecycle.push({zone,oldGeneration:old,newGeneration:generation,frames,loaded:ids.length});}
  system.setEnabled(false);for(let i=0;i<10;i++)await tick();assert.equal(observer.submitted.length,0);assert.equal(system.world.work.jobs.size,0);system.setEnabled(true);await settle(registry.actors.map(a=>a.id));assert.equal(system.manager.stats.loaded,93);assert.equal(system.manager.stats.errors,0);report.offOn={registered:system.manager.stats.registered,ready:system.manager.stats.loaded,errors:system.manager.stats.errors,contentApproved:system.snapshot().contentApproved};
  }
  const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});let Teleport;try{({Teleport}=await import('../src/ui/Teleport.js'));}finally{hook.deregister();}
  teleport=new Teleport({setPosition(){},lookAt(){}},W.zoneManager,W.cm);
  report.changchun=assertChangchunEastInWorld(W); // Unchanged R54 component; earlier controller-route evidence retained, not rerun.
  report.jiaotai=assertJiaotaiDisplayInWorld(W,{teleport,registry});
  const zBaseline=JSON.parse(fs.readFileSync('tests/fixtures/r55-zhonghe-fullworld-landing.json')).result;assert.deepEqual(Object.fromEntries(Object.entries(teleport.geometryFor('中和殿')).map(([k,v])=>[k,Object.is(v,-0)?0:v])),zBaseline.geometry);const zPreferred=teleport.landingFor('中和殿');assert.equal(teleport.isSafe(zPreferred,teleport.geometryFor('中和殿')),zBaseline.preferredSafe);assert.deepEqual(zPreferred,zBaseline.preferred);
  report.zhonghe=assertZhongheDisplayInWorld(W,{teleport,registry,expectedLanding:zBaseline.landing});
  for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])await t.test(`Zhonghe four-door and two-side world route ${fps}Hz sprint=${sprint} backward=${backward}`,t=>{report.consumers.push({component:'zhonghe',...replayZhongheDisplayRoute(t,W,{fps,sprint,backward})});});
  for(const fps of [10,60])for(const mode of ['platform','diagonal','reverse'])await t.test(`Zhonghe ${mode} world route ${fps}Hz`,t=>{report.consumers.push({component:'zhonghe',...replayZhongheDisplayRoute(t,W,{fps,sprint:true,[mode]:true})});});
  const staff=await proveR55Staff(W,{system,observer});assert.equal(staff.success,true);report.staffProof={success:true,reportPath:out+'/staff-proof.json.gz',gzipSha256:hash(out+'/staff-proof.json.gz'),views:staff.views.length,routes:staff.motion.length,physicalRoles:staff.physical.length};
  // The unchanged R53 rooms retain their exact component audits. Their earlier
  // controller paths are not re-run as a fictitious new architecture change.
  W.rooms=W.zoneManager.allRooms;report.rooms={yangxinB:auditYangxinWorld(W,{layer:'B'}),shoukangB:assertShoukangEastInWorld(W),arrivals:verifySouthernMapArrivals(W,teleport,['养心殿','寿康宫'])};assert.equal(report.rooms.yangxinB.ok,true);
  const beforeS={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length};
  report.kunning={B:await assertKunningStovesInWorld(W,{interiors,layer:'B'})};
  interiors.gltf.load=(url,ok,_progress,error)=>{const id=[...interiors.halls.keys()].find(id=>url===`${interiors.base}${interiors.halls.get(id).cfg.model}`);assert.ok(id,'Exact configured model URL, not a generic successful stand-in');const decoder=id==='yangxin'?actualYangxinRoot:actualKunningRoot;decoder().then(root=>ok({scene:root}),error);};
  assert.equal(await interiors.load('yangxin'),true);interiors.update({x:108.6,z:277.5},performance.now()+500);W.scene.updateMatrixWorld(true);
  assert.equal(W.cm.colliders.length,beforeS.colliders+10);assert.equal(interiors.halls.get('yangxin').fade,null);
  report.rooms.yangxinS=auditYangxinWorld({...W,rooms:W.zoneManager.allRooms},{layer:'S'});assert.equal(report.rooms.yangxinS.ok,true);report.rooms.shoukangWhileYangxinS=assertShoukangEastInWorld(W);
  const sStart=report.views.length;report.rooms.sRebindFrames=await settle(registry.actors.map(a=>a.id));await verifyRoleViews('S-Yangxin/');
  const sIds=[...new Set(report.views.slice(sStart).flatMap(v=>v.actors.map(a=>a.id)))].sort();assert.deepEqual(sIds,registry.actors.map(a=>a.id).sort());
  report.rooms.sVisibleIds=sIds;report.rooms.sModelSha256=hash('public/models/interiors/yangxin.glb');report.rooms.sBoundary='Actual GLB decoded by checked-in Draco JS; real InteriorLoader load/fade/unload and actual CollisionManager; texture loading, browser and GPU are not exercised.';
  interiors.unload('yangxin');W.scene.updateMatrixWorld(true);assert.deepEqual({colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},beforeS);await settle(registry.actors.map(a=>a.id));assert.equal(system.manager.stats.loaded,93);assert.equal(system.manager.stats.errors,0);report.rooms.returnToB={ready:93,errors:0,audit:auditYangxinWorld({...W,rooms:W.zoneManager.allRooms},{layer:'B'})};assert.equal(report.rooms.returnToB.audit.ok,true);
  const beforeKunning={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},beforeKunningGenerations=new Map(registry.actors.map(a=>[a.id,system.world.getRevision(a)]));
  assert.equal(await interiors.load('kunning'),true);interiors.update({x:-5,z:386.1},performance.now()+500);W.scene.updateMatrixWorld(true);
  assert.equal(W.cm.colliders.length,beforeKunning.colliders+8);assert.equal(W.cm.walkables.length,beforeKunning.walkables);
  report.kunning.S=await assertKunningStovesInWorld(W,{interiors,layer:'S'});report.kunning.rebindFrames=await settle(registry.actors.map(a=>a.id));
  report.kunning.generationTransitions=registry.actors.map(a=>{const revision=system.world.getRevision(a),state=system.manager.states.get(a.id);assert.notEqual(revision,beforeKunningGenerations.get(a.id),a.id+' fresh Kunning S generation');assert.equal(state.revision,revision);assert.equal(state.binding.status,'ready');return{id:a.id,before:beforeKunningGenerations.get(a.id),loaded:revision};});
  const kStart=report.views.length;await verifyRoleViews('S-Kunning/');report.kunning.individuallyVisibleIds=[...new Set(report.views.slice(kStart).flatMap(v=>v.actors.map(a=>a.id)))].sort();assert.deepEqual(report.kunning.individuallyVisibleIds,registry.actors.map(a=>a.id).sort());
  for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])await t.test(`Kunning S actual-world doorway/stove roundtrip ${fps}Hz sprint=${sprint} backward=${backward}`,t=>{
   const trace=traceTerraceGround(W.cm,{flights:[]});try{const result=replayKunning(t,W,R55_KUNNING_OBSERVATION_ROUTE,{startFeet:2,fps,sprint,backward,recordFrames:true});assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));assert.ok(result.frames.every(f=>f.ground>=2-1e-6&&f.ground<=2.260001));assert.equal(trace.samples.some(s=>s.source==='rescue'),false);assert.ok(result.frames.every(f=>!W.cm.checkCollision(new THREE.Vector3(f.x,Math.max(f.feet,f.ground)+1.7,f.z),.5)));report.consumers.push({component:'kunning-S',fps,sprint,backward,...result,frames:result.frames.length,selectedRescue:false});}finally{trace.restore();}
  });
  camera.position.set(-5.15,3.86,388.8);camera.lookAt(-5.22,2.59,391.8);camera.updateMatrixWorld(true);await tick();assert.equal(W.cm.checkCollision(camera.position,.5),false);fs.mkdirSync('/tmp/r55-unified-geometry',{recursive:true});report.kunning.sceneEvidence=exportProductionView({scene:W.scene,camera,characters:system},'/tmp/r55-unified-geometry/kunning-stoves-in-scene.json.gz',{far:35});
  interiors.unload('kunning');W.scene.updateMatrixWorld(true);assert.deepEqual({colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},beforeKunning);report.kunning.returnToB=await assertKunningStovesInWorld(W,{interiors,layer:'B'});report.kunning.returnRebindFrames=await settle(registry.actors.map(a=>a.id));
  for(const a of registry.actors){const revision=system.world.getRevision(a),state=system.manager.states.get(a.id);assert.notEqual(revision,report.kunning.generationTransitions.find(r=>r.id===a.id).loaded);assert.equal(state.revision,revision);assert.equal(state.binding.status,'ready');}assert.equal(system.manager.stats.loaded,93);assert.equal(system.manager.stats.errors,0);
  report.kunning.boundary='Actual final GLB bytes through the unchanged production InteriorLoader and same-world CollisionManager. All93 fresh bindings and individual CPU triangle visibility after S load; exact B physical registrations and fresh bindings after unload. Not network, texture, browser/GPU or phone acceptance.';
  report.viewFailures=report.views.filter(v=>!v.pass).map(v=>({label:v.label,cameraCollision:v.cameraCollision,actors:v.actors.map(a=>({id:a.id,visible:a.rays.visible,contactFailure:a.contactFailure,blockers:[...new Set(a.rays.hits.filter(h=>!h.visible).map(h=>h.first?.name))]}))}));assert.deepEqual(report.viewFailures,[],'Every individual role must have an actually clear legal view');
  assert.equal(sourceFingerprint(process.cwd()),report.sourceFingerprint);report.finalSourceHashes=hashes();assert.deepEqual(report.finalSourceHashes,report.sourceHashes);report.success=true;
 }finally{fs.writeFileSync(out+'/one-world-validation.json',JSON.stringify(report,null,2)+'\n');teleport?.dispose();observer.dispose();system.dispose();interiors.dispose();W.dispose();}
});
