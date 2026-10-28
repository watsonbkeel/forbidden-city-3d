import * as THREE from 'three';
import {createXiqingSurface} from '../../../controls/XiqingRoofSurface.js';
const PHOTO='https://img.dpm.org.cn/Uploads/Picture/dc/1533[1024].jpg';
// A closed section, not a painted cavity or a hidden walkable lid.
function revolved(section){
 const raw=new THREE.LatheGeometry(section.map(p=>new THREE.Vector2(...p)),32),pos=[],norm=[],uv=[],a=raw.attributes,ix=raw.index;
 for(let i=0;i<ix.count;i+=3){const ids=[0,1,2].map(k=>ix.getX(i+k)),v=ids.map(j=>new THREE.Vector3().fromBufferAttribute(a.position,j));if(v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0])).lengthSq()<1e-14)continue;for(const j of ids){pos.push(a.position.getX(j),a.position.getY(j),a.position.getZ(j));norm.push(a.normal.getX(j),a.normal.getY(j),a.normal.getZ(j));uv.push(a.uv.getX(j),a.uv.getY(j));}}
 raw.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(norm,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return g;
}
export function addSuichuFrontBasins(c){
 const{kit,f,p}=c;
 for(const[k,v]of Object.entries({key:'suichu',id:'place-ningshou-e604d58704',x:-253.1,z:422.1,localW:17.1,localD:10.1,ph:.5,rot:0}))if(p[k]!==v)throw Error('Suichu front basin profile mismatch: '+k);
 if(f.userData.suichuFrontBasins||f.position.x!==p.x||f.position.z!==p.z||f.position.y!==0||f.rotation.toArray().slice(0,3).some(Boolean)||f.scale.toArray().some(x=>x!==1))throw Error('Suichu front basin frame mismatch');
 const md={originalObjectId:'FC-E604D58704',source:PHOTO,photographyDate:null,scope:'TWO_SOUTH_PLATFORM_SIDE_SHALLOW_BASINS',materialStatus:'PALE_STONE_APPEARANCE_FIT_COMPOSITION_UNVERIFIED',dimensionStatus:'PHOTO_RELATIONSHIP_FIT_NOT_SURVEYED',wholeObjectAccepted:false,interiorAccepted:false,unknown:['Function and date','Exact carving and hidden back detail','Planting or contents','Full south stair/platform restoration']};
 const stone=new THREE.MeshStandardMaterial({name:'suichu-front-basin-pale-stone-fit',color:0xc8c5b7,roughness:.94});kit.owned.push(stone);
 for(const sign of[-1,1]){
  const x=sign*3.15,z=-6.3,side=sign<0?'east':'west';
  const parts=[['plinth',new THREE.BoxGeometry(.74,.16,.74),.08],['support',revolved([[0,.16],[.32,.16],[.34,.22],[.30,.29],[.28,.35],[.235,.48],[.21,.65],[.23,.81],[.29,.94],[.31,1.02],[0,1.02]]),0],['basin',revolved([[0,1.02],[.27,1.02],[.32,1.05],[.39,1.13],[.43,1.24],[.44,1.31],[.44,1.35],[.37,1.35],[.36,1.27],[.32,1.18],[.23,1.10],[0,1.10]]),0]];
  for(const[role,g,y]of parts){
   g.scale(.5,.5,.5);const m=kit.mesh(f,g,stone,x,y*.5,z);m.name='suichu-front-'+role;m.userData.suichuFrontBasin=md;m.updateWorldMatrix(true,false);
   const a=g.attributes.position,ix=g.index,faces=[];for(let i=0;i<(ix?.count??a.count);i+=3)faces.push({source:{mesh:f.children.indexOf(m),triangle:i/3},vertices:[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(a,ix?ix.getX(i+k):i+k).applyMatrix4(m.matrixWorld))});
   const id=`suichu-front-${role}-${side}`,surface=createXiqingSurface(faces,id),col=surface.box.clone();col.xiqingRoofSurface=surface;col.suichuFrontBasin=true;
   if(role==='basin')col.furnitureMotionScope={kind:'suichu-front-basins',id,groundY:0,minOffsetX:p.x+x-1.45-col.min.x,maxOffsetX:p.x+x+1.45-col.min.x,minOffsetZ:p.z+z-1.45-col.min.z,maxOffsetZ:p.z+z+.65-col.min.z};
   kit.colliders.push(col);m.userData.suichuContact=id;
  }
 }
 f.userData.suichuFrontBasins=md;return true;
}
