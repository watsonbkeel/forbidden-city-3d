import * as THREE from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/2021/11/01/s617f4ed051855.jpg';
/** Source visible pair only. Metal alloy, date, handle carving and exact
 * measurements are unverified; the cavity is real, not a black top disk. */
export function applyFengxianFrontVats(kit,zone,item,built){
 if(zone!=='east-six'||item.name!=='奉先殿')return false;
 for(const[k,v]of Object.entries({x:-182.3,z:253.3,w:52.6,d:30.5,pad:1.2,ph:1.2,colH:8.32,bays:9,layers:2,roof:'wudian'}))if(item[k]!==v)throw Error('R143 Fengxian vat binding mismatch');
 const {f}=built;if(f.userData.r143FengxianVats||f.position.x!==item.x||f.position.z!==item.z||f.position.y!==0||f.rotation.toArray().slice(0,3).some(Boolean)||f.scale.toArray().some(x=>x!==1))throw Error('R143 Fengxian vat frame mismatch');
 const md={originalObjectId:'FC-D8AEF2E8A9',source:PHOTO,photographyDate:null,scope:'TWO_FRONT_METAL_APPEARANCE_VATS_AND_LOW_PLINTHS',material:'GREEN_PATINA_APPEARANCE_ALLOY_UNVERIFIED',dimensions:'PHOTO_RELATIONSHIP_FIT_NOT_SURVEYED',wholeObjectAccepted:false,residual:['Handles and carving details','Alloy and casting date','Full three-stair terrace restoration','Interior and rear ensemble']};
 const metal=new THREE.MeshStandardMaterial({name:'r143-fengxian-patinated-metal-fit',color:0x456959,roughness:.78,metalness:.25});kit.owned.push(metal);
 // Closed radial cross-section: outer foot/body/flared lip, inner wall and
 // thick bottom. Axis poles are filtered by the same render triangulation.
 const profile=[[0,0],[.53,0],[.60,.09],[.79,.35],[.89,.74],[.87,1.08],[.93,1.14],[.93,1.23],[.77,1.23],[.76,1.10],[.77,.75],[.68,.38],[.46,.19],[0,.19]];
 for(const sign of[-1,1]){
  const x=sign*8.8,z=-17.8,base=.14;
  const plinth=kit.mesh(f,new THREE.CylinderGeometry(.60,.62,base,12),kit.lib.material('stone_slab'),x,base/2,z);plinth.name='r143-fengxian-vat-plinth';plinth.userData.r143FengxianVat=md;
  const raw=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),40),ix=raw.index,p=raw.attributes.position,n=raw.attributes.normal,uv=raw.attributes.uv,positions=[],normals=[],uvs=[];
  for(let i=0;i<ix.count;i+=3){const ids=[0,1,2].map(k=>ix.getX(i+k)),v=ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j));if(v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).lengthSq()<1e-14)continue;for(const j of ids){positions.push(p.getX(j),p.getY(j),p.getZ(j));normals.push(n.getX(j),n.getY(j),n.getZ(j));uvs.push(uv.getX(j),uv.getY(j));}}
  raw.dispose();const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  const vat=kit.mesh(f,geometry,metal,x,base,z);vat.name='r143-fengxian-open-vat';vat.userData.r143FengxianVat=md;
  for(const [m,role]of[[plinth,'plinth'],[vat,'vat']]){const p=m.geometry.attributes.position,ix=m.geometry.index,faces=[];m.updateWorldMatrix(true,false);for(let i=0;i<(ix?.count??p.count);i+=3)faces.push({source:{mesh:f.children.indexOf(m),triangle:i/3},vertices:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld))});const id=`fengxian-front-${role}-${sign===-1?'east':'west'}`,contact=createXiqingSurface(faces,id),col=contact.box.clone();col.xiqingRoofSurface=contact;col.r143FengxianVat=true;if(role==='vat')col.furnitureMotionScope={kind:'fengxian-front-vats',id,groundY:0,minOffsetX:item.x+x-1.8-col.min.x,maxOffsetX:item.x+x+1.8-col.min.x,minOffsetZ:item.z+z-1.8-col.min.z,maxOffsetZ:item.z+z+1.0-col.min.z};kit.colliders.push(col);m.userData.r143Contact=id;}
 }
 f.userData.r143FengxianVats=md;return true;
}
