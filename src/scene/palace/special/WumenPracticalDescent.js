import * as THREE from 'three';
import {PLAYER} from '../../../config/constants.js';
import {WUMEN_PRACTICAL_FIT as FIT} from './WumenPracticalFit.js';
import {pathFootprintCovered} from '../../../controls/WumenJointAscentCoverage.js';
import {wumenJointBodySweep} from '../../../controls/WumenJointAscentSweep.js';

// Only the twelve real, closed, builder-authored Wumen ramp surfaces opt in.
// No surface is added, raised, extended or inferred here. Native jump, falling,
// water, boundary and body policies remain authoritative outside this descent.
const previous=new WeakMap(),fields=['axis','minX','maxX','minZ','maxZ','a0','a1','y0','y1'];
const expected=FIT.platform.recesses.map(p=>({...p,minZ:p.minZ-419.6,maxZ:p.maxZ-419.6,a0:p.a0-(p.axis==='z'?419.6:0),a1:p.a1-(p.axis==='z'?419.6:0)}));
const inside=(p,x,z)=>x>=p.minX&&x<=p.maxX&&z>=p.minZ&&z<=p.maxZ;
const height=(p,x,z)=>p.y0+(p.y1-p.y0)*((p.axis==='x'?x:z)-p.a0)/(p.a1-p.a0);
const matches=(w,p)=>w.type==='ramp'&&fields.every(k=>w[k]===p[k]);
export function preserveWumenPracticalDescentOwner(target,source){
 const id=source?.wumenPracticalDescentId;if(id===undefined)return;
 const p=expected.find(p=>p.id===id);
 if(!p||!matches(source,p)||!matches(target,p))throw Error('Wumen descent owner must match its actual world ramp');
 target.wumenPracticalDescentId=id;
}
function liveRamps(cm){
 const result=[];
 for(const p of expected){const rows=cm.walkables.filter(w=>w.wumenPracticalDescentId===p.id);if(rows.length!==1||!matches(rows[0],p))return null;result.push(rows[0]);}
 return result;
}
function nearbyRects(cm,ramps,a,b,r){
 const x0=Math.min(a.x,b.x)-r,x1=Math.max(a.x,b.x)+r,z0=Math.min(a.z,b.z)-r,z1=Math.max(a.z,b.z)+r;
 const rects=ramps.map(p=>({minX:p.minX,maxX:p.maxX,minZ:p.minZ,maxZ:p.maxZ}));
 for(const w of cm.walkables)if(w.type==='box'&&w.rescue===false&&Math.abs(w.box.max.y-12.3)<.001&&w.box.max.x>=x0&&w.box.min.x<=x1&&w.box.max.z>=z0&&w.box.min.z<=z1)rects.push({minX:w.box.min.x,maxX:w.box.max.x,minZ:w.box.min.z,maxZ:w.box.max.z});
 return rects.length<=64?rects:null;
}
export function resolveWumenPracticalDescent(cm,state,delta,radius=.5){
 const prior=previous.get(cm);previous.delete(cm);
 if(!state||state.airborne!==false||state.verticalVelocity>0||radius!==.5||![state.x,state.z,state.feetY,state.groundY,state.verticalVelocity,delta].every(Number.isFinite)||delta<=0||delta>.100001)return null;
 if(!expected.some(p=>state.x>=p.minX-1.5&&state.x<=p.maxX+1.5&&state.z>=p.minZ-1.5&&state.z<=p.maxZ+1.5))return null;
 const ramps=liveRamps(cm);if(!ramps)return null;
 const ground=cm.getGroundHeight(state.x,state.z,Math.max(state.feetY,state.groundY),PLAYER.STEP_UP),ramp=ramps.find(p=>inside(p,state.x,state.z)&&Math.abs(height(p,state.x,state.z)-ground)<.000001);
 const terrace=cm.walkables.some(w=>w.type==='box'&&w.rescue===false&&Math.abs(w.box.max.y-12.3)<.001&&state.x>=w.box.min.x&&state.x<=w.box.max.x&&state.z>=w.box.min.z&&state.z<=w.box.max.z&&Math.abs(w.box.max.y-ground)<.000001);
 if(ramp||terrace)previous.set(cm,{x:state.x,z:state.z,ground});
 // Neck/return already stay within the 0.3m budget and retain native descent.
 // Only the steep entry/outward runs need the narrow grounded contact policy.
 // Native supportHeight may report the uphill slice under the wider foot,
 // up to 0.3m above the actual centre plane. Never confuse that with lost support.
 if(!ramp||!['entry','outward'].some(part=>ramp.wumenPracticalDescentId.endsWith('/'+part))||!prior||Math.abs(state.groundY-prior.ground)>.3||Math.abs(state.feetY-prior.ground)>.3||ground>=prior.ground-.000001||ground>=state.feetY-.02)return null;
 if(Math.hypot(state.x-prior.x,state.z-prior.z)>PLAYER.SPRINT_SPEED*delta+.000001)return null;
 const rects=nearbyRects(cm,ramps,prior,state,radius);
 if(!rects||!pathFootprintCovered(rects,[prior.x,prior.z],[state.x,state.z],radius))return null;
 const from=new THREE.Vector3(prior.x,state.feetY,prior.z),to=new THREE.Vector3(state.x,ground,state.z);
 if(wumenJointBodySweep(cm,from,to,radius).blocked)return null;
 return{feetY:ground,groundY:ground,airborne:false,verticalVelocity:0,onSupport:true,landed:false,wumenPracticalDescent:true};
}
