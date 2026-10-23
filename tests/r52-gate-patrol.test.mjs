// R52 current-registry revalidation. Frozen47-person evidence remains untouched.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import * as T from 'three';
import {CHARACTER_REGISTRY} from '../data/characters/index.js';
import {CharacterSystem} from '../src/scene/characters/CharacterSystem.js';
import {deformCharacterVertex} from '../src/scene/characters/CharacterAnimation.js';
import {characterEnvironmentMotion} from '../src/scene/characters/CharacterBehavior.js';
import {createCharacterGeometry} from '../src/scene/characters/CharacterKit.js';
import {validateCharacterRegistry} from '../src/scene/characters/CharacterSchema.js';
import {eastWestCityGateGeometry} from '../src/scene/palace/special/EastWestCityGate.js';
import {sideGateGeometry} from '../src/scene/palace/special/SideGateProfiles.js';
import {exportProductionView} from './lib/r51-production-raster.mjs';
import {buildGatePatrolWorld} from './lib/r52-gate-patrol-fixture.mjs';
import {assertSubmittedVisibility} from './lib/r52-submission-visibility.mjs';
import {withCourtLifeFragment,assertOriginal38} from './lib/r52-court-registry.mjs';
import {submissionBatchKey} from './lib/r52-submission-batch-key.mjs';
const out='reports/r52-gate-patrol-revalidation';fs.mkdirSync(out,{recursive:true});
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const fragmentPath='reports/r52-gate-patrol/registry-fragment.json';
const fragment=JSON.parse(fs.readFileSync(fragmentPath)),registry=withCourtLifeFragment(CHARACTER_REGISTRY,fragment);
const originals=JSON.stringify(CHARACTER_REGISTRY),schema=validateCharacterRegistry(registry);assert.equal(schema.valid,true,JSON.stringify(schema.errors));assert.equal(schema.counts.registered,registry.actors.length);assert.ok(schema.counts.registered>=47);assertOriginal38(registry);
const expectedIds=['donghua-guard-north-01','donghua-guard-south-01','xihua-guard-north-01','xihua-guard-south-01','longzong-guard-north-01','longzong-guard-south-01','east-lane-guard-01','east-lane-guard-02','east-lane-guard-03'];assert.deepEqual(fragment.actors.map(a=>a.id),expectedIds);
for(const a of fragment.actors){assert.equal(a.required,true);assert.equal(a.templateId,'guard-duty');assert.equal(a.schedule,'guard-duty');}
const sources=['main.js','src/scene/Environment.js','src/scene/zones/ZoneManager.js','src/scene/zones/ZoneBase.js','src/scene/characters/CharacterSystem.js','src/scene/characters/CharacterWorldAdapter.js','src/scene/characters/CharacterManager.js','src/scene/characters/CharacterRenderer.js','src/scene/characters/CharacterKit.js','src/scene/characters/CharacterAnimation.js','src/scene/characters/PatrolController.js','src/scene/characters/CharacterLOD.js','src/scene/palace/special/EastWestCityGate.js','src/scene/palace/special/SideGateProfiles.js','src/utils/Collision.js','data/zones/outer-east.json','data/zones/outer-west.json','data/zones/axis-courts.json','data/zones/east-six.json'];
assert.equal(hash('src/scene/characters/CharacterSystem.js'),'0e5764c8ac4b5417e5c4e2ab2b2d45876323da99b0f59c9a12fe9d7ea9be22a3');
const report={kind:'Full production static geometry, real all-zone ZoneManager, CollisionManager, Environment ground and actual System/Manager/Renderer CPU diagnostic. NOT browser/WebGL/GPU/mobile/texture/history acceptance.',baselineCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),fragmentSha256:hash(fragmentPath),sourceHashes:Object.fromEntries(sources.map(p=>[p,hash(p)])),schema,original38Unchanged:false,bindings:[],gateClearance:[],views:[],lifecycle:[],motion:null};
const W=await buildGatePatrolWorld(),camera=new T.PerspectiveCamera(65,16/9,.1,1600);camera.position.set(-120.8,1.7,393);camera.lookAt(-120.8,.9,378);camera.updateMatrixWorld(true);
const system=new CharacterSystem({scene:W.scene,camera,collisionManager:W.cm,zoneManager:W.zoneManager,registry});assert.equal(system.validation.valid,true);
const beforeCollision={colliders:W.cm.colliders.length,walkables:W.cm.walkables.length},submitted=[];
let current=[];const actualRender=system.renderer.render.bind(system.renderer);
system.renderer.render=(actors,context)=>{current=actors.map(a=>({...a,position:[...a.position],animation:{...a.animation}}));return actualRender(actors,context);};
const step=async(dt=1/60,quality='high',daylight=1)=>{system.update(dt,{quality,daylight,viewportHeight:1080});await Promise.resolve();assert.equal(system.lastError,null);assert.ok(system.manager.stats.near<=2);assert.ok(current.length<=(quality==='low'?32:64));assert.equal(new Set(current.map(a=>a.id)).size,current.length);};
async function settled(ids=expectedIds,{render=false,max=20000,dt=1/60,quality='high',daylight=1}={}){for(let n=0;n<max;n++){await step(dt,quality,daylight);if(ids.every(id=>{const s=system.manager.states.get(id);return s?.binding?.status==='ready'&&s.readiness===1&&(!render||current.some(a=>a.id===id));}))return n+1;}throw Error('Did not settle '+JSON.stringify({ids,states:ids.map(id=>{const s=system.manager.states.get(id);return{id,error:s?.error,pending:s?.pending,binding:s?.binding?.status,readiness:s?.readiness};}),work:system.world.work.snapshot()}));}
function aim(pos,target){camera.position.fromArray(pos);camera.lookAt(...target);camera.updateMatrixWorld(true);assert.equal(W.cm.checkCollision(camera.position,.5),false,'legal camera collision');const support=system.world.supportAt([pos[0],0,pos[2]],0,.03,{renderedOnly:true});assert.equal(support.status,'ready','camera actual ground support');}
function submittedMesh(id,{requireFullVisibility=true}={}){
 const actor=current.find(a=>a.id===id);assert.ok(actor,'actual Manager submitted '+id);
 const key=submissionBatchKey(actor),peers=current.filter(a=>submissionBatchKey(a)===key),ii=peers.findIndex(a=>a.id===id),batch=system.renderer.batches.get(key);assert.ok(batch,'actual Renderer batch');assert.ok(ii<batch.mesh.count);
 const matrix=new T.Matrix4();batch.mesh.getMatrixAt(ii,matrix);const p=new T.Vector3().setFromMatrixPosition(matrix);assert.ok(p.distanceTo(new T.Vector3(...actor.position))<1e-4);assertSubmittedVisibility(batch.mesh.geometry.attributes.characterVisibility.getX(ii),{requireFullVisibility});
 const g=batch.mesh.geometry.clone(),a=g.attributes,stream=batch.mesh.geometry.attributes.characterAnim,animation={time:system.renderer.timeUniform.value,phase:stream.getX(ii),amplitude:stream.getY(ii),walkSpeed:stream.getZ(ii),poseIndex:stream.getW(ii)};
 for(let i=0;i<a.position.count;i++){const d=deformCharacterVertex([a.position.getX(i),a.position.getY(i),a.position.getZ(i)],[a.normal.getX(i),a.normal.getY(i),a.normal.getZ(i)],{part:a.characterPart.getX(i),pivot:[a.characterPivot.getX(i),a.characterPivot.getY(i),a.characterPivot.getZ(i)],weight:a.characterWeight.getX(i),torsoWeight:a.characterTorsoWeight.getX(i)},animation);a.position.setXYZ(i,...d.position);a.normal.setXYZ(i,...d.normal);}
 g.computeBoundingBox();g.computeBoundingSphere();const mesh=new T.Mesh(g,system.renderer.material);mesh.name=id;mesh.matrix.multiplyMatrices(batch.mesh.matrixWorld,matrix);mesh.matrix.decompose(mesh.position,mesh.quaternion,mesh.scale);mesh.updateMatrixWorld(true);
 return{mesh,actor,batchKey:key,instanceIndex:ii,visibility:batch.mesh.geometry.attributes.characterVisibility.getX(ii),animation};
}
function triangleEvidence(id){
 W.scene.updateMatrixWorld(true);const target=submittedMesh(id),g=target.mesh.geometry,a=g.attributes.position,ix=g.index,A=new T.Vector3(),B=new T.Vector3(),C=new T.Vector3(),N=new T.Vector3(),candidates=[];
 for(let k=0;k<(ix?.count??a.count);k+=3){A.fromBufferAttribute(a,ix?ix.getX(k):k);B.fromBufferAttribute(a,ix?ix.getX(k+1):k+1);C.fromBufferAttribute(a,ix?ix.getX(k+2):k+2);N.subVectors(B,A).cross(new T.Vector3().subVectors(C,A));if(N.z<=0)continue;candidates.push({triangle:k/3,local:A.clone().add(B).add(C).multiplyScalar(1/3)});}
 const blockers=[];W.scene.traverse(o=>{if(!o.isMesh||o.userData.characterBatch)return;for(let p=o;p;p=p.parent)if(!p.visible)return;blockers.push(o);});
 const others=current.filter(a=>a.id!==id).map(a=>submittedMesh(a.id,{requireFullVisibility:false}).mesh),ray=new T.Raycaster(),hits=[];
 for(const fraction of [.25,.55,.85])for(const x of [-.12,0,.12]){const y=g.boundingBox.min.y+fraction*(g.boundingBox.max.y-g.boundingBox.min.y),chosen=candidates.reduce((b,v)=>{const score=(v.local.y-y)**2+(v.local.x-x)**2+.01*(g.boundingBox.max.z-v.local.z)**2;return !b||score<b.score?{...v,score}:b;},null),p=target.mesh.localToWorld(chosen.local.clone()),d=p.clone().sub(camera.position);ray.set(camera.position,d.clone().normalize());ray.near=.001;ray.far=d.length()+.01;const own=ray.intersectObject(target.mesh,false)[0],first=ray.intersectObjects([...blockers,...others,target.mesh],false)[0];assert.ok(own,'real target triangle intersection');hits.push({fraction,lateralMeters:x,targetTriangle:chosen.triangle,target:p.toArray(),clear:first?.object===target.mesh,first:first?{name:first.object.name,material:first.object.material?.name,distanceMeters:first.distance,point:first.point.toArray()}:null});}
 const result={id,position:target.actor.position,rotationYRad:target.actor.rotationYRad,lod:target.actor.lod,batchKey:target.batchKey,instanceIndex:target.instanceIndex,visibility:target.visibility,animation:target.animation,clearTargets:hits.filter(h=>h.clear).length,totalTargets:hits.length,hits};target.mesh.geometry.dispose();for(const m of others)m.geometry.dispose();return result;
}
async function view(id,label=id,{distance=3,side=0,exportImage=true,quality='high',daylight=1}={}){
 const st=system.manager.states.get(id),a=st.actor,s=st.patrol?.sample(system.manager.simulationSeconds,a.behavior.followerIndex??0)??st.binding,h=s.rotationYRad,p=s.position;
 aim([p[0]+Math.sin(h)*distance+Math.cos(h)*side,1.7,p[2]+Math.cos(h)*distance-Math.sin(h)*side],[p[0],.9,p[2]]);
 // dt=0 preserves the sampled production pose/position and still updates LOD.
 await step(0,quality,daylight);assert.ok(current.some(a=>a.id===id));const evidence=triangleEvidence(id);assert.ok(evidence.clearTargets>=6,JSON.stringify(evidence));
 const row={label,quality,daylight,camera:camera.position.toArray(),cameraCollision:false,simulationSeconds:system.manager.simulationSeconds,submittedIds:current.map(a=>a.id),nearIds:[...system.manager.nearIds],stats:{...system.manager.stats},target:evidence};
 if(exportImage)row.geometryExport=exportProductionView({scene:W.scene,camera,characters:system},`${out}/${label}.json.gz`,{far:55});
 report.views.push(row);console.log('VIEW '+JSON.stringify({label,targets:evidence.clearTargets,submitted:row.submittedIds,lod:evidence.lod}));return row;
}
try{
 report.settleFrames=await settled();report.fullRegistryStatus=system.snapshot();
 report.world={...beforeCollision,zones:[...W.zoneManager.loaded.keys()],source:'real ZoneManager.init/loadZone with production ZoneBase; buildWorld static PalaceBuilder/Enclosure/GardenBuilder; production Environment.setupGround'};
 for(const a of fragment.actors){const b=system.manager.states.get(a.id).binding;report.bindings.push({id:a.id,...b});assert.equal(b.status,'ready');assert.equal(system.world._blockedSegment(b.position,b.position,.5,1.85),null);assert.ok(Math.abs(b.position[1])<.03);}
 for(const prefix of ['donghua','xihua','longzong']){const anchor=fragment.anchors.find(a=>a.id===prefix+'-gate'),resolved=system.world.resolveAnchor(anchor.id),item=W.zoneManager.zones.get(anchor.zoneRef).items.find(i=>i.name===anchor.building&&i.kind!=='region'),profile=item.kind==='cityGate'?eastWestCityGateGeometry(item):sideGateGeometry(item),members=fragment.actors.filter(a=>a.id.startsWith(prefix));
  for(const a of members){const [x,,z]=a.placement.offsetMeters;const intervals=profile.portalCenters.map((p,i)=>({min:p-(profile.portalWidth??profile.portals[i].clearWidth)/2,max:p+(profile.portalWidth??profile.portals[i].clearWidth)/2}));const corridorClearance=Math.min(...intervals.map(v=>x<v.min?v.min-x:x>v.max?x-v.max:-1));assert.ok(corridorClearance>.5);if(prefix==='longzong')assert.ok(Math.abs(x)-7.6>.5);else assert.ok(Math.abs(z)-profile.depth/2>.5);report.gateClearance.push({id:a.id,sourceAnchor:resolved,sourceProfile:profile,doorPathLateralClearanceMeters:corridorClearance,bodyRadiusPlusMarginMeters:.5,bodyAvoidsAllDoorPaths:true});}
  const north=system.manager.states.get(prefix+'-guard-north-01').binding.position,south=system.manager.states.get(prefix+'-guard-south-01').binding.position;assert.ok(north[2]>south[2],'north/south identity after actual rotation');
 }
 for(const id of expectedIds.slice(0,6))await view(id);
 const leader=system.manager.states.get('east-lane-guard-01'),path=leader.binding.path,patrol=leader.patrol;assert.equal(path.samples.length,107);assert.ok(path.samples.slice(1).every((s,i)=>s.distanceMeters-path.samples[i].distanceMeters<=.2500001));
 const geometry=createCharacterGeometry('guard-duty','standing',0),ga=geometry.attributes;let maxRadius=0,maxY=0;const animationEnvelope=[];
 for(let n=0;n<=96;n++){const t=2*patrol.cycleSeconds*n/96;for(const a of fragment.actors.slice(6)){const anim=characterEnvironmentMotion(a,t,.75);let radius=0,height=0;for(let v=0;v<ga.position.count;v++){const d=deformCharacterVertex([ga.position.getX(v),ga.position.getY(v),ga.position.getZ(v)],[ga.normal.getX(v),ga.normal.getY(v),ga.normal.getZ(v)],{part:ga.characterPart.getX(v),pivot:[ga.characterPivot.getX(v),ga.characterPivot.getY(v),ga.characterPivot.getZ(v)],weight:ga.characterWeight.getX(v),torsoWeight:ga.characterTorsoWeight.getX(v)},anim).position;radius=Math.max(radius,Math.hypot(d[0],d[2]));height=Math.max(height,d[1]);}maxRadius=Math.max(maxRadius,radius);maxY=Math.max(maxY,height);animationEnvelope.push({id:a.id,time:t,radius,height});}}
 geometry.dispose();assert.ok(maxRadius<.38);assert.ok(maxY<1.85);
 for(const s of path.samples){assert.equal(system.world._blockedSegment(s.position,s.position,.5,1.85),null);assert.equal(W.zoneManager.findZone(s.position[0],s.position[2]),'east-six');}
 // Production System owns time and production PatrolController owns formation.
 // Observe two complete periods at 0.1 simulated-second steps, with every member
 // swept between consecutive positions (at most .075 m movement per step).
 const motionRows=[],motionStart=system.manager.simulationSeconds,stages=new Set();let previous=null,maxStep=0,minSpacing=Infinity;
 aim([-123.6,1.7,376],[-120.8,.9,376]);
 for(let frame=0;system.manager.simulationSeconds-motionStart<2*patrol.cycleSeconds+.1;frame++){
  await step(.1);const samples=fragment.actors.slice(6).map(a=>{const s=system.manager.states.get(a.id);assert.ok(s.patrol);const p=s.patrol.sample(system.manager.simulationSeconds,a.behavior.followerIndex);stages.add(p.stage);assert.equal(system.world._blockedSegment(p.position,p.position,.5,1.85),null);return{id:a.id,...p};});
  for(let i=1;i<3;i++){const arc=Math.abs(samples[i].distanceMeters-samples[i-1].distanceMeters);assert.ok(Math.abs(arc-1.4)<1e-9);minSpacing=Math.min(minSpacing,Math.hypot(...samples[i].position.map((v,k)=>v-samples[i-1].position[k])));}
  if(previous)for(let i=0;i<3;i++){const d=Math.hypot(...samples[i].position.map((v,k)=>v-previous[i].position[k]));maxStep=Math.max(maxStep,d);assert.ok(d<=.0750001);assert.equal(system.world._blockedSegment(previous[i].position,samples[i].position,.5,1.85),null);}
  motionRows.push({frame,time:system.manager.simulationSeconds,samples,submittedIds:current.map(a=>a.id)});previous=samples;
 }
 assert.deepEqual([...stages].sort(),['far-turn','near-turn','outbound','return']);assert.ok(minSpacing>2*maxRadius);
 report.motion={startSimulationSeconds:motionStart,durationSimulationSeconds:system.manager.simulationSeconds-motionStart,cycleSeconds:patrol.cycleSeconds,frames:motionRows.length,maxMovementPerStepMeters:maxStep,minCenterSpacingMeters:minSpacing,arcSpacingMeters:1.4,maximumSampledGeometryRadiusMeters:maxRadius,maximumSampledGeometryHeightMeters:maxY,bodySweepRadiusMeters:.5,bodySweepHeightMeters:1.85,turningRadiusMeters:path.turningRadiusMeters,stages:[...stages],rowFile:`${out}/motion-rows.json.gz`,animationEnvelopeSamples:animationEnvelope.length};fs.writeFileSync(report.motion.rowFile,gzipSync(JSON.stringify({motionRows,animationEnvelope})+'\n'));
 for(const id of expectedIds.slice(6))await view(id,id,{distance:3,side:2});
 // Quality and night keep all newly required guards and retain global budgets.
 for(const quality of ['high','low'])for(const daylight of [1,0]){await step(.1,quality,daylight);report.lifecycle.push({kind:'quality-night',quality,daylight,submittedIds:current.map(a=>a.id),stats:{...system.manager.stats}});assert.ok(current.some(a=>a.id.startsWith('east-lane-guard')));}
 // Twenty actual switch cycles and twenty real ZoneManager unload/rebuild
 // cycles. No synthetic generation or cached pre-resolved actor injection.
 for(let cycle=0;cycle<20;cycle++){
  const time=system.manager.simulationSeconds;system.setEnabled(false);assert.equal(system.renderer.batches.size,0);assert.equal(system.manager.stats.renderCopies,0);system.setEnabled(true);const onFrames=await settled(expectedIds);
  const oldGroup=W.zoneManager.loaded.get('east-six').data.group,oldGeneration=system.world.getGeneration('east-six');W.zoneManager.unloadZone('east-six');await step(0);assert.equal(system.manager.states.get('east-lane-guard-01').binding,null);assert.equal(current.some(a=>a.id.startsWith('east-lane-guard')),false);W.zoneManager.loadZone('east-six');W.scene.updateMatrixWorld(true);assert.notEqual(W.zoneManager.loaded.get('east-six').data.group,oldGroup);assert.notEqual(system.world.getGeneration('east-six'),oldGeneration);const reloadFrames=await settled(expectedIds);
  assert.equal(W.cm.colliders.length,beforeCollision.colliders);assert.equal(W.cm.walkables.length,beforeCollision.walkables);assert.equal(system.manager.states.size,registry.actors.length);
  report.lifecycle.push({kind:'off-on-and-zone-rebuild',cycle:cycle+1,timeBefore:time,timeAfter:system.manager.simulationSeconds,onFrames,reloadFrames,oldGeneration,newGeneration:system.world.getGeneration('east-six'),submittedIds:current.map(a=>a.id),stats:{...system.manager.stats},resources:system.pool.stats()});
 }
 // Every newly enabled static gate zone gets a real unload/rebuild as well.
 for(const zone of ['outer-east','outer-west','axis-courts']){const ids=fragment.actors.filter(a=>a.zoneRef===zone).map(a=>a.id),before=system.world.getGeneration(zone);W.zoneManager.unloadZone(zone);await step(0);for(const id of ids)assert.equal(system.manager.states.get(id).binding,null);W.zoneManager.loadZone(zone);W.scene.updateMatrixWorld(true);const frames=await settled(expectedIds);assert.notEqual(system.world.getGeneration(zone),before);assert.equal(W.cm.colliders.length,beforeCollision.colliders);assert.equal(W.cm.walkables.length,beforeCollision.walkables);report.lifecycle.push({kind:'gate-zone-rebuild',zone,ids,frames,before,after:system.world.getGeneration(zone)});}
 // All nine remain actual render submissions at legal nearby night viewpoints.
 for(const id of expectedIds)await view(id,'night-after-reloads-'+id,{side:id.startsWith('east-lane')?2:0,exportImage:false,daylight:0});
 await settled(registry.actors.map(a=>a.id));
 // Re-aim close at current real patrol after reload to prove fresh submissions.
 await view('east-lane-guard-01','east-patrol-after-20-reloads',{distance:3,side:2});
 report.original38Unchanged=JSON.stringify(CHARACTER_REGISTRY)===originals;assert.equal(report.original38Unchanged,true);report.finalStatus=system.snapshot();report.pass=true;
}finally{report.pass??=false;fs.writeFileSync(`${out}/verification.json`,JSON.stringify(report,null,2)+'\n');system.dispose();W.zoneManager.dispose();W.environment.dispose?.();}
console.log(JSON.stringify({pass:report.pass,added:9,originalsUnchanged:report.original38Unchanged,views:report.views.length,motion:report.motion,lifecycleCycles:report.lifecycle.filter(r=>r.kind==='off-on-and-zone-rebuild').length}));
