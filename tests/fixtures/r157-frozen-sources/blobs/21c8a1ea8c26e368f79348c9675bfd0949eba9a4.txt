import {duixiuTriangleBodySweepFraction} from './DuixiuTriangleBody.js';
import {duixiuFootContact} from './DuixiuTerrain.js';
import * as THREE from 'three';
import {PLAYER} from '../../config/constants.js';
import {createTriangleTemplate,triangleInstance} from '../../utils/TriangleSupport.js';
import {pointSegmentDistance} from '../characters/CharacterBody.js';

const EPS=1e-8, overheadCache=new WeakMap();
const body=(p,r)=>new THREE.Box3(new THREE.Vector3(p.x-r,p.y-PLAYER.HEIGHT+EPS,p.z-r),new THREE.Vector3(p.x+r,p.y,p.z+r));
function boxSweep(a,b,obstacle){
  const center=a.getCenter(new THREE.Vector3()),half=a.getSize(new THREE.Vector3()).multiplyScalar(.5),v=b.getCenter(new THREE.Vector3()).sub(center);
  let enter=0,leave=1;
  for(const k of ['x','y','z']){
    const low=obstacle.min[k]-half[k],high=obstacle.max[k]+half[k];
    if(Math.abs(v[k])<1e-12){if(center[k]<=low+EPS||center[k]>=high-EPS)return null;}
    else{const t0=(low-center[k])/v[k],t1=(high-center[k])/v[k];enter=Math.max(enter,Math.min(t0,t1));leave=Math.min(leave,Math.max(t0,t1));}
  }
  return enter<leave-EPS&&enter<1&&leave>0?Math.max(0,enter):null;
}
function overheadShape(c){
  const o=c.overhead;let shape=overheadCache.get(o);if(shape)return shape;
  const s=new THREE.Shape();s.moveTo(...o.points[0]);o.points.slice(1).forEach(p=>s.lineTo(...p));s.lineTo(o.points.at(-1)[0],o.topY);s.lineTo(o.points[0][0],o.topY);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:o.maxZ-o.minZ,bevelEnabled:false});g.translate(0,0,o.minZ);shape=triangleInstance(createTriangleTemplate(g),[0,0,0],'duixiu-external-overhead');g.dispose();overheadCache.set(o,shape);return shape;
}
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function hull(points){const a=points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]),lo=[],hi=[];for(const p of a){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),p)<=0)lo.pop();lo.push(p);}for(const p of [...a].reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),p)<=0)hi.pop();hi.push(p);}return [...lo.slice(0,-1),...hi.slice(0,-1)];}
function segmentDistance(a,b){
  const aa=[a.ax,a.az],ab=[a.bx,a.bz],ba=[b.ax,b.az],bb=[b.bx,b.bz];
  const u=cross(aa,ab,ba),v=cross(aa,ab,bb),s=cross(ba,bb,aa),t=cross(ba,bb,ab);
  if(u*v<0&&s*t<0)return 0;
  return Math.min(pointSegmentDistance(a.ax,a.az,b),pointSegmentDistance(a.bx,a.bz,b),pointSegmentDistance(b.ax,b.az,a),pointSegmentDistance(b.bx,b.bz,a));
}
/** Exact swept square footprint against registered vertical capsule parts. */
function dynamicPrefix(part,from,to,radius,end=1){
  const y=from.y-PLAYER.HEIGHT,dy=to.y-from.y,lowY=part.minY-PLAYER.HEIGHT+EPS,highY=part.maxY-EPS;
  let lo=0,hi=end;
  if(Math.abs(dy)<1e-12){if(y<=lowY||y>=highY)return false;}
  else{const a=(lowY-y)/dy,b=(highY-y)/dy;lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)return false;}
  const points=[];for(const t of[lo,hi])for(const dx of[-radius,radius])for(const dz of[-radius,radius])points.push([from.x+(to.x-from.x)*t+dx,from.z+(to.z-from.z)*t+dz]);
  const poly=hull(points),inside=p=>poly.every((a,i)=>cross(a,poly[(i+1)%poly.length],p)>=-EPS);
  if(inside([part.ax,part.az])||inside([part.bx,part.bz]))return true;
  return poly.some((a,i)=>{const b=poly[(i+1)%poly.length];return segmentDistance({ax:a[0],az:a[1],bx:b[0],bz:b[1]},part)<part.radius-EPS;});
}
/** Scoped full feet-to-head sweep. Does not reuse legacy box foot exemptions. */
export function duixiuBodySweep(cm,from,to,radius=.5){
  if(!cm.checkBoundary(to,radius)||!cm.checkRiverCrossing(to,radius,from))return{fraction:0,kind:'world-boundary'};
  const a=body(from,radius),b=body(to,radius),bounds=a.clone().union(b);let hit=null;
  for(const c of cm.queryBox(bounds)){
    let fraction;
    if(c.triangleSupport||c.overhead){const shape=c.triangleSupport??overheadShape(c);fraction=duixiuTriangleBodySweepFraction(shape,a,b);}
    else fraction=boxSweep(a,b,c.box);
    if(fraction!==null&&(!hit||fraction<hit.fraction))hit={fraction,kind:'solid',collider:c};
  }
  for(const bodies of cm.dynamicBodies.values())for(const actor of bodies)for(const part of actor.parts){
    if(!dynamicPrefix(part,from,to,radius))continue;
    let lo=0,hi=1;if(dynamicPrefix(part,from,to,radius,0))hi=0;else for(let i=0;i<30;i++){const mid=(lo+hi)/2;if(dynamicPrefix(part,from,to,radius,mid))hi=mid;else lo=mid;}
    if(!hit||hi<hit.fraction)hit={fraction:hi,kind:'dynamic',actorId:actor.id};
  }
  return hit;
}

