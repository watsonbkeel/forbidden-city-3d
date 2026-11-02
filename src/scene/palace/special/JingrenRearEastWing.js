import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='jingren-rear-east-photo-fit',done=new WeakSet();
export const JINGREN_REAR_EAST_FIT=Object.freeze({x:-111,z:343,width:7.2,depth:3.6,bays:3,bounds:Object.freeze([-113.8,0,338.9,-107.6,5.5,347.1])});
export function buildJingrenRearEastWing(kit,zoneId){
 if(zoneId!=='east-six')return false;
 if(kit?.root?.name!=='east-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable east-six host, once only, required');
 const staged=new CourtKit(kit.lib,'east-six');let f,meta;
 try{
  f=staged.frame(-111,343,-Math.PI/2);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.jingrenRearEastStoneTop=true;return m;};
  stone('platform','wall_brick',8,.2,4.7,0,.1,-.35);
  stone('front-step','stone_slab',2.6,.1,.6,0,.05,-2.95);
  box('closed-back-fit','wall_red',7.2,3.1,.24,0,1.75,1.68);
  for(const x of[-3.48,3.48])box('closed-side-fit','wall_red',.24,3.1,3.36,x,1.75,0);
  // Official prose establishes a middle doorway, not its current leaf pattern.
  // Closed coarse panels are a gameplay exterior limitation; no invented windows.
  for(let i=0;i<4;i++)box('closed-central-leaf-adaptation','wood_column',.55,2.85,.16,(i-1.5)*.56,1.625,-1.78);
  for(const x of[-2.4,2.4])box('plain-unverified-front-side','wall_red',2.24,2.85,.25,x,1.625,-1.75);
  for(let i=0;i<4;i++){const x=-3.6+i*2.4,m=staged.mesh(f,new T.CylinderGeometry(.11,.13,3.2,10),kit.lib.material('wood_column'),x,1.8,-2.02);m.name=ID+'/front-column';}
  box('front-header','caihua_beam',7.2,.3,.3,0,3.35,-1.85);
  const roof=staged.roof(f,{type:'gable',hardGableEnd:true,width:7.2,depth:3.6,baseY:3.5,height:1.5,overhang:.5,brackets:false});roof.name=ID+'/hard-gable-main';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.jingrenRearEastStoneTop){const b=new T.Box3().setFromObject(m);b.jingrenRearEastStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-113.8,-1e-6,338.9),new T.Vector3(-107.6,5.5,347.1));if(!safe.containsBox(b))throw Error('Text-fit rear east wing escaped approved full-height reserve '+JSON.stringify({min:b.min.toArray(),max:b.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-808DBF510F',source:'https://www.dpm.org.cn/explore/building/236509.html',identityEvidence:'OFFICIAL_TEXT_REAR_EAST_THREE_BAYS_NO_OWN_FACADE_PHOTO',ownViewpoint:null,ownPhoto:null,facadeVerified:false,bays:3,photoDoorState:'UNVERIFIED_NO_OWN_FACADE_PHOTO',gameDoorState:'CLOSED_EXTERIOR_ONLY_NO_INTERIOR',wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['official Jingren rear-court paragraph: five-bay rear hall; east/west three-bay yellow hard-gable wings with middle doors','distinct rear EAST wing, not front east wing'],
   fit:['all coordinates/dimensions, compact body offset beyond east ends of old main halls','unverified front/back/side elevations kept plain closed red surfaces; no invented sill windows or lattice','coarse closed middle leaf count/colors and columns are engineering fit, not an own-photo reconstruction','low .2m platform and .1m real approach step; no room access'],
   excluded:['front EAST wing east-six item4','rear main hall east-six item3','front main hall east-six item2','already-built rear WEST wing own-photo facade not copied','well pavilion, neighbouring roofs, museum objects, new room/map','back-gap/south-gap route, moved old wall/roof, plaque lettering'],unknown:['all own present facade details/window existence and pattern/current door state','surveyed dimensions/current admission','hidden elevations, fine carvings','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
