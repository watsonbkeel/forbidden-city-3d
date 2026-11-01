import * as THREE from 'three';
import {PLAYER} from '../../config/constants.js';
import source from '../../../data/architecture/b-practical-stair-contacts.json' with {type:'json'};
import donghuaSource from '../../../data/architecture/donghua-madao-contacts.json' with {type:'json'};
import {pathFootprintCovered} from '../../controls/WumenJointAscentCoverage.js';
import {wumenJointBodySweep} from '../../controls/WumenJointAscentSweep.js';

// An allowlist of existing builder-authored surfaces, not generated supports.
// Original group dimensions come from the unchanged e640 runtime inventory;
// the separately host-bound Donghua group comes from its c0f5548b built surfaces. Neither this
// module nor its hooks allocate a mesh, collider, walkable or alternative ground.
const groups=[...source.groups,donghuaSource];
const all=new Map(groups.flatMap(g=>g.surfaces.map(p=>[p.id,p]))),previous=new WeakMap();
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-8;
const rect=w=>w.type==='ramp'?w:{minX:w.box.min.x,maxX:w.box.max.x,minZ:w.box.min.z,maxZ:w.box.max.z};
const inside=(p,x,z)=>x>=p.minX&&x<=p.maxX&&z>=p.minZ&&z<=p.maxZ;
const height=(w,x,z)=>w.type==='box'?w.box.max.y:w.y0+(w.y1-w.y0)*((w.axis==='x'?x:z)-w.a0)/(w.a1-w.a0);
function matches(w,p){return w?.type===p.type&&(p.type==='ramp'?w.axis===p.axis&&['minX','maxX','minZ','maxZ','a0','a1','y0','y1'].every(k=>near(w[k],p[k])):w.box?.isBox3&&p.min.every((v,i)=>near(w.box.min.getComponent(i),v))&&p.max.every((v,i)=>near(w.box.max.getComponent(i),v)));}
export function registerBPrincipalStairs(builder,parent,groupId,walkableStart){
 const group=groups.find(p=>p.id===groupId);
 if(!group||!Number.isInteger(walkableStart)||walkableStart<0||walkableStart>builder.walkables.length)return false;
 if(groupId==='donghua-madao'){
  if(parent?.name!=='city-gate-东华门'||parent.position.x!==-365.8||parent.position.z!==-257||parent.rotation.y!==Math.PI/2||parent.userData.donghuaMadao?.objectId!=='FC-C8AD5BD621'||parent.userData.cityGate?.portalCount!==3||!builder.root?.children.includes(parent))return false;
 }else if(groupId==='three-halls'?(parent?.name!=='三台'||builder.ox!==0||builder.oz!==0):parent?.userData.pavilion?.profile!==groupId)return false;
 const owned=builder.walkables.slice(walkableStart),rows=group.surfaces.map(p=>owned.filter(w=>matches(w,p)));
 // Partial test fragments and changed future geometry retain native policy;
 // they cannot silently borrow the complete current assembly's contact grant.
 if(rows.some(r=>r.length!==1))return false;
 rows.forEach(([w],i)=>{w.bPrincipalStairId=group.surfaces[i].id;});return true;
}
export function preserveBPrincipalStairOwner(target,original){
 const id=original?.bPrincipalStairId;if(id===undefined)return;
 const p=all.get(id);if(!p||!matches(original,p)||!matches(target,p))throw Error('B stair contact owner differs from its existing source surface');
 target.bPrincipalStairId=id;
}
function live(cm,group){
 const ids=new Set(group.surfaces.map(p=>p.id)),found=new Map();
 for(const w of cm.walkables)if(w.bPrincipalStairId?.startsWith(group.id+'/')){if(!ids.has(w.bPrincipalStairId)||found.has(w.bPrincipalStairId))return null;found.set(w.bPrincipalStairId,w);}
 if(found.size!==ids.size)return null;
 const rows=group.surfaces.map(p=>found.get(p.id));return rows.every((w,i)=>matches(w,group.surfaces[i]))?rows:null;
}
function toeRect(r){
 const at=r.y0===0?r.a0:r.y1===0?r.a1:null;if(at===null)return null;
 const other=at===r.a0?r.a1:r.a0,dir=Math.sign(at-other),a=at+dir*1.5;
 return r.axis==='x'?{minX:Math.min(at,a),maxX:Math.max(at,a),minZ:r.minZ,maxZ:r.maxZ}:{minX:r.minX,maxX:r.maxX,minZ:Math.min(at,a),maxZ:Math.max(at,a)};
}
export function resolveBPrincipalStairContact(cm,state,delta,radius=.5){
 const prior=previous.get(cm);previous.delete(cm);
 if(!state||state.airborne!==false||state.verticalVelocity>0||radius!==.5||![state.x,state.z,state.feetY,state.groundY,state.verticalVelocity,delta].every(Number.isFinite)||delta<=0||delta>.100001)return null;
 const group=groups.find(g=>g.surfaces.some(p=>p.type==='ramp'&&state.x>=p.minX-1.5&&state.x<=p.maxX+1.5&&state.z>=p.minZ-1.5&&state.z<=p.maxZ+1.5));if(!group)return null;
 const rows=live(cm,group);if(!rows)return null;
 const ramps=rows.filter(w=>w.type==='ramp'),toes=ramps.map(toeRect).filter(Boolean);
 // At 10 Hz a legitimate sprint crosses more than one 0.6 m substep. Query
 // the real registry up to the finite rise of these exact slopes over one
 // frame; the later path/body checks still require continuous actual support.
 const rise=prior?.group===group.id?PLAYER.SPRINT_SPEED*delta*Math.max(...ramps.map(r=>Math.abs((r.y1-r.y0)/(r.a1-r.a0)))):PLAYER.STEP_UP;
 const ground=cm.getGroundHeight(state.x,state.z,Math.max(state.feetY,state.groundY)+rise+1e-8,0);
 const owned=rows.some(w=>inside(rect(w),state.x,state.z)&&near(height(w,state.x,state.z),ground)),ramp=ramps.find(w=>inside(w,state.x,state.z)&&near(height(w,state.x,state.z),ground)),toe=near(ground,0)&&toes.some(p=>inside(p,state.x,state.z));
 if(owned||toe)previous.set(cm,{group:group.id,x:state.x,z:state.z,ground,ramp:ramp?.bPrincipalStairId});
 if(!prior||prior.group!==group.id||!(owned||toe)||(!ramp&&!prior.ramp)||Math.abs(state.groundY-prior.ground)>.3||Math.abs(state.feetY-prior.ground)>.3||Math.abs(ground-prior.ground)<1e-6)return null;
 if(Math.hypot(state.x-prior.x,state.z-prior.z)>PLAYER.SPRINT_SPEED*delta+1e-6)return null;
 const active=ramp??ramps.find(r=>r.bPrincipalStairId===prior.ramp),cross=active.axis==='x'?'z':'x',lo=active.axis==='x'?active.minZ:active.minX,hi=active.axis==='x'?active.maxZ:active.maxX;
 // Never turn a lateral edge departure into attachment to a lower terrace.
 if([prior,state].some(p=>p[cross]-radius<lo||p[cross]+radius>hi))return null;
 const x0=Math.min(prior.x,state.x)-radius,x1=Math.max(prior.x,state.x)+radius,z0=Math.min(prior.z,state.z)-radius,z1=Math.max(prior.z,state.z)+radius;
 const rects=[...rows.map(rect),...toes].filter(p=>p.maxX>=x0&&p.minX<=x1&&p.maxZ>=z0&&p.minZ<=z1);
 if(rects.length>64||!pathFootprintCovered(rects,[prior.x,prior.z],[state.x,state.z],radius))return null;
 if(wumenJointBodySweep(cm,new THREE.Vector3(prior.x,state.feetY,prior.z),new THREE.Vector3(state.x,ground,state.z),radius).blocked)return null;
 return{feetY:ground,groundY:ground,airborne:false,verticalVelocity:0,onSupport:true,landed:false,bPrincipalStairContact:true};
}