function terrainOwners(cm,box){
  return cm._duixiuGrid().terrainIndex.query(box);
}
/** Active over the swept body footprint, including a real fall from high above. */
export function duixiuScope(cm,from,to,radius=.5){
  const box=new THREE.Box3(new THREE.Vector3(Math.min(from.x,to.x)-radius,-1e6,Math.min(from.z,to.z)-radius),new THREE.Vector3(Math.max(from.x,to.x)+radius,1e6,Math.max(from.z,to.z)+radius));
  return terrainOwners(cm,box).length>0;
}

/** Surface and admissible pose are deliberately separate results. */
export function duixiuContact(cm,x,z,maxTop,radius=.5){
  const q=new THREE.Box3(new THREE.Vector3(x-radius,-1e6,z-radius),new THREE.Vector3(x+radius,1e6,z+radius));
  let surface=maxTop>=0?{height:0,witness:new THREE.Vector3(x,0,z),instanceId:'world-ground',triangleId:null,terrainId:'duixiu'}:null;
  for(const c of cm.queryBox(q)){
    let hit=null;
    if(c.triangleSupport)hit=duixiuFootContact(c.triangleSupport,x,z,maxTop,radius);
    else if(c.box.max.y<=maxTop+EPS&&c.box.min.x<=x+radius&&c.box.max.x>=x-radius&&c.box.min.z<=z+radius&&c.box.max.z>=z-radius){
      hit={height:c.box.max.y,witness:new THREE.Vector3(THREE.MathUtils.clamp(x,c.box.min.x,c.box.max.x),c.box.max.y,THREE.MathUtils.clamp(z,c.box.min.z,c.box.max.z)),instanceId:'external-static-top',triangleId:null,terrainId:'duixiu'};
    }
    if(hit&&(!surface||hit.height>surface.height))surface=hit;
  }
  if(!surface)return{surface:null,poseClear:false,blocker:null};
  const eye=new THREE.Vector3(x,surface.height+PLAYER.HEIGHT,z),blocker=duixiuBodySweep(cm,eye,eye,radius);
  return{surface,poseClear:!blocker,blocker};
}

