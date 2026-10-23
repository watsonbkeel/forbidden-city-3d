import * as THREE from 'three';
import {readFileSync} from 'node:fs';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {buildEastWestCityGate} from '../../src/scene/palace/special/EastWestCityGate.js';
import {CollisionManager} from '../../src/utils/Collision.js';
import {canvasDOM,triangles,goldRuns,textureHash,hash} from './r58-zuoyi-door-fixture.mjs';
import {loadLocalTextureLibrary} from './r58-zuoyi-real-texture-loader.mjs';
export {canvasDOM,triangles,goldRuns,textureHash,hash,loadLocalTextureLibrary};
export const east=JSON.parse(readFileSync(new URL('../../data/zones/outer-east.json',import.meta.url)));
export const west=JSON.parse(readFileSync(new URL('../../data/zones/outer-west.json',import.meta.url)));
export const binding={zoneId:'outer-east',itemIndex:21,item:east.items[21]};
export async function library(quality='hd',options={}){canvasDOM();return(await loadLocalTextureLibrary({quality,scope:'all',...options})).library;}
export function gate(lib,item=binding.item){
 const kit=new CourtKit(lib),frame=buildEastWestCityGate(kit,item),portal=frame.children.find(o=>o.name==='portal-0');
 return{kit,frame,portal,leaves:portal.children.filter(o=>o.isMesh)};
}
export function sceneFor(c,{finish=false}={}){
 const root=finish?c.kit.finish():c.kit.root,scene=new THREE.Scene();scene.add(root);scene.updateMatrixWorld(true);
 const cm=new CollisionManager();cm.addColliders(c.kit.colliders);cm.addWalkables(c.kit.walkables);
 return{...c,root,scene,cm};
}
export const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
export function ray(scene,eye,target){const d=target.clone().sub(eye);return new THREE.Raycaster(eye,d.clone().normalize(),0,d.length()+.02).intersectObject(scene,true).find(h=>visible(h.object));}
export function faces(scene,materialName='donghua_central_nine_row_front'){
 scene.updateMatrixWorld(true);const groups=[];
 scene.traverse(m=>{if(!m.isMesh||m.material?.name!==materialName)return;
  const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,idx=g.index;
  for(let i=0;i<(idx?.count??p.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k),ps=ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m.matrixWorld)),us=ids.map(j=>new THREE.Vector3(uv.getX(j),uv.getY(j),0)),normal=new THREE.Triangle(...ps).getNormal(new THREE.Vector3());
   if(!ps.every(v=>Math.abs(v.x+370.98)<1.33&&v.z>-260&&v.z<-254)||Math.abs(normal.z)<.999)continue;
   let fs=groups.find(a=>Math.abs(a[0].ps[0].z-ps[0].z)<1e-4);if(!fs)groups.push(fs=[]);fs.push({ps,us,normal,mesh:m});
  }
 });return groups.sort((a,b)=>b[0].ps[0].z-a[0].ps[0].z);
}
export function passageFaces(scene,materialName){return faces(scene,materialName).filter(fs=>fs[0].normal.z*(fs[0].ps[0].z>-257?-1:1)>.999);}
export function uvPoint(fs,u,v){const q=new THREE.Vector3(u,v,0);for(const f of fs){const w=THREE.Triangle.getBarycoord(q,...f.us,new THREE.Vector3());if(w&&Math.min(w.x,w.y,w.z)>=-1e-6)return f.ps[0].clone().multiplyScalar(w.x).addScaledVector(f.ps[1],w.y).addScaledVector(f.ps[2],w.z);}return null;}
export function probe(c,{correct=true}={}){
 const groups=passageFaces(c.scene,correct?'donghua_central_nine_row_front':'door_studded_material'),eye=new THREE.Vector3(-370.98,c.cm.getGroundHeight(-370.98,-257,.45)+1.7,-257);
 return groups.map(fs=>{const image=fs[0].mesh.material.map.image,runs=goldRuns(image),ctx=image.getContext('2d');
  return{normal:fs[0].normal.toArray(),center:new THREE.Box3().setFromPoints(fs.flatMap(f=>f.ps)).getCenter(new THREE.Vector3()).toArray(),eye:eye.toArray(),ground:c.cm.getGroundHeight(eye.x,eye.z,.45),legal:!c.cm.checkCollision(eye,.5),rows:runs.map(([a,b])=>{
   const x=Math.round(65/762*image.width);let y=a,pixel=[0,0,0,0];
   for(let py=a;py<=b;py++){const p=[...ctx.getImageData(x,py,1,1).data];if(p[1]>55&&p[1]>1.5*p[2]&&p[0]>1.1*p[1]&&p[1]>pixel[1]){pixel=p;y=py;}}
   const uv=[(x+.5)/image.width,1-(y+.5)/image.height],target=uvPoint(fs,...uv),hit=ray(c.scene,eye,target);
   return{uv,pixel,goldPixel:pixel[1]>55&&pixel[1]>pixel[2]*1.5&&pixel[0]>pixel[1]*1.1,target:target.toArray(),hit:hit?.point.toArray(),material:hit?.object.material?.name,visible:hit?.object===fs[0].mesh&&hit.point.distanceTo(target)<.02};
  })};
 });
}
