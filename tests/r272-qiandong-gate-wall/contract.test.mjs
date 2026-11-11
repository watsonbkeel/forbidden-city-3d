import test from 'node:test';
import assert from 'node:assert/strict';
import {requireReady,requireCaptureSet,requireCleanup,ROUTES,VIEWS,validateSourceOrder,contactState,observeFootContact} from './contract.mjs';
const hit=(y,sourceOwner='Environment.ground',meshUuid='ground',x=0,z=0,normalY=1)=>({sourceOwner,meshUuid,geometryUuid:meshUuid+'-geometry',faceIndex:0,point:[x,y,z],normalWorld:[0,normalY,0]});
function sample(x,z){
 const support={verified:true,kind:'ENVIRONMENT_TRIANGLE',meshUuid:'ground',geometryUuid:'ground-geometry',faceIndex:0,point:[x,0,z]};
 const surfaceInputs={upwardHits:[hit(0,'Environment.ground','ground',x,z)],downwardHits:[]};
 const surfaceObservation=observeFootContact({feet:0,logicalGroundY:0,airborne:false,...surfaceInputs});
 return {dt:1/60,position:[x,1.7,z],feet:0,logicalGroundY:0,airborne:false,verticalVelocity:0,onSupport:false,speed:0,bodyClear:true,support,surfaceInputs,surfaceObservation,contactState:surfaceObservation.contactState,feetAtLogicalGround:true,actualTriangleContact:surfaceObservation.actualTriangleContact,feetToRealTriangle:surfaceObservation.feetToRealTriangle};
}
function routeFixture(id){
 const points=[[0,0],[1,0],[1,1],[0,0]],samples=[sample(...points[0])],settlements=[];samples[0].dt=null;
 for(let waypoint=1;waypoint<points.length;waypoint++){
  const stableSampleIndices=[];for(let frame=0;frame<6;frame++){const s=sample(...points[waypoint]);s.settlingWaypoint=waypoint;stableSampleIndices.push(samples.length);samples.push(s);}
  const sampleIndex=samples.length-1,s=samples[sampleIndex];s.reachedWaypoint=waypoint;
  settlements.push({waypoint,target:[...points[waypoint]],position:s.position,feet:s.feet,logicalGroundY:s.logicalGroundY,reached:true,feetAtLogicalGround:true,actualTriangleContact:true,speed:0,support:s.support,surfaceObservation:s.surfaceObservation,stableFrames:6,stableSampleIndices,sampleIndex});
 }
 return {id,status:'PASS',plan:{id,points},initialization:{verified:true,kind:'INDEPENDENT_VERIFIED_START',position:samples[0].position,feet:0,support:samples[0].support},samples,reached:true,teleports:0,rescues:0,settlements};
}
// Synthetic pure receipt algebra only, never represented as real scene evidence.
const b=(x0,y0,z0,x1,y1,z1)=>({min:[x0,y0,z0],max:[x1,y1,z1]});
function wallFixture(){
 const owners=['item/15','item/17','item/36','item/38','item/42','item/43','item/44','item/45','item/46','item/47','item/48','item/58','new-body'].map(id=>({id,uuid:id+'-source',meshes:[]}));
 const record=(owner,uuid,bounds)=>{const row={uuid,bounds};owners.find(o=>o.id===owner).meshes.push(row);return row;};
 const cuts=[[-211,-145.2,6.5],[-138.8,-128.63727729556877,6.5],[-128.63727729556877,-119.1201461854728,4.5],[-113.1201461854728,-102.41388761991777,4.5],[-102.41388761991777,-74,6.5]];
 const frames=cuts.map(([x0,x1,h],i)=>{const red=record('item/43','red'+i,b(x0,1,465.5,x1,h,466.5)),brick=record('item/43','brick'+i,b(x0,0,465.44,x1,1,466.56)),cap=record('item/43','cap-mesh'+i,b(x0,h-.06,465.15,x1,h+.889,466.85));return {uuid:'frame'+i,bounds:b(x0,0,465.15,x1,h+.889,466.85),red,brick,cap:{uuid:'cap'+i,bounds:cap.bounds,meshIds:[cap.uuid]}};});
 for(const [i,x0,z0,x1,z1] of [[5,-211,519.5,-74,520.5],[6,-211.5,466,-210.5,520],[7,-74.5,466,-73.5,520]]){const vertical=i!==5,red=record('item/43','red'+i,b(x0,1,z0,x1,6.5,z1)),brick=record('item/43','brick'+i,b(x0-(vertical?.06:0),0,z0-(vertical?0:.06),x1+(vertical?.06:0),1,z1+(vertical?0:.06))),cap=record('item/43','cap-mesh'+i,b(x0-(vertical?.35:0),6.44,z0-(vertical?0:.35),x1+(vertical?.35:0),7.389,z1+(vertical?0:.35)));frames.push({uuid:'frame'+i,bounds:b(x0-(vertical?.35:0),0,z0-(vertical?0:.35),x1+(vertical?.35:0),7.389,z1+(vertical?0:.35)),red,brick,cap:{uuid:'cap'+i,bounds:cap.bounds,meshIds:[cap.uuid]}});}
 const roof=(owner,uuid,bounds)=>{const m=record(owner,uuid+'-mesh',bounds);m.envelope={uuid,kind:'roof'};return {owner,uuid,bounds,meshIds:[m.uuid]};};
 for(const f of frames)owners.find(o=>o.id==='item/43').meshes.find(m=>m.uuid===f.cap.meshIds[0]).envelope={uuid:f.cap.uuid,kind:'wall_cap'};
 const gateRoof=roof('item/58','gate-roof',b(-119.887,5.5612,464.018,-112.353,7.3324,467.982)),flanks=[record('item/58','flank0',b(-119.1201461854728,0,465.6,-117.8201461854728,5.8,466.4)),record('item/58','flank1',b(-114.4201461854728,0,465.6,-113.1201461854728,5.8,466.4))],header=record('item/58','head',b(-117.8201461854728,4.6,465.6,-114.4201461854728,5.8,466.4));
 const pair=(x,y0,y1,z0,z1,normal,id)=>{const vertices=[[x,y0,z0],[x,y1,z0],[x,y1,z1],[x,y0,z1]],tris=[[vertices[0],vertices[1],vertices[2]],[vertices[0],vertices[2],vertices[3]]];return tris.map(v=>({meshUuid:id,vertices:normal>0?v:[v[0],v[2],v[1]],normal:[normal,0,0]}));};
 const ends=[[-128.63727729556877,1,1,2],[-102.41388761991777,-1,4,3]].map(([x,sign,hi,lo])=>{const out={x};for(const [kind,i,n,h] of [['high',hi,sign,6.5],['low',lo,-sign,4.5]]){const f=frames[i],cap=[];for(let j=0;j<10;j++)cap.push(...pair(x,h-.06+j*.0949,h-.06+(j+1)*.0949,465.15,466.85,n,f.cap.meshIds[0]));out[kind]={frameUuid:f.uuid,red:pair(x,1,h,465.5,466.5,n,f.red.uuid),cap};}return out;});
 const neighborRoofs=['item/15','item/17','item/36','item/38'].map((id,i)=>roof(id,'neighbor'+i,b(-200+i*20,8,440,-190+i*20,11,460))),newRoofs=[gateRoof,...[0,1,2].map(i=>roof('new-body','new-roof'+i,b(-128+i*8,4,467.1,-123+i*8,5.85,480)))];
 const lowIds=frames.filter(f=>f.red.bounds.max[1]===4.5).flatMap(f=>[f.red.uuid,f.brick.uuid,...f.cap.meshIds]),pairs=lowIds.length*owners.filter(o=>!['item/43','item/58','new-body'].includes(o.id)).reduce((n,o)=>n+o.meshes.length,0);
 return {before:{owners,newMeshIds:owners.filter(o=>['new-body','item/58'].includes(o.id)).flatMap(o=>o.meshes.map(m=>m.uuid)),intersections:[]},wallEvidence:{loweredNeighborCheck:{meshIds:lowIds,pairs,positiveOverlaps:[]},sourceUuid:'item/43-source',frames,gate:{flanks,header,roof:gateRoof},ends,neighborRoofs,newRoofs,bottomCapRing:'UNKNOWN_NOT_REPAIRED',visualReview:'REQUIRED'}};
}

