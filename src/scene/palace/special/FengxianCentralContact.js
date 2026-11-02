import * as T from 'three';
import {PLAYER} from '../../../config/constants.js';
import {pathFootprintCovered} from '../../../controls/WumenJointAscentCoverage.js';
import {wumenJointBodySweep} from '../../../controls/WumenJointAscentSweep.js';
const hosts=new WeakMap(),owners=new WeakMap(),previous=new WeakMap();
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<2e-5;
const keys=['minX','maxX','minZ','maxZ','a0','a1','y0','y1'];
const expected={minX:-184.6,maxX:-180,minZ:234.93,maxZ:236.85,a0:236.85,a1:234.93,y0:1.2,y1:0};
const same=(w,p,i,normalized=false)=>i===0?w?.type==='ramp'&&w.axis==='z'&&keys.every(k=>w[k]===p.ramp[k]):w?.type==='box'&&w.box?.equals(p.top)&&w.rescue===(normalized?true:p.sourceRescue);
const unit=o=>o.rotation.toArray().slice(0,3).every(n=>n===0)&&o.scale.equals(new T.Vector3(1,1,1));
function valid(p){const{kit,host}=p,r=kit.root;return r.name==='east-six'&&r.visible&&host.parent===r&&host.visible&&!r.position.lengthSq()&&unit(r)&&unit(host)&&host.position.equals(new T.Vector3(-182.3,0,253.3))&&p.rows.every((w,i)=>kit.walkables.includes(w)&&same(w,p,i))&&kit.colliders.includes(p.body)&&p.body.equals(p.bodyBox)&&p.meshes.every((m,i)=>m.parent===host&&m.visible&&unit(m)&&m.position.toArray().every((n,k)=>n===p.positions[i][k])&&m.geometry.attributes.position.array.length===p.vertices[i].length&&m.geometry.attributes.position.array.every((n,k)=>n===p.vertices[i][k]));}
/** Certifies the ALREADY PRESENT analytic ramp, not eight new tread surfaces.
 * Original visible discrete steps differ from that ramp by <= .133334m.
 * No geometry, collider, walkable, public metadata or access change. */