/** One subdivided local motion. Endpoint support never substitutes for sweeps. */
export function duixiuTryStep(cm,from,to,radius,stepUp,motion){
  const feet=from.y-PLAYER.HEIGHT,failed={accepted:false};
  if(!motion||motion.airborne){
    if(duixiuBodySweep(cm,from,to,radius))return failed;
    return{accepted:true,position:to.clone(),feetY:feet,groundY:duixiuContact(cm,to.x,to.z,feet+EPS,radius).surface?.height??0,settled:false};
  }
  const source=duixiuContact(cm,from.x,from.z,feet+1e-6,radius);
  if(!source.surface||!source.poseClear||Math.abs(source.surface.height-feet)>1e-5)return failed;
  const target=duixiuContact(cm,to.x,to.z,feet+stepUp,radius);
  if(!target.surface||!target.poseClear)return failed;
  const ground=target.surface.height,drop=feet-ground;
  if(drop>stepUp){
    if(motion.kind==='kinematic'||duixiuBodySweep(cm,from,to,radius))return failed;
    return{accepted:true,position:to.clone(),feetY:feet,groundY:ground,settled:false};
  }
  const lift=Math.max(feet,ground),raised=new THREE.Vector3(from.x,lift+PLAYER.HEIGHT,from.z),across=new THREE.Vector3(to.x,lift+PLAYER.HEIGHT,to.z),landed=new THREE.Vector3(to.x,ground+PLAYER.HEIGHT,to.z);
  if(duixiuBodySweep(cm,from,raised,radius)||duixiuBodySweep(cm,raised,across,radius)||duixiuBodySweep(cm,across,landed,radius))return failed;
  return{accepted:true,position:landed,feetY:ground,groundY:ground,settled:true,witness:target.surface};
}

/** Pure-state, explicitly local vertical response. No upward ground-query snap. */
export function resolveDuixiuVertical(cm,state,delta,radius=.5){
  const from=new THREE.Vector3(state.x,state.feetY+PLAYER.HEIGHT,state.z);
  if(!duixiuScope(cm,from,from,radius))return null;
  const contact=duixiuContact(cm,state.x,state.z,state.feetY+1e-6,radius);
  if(!state.airborne&&contact.surface&&contact.poseClear&&Math.abs(contact.surface.height-state.feetY)<1e-5)
    return{...state,feetY:contact.surface.height,groundY:contact.surface.height,verticalVelocity:0,airborne:false,onSupport:true,landed:false};
  const velocity=Math.max((state.airborne?state.verticalVelocity:0)-(PLAYER.GRAVITY??14)*delta,-(PLAYER.MAX_FALL_SPEED??30));
  const targetFeet=state.feetY+velocity*delta,to=new THREE.Vector3(state.x,targetFeet+PLAYER.HEIGHT,state.z);
  let impact=duixiuBodySweep(cm,from,to,radius);
  if(velocity<=0&&targetFeet<0&&state.feetY>=0){const fraction=state.feetY/(state.feetY-targetFeet);if(!impact||fraction<impact.fraction)impact={fraction,kind:'ground'};}
  if(!impact)return{...state,feetY:targetFeet,groundY:contact.surface?.height??0,verticalVelocity:velocity,airborne:true,onSupport:false,landed:false};
  const feet=state.feetY+(targetFeet-state.feetY)*Math.max(0,impact.fraction-1e-9),at=duixiuContact(cm,state.x,state.z,feet+1e-6,radius);
  const landed=velocity<=0&&impact.kind!=='dynamic'&&at.surface&&at.poseClear&&Math.abs(at.surface.height-feet)<1e-5;
  return{...state,feetY:landed?at.surface.height:feet,groundY:landed?at.surface.height:at.surface?.height??0,verticalVelocity:0,airborne:!landed,onSupport:!!landed,landed:!!landed,blockedPose:!at.poseClear};
}
