import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='yongshou-rear-east-text-fit',done=new WeakSet();
export const YONGSHOU_REAR_EAST_FIT=Object.freeze({x:77.4,z:343,width:6.6,depth:3.2,bays:3,bounds:Object.freeze([74.9,0,339.1,79.9,5.5,346.9])});
export function buildYongshouRearEastWing(kit,zoneId){
 if(zoneId!=='west-six')return false;
 if(kit?.root?.name!=='west-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable west-six host, once only, required');
 const staged=new CourtKit(kit.lib,'west-six');let f,meta;
 try{
  f=staged.frame(77.4,343,-Math.PI/2);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.yongshouRearEastStoneTop=true;return m;};
  stone('platform','wall_brick',7.4,.2,3.8,0,.1,0);
  stone('front-step','stone_slab',2.4,.1,.4,0,.05,-2.1);
  box('closed-back-fit','wall_red',6.6,3.1,.24,0,1.75,1.48);
  for(const x of[-3.18,3.18])box('closed-side-fit','wall_red',.24,3.1,2.96,x,1.75,0);
  // Own SOUTH-SIDE viewpoint proves red solid flank, grey foot and porch.
  // Complete front is not documented: two plain closed leaves and side
  // panels are deliberately coarse engineering fit, not copied west windows.
  for(const x of[-.51,.51])box('closed-central-leaf-fit','wood_column',1.01,2.85,.16,x,1.625,-1);
  for(const x of[-2.2,2.2])box('plain-front-unverified','wall_red',2.2,3.1,.24,x,1.75,-1);
  for(let i=0;i<4;i++){const x=-3.3+i*2.2,m=staged.mesh(f,new T.CylinderGeometry(.11,.13,3.2,10),kit.lib.material('wood_column'),x,1.8,-1.7);m.name=ID+'/front-column';}
  box('front-header','caihua_beam',6.6,.3,.3,0,3.35,-1.5);
  const roof=staged.roof(f,{type:'gable',hardGableEnd:true,width:6.6,depth:3.2,baseY:3.5,height:1.5,overhang:.5,brackets:false});roof.name=ID+'/provisional-hard-gable-main';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.yongshouRearEastStoneTop){const b=new T.Box3().setFromObject(m);b.yongshouRearEastStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(74.9,-1e-6,339.1),new T.Vector3(79.9,5.5,346.9));if(!safe.containsBox(b))throw Error('Own rear west wing escaped approved full-height reserve '+JSON.stringify({min:b.min.toArray(),max:b.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-4FE9168B63',source:'https://www.dpm.org.cn/explore/building/236450.html',identityEvidence:'OFFICIAL_NAMED_VIEWPOINT_2930',ownViewpoint:'2930',ownGroup:'35',ownPhoto:'https://file-pano.dpm.org.cn/sphPic/2026/11/01/093851b100064aaebd203d15e25d71f2.jpg',bays:3,photoDoorState:'FRONT_UNVERIFIED',gameDoorState:'CLOSED_EXTERIOR_ONLY_NO_INTERIOR',facadeVerified:false,roofTypeVerified:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['official prose: rear courtyard EAST and WEST wings each three bays, distinct from front wings and rear main hall','own named vp2930 SOUTH SIDE of rear EAST wing: red solid flank, grey masonry foot, red column and low exterior platform; limited dark window fragment only'],
   fit:['all coordinates/dimensions; compact 6.6x3.2 three-bay footprint','hard-gable roof engineering fit: official prose does NOT specify rear-wing roof and this own image crops roof end/top','complete frontal door layout/leaf count and plain closed side panels UNVERIFIED; no west-wing six leaves/green window pattern copied','hidden rear/elevations and recessed door plane localZ -1 for safe exterior porch are engineering fit','low .2m platform and .1m real .4m-deep approach step'],
   excluded:['front EAST wing west-six item9','rear main hall west-six item8 and front main hall item7','already-built rear WEST wing FC-9E42F18295','neighbouring well pavilion, museum objects, exact lattice/paintwork, room access','back/south-gap route, moved old wall/roof, plaque lettering'],unknown:['surveyed dimensions/current admission','full roof type/end geometry and complete frontal window/door arrangement','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