const fixture=()=>({identity:{head:'1'.repeat(40),tree:'2'.repeat(40),parent:'dbc141dde11a65d16e537be33b27a8f1b1aef127',parentTree:'486cc6861079eb0cb7e573d46496b1eb97a1365b',productTree:'5b63332d7287a87bf3bbf18febdf030e0b0dbdbd'},scope:'ACTUAL_EAST_SIX_FINITE_SCRIPTED_CONTROLLER',physicsConsumer:'PRODUCTION_FIRST_PERSON_SCRIPTED',errors:[],zone:{id:'east-six',items:60,normalFinish:true,defaultRivers:true},rooms:{prefixPreserved:true,newFinalThree:true,old:[{index:0,source:'items/44',record:{id:0,floorY:.45,doors:[{x:-83.7,z:498}]}}],new:['westWing','eastWing','northRoom']},oldGateCenterProbe:{kind:'INDEPENDENT_PRODUCTION_CONTROLLER_INITIALIZATION_NOT_ROUTE',sourceItemIndex:42,sourceItemPoint:[-142,466],sample:{...sample(-142,466),dt:null}},routes:ROUTES.map(routeFixture),structure:{...wallFixture(),beforeAfter:true,sourceLinks:true,groundBodySeparateFromRoof:true,measured:true},textures:{manifest:true,fallbacks:[],missingNormals:[],errors:[]},fonts:{status:'loaded',cjk:true},gl:{lost:false,error:0},draw:{calls:1,triangles:1001}});
test('complete purpose receipt accepted, without full-app acceptance',()=>assert.equal(requireReady(fixture()),true));
for(const [name,mutate] of [
 ['missing old room prefix',r=>r.rooms.prefixPreserved=false],['missing route',r=>r.routes.pop()],['unreached old shell',r=>r.routes.at(-1).reached=false],['default zero without actual ground',r=>r.routes[0].samples[0].support={verified:false,kind:'CM_DEFAULT_ZERO'}],['unsupported sample',r=>r.routes[0].samples[0].support=null],['teleported route',r=>r.routes[0].teleports=1],['body obstruction',r=>r.routes[0].samples[0].bodyClear=false],['missing real floor/door data',r=>r.rooms.old[0].record.doors=[]],['scene error',r=>r.errors.push('shader')],['texture fallback',r=>r.textures.fallbacks.push('wood')],['old component-only physics',r=>r.physicsConsumer='COLLISION_ONLY'],['missing structural measurement',r=>r.structure.measured=false]])test(name,()=>{const r=fixture();mutate(r);assert.throws(()=>requireReady(r));});
