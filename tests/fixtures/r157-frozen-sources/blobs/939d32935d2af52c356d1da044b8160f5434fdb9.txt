import * as THREE from 'three';
import {createXiqingSurface} from '../../controls/XiqingRoofSurface.js';
import {QIANQING_FLOORS} from '../../controls/QianqingAssemblySupport.js';
/** Read the finished shared template, keeping every actual world-space source
 * triangle. Open components imply no parity/inside-volume classification. */
export function registerQianqingTerraceSurface(builder,instance,id){
 const floor=QIANQING_FLOORS.terrace;
 if(!builder.walkables.some(w=>w.type==='box'&&w.box.min.x===floor.minX&&w.box.max.x===floor.maxX&&w.box.min.z===floor.minZ&&w.box.max.z===floor.maxZ&&w.box.min.y===floor.height&&w.box.max.y===floor.height))throw Error('Missing exact inherited Qianqing terrace floor');
 instance.updateWorldMatrix(true,true);const faces=[];let mesh=0;
 instance.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position,index=m.geometry.index;for(let k=0;k<(index?.count??p.count);k+=3)faces.push({source:{mesh,triangle:k/3},vertices:[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(k+j):k+j).applyMatrix4(m.matrixWorld))});mesh++;});
 const surface=createXiqingSurface(faces,id),owner=surface.box.clone(),bounds=owner.clone();bounds.min.x-=.8;bounds.max.x+=.8;bounds.min.z=Math.max(bounds.min.z-.8,floor.minZ+1);bounds.max.z+=.8;
 owner.xiqingRoofSurface=surface;owner.furnitureMotionScope={kind:'qianqing-assemblies',id,floor,minOffsetX:bounds.min.x-owner.min.x,maxOffsetX:bounds.max.x-owner.min.x,minOffsetZ:bounds.min.z-owner.min.z,maxOffsetZ:bounds.max.z-owner.min.z};builder.colliders.push(owner);return owner;
}
/** These leaves become axis-aligned in the production world-Float32 merge.
 * Read that exact quantization, not a broad door-bay exclusion. */
export function registerQianqingFoldedLeaves(builder,leaves,bay){
 if(leaves.length!==4||![3,4,5].includes(bay))throw Error('Four actual Qianqing leaves required');
 const boxes=leaves.map(leaf=>{leaf.updateWorldMatrix(true,false);const p=leaf.geometry.attributes.position,points=[];for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(leaf.matrixWorld);points.push(v.set(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z)));}const b=new THREE.Box3().setFromPoints(points);if(points.some(v=>!['x','y','z'].every(k=>v[k]===b.min[k]||v[k]===b.max[k])))throw Error('Leaf is not an exact finished axis-aligned box');return b;});
 const bounds=new THREE.Box3();for(const b of boxes)bounds.union(b);bounds.min.x-=.6;bounds.max.x+=.6;bounds.min.z-=.6;bounds.max.z+=.6;const owner=boxes[0];owner.furnitureMotionScope={kind:'qianqing-assemblies',id:'qianqing-front-doors-'+bay,minOffsetX:bounds.min.x-owner.min.x,maxOffsetX:bounds.max.x-owner.min.x,minOffsetZ:bounds.min.z-owner.min.z,maxOffsetZ:bounds.max.z-owner.min.z};builder.colliders.push(...boxes);return boxes;
}
