import * as THREE from 'three';
import source from '../../../data/architecture/qianqing-display-geometry.json' with { type: 'json' };
import {mergeByMaterial} from '../../utils/MergeUtils.js';
export const QIANQING_DISPLAY=Object.freeze({
 id:'qianqing-permanent-display',source:'https://img.dpm.org.cn/Uploads/Picture/dc/1523%5B1024%5D.jpg',
 dimensions:'PHOTO_RELATIVE_FLOOR_SIDE_TRIAL_NOT_SURVEYED',photoDateKnown:false,
 frame:{x:0,y:2.16,z:316.8},incense:{x:5.2,z:.2,radius:.5,height:1.6},
 maxTriangles:3300,
 lodDistance:90,lodHysteresis:.1,maxFarTriangles:700,
 vesselCentres:[-3.1,-1.9,1.9,3.1],vesselZ:3.5,
});
const response={gold:{color:0xbda268,metalness:.48,roughness:.49},bronze:{color:0x72634a,metalness:.35,roughness:.57},enamel:{color:0x285f72,metalness:.08,roughness:.35},dark:{color:0x302722,metalness:.02,roughness:.66}};
export function buildQianqingDisplay(builder){
 const root=new THREE.Group();root.name=QIANQING_DISPLAY.id;
 const mats=Object.fromEntries(Object.entries(response).map(([key,p])=>[key,builder.ownMat(`qianqing-r32-display-${key}`,{...p,name:`qianqing-r32-display-${key}`})]));
 for(const part of source.parts){
  // The inherited animal primitives are not identified by the selected museum
  // photograph. Retain their source data for provenance, not a second display.
  if(part.kind!=='incense')continue;
  const p=new Float32Array(part.position),n=new Float32Array(part.normal);
  if(part.kind==='incense')for(let i=0;i<p.length;i+=3){p[i]+=part.sign*(QIANQING_DISPLAY.incense.x-2.5);p[i+1]-=.7;p[i+2]+=QIANQING_DISPLAY.incense.z-2.1;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('normal',new THREE.BufferAttribute(n,3));g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(p.length/3*2),2));
  const m=new THREE.Mesh(g,mats[part.material]);m.name=`qianqing-${part.kind}-${part.sign}-${part.material}`;m.castShadow=true;m.receiveShadow=true;root.add(m);
 }
 for(const x of QIANQING_DISPLAY.vesselCentres){
  const assembly=new THREE.Group();assembly.name='qianqing-covered-vessel-on-open-stand';assembly.position.set(x,0,QIANQING_DISPLAY.vesselZ);
  const add=(geometry,material,name)=>{const m=new THREE.Mesh(geometry,mats[material]);m.name=name;m.castShadow=true;m.receiveShadow=true;assembly.add(m);return m;};
  const profile=(points,material,name)=>add(new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),10),material,name);
  // Actual openings between four narrow supports, not a solid gilded drum.
  profile([[.31,.70],[.42,.70],[.42,.77],[.31,.77]],'dark','stand-foot-ring');
  profile([[.31,1.65],[.40,1.65],[.40,1.75],[.31,1.75]],'gold','stand-top-ring');
  for(let i=0;i<4;i++){
   const a=(i+.5)*Math.PI/2,c=Math.cos(a),s=Math.sin(a);
   const leg=add(new THREE.BoxGeometry(.065,.90,.065),'dark','open-stand-support');leg.position.set(c*.32,1.21,s*.32);
   const gilt=add(new THREE.BoxGeometry(.025,.68,.025),'gold','open-stand-gilt-edge');gilt.position.set(c*.355,1.22,s*.355);
  }
  profile([[.11,1.75],[.13,1.81],[.21,1.87],[.255,2.04],[.22,2.14],[.17,2.17],[.17,2.21]],'enamel','covered-vessel-body');
  profile([[.17,2.21],[.225,2.21],[.19,2.26],[.055,2.30]],'enamel','covered-vessel-lid');
  profile([[.055,2.30],[.065,2.33],[0,2.35]],'gold','covered-vessel-finial');
  assembly.userData={visualClass:'covered-vessel-on-open-stand',objectIdentityVerified:false,placementStatus:'RETAINED_MODEL_CENTRES_NOT_SURVEYED'};
  root.add(assembly);
 }
 root.userData={displayObjects:6,dimensions:QIANQING_DISPLAY.dimensions,photoDateKnown:false,source:QIANQING_DISPLAY.source,foregroundVisualClass:'four-covered-vessels-on-open-stands',objectIdentityVerified:false};return root;
}
export function installQianqingDisplay(builder,hall){
 if(hall.getObjectByName(QIANQING_DISPLAY.id))throw Error('Qianqing display must have one permanent owner');
 const raw=buildQianqingDisplay(builder),merged=mergeByMaterial(raw,{name:QIANQING_DISPLAY.id});
 const lod=new THREE.LOD();lod.name=QIANQING_DISPLAY.id;lod.userData={...raw.userData,distanceDetail:'same-six-objects-open-stands',lodDistance:QIANQING_DISPLAY.lodDistance};
 lod.addLevel(merged,0);lod.addLevel(mergeByMaterial(buildQianqingDisplayFar(builder),{name:'qianqing-display-far'}),QIANQING_DISPLAY.lodDistance,QIANQING_DISPLAY.lodHysteresis);
 lod.levels[1].object.visible=false;lod.position.set(QIANQING_DISPLAY.frame.x,QIANQING_DISPLAY.frame.y,QIANQING_DISPLAY.frame.z);hall.add(lod);
 const p=QIANQING_DISPLAY.incense,f=QIANQING_DISPLAY.frame;
 for(const sign of[-1,1])builder.col(sign*p.x-p.radius,f.y,f.z+p.z-p.radius,sign*p.x+p.radius,f.y+p.height,f.z+p.z+p.radius);
 return lod;
}

