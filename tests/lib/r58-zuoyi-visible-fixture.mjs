import * as THREE from 'three';
import {library,gate,binding,triangles,goldRuns} from './r58-zuoyi-door-fixture.mjs';
import {CollisionManager} from '../../src/utils/Collision.js';
import {applyZuoyiDoorFront} from '../../src/scene/palace/special/ZuoyiDoorFront.js';
export {triangles,goldRuns};
export const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
export async function component({correct=true,quality='hd',apply=applyZuoyiDoorFront}={}){
 const lib=await library(quality),c=gate(lib);if(correct)apply(c.kit,c.frame,binding);
 const source=triangles(c.frame),root=c.kit.finish(),scene=new THREE.Scene();scene.add(root);scene.updateMatrixWorld(true);
 const cm=new CollisionManager();cm.addColliders(c.kit.colliders);cm.addWalkables(c.kit.walkables);
 return{...c,lib,source,root,scene,cm,dispose(){c.kit.dispose(root);lib.dispose();}};
}
export function faces(scene,materialName='zuoyi_nine_row_front'){
 scene.updateMatrixWorld(true);const groups=[];scene.traverse(m=>{if(!m.isMesh||m.material?.name!==materialName)return;
  const g=m.geometry,p=g.attributes.position,uv=g.attributes.uv,idx=g.index;
  for(let i=0;i<(idx?.count??p.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k),ps=ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld)),us=ids.map(j=>new THREE.Vector3(uv.getX(j),uv.getY(j),0)),normal=new THREE.Triangle(...ps).getNormal(new THREE.Vector3());
   let fs=groups.find(a=>Math.abs(a[0].ps[0].z-ps[0].z)<1e-4);if(!fs)groups.push(fs=[]);fs.push({ps,us,normal,mesh:m});
  }
 });return groups.sort((a,b)=>b[0].ps[0].z-a[0].ps[0].z);
}
export function uvPoint(fs,u,v){const q=new THREE.Vector3(u,v,0);for(const f of fs){const w=THREE.Triangle.getBarycoord(q,...f.us,new THREE.Vector3());if(w&&Math.min(w.x,w.y,w.z)>=-1e-6)return f.ps[0].clone().multiplyScalar(w.x).addScaledVector(f.ps[1],w.y).addScaledVector(f.ps[2],w.z);}return null;}
export function ray(scene,eye,target){const d=target.clone().sub(eye);return new THREE.Raycaster(eye,d.clone().normalize(),0,d.length()+.02).intersectObject(scene,true).find(h=>visible(h.object));}
export function probe(c,{fitted=true}={}){
 const groups=faces(c.scene),eye=new THREE.Vector3(-105.045,c.cm.getGroundHeight(-105.045,-53.1,.45)+1.7,-53.1),legal=!c.cm.checkCollision(eye,.5);
 return groups.map(fs=>{
  const mesh=fs[0].mesh,image=mesh.material.map.image,detectedRuns=goldRuns(image),runs=goldRuns(c.lib.color('door_studded').image).filter((_,i)=>i!==1),scale=(fitted?1-.47/4.4:1)*1024/926,center=new THREE.Box3().setFromPoints(fs.flatMap(f=>f.ps)).getCenter(new THREE.Vector3()),centerHit=ray(c.scene,eye,center);
  const rows=runs.map(([a,b])=>{const sourceY=(a+b)/2,mappedY=(sourceY-(sourceY>image.height*234/1024?image.height*98/1024:0))*scale,uv=[65/762,1-mappedY/image.height],target=uvPoint(fs,...uv),hit=ray(c.scene,eye,target),pixel=[...image.getContext('2d').getImageData(Math.floor(uv[0]*image.width),Math.floor(mappedY),1,1).data];return{sourceRun:[a,b],uv,pixel,goldPixel:pixel[1]>55&&pixel[1]>1.5*pixel[2]&&pixel[0]>1.1*pixel[1],target:target.toArray(),hit:hit?.point.toArray(),material:hit?.object.material.name,visible:hit?.object===mesh&&hit.point.distanceTo(target)<.02};});
  return{detectedRuns,normal:fs[0].normal.toArray(),center:center.toArray(),eye:eye.toArray(),legal,centerHit:centerHit?.object.material.name,rows};
 });
}
