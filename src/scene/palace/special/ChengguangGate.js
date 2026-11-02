import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='chengguang-source-fit',done=new WeakSet();
export const CHENGGUANG_FIT=Object.freeze({x:.5,z:513,rot:0,bays:1,bounds:Object.freeze([-2,0,511.6,3,5.2,514.4])});
/** Text-sourced minimum gate. Official current closed/map condition is retained
 * as evidence, while open leaves deliberately preserve game central passage.
 * No own photograph or fine facade certification. */
export function buildChengguangGate(kit,zoneId){
 if(zoneId!=='garden')return false;
 if(kit?.root?.name!=='garden'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable garden host, once only, required');
 const staged=new CourtKit(kit.lib,'garden');let f,meta;
 try{
  f=staged.frame(.5,513,0);f.name=ID;
  const green=new T.MeshStandardMaterial({name:'chengguang-glazed-green-coarse-fit',color:0x476d4c,roughness:.65});staged.owned.push(green);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  for(const s of[-1,1]){
   box('stone-jamb','stone_slab',.6,.35,1.2,s*1.45,.175,0);
   box('jamb','wall_red',.5,3.1,1.1,s*1.45,1.9,0);
   box('open-leaf','wood_column',.09,3,1.12,s*1.13,1.56,.6);
   box('short-side-pier','wall_red',.3,2.4,.9,s*1.9,1.2,0);
   box('green-pier-band','wood_column',.32,.18,.92,s*1.9,2.36,0).material=green;
  }
  box('header','wood_column',3.4,.45,1.2,0,3.5,0).material=green;
  const threshold=box('threshold','stone_slab',2.2,.06,.4,0,.03,0);threshold.userData.chengguangThreshold=true;
  staged.roof(f,{type:'wudian',width:3.5,depth:1.3,baseY:3.75,height:.9,overhang:.25,brackets:false,detail:'low'}).name=ID+'/single-roof';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.chengguangThreshold){const b=new T.Box3().setFromObject(m);b.chengguangThreshold=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-2,-1e-6,511.6),new T.Vector3(3,5.2,514.4));if(!safe.containsBox(b))throw Error('Chengguang body escaped cleared reserve');
  meta={id:ID,sourceObjectId:'FC-A3B03BAB65',source:'https://www.dpm.org.cn/lemmas/245113.html',ownPhoto:null,officialClosedState:true,bays:1,gameLeafState:'OPEN_GAMEPLAY_ADAPTATION',wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['official one-bay double-leaf glazed wudian gate inside Shunzhen, oriented north-south','distinct gate linked historically to Jifu/Yanhe by low walls','official description says presently closed and used for visitor map'],
   fit:['all dimensions, colors, complete elevations and roof details; no own image','regional game placement .5,513 is not surveyed','open leaves/.06 threshold deliberately retain game central route despite official closed condition','two short side piers, not full original courtyard'],
   excluded:['copper elephants, visitor map, fine motifs or plaque','complete historical enclosing walls','existing Shunzhen/Jifu/Yanhe identity rebinding','interiors or new contact permission'],unknown:['exact modern full facade','surveyed footprint and fine materials','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
