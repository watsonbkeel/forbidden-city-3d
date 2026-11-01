import {WUMEN_JOINT_ASCENT_FIT} from './WumenJointAscentFit.js';
import {validateWumenJointAscentBinding} from './WumenJointAscentContact.js';
import {pathFootprintCovered} from './WumenJointAscentCoverage.js';
import {wumenJointBodySweep} from './WumenJointAscentSweep.js';

// Isolated connected-rig grounded substep only. No shared controller hook,
// ground entry, landing or release-to-air is implemented here.
const sameHeight=(a,b)=>Math.abs(a-b)<=64*Number.EPSILON*Math.max(1,Math.abs(a),Math.abs(b));
const refused=status=>({status,accepted:false,releaseImplemented:false});
const contains=(p,x,z)=>x>=p.minX&&x<=p.maxX&&z>=p.minZ&&z<=p.maxZ;
const height=(p,x,z)=>p.y0+(p.y1-p.y0)*((p.axis==='x'?x:z)-p.a0)/(p.a1-p.a0);
function intersectsFootprintPath(p,from,to,r){
 let enter=0,leave=1;
 for(const [axis,lo,hi] of [['x',p.minX-r,p.maxX+r],['z',p.minZ-r,p.maxZ+r]]){
  const d=to[axis]-from[axis];
  if(d===0){if(from[axis]<lo||from[axis]>hi)return false;continue;}
  const a=(lo-from[axis])/d,b=(hi-from[axis])/d;
  enter=Math.max(enter,Math.min(a,b));leave=Math.min(leave,Math.max(a,b));
  if(enter>leave)return false;
 }
 return true;
}
// XZ adjacency has no gap tolerance. Only arithmetic height round trips get
// 64 scaled machine-epsilon allowance; a height mismatch cannot turn a detached floor into support.
function adjacent(a,b){
 const x0=Math.max(a.minX,b.minX),x1=Math.min(a.maxX,b.maxX),z0=Math.max(a.minZ,b.minZ),z1=Math.min(a.maxZ,b.maxZ);
 if(!((x0===x1&&z0<z1)||(z0===z1&&x0<x1)))return false;
 return [[x0,z0],[x1,z1]].every(([x,z])=>sameHeight(height(a,x,z),height(b,x,z)));
}
function connected(live,seeds){
 const branch=[...seeds];for(let i=0;i<branch.length;i++)for(const p of live)if(!branch.includes(p)&&adjacent(branch[i],p))branch.push(p);return branch;
}
function pathEvents(branch,from,to){
 const events=[0,1];for(const p of branch)for(const [axis,edges]of[['x',[p.minX,p.maxX]],['z',[p.minZ,p.maxZ]]]){
  const d=to[axis]-from[axis];if(d===0)continue;for(const edge of edges){const t=(edge-from[axis])/d;if(t>0&&t<1)events.push(t);}
 }
 return [...new Set(events)].sort((a,b)=>a-b);
}
export function tryWumenJointGroundStep(cm,from,to,state,radius=.5){
 if(![from,to].every(p=>p?.isVector3&&p.toArray().every(Number.isFinite))||!Number.isFinite(radius)||radius<=0||!state||typeof state.airborne!=='boolean')throw TypeError('Wumen joint step requires finite feet and explicit movement state');
 // Fixed expected domain does not shrink when a real owner has been removed.
 const domain=WUMEN_JOINT_ASCENT_FIT.pieces.filter(p=>intersectsFootprintPath(p,from,to,radius));
 if(!domain.length)return{status:'OUTSIDE'};
 const binding=validateWumenJointAscentBinding(cm);
 if(!binding)return{status:'OUTSIDE'};
 if(radius!==.5)return refused('UNSUPPORTED_RADIUS');
 if(state.kind!=='player')return refused('UNSUPPORTED_ACTOR');
 if(state.airborne)return refused('AIRBORNE_UNHANDLED');
 if(Math.hypot(to.x-from.x,to.z-from.z)>radius*.5)return refused('SUBSTEP_TOO_LONG');
 const live=WUMEN_JOINT_ASCENT_FIT.pieces.filter(p=>binding.ownerIDs.includes(p.id)),starts=live.filter(p=>contains(p,from.x,from.z)),ends=live.filter(p=>contains(p,to.x,to.z));
 if(!starts.length||!ends.length)return refused('UNSUPPORTED');
 // Tiny numeric round-trip allowance only; never choose a lower implicit floor.
 const matching=starts.filter(p=>sameHeight(height(p,from.x,from.z),from.y));
 if(!matching.length)return refused('INVALID_START');
 const branch=connected(live,matching);
 if(!ends.some(p=>branch.includes(p)))return refused('UNSUPPORTED');
 if(!pathFootprintCovered(branch,[from.x,from.z],[to.x,to.z],radius))return refused('PARTIAL_SUPPORT');
 const events=pathEvents(branch,from,to),at=t=>({x:from.x+(to.x-from.x)*t,z:from.z+(to.z-from.z)*t});
 let position=from.clone(),ownerID=null;
 for(let i=1;i<events.length;i++){
  const lo=events[i-1],hi=events[i],mid=at(lo+(hi-lo)/2),planes=branch.filter(p=>contains(p,mid.x,mid.z));
  if(!planes.length)return refused('UNSUPPORTED');
  const p=planes[0],a=at(lo),b=at(hi);
  if(planes.some(q=>[a,b].some(v=>!sameHeight(height(q,v.x,v.z),height(p,v.x,v.z)))))return refused('AMBIGUOUS_HEIGHT');
  if(!sameHeight(position.y,height(p,a.x,a.z)))return refused('DISCONTINUOUS_HEIGHT');
  const next=to.clone();next.set(b.x,height(p,b.x,b.z),b.z);
  if(wumenJointBodySweep(cm,position,next,radius).blocked)return refused('BODY_BLOCKED');
  position=next;ownerID=p.id;
 }
 return{status:'SUPPORTED',accepted:true,feetY:position.y,position,ownerID,branchIDs:branch.map(p=>p.id),routeAcceptance:false};
}
