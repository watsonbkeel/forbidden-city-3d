import * as T from 'three';
import {PLAYER} from '../config/constants.js';
import {getXiananNativeContext,getXiananNativeObservationStamp} from './FirstPerson.js';
import {queryXiananContact} from '../scene/palace/special/XiananContactSources.js';
import {xiananGroundCovered} from './XiananGroundWitness.js';
import {furnitureBoxSweep,furnitureScope} from './FurnitureMotion.js';
import {duixiuScope} from '../scene/garden/DuixiuMotion.js';
import {tryWumenJointGroundStep} from './WumenJointAscentMotion.js';
import {hasWumenJointAscentBinding} from './WumenJointAscentContact.js';
import {triangleBodySweptIntersects} from '../utils/TriangleSupport.js';
import {xiqingSurfaceSweep} from './XiqingRoofSurface.js';

// No exported registration/issuance API. Only constructor/update-born contexts
// can create these session and call records. Public motion fields grant nothing.
const sessions=new WeakMap(),frames=new WeakMap(),calls=new WeakMap(),receipts=new WeakMap();
const observations=new WeakMap();
const EPS=1e-8,R=.5,H=PLAYER.HEIGHT;
const vector=a=>new T.Vector3(...a);
const close=(a,b)=>['x','y','z'].every(k=>Math.abs(a[k]-b[k])<=EPS);
const footOverlap=(p,b)=>p.x+R>b.min.x&&p.x-R<b.max.x&&p.z+R>b.min.z&&p.z-R<b.max.z;
const body=p=>new T.Box3(new T.Vector3(p.x-R,p.y,p.z-R),new T.Vector3(p.x+R,p.y+H,p.z+R));
const eye=p=>new T.Vector3(p.x,p.y+H,p.z);
const actual=c=>c.camera.position.clone().sub(c.controller.bobOffset);
function invalidate(f,reason){f.blocked=true;f.reason=reason;f.mode='blocked';return f;}
// A mismatch withdraws permission; it is not permission to restore an old
// transaction endpoint. Retain the observed camera pose/current velocity as
// a blocked continuity witness, never as a support or a descent capability.
function blockAtActual(f,c,reason){
  invalidate(f,reason);
  const p=actual(c);p.y-=H;
  f.position.copy(p);f.vv=c.controller.verticalVelocity;f.causal=false;
  return f;
}
function anchored(c,s,from,to=from){
  const q=queryXiananContact(c.cm,from,to,R,c.camera);
  if(q)return q;
  return s?.anchor?queryXiananContact(c.cm,s.anchor,s.anchor,R,c.camera):null;
}
function refresh(f){
  const c=getXiananNativeContext(f.cm,f.motion);
  if(!c||c.status!=='active'||c.session!==f.session||c.generation!==f.nativeGeneration||c.airOnly||c.controller.verticalVelocity>0||(c.controller.airborne&&!f.causal))return false;
  const q=anchored(c,f,f.position);
  if(q?.status!=='valid'||q.generation!==f.epoch||q.scene!==f.scene)return false;
  f.boxes=q.boxes;return true;
}
// Every straight segment has independent ground, world, external solid and
// dynamic checks. Five visible solids are never inserted into general CM data.
function clearSegment(f,from,to){
  if(!refresh(f)||!xiananGroundCovered(f.scene,from,to,R,f.camera))return false;
  const cm=f.cm,a=eye(from),b=eye(to);
  if(!cm.checkBoundary(a,R)||!cm.checkBoundary(b,R)||!cm.checkRiverCrossing(b,R,a,to.y,from.y))return false;
  if(furnitureScope(cm,from,to,R,from.y,to.y,from.y)||duixiuScope(cm,a,b,R))return false;
  // This optional experimental binding has no compatible local handoff. A
  // registered conflict is conservative, never silently consumed by Xianan.
  if(hasWumenJointAscentBinding(cm)&&tryWumenJointGroundStep(cm,from,to,{kind:'player',airborne:false},R).status!=='OUTSIDE')return false;
  for(const box of f.boxes)if(furnitureBoxSweep(from,to,box,R,H))return false;
  const ba=body(from),bb=body(to),bounds=ba.clone().union(bb);
  for(const owner of cm.queryBox(bounds)){
    if(!bounds.intersectsBox(owner.box))continue;
    if(owner.overhead){if(furnitureBoxSweep(from,to,owner.box,R,H))return false;}
    else if(owner.triangleSupport){if(triangleBodySweptIntersects(owner.triangleSupport,ba,bb))return false;}
    else if(owner.xiqingRoofSurface){if(xiqingSurfaceSweep(owner.xiqingRoofSurface,ba,bb))return false;}
    else {
      const lo=from.clone();lo.y+=.35;const hi=to.clone();hi.y+=.35;
      if(furnitureBoxSweep(lo,hi,owner.box,R,H-.4))return false;
    }
  }
  return !cm.checkDynamicCollision(b,R,a);
}
function support(f,p,max=p.y+EPS){
  let top=-Infinity;
  if(max>=0&&xiananGroundCovered(f.scene,p,p,R,f.camera))top=0;
  for(const b of f.boxes)if(footOverlap(p,b)&&b.max.y<=max&&b.max.y>top)top=b.max.y;
  return top;
}
function supported(f,p){const top=support(f,p);return Number.isFinite(top)&&Math.abs(top-p.y)<=EPS;}
function makeFrame(cm,motion,to=null){
  const c=getXiananNativeContext(cm,motion);
  if(!c)return null; // Never-native public shapes retain the old solver.
  if(frames.has(motion))return frames.get(motion);
  const start=vector(c.start);start.y=c.feet;
  if(c.status!=='active')return invalidFrame(c,motion,start);
  let old=sessions.get(c.session);
  if(c.resetKind==='position'&&old?.nativeGeneration!==c.generation)old=null;
  const q=anchored(c,old,start,to??start);
  if(c.airOnly||(c.airborne&&!old)){
    sessions.delete(c.session);return null; // Existing ordinary air is not repaired here.
  }
  if(!q&&!old)return c.status==='active'?null:invalidFrame(c,motion,start);
  const f={cm,motion,session:c.session,controller:c.controller,camera:c.camera,nativeGeneration:c.generation,serial:c.serial,dt:c.dt,position:start.clone(),start:start.clone(),vv:c.verticalVelocity,mode:'supported',causal:false,blocked:false,epoch:q?.generation,scene:q?.scene,boxes:q?.boxes??[],anchor:old?.anchor?.clone()??q?.boxes?.[0].getCenter(new T.Vector3()),segments:[],verticalUsed:false,consumed:false,moveStarted:false};
  frames.set(motion,f);
  if(c.status!=='active'||!q||q.status!=='valid')return invalidate(f,'native/source invalid');
  const epochSame=!old||(old.epoch===q.generation&&old.scene===q.scene);
  if(old&&!close(start,old.position))return invalidate(f,'actual pose discontinuity');
  const stop=old&&old.nativeGeneration!==c.generation&&c.resetKind==='stop';
  if(!clearSegment(f,start,start))return invalidate(f,'initial body or ground invalid');
  const onSupport=supported(f,start);
  if(old?.blocked&&!onSupport)return invalidate(f,'blocked state has no fresh support');
  if(!epochSame&&!onSupport)return invalidate(f,'new epoch requires actual support');
  if(onSupport){f.vv=0;return f;}
  if(!old?.causal||!epochSame)return invalidate(f,'no initial support or causal descent');
  if(Math.abs(c.verticalVelocity-old.vv)>EPS)return invalidate(f,'descent velocity discontinuity');
  f.causal=true;f.mode=stop||old.mode==='quarantine'?'quarantine':'descent';return f;
}
function invalidFrame(c,motion,start){
  const f={cm:c.cm,motion,session:c.session,controller:c.controller,camera:c.camera,nativeGeneration:c.generation,serial:c.serial,dt:c.dt,position:start,start:start.clone(),vv:c.verticalVelocity,segments:[],blocked:true,mode:'blocked',reason:'known native invalid',verticalUsed:false};frames.set(motion,f);return f;
}
export function getXiananJumpEligibility(cm,motion){
  const f=makeFrame(cm,motion);if(!f)return null;
  return !f.blocked&&!f.causal&&f.mode!=='quarantine'&&refresh(f)&&clearSegment(f,f.position,f.position)&&supported(f,f.position);
}
function commandFault(command,reason){
  command.fault??=reason;
  invalidate(command.f,reason);command.f.causal=false;
  const result=command.receipt?.deref();if(result)receipts.delete(result);
}
export function beginXiananMove(cm,motion,fromEye,toEye,radius,stepUp){
  const c=getXiananNativeContext(cm,motion);if(!c)return null;
  // Explicit accepted jump invalidates even a certificate minted before jump.
  if(c.status==='active'&&c.airOnly){frames.delete(motion);sessions.delete(c.session);return null;}
  const f=makeFrame(cm,motion,toEye);if(!f)return null;
  const handle=Object.freeze({});
  if(f.command){
    commandFault(f.command,'repeated native begin');calls.set(handle,f.command);return handle;
  }
  const from=c.move?.from,to=c.move?.to;
  const distance=from&&to?Math.hypot(to[0]-from[0],to[2]-from[2]):0;
  const steps=Math.max(1,Math.ceil(distance/Math.max(R*.5,.05)));
  const command={f,steps,dx:from&&to?(to[0]-from[0])/steps:0,dz:from&&to?(to[2]-from[2])/steps:0,iteration:0,phase:'MAIN',closed:false,fault:null,receipt:null};
  f.command=command;calls.set(handle,command);
  if(f.moveStarted||c.status!=='active'||radius!==R||stepUp!==(PLAYER.STEP_UP??.6)||!c.move||!['x','y','z'].every((k,i)=>fromEye[k]===from[i]&&toEye[k]===to[i])||!close(actual(c),vector(c.move.actualTarget)))commandFault(command,'native move arguments/replay');
  f.moveStarted=true;return handle;
}
export function xiananMoveStart(handle){const f=calls.get(handle)?.f;return f?eye(f.position):null;}
export function tryXiananGroundedStep(handle,x,z){
  const command=calls.get(handle);if(!command)return null;
  const f=command.f;
  if(command.closed||command.fault||command.iteration>=command.steps){commandFault(command,'closed or exhausted native command');return {accepted:false};}
  // Exact original-loop operands: MAIN, then only on failure X and Z. Use
  // latest accepted origin for Z; authorization has no accumulating epsilon.
  const expectedX=f.position.x+(command.phase==='Z'?0:command.dx);
  const expectedZ=f.position.z+(command.phase==='X'?0:command.dz);
  if(!Number.isFinite(x)||!Number.isFinite(z)||x!==expectedX||z!==expectedZ){commandFault(command,'noncanonical native request');return {accepted:false};}
  let result;
  try{result=solveGroundedStep(f,expectedX,expectedZ);}
  catch(error){commandFault(command,'native command solve exception');throw error;}
  if(command.phase==='MAIN'){
    if(result.accepted)command.iteration++;
    else command.phase='X';
  }else if(command.phase==='X')command.phase='Z';
  else {command.iteration++;command.phase='MAIN';}
  return result;
}
function solveGroundedStep(f,x,z){
  if(f.blocked||f.mode==='quarantine'||!refresh(f))return {accepted:false};
  const from=f.position.clone(),target=new T.Vector3(x,from.y,z),segments=[];
  const onSupport=!f.causal&&supported(f,from);
  let top=from.y;
  // A complete local substep can intersect a thin threshold even when an
  // endpoint does not. The swept square determines which closed box to clear.
  const swept=body(from).union(body(target));
  for(const b of f.boxes)if(swept.min.x<b.max.x&&swept.max.x>b.min.x&&swept.min.z<b.max.z&&swept.max.z>b.min.z&&b.max.y>top&&b.min.y<from.y+H)top=b.max.y;
  if(top>from.y){
    if(!onSupport||top-from.y>(PLAYER.STEP_UP??.6))return {accepted:false};
    const raised=from.clone();raised.y=top;
    if(!clearSegment(f,from,raised))return {accepted:false};
    segments.push({kind:'lift',from:from.toArray(),to:raised.toArray()});target.y=top;
  }
  const horizontal=from.clone();horizontal.y=target.y;
  if(!clearSegment(f,horizontal,target))return {accepted:false};
  segments.push({kind:'horizontal',from:horizontal.toArray(),to:target.toArray()});
  f.position.copy(target);f.segments.push(...segments);
  f.causal=!supported(f,target);f.mode=f.causal?'descent':'supported';
  if(!f.causal)f.vv=0;
  return {accepted:true,position:eye(target),feetY:target.y};
}
export function finishXiananMove(handle,result){
  const command=calls.get(handle);if(!command)return;
  const f=command.f;
  if(command.closed){commandFault(command,'repeated native finish');return;}
  if(command.iteration!==command.steps||command.phase!=='MAIN')commandFault(command,'incomplete native command');
  command.closed=true;
  const endpoint=eye(f.position);
  if(!result?.isVector3||!result.equals(endpoint)){commandFault(command,'returned endpoint mismatch');return;}
  // Faulted/incomplete calls publish only a blocked prefix receipt. They
  // cannot regain support/step permission through a normal finish call.
  command.receipt=new WeakRef(result);
  receipts.set(result,{f,command,normal:!command.fault&&!f.blocked,cm:f.cm,motion:f.motion,endpoint:result.clone()});
}
export function abortXiananMove(handle){const command=calls.get(handle);if(command){commandFault(command,'exception aborted movement');command.closed=true;}}
export function consumeXiananMove(cm,motion,result){
  const r=receipts.get(result);receipts.delete(result);
  const f=frames.get(motion);if(!f)return null;
  const c=getXiananNativeContext(cm,motion);
  if(!r||r.f!==f||r.cm!==cm||r.motion!==motion||f.consumed||c?.status!=='active'||c.airOnly||!close(result,r.endpoint)||!close(actual(c),result)){
    blockAtActual(f,c??f,'receipt/camera mismatch');return {feetY:f.position.y,blocked:true};
  }
  f.consumed=true;
  if(!r.normal)invalidate(f,'blocked native command receipt');
  if(!f.blocked&&!refresh(f))invalidate(f,'owner revoked before consumption');
  return {feetY:f.position.y,blocked:f.blocked};
}
export function resolveXiananGroundedVertical(cm,motion,delta){
  const c=getXiananNativeContext(cm,motion);if(!c)return null;
  if(c.status==='active'&&c.airOnly){frames.delete(motion);sessions.delete(c.session);return null;}
  const f=makeFrame(cm,motion);if(!f)return null;
  const p=actual(c);p.y-=H;
  if(f.verticalUsed||delta!==c.dt||delta!==f.dt||c.status!=='active'||!close(p,f.position)||(f.moveStarted&&!f.consumed))blockAtActual(f,c,'vertical replay/dt/pose mismatch');
  f.verticalUsed=true;
  if(!f.blocked&&!clearSegment(f,f.position,f.position))invalidate(f,'vertical source/body invalid');
  let landed=false;
  if(!f.blocked){
    if(supported(f,f.position)){f.vv=0;f.causal=false;f.mode='supported';}
    else {
      const vv=Math.max(f.vv-9.8*delta,-12),target=f.position.clone();target.y+=vv*delta;
      const floor=support(f,f.position,f.position.y+EPS);
      if(!Number.isFinite(floor)||target.y>f.position.y||!f.causal)invalidate(f,'unsupported/upward short descent');
      else {
        if(target.y<=floor){target.y=floor;landed=true;}
        if(!clearSegment(f,f.position,target))invalidate(f,'descent segment blocked');
        else {f.segments.push({kind:'descent',from:f.position.toArray(),to:target.toArray()});f.position.copy(target);f.vv=landed?0:vv;f.causal=!landed;if(landed)f.mode='supported';}
      }
    }
  }
  // Explicit blocked results suppress legacy vertical rescue. They preserve
  // the current physical pose and velocity; never publish a rejected target.
  const result={feetY:f.position.y,groundY:f.position.y,verticalVelocity:f.vv,airborne:false,onSupport:!f.blocked&&!f.causal,landed,blocked:f.blocked};
  f.verticalResult=result;return result;
}
function frozenCopy(value){
  if(Array.isArray(value))return Object.freeze(value.map(frozenCopy));
  if(value!==null&&typeof value==='object')return Object.freeze(Object.fromEntries(Object.entries(value).map(([k,v])=>[k,frozenCopy(v)])));
  return value;
}
// This public query does not run any geometry/ground validation, and exposes
// no identity object. Stale generations, active/new frames and disposal hide
// earlier success rather than letting it impersonate the current frame.
export function inspectXiananGroundedMotion(controller){
  const stamp=getXiananNativeObservationStamp(controller),snapshot=observations.get(controller);
  if(!stamp||stamp.disposed||!stamp.identityCurrent||stamp.active||!snapshot||snapshot.frame!==stamp.frame||snapshot.generation!==stamp.generation)return null;
  return frozenCopy(snapshot);
}
function publishObservation(c,f,commitMatched){
  if(!c)return;
  const end=actual(c),start=vector(c.start),startFeet=start.clone(),endFeet=end.clone();startFeet.y-=H;endFeet.y-=H;
  const numeric=[...start.toArray(),...end.toArray(),c.dt,c.serial,c.generation,c.controller.verticalVelocity];
  if(!numeric.every(Number.isFinite)){observations.delete(c.controller);return;}
  const airOnly=!f&&(c.airOnly||c.airborne),participated=!!f;
  let epochValid=null,queryFailed=false,chainMatched=true;
  if(f){
    try{
      // Existing source validation may revoke its own invalid certificate.
      // That established effect is allowed; no motion/frame state is written.
      const anchor=f.anchor??f.position,q=queryXiananContact(c.cm,anchor,anchor,R,c.camera);
      epochValid=q?.status==='valid'&&q.generation===f.epoch&&q.scene===f.scene;
    }catch{epochValid=false;queryFailed=true;}
    let cursor=startFeet;
    for(const segment of f.segments){
      if(!['lift','horizontal','descent'].includes(segment.kind)||segment.from.length!==3||segment.to.length!==3||![...segment.from,...segment.to].every(Number.isFinite)||!close(cursor,vector(segment.from))){chainMatched=false;break;}
      cursor=vector(segment.to);
    }
    if(!close(cursor,endFeet))chainMatched=false;
  }
  const proved=participated&&commitMatched&&!f.blocked&&epochValid&&chainMatched;
  const status=!participated?(airOnly?'air_only':'outside'):f.blocked?'blocked':proved?'committed':'discontinuous';
  const reason=!participated?(airOnly?'AIR_ONLY':'OUTSIDE'):f.blocked?'LOCAL_BLOCKED':!commitMatched?'COMMIT_MISMATCH':queryFailed?'SOURCE_QUERY_FAILED':!epochValid?'SOURCE_EPOCH_INVALID':!chainMatched?'CHAIN_MISMATCH':null;
  const snapshot={frame:c.serial,generation:c.generation,sourceEpoch:Number.isFinite(f?.epoch)?f.epoch:null,dt:c.dt,status,participated,commitMatched,epochValid,blocked:!!f?.blocked,reason,startEye:start.toArray(),startFeet:startFeet.toArray(),intendedXZ:c.move?[c.move.to[0],c.move.to[2]]:null,endEye:end.toArray(),endFeet:endFeet.toArray(),verticalVelocity:c.controller.verticalVelocity,committedSegments:proved?f.segments.map((segment,index)=>({index,kind:segment.kind,fromFeet:[...segment.from],toFeet:[...segment.to]})):[]};
  observations.set(c.controller,frozenCopy(snapshot));
}
export function commitXiananNativeFrame(cm,motion){
  const f=frames.get(motion),c=getXiananNativeContext(cm,motion);
  if(!f){publishObservation(c,null,c?.status==='active');return;}
  if(c?.airOnly){frames.delete(motion);sessions.delete(f.session);publishObservation(c,null,c.status==='active');return;}
  const p=c?actual(c):null;if(p)p.y-=H;
  const mismatched=c?.status!=='active'||!f.verticalUsed||!p||!close(p,f.position)||Math.abs(c.controller.feetY-p.y)>EPS||c.controller.verticalVelocity!==f.vv;
  if(mismatched)invalidate(f,'final actual camera commit mismatch');
  // Only observed committed output is a future continuity witness.
  if(p)f.position.copy(p);
  sessions.set(f.session,{nativeGeneration:f.nativeGeneration,epoch:f.epoch,scene:f.scene,anchor:f.anchor?.clone(),position:f.position.clone(),vv:c?.controller.verticalVelocity??f.vv,causal:f.causal,mode:f.mode,blocked:f.blocked});
  if(!f.blocked&&!f.causal&&Math.abs(f.position.y)<=EPS&&!queryXiananContact(cm,f.position,f.position,R,f.camera))sessions.delete(f.session);
  publishObservation(c,f,!mismatched);
}
export function abortXiananNativeFrame(cm,motion){
  const c=getXiananNativeContext(cm,motion);if(c)observations.delete(c.controller);
  const f=frames.get(motion);if(f){invalidate(f,'native update exception');const p=f.controller.camera.position.clone().sub(f.controller.bobOffset);p.y-=H;sessions.set(f.session,{nativeGeneration:f.nativeGeneration,epoch:f.epoch,scene:f.scene,anchor:f.anchor?.clone(),position:p,vv:f.controller.verticalVelocity,causal:false,mode:'blocked',blocked:true});}
}
