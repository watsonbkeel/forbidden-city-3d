// Read-only QA for an ALREADY CONSTRUCTED local CourtKit/frame or caller's W.
// No fixtures, texture allocation, full world, browser, or test-run side effect.
import {createHash} from 'node:crypto';
import * as THREE from 'three';

export const KNEE_ROLE='arrow-south-central-knee';
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const hash=value=>sha(JSON.stringify(value));
export function meshes(root){const out=[];root.traverse(o=>{if(o.isMesh)out.push(o);});return out;}
const bytes=a=>sha(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength));
function materialRow(m){if(!m)return null;return {name:m.name,type:m.type,color:m.color?.toArray(),emissive:m.emissive?.toArray(),roughness:m.roughness,metalness:m.metalness,side:m.side,opacity:m.opacity,transparent:m.transparent,alphaTest:m.alphaTest,depthWrite:m.depthWrite,maps:['map','normalMap','roughnessMap'].map(k=>m[k]?{kind:k,name:m[k].name,repeat:m[k].repeat.toArray(),offset:m[k].offset.toArray(),wrapS:m[k].wrapS,wrapT:m[k].wrapT,colorSpace:m[k].colorSpace,flipY:m[k].flipY}:null)};}
export function arrowKneeSnapshot({kit,frame},excludeNew=true){
 frame.updateMatrixWorld(true);
 const rows=meshes(frame).filter(m=>!excludeNew||m.userData.role!==KNEE_ROLE).map(m=>({name:m.name,role:m.userData.role??null,matrix:m.matrixWorld.toArray(),attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{size:a.itemSize,type:a.array.constructor.name,normalized:a.normalized,count:a.count,bytes:bytes(a)}])),index:m.geometry.index?bytes(m.geometry.index):null,material:materialRow(m.material),visible:m.visible,castShadow:m.castShadow,receiveShadow:m.receiveShadow}));
 const physical=Object.fromEntries(['colliders','walkables','rooms','regions','mapItems'].map(k=>[k,kit[k]]));
 const plaques=(kit.plaques??[]).map(p=>({text:p.text,position:p.mesh?.position.toArray(),rotation:p.mesh?.rotation.toArray(),scale:p.mesh?.scale.toArray()}));
 return {meshes:rows.length,triangles:meshes(frame).filter(m=>!excludeNew||m.userData.role!==KNEE_ROLE).reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0),meshBytes:hash(rows),physics:hash(physical),plaques:hash(plaques),physicalCounts:Object.fromEntries(Object.entries(physical).map(([k,v])=>[k,v.length]))};
}
export function kneeMeshHealth(mesh){
 const p=mesh.geometry.attributes.position,idx=mesh.geometry.index,edges=new Map();let volume=0,minArea=Infinity,triangles=0,finite=true;
 for(const a of Object.values(mesh.geometry.attributes))for(const v of a.array)finite&&=Number.isFinite(v);
 for(let i=0;i<(idx?.count??p.count);i+=3){
  const v=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,idx?idx.getX(i+j):i+j));
  minArea=Math.min(minArea,v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).length()/2);
  volume+=v[0].dot(v[1].clone().cross(v[2]))/6;triangles++;
  for(let j=0;j<3;j++){const a=v[j].toArray().map(n=>n.toFixed(6)).join(','),b=v[(j+1)%3].toArray().map(n=>n.toFixed(6)).join(','),key=[a,b].sort().join('|'),entry=edges.get(key)??[];entry.push(a<b?1:-1);edges.set(key,entry);}
 }
 return {triangles,finite,minArea,signedVolume:volume,closed:[...edges.values()].every(e=>e.length===2&&e[0]+e[1]===0)};
}
export function auditArrowSouthKnees({kit,frame,baseline=null}){
 frame.updateMatrixWorld(true);const all=meshes(frame),knees=all.filter(m=>m.userData.role===KNEE_ROLE),snapshot=arrowKneeSnapshot({kit,frame});
 return {scope:'LOCAL ACTUAL TRIANGLES; NOT BROWSER OR VISUAL ACCEPTANCE',kneeCount:knees.length,health:knees.map(kneeMeshHealth),lowestWorldY:Math.min(...knees.map(m=>new THREE.Box3().setFromObject(m).min.y)),retainedSnapshot:snapshot,retainedExact:baseline?JSON.stringify(snapshot)===JSON.stringify(baseline):null,oldColumnCount:all.filter(m=>m.userData.role==='arrow-column').length,kneeMaterialOwnedExactlyOnce:knees.length>0&&new Set(knees.map(m=>m.material)).size===1&&kit.owned.filter(m=>m===knees[0].material).length===1};
}
