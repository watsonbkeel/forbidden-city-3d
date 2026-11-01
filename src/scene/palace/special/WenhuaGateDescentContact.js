import * as T from 'three';
import {PLAYER} from '../../../config/constants.js';
import {wenhuaGateDescentProof} from './WenhuaGateApproaches.js';
import {xiqingSurfaceFootContact} from '../../../controls/XiqingRoofSurface.js';
import {pathFootprintCovered} from '../../../controls/WumenJointAscentCoverage.js';
import {wumenJointBodySweep} from '../../../controls/WumenJointAscentSweep.js';
const previous=new WeakMap(),validated=new WeakMap(),near=(a,b)=>Math.abs(a-b)<1e-7;
function live(cm){
 const rows=cm.colliders?.filter(c=>c.xiqingRoofSurface?.id==='wenhua-gate-approach-south');if(rows?.length!==1)return null;
 const row=rows[0],proof=wenhuaGateDescentProof(row.mesh),shape=row.xiqingRoofSurface;if(!proof||!row.box.equals(shape.box)||!row.box.equals(proof.shape.box))return null;
 if(validated.get(shape)!==proof){const a=shape.template.sourceFaces,b=proof.shape.template.sourceFaces;if(a.length!==b.length||a.some((f,i)=>JSON.stringify(f.source)!==JSON.stringify(b[i].source)||f.vertices.some((p,k)=>!p.equals(b[i].vertices[k]))))return null;validated.set(shape,proof);}
 return {row,proof,shape};
}
/** Only authenticated existing southern horizontal tread faces. No floor is
 * allocated: even toe handoff requires the ordinary ground query to be zero. */
export function resolveWenhuaGateDescent(cm,state,delta,radius=.5){
 const old=previous.get(cm);previous.delete(cm);
 if(!state||state.airborne!==false||state.verticalVelocity>0||radius!==.5||![state.x,state.z,state.feetY,state.groundY,state.verticalVelocity,delta].every(Number.isFinite)||delta<=0||delta>.100001)return null;
 if(state.x< -196.1||state.x> -176.5||state.z< -259||state.z> -253.5)return null;
 const v=live(cm);if(!v)return null;const {proof,shape}=v;
 const lane=proof.lanes.find(r=>state.x-radius>=r.minX&&state.x+radius<=r.maxX&&state.z>=r.minZ-1.5&&state.z<=r.maxZ+1);
 if(!lane)return null;
 const hit=xiqingSurfaceFootContact(shape,state.x,state.z,Math.max(state.feetY,state.groundY)+.6,radius),ground=cm.getGroundHeight(state.x,state.z,Math.max(state.feetY,state.groundY)+.6,radius);
 const on=hit&&proof.meshes.includes(hit.source.mesh)&&near(hit.height,ground),toe=near(ground,0)&&state.z<lane.minZ&&state.z>=lane.minZ-1.5;
 if(!(on||toe)||ground<0||ground>.811)return null;
 previous.set(cm,{x:state.x,z:state.z,ground,lane,proof});
 if(!old||old.proof!==proof||old.lane!==lane||Math.abs(state.feetY-old.ground)>.15||Math.abs(state.groundY-old.ground)>.15||ground>=old.ground-1e-6||old.ground-ground>.6)return null;
 if(state.z>=old.z||Math.hypot(state.x-old.x,state.z-old.z)>PLAYER.SPRINT_SPEED*delta+1e-6)return null;
 if([old,state].some(p=>p.x-radius<lane.minX||p.x+radius>lane.maxX))return null;
 const rects=[...proof.rects,{minX:lane.minX,maxX:lane.maxX,minZ:lane.minZ-1.5,maxZ:lane.minZ}];
 if(!pathFootprintCovered(rects,[old.x,old.z],[state.x,state.z],radius))return null;
 // Actual discrete treads: move across at the supported old height, then
 // settle vertically after clearing its edge; a diagonal would cut the riser.
 const from=new T.Vector3(old.x,state.feetY,old.z),across=new T.Vector3(state.x,state.feetY,state.z),down=new T.Vector3(state.x,ground,state.z);
 if(wumenJointBodySweep(cm,from,across,radius).blocked||wumenJointBodySweep(cm,across,down,radius).blocked)return null;
 return {feetY:ground,groundY:ground,airborne:false,verticalVelocity:0,onSupport:true,landed:false,wenhuaGateDescentContact:true};
}