export function registerFengxianCentralContact(kit){
 if(kit?.root?.name!=='east-six'||hosts.has(kit))return false;
 const hs=kit.root.children.filter(f=>f.position.x===-182.3&&f.position.z===253.3&&f.userData?.r143FengxianVats),maps=kit.mapItems.filter(q=>q.name==='奉先殿'&&q.kind==='hall');
 if(hs.length!==1||maps.length!==1||maps[0].w!==55||maps[0].d!==32.9)throw Error('Exact original Fengxian host required');const host=hs[0];
 const ramps=kit.walkables.filter(w=>w.type==='ramp'&&w.axis==='z'&&keys.every(k=>near(w[k],expected[k]))),tops=kit.walkables.filter(w=>w.type==='box'&&near(w.box.min.x,-209.8)&&near(w.box.max.x,-154.8)&&near(w.box.min.z,236.85)&&near(w.box.max.z,269.75)&&w.box.min.y===1.2&&w.box.max.y===1.2),bodies=kit.colliders.filter(c=>c.isBox3&&near(c.min.x,-209.75)&&near(c.max.x,-154.85)&&near(c.min.z,236.9)&&near(c.max.z,269.7)&&c.min.y===0&&c.max.y===1.2);
 const steps=[];for(let k=0;k<8;k++){const top=1.2-(k+1)*1.2/9,z=-16.45-(k+.5)*.24;const found=host.children.filter(m=>{if(!m.isMesh||!unit(m)||!near(m.position.x,0)||!near(m.position.y,top/2)||!near(m.position.z,z))return false;const b=new T.Box3().setFromBufferAttribute(m.geometry.attributes.position),s=b.getSize(new T.Vector3());return near(s.x,4.6)&&near(s.y,top)&&near(s.z,.24)&&b.getCenter(new T.Vector3()).length()<1e-6});if(found.length!==1)throw Error('Eight exact original visible central stair meshes required');steps.push(found[0])}
 const plinth=host.children.filter(m=>m.isMesh&&m.material?.name==='sumeru_band_material'&&m.position.x===0&&m.position.y===.6&&m.position.z===0);
 if(ramps.length!==1||tops.length!==1||bodies.length!==1||plinth.length!==1)throw Error('Unique original ramp/platform/body required');
 const meshes=[...steps,plinth[0]],p={kit,host,steps,meshes,rows:[ramps[0],tops[0]],ramp:{...ramps[0]},top:tops[0].box.clone(),sourceRescue:tops[0].rescue,body:bodies[0],bodyBox:bodies[0].clone(),positions:meshes.map(m=>m.position.toArray()),vertices:meshes.map(m=>[...m.geometry.attributes.position.array])};if(!valid(p))throw Error('Original central source transform mismatch');hosts.set(kit,p);p.rows.forEach((w,i)=>owners.set(w,{p,i}));return{steps,body:p.body};
}
export function preserveFengxianCentralContactOwner(target,original){const o=owners.get(original);if(!o)return false;if(!valid(o.p)||!same(original,o.p,o.i)||!same(target,o.p,o.i,true))throw Error('Fengxian central source copy changed');owners.set(target,o);return true;}
function live(cm){const rows=cm.walkables.filter(w=>owners.has(w));if(rows.length!==2)return null;const p=owners.get(rows[0]).p,seen=new Set();if(!valid(p))return null;for(const w of rows){const o=owners.get(w);if(o.p!==p||seen.has(o.i)||!same(w,p,o.i,true))return null;seen.add(o.i)}const bodies=cm.colliders.filter(c=>c.mesh===p.body);return bodies.length===1&&bodies[0].box.equals(p.bodyBox)&&!bodies[0].triangleSupport&&!bodies[0].overhead?p:null;}
export function resolveFengxianCentralContact(cm,s,dt,r=.5){
 const prior=previous.get(cm);previous.delete(cm);
 if(!s||s.airborne!==false||s.verticalVelocity>0||r!==.5||![s.x,s.z,s.feetY,s.groundY,s.verticalVelocity,dt].every(Number.isFinite)||dt<=0||dt>.100001||s.x<-184.1||s.x>-180.5||s.z<233.73||s.z>237.4)return null;
 const p=live(cm);if(!p)return null;const ramp=p.ramp,maxDelta=PLAYER.SPRINT_SPEED*dt*1.2/1.92+.15,ground=cm.getGroundHeight(s.x,s.z,Math.max(s.feetY,s.groundY)+maxDelta,0),height=s.z<ramp.minZ?0:s.z>ramp.maxZ?1.2:1.2*(s.z-ramp.minZ)/(ramp.maxZ-ramp.minZ);if(!near(ground,height))return null;
 if(!prior||prior.p!==p){if(Math.abs(s.feetY-ground)<=.3&&Math.abs(s.groundY-ground)<=.3)previous.set(cm,{p,x:s.x,z:s.z,ground});return null}
 if(Math.abs(s.feetY-prior.ground)>.3||Math.min(Math.abs(s.groundY-prior.ground),Math.abs(s.groundY-ground))>.3||Math.abs(ground-prior.ground)>maxDelta||Math.hypot(s.x-prior.x,s.z-prior.z)>PLAYER.SPRINT_SPEED*dt+1e-6)return null;
 const coverage=[{minX:ramp.minX,maxX:ramp.maxX,minZ:ramp.minZ,maxZ:ramp.maxZ},{minX:ramp.minX,maxX:ramp.maxX,minZ:ramp.maxZ,maxZ:237.9},{minX:ramp.minX,maxX:ramp.maxX,minZ:ramp.minZ-1.2,maxZ:ramp.minZ}];
 if(!pathFootprintCovered(coverage,[prior.x,prior.z],[s.x,s.z],r))return null;
 previous.set(cm,{p,x:s.x,z:s.z,ground});if(near(ground,prior.ground))return null;
 const from=new T.Vector3(prior.x,s.feetY,prior.z),to=new T.Vector3(s.x,ground,s.z),corner=ground>prior.ground?new T.Vector3(prior.x,ground,prior.z):new T.Vector3(s.x,s.feetY,s.z);
 if(wumenJointBodySweep(cm,from,corner,r).blocked||wumenJointBodySweep(cm,corner,to,r).blocked){previous.delete(cm);return null}
 return{feetY:ground,groundY:ground,airborne:false,verticalVelocity:0,onSupport:true,landed:false,fengxianCentralContact:true};
}
