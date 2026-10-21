import assert from 'node:assert/strict';
import * as THREE from 'three';
import {PLAYER} from '../src/config/constants.js';
const TERRAIN=new Set(['platform-base','platform-paving','interior-floor','access-step','access-side-step','stair-tread','plum-platform-core','plum-platform-petal','fitted-east-viewing-step','juanqin-stage-step','juanqin-west-stage']);
/** Actual mesh triangles, including inherited visibility and full transforms.
 * Merged terrain is recognized ONLY by matching all three world-space vertices
 * to a known original support triangle within 1 mm (Float32 merge tolerance).
 * No material name or generic floor label grants an exemption. */
export function visibleTriangleIndex(root,{terrainSource=null}={}){
 root.updateMatrixWorld(true);const entries=[],buckets=new Map(),center=new THREE.Vector3(),key=(x,y,z)=>`${x},${y},${z}`;
 if(terrainSource)for(const m of visibleTriangleIndex(terrainSource))if(m.terrainRole)for(const t of m.triangles){t.getMidpoint(center);const k=key(Math.floor(center.x),Math.floor(center.y),Math.floor(center.z)),arr=buckets.get(k)??[];arr.push({t,role:m.terrainRole});buckets.set(k,arr);}
 const same=(a,b)=>[a.a,a.b,a.c].every(v=>[b.a,b.b,b.c].some(w=>v.distanceToSquared(w)<1e-6));
 root.traverse(m=>{if(!m.isMesh||!m.visible||/^(COL_|WALK_)/.test(m.name))return;let parent=m.parent;while(parent){if(!parent.visible)return;parent=parent.parent;}const pos=m.geometry.attributes.position,idx=m.geometry.index,triangles=[],terrainRole=TERRAIN.has(m.userData.role)?m.userData.role:null;
  for(let i=0;i<(idx?.count??pos.count);i+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(pos,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld)),t=new THREE.Triangle(...v);t.supportRole=terrainRole;
   if(!terrainRole&&buckets.size){t.getMidpoint(center);const x=Math.floor(center.x),y=Math.floor(center.y),z=Math.floor(center.z);outer:for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)for(let dz=-1;dz<=1;dz++)for(const q of buckets.get(key(x+dx,y+dy,z+dz))??[])if(same(t,q.t)){t.supportRole=q.role;break outer;}}
   triangles.push(t);
  }
  entries.push({name:m.name,role:m.userData.role??m.name,terrainRole,bounds:new THREE.Box3().setFromObject(m),triangles});
 });return entries;
}
/** Obtain the exact production default horizontal box with checkCollision;
 * no copied/reduced private radius. Preserve production STEP_CLEARANCE and
 * extend the body top to actual eye height. Only known support triangles below
 * feet + production STEP_UP are exempt, never roofs, upper slabs or furniture. */
export function assertVisibleBody(cm,index,frame,stats={}){cm.checkCollision(new THREE.Vector3(frame.x,frame.ground+PLAYER.HEIGHT,frame.z));const box=cm.playerBox.clone();box.max.y=frame.ground+PLAYER.HEIGHT;let tested=0;stats.excludedSupportTriangles??={};for(const m of index){if(!box.intersectsBox(m.bounds))continue;for(const t of m.triangles){if(t.supportRole&&Math.max(t.a.y,t.b.y,t.c.y)<=frame.ground+PLAYER.STEP_UP+1e-6){stats.excludedSupportTriangles[t.supportRole]=(stats.excludedSupportTriangles[t.supportRole]??0)+1;continue;}tested++;assert.equal(box.intersectsTriangle(t),false,`visible body penetration ${m.role}: ${JSON.stringify({x:frame.x,z:frame.z,ground:frame.ground,body:{min:box.min.toArray(),max:box.max.toArray()},mesh:{min:m.bounds.min.toArray(),max:m.bounds.max.toArray()}})}`);}}return tested;}
