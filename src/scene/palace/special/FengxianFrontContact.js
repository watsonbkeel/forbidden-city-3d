import * as T from 'three';
import {PLAYER} from '../../../config/constants.js';
import {pathFootprintCovered} from '../../../controls/WumenJointAscentCoverage.js';
import {wumenJointBodySweep} from '../../../controls/WumenJointAscentSweep.js';
import {isBuiltFengxianFrontSteps} from './FengxianFrontSteps.js';
const hosts=new WeakMap(),owners=new WeakMap(),previous=new WeakMap();
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<2e-5;
const rect=b=>({minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z});
const inside=(b,x,z)=>x>=b.min.x&&x<=b.max.x&&z>=b.min.z&&z<=b.max.z;
const lane=x=>Math.abs(x+197.3)<=2?-197.3:Math.abs(x+167.3)<=2?-167.3:null;
const sameTop=(w,b,rescue)=>w?.type==='box'&&w.rescue===rescue&&w.box?.equals(b);
function valid(p){const{kit,frame,host}=p,r=kit.root;return isBuiltFengxianFrontSteps(frame)&&frame.parent===r&&host.parent===r&&r.name==='east-six'&&r.visible&&frame.visible&&host.visible&&!r.position.lengthSq()&&r.rotation.toArray().slice(0,3).every(n=>n===0)&&r.scale.equals(new T.Vector3(1,1,1))&&!frame.position.lengthSq()&&frame.rotation.toArray().slice(0,3).every(n=>n===0)&&frame.scale.equals(new T.Vector3(1,1,1))&&host.position.equals(new T.Vector3(-182.3,0,253.3))&&host.rotation.toArray().slice(0,3).every(n=>n===0)&&host.scale.equals(new T.Vector3(1,1,1))&&p.rows.every((w,i)=>kit.walkables.includes(w)&&sameTop(w,p.tops[i],p.rescue[i]))&&p.solids.every((c,i)=>kit.colliders.includes(c)&&c.equals(p.boxes[i]))&&p.meshes.every((m,i)=>m.parent===(i===16?host:frame)&&m.visible&&m.position.toArray().every((n,k)=>n===p.poses[i][k])&&m.rotation.toArray().slice(0,3).every(n=>n===0)&&m.scale.equals(new T.Vector3(1,1,1))&&m.geometry.attributes.position.array.length===p.vertices[i].length&&m.geometry.attributes.position.array.every((n,k)=>n===p.vertices[i][k]));}
export function authorizeFengxianFrontContact(kit,frame,host,rows,solids,meshes){
 if(!isBuiltFengxianFrontSteps(frame)||hosts.has(frame)||rows.length!==17||solids.length!==17||meshes.length!==17||rows.some(w=>owners.has(w)))throw Error('Actual completed two-side-flight assembly required');
 const p={kit,frame,host,rows,solids,meshes,tops:rows.map(w=>w.box.clone()),rescue:rows.map(w=>w.rescue),boxes:solids.map(c=>c.clone()),poses:meshes.map(m=>m.position.toArray()),vertices:meshes.map(m=>[...m.geometry.attributes.position.array])};if(!valid(p))throw Error('Live Fengxian visible source/top/body mismatch');hosts.set(frame,p);rows.forEach((w,i)=>owners.set(w,{p,i}));
}
// WeakMap-only certificate leaves the original platform's public fields intact.
export function preserveFengxianFrontContactOwner(target,original){const o=owners.get(original);if(!o)return false;if(!valid(o.p)||!sameTop(original,o.p.tops[o.i],o.p.rescue[o.i])||!sameTop(target,o.p.tops[o.i],o.p.rescue[o.i]!==false))throw Error('Fengxian private support cannot be changed/copied');owners.set(target,o);return true;}
function live(cm){const rows=cm.walkables.filter(w=>owners.has(w));if(rows.length!==17)return null;const p=owners.get(rows[0]).p;if(!valid(p))return null;const seen=new Set();for(const w of rows){const o=owners.get(w);if(o.p!==p||seen.has(o.i)||!sameTop(w,p.tops[o.i],p.rescue[o.i]!==false))return null;seen.add(o.i)}for(let i=0;i<17;i++){const a=cm.colliders.filter(c=>c.mesh===p.solids[i]);if(a.length!==1||!a[0].box.equals(p.boxes[i])||a[0].triangleSupport||a[0].overhead)return null}return p;}
export function resolveFengxianFrontContact(cm,s,dt,r=.5){
 const prior=previous.get(cm);previous.delete(cm);const x=lane(s?.x);
 if(x===null||!s||s.airborne!==false||s.verticalVelocity>0||r!==.5||![s.x,s.z,s.feetY,s.groundY,s.verticalVelocity,dt].every(Number.isFinite)||dt<=0||dt>.100001||s.z<231.49||s.z>237.2)return null;
 const p=live(cm);if(!p)return null;const tops=p.tops.slice(x===-197.3?0:8,x===-197.3?8:16),rise=PLAYER.SPRINT_SPEED*dt*.15/.52+.15,ground=cm.getGroundHeight(s.x,s.z,Math.max(s.feetY,s.groundY)+rise,0),on=[...tops,p.tops[16]].some(b=>inside(b,s.x,s.z)&&near(b.max.y,ground)),toe=near(ground,0)&&s.z<tops[0].min.z&&s.z>=tops[0].min.z-1.2;
 if(!(on||toe)||ground<0||ground>1.20001)return null;
 if(!prior||prior.p!==p||prior.lane!==x){if(Math.abs(s.feetY-ground)<=.3&&Math.abs(s.groundY-ground)<=.3)previous.set(cm,{p,lane:x,x:s.x,z:s.z,ground});return null}
 if(Math.abs(s.feetY-prior.ground)>.3||Math.min(Math.abs(s.groundY-prior.ground),Math.abs(s.groundY-ground))>.3||Math.abs(ground-prior.ground)>rise+1e-5||Math.hypot(s.x-prior.x,s.z-prior.z)>PLAYER.SPRINT_SPEED*dt+1e-6||lane(prior.x)!==x)return null;
 const toeRect={minX:x-2.5,maxX:x+2.5,minZ:tops[0].min.z-1.2,maxZ:tops[0].min.z};
 // The old platform participates only inside this lane. No centre stair,
 // across-platform shortcut, first high fall or new ground0 surface is added.
 const landing={minX:x-2.5,maxX:x+2.5,minZ:p.tops[16].min.z,maxZ:237.7};
 if(!pathFootprintCovered([...tops.map(rect),landing,toeRect],[prior.x,prior.z],[s.x,s.z],r))return null;
 previous.set(cm,{p,lane:x,x:s.x,z:s.z,ground});if(near(ground,prior.ground))return null;
 const from=new T.Vector3(prior.x,s.feetY,prior.z),to=new T.Vector3(s.x,ground,s.z),corner=ground>prior.ground?new T.Vector3(prior.x,ground,prior.z):new T.Vector3(s.x,s.feetY,s.z);
 if(wumenJointBodySweep(cm,from,corner,r).blocked||wumenJointBodySweep(cm,corner,to,r).blocked){previous.delete(cm);return null}
 return{feetY:ground,groundY:ground,airborne:false,verticalVelocity:0,onSupport:true,landed:false,fengxianFrontContact:true};
}
