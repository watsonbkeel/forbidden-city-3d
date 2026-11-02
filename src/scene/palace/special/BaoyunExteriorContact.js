import * as T from 'three';
import {PLAYER} from '../../../config/constants.js';
import {pathFootprintCovered} from '../../../controls/WumenJointAscentCoverage.js';
import {wumenJointBodySweep} from '../../../controls/WumenJointAscentSweep.js';
import {isBuiltBaoyunExteriorFrame} from './BaoyunExteriorSteps.js';
const PREFIX='baoyun-exterior-real7/',hosts=new WeakMap(),owners=new WeakMap(),previous=new WeakMap();
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<2e-5,rect=b=>({minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z}),inside=(b,x,z)=>x>=b.min.x&&x<=b.max.x&&z>=b.min.z&&z<=b.max.z;
const sameTop=(w,b)=>w?.type==='box'&&w.rescue===false&&w.box?.equals(b);
function valid(p){const{kit,f}=p,r=kit.root;return isBuiltBaoyunExteriorFrame(f)&&f.parent===r&&r.name==='outer-west'&&r.visible&&f.visible&&!r.position.lengthSq()&&r.rotation.toArray().slice(0,3).every(n=>n===0)&&r.scale.equals(new T.Vector3(1,1,1))&&f.position.equals(new T.Vector3(300.9,0,-217.7))&&f.rotation.toArray().slice(0,3).every(n=>n===0)&&f.scale.equals(new T.Vector3(1,1,1))&&p.rows.every((w,i)=>kit.walkables.includes(w)&&sameTop(w,p.tops[i]))&&p.solids.every((c,i)=>kit.colliders.includes(c)&&c.equals(p.boxes[i]))&&p.meshes.every((m,i)=>m.parent===f&&m.visible&&m.position.toArray().every((n,k)=>n===p.poses[i][k])&&m.rotation.toArray().slice(0,3).every(n=>n===0)&&m.scale.equals(new T.Vector3(1,1,1))&&m.geometry.attributes.position.array.length===p.vertices[i].length&&m.geometry.attributes.position.array.every((n,k)=>n===p.vertices[i][k]));}
export function authorizeBaoyunExteriorContact(kit,f,rows,solids,meshes){
 if(!isBuiltBaoyunExteriorFrame(f)||hosts.has(f)||rows.length!==7||solids.length!==7||meshes.length!==7||rows.some(w=>!Object.isExtensible(w)||w.baoyunExteriorContactId!==undefined))throw Error('Actual completed exterior7 assembly required');
 const p={kit,f,rows,solids,meshes,tops:rows.map(w=>w.box.clone()),boxes:solids.map(c=>c.clone()),poses:meshes.map(m=>m.position.toArray()),vertices:meshes.map(m=>[...m.geometry.attributes.position.array])};if(!valid(p))throw Error('Live original exterior mesh/owner/source mismatch');hosts.set(f,p);rows.forEach((w,i)=>{w.baoyunExteriorContactId=PREFIX+i;owners.set(w,{p,i})});
}
export function preserveBaoyunExteriorContactOwner(target,original){if(original?.baoyunExteriorContactId===undefined)return false;const o=owners.get(original);if(!o||original.baoyunExteriorContactId!==PREFIX+o.i||!valid(o.p)||!sameTop(original,o.p.tops[o.i])||!sameTop(target,o.p.tops[o.i]))throw Error('Baoyun private support source cannot be copied or changed');target.baoyunExteriorContactId=original.baoyunExteriorContactId;owners.set(target,o);return true;}
function live(cm){const rows=cm.walkables.filter(w=>w?.baoyunExteriorContactId?.startsWith(PREFIX));if(rows.length!==7)return null;const first=owners.get(rows[0]),p=first?.p;if(!p||!valid(p))return null;const seen=new Set();for(const w of rows){const o=owners.get(w);if(!o||o.p!==p||seen.has(o.i)||w.baoyunExteriorContactId!==PREFIX+o.i||!sameTop(w,p.tops[o.i]))return null;seen.add(o.i)}for(let i=0;i<7;i++){const a=cm.colliders.filter(c=>c.mesh===p.solids[i]);if(a.length!==1||!a[0].box.equals(p.boxes[i])||a[0].triangleSupport||a[0].overhead)return null;}return p;}
export function resolveBaoyunExteriorContact(cm,s,dt,r=.5){
 const prior=previous.get(cm);previous.delete(cm);
 if(!s||s.airborne!==false||s.verticalVelocity>0||r!==.5||![s.x,s.z,s.feetY,s.groundY,s.verticalVelocity,dt].every(Number.isFinite)||dt<=0||dt>.100001||s.x<298.95||s.x>302.85||s.z< -217.59||s.z> -209.7)return null;
 const p=live(cm);if(!p)return null;const rise=PLAYER.SPRINT_SPEED*dt*.2/.52+.2,ground=cm.getGroundHeight(s.x,s.z,Math.max(s.feetY,s.groundY)+rise,0),on=p.tops.some(b=>inside(b,s.x,s.z)&&near(b.max.y,ground)),toe=near(ground,0)&&s.z<p.tops[0].min.z&&s.z>=p.tops[0].min.z-1.2;
 if(!(on||toe)||ground<0||ground>1.20001)return null;
 if(!prior||prior.p!==p){if(Math.abs(s.feetY-ground)<=.3&&Math.abs(s.groundY-ground)<=.3)previous.set(cm,{p,x:s.x,z:s.z,ground});return null;}
 if(Math.abs(s.feetY-prior.ground)>.3||Math.min(Math.abs(s.groundY-prior.ground),Math.abs(s.groundY-ground))>.3||Math.abs(ground-prior.ground)>rise+1e-5||Math.hypot(s.x-prior.x,s.z-prior.z)>PLAYER.SPRINT_SPEED*dt+1e-6||prior.x<298.95||prior.x>302.85)return null;
 // Bounded EXISTING ground0 handoff, not a new walkable or high-fall rescue.
 const toeRect={minX:298.45,maxX:303.35,minZ:p.tops[0].min.z-1.2,maxZ:p.tops[0].min.z};
 if(!pathFootprintCovered([...p.tops.map(rect),toeRect],[prior.x,prior.z],[s.x,s.z],r))return null;
 previous.set(cm,{p,x:s.x,z:s.z,ground});if(near(ground,prior.ground))return null;
 const from=new T.Vector3(prior.x,s.feetY,prior.z),to=new T.Vector3(s.x,ground,s.z),corner=ground>prior.ground?new T.Vector3(prior.x,ground,prior.z):new T.Vector3(s.x,s.feetY,s.z);
 if(wumenJointBodySweep(cm,from,corner,r).blocked||wumenJointBodySweep(cm,corner,to,r).blocked){previous.delete(cm);return null;}
 return{feetY:ground,groundY:ground,airborne:false,verticalVelocity:0,onSupport:true,landed:false,baoyunExteriorContact:true};
}