/** Beyond 90 m retain all six silhouettes and the actual open support gaps.
 * Subpixel mouldings are omitted; this changes no installation or collision.
 * Materials are the same caller-owned objects as the untouched near level. */
export function buildQianqingDisplayFar(builder){
 const root=new THREE.Group();root.name='qianqing-display-far';
 const mats=Object.fromEntries(Object.entries(response).map(([key,p])=>[key,builder.ownMat(`qianqing-r32-display-${key}`,{...p,name:`qianqing-r32-display-${key}`})]));
 const add=(g,material,x,y,z)=>{const m=new THREE.Mesh(g,mats[material]);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;root.add(m);return m;};
 const box=(w,h,d,mat,x,y,z)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z);
 for(const sign of[-1,1]){
  const x=sign*QIANQING_DISPLAY.incense.x,z=QIANQING_DISPLAY.incense.z;
  box(.86,.10,.86,'dark',x,.05,z);
  box(.76,.13,.76,'gold',x,.20,z);
  for(const dx of[-.31,.31])for(const dz of[-.31,.31])box(.065,.83,.065,'gold',x+dx,.68,z+dz);
  box(.85,.07,.85,'gold',x,1.12,z);
  const roof=add(new THREE.ConeGeometry(Math.SQRT1_2,.36,4),'enamel',x,1.335,z);roof.rotation.y=Math.PI/4;
  add(new THREE.ConeGeometry(.07,.085,4),'gold',x,1.5575,z);
 }
 for(const x of QIANQING_DISPLAY.vesselCentres){
  const z=QIANQING_DISPLAY.vesselZ;
  box(.75,.07,.75,'dark',x,.735,z);box(.72,.08,.72,'gold',x,1.71,z);
  for(let i=0;i<4;i++){const a=(i+.5)*Math.PI/2;box(.065,.90,.065,'dark',x+Math.cos(a)*.32,1.21,z+Math.sin(a)*.32);}
  const points=[[.11,1.75],[.255,2.04],[.17,2.21],[.225,2.21],[.055,2.30],[0,2.35]].map(([r,y])=>new THREE.Vector2(r,y));
  add(new THREE.LatheGeometry(points,4),'enamel',x,0,z);
 }
 root.userData={displayObjects:6,detail:'distance-silhouette',objectIdentityVerified:false};return root;
}
