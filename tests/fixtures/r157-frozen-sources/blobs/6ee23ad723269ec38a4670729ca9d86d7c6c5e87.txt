import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const WENYUAN_UPPER_SOURCE='https://img.dpm.org.cn/Uploads/Picture/2024/02/21/s65d5b6eae1fbb.jpg';
// Image coordinates identify six unequal groups, not six equal bays. The source
// is a perspective photograph: these coordinates are a reversible fit, not a survey.
export const WENYUAN_UPPER_PHOTO=Object.freeze({width:1500,height:1000,left:238,right:1210,groups:Object.freeze([[258,299],[328,454],[488,616],[650,848],[884,1012],[1050,1182]].map(Object.freeze))});
const near=(a,b)=>Math.abs(a-b)<1e-6;
const hasBox=(m,w,h,d)=>{
 if(!m?.isMesh)return false;const p=m.geometry.attributes.position,n=m.geometry.attributes.normal,ix=m.geometry.index;
 if(!p||!n||(ix?.count??p.count)!==36)return false;
 for(let k=0;k<p.count;k++)if(!near(Math.abs(p.getX(k)),w/2)||!near(Math.abs(p.getY(k)),h/2)||!near(Math.abs(p.getZ(k)),d/2)||!near(Math.abs(n.getX(k))+Math.abs(n.getY(k))+Math.abs(n.getZ(k)),1))return false;
 return true;
};
const untransformed=m=>m.rotation.x===0&&m.rotation.y===0&&m.rotation.z===0&&m.scale.equals(new THREE.Vector3(1,1,1));
export function applyWenyuanUpperSouthWindows(kit,f,item){
 const g=f?.userData.structure;
 if(!g||g.id!=='wenyuan-pavilion'||item?.name!=='文渊阁'||item.x!==-186.5||item.z!==-132.8||item.w!==40.5||item.d!==17.9||!near(f.position.x,item.x)||!near(f.position.z,item.z)||!untransformed(f)||f.userData.wenyuanUpperSouthWindows)return false;
 const w=38.7,z=-7.9,y0=6.05,y1=8.6;
 const band=f.children.filter(m=>hasBox(m,w,2.592,.18)&&near(m.position.x,0)&&near(m.position.y,7.12)&&near(m.position.z,z)&&untransformed(m));
 const sill=f.children.filter(m=>hasBox(m,w,.55,.25)&&near(m.position.x,0)&&near(m.position.y,5.775)&&near(m.position.z,z)&&untransformed(m));
 const posts=f.children.filter(m=>m.isMesh&&m.geometry.type==='CylinderGeometry'&&near(m.geometry.parameters.radiusTop,.25)&&near(m.geometry.parameters.radiusBottom,.27)&&near(m.geometry.parameters.height,3.6)&&near(m.position.y,7.3)&&near(m.position.z,z)&&untransformed(m));
 if(band.length!==1||sill.length!==1||posts.length!==7||posts.some((p,i)=>!near(p.position.x,-19.35+i*6.45)))return false;
 if(f.children.some(m=>m!==band[0]&&m.geometry===band[0].geometry))return false;
 const material=(name,color)=>{const m=new THREE.MeshStandardMaterial({name,color,roughness:.9});kit.owned.push(m);return m;};
 const green=material('wenyuan_photo_upper_green',0x426a51),wood=material('wenyuan_photo_upper_frame',0x9b7252),dark=material('wenyuan_photo_upper_unmodeled_grille',0x333c32);
 const meta={source:WENYUAN_UPPER_SOURCE,photographyDate:null,status:'PARTIAL_SOURCE_FIT_BROWSER_PENDING',surveyed:false,fineGrille:'UNMODELED_NOT_GENERIC_TEMPLATE',windowLeafCount:'UNVERIFIED',oldSouthBandRemoved:true,oldSouthDecorativePostsRemoved:7,lowerColumnsRetained:true};
 const added=[];
 function proxy(m){m.geometry.computeBoundingBox();const b=m.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().compose(m.position,m.quaternion,m.scale));kit.col(f,b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z);m.userData.actualComponentProxy={bounds:{min:b.min.toArray(),max:b.max.toArray()},lowerHeadMargin:0,status:'VISIBLE_COMPONENT_BOUNDING_BOX_NOT_INVISIBLE_ROOM_FILL'};}
 function add(geo,mat,role,group){const m=kit.mesh(f,geo,mat,0,0,0);m.userData.wenyuanUpperSouthWindow={...meta,role,group};added.push(m);proxy(m);return m;}
 const box=(x0,x1,a,b,z0,z1)=>new THREE.BoxGeometry(x1-x0,b-a,z1-z0).translate((x0+x1)/2,(a+b)/2,(z0+z1)/2);
 const fromPixel=x=>w/2-(x-WENYUAN_UPPER_PHOTO.left)/(WENYUAN_UPPER_PHOTO.right-WENYUAN_UPPER_PHOTO.left)*w;
 const groups=WENYUAN_UPPER_PHOTO.groups.map(([a,b])=>({x0:fromPixel(b),x1:fromPixel(a)}));
 let edge=w/2;
 for(const [i,a]of groups.entries()){
  add(box(a.x1,edge,y0,y1,z-.09,z+.09),green,'green-between-groups',i);
  // Six closed recesses replace the old continuous generic lattice texture.
  // The major strip pattern is deliberately coarse; no fine grille motif or
  // complete historical leaf count is claimed from this one photograph.
  add(box(a.x0,a.x1,y0,y1,z+.025,z+.09),dark,'closed-recess',i);
  const strips=[box(a.x0,a.x0+.13,y0,y1,z-.09,z+.025),box(a.x1-.13,a.x1,y0,y1,z-.09,z+.025),box(a.x0+.13,a.x1-.13,y0,y0+.16,z-.09,z+.025),box(a.x0+.13,a.x1-.13,y1-.16,y1,z-.09,z+.025)];
  const count=i===0?2:6,rail=y0+(y1-y0)*.172;
  for(let k=1;k<count;k++){const x=a.x0+(a.x1-a.x0)*k/count;strips.push(box(x-.06,x+.06,y0+.16,y1-.16,z-.09,z+.025));}
  // Bottom cross rail is segmented at uprights: no coincident coplanar faces.
  for(let k=0;k<count;k++){const left=k===0?a.x0+.13:a.x0+(a.x1-a.x0)*k/count+.06,right=k===count-1?a.x1-.13:a.x0+(a.x1-a.x0)*(k+1)/count-.06;strips.push(box(left,right,rail-.045,rail+.045,z-.09,z+.025));}
  const geo=mergeGeometries(strips);for(const part of strips)part.dispose();add(geo,wood,'coarse-frame',i);edge=a.x0;
 }
 add(box(-w/2,edge,y0,y1,z-.09,z+.09),green,'green-between-groups',6);
 sill[0].material=green;sill[0].userData.wenyuanUpperSouthWindow={...meta,role:'retained-sill-material-only'};proxy(sill[0]);
 band[0].removeFromParent();band[0].geometry.dispose();for(const p of posts)p.removeFromParent(); // Cylinder geometry remains shared by north posts.
 f.userData.wenyuanUpperSouthWindows={...meta,groups,photoControlPoints:WENYUAN_UPPER_PHOTO,addedMeshes:added.length,explicitProxies:added.length+1};
 g.upperSouthWindows=f.userData.wenyuanUpperSouthWindows;return true;
}