const captures=()=>VIEWS.map(v=>({id:v.id,file:v.id+'.png',bytes:100,width:1280,height:800,sha256:'a'.repeat(64)}));
test('six captures required',()=>{assert.equal(requireCaptureSet(captures()),true);assert.throws(()=>requireCaptureSet(captures().slice(1)));});
test('cleanup cannot hide missing or duplicate disposal',()=>{const r={status:'COMPLETE',physicsReferencesCleared:true,controlsDetached:true,zoneDisposed:true,errors:[],resources:[{disposals:1}]};assert.equal(requireCleanup(r),true);for(const n of[0,2])assert.throws(()=>requireCleanup({...r,resources:[{disposals:n}]}));});
test('body must follow real late hooks and precede finish',()=>{const s="buildJideRearHall(this.kit); buildWeiyuStudyAnnex(); finalizeNingshouCoveredPlatforms(this.kit); buildQiandongSecondFrontCourt(this.kit,items[59],this.zoneJson); this.group = this.kit.finish();";assert.equal(validateSourceOrder(s),true);assert.throws(()=>validateSourceOrder(s.replace('buildQiandongSecondFrontCourt(this.kit,items[59],this.zoneJson);','')+'buildQiandongSecondFrontCourt(this.kit,items[59],this.zoneJson);'));});
import fs from 'node:fs';
test('observer samples after the unchanged real plaque atlas and before merge',()=>{const s=fs.readFileSync(new URL('./review-court.mjs',import.meta.url),'utf8');assert.match(s,/atlas\.call\(this\)[\s\S]*geometryBefore=measureBefore\(\)/);});

test('silent WebGL errors cannot pass',()=>{const r=fixture();r.gl.error=1285;assert.throws(()=>requireReady(r));});

test('frozen candidate has real late-hook order and deferred item dispatch',()=>{const s=fs.readFileSync(new URL('../../src/scene/zones/ZoneBase.js',import.meta.url),'utf8');assert.equal(validateSourceOrder(s),true);assert.match(s,/if\(item.qiandongSecondFrontCourt!==undefined\)break/);});

