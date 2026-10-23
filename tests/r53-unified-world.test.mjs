import {readWorldCheckpoint} from './lib/r53-world-checkpoint.mjs';
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
import {proveR53LifeCandidates} from './lib/r53-life-candidate-proof.mjs';
import {courtLifeScenarios} from './lib/r52-court-life-scenarios.mjs';
import {verifySouthernMapArrivals} from './helpers/r52-southern-route-validation.mjs';
import {validateSouthernWorld} from '../scripts/r52-validate-southern-routes.mjs';
import {wuyingMoonTerraceAccess} from '../src/scene/palace/special/WuyingMoonTerrace.js';
import {runWuyingConsumerChecks} from './lib/r52-wuying-consumer-checks.mjs';
import {verifyWuyingFlightDescent} from './lib/r52-wuying-flight-check.mjs';
import {createPalaceFlightEnvelope} from '../src/scene/flight/FlightEnvelope.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {exportProductionView} from './lib/r51-production-raster.mjs';
import {assertShoukangEastInWorld,SHOUKANG_WORLD_ROUTE,SHOUKANG_PREFERRED_LANDING} from './lib/r53-shoukang-world-check.mjs';
import {auditYangxinWorld,yangxinWorldRoute} from './r53-yangxin/world-audit.mjs';
import {actualYangxinRoot} from './r53-yangxin/glb-fixture.mjs';
import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
const out='reports/r53-unified',sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();fs.mkdirSync(out,{recursive:true});
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifest=JSON.parse(fs.readFileSync('data/characters/world-source-freeze.json')),hashes=()=>Object.fromEntries(manifest.files.map(f=>[f.path,hash(f.path)]));
const firstCheckpointBytes=readWorldCheckpoint('first-world-red'),firstCheckpoint=JSON.parse(firstCheckpointBytes),firstCheckpointSha=createHash('sha256').update(firstCheckpointBytes).digest('hex');
assert.equal(firstCheckpointSha,JSON.parse(fs.readFileSync(out+'/first-world-red/README.json')).files.find(f=>f.path==='one-world-validation.json').sha256);
assert.equal(firstCheckpoint.success,false);assert.deepEqual(firstCheckpoint.sourceHashes,hashes());
const continueCompletedB=process.env.R53_RESUME_COMPLETED_B==='1';
const completedBytes=continueCompletedB?readWorldCheckpoint('second-world-red'):null,completed=completedBytes?JSON.parse(completedBytes):null;
if(completed){assert.equal(createHash('sha256').update(completedBytes).digest('hex'),JSON.parse(fs.readFileSync(out+'/second-world-red/README.json')).files.find(f=>f.path==='one-world-validation.json').sha256);assert.deepEqual(completed.sourceHashes,hashes());assert.equal(completed.success,false);assert.equal(completed.views.some(v=>!v.pass),false);assert.equal(completed.individuallyVisibleIds.length,77);assert.equal(completed.lifeCandidateProof.success,true);assert.equal(completed.southern.pass,true);}
const lifeFragment=JSON.parse(fs.readFileSync('data/characters/fragments/r53-household-life.json'));
const report={sourceCommit,createdAt:new Date().toISOString(),boundary:'Continuation after preserved QA-shadow failure disposed the first world. Unaffected previously-green B views inherit the exact-world-source checkpoint, with fresh Chuxiu/emperor/new-six views. All77 fresh S views and remaining checks run in this one actual production static/all-zone world with real CollisionManager, System, Manager, ResourcePool, Renderer instance streams and shader-equivalent CPU triangle rays. No browser/WebGL, textures/shadows, GPU frame performance or physical-phone claim. 77 logical identities are checked individually, never claimed simultaneously visible.',sourceHashes:hashes(),views:[],bindings:[],paths:[],lifecycle:[],flight:[],consumers:[],success:false};
if(completed){for(const key of ['paths','lifecycle','flight','consumers','motion','lowCourt','nightEligibleIds','offOn','southern','lifeCandidateProof','individuallyVisibleIds'])report[key]=structuredClone(completed[key]);report.views=completed.views.map(v=>({...v,inheritedCurrentProductionCheckpoint:{sourceCommit:completed.sourceCommit,reportSha256:createHash('sha256').update(completedBytes).digest('hex')}}));report.continuation='B lifecycle, southern/Wuying, patrol and six-person proof are inherited from completed current-production stages; only room/S scope runs now. Prior complete-world process disposed after QA failure, so a new identical-production world is required. All77 S instances/rays/contact are fresh.';}
test('unified R53: all77 actual bindings/submitted visible roles, eight paths, south routes and current Wuying consumers in one world',async t=>{
 const W=await buildR52World(),camera=new THREE.PerspectiveCamera(65,16/9,.1,2000);camera.position.set(0,1.7,-494);camera.lookAt(0,1,-480);camera.updateMatrixWorld(true);
 const ih=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});let InteriorLoader;try{({InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js'));}finally{ih.deregister();}
 const interiors=new InteriorLoader(W.scene,W.cm,{registry:{yangxin:JSON.parse(fs.readFileSync('data/interiors/yangxin.json'))}});
 const system=new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,interiors,registry,documentObject:W.dom.document}),observer=observeCharacterSubmissions(system);let teleport;
 const tick=async({dt=1/60,quality='high',daylight=1}={})=>{system.update(dt,{daylight,quality,viewportHeight:1080});await Promise.resolve();assert.equal(system.lastError,null);assert.ok(system.manager.stats.near<=2);assert.ok(observer.submitted.length<=(quality==='low'?32:64));assert.equal(new Set(observer.submitted.map(a=>a.id)).size,observer.submitted.length);};
 async function settle(ids,{render=false,...options}={}){for(let frame=0;frame<20000;frame++){await tick(options);if(ids.every(id=>{const s=system.manager.states.get(id);return s.binding?.status==='ready'&&s.readiness===1&&(!render||observer.submitted.some(a=>a.id===id&&a.visibility===1));}))return frame+1;}throw Error('Bounded preparation failed '+JSON.stringify({ids,status:system.statusSnapshot(),states:ids.map(id=>{const s=system.manager.states.get(id);return{id,position:s.binding?.position,error:s.error,pending:s.pending,lod:s.lod,readiness:s.readiness};})}));}
 async function view(label,ids,pos,target,{feet=false,exportView=false,daylight=1,quality='high'}={}){
  camera.position.fromArray(pos);camera.lookAt(...target);camera.updateMatrixWorld(true);const frames=await settle(ids,{render:true,daylight,quality});W.scene.updateMatrixWorld(true);
  const copies=observer.meshes(),architecture=visibleArchitecture(W.scene),objects=[...architecture,...copies.map(c=>c.mesh)];const row={label,camera:pos,target,frames,daylight,quality,simulationSeconds:system.manager.simulationSeconds,cameraCollision:W.cm.checkCollision(camera.position,.5),renderCopies:observer.submitted.length,near:system.manager.stats.near,actors:[]};
  // Collect every bad camera/ray in one diagnostic run, then fail the suite.
  row.pass=!row.cameraCollision;
  for(const id of ids){const m=copies.filter(c=>c.actor.id===id);assert.equal(m.length,1,id);const a=m[0],rays=actualTriangleRays(camera,a,objects),state=system.manager.states.get(id);const proof={id,lod:a.actor.lod,position:a.actor.position,visibility:a.visibility,revision:system.world.getRevision(state.actor),rays};assert.equal(a.visibility,1);if(rays.visible===0)row.pass=false;if(['standing','seated'].includes(a.actor.pose)){proof.soles=lifeSoleContacts(a,architecture);const speed=system.renderer.batches.get(a.batch).mesh.geometry.attributes.characterAnim.getZ(a.index);try{proof.contact=assertLifeSoleSupport(proof.soles,speed);}catch(error){proof.contactFailure=String(error);row.pass=false;}}row.actors.push(proof);}
  if(exportView){fs.mkdirSync('/tmp/r53-unified-geometry',{recursive:true});row.geometry=exportProductionView({scene:W.scene,camera,characters:system},`/tmp/r53-unified-geometry/${label}.json.gz`,{far:70});}
  for(const c of copies)c.mesh.geometry.dispose();report.views.push(row);console.log('ROLE_VIEW '+JSON.stringify({label,ids,rays:row.actors.map(a=>a.rays.visible),copies:row.renderCopies,pass:row.pass}));return row;
 }
 async function verifyRoleViews(prefix){
  const inherited=prefix==='B/'&&process.env.R53_REUSE_FIRST_B==='1'?new Map(firstCheckpoint.views.filter(row=>row.pass&&!row.actors.some(a=>['chuxiu-maid-01','chuxiu-consort-01','taihe-emperor-01'].includes(a.id))).map(row=>[row.label,row])):new Map();
  const renderView=(label,...args)=>{const row=inherited.get(prefix+label);if(!row)return view(prefix+label,...args);const copy=structuredClone(row);copy.inheritedEvidence={sourceCommit:firstCheckpoint.sourceCommit,reportSha256:firstCheckpointSha,reason:'Previously green unchanged-role B view; exact world geometry source hashes retained. All77 are independently re-submitted and ray/contact checked in current S state. Not a current-world generation claim.'};report.views.push(copy);return copy;};
  for(const actor of registry.actors.filter(a=>a.sceneRef==='taihe'&&!a.id.includes('attendant')&&a.behavior.basePose!=='seated')){const p=system.manager.states.get(actor.id).binding.position;await renderView(actor.id,[actor.id],[p[0],1.7,p[2]-4],[p[0],1,p[2]],{exportView:false});}
  const attendants=registry.actors.filter(a=>a.id.includes('taihe-attendant')).map(a=>a.id);await renderView('taihe-four-attendants',attendants,[0,11.6375,-4],[0,10.9,2],{feet:true,exportView:false});
  await renderView('taihe-emperor-in-hall',['taihe-emperor-01'],[0,11.6375,0],[0,13.1,9.01],{exportView:false});
  const special=new Map([['chuxiu-consort-01',[[101.5,2.3,435],[100.22,1.6,438.16]]]]);
  const life=courtLifeScenarios({registry,adapter:system.world}),newLifeIds=new Set([...life.flatMap(s=>s.actorIds),...R53_LIFE_IDS]);
  for(const actor of registry.actors.filter(a=>a.sceneRef!=='taihe'&&!newLifeIds.has(a.id))){const state=system.manager.states.get(actor.id),s=state.patrol?.sample(system.manager.simulationSeconds,actor.behavior.followerIndex??0)??state.binding,p=s.position,h=s.rotationYRad;let [pos,target]=special.get(actor.id)??[[p[0]+Math.sin(h)*3+(state.patrol?2:0),p[1]+1.7,p[2]+Math.cos(h)*3],[p[0],p[1]+.9,p[2]]];if(state.patrol){const legal=patrolViewpoint(W,s);pos=legal.camera;target=legal.target;}await renderView(actor.id,[actor.id],pos,target,{exportView:false});}
  for(const scenario of life)await renderView(scenario.sceneRef,scenario.actorIds,scenario.camera,scenario.lookAt,{exportView:false});
  for(const v of lifeCandidateViews(lifeFragment,system.world)) await renderView(v.label,v.actorIds,v.camera,v.target);
 }
 async function yangxinRoomChecks(layer){W.rooms=W.zoneManager.allRooms;const check=auditYangxinWorld(W,{layer});assert.equal(check.ok,true,JSON.stringify(check.blocked));check.replays=[];for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])await t.test(`same-world Yangxin ${layer} ${fps}Hz sprint=${sprint} backward=${backward}`,child=>{const trace=traceTerraceGround(W.cm,{flights:[]});try{const result=replayTerrace(child,W,yangxinWorldRoute(),{fps,sprint,backward});assert.equal(result.arrived,true,JSON.stringify(result));assert.equal(trace.samples.some(s=>s.source==='rescue'),false);check.replays.push({fps,sprint,backward,...result});}finally{trace.restore();}});return check;}
 try{
  assert.equal(registry.actors.length,77);assert.equal(system.validation.valid,true);assert.equal(system.enabled,true);assert.equal(system.snapshot().contentApproved,false);
  report.initialPreparationFrames=await settle(registry.actors.map(a=>a.id));assert.equal(system.manager.stats.loaded,77);assert.equal(system.manager.stats.errors,0);assert.equal(system.renderer.root.parent,W.scene);
  report.world={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length,zones:[...W.zoneManager.loaded.keys()]};
  for(const {actor,binding,revision}of system.manager.states.values()){assert.equal(binding.status,'ready',actor.id);report.bindings.push({id:actor.id,pose:actor.behavior.basePose,templateId:actor.templateId,sceneRef:actor.sceneRef,zoneRef:actor.zoneRef,revision,binding});}
  if(!continueCompletedB){
  for(const path of registry.paths){const actor=registry.actors.find(a=>a.placement.pathRef===path.id),binding=system.manager.states.get(actor.id).binding,p=binding.path;assert.ok(p.samples.length>1);for(let i=0;i<p.samples.length;i++){const s=p.samples[i];if(i)assert.ok(s.distanceMeters-p.samples[i-1].distanceMeters<=.2500001);assert.equal(system.world._blockedSegment(s.position,s.position,path.radiusMeters+path.safetyMarginMeters,1.85),null);}report.paths.push({id:path.id,samples:p.samples.length,lengthMeters:p.lengthMeters,bodyRadiusPlusMargin:path.radiusMeters+path.safetyMarginMeters,samplePositions:p.samples.map(s=>s.position),generation:system.world.getGeneration(actor.zoneRef)});}
  // Every shipped ID must appear in a real instance with unobstructed in-frustum
  // deformed triangles from a legal viewpoint. Generic nonzero counts cannot pass.
  await verifyRoleViews('B/');
  const proven=new Set(report.views.flatMap(v=>v.actors.map(a=>a.id)));assert.equal(proven.size,77);assert.deepEqual([...proven].sort(),registry.actors.map(a=>a.id).sort());report.individuallyVisibleIds=[...proven].sort();
  // Observe real production patrol time over two complete periods without
  // rewriting positions. All movement and turn states come from System update.
  const patrolStates=[...system.manager.states.values()].filter(s=>s.patrol),duration=Math.max(...patrolStates.map(s=>s.patrol.cycleSeconds))*2,seen=new Map(patrolStates.map(s=>[s.actor.id,{previous:null,samples:0,maxStep:0}]));
  for(let seconds=0;seconds<=duration+.05;seconds+=.1){await tick({dt:.1});for(const state of patrolStates){const sample=state.patrol.sample(system.manager.simulationSeconds,state.actor.behavior.followerIndex??0),path=registry.paths.find(p=>p.id===state.actor.placement.pathRef),r=seen.get(state.actor.id);assert.equal(system.world._blockedSegment(sample.position,sample.position,path.radiusMeters+path.safetyMarginMeters,1.85),null);if(r.previous){const step=Math.hypot(...sample.position.map((v,i)=>v-r.previous[i]));r.maxStep=Math.max(r.maxStep,step);assert.ok(step<=.2,'No teleport during path turn '+state.actor.id);}r.previous=sample.position;r.samples++;}}
  report.motion={durationSeconds:duration,actors:[...seen].map(([id,s])=>({id,samples:s.samples,maxStepMeters:s.maxStep}))};
  camera.position.set(0,1.7,-137);camera.lookAt(0,1,-80);camera.updateMatrixWorld(true);for(let i=0;i<180;i++)await tick({quality:'low'});report.lowCourt=observer.submitted.filter(a=>a.templateId==='official-ceremonial').map(a=>a.id);assert.equal(report.lowCourt.length,12);
  for(let i=0;i<180;i++)await tick({daylight:0});assert.equal(observer.submitted.some(a=>a.sceneRef==='taihe'),false);report.nightEligibleIds=[...system.manager.states.values()].filter(s=>s.activeSchedule===true).map(s=>s.actor.id);assert.equal(report.nightEligibleIds.length,18);
  const night=registry.actors.find(a=>a.id==='donghua-guard-north-01'),np=system.manager.states.get(night.id).binding.position;await view('night-donghua',[night.id],[np[0]+3,1.7,np[2]],[np[0],.9,np[2]],{daylight:0});
  const counts={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length};
  for(const zone of ['east-six','west-six','outer-east','outer-west','axis-courts']){const ids=registry.actors.filter(a=>a.zoneRef===zone).map(a=>a.id),old=system.world.getGeneration(zone);W.zoneManager.unloadZone(zone);await tick();assert.ok(ids.every(id=>!system.manager.states.get(id).binding));assert.ok(observer.submitted.every(a=>!ids.includes(a.id)));W.zoneManager.loadZone(zone);W.scene.updateMatrixWorld(true);const generation=system.world.getGeneration(zone);assert.notEqual(generation,old);const frames=await settle(ids);assert.equal(system.manager.states.size,77);assert.deepEqual({colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},counts);report.lifecycle.push({zone,oldGeneration:old,newGeneration:generation,frames,loaded:ids.length});}
  system.setEnabled(false);for(let i=0;i<10;i++)await tick();assert.equal(observer.submitted.length,0);assert.equal(system.world.work.jobs.size,0);system.setEnabled(true);await settle(registry.actors.map(a=>a.id));assert.equal(system.manager.stats.loaded,77);assert.equal(system.manager.stats.errors,0);report.offOn={registered:system.manager.stats.registered,ready:system.manager.stats.loaded,errors:system.manager.stats.errors,contentApproved:system.snapshot().contentApproved};
  }
  const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});let Teleport;try{({Teleport}=await import('../src/ui/Teleport.js'));}finally{hook.deregister();}
  teleport=new Teleport({setPosition(){},lookAt(){}},W.zoneManager,W.cm);if(!continueCompletedB){report.southern=await validateSouthernWorld(t,W,{sourceCommit,worldState:'R53 77 logical actors; actual all-zone B geometry after repeated unload/reload; no optional S interiors loaded',wuyingAccess:wuyingMoonTerraceAccess,teleport});assert.equal(report.southern.pass,true);
  for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])await t.test(`same-world Wuying consumers ${fps}Hz sprint=${sprint} backward=${backward}`,child=>{report.consumers.push(...runWuyingConsumerChecks(child,W,{fps,sprint,backward}));});
  const envelope=createPalaceFlightEnvelope({palaceBuilder:W.palaceBuilder,enclosure:W.enclosure,garden:W.garden,zoneManager:W.zoneManager,layout:PALACE_LAYOUT});for(const fps of [10,60])report.flight.push(verifyWuyingFlightDescent(W,envelope,{fps}));
  const lifeProof=await proveR53LifeCandidates(W,{externalSystem:system,externalObserver:observer,worldState:'integrated-r53',out:out+'/life-final',geometryOut:'/tmp/r53-integrated-life-geometry',exports:true});
  assert.equal(lifeProof.success,true);report.lifeCandidateProof={success:lifeProof.success,sourceCommit:lifeProof.sourceCommit,reportPath:out+'/life-final/candidate-world-proof.json.gz',gzipSha256:hash(out+'/life-final/candidate-world-proof.json.gz'),views:lifeProof.views.length,routes:lifeProof.motion.length,bindings:lifeProof.bindings.length};
  }
  report.rooms={yangxinB:await yangxinRoomChecks('B'),shoukangB:assertShoukangEastInWorld(W),arrivals:verifySouthernMapArrivals(W,teleport,['养心殿','寿康宫']),shoukangReplays:[]};
  const sl=teleport.resolveLanding('寿康宫');assert.equal(sl.fallback,false);for(const k of ['x','z','y'])assert.ok(Math.abs(sl[k]-SHOUKANG_PREFERRED_LANDING[k])<1e-7);
  for(const fps of [10,60])for(const sprint of [false,true])for(const backward of [false,true])await t.test(`same-world Shoukang B ${fps}Hz sprint=${sprint} backward=${backward}`,child=>{const trace=traceTerraceGround(W.cm,{flights:[]});try{const result=replayTerrace(child,W,SHOUKANG_WORLD_ROUTE,{fps,sprint,backward});assert.equal(result.arrived,true,JSON.stringify(result));assert.equal(trace.samples.some(s=>s.source==='rescue'),false);report.rooms.shoukangReplays.push({fps,sprint,backward,...result});}finally{trace.restore();}});
  const beforeS={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length};
  interiors.gltf.load=(_u,ok)=>actualYangxinRoot().then(root=>ok({scene:root}));
  assert.equal(await interiors.load('yangxin'),true);interiors.update({x:108.6,z:277.5},performance.now()+500);W.scene.updateMatrixWorld(true);
  assert.equal(W.cm.colliders.length,beforeS.colliders+10);assert.equal(interiors.halls.get('yangxin').fade,null);
  report.rooms.yangxinS=await yangxinRoomChecks('S');report.rooms.shoukangWhileYangxinS=assertShoukangEastInWorld(W);
  const sStart=report.views.length;report.rooms.sRebindFrames=await settle(registry.actors.map(a=>a.id));await verifyRoleViews('S-Yangxin/');
  const sIds=[...new Set(report.views.slice(sStart).flatMap(v=>v.actors.map(a=>a.id)))].sort();assert.deepEqual(sIds,registry.actors.map(a=>a.id).sort());
  report.rooms.sVisibleIds=sIds;report.rooms.sModelSha256=hash('public/models/interiors/yangxin.glb');report.rooms.sBoundary='Actual GLB decoded by checked-in Draco JS; real InteriorLoader load/fade/unload and actual CollisionManager; texture loading, browser and GPU are not exercised.';
  interiors.unload('yangxin');W.scene.updateMatrixWorld(true);assert.deepEqual({colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},beforeS);await settle(registry.actors.map(a=>a.id));assert.equal(system.manager.stats.loaded,77);assert.equal(system.manager.stats.errors,0);report.rooms.returnToB={ready:77,errors:0,audit:auditYangxinWorld({...W,rooms:W.zoneManager.allRooms},{layer:'B'})};assert.equal(report.rooms.returnToB.audit.ok,true);
  report.viewFailures=report.views.filter(v=>!v.pass).map(v=>({label:v.label,cameraCollision:v.cameraCollision,actors:v.actors.map(a=>({id:a.id,visible:a.rays.visible,contactFailure:a.contactFailure,blockers:[...new Set(a.rays.hits.filter(h=>!h.visible).map(h=>h.first?.name))]}))}));assert.deepEqual(report.viewFailures,[],'Every individual role must have an actually clear legal view');
  report.finalSourceHashes=hashes();assert.deepEqual(report.finalSourceHashes,report.sourceHashes);report.success=true;
 }finally{fs.writeFileSync(out+'/one-world-validation.json',JSON.stringify(report,null,2)+'\n');teleport?.dispose();observer.dispose();system.dispose();interiors.dispose();W.dispose();}
});
