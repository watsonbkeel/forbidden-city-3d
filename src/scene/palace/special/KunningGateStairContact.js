import {retainConstructionBranch} from '../ConstructionSources.js';
import * as T from 'three';
import {PLAYER} from '../../../config/constants.js';
import {pathFootprintCovered} from '../../../controls/WumenJointAscentCoverage.js';
import {wumenJointBodySweep} from '../../../controls/WumenJointAscentSweep.js';
import {isBuiltKunningGateFrame} from './KunningGate.js';
// Private identity only: no new serializable walkable field, substitute ground,
// collider or generic stair grant. The original 36-support inventory is intact.
const hosts=new WeakMap(),owners=new WeakMap(),previous=new WeakMap();
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<2e-6;
const rect=b=>({minX:b.min.x,maxX:b.max.x,minZ:b.min.z,maxZ:b.max.z});
const inside=(b,x,z)=>x>=b.min.x&&x<=b.max.x&&z>=b.min.z&&z<=b.max.z;
const sameTop=(w,b)=>w?.type==='box'&&w.rescue===false&&w.box?.equals(b);
const lanes=Object.freeze([
 {minX:-4.1,maxX:-.1,minZ:426.7,maxZ:429.9,sign:1},
 {minX:2.3,maxX:6.3,minZ:426.7,maxZ:429.9,sign:1},
 {minX:-10.1,maxX:-.1,minZ:415.5,maxZ:418.7,sign:-1},
 {minX:2.3,maxX:12.3,minZ:415.5,maxZ:418.7,sign:-1}
].map(Object.freeze));
function valid(p){const{kit,f}=p,r=kit.root;return isBuiltKunningGateFrame(f)&&f.parent===r&&r.name==='garden'&&r.visible&&f.visible&&!r.position.lengthSq()&&r.rotation.toArray().slice(0,3).every(n=>n===0)&&r.scale.equals(new T.Vector3(1,1,1))&&f.position.equals(new T.Vector3(1.1,0,422.7))&&f.rotation.x===0&&f.rotation.y===Math.PI&&f.rotation.z===0&&f.scale.equals(new T.Vector3(1,1,1))&&f.userData.kunningGate===p.meta&&p.rows.every((w,i)=>kit.walkables.includes(w)&&sameTop(w,p.tops[i]))&&p.solids.every((c,i)=>kit.colliders.includes(c)&&c.equals(p.boxes[i]))&&p.meshes.every((m,i)=>m.parent===f&&m.visible&&m.geometry===p.geometries[i]&&m.position.toArray().every((n,k)=>n===p.poses[i][k])&&m.rotation.toArray().slice(0,3).every(n=>n===0)&&m.scale.equals(new T.Vector3(1,1,1))&&!m.geometry.index&&m.geometry.attributes.position.array.length===p.vertices[i].length&&m.geometry.attributes.position.array.every((n,k)=>n===p.vertices[i][k]));}
/** Called once by the completed canonical gate builder. Match all 32 original
 * closed tread boxes and the original paving box to their existing flat tops.
 * Threshold, two imperial stones and north balustrades are not certified. */
export function authorizeKunningGateStairContact(kit,f){
 if(!isBuiltKunningGateFrame(f)||hosts.has(f)||f.userData.kunningGate?.objectId!=='FC-60FCD2B8CC')throw Error('Kunning contact requires completed canonical gate');
 const rows=kit.walkables.filter(w=>w.supportId==='kunning-platform'||/^kunning--?1--?1-tread-[1-8]$/.test(w.supportId??''));
 const selected=f.children.filter(m=>m.isMesh&&['kunning-platform-paving','kunning-stair-tread'].includes(m.userData.role));
 if(rows.length!==33||selected.length!==33||kit.walkables.filter(w=>w.kunningGate).length!==36)throw Error('Kunning requires exactly33 existing flat tops within36 supports');
 const meshes=[],solids=[];f.updateWorldMatrix(true,true);
 for(const w of rows){if(w.type!=='box'||w.rescue!==false||w.box.min.y!==w.box.max.y||owners.has(w))throw Error('Kunning original flat top differs');
  const ms=selected.filter(m=>{const b=new T.Box3().setFromObject(m);return ['x','z'].every(k=>near(b.min[k],w.box.min[k])&&near(b.max[k],w.box.max[k]))&&near(b.max.y,w.box.max.y)});
  if(ms.length!==1||ms[0].geometry.index||ms[0].geometry.attributes.position.count!==36)throw Error('Kunning top needs unique original closed-box mesh');
  const b=new T.Box3().setFromObject(ms[0]),cs=kit.colliders.filter(c=>['x','y','z'].every(k=>near(c.min[k],b.min[k])&&near(c.max[k],b.max[k])));
  if(cs.length!==1)throw Error('Kunning top needs its unique original physical box');meshes.push(ms[0]);solids.push(cs[0]);
 }
 if(new Set(meshes).size!==33||new Set(solids).size!==33)throw Error('Kunning duplicated original owner');
 const p={kit,f,meta:f.userData.kunningGate,rows,solids,meshes,tops:rows.map(w=>w.box.clone()),boxes:solids.map(c=>c.clone()),poses:meshes.map(m=>m.position.toArray()),geometries:meshes.map(m=>m.geometry),vertices:meshes.map(m=>[...m.geometry.attributes.position.array])};
 if(!valid(p))throw Error('Kunning completed source/owner differs');hosts.set(f,p);rows.forEach((w,i)=>owners.set(w,{p,i}));retainConstructionBranch(kit,f);
}
export function preserveKunningGateStairOwner(target,original){const o=owners.get(original);if(!o)return false;if(!valid(o.p)||!sameTop(original,o.p.tops[o.i])||!sameTop(target,o.p.tops[o.i]))throw Error('Kunning private original support cannot drift');owners.set(target,o);return true;}
function live(cm){const rows=cm.walkables.filter(w=>owners.has(w));if(rows.length!==33)return null;const p=owners.get(rows[0]).p;if(!valid(p))return null;const seen=new Set();for(const w of rows){const o=owners.get(w);if(o.p!==p||seen.has(o.i)||!sameTop(w,p.tops[o.i]))return null;seen.add(o.i)}
 const lookup=new Map();for(const c of cm.colliders){const a=lookup.get(c.mesh)??[];a.push(c);lookup.set(c.mesh,a)}for(let i=0;i<33;i++){const a=lookup.get(p.solids[i]);if(a?.length!==1||!a[0].box.equals(p.boxes[i])||a[0].triangleSupport||a[0].xiqingRoofSurface||a[0].overhead)return null;}return p;}
