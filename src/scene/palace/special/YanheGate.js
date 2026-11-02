import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yanhe-source-fit',done=new WeakSet();
export const YANHE_FIT=Object.freeze({x:-13.3,z:514.4,rot:-Math.PI/2,bays:1,bounds:Object.freeze([-15,0,511.7,-11.8,5.2,517.1])});
/** Official text establishes an independent single-bay glazed wudian gate.
 * No own elevation photo: plain faces/dimensions all engineering fit. Both
 * official side-gate lemmas say west; opposite-side placement is disclosed
 * inference/game layout, NOT an official east-side assertion. */
export function buildYanheGate(kit,zoneId){
 if(zoneId!=='garden')return false;
 if(kit?.root?.name!=='garden'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable garden host, once only, required');
 const staged=new CourtKit(kit.lib,'garden');let f,meta;
 try{
  f=staged.frame(-13.3,514.4,-Math.PI/2);f.name=ID;
  const green=new T.MeshStandardMaterial({name:'yanhe-glazed-green-coarse-fit',color:0x476d4c,roughness:.65});staged.owned.push(green);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  for(const s of[-1,1]){
   box('stone-jamb','stone_slab',.6,.35,1.2,s*1.45,.175,0);
   box('jamb','wall_red',.5,3.1,1.1,s*1.45,1.9,0);
   box('open-leaf','wood_column',.09,3,1.12,s*1.13,1.56,.6);
   box('short-side-pier','wall_red',.3,2.4,.9,s*1.9,1.2,0);
   box('green-pier-band','wood_column',.32,.18,.92,s*1.9,2.36,0).material=green;
  }
  box('header','wood_column',3.4,.45,1.2,0,3.5,0).material=green;
  const threshold=box('threshold','stone_slab',2.2,.06,.4,0,.03,0);threshold.userData.yanheThreshold=true;
  staged.roof(f,{type:'wudian',width:3.5,depth:1.3,baseY:3.75,height:.9,overhang:.25,brackets:false,detail:'low'}).name=ID+'/single-roof';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.yanheThreshold){const b=new T.Box3().setFromObject(m);b.yanheThreshold=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-15,-1e-6,511.7),new T.Vector3(-11.8,5.2,517.1));if(!safe.containsBox(b))throw Error('Yanhe body escaped cleared reserve');
  meta={id:ID,sourceObjectId:'FC-2934DA7C63',source:'https://www.dpm.org.cn/lemmas/245114.html',contextSource:'https://www.dpm.org.cn/explore/building/236543.html',ownPhoto:null,directionConflictDisclosed:true,bays:1,gameLeafState:'OPEN_GAMEPLAY_ADAPTATION',wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['official single-bay double-leaf glazed wudian gate','main Shunzhen text describes one east-west gate on each side','Yanhe and Jifu are distinct names, not existing Shunzhen three north-south portals'],
   fit:['all elevations, colors, metre dimensions and roof/door details; no own facade photograph','both official lemmas say west: side-location contradiction unresolved; this opposite side position is engineering inference only','regional placement -13.3,514.4 is not surveyed or certified official east position','open leaves and .06 threshold are gameplay adaptations','short side piers only, no historical full enclosure'],
   excluded:['Jifu own photo is NOT Yanhe evidence','Shunzhen three original portals or existing Jifu are not rebound','Chengguang and entire enclosing courtyard walls','fine glazed motifs, plaque or interior'],unknown:['historic/current exact footprint and contradictory side wording','actual elevations/material motifs','current admission/open state','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
