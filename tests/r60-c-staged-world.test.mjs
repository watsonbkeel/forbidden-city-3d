import {createBoundedQaMocks} from './lib/bounded-qa-clock.mjs';
import {getHeapStatistics} from 'node:v8';
import {assertR60CInWorld,r60CWorldRoutes} from './lib/r60-c-world-check.mjs';
import {assertWenyuanUpperSouthWindowsInWorld} from './lib/r59-wenyuan-upper-world-check.mjs';
import {assertArrowSouthKneesInWorld} from './lib/r59-arrow-knees-world-check.mjs';
import {assertWenhuaGateSouthWindowInWorld} from './lib/r59-wenhua-gate-window-world-check.mjs';
import {assertDonghuaCentralDoorFrontInWorld} from './lib/r59-donghua-world-check.mjs';
import {assertNansansuoInventoryInWorld} from './lib/r59-nansansuo-inventory-world-check.mjs';
import {assertTaihemenSouthKneesInWorld} from './lib/r58-taihemen-knees-world-check.mjs';
import {assertHongyiLeavesInWorld} from './lib/r58-hongyi-window-world-check.mjs';
import {assertXieheCourtyardKneesInWorld,replayXieheCourtyardJumps} from './lib/r58-xiehe-courtyard-world-check.mjs';
import {assertWumenNortheastColumnsInWorld} from './lib/r58-wumen-pavilion-world-check.mjs';
import {assertZhaodePanelsInWorld} from './lib/r58-zhaode-panel-world-check.mjs';
import {assertGalleryInventoryInWorld,galleryEntryPoints} from './lib/r58-gallery-world-check.mjs';
import {assertThreeHallWalkingBeastsInWorld} from './lib/r58-three-hall-beasts-world-check.mjs';
import {assertDeclarationInventoryInWorld,declarationEntranceRoutes} from './lib/r58-declaration-inventory-world-check.mjs';
import {assertCourtyardWindowsInWorld} from './lib/r58-courtyard-window-world-check.mjs';
import {assertZuoyiDoorFrontInWorld} from './lib/r58-zuoyi-world-check.mjs';
import {loadLocalTextureLibrary,bindRealDoorTextures} from './lib/r58-zuoyi-real-texture-loader.mjs';
import {assertBaoheDaisInWorld,replayBaoheDaisRoute} from './lib/r58-baohe-dais-world-check.mjs';
import {assertXiheCorbelsInWorld,assertTirenLeavesInWorld,assertCourtRouteHeadClearance} from './lib/r58-court-facade-world-check.mjs';
import {sideGateGeometry} from '../src/scene/palace/special/SideGateProfiles.js';
import {pavilionGeometry} from '../src/scene/palace/special/PavilionProfiles.js';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {assertZhenduInWorld,replayZhenduRoute} from './lib/r58-zhendu-world-check.mjs';
import {assertTaihemenInWorld} from './lib/r58-taihemen-world-check.mjs';
import {evaluateTaiheEastFirewall} from './lib/r58-axis-firewall-qa.mjs';
import {evaluateWumenNorthPortals} from './lib/r58-wumen-north-portal-qa.mjs';
import {evaluateWumenSouthCanopies} from './lib/r58-wumen-south-canopy-qa.mjs';
import {visiblePatrolViewpoint,isGuardPatrolActor} from './lib/r54-patrol-viewpoint.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gunzipSync,gzipSync} from 'node:zlib';
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
import {proveR57Staff,R57_STAFF_IDS} from './lib/r57-staff-proof.mjs';
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
import {actualHuangjiRoot,auditHuangjiLoadedInWorld} from './lib/r57-huangji-streaming.mjs';
import {evaluateR57PhysicalClearance} from './lib/r57-staff-clearance.mjs';
import {replayKunning} from './lib/kunning-walk.mjs';
import {traceTerraceGround,replayTerrace} from './lib/terrace-walk.mjs';
import {captureWumenNorthHeadTriangles,replayWumenNorthJump} from './lib/wumen-north-jump.mjs';
const priorStaffIds=[...registry.scope.releaseCoverage.R54.additionalRequiredActorIds,...registry.scope.releaseCoverage.R55.additionalRequiredActorIds,...registry.scope.releaseCoverage.R56.additionalRequiredActorIds];
const phase=process.env.R60_WORLD_STAGE;assert.ok(['B','yangxin','kunning','huangji'].includes(phase),'Choose one explicit isolated stage');
const out='reports/r60-c-stages/'+phase,sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();fs.mkdirSync(out,{recursive:true});
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const manifest=JSON.parse(fs.readFileSync('data/characters/world-source-freeze.json')),hashes=()=>Object.fromEntries(manifest.files.map(f=>[f.path,hash(f.path)]));
const lifeFragment=JSON.parse(fs.readFileSync('data/characters/fragments/r53-household-life.json'));
const report={phase,sourceCommit,createdAt:new Date().toISOString(),boundary:'Independent full-world process for '+phase+'. Same frozen228 sources and108 roles, no cross-process ready state. B stage retains cumulative routes/lifecycle. Each separate S stage proves B to its own real S to B, not one W consecutively running three S halls. CPU actual geometry only, no WebGL/GPU/phone or whole C acceptance.',sourceFingerprint:sourceFingerprint(process.cwd()),sourceHashes:hashes(),views:[],bindings:[],paths:[],lifecycle:[],flight:[],consumers:[],success:false};
// QA-only release of temporary CPU triangle maps/copies. No production update,
// renderer, collision or assertion is skipped. This is not browser memory QA.
report.qaMemory={nodeVersion:process.version,heapLimitBytes:getHeapStatistics().heap_size_limit,explicitGcAvailable:typeof global.gc==='function',boundary:'Test-only checkpoints and temporary CPU-geometry collection; no runtime performance acceptance',checkpoints:[]};
let qaMockScope;
report.qaMemory.mockScopes=[];
function measuredQa(label,fn){qaCheckpoint(label+'-before');const result=fn();qaCheckpoint(label+'-after');return result;}
function qaCheckpoint(label){
 qaMockScope?.release('checkpoint-'+label);
 const before=process.memoryUsage();if(typeof global.gc==='function')global.gc();
 report.qaMemory.checkpoints.push({label,before,after:process.memoryUsage()});
 fs.writeFileSync(out+'/one-world-progress.json.gz',gzipSync(JSON.stringify(report)+'\n'));
 console.log('QA_CHECKPOINT '+JSON.stringify(report.qaMemory.checkpoints.at(-1)));
}
test('R60-C independently initialized stage '+phase,async nodeTestContext=>{
 qaMockScope=createBoundedQaMocks(nodeTestContext,{onReleased:r=>{if(report.qaMemory.mockScopes.length%8===7&&global.gc){global.gc();r.afterGc=process.memoryUsage();}report.qaMemory.mockScopes.push(r);console.log('QA_MOCK_RELEASE '+JSON.stringify({label:r.label,callsReleased:r.callsReleased,callsRemaining:r.callsRemaining,rss:(r.afterGc??r.afterReset).rss}));}});const t=qaMockScope.context;
 assert.deepEqual(report.sourceHashes,Object.fromEntries(manifest.files.map(f=>[f.path,f.sha256])),'Versioned world source hashes must match before construction');
 const W=await buildR52World({loadAll:false,createLibrary:async cpu=>{const loaded=await loadLocalTextureLibrary({quality:'hd',scope:'door'});return{library:bindRealDoorTextures(cpu,loaded.library),dispose:()=>loaded.library.dispose(),evidence:{boundary:loaded.boundary,files:loaded.reads.map(p=>({path:p.slice(p.indexOf('/public/')+1),sha256:hash(p)}))}};}});report.textureEvidence=W.libraryEvidence;assert.equal(W.zoneManager.loaded.has('ningshou'),false,'Ningshou must not be scene-resident before its first character binding');for(const id of W.zoneManager.zones.keys())if(id!=='ningshou')W.zoneManager.loadZone(id);W.scene.updateMatrixWorld(true);const camera=new THREE.PerspectiveCamera(65,16/9,.1,2000);camera.position.set(0,1.7,-494);camera.lookAt(0,1,-480);camera.updateMatrixWorld(true);
 const ih=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});let InteriorLoader,INTERIORS;try{({InteriorLoader}=await import('../src/scene/interior/InteriorLoader.js'));({INTERIORS}=await import('../src/scene/interior/registry.js'));}finally{ih.deregister();}
 const interiors=new InteriorLoader(W.scene,W.cm,{registry:{yangxin:INTERIORS.yangxin,kunning:INTERIORS.kunning,huangji:INTERIORS.huangji}});
 assert.equal(W.zoneManager.loaded.has('ningshou'),false);W.scene.updateMatrixWorld(true);
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
  if(exportView){fs.mkdirSync('/tmp/r60-c-geometry',{recursive:true});row.geometry=exportProductionView({scene:W.scene,camera,characters:system},`/tmp/r60-c-geometry/${label}.json.gz`,{far:70});}
  for(const c of copies)c.mesh.geometry.dispose();report.views.push(row);console.log('ROLE_VIEW '+JSON.stringify({label,ids,rays:row.actors.map(a=>a.rays.visible),copies:row.renderCopies,pass:row.pass}));if(report.views.length%16===0)qaCheckpoint('individual-views-'+report.views.length);return row;
 }
 async function verifyRoleViews(prefix){
  const renderView=(label,...args)=>view(prefix+label,...args);
  for(const actor of registry.actors.filter(a=>a.sceneRef==='taihe'&&!a.id.includes('attendant')&&a.behavior.basePose!=='seated')){const p=system.manager.states.get(actor.id).binding.position;await renderView(actor.id,[actor.id],[p[0],1.7,p[2]-4],[p[0],1,p[2]],{exportView:false});}
  const attendants=registry.actors.filter(a=>a.id.includes('taihe-attendant')).map(a=>a.id);await renderView('taihe-four-attendants',attendants,[0,11.6375,-4],[0,10.9,2],{feet:true,exportView:false});
  await renderView('taihe-emperor-in-hall',['taihe-emperor-01'],[0,11.6375,0],[0,13.1,9.01],{exportView:false});
  const special=new Map([['chuxiu-consort-01',[[101.5,2.3,435],[100.22,1.6,438.16]]]]);
  const life=courtLifeScenarios({registry,adapter:system.world}),newLifeIds=new Set([...life.flatMap(s=>s.actorIds),...R53_LIFE_IDS]);
  for(const actor of registry.actors.filter(a=>a.sceneRef!=='taihe'&&!newLifeIds.has(a.id))){const state=system.manager.states.get(actor.id),s=state.patrol?.sample(system.manager.simulationSeconds,actor.behavior.followerIndex??0)??state.binding,p=s.position,h=s.rotationYRad;let [pos,target]=special.get(actor.id)??[[p[0]+Math.sin(h)*3+(state.patrol?2:0),p[1]+1.7,p[2]+Math.cos(h)*3],[p[0],p[1]+.9,p[2]]];if(state.patrol&&isGuardPatrolActor(actor)){const legal=await visiblePatrolViewpoint(W,s,async candidate=>{camera.position.fromArray(candidate.camera);camera.lookAt(...candidate.target);camera.updateMatrixWorld(true);await settle([actor.id],{render:true});const copies=observer.meshes();try{const targetCopy=copies.find(c=>c.actor.id===actor.id);return actualTriangleRays(camera,targetCopy,[...visibleArchitecture(W.scene),...copies.map(c=>c.mesh)]).visible;}finally{for(const c of copies)c.mesh.geometry.dispose();}});pos=legal.camera;target=legal.target;(report.patrolObserverCandidates??=[]).push({phase:prefix,id:actor.id,...legal});}else if(state.patrol||R57_STAFF_IDS.includes(actor.id)||priorStaffIds.includes(actor.id)){const legal=patrolViewpoint(W,s);pos=legal.camera;target=legal.target;}await renderView(actor.id,[actor.id],pos,target,{exportView:false});}
  for(const scenario of life)await renderView(scenario.sceneRef,scenario.actorIds,scenario.camera,scenario.lookAt,{exportView:false});
  for(const v of lifeCandidateViews(lifeFragment,system.world)) await renderView(v.label,v.actorIds,v.camera,v.target);
 }
 try{
  qaCheckpoint('world-created');
  if(phase==='B'){
  report.batch3={scope:'Three bounded work items; eight explicit gallery declarations are not verified historical rooms. No browser acceptance.',wumenNortheast:assertWumenNortheastColumnsInWorld(W),zhaodePaint:assertZhaodePanelsInWorld(W),galleryInventory:assertGalleryInventoryInWorld(W),galleryRoutes:[]};
  const galleryTargets=[...new Set(W.rooms.filter(r=>r.furnishingPolicy?.reviewId).map(r=>r.furnishingPolicy.target))].sort();assert.equal(galleryTargets.length,8);
  for(const target of galleryTargets){const room=W.rooms.find(r=>r.furnishingPolicy?.target===target);for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){const r=replayTerrace(t,W,galleryEntryPoints(room),{fps,sprint,backward,recordFrames:true});report.batch3.galleryRoutes.push({target,fps,sprint,backward,arrived:r.arrived,frames:r.frames.length,startFeet:r.startFeet,maxFeet:r.maxFeet,end:r.end});assert.ok(r.arrived,JSON.stringify({target,...r}));assert.ok(r.maxFeet>=.44&&r.maxFeet<=.451);assert.ok(r.frames.every(f=>f.feet>=-.001&&f.feet<=.451));assert.ok(Math.abs(r.end[2])<1e-7);;qaMockScope.release('route-consumers-16672');}}
  qaCheckpoint('three-consumers-and-64-gallery-routes');
  report.batch4={scope:'Three own-source bounded facade corrections; retained navigation, not browser or complete-building acceptance.',taihemen:assertTaihemenSouthKneesInWorld(W),hongyi:assertHongyiLeavesInWorld(W),xiehe:assertXieheCourtyardKneesInWorld(W),routes:[],jumps:[]};
  const axis4=JSON.parse(fs.readFileSync('data/zones/axis-courts.json'));
  const xg4=sideGateGeometry(axis4.items.find(i=>i.gateProfile==='xiehe')),hg4=pavilionGeometry(axis4.items.find(i=>i.pavilionProfile==='hongyi')),routes4=[];
  for(const portal of xg4.portals){const front=xg4.ramps[0],rear=xg4.ramps[1],z=[front.zToe-1,front.zTop,-xg4.depth/2,0,xg4.depth/2,rear.zTop,rear.zToe+1],go=z.map(z=>xg4.toWorld(portal.centerX,z));routes4.push({id:'xiehe-'+portal.bay,points:[...go,...go.slice(0,-1).reverse()]});}
  for(const side of['frontLeft','frontRight']){const go=hg4.approaches[side].worldPoints.map(p=>[p.x,p.z]);routes4.push({id:'hongyi-'+side,points:[...go,...go.slice(0,-1).reverse()]});}
  for(const route of routes4)for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){const result=replayTerrace(t,W,route.points,{fps,sprint,backward,recordFrames:true}),head=assertCourtRouteHeadClearance(W,result);assert.ok(Math.abs(result.end[2])<1e-6);report.batch4.routes.push({id:route.id,fps,sprint,backward,arrived:result.arrived,frames:result.frames.length,...head});;qaMockScope.release('route-consumers-18265');}
  for(const fps of[10,60])report.batch4.jumps.push(replayXieheCourtyardJumps(t,W,{fps}));
  qaCheckpoint('batch4-three-consumers-40-routes-12-jumps');
  report.batch5={scope:'Five bounded fifth-batch items: Taihe walking-beast counts; Zuoyi visible nine-row skins; Xihe and Xiehe own-source windows; four anonymous declarations with unknown inventory. Not browser or A37 acceptance.',courtyardWindows:assertCourtyardWindowsInWorld(W),zuoyi:assertZuoyiDoorFrontInWorld(W),declarationInventory:assertDeclarationInventoryInWorld(W),declarationRoutes:[],inheritedBlockedEntries:[]};
  for(const route of declarationEntranceRoutes(W)){
   const frontage=[...route.frontage,...route.frontage.slice(0,-1).reverse()];
   for(const [kind,points]of [['entry',route.entryRoundTrip],['frontage',frontage]])for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){
    const r=replayTerrace(t,W,points,{fps,sprint,backward,recordFrames:true});
    assert.equal(r.arrived,true,JSON.stringify({target:route.target,kind,fps,sprint,backward,...r}));assert.ok(r.frames.every(f=>f.feet>=-.001&&f.feet<=.451));assert.ok(Math.abs(r.end[2])<1e-7);
    report.batch5.declarationRoutes.push({target:route.target,kind,fps,sprint,backward,arrived:r.arrived,frames:r.frames.length,startFeet:r.startFeet,maxFeet:r.maxFeet,end:r.end});
   ;qaMockScope.release('route-consumers-19442');}
   for(const blocked of route.inheritedRiverMaskBlocked)for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){
    const r=replayTerrace(t,W,blocked.points,{fps,sprint,backward,recordFrames:true});assert.equal(r.arrived,false,'Inherited river-mask-blocked candidate must not silently become a supported route');
    report.batch5.inheritedBlockedEntries.push({target:route.target,candidateOrdinal:blocked.candidateOrdinal,fps,sprint,backward,arrived:r.arrived,frames:r.frames.length,end:r.end,status:'KNOWN_INHERITED_UNVERIFIED_ENDPOINT_NOT_A_PASSING_ROUTE'});
   ;qaMockScope.release('route-consumers-20050');}
  }
  assert.equal(report.batch5.declarationRoutes.length,64);assert.equal(report.batch5.inheritedBlockedEntries.length,16);
  qaCheckpoint('batch5-geometry-texture-64-new-declaration-routes-and-16-retained-blocked-probes');
  report.r59b1={scope:'Four bounded source-visible/unknown-inventory changes, not whole B41 acceptance',arrow:assertArrowSouthKneesInWorld(W),wenhua:assertWenhuaGateSouthWindowInWorld(W),donghua:assertDonghuaCentralDoorFrontInWorld(W),nansansuo:assertNansansuoInventoryInWorld(W),nansansuoRoutes:[]};
  for(const room of W.rooms.filter(r=>new Set(Array.from({length:6},(_,i)=>'outer-east/items/'+(i+12))).has(r.furnishingPolicy?.target))){
   const points=galleryEntryPoints(room);points.splice(2,0,[(room.min.x+room.max.x)/2,(room.min.z+room.max.z)/2],points[1]);
   for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){
    const r=replayTerrace(t,W,points,{fps,sprint,backward,recordFrames:true});assert.ok(r.arrived,JSON.stringify({target:room.furnishingPolicy.target,fps,sprint,backward,...r}));assert.ok(r.maxFeet>=.89&&r.maxFeet<=.901);assert.ok(Math.abs(r.end[2])<1e-6);
    report.r59b1.nansansuoRoutes.push({target:room.furnishingPolicy.target,fps,sprint,backward,arrived:r.arrived,maxFeet:r.maxFeet,end:r.end,frames:r.frames.length});
   ;qaMockScope.release('route-consumers-21390');}
  }
  report.r59b2={wenyuan:assertWenyuanUpperSouthWindowsInWorld(W)};assert.equal(report.r59b1.nansansuoRoutes.length,48);qaCheckpoint('r59-batch1-four-consumers-and-48-actual-entrance-routes');


  report.r60c={initial:assertR60CInWorld(W),routes:[]};
  for(const route of r60CWorldRoutes(W))for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true]){
   const r=replayTerrace(t,W,route.points,{fps,sprint,backward,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({id:route.id,fps,sprint,backward,...r}));assert.ok(r.maxFeet<.95);report.r60c.routes.push({id:route.id,fps,sprint,backward,arrived:r.arrived,frames:r.frames.length,startFeet:r.startFeet,maxFeet:r.maxFeet,end:r.end});
  ;qaMockScope.release('route-consumers-22205');}
  assert.equal(report.r60c.routes.length,56);qaCheckpoint('r60-c-five-consumers-and-56-ground-roundtrips');

  }
  if(phase!=='B'){report.r59b1={nansansuo:assertNansansuoInventoryInWorld(W)};report.r60c={initial:assertR60CInWorld(W),routes:[]};}
  assert.equal(registry.actors.length,108);assert.equal(system.validation.valid,true);assert.equal(system.enabled,true);assert.equal(system.snapshot().contentApproved,false);
  const ningshouIds=registry.actors.filter(a=>a.zoneRef==='ningshou').map(a=>a.id);assert.equal(ningshouIds.length,5);assert.equal(W.zoneManager.loaded.has('ningshou'),false);
  const coldGroup=W.zoneManager.prebuilt.get('ningshou').data.group;assert.equal(coldGroup.parent,null);assert.equal(W.scene.getObjectById(coldGroup.id),undefined);const coldGeneration=system.world.getGeneration('ningshou');const nonNingshou=registry.actors.filter(a=>a.zoneRef!=='ningshou').map(a=>a.id);const coldFrames=await settle(nonNingshou);
  for(let i=0;i<60;i++)await tick();for(const id of ningshouIds){assert.equal(system.manager.states.get(id).binding,null);assert.ok(!observer.submitted.some(a=>a.id===id));}assert.equal(system.manager.stats.errors,0);
  report.ningshouColdEntry={before:{ids:ningshouIds,zoneLoaded:false,prebuiltByProductionInit:W.zoneManager.prebuilt.has('ningshou'),detailedGroupResident:false,silhouetteResident:W.zoneManager.silhouettes.get('ningshou')?.parent===W.scene,frames:coldFrames+60,ready:system.manager.stats.loaded,submittedNew:0,generation:coldGeneration}};
  W.zoneManager.loadZone('ningshou');W.scene.updateMatrixWorld(true);assert.equal(W.zoneManager.loaded.has('ningshou'),true);assert.equal(W.zoneManager.loaded.get('ningshou').data.group,coldGroup);assert.equal(coldGroup.parent,W.scene);assert.notEqual(system.world.getGeneration('ningshou'),coldGeneration);
  report.initialPreparationFrames=await settle(registry.actors.map(a=>a.id));report.ningshouColdEntry.after={zoneLoaded:true,readyNew:ningshouIds.filter(id=>system.manager.states.get(id).binding?.status==='ready').length,generation:system.world.getGeneration('ningshou')};assert.equal(system.manager.stats.loaded,108);assert.equal(system.manager.stats.errors,0);assert.equal(system.renderer.root.parent,W.scene);
  report.world={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length,zones:[...W.zoneManager.loaded.keys()]};
  assert.equal(report.r59b1.nansansuo.absentColliders,48);assert.equal(report.world.colliders,24758-report.r59b1.nansansuo.absentColliders+11+38-8,'R59 plus38 Wuying rail boxes minus8 unsupported Nanxun props; two facade proxies move without count change');assert.equal(report.world.walkables,1125);
  for(const {actor,binding,revision}of system.manager.states.values()){assert.equal(binding.status,'ready',actor.id);report.bindings.push({id:actor.id,pose:actor.behavior.basePose,templateId:actor.templateId,sceneRef:actor.sceneRef,zoneRef:actor.zoneRef,revision,fullBindingSha256:createHash('sha256').update(JSON.stringify(binding)).digest('hex'),binding:{status:binding.status,zoneRef:binding.zoneRef,position:binding.position,rotationYRad:binding.rotationYRad,support:binding.support,path:binding.path?{id:binding.path.id,points:binding.path.points,lengthMeters:binding.path.lengthMeters,sampleCount:binding.path.samples.length,validationGeneration:binding.path.validationGeneration}:undefined},evidenceBoundary:'Unique full route sample positions are recorded once in report.paths, not duplicated per formation follower.'});}
  {
  for(const path of registry.paths){const actor=registry.actors.find(a=>a.placement.pathRef===path.id),binding=system.manager.states.get(actor.id).binding,p=binding.path;assert.ok(p.samples.length>1);for(let i=0;i<p.samples.length;i++){const s=p.samples[i];if(i)assert.ok(s.distanceMeters-p.samples[i-1].distanceMeters<=.2500001);assert.equal(system.world._blockedSegment(s.position,s.position,path.radiusMeters+path.safetyMarginMeters,1.85),null);}report.paths.push({id:path.id,samples:p.samples.length,lengthMeters:p.lengthMeters,bodyRadiusPlusMargin:path.radiusMeters+path.safetyMarginMeters,samplePositions:p.samples.map(s=>s.position),generation:system.world.getGeneration(actor.zoneRef)});}
  // Every shipped ID must appear in a real instance with unobstructed in-frustum
  // deformed triangles from a legal viewpoint. Generic nonzero counts cannot pass.
  await verifyRoleViews('B/');
  const proven=new Set(report.views.flatMap(v=>v.actors.map(a=>a.id)));assert.equal(proven.size,108);assert.deepEqual([...proven].sort(),registry.actors.map(a=>a.id).sort());report.individuallyVisibleIds=[...proven].sort();
  if(phase==='B'){
  // Observe real production patrol time over two complete periods without
  // rewriting positions. All movement and turn states come from System update.
  const patrolStates=[...system.manager.states.values()].filter(s=>s.patrol),duration=Math.max(...patrolStates.map(s=>s.patrol.cycleSeconds))*2,seen=new Map(patrolStates.map(s=>[s.actor.id,{previous:null,samples:0,maxStep:0}]));
  for(let seconds=0;seconds<=duration+.05;seconds+=.1){await tick({dt:.1});for(const state of patrolStates){const sample=state.patrol.sample(system.manager.simulationSeconds,state.actor.behavior.followerIndex??0),path=registry.paths.find(p=>p.id===state.actor.placement.pathRef),r=seen.get(state.actor.id);assert.equal(system.world._blockedSegment(sample.position,sample.position,path.radiusMeters+path.safetyMarginMeters,1.85),null);if(r.previous){const step=Math.hypot(...sample.position.map((v,i)=>v-r.previous[i]));r.maxStep=Math.max(r.maxStep,step);assert.ok(step<=.2,'No teleport during path turn '+state.actor.id);}r.previous=sample.position;r.samples++;}}
  report.motion={durationSeconds:duration,actors:[...seen].map(([id,s])=>({id,samples:s.samples,maxStepMeters:s.maxStep}))};
  camera.position.set(0,1.7,-137);camera.lookAt(0,1,-80);camera.updateMatrixWorld(true);for(let i=0;i<180;i++)await tick({quality:'low'});report.lowCourt=observer.submitted.filter(a=>a.templateId==='official-ceremonial').map(a=>a.id);assert.equal(report.lowCourt.length,12);
  for(let i=0;i<180;i++)await tick({daylight:0});assert.equal(observer.submitted.some(a=>a.sceneRef==='taihe'),false);report.nightEligibleIds=[...system.manager.states.values()].filter(s=>s.activeSchedule===true).map(s=>s.actor.id);assert.equal(report.nightEligibleIds.length,18);
  const night=registry.actors.find(a=>a.id==='donghua-guard-north-01'),np=system.manager.states.get(night.id).binding.position;await view('night-donghua',[night.id],[np[0]+3,1.7,np[2]],[np[0],.9,np[2]],{daylight:0});
  const counts={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length};
  for(const zone of ['east-six','west-six','outer-east','outer-west','axis-courts','ningshou']){const ids=registry.actors.filter(a=>a.zoneRef===zone).map(a=>a.id),old=system.world.getGeneration(zone);W.zoneManager.unloadZone(zone);await tick();assert.ok(ids.every(id=>!system.manager.states.get(id).binding));assert.ok(observer.submitted.every(a=>!ids.includes(a.id)));W.zoneManager.loadZone(zone);W.scene.updateMatrixWorld(true);const generation=system.world.getGeneration(zone);assert.notEqual(generation,old);const frames=await settle(ids);assert.equal(system.manager.states.size,108);assert.deepEqual({colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},counts);report.lifecycle.push({zone,oldGeneration:old,newGeneration:generation,frames,loaded:ids.length});if(zone==='outer-west'){report.r60c.afterReload=assertR60CInWorld(W);assert.deepEqual(report.r60c.afterReload,report.r60c.initial);}if(zone==='outer-east'){report.r59b2.wenyuanAfterReload=assertWenyuanUpperSouthWindowsInWorld(W);report.r59b1.afterReload={arrow:assertArrowSouthKneesInWorld(W),wenhua:assertWenhuaGateSouthWindowInWorld(W),donghua:assertDonghuaCentralDoorFrontInWorld(W),nansansuo:assertNansansuoInventoryInWorld(W)};assert.equal(report.r59b1.afterReload.donghua.colorPixelsSha256,report.r59b1.donghua.colorPixelsSha256);assert.equal(report.r59b1.afterReload.donghua.normalPixelsSha256,report.r59b1.donghua.normalPixelsSha256);}if(zone==='axis-courts'){report.batch5.zuoyiAfterReload=assertZuoyiDoorFrontInWorld(W);assert.equal(report.batch5.zuoyiAfterReload.colorPixelsSha256,report.batch5.zuoyi.colorPixelsSha256);assert.equal(report.batch5.zuoyiAfterReload.normalPixelsSha256,report.batch5.zuoyi.normalPixelsSha256);}}
  system.setEnabled(false);for(let i=0;i<10;i++)await tick();assert.equal(observer.submitted.length,0);assert.equal(system.world.work.jobs.size,0);system.setEnabled(true);await settle(registry.actors.map(a=>a.id));assert.equal(system.manager.stats.loaded,108);assert.equal(system.manager.stats.errors,0);report.offOn={registered:system.manager.stats.registered,ready:system.manager.stats.loaded,errors:system.manager.stats.errors,contentApproved:system.snapshot().contentApproved};
  }
  }
  qaCheckpoint(phase==='B'?'B-paths-and-six-zone-lifecycle':'independent-B-views-complete');
  qaCheckpoint('teleport-import-before');
  const hook=registerHooks({load(u,c,n){return n(u,u.endsWith('.json')?{...c,importAttributes:{...c.importAttributes,type:'json'}}:c);}});let Teleport;try{({Teleport}=await import('../src/ui/Teleport.js'));}finally{hook.deregister();}
  teleport=new Teleport({setPosition(){},lookAt(){}},W.zoneManager,W.cm);qaCheckpoint('teleport-created');
  if(phase==='B'){
  report.batch1={scope:'Five bounded A work items, not all37 completion or browser acceptance',zhendu:measuredQa('zhendu',()=>assertZhenduInWorld(W)),taihemen:measuredQa('taihemen',()=>assertTaihemenInWorld(W)),wumenNorth:measuredQa('wumen-north',()=>evaluateWumenNorthPortals(W)),wumenSouth:measuredQa('wumen-south',()=>evaluateWumenSouthCanopies(W))};
  assert.equal(report.batch1.wumenNorth.pass,true,JSON.stringify(report.batch1.wumenNorth));assert.equal(report.batch1.wumenSouth.pass,true,JSON.stringify(report.batch1.wumenSouth));
  let firewallProfile;W.scene.traverse(o=>{for(const p of [o.userData.structure,...(o.userData.architecture??[])])if(p?.objectId==='FC-1ABC6622CB')firewallProfile=p;});
  report.batch1.firewall=measuredQa('taihe-east-firewall',()=>evaluateTaiheEastFirewall(W,{profile:firewallProfile,resolvedBindings:[...system.manager.states.values()],expectedActorIds:registry.actors.map(a=>a.id)}));assert.equal(report.batch1.firewall.pass,true,JSON.stringify(report.batch1.firewall));
  report.batch1.zhenduRoutes=[];for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])for(const from of['front','rear']){const r=replayZhenduRoute(t,W,{fps,sprint,backward,from});report.batch1.zhenduRoutes.push({fps,sprint,backward,from,arrived:r.arrived,startFeet:r.startFeet,end:r.end,frames:r.frames.length,support:r.support});;qaMockScope.release('route-consumers-32804');}
  assert.deepEqual(W.cm.colliders.filter(c=>c.overhead).map(c=>c.overhead.sourceId).sort(),['axis/wumen-north-head/-17.5','axis/wumen-north-head/0','axis/wumen-north-head/17.5']);
  const northTriangles=captureWumenNorthHeadTriangles(W);report.batch1.wumenJumps=[];
  for(const direction of[-1,1])for(const mode of['stationary','walk','diagonal']){const r=replayWumenNorthJump(t,W,{fps:60,direction,mode,x:3.999,triangles:northTriangles,warmupSeconds:mode==='stationary'?0:.25});report.batch1.wumenJumps.push(r);assert.equal(r.pass,true,JSON.stringify(r));;qaMockScope.release('route-consumers-33363');}
  let gateSouth;W.scene.traverse(o=>{if(o.userData.taihemenSouth)gateSouth=o.userData.taihemenSouth;});assert.ok(gateSouth);
  const gateData=PALACE_LAYOUT.find(p=>p.name==='太和门'),f=gateSouth.flights[1],eave=gateData.position.z-gateData.dimensions.depth/2,porch=eave+2.3;
  const gateGo=[[0,gateSouth.zToe-3],[f.centerX,gateSouth.zToe-3],[f.centerX,gateSouth.zEdge],[f.centerX,porch],[-16.02,porch],[16.02,porch],[0,porch],[0,gateData.position.z+22]];
  report.batch1.taihemenImperialNegative=replayTerrace(t,W,[[0,gateSouth.zToe-3],[0,gateSouth.zEdge+1]],{fps:10,sprint:true,recordFrames:true});assert.equal(report.batch1.taihemenImperialNegative.arrived,false);assert.ok(report.batch1.taihemenImperialNegative.maxFeet<.1,'Retained central imperial stone is not a false walkable shortcut');
  report.batch1.firewallController=[];report.batch1.taihemenController=[];
  for(const fps of[10,60])for(const sprint of[false,true]){
    const p=firewallProfile.passage,fp=[[p.centerX,firewallProfile.z-4],[p.centerX,firewallProfile.z+4],[p.centerX,firewallProfile.z-4]],fr=replayTerrace(t,W,fp,{fps,sprint,recordFrames:true});report.batch1.firewallController.push({fps,sprint,...fr});assert.equal(fr.arrived,true,JSON.stringify(fr));assert.ok(fr.frames.every(f=>Math.abs(f.feet-p.floorY)<1e-8),'firewall actual control floor');
    const trace=traceTerraceGround(W.cm,gateSouth);let tr;try{tr=replayTerrace(t,W,[...gateGo,...gateGo.slice(0,-1).reverse()],{fps,sprint,recordFrames:true});assert.ok(trace.samples.every(s=>!['rescue','unverified'].includes(s.source)));;qaMockScope.release('route-consumers-34957');}finally{trace.restore();}report.batch1.taihemenController.push({fps,sprint,...tr});assert.equal(tr.arrived,true,JSON.stringify(tr));assert.ok(Math.abs(tr.maxFeet-3.44)<.04);assert.ok(Math.abs(tr.end[2])<1e-8);
  ;qaMockScope.release('route-consumers-34499');}

  const axis=JSON.parse(fs.readFileSync('data/zones/axis-courts.json'));
  const xiheItem=axis.items.find(i=>i.gateProfile==='xihe'),tirenItem=axis.items.find(i=>i.pavilionProfile==='tiren');assert.ok(xiheItem&&tirenItem);
  report.batch2={scope:'Five bounded changes only; no whole-object or A37/browser acceptance',walkingBeasts:assertThreeHallWalkingBeastsInWorld(W),baoheDais:assertBaoheDaisInWorld(W),xihe:assertXiheCorbelsInWorld(W,xiheItem),tiren:assertTirenLeavesInWorld(W,tirenItem),baoheRoutes:[],facadeRoutes:[]};
  for(const side of[-1,0,1])for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])for(const diagonal of[false,true]){
    report.batch2.baoheRoutes.push({...replayBaoheDaisRoute(t,W,{side,fps,sprint,backward,diagonal}),inputKeys:backward?'S':'W',diagonalMeaning:'geometrically oblique waypoints, not simultaneous W+D/S+D inputs'});
  ;qaMockScope.release('route-consumers-36027');}
  const xg=sideGateGeometry(xiheItem),tg=pavilionGeometry(tirenItem),routes=[];
  for(const portal of xg.portals){const front=xg.ramps[0],rear=xg.ramps[1],z=[front.zToe-1,front.zTop,-xg.depth/2,0,xg.depth/2,rear.zTop,rear.zToe+1],go=z.map(z=>xg.toWorld(portal.centerX,z));routes.push({id:'xihe-'+portal.bay,points:[...go,...go.slice(0,-1).reverse()]});}
  for(const side of['frontLeft','frontRight']){const go=tg.approaches[side].worldPoints.map(p=>[p.x,p.z]);routes.push({id:'tiren-'+side,points:[...go,...go.slice(0,-1).reverse()]});}
  for(const route of routes)for(const fps of[10,60])for(const sprint of[false,true]){const result=replayTerrace(t,W,route.points,{fps,sprint,recordFrames:true}),head=assertCourtRouteHeadClearance(W,result);assert.ok(Math.abs(result.end[2])<1e-6);report.batch2.facadeRoutes.push({id:route.id,fps,sprint,arrived:result.arrived,frames:result.frames.length,...head});;qaMockScope.release('route-consumers-36868');}
  report.changchun=assertChangchunEastInWorld(W); // Unchanged R54 component; earlier controller-route evidence retained, not rerun.
  report.jiaotai=assertJiaotaiDisplayInWorld(W,{teleport,registry});
  const zBaseline=JSON.parse(fs.readFileSync('tests/fixtures/r55-zhonghe-fullworld-landing.json')).result;assert.deepEqual(Object.fromEntries(Object.entries(teleport.geometryFor('中和殿')).map(([k,v])=>[k,Object.is(v,-0)?0:v])),zBaseline.geometry);const zPreferred=teleport.landingFor('中和殿');assert.equal(teleport.isSafe(zPreferred,teleport.geometryFor('中和殿')),zBaseline.preferredSafe);assert.deepEqual(zPreferred,zBaseline.preferred);
  report.zhonghe=assertZhongheDisplayInWorld(W,{teleport,registry,expectedLanding:zBaseline.landing});
  report.newPhysical=evaluateR57PhysicalClearance(W,{system});assert.equal(report.newPhysical.pass,true,JSON.stringify(report.newPhysical));
  const staff=await proveR57Staff(W,{system,observer,out:out+'/staff-proof.json.gz',geometryOut:'/tmp/r58-a-batch5-staff-geometry'});assert.equal(staff.success,true);report.staffProof={success:true,reportPath:out+'/staff-proof.json.gz',gzipSha256:hash(out+'/staff-proof.json.gz'),views:staff.views.length,routes:staff.motion.length,physicalRoles:staff.physical.length};
  // The unchanged R53 rooms retain their exact component audits. Their earlier
  // controller paths are not re-run as a fictitious new architecture change.
  }
  W.rooms=W.zoneManager.allRooms;report.rooms={yangxinB:auditYangxinWorld(W,{layer:'B'}),shoukangB:assertShoukangEastInWorld(W),arrivals:verifySouthernMapArrivals(W,teleport,['养心殿','寿康宫','慈宁宫','寿安宫','养性殿','乐寿堂','景福宫','重华宫'])};assert.equal(report.rooms.yangxinB.ok,true);
  const independentBefore=new Map(registry.actors.map(a=>[a.id,system.world.getRevision(a)]));
  const beforeS={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length};
  report.kunning={B:await assertKunningStovesInWorld(W,{interiors,layer:'B'})};
  interiors.gltf.load=(url,ok,_progress,error)=>{const id=[...interiors.halls.keys()].find(id=>url===`${interiors.base}${interiors.halls.get(id).cfg.model}`);assert.ok(id,'Exact configured model URL, not a generic successful stand-in');const decoder={yangxin:actualYangxinRoot,kunning:actualKunningRoot,huangji:actualHuangjiRoot}[id];assert.ok(decoder);decoder().then(root=>ok({scene:root}),error);};
  if(phase==='yangxin'){
  assert.equal(await interiors.load('yangxin'),true);interiors.update({x:108.6,z:277.5},performance.now()+500);W.scene.updateMatrixWorld(true);
  assert.equal(W.cm.colliders.length,beforeS.colliders+10);assert.equal(interiors.halls.get('yangxin').fade,null);
  report.rooms.yangxinS=auditYangxinWorld({...W,rooms:W.zoneManager.allRooms},{layer:'S'});assert.equal(report.rooms.yangxinS.ok,true);report.rooms.shoukangWhileYangxinS=assertShoukangEastInWorld(W);
  const sStart=report.views.length;report.rooms.sRebindFrames=await settle(registry.actors.map(a=>a.id));await verifyRoleViews('S-Yangxin/');
  report.rooms.generationTransitions=registry.actors.map(a=>{const before=independentBefore.get(a.id),loaded=system.world.getRevision(a),state=system.manager.states.get(a.id);assert.notEqual(loaded,before);assert.equal(state.revision,loaded);assert.equal(state.binding.status,'ready');return{id:a.id,before,loaded};});
  const sIds=[...new Set(report.views.slice(sStart).flatMap(v=>v.actors.map(a=>a.id)))].sort();assert.deepEqual(sIds,registry.actors.map(a=>a.id).sort());
  report.rooms.sVisibleIds=sIds;report.rooms.sModelSha256=hash('public/models/interiors/yangxin.glb');report.rooms.sBoundary='Actual GLB decoded by checked-in Draco JS; real InteriorLoader load/fade/unload and actual CollisionManager; texture loading, browser and GPU are not exercised.';
  interiors.unload('yangxin');W.scene.updateMatrixWorld(true);assert.deepEqual({colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},beforeS);await settle(registry.actors.map(a=>a.id));assert.equal(system.manager.stats.loaded,108);assert.equal(system.manager.stats.errors,0);report.rooms.returnToB={ready:108,errors:0,audit:auditYangxinWorld({...W,rooms:W.zoneManager.allRooms},{layer:'B'})};assert.equal(report.rooms.returnToB.audit.ok,true);
  }
  if(phase==='kunning'){
  const beforeKunning={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},beforeKunningGenerations=new Map(registry.actors.map(a=>[a.id,system.world.getRevision(a)]));
  assert.equal(await interiors.load('kunning'),true);interiors.update({x:-5,z:386.1},performance.now()+500);W.scene.updateMatrixWorld(true);
  assert.equal(W.cm.colliders.length,beforeKunning.colliders+8);assert.equal(W.cm.walkables.length,beforeKunning.walkables);
  report.kunning.S=await assertKunningStovesInWorld(W,{interiors,layer:'S'});report.kunning.rebindFrames=await settle(registry.actors.map(a=>a.id));
  report.kunning.generationTransitions=registry.actors.map(a=>{const revision=system.world.getRevision(a),state=system.manager.states.get(a.id);assert.notEqual(revision,beforeKunningGenerations.get(a.id),a.id+' fresh Kunning S generation');assert.equal(state.revision,revision);assert.equal(state.binding.status,'ready');return{id:a.id,before:beforeKunningGenerations.get(a.id),loaded:revision};});
  const kStart=report.views.length;await verifyRoleViews('S-Kunning/');report.kunning.individuallyVisibleIds=[...new Set(report.views.slice(kStart).flatMap(v=>v.actors.map(a=>a.id)))].sort();assert.deepEqual(report.kunning.individuallyVisibleIds,registry.actors.map(a=>a.id).sort());
  interiors.unload('kunning');W.scene.updateMatrixWorld(true);assert.deepEqual({colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},beforeKunning);report.kunning.returnToB=await assertKunningStovesInWorld(W,{interiors,layer:'B'});report.kunning.returnRebindFrames=await settle(registry.actors.map(a=>a.id));
  for(const a of registry.actors){const revision=system.world.getRevision(a),state=system.manager.states.get(a.id);assert.notEqual(revision,report.kunning.generationTransitions.find(r=>r.id===a.id).loaded);assert.equal(state.revision,revision);assert.equal(state.binding.status,'ready');}assert.equal(system.manager.stats.loaded,108);assert.equal(system.manager.stats.errors,0);
  report.kunning.boundary='Actual final GLB bytes through the unchanged production InteriorLoader and same-world CollisionManager. All108 fresh bindings and individual CPU triangle visibility after S load; exact B physical registrations and fresh bindings after unload. Not network, texture, browser/GPU or phone acceptance.';
  }
  if(phase==='huangji'){
  // First-ever actual actors in Ningshou are exercised against its own real S asset.
  report.huangji={B:await auditHuangjiLoadedInWorld(W,{interiors,layer:'B'})};
  const beforeHuangji=new Map(registry.actors.map(a=>[a.id,system.world.getRevision(a)]));
  assert.equal(await interiors.load('huangji'),true);interiors.update({x:-293.2,z:287.7},performance.now()+500);W.scene.updateMatrixWorld(true);
  report.huangji.S=await auditHuangjiLoadedInWorld(W,{interiors,layer:'S'});report.huangji.rebindFrames=await settle(registry.actors.map(a=>a.id));
  report.huangji.generationTransitions=registry.actors.map(a=>{const state=system.manager.states.get(a.id),current=system.world.getRevision(a);assert.notEqual(current,beforeHuangji.get(a.id));assert.equal(state.revision,current);assert.equal(state.binding.status,'ready');return{id:a.id,before:beforeHuangji.get(a.id),loaded:current};});
  const hStart=report.views.length;await verifyRoleViews('S-Huangji/');report.huangji.individuallyVisibleIds=[...new Set(report.views.slice(hStart).flatMap(v=>v.actors.map(a=>a.id)))].sort();assert.deepEqual(report.huangji.individuallyVisibleIds,registry.actors.map(a=>a.id).sort());
  interiors.unload('huangji');W.scene.updateMatrixWorld(true);report.huangji.returnToB=await auditHuangjiLoadedInWorld(W,{interiors,layer:'B'});report.huangji.returnRebindFrames=await settle(registry.actors.map(a=>a.id));
  for(const a of registry.actors){const state=system.manager.states.get(a.id),current=system.world.getRevision(a);assert.notEqual(current,report.huangji.generationTransitions.find(r=>r.id===a.id).loaded);assert.equal(state.revision,current);assert.equal(state.binding.status,'ready');}
  report.huangji.boundary='Actual configured Huangji GLB through unchanged production InteriorLoader, not another palace stand-in. Native atomic fallback swap, all108 fresh generations and actual per-role CPU triangle visibility. Not browser/GPU.';
  }
  if(phase!=='B'){
   assert.deepEqual({colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},beforeS);
   report.returnToB={rebindFrames:await settle(registry.actors.map(a=>a.id)),generations:[]};
   const loadedRows=phase==='yangxin'?report.rooms.generationTransitions:report[phase].generationTransitions;
   for(const a of registry.actors){const state=system.manager.states.get(a.id),revision=system.world.getRevision(a),loaded=loadedRows.find(r=>r.id===a.id).loaded;assert.equal(state.binding.status,'ready');assert.equal(state.revision,revision);assert.notEqual(revision,loaded);report.returnToB.generations.push({id:a.id,loaded,returned:revision});}
   const viewStart=report.views.length;await verifyRoleViews('Returned-B/');report.returnToB.individuallyVisibleIds=[...new Set(report.views.slice(viewStart).flatMap(v=>v.actors.map(a=>a.id)))].sort();assert.deepEqual(report.returnToB.individuallyVisibleIds,registry.actors.map(a=>a.id).sort());
   assert.deepEqual(assertR60CInWorld(W),report.r60c.initial);
  }
  for(const hall of interiors.halls.values()){assert.equal(hall.state,'idle');assert.equal(hall.group,null);}
  report.cleanedS={loaded:interiors.stats.loaded,states:[...interiors.halls].map(([id,h])=>({id,state:h.state,attached:h.group?.parent!==undefined&&h.group?.parent!==null}))};assert.deepEqual(report.cleanedS.loaded,[]);
  report.viewFailures=report.views.filter(v=>!v.pass).map(v=>({label:v.label,cameraCollision:v.cameraCollision,actors:v.actors.map(a=>({id:a.id,visible:a.rays.visible,contactFailure:a.contactFailure,blockers:[...new Set(a.rays.hits.filter(h=>!h.visible).map(h=>h.first?.name))]}))}));assert.deepEqual(report.viewFailures,[],'Every individual role must have an actually clear legal view');
  assert.equal(sourceFingerprint(process.cwd()),report.sourceFingerprint);report.finalSourceHashes=hashes();assert.deepEqual(report.finalSourceHashes,report.sourceHashes);system.setEnabled(false);for(let i=0;i<12;i++)await tick();assert.equal(observer.submitted.length,0);assert.equal(system.world.work.jobs.size,0);report.finalOff={instances:0,queuedJobs:0};report.success=true;qaCheckpoint('all-assertions-finished');
 ;qaMockScope.release('route-consumers-15972');}finally{fs.writeFileSync(out+'/one-world-validation.json.gz',gzipSync(JSON.stringify(report,null,2)+'\n'));teleport?.dispose();observer.dispose();system.dispose();interiors.dispose();W.dispose();}
});
