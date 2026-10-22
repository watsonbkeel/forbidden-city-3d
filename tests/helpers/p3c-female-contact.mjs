import * as THREE from 'three';import{createCharacterGeometry as build,CHARACTER_TEMPLATES as T}from'../../src/scene/characters/CharacterKit.js';
export function measureFemaleLapContact(templateId,seatVariant,buildGeometry=build){
const g=buildGeometry(templateId,'seated',0,{seatVariant}),p=g.attributes.position,c=g.attributes.color,part=g.attributes.characterPart,skin=new THREE.Color(0xdbb294),robe=new THREE.Color(T[templateId].robe);const exact=(i,col,tol=1e-6)=>Math.abs(c.getX(i)-col.r)<tol&&Math.abs(c.getY(i)-col.g)<tol&&Math.abs(c.getZ(i)-col.b)<tol;
const cloth=new THREE.BufferGeometry();cloth.setAttribute('position',p);const indices=[];for(let i=0;i<g.index.count;i+=3){const ids=[0,1,2].map(k=>g.index.getX(i+k));if(ids.every(j=>[0,6].includes(part.getX(j))&&exact(j,robe,Math.max(robe.r,robe.g,robe.b)*.03+1e-6)))indices.push(...ids);}cloth.setIndex(indices);const mesh=new THREE.Mesh(cloth,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.updateMatrixWorld();
const ray=new THREE.Raycaster();const sample=v=>{ray.set(new THREE.Vector3(v[0],1.3,v[2]),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(mesh)[0];return hit?{point:v,clothY:hit.point.y,gap:v[1]-hit.point.y}:null;};
const hands=[];
for(const handPart of [2,3]){let start=-1,run=0;for(let i=0;i<p.count;i++){if(part.getX(i)===handPart&&exact(i,skin))run++;else run=0;if(run===40){start=i-39;break;}}if(start<0)throw Error('Palm not found');
let end=start+40;while(end<p.count&&part.getX(end)===handPart)end++;
const vertices=Array.from({length:40},(_,k)=>sample([p.getX(start+k),p.getY(start+k),p.getZ(start+k)])).filter(Boolean),samples=[];
for(let i=0;i<g.index.count;i+=3){const ids=[0,1,2].map(k=>g.index.getX(i+k));if(!ids.every(j=>j>=start&&j<end))continue;const v=ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j));for(const weights of [[1,0,0],[0,1,0],[0,0,1],[.5,.5,0],[0,.5,.5],[.5,0,.5],[1/3,1/3,1/3]]){const q=new THREE.Vector3();for(let k=0;k<3;k++)q.addScaledVector(v[k],weights[k]);const s=sample(q.toArray());if(s)samples.push(s);}}
const stats=a=>({min:Math.min(...a.map(s=>s.gap)),max:Math.max(...a.map(s=>s.gap)),closest:a.reduce((a,b)=>a.gap<b.gap?a:b)});hands.push({handPart,palmVertexRange:[start,start+40],handVertexRange:[start,end],palm:stats(vertices),allSkinTriangleSamples:{count:samples.length,...stats(samples)}});}
const lower=hands.find(h=>h.handPart===3),upper=hands.find(h=>h.handPart===2),lowerIndices=[];
for(let i=0;i<g.index.count;i+=3){const ids=[0,1,2].map(k=>g.index.getX(i+k));if(ids.every(j=>j>=lower.handVertexRange[0]&&j<lower.handVertexRange[1]))lowerIndices.push(...ids);}
const lowerGeometry=new THREE.BufferGeometry();lowerGeometry.setAttribute('position',p);lowerGeometry.setIndex(lowerIndices);const lowerMesh=new THREE.Mesh(lowerGeometry,mesh.material);lowerMesh.updateMatrixWorld();const overlap=[];
for(let i=upper.palmVertexRange[0];i<upper.palmVertexRange[1];i++){ray.set(new THREE.Vector3(p.getX(i),1.3,p.getZ(i)),new THREE.Vector3(0,-1,0));const h=ray.intersectObject(lowerMesh)[0];if(h)overlap.push(p.getY(i)-h.point.y);}
const allStack=[];for(let i=0;i<g.index.count;i+=3){const ids=[0,1,2].map(k=>g.index.getX(i+k));if(!ids.every(j=>j>=upper.handVertexRange[0]&&j<upper.handVertexRange[1]))continue;const v=ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j));for(const weights of [[1,0,0],[0,1,0],[0,0,1],[.5,.5,0],[0,.5,.5],[.5,0,.5],[1/3,1/3,1/3]]){const q=new THREE.Vector3();for(let k=0;k<3;k++)q.addScaledVector(v[k],weights[k]);ray.set(new THREE.Vector3(q.x,1.3,q.z),new THREE.Vector3(0,-1,0));const hit=ray.intersectObject(lowerMesh)[0];if(hit)allStack.push(q.y-hit.point.y);}}
const upperAllSkinToLowerHand={sampleCount:allStack.length,min:Math.min(...allStack),max:Math.max(...allStack)};
const upperPalmToLowerHand={sampleCount:overlap.length,min:Math.min(...overlap),max:Math.max(...overlap),method:'Signed upper-palm vertex height above the highest lower-hand triangle at matching X/Z; descriptive, not a full triangle-triangle collision solver.'};
g.dispose();cloth.dispose();lowerGeometry.dispose();mesh.material.dispose();return {templateId,seatVariant,hands,upperPalmToLowerHand,upperAllSkinToLowerHand};}

import {deformCharacterVertex} from '../../src/scene/characters/CharacterAnimation.js';
export function measureDeformedFemaleLapContact(templateId,seatVariant,state,buildGeometry=build){
 return measureFemaleLapContact(templateId,seatVariant,(...args)=>{
  const g=buildGeometry(...args),a=g.attributes;
  for(let i=0;i<a.position.count;i++){
   const v=deformCharacterVertex([a.position.getX(i),a.position.getY(i),a.position.getZ(i)],[a.normal.getX(i),a.normal.getY(i),a.normal.getZ(i)],{part:a.characterPart.getX(i),pivot:[a.characterPivot.getX(i),a.characterPivot.getY(i),a.characterPivot.getZ(i)],weight:a.characterWeight.getX(i),torsoWeight:a.characterTorsoWeight.getX(i)},state);
   a.position.setXYZ(i,...v.position);a.normal.setXYZ(i,...v.normal);
  }
  return g;
 });
}
