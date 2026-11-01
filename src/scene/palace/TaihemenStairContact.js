import * as THREE from 'three';
import {PLAYER} from '../../config/constants.js';
import {pathFootprintCovered} from '../../controls/WumenJointAscentCoverage.js';
import {wumenJointBodySweep} from '../../controls/WumenJointAscentSweep.js';
import {taihemenSouthProfile} from './TaihemenObservedApproach.js';

// Authenticate the three existing visible stairs and their two existing decks.
// This is contact tracking, not a new floor, slope, geometry or global gravity rule.
const south=taihemenSouthProfile({zEdge:-225.47,y0:0,y1:3.44,run:5.504,width:11.748,halfWidth:25.03});
const ramps=[...south.flights.map(f=>({...f.ramp,id:f.id})),{id:'taihemen-north-existing-stair',type:'ramp',axis:'z',minX:-5.424,maxX:5.424,minZ:-201.93,maxZ:-196.426,a0:-201.93,a1:-196.426,y0:3.44,y1:0}];
const decks=[{id:'taihemen-existing-main-deck',type:'box',minX:-25.03,maxX:25.03,minZ:-225.47,maxZ:-201.93,y:3.44},{id:'taihemen-existing-south-extension',type:'box',minX:-25.03,maxX:25.03,minZ:south.zEdge,maxZ:-225.47,y:3.44}];
const expected=[...ramps,...decks],previous=new WeakMap(),near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-8;
const inside=(r,x,z)=>x>=r.minX&&x<=r.maxX&&z>=r.minZ&&z<=r.maxZ;
function matches(w,p){return w?.type===p.type&&(p.type==='ramp'?
 w.axis===p.axis&&['minX','maxX','minZ','maxZ','a0','a1','y0','y1'].every(k=>near(w[k],p[k])):
 w.box?.isBox3&&near(w.box.min.x,p.minX)&&near(w.box.max.x,p.maxX)&&near(w.box.min.z,p.minZ)&&near(w.box.max.z,p.maxZ)&&near(w.box.min.y,p.y)&&near(w.box.max.y,p.y));}
export function registerTaihemenStairContact(builder,parent){
 if(parent?.name!=='太和门'||builder.ox!==0||builder.oz!==0||parent.userData.taihemenSouth?.candidateStatus!=='PRODUCTION_C_SOURCE_FIT_NOT_SURVEY')throw Error('Taihemen stair contact requires the existing actual host');
 const rows=expected.map(p=>{const found=builder.walkables.filter(w=>matches(w,p));if(found.length!==1)throw Error('Taihemen stair contact needs unique existing surface '+p.id);return[found[0],p.id];});
 for(const[w,id]of rows)w.taihemenStairContactId=id;
}
export function preserveTaihemenStairContactOwner(target,source){
 const id=source?.taihemenStairContactId;if(id===undefined)return;
 const p=expected.find(p=>p.id===id);if(!p||!matches(source,p)||!matches(target,p))throw Error('Taihemen contact owner must match actual existing geometry');
 target.taihemenStairContactId=id;
}
export function resolveTaihemenStairContact(cm,state,delta,radius=.5){
 const prior=previous.get(cm);previous.delete(cm);
 if(!state||state.airborne!==false||state.verticalVelocity>0||radius!==.5||![state.x,state.z,state.feetY,state.groundY,state.verticalVelocity,delta].every(Number.isFinite)||delta<=0||delta>.100001)return null;
 if(state.x<-26||state.x>26||state.z<south.zToe-1.5||state.z>-194.9)return null;
 // Removal, duplicate registrations and changed geometry all fail closed.
 const live=expected.map(p=>cm.walkables.filter(w=>w.taihemenStairContactId===p.id));
 if(live.some((rows,i)=>rows.length!==1||!matches(rows[0],expected[i])))return null;
 const actual=live.slice(0,3).map(rows=>rows[0]),actualDecks=live.slice(3).map(([w])=>({minX:w.box.min.x,maxX:w.box.max.x,minZ:w.box.min.z,maxZ:w.box.max.z,y:w.box.max.y})),ground=cm.getGroundHeight(state.x,state.z,Math.max(state.feetY,state.groundY),PLAYER.STEP_UP);
 const ramp=actual.find(p=>inside(p,state.x,state.z)&&near(ground,p.y0+(p.y1-p.y0)*(state.z-p.a0)/(p.a1-p.a0)));
 const deck=actualDecks.find(p=>inside(p,state.x,state.z)&&near(ground,p.y));
 // Only the real ground immediately beyond a zero-height stair toe is a valid
 // transition. It remains native ground (getGroundHeight==0), never a support row.
 const toes=actual.map(p=>({minX:p.minX,maxX:p.maxX,minZ:p.a1<p.a0?p.a1-1.5:p.a1,maxZ:p.a1<p.a0?p.a1:p.a1+1.5}));
 const toe=near(ground,0)&&toes.some(p=>inside(p,state.x,state.z));
 if(ramp||deck||toe)previous.set(cm,{x:state.x,z:state.z,ground,onRamp:!!ramp});
 if(!prior||(!ramp&&!prior.onRamp)||!(ramp||deck||toe)||Math.abs(state.groundY-prior.ground)>.3||Math.abs(state.feetY-prior.ground)>.3||Math.abs(ground-prior.ground)<1e-6)return null;
 if(Math.hypot(state.x-prior.x,state.z-prior.z)>PLAYER.SPRINT_SPEED*delta+1e-6)return null;
 const rects=[...actual,...actualDecks,...toes];
 if(!pathFootprintCovered(rects,[prior.x,prior.z],[state.x,state.z],radius))return null;
 if(wumenJointBodySweep(cm,new THREE.Vector3(prior.x,state.feetY,prior.z),new THREE.Vector3(state.x,ground,state.z),radius).blocked)return null;
 return{feetY:ground,groundY:ground,airborne:false,verticalVelocity:0,onSupport:true,landed:false,taihemenStairContact:true};
}
