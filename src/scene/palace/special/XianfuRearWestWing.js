import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='xianfu-rear-west-photo-fit',done=new WeakSet();
export const XIANFU_REAR_WEST_FIT=Object.freeze({x:167.3,z:443.3,width:6.6,depth:3.2,bays:3,bounds:Object.freeze([164.8,0,439.4,169.8,5.5,447.2])});
export function buildXianfuRearWestWing(kit,zoneId){
 if(zoneId!=='west-six')return false;
 if(kit?.root?.name!=='west-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable west-six host, once only, required');
 const staged=new CourtKit(kit.lib,'west-six');let f,meta;
 try{
  f=staged.frame(167.3,443.3,Math.PI/2);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.xianfuRearWestStoneTop=true;return m;};
  stone('platform','wall_brick',7.4,.2,3.8,0,.1,0);
  stone('front-step','stone_slab',2.4,.1,.4,0,.05,-2.1);
  box('closed-back-fit','wall_red',6.6,3.1,.24,0,1.75,1.48);
  for(const x of[-3.18,3.18])box('closed-side-fit','wall_red',.24,3.1,2.96,x,1.75,0);
  // Official court gallery: the far side wing opposite southeast well
  // shows red frames, dark upper and pale lower windows. Fine lattice and
  // hidden upper centre remain unverified; photo-open doorway is closed here.
  const dark=new T.MeshStandardMaterial({name:'xianfu-rear-west-upper-window-fit',color:0x373a33,roughness:.9}),pale=new T.MeshStandardMaterial({name:'xianfu-rear-west-lower-window-fit',color:0xb5b3a0,roughness:.9});staged.owned.push(dark,pale);
  for(const x of[-.51,.51])box('closed-central-leaf-fit','wood_column',1.01,2.85,.16,x,1.625,-1);
  for(const x of[-2.2,2.2]){
   box('window-sill','wall_brick',2.2,.65,.24,x,.525,-1);
   box('sill-window','wood_column',2.2,2.45,.16,x,2.075,-1);
   box('coarse-upper-window-fit','wood_column',1.94,1.1,.04,x,2.64,-1.1).material=dark;
   box('coarse-lower-window-fit','wood_column',1.94,1.1,.04,x,1.4,-1.1).material=pale;
   for(const y of[.85,2.02,3.2])box('coarse-red-window-crossbar-fit','wood_column',2.04,.07,.06,x,y,-1.13);
   box('coarse-red-window-upright-fit','wood_column',.07,2.35,.06,x,2.025,-1.13);
  }
  for(let i=0;i<4;i++){const x=-3.3+i*2.2,m=staged.mesh(f,new T.CylinderGeometry(.11,.13,3.2,10),kit.lib.material('wood_column'),x,1.8,-1.7);m.name=ID+'/front-column';}
  box('front-header','caihua_beam',6.6,.3,.3,0,3.35,-1.5);
  const roof=staged.roof(f,{type:'gable',hardGableEnd:true,width:6.6,depth:3.2,baseY:3.5,height:1.5,overhang:.5,brackets:false});roof.name=ID+'/provisional-hard-gable-main';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.xianfuRearWestStoneTop){const b=new T.Box3().setFromObject(m);b.xianfuRearWestStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(164.8,-1e-6,439.4),new T.Vector3(169.8,5.5,447.2));if(!safe.containsBox(b))throw Error('Own rear west wing escaped approved full-height reserve '+JSON.stringify({min:b.min.toArray(),max:b.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-41ADF461CA',source:'https://www.dpm.org.cn/explore/building/236583.html',identityEvidence:'OFFICIAL_GALLERY_COURTYARD_TOPOLOGY_INFERENCE',ownViewpoint:null,ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/dc/18017%5B1024%5D.jpg',bays:3,photoDoorState:'OPEN',gameDoorState:'CLOSED_EXTERIOR_ONLY_NO_INTERIOR',facadeVerified:false,roofTypeVerified:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['dedicated Tongdao official prose: east/west wings each THREE bays between front Xianfu and rear Tongdao halls; well in southeast of this narrow court','official court well gallery18017 shows far wing opposite southeast well; right rear Tongdao facade/platform pedestals and left front-hall rear wall support WEST-side inference, not named-viewpoint identity','far wing red frames, central open doorway and upper dark/lower pale side windows are partly visible'],
   fit:['all coordinates/dimensions; compact 6.6x3.2 three-bay footprint','hard-gable roof engineering fit: official wing prose does NOT specify roof; own upper centre and end junctions obscured by near well/roofs','coarse window panels/subdivisions and two CLOSED central leaves are game adaptation, not exact pattern or current photo-door state','hidden rear/elevations, recessed safe porch and low .2m platform/.1m real .4m step are fit'],
   excluded:['front WEST wing west-six item49','rear Tongdao main hall west-six item47 including its existing roof/window correction','front Xianfu main hall item46 and its existing platform','neighbouring well pavilion, pedestals, museum objects, fine lattice/paintwork, room access','back/south-gap route, moved old wall/roof, plaque lettering'],unknown:['named own viewpoint/full facade survey/current admission','precise full roof type/end geometry and central upper door partly hidden by well','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