export function resolveKunningGateStairContact(cm,s,dt,r=.5){
 const prior=previous.get(cm);previous.delete(cm);
 if(!s||s.airborne!==false||s.verticalVelocity>0||r!==.5||![s.x,s.z,s.feetY,s.groundY,s.verticalVelocity,dt].every(Number.isFinite)||dt<=0||dt>.100001)return null;
 const lane=lanes.find(q=>s.x-r>=q.minX&&s.x+r<=q.maxX&&s.z>=q.minZ-(q.sign<0?1.5:1)&&s.z<=q.maxZ+(q.sign>0?1.5:1));if(!lane)return null;
 const p=live(cm);if(!p)return null;const rise=PLAYER.SPRINT_SPEED*dt*.15/.4+.15,ground=cm.getGroundHeight(s.x,s.z,Math.max(s.feetY,s.groundY)+rise,0,r),on=p.tops.some(b=>inside(b,s.x,s.z)&&near(b.max.y,ground)),toe=near(ground,0)&&(lane.sign>0?s.z>lane.maxZ&&s.z<=lane.maxZ+1.5:s.z<lane.minZ&&s.z>=lane.minZ-1.5);
 if(!(on||toe)||ground<0||ground>1.200001)return null;
 if(!prior||prior.p!==p||prior.lane!==lane){if(Math.abs(s.feetY-ground)<=.15+1e-7&&Math.abs(s.groundY-ground)<=.15+1e-7)previous.set(cm,{p,lane,x:s.x,z:s.z,ground});return null;}
 if(Math.abs(s.feetY-prior.ground)>.3||Math.min(Math.abs(s.groundY-prior.ground),Math.abs(s.groundY-ground))>.3||Math.abs(ground-prior.ground)>rise+1e-6||Math.hypot(s.x-prior.x,s.z-prior.z)>PLAYER.SPRINT_SPEED*dt+1e-6||prior.x-r<lane.minX||prior.x+r>lane.maxX)return null;
 previous.set(cm,{p,lane,x:s.x,z:s.z,ground});
 // Ascents and level motion stay entirely native. Only outward real descent
 // may settle; a jump/high fall or departure over a lateral edge never may.
 if(ground>=prior.ground-1e-7||lane.sign*(s.z-prior.z)<=0)return null;
 const toeRect={minX:lane.minX,maxX:lane.maxX,minZ:lane.sign>0?lane.maxZ:lane.minZ-1.5,maxZ:lane.sign>0?lane.maxZ+1.5:lane.minZ};
 if(!pathFootprintCovered([...p.tops.map(rect),toeRect],[prior.x,prior.z],[s.x,s.z],r))return null;
 const from=new T.Vector3(prior.x,s.feetY,prior.z),across=new T.Vector3(s.x,s.feetY,s.z),down=new T.Vector3(s.x,ground,s.z);
 if(wumenJointBodySweep(cm,from,across,r).blocked||wumenJointBodySweep(cm,across,down,r).blocked){previous.delete(cm);return null;}
 return{feetY:ground,groundY:ground,airborne:false,verticalVelocity:0,onSupport:true,landed:false,kunningGateStairContact:true};
}
