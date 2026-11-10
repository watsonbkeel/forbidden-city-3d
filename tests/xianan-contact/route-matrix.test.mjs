import fs from 'node:fs';
import test from 'node:test';
import {makeFixture,contacts,T,assert,out} from './fixture.mjs';
import {withTerrainController} from '../lib/r91-controller-clock.mjs';
import {PLAYER} from '../../src/config/constants.js';
import {queryXiananContact} from '../../src/scene/palace/special/XiananContactSources.js';
import {xiananGroundCovered} from '../../src/controls/XiananGroundWitness.js';
import {inspectXiananGroundedMotion} from '../../src/controls/XiananContactMotion.js';
import {furnitureScope} from '../../src/controls/FurnitureMotion.js';
import {duixiuScope} from '../../src/scene/garden/DuixiuMotion.js';
import {hasWumenJointAscentBinding} from '../../src/controls/WumenJointAscentContact.js';
import {hit,plainBox} from './protocol-fixture.mjs';
import {groups,limits,geometryPin} from './route-matrix-groups.mjs';

// Only the independent interval oracle is reused from protocol-fixture. No
// adapter/rig or production movement/sweep function drives these routes.
const stage=process.env.XIANAN_STAGE_NAME,group=groups.find(g=>g.stage===stage);
assert.ok(group,'Named route group required; no implicit all-matrix run');
const EPS=1e-8,H=PLAYER.HEIGHT,R=.5;
const close=(a,b,label)=>{assert.equal(a.length,b.length,label+' dimensions');for(let i=0;i<a.length;i++)assert.ok(Math.abs(a[i]-b[i])<=EPS,label+' axis '+i);};
const physical=c=>c.camera.position.clone().sub(c.bobOffset);
const feet=p=>[p[0],p[1]-H,p[2]];
const vec=a=>new T.Vector3(...a);
const raw=c=>({camera:c.camera.position.toArray(),bob:c.bobOffset.toArray(),physical:physical(c).toArray()});
const finite=v=>{if(typeof v==='number')assert.ok(Number.isFinite(v),'finite numeric archive');else if(Array.isArray(v))v.forEach(finite);else if(v&&typeof v==='object')Object.values(v).forEach(finite);};
function boundedWrite(name,value,cap,append=false){
 finite(value);const line=JSON.stringify(value)+'\n';assert.ok(Buffer.byteLength(line)<=cap,'Diagnostic serialization bound: '+name);
 fs.mkdirSync(out,{recursive:true});fs.writeFileSync(new URL(name,out),line,{flag:append?'a':'wx'});
}
function xzOverlap(a,b,box){return Math.min(a[0],b[0])-R<box.max[0]&&Math.max(a[0],b[0])+R>box.min[0]&&Math.min(a[2],b[2])-R<box.max[2]&&Math.max(a[2],b[2])+R>box.min[2];}
function checkPose(f,c,r,lane){
 finite(r);close(r.camera,r.physical.map((n,i)=>n+r.bob[i]),'raw render equals physical plus bob');
 assert.ok(Math.abs((r.physical[1]-H)-c.feetY)<=EPS,'camera-derived physical feet, not logical ground');
 assert.equal(contacts(r.physical,r.physical[1]-H,f.finishedBoxes).length,0,'strict finished full body at actual output');
 assert.ok(r.physical[0]-R>=lane.min[0]&&r.physical[0]+R<=lane.max[0],'full square stays inside chosen doorway X');
 const p=vec(r.physical);assert.equal(f.cm.checkCollision(p,R),false,'actual native ordinary/water/boundary guard');
 assert.equal(f.cm.checkBoundary(p,R)&&f.cm.checkRiverCrossing(p,R),true,'actual boundary and water');
 assert.equal(c.airborne,false,'these are grounded/causal descent routes, not ordinary air');
}
function constraints(f,c,a,b){
 const av=vec(a),bv=vec(b),ae=av.clone().add(new T.Vector3(0,H,0)),be=bv.clone().add(new T.Vector3(0,H,0));
 assert.equal(xiananGroundCovered(f.scene,av,bv,R,c.camera),true,'real ground covers entire swept square');
 assert.equal(f.cm.checkBoundary(ae,R)&&f.cm.checkBoundary(be,R)&&f.cm.checkRiverCrossing(be,R,ae,b[1],a[1]),true,'original segment water/boundary constraints');
 assert.equal(f.cm.checkDynamicCollision(be,R,ae),false,'original dynamic channel');
 assert.ok(!furnitureScope(f.cm,av,bv,R,a[1],b[1],a[1])&&!duixiuScope(f.cm,ae,be,R),'no foreign local scope bypass');
 assert.equal(hasWumenJointAscentBinding(f.cm),false,'no Wumen capability in this fixture');
 for(const row of f.cm.colliders){
  assert.ok(!row.overhead&&!row.triangleSupport&&!row.xiqingRoofSurface&&!row.duixiuTerrain&&!row.furnitureMotionScope,'fixture has only original ordinary boxes; unsupported special shapes cannot silently skip');
  assert.equal(hit(a,b,plainBox(row.box),true),false,'independent continuous original ordinary box');
 }
}
let halted=null;
for(const spec of group.cases)test(spec.id,()=>{
 if(halted)throw new Error('Group stopped, not executed after: '+halted);
 let f=null,frame=0,summary={case:spec.id,status:'setup',fps:group.fps,direction:spec.direction,mode:spec.mode},files=[];
 const name=suffix=>`${spec.id}-${suffix}`;
 const record=(suffix,value,cap,append=false)=>{const n=name(suffix);boundedWrite(n,value,cap,append);if(!files.includes(n))files.push(n);};
 try{
  f=makeFixture();
  withTerrainController(f.cm,(c,camera,tick)=>{
   const lane=f.finishedBoxes.find(b=>b.label===group.lane),cap=f.finishedBoxes.find(b=>b.label==='cap');
   const laneX=(lane.min[0]+lane.max[0])/2,centerZ=(lane.min[2]+lane.max[2])/2;
   assert.equal(laneX,geometryPin.lanes[group.lane]);assert.equal(centerZ,geometryPin.centerZ);
   assert.equal(cap.min[2],geometryPin.capMinZ);assert.equal(cap.max[2],geometryPin.capMaxZ);
   const south=cap.min[2]-R-4,north=cap.max[2]+R+4,sign=spec.direction==='south-to-north'?1:-1;
   const startZ=sign===1?south:north,endZ=sign===1?north:south,seed=[laneX,H,startZ],target=[laneX,H,endZ];
   const distance=Math.abs(endZ-startZ),moveCap=Math.ceil((distance/(spec.mode==='sprint'?12:5)+4)*group.fps),tailFrames=2*group.fps;
   assert.equal(moveCap,spec.movementFrameCap);assert.equal(tailFrames,spec.tailFrames);
   let setCalls=0;const set=c.setPosition;c.setPosition=function(...args){setCalls++;assert.equal(setCalls,1,'exactly one initial setPosition');return set.apply(this,args);};
   c.setPosition(...seed);const initial=raw(c);close(initial.physical,seed,'actual post-setPosition ground0 seed');checkPose(f,c,initial,lane);
   assert.equal(c.verticalVelocity,0);assert.equal(c.keyPressTimes.size,0);assert.equal(f.cm.colliders.length,26);assert.equal(f.cm.walkables.length,1);assert.equal(f.width,24.1);
   const owners=[...f.cm.colliders],ownerBoxes=owners.map(o=>plainBox(o.box));
   assert.equal(f.cm.dynamicBodies.size,0);assert.equal(f.cm.rivers.length,1);assert.equal(f.cm.moats.length,1);
   const q=queryXiananContact(f.cm,vec(seed),vec(target),R,camera);assert.equal(q?.status,'valid','authentic source/finished/camera full-route query');const epoch=q.generation;
   constraints(f,c,feet(seed),feet(target));
   // Conservative preflight headroom across all heights [0, highest top].
   // Actual route is not inferred from this envelope; real updates prove it.
   const maxTop=Math.max(...f.finishedBoxes.map(b=>b.max[1]));
   for(const row of f.cm.colliders){const box=plainBox(row.box);assert.ok(!(laneX+R>box.min[0]&&laneX-R<box.max[0]&&Math.max(startZ,endZ)+R>box.min[2]&&Math.min(startZ,endZ)-R<box.max[2]&&H+maxTop-.05>box.min[1]&&.35<box.max[1]),'SETUP full runway and raised ordinary-body envelope clear');}
   const identity={sourceGateMeshes:f.identity.sourceGateMeshes,returnedOpeningWidth:f.width,colliders:f.cm.colliders.length,walkables:f.cm.walkables.length,rivers:f.cm.rivers.length,moats:f.cm.moats.length,dynamicOwners:f.cm.dynamicBodies.size,sourceState:f.identity.sourceState,physicalState:f.identity.physicalState,finishedBoxes:f.finishedBoxes.map(b=>({label:b.label,min:b.min,max:b.max,triangles:b.triangles})),currentVersion:'See this stage start.json nativeSourceHashes and frozen matrix input manifest, not historical fixture commit labels'};
   record('preflight.json',{case:spec.id,identity,seed,target,laneX,centerZ,epoch,initial,distance,moveCap,tailFrames,groundWholeRoute:true,ordinaryRaisedEnvelopeClear:true},limits.perCaseMetadataBytes);
   c.lookAt(laneX,endZ);camera.updateMatrixWorld(true);c.moveForward=true;c.moveBackward=c.moveLeft=c.moveRight=false;c.canSprint=spec.mode==='sprint';
   const planes=[{id:'entry-cap-footprint',z:sign===1?cap.min[2]-R:cap.max[2]+R},{id:'threshold-center',z:centerZ},{id:'exit-cap-full-clear',z:sign===1?cap.max[2]+R:cap.min[2]-R},{id:'runway-end',z:endZ}];
   const crossings={},topWitnesses=[];let segments=0,bobFrames=0,localFrames=0,outsideFrames=0,thresholdSegments=0,settledRelease=null,last=initial;
   function cross(a,b,segmentIndex,actualSpeed,phase){
    for(const plane of planes)if(!crossings[plane.id]&&sign*(a[2]-plane.z)<=0&&sign*(b[2]-plane.z)>=0&&sign*(b[2]-a[2])>0){
     const t=(plane.z-a[2])/(b[2]-a[2]),point=a.map((v,i)=>v+t*(b[i]-v));assert.ok(Math.abs(point[0]-laneX)<=.6,'directed crossing stays near selected center');
     const row={id:plane.id,planeZ:plane.z,frame,segmentIndex,phase,t,feet:point,actualSpeed,inputSprint:c.canSprint};crossings[plane.id]=row;record('crossings.ndjson',row,limits.crossingLineBytes,true);
    }
   }
   function advance(phase){
    const before=raw(c);close(before.physical,last.physical,'actual frame continuity');const input={forward:c.moveForward,backward:c.moveBackward,left:c.moveLeft,right:c.moveRight,canSprint:c.canSprint,keyPressTimes:c.keyPressTimes.size};
    assert.equal(input.keyPressTimes,0,'no auto-sprint key timing');tick(group.fps);frame++;
    const after=raw(c),snapshot=inspectXiananGroundedMotion(c);assert.ok(snapshot,'actual native completed frame observation');assert.equal(snapshot.frame,frame,'current real native frame serial');
    const {committedSegments,...header}=snapshot;
    const actualSpeed=Math.hypot(after.physical[0]-before.physical[0],after.physical[2]-before.physical[2])/snapshot.dt;
    const row={frame,phase,input,before,after,controllerFeet:c.feetY,logicalGround:c.groundY,verticalVelocity:c.verticalVelocity,airborne:c.airborne,onSupport:c.onSupport,velocity:c.velocity.toArray(),nativeSpeed:c.motion.speed,nativeSprint:c.motion.sprint,actualSpeed,observer:header,segmentCount:committedSegments.length};
    // Flush raw observations before deeper assertions so failures retain their
    // actual output. Segments are archived once, never duplicated in summaries.
    record('frames.ndjson',row,limits.frameLineBytes,true);
    for(const segment of committedSegments)record('segments.ndjson',{frame,...segment},limits.segmentLineBytes,true);
    assert.ok(committedSegments.length<=limits.maxSegmentsPerFrame[group.fps],'predeclared finite segment bound including residual tail motion');
    checkPose(f,c,after,lane);close(snapshot.startEye,before.physical,'observer independent physical start');close(snapshot.endEye,after.physical,'observer independent physical end');
    assert.ok(Math.abs(snapshot.dt-1/group.fps)<1e-12,'actual native dt matches requested fps');assert.ok(Math.abs(actualSpeed-c.motion.speed)<=EPS,'raw derived speed matches native output');assert.ok(actualSpeed<=(spec.mode==='sprint'?12:5)+EPS,'normal speed constant upper bound');
    assert.equal(snapshot.commitMatched,true);assert.equal(snapshot.blocked,false);assert.ok(['committed','outside'].includes(snapshot.status),'no blocked/discontinuous/air result counted as route pass');
    if(snapshot.status==='committed'){
     localFrames++;assert.equal(snapshot.participated,true);assert.equal(snapshot.epochValid,true);assert.equal(snapshot.sourceEpoch,epoch);
     let cursor=feet(before.physical);
     for(const segment of committedSegments){
      close(segment.fromFeet,cursor,'accepted chain joins actual start/prior segment');
      assert.ok(['lift','horizontal','descent'].includes(segment.kind));
      if(segment.kind==='horizontal')assert.ok(Math.abs(segment.fromFeet[1]-segment.toFeet[1])<=EPS,'horizontal height');
      else {close([segment.fromFeet[0],segment.fromFeet[2]],[segment.toFeet[0],segment.toFeet[2]],'vertical has no hidden horizontal');assert.ok(segment.kind==='lift'?segment.toFeet[1]>=segment.fromFeet[1]:segment.toFeet[1]<=segment.fromFeet[1],'vertical direction');}
      for(const b of f.finishedBoxes)assert.equal(hit(segment.fromFeet,segment.toFeet,b),false,'independent full-height continuous finished sweep');
      constraints(f,c,segment.fromFeet,segment.toFeet);
      if(segment.kind==='horizontal'){
       cross(segment.fromFeet,segment.toFeet,segment.index,actualSpeed,phase);
       if(xzOverlap(segment.fromFeet,segment.toFeet,cap)&&spec.mode==='sprint'){assert.equal(input.canSprint,true);assert.ok(actualSpeed>=11.4,'actual sprint speed at every dangerous horizontal frame');}
       if(xzOverlap(segment.fromFeet,segment.toFeet,lane)&&Math.abs(segment.toFeet[1]-lane.max[1])<=EPS&&Math.hypot(segment.toFeet[0]-segment.fromFeet[0],segment.toFeet[2]-segment.fromFeet[2])>EPS){thresholdSegments++;if(topWitnesses.length<2)topWitnesses.push({frame,index:segment.index,fromFeet:segment.fromFeet,toFeet:segment.toFeet});}
      }
      cursor=segment.toFeet;segments++;
     }
     close(cursor,feet(after.physical),'chain ends at actual physical pose');
    }else{
     outsideFrames++;assert.equal(snapshot.participated,false);assert.equal(committedSegments.length,0,'outside has no invented module segment');
     const a=feet(before.physical),b=feet(after.physical);for(const box of f.finishedBoxes)assert.equal(xzOverlap(a,b,box),false,'outside chord cannot touch target footprint');
     assert.ok(Math.abs(a[1])<=EPS&&Math.abs(b[1])<=EPS,'outside only actual ground0 straight route');constraints(f,c,a,b);cross(a,b,null,actualSpeed,phase);
    }
    if(phase==='moving'&&crossings['entry-cap-footprint']&&spec.mode==='sprint')assert.ok(actualSpeed>=11.4&&input.canSprint,'maintain actual full sprint after entry through exit descent and release');
    if(after.bob.some(n=>Math.abs(n)>EPS))bobFrames++;
    assert.ok(sign*(after.physical[2]-before.physical[2])>=-EPS,'no reversal or target steering');
    last=after;return after;
   }
   summary={...summary,status:'moving',seed,target,epoch,initialSetPositionCalls:setCalls,movementFrameCap:moveCap,tailFrames};
   for(let i=0;i<moveCap;i++){
    const p=advance('moving'),feetY=p.physical[1]-H;
    if(sign*(p.physical[2]-endZ)>=0&&sign*(p.physical[2]-(sign===1?cap.max[2]+R:cap.min[2]-R))>0&&Math.abs(feetY)<=EPS&&c.verticalVelocity===0&&!c.airborne){settledRelease={frame,raw:p,derivedFeet:feetY,verticalVelocity:c.verticalVelocity,speed:c.motion.speed};break;}
   }
   assert.ok(settledRelease,'native arrival and real landing before declared movement cap');
   for(const p of planes)assert.ok(crossings[p.id],'required continuous directed crossing: '+p.id);
   assert.ok(thresholdSegments>0,'real positive-area accepted threshold-top travel, not a bypass');assert.ok(localFrames>0&&segments>0);
   record('arrival.json',{case:spec.id,crossings,settledRelease,thresholdSegments,topWitnesses},limits.perCaseMetadataBytes);
   // Normal key-up, not stop/reset. Keep inertial tail segments in the same
   // independent oracle and in resource bounds (not only one vertical/frame).
   c.moveForward=c.moveBackward=c.moveLeft=c.moveRight=c.canSprint=false;
   const releaseFrame=frame;for(let i=0;i<tailFrames;i++)advance('tail');assert.equal(frame-releaseFrame,tailFrames);
   assert.ok(Math.abs(last.physical[1]-H)<=EPS);assert.equal(c.verticalVelocity,0);assert.equal(c.airborne,false);assert.ok(c.motion.speed<1e-6);assert.ok(bobFrames>0);
   assert.equal(xiananGroundCovered(f.scene,vec(last.physical),vec(last.physical),R,camera),true,'actual final footprint on real ground0');
   assert.equal(setCalls,1);assert.equal(f.cm.colliders.length,26);assert.equal(f.cm.walkables.length,1);
   for(let i=0;i<26;i++){assert.equal(f.cm.colliders[i]===owners[i],true,'original collider identity');assert.deepEqual(plainBox(owners[i].box),ownerBoxes[i]);}
   assert.equal(queryXiananContact(f.cm,vec(seed),vec(target),R,camera)?.generation,epoch);assert.equal(queryXiananContact(f.cm,vec(seed),vec(target),R,camera)?.status,'valid');
   summary={...summary,status:'PASS',movingFrames:releaseFrame,tailFrames,frameCount:frame,acceptedSegments:segments,localFrames,outsideFrames,bobFrames,thresholdSegments,crossings,settledRelease,final:last,finalSpeed:c.motion.speed,finalVV:c.verticalVelocity,files};
   record('result.json',summary,limits.perCaseMetadataBytes);
  });
 }catch(error){halted=spec.id+': '+error.message;record('failure.json',{case:spec.id,frame,error:{name:error.name,message:error.message},progress:summary,files},limits.perCaseMetadataBytes);throw error;}
 finally{f?.dispose();}
});
