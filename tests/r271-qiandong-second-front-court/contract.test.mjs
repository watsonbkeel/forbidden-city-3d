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
const fixture=()=>({identity:{head:'1'.repeat(40),tree:'2'.repeat(40),parent:'ea4c44aa221cf6a391ac90cd89c685fb066c0cf0',parentTree:'1ab4eac6ca18501e32c737e9737aabd99e04aa67',productTree:'4d2e21deff30bb8d8272dec89b1254da1c70f3e8'},scope:'ACTUAL_EAST_SIX_FINITE_SCRIPTED_CONTROLLER',physicsConsumer:'PRODUCTION_FIRST_PERSON_SCRIPTED',errors:[],zone:{id:'east-six',items:60,normalFinish:true,defaultRivers:true},rooms:{prefixPreserved:true,newFinalThree:true,old:[{index:0,source:'items/44',record:{id:0,floorY:.45,doors:[{x:-83.7,z:498}]}}],new:['westWing','eastWing','northRoom']},oldGateCenterProbe:{kind:'INDEPENDENT_PRODUCTION_CONTROLLER_INITIALIZATION_NOT_ROUTE',sourceItemIndex:42,sourceItemPoint:[-142,466],sample:{...sample(-142,466),dt:null}},routes:ROUTES.map(routeFixture),structure:{beforeAfter:true,sourceLinks:true,groundBodySeparateFromRoof:true,measured:true},textures:{manifest:true,fallbacks:[],missingNormals:[],errors:[]},fonts:{status:'loaded',cjk:true},gl:{lost:false,error:0},draw:{calls:1,triangles:1001}});
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