test('same-foot actual surfaces reject uncorrected old gate slab and Environment road foreground',()=>{
 assert.equal(contactState(0,0,false),'DIRECT');assert.equal(contactState(.1,.45,false),'SMOOTH_ASCENT_NOT_DIRECT_CONTACT');assert.equal(contactState(.4,0,false),'SHORT_DROP_NOT_DIRECT_CONTACT');assert.throws(()=>contactState(0,.8,false));assert.throws(()=>contactState(0,0,true));
 for(const owner of ['ZoneBase/east-six','Environment.objects/road']){
  const observation=observeFootContact({feet:0,logicalGroundY:0,airborne:false,upwardHits:[hit(0),hit(.1,owner,'slab')],downwardHits:[hit(0,owner,'slab',0,0,-1)]});
  assert.equal(observation.actualSurface.point[1],.1,owner+' foreground must not be skipped');assert.equal(observation.actualTriangleContact,false);assert.notEqual(observation.contactState,'DIRECT');assert.equal(observation.footOccupancy.status,'OCCUPIED');
  const r=fixture(),p=r.oldGateCenterProbe.sample;p.surfaceInputs={upwardHits:[hit(0,'Environment.ground','ground',-142,466),hit(.1,owner,'slab',-142,466)],downwardHits:[hit(0,owner,'slab',-142,466,-1)]};
  // The original false DIRECT receipt and the truthful mismatch receipt both
  // fail READY: new product support must not exempt this negative control.
  assert.throws(()=>requireReady(r),owner+' forged DIRECT at original gate');p.surfaceObservation=observeFootContact({feet:p.feet,logicalGroundY:p.logicalGroundY,airborne:p.airborne,...p.surfaceInputs});p.contactState=p.surfaceObservation.contactState;p.actualTriangleContact=p.surfaceObservation.actualTriangleContact;p.feetToRealTriangle=p.surfaceObservation.feetToRealTriangle;assert.throws(()=>requireReady(r),owner+' real old-gate mismatch');
 }
 // A real matched support at the original slab top is distinguishable from
 // the old CM-default-zero defect. This is algebra, not a zone execution.
 const matched=observeFootContact({feet:.1,logicalGroundY:.1,airborne:false,upwardHits:[hit(0),hit(.1,'ZoneBase/east-six','slab')],downwardHits:[hit(0,'ZoneBase/east-six','slab',0,0,-1)]});assert.equal(matched.actualTriangleContact,true);assert.equal(matched.contactState,'DIRECT');
});

test('every unique waypoint and six numeric stable-frame witnesses are required',()=>{
 const controls=[
  ['invalid plan number',a=>a.plan.points[1][0]=Infinity],['duplicate adjacent point',a=>a.plan.points[1]=[0,0]],
  ['missing middle',a=>a.settlements.splice(1,1)],['missing last',a=>a.settlements.pop()],['duplicate waypoint',a=>a.settlements[1].waypoint=1],
  ['zero stable frames',a=>a.settlements[0].stableFrames=0],['five stable frames',a=>a.settlements[0].stableFrames=5],
  ['wrong target',a=>a.settlements[0].target=[9,9]],['far position with PASS',a=>a.settlements[0].position=[9,1.7,9]],
  ['nonfinite position',a=>a.settlements[0].position[0]=NaN],['nonfinite feet',a=>a.settlements[0].feet=NaN],
  ['feet/logical contradiction',a=>a.settlements[0].feet=.1],['actual triangle contradiction',a=>a.settlements[0].support.point[1]=.1],
  ['negative speed',a=>a.settlements[0].speed=-1],['moving with PASS',a=>a.settlements[0].speed=.1],
  ['missing stable witness',a=>a.settlements[0].stableSampleIndices.pop()],['duplicate stable witness',a=>a.settlements[0].stableSampleIndices[5]=a.settlements[0].stableSampleIndices[4]],
  ['unlinked reached sample',a=>delete a.samples[a.settlements[0].sampleIndex].reachedWaypoint],['false actual contact',a=>a.settlements[0].actualTriangleContact=false],
  ['route does not return',a=>a.plan.points[a.plan.points.length-1]=[2,2]],['extra waypoint marker',a=>a.samples[1].reachedWaypoint=9],
  ['forged six with unstable numeric sample',a=>a.samples[a.settlements[0].stableSampleIndices[2]].speed=.1],
 ];
 for(const [name,mutate] of controls){const r=fixture();mutate(r.routes[0]);assert.throws(()=>requireReady(r),name);}
});

test("R272 READY refuses missing measured segmented-wall/end/neighbor evidence",()=>{const r=fixture();delete r.structure.wallEvidence;assert.throws(()=>requireReady(r));});

