import * as THREE from 'three';
import {createXiqingSurface} from './XiqingRoofSurface.js';
/** R130 finite source registration. Rendered meshes are untouched; their exact
 * merged-F32 faces replace neither the world nor any unrelated palace domain. */
export const RETAINED_COURTYARD_IDS=Object.freeze(['tihe-finished-access','lijing-finished-access','chuxiu-gallery-finished-access','chengqian-main-finished-access']);
const targets={
 'west-six':[{id:RETAINED_COURTYARD_IDS[0],x:94,z:401.5,name:'翊坤宫后殿',w:26.2,d:12.9},{id:RETAINED_COURTYARD_IDS[1],x:94.5,z:450.2,name:'储秀宫后殿',w:26.2,d:12.9},{id:RETAINED_COURTYARD_IDS[2],name:'chuxiu-return-corridor'}],
 'east-six':[{id:RETAINED_COURTYARD_IDS[3],x:-93.6,z:381.8,name:'承乾宫',w:27.7,d:14.5}]
};
function actualFaces(mesh){mesh.updateWorldMatrix(true,false);const p=mesh.geometry.attributes.position,ix=mesh.geometry.index,faces=[];for(let i=0;i<(ix?.count??p.count);i+=3)faces.push({source:{mesh:0,triangle:i/3},vertices:[0,1,2].map(j=>{const v=new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+j):i+j).applyMatrix4(mesh.matrixWorld);return v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));})});return faces;}
function isClosedAxisBox(faces,b){
 if(faces.length!==12||!['x','y','z'].every(k=>b.min[k]<b.max[k]))return false;
 const areas=new Map();for(const f of faces){const v=f.vertices,axis=['x','y','z'].find(k=>v.every(p=>p[k]===b.min[k])||v.every(p=>p[k]===b.max[k]));if(!axis||v.some(p=>['x','y','z'].some(k=>p[k]!==b.min[k]&&p[k]!==b.max[k])))return false;const area=new THREE.Vector3().subVectors(v[1],v[0]).cross(new THREE.Vector3().subVectors(v[2],v[0])).length()/2,key=axis+':'+v[0][axis];areas.set(key,(areas.get(key)??0)+area);}
 return ['x','y','z'].every(k=>{const q=['x','y','z'].filter(a=>a!==k),area=(b.max[q[0]]-b.min[q[0]])*(b.max[q[1]]-b.min[q[1]]);return [b.min[k],b.max[k]].every(v=>areas.get(k+':'+v)===area);});
}
export function registerRetainedCourtyardAccess(kit,zone){
 const specs=targets[zone.id];if(!specs)return;const pending=[];
 for(const s of specs){
  const gallery=s.id===RETAINED_COURTYARD_IDS[2];
  if(!gallery&&!zone.items.some(i=>i.kind==='hall'&&i.name===s.name&&i.x===s.x&&i.z===s.z&&i.w===s.w&&i.d===s.d))throw Error('Retained courtyard item identity changed: '+s.id);
  const frames=kit.root.children.filter(f=>gallery?f.name===s.name:f.isGroup&&f.position.x===s.x&&f.position.z===s.z&&f.position.y===0&&f.rotation.y===0);
  if(frames.length!==1)throw Error('Retained courtyard frame identity changed: '+s.id);
  const frame=frames[0],owners=[],surfaceFaces=[],columnFaces=[];let meshIndex=0;frame.updateWorldMatrix(true,true);
  frame.traverse(m=>{if(!m.isMesh||m.visible===false||m.material?.visible===false)return;const material=m.material,allowed=['wall_brick','stone_slab','marble','wood_column'].some(k=>material===kit.lib.material(k))||material===kit.floorMat||material?.name==='lijing_rug';if(!allowed)return;
   const sourceMesh=meshIndex++,faces=actualFaces(m).map(f=>({...f,source:{...f.source,mesh:sourceMesh}})),box=new THREE.Box3().setFromPoints(faces.flatMap(f=>f.vertices));
   // Only existing low finished construction and the already visible floor rug.
   // No beams, furniture tops, roofs or broadphase-box hole filling.
   // Only the retained main-hall cylindrical columns supply tall blockers.
   if(s.id===RETAINED_COURTYARD_IDS[3]&&material===kit.lib.material('wood_column')&&m.geometry.type==='CylinderGeometry'&&box.min.y>=0&&box.max.y>1.7&&box.max.y<9){columnFaces.push(...faces);return;}
   if(box.max.y>.8||box.min.y<-.02||box.max.y<=0)return;
   const b=box.clone();b.retainedCourtyardSource={id:s.id,material:material.name,faceCount:faces.length,source:'actual-rendered-F32'};
   if(!isClosedAxisBox(faces,b))surfaceFaces.push(...faces);else owners.push(b);
  });
  if(columnFaces.length){const shape=createXiqingSurface(columnFaces,'chengqian-main-finished-columns'),b=shape.box.clone();b.xiqingRoofSurface=shape;owners.push(b);}
  if(surfaceFaces.length){const shape=createXiqingSurface(surfaceFaces,s.id),b=shape.box.clone();b.xiqingRoofSurface=shape;b.retainedCourtyardSource={id:s.id,faceCount:surfaceFaces.length,source:'actual-rendered-F32'};owners.push(b);}
  if(!owners.length)throw Error('Retained courtyard finished faces missing: '+s.id);
  const bounds=owners.reduce((b,o)=>b.union(o),new THREE.Box3()),anchor=owners.find(o=>o.min.y<o.max.y&&!o.xiqingRoofSurface);
  if(!anchor)throw Error('Retained courtyard solid anchor missing: '+s.id);
  anchor.furnitureMotionScope={kind:'retained-courtyard',id:s.id,groundY:0,minOffsetX:bounds.min.x-.7-anchor.min.x,maxOffsetX:bounds.max.x+.7-anchor.min.x,minOffsetZ:bounds.min.z-.7-anchor.min.z,maxOffsetZ:bounds.max.z+.7-anchor.min.z};
  pending.push(...owners);
 }
 kit.colliders.push(...pending);
}