for(const [name,mutate] of [
 ['missing actual frame',w=>w.frames.pop()],['wrong low height',w=>w.frames[2].red.bounds.max[1]=6.5],['gap moved',w=>w.frames[2].red.bounds.max[0]+=.01],
 ['no high XZ separation',w=>w.frames[1].bounds.max[0]=-116],['roof below low cap',w=>w.gate.roof.bounds.min[1]=5.3],['flank lifted',w=>w.gate.flanks[0].bounds.min[1]=.1],['header raised',w=>w.gate.header.bounds.min[1]=4.7],
 ['missing endpoint',w=>w.ends.pop()],['missing red face',w=>w.ends[0].high.red.pop()],['missing cap gable',w=>w.ends[1].low.cap.pop()],['wrong outward normal',w=>w.ends[0].high.cap[0].normal[0]=-1],['foreign endpoint mesh',w=>w.ends[0].high.red[0].meshUuid='fake'],
 ['omitted southern roof owner',w=>w.neighborRoofs.pop()],['southern roof overlap',w=>w.neighborRoofs[0].bounds=w.gate.roof.bounds],['nonfinite cap',w=>w.frames[2].cap.bounds.max[1]=NaN],['unknown ring relabeled',w=>w.bottomCapRing='FIXED'],['auto visual PASS',w=>w.visualReview='PASS']
])test('R272 rejects '+name,()=>{const r=fixture();mutate(r.structure.wallEvidence);assert.throws(()=>requireReady(r));});
test('R272 cannot omit retained complete source/intersection set',()=>{for(const key of ['owners','intersections']){const r=fixture();delete r.structure.before[key];assert.throws(()=>requireReady(r));}const r=fixture();r.structure.before.owners=r.structure.before.owners.filter(o=>o.id!=='item/36');assert.throws(()=>requireReady(r));});

test('R272 lowered-wall/cap itself cannot omit or falsify full retained-neighbor comparison',()=>{for(const mutate of [r=>delete r.structure.wallEvidence.loweredNeighborCheck,r=>r.structure.wallEvidence.loweredNeighborCheck.pairs--,r=>r.structure.wallEvidence.loweredNeighborCheck.meshIds.pop(),r=>r.structure.wallEvidence.loweredNeighborCheck.positiveOverlaps.push({}),r=>{const w=r.structure.wallEvidence,m=r.structure.before.owners.find(o=>o.id==='item/17').meshes[0];m.bounds=structuredClone(w.frames[2].cap.bounds)}]){const r=fixture();mutate(r);assert.throws(()=>requireReady(r));}});
test('R272 retains multiple actual source frames for a southern neighbor, not only first root',()=>{const r=fixture(),o=r.structure.before.owners.find(o=>o.id==='item/15'),extra={id:o.id,uuid:'another-source-frame',meshes:[{uuid:'extra-original-mesh',bounds:b(-210,1,430,-205,3,435)}]};r.structure.before.owners.push(extra);r.structure.wallEvidence.loweredNeighborCheck.pairs+=r.structure.wallEvidence.loweredNeighborCheck.meshIds.length;assert.equal(requireReady(r),true);extra.meshes[0].bounds=structuredClone(r.structure.wallEvidence.frames[2].red.bounds);assert.throws(()=>requireReady(r));});

test('R272 every real southern cap/roof envelope and descendant must remain in full source set',()=>{for(const mutate of [r=>{const w=r.structure.wallEvidence;w.neighborRoofs[1]=structuredClone(w.neighborRoofs[0]);},r=>{const w=r.structure.wallEvidence;w.frames[2].cap.meshIds=['red2'];},r=>{const w=r.structure.wallEvidence;w.newRoofs[1]=structuredClone(w.newRoofs[0]);}]){const r=fixture();mutate(r);assert.throws(()=>requireReady(r));}});

test('R272 original item43 seam intersections remain fully reported, never blanket skipped',()=>{const r=fixture(),w=r.structure.wallEvidence,before=r.structure.before;w.newRoofs[1].bounds.min[2]=466.7;assert.throws(()=>requireReady(r),'omitted actual wall seam must fail');const news=before.owners.filter(o=>['new-body','item/58'].includes(o.id)).flatMap(o=>o.meshes);for(const o of before.owners.filter(o=>!['new-body','item/58'].includes(o.id)))for(const old of o.meshes)for(const n of news)if([0,1,2].every(i=>Math.min(n.bounds.max[i],old.bounds.max[i])-Math.max(n.bounds.min[i],old.bounds.min[i])>1e-5))before.intersections.push({newMesh:n.uuid,oldMesh:old.uuid,oldOwner:o.id});assert.ok(before.intersections.some(r=>r.oldOwner==='item/43'));assert.equal(requireReady(r),true,'reported designed wall contact is not a blanket collision exemption');before.intersections.pop();assert.throws(()=>requireReady(r));});
