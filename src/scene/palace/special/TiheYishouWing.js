import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='tihe-yishou-photo-fit',done=new WeakSet();
export const TIHE_YISHOU_FIT=Object.freeze({x:112.1,z:394.2,width:6.6,depth:2.4,bays:3,bounds:Object.freeze([110.1,0,390.4,114.2,5.5,398])});
export function buildTiheYishouWing(kit,zoneId){
 if(zoneId!=='west-six')return false;
 if(kit?.root?.name!=='west-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable west-six host, once only, required');
 const staged=new CourtKit(kit.lib,'west-six');let f,meta;
 try{
  f=staged.frame(112.1,394.2,Math.PI/2);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.tiheYishouStoneTop=true;return m;};
  stone('platform','wall_brick',7.4,.2,3,0,.1,0);
  stone('front-step','stone_slab',2.4,.1,.4,0,.05,-1.7);
  box('closed-back-fit','wall_red',6.6,3.1,.24,0,1.75,1.08);
  for(const x of[-3.18,3.18])box('closed-side-fit','wall_red',.24,3.1,2.16,x,1.75,0);
  // Official titled Yishou photo and vp3076 link identify this WEST wing
  // of Tihe court, not the Changchun namesake. Coarse closed middle and
  // upper-red/lower-pale side windows only; no fine lattice/plaque carving.
  const dark=new T.MeshStandardMaterial({name:'tihe-yishou-upper-window-fit',color:0x373a33,roughness:.9}),pale=new T.MeshStandardMaterial({name:'tihe-yishou-lower-window-fit',color:0xb5b3a0,roughness:.9}),green=new T.MeshStandardMaterial({name:'tihe-yishou-green-border-fit',color:0x285448,roughness:.9});staged.owned.push(dark,pale,green);
  for(const x of[-.51,.51])box('closed-central-leaf-fit','wood_column',1.01,2.85,.16,x,1.625,-.6);
  for(const x of[-2.2,2.2]){
   box('window-sill','wall_brick',2.2,.65,.24,x,.525,-.6);
   box('sill-window','wood_column',2.2,2.45,.16,x,2.075,-.6);
   box('coarse-upper-window-fit','wood_column',1.94,1.1,.04,x,2.64,-.7).material=dark;
   box('coarse-lower-window-fit','wood_column',1.94,1.1,.04,x,1.4,-.7).material=pale;
   for(const y of[.85,2.02,3.2])box('coarse-red-window-crossbar-fit','wood_column',2.04,.07,.06,x,y,-.73);
   box('coarse-red-window-upright-fit','wood_column',.07,2.35,.06,x,2.025,-.73);for(const dx of[-1.07,1.07])box('coarse-green-window-edge-fit','wood_column',.055,2.45,.06,x+dx,2.075,-.73).material=green;
  }
  for(let i=0;i<4;i++){const x=-3.3+i*2.2,m=staged.mesh(f,new T.CylinderGeometry(.11,.13,3.2,10),kit.lib.material('wood_column'),x,1.8,-1.3);m.name=ID+'/front-column';}
  box('front-header','caihua_beam',6.6,.3,.3,0,3.35,-1.1);
  const roof=staged.roof(f,{type:'gable',hardGableEnd:true,width:6.6,depth:2.4,baseY:3.5,height:1.5,overhang:.5,brackets:false});roof.name=ID+'/provisional-hard-gable-main';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.tiheYishouStoneTop){const b=new T.Box3().setFromObject(m);b.tiheYishouStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(110.1,-1e-6,390.4),new T.Vector3(114.2,5.5,398));if(!safe.containsBox(b))throw Error('Own rear west wing escaped approved full-height reserve '+JSON.stringify({min:b.min.toArray(),max:b.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-0C3B33AC86',source:'https://www.dpm.org.cn/explore/building/236529.html',identityEvidence:'OFFICIAL_TITLED_PHOTO_AND_NAMED_VP3076_WEST_LINK',ownViewpoint:'3076',ownGroup:'57',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4542d504c.jpg',bays:3,photoDoorState:'CLOSED',gameDoorState:'CLOSED_EXTERIOR_ONLY_NO_INTERIOR',facadeVerified:false,roofTypeVerified:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['official Tihe page titled image: Tihe court Yishou, separate from Changchun namesake','official vp3076/group57 Yishou links explicitly identify WEST wing of Yikun rear hall as Yishou','own image: three-part front, closed middle leaf group, red upper lattice/pale lower side windows with green border, grey masonry low platform and short steps'],
   fit:['all coordinates/dimensions; width6.6 and compact depth2.4 preserve original side-alley geometry, NOT surveyed depth','hard-gable roof is engineering fit; own roof ends/hidden junctions not completely certified','coarse window/door subdivisions and hidden sides; no fine lattice, plaque or stone carvings','safe recessed front plane localZ -.6; .2 platform and .1-high/.4-deep real step are fit'],
   excluded:['Changchun rear-court namesake Yishou FC-E17AD83491','Yikun front WEST wing item17 moved south to z367.3','original Tihe main hall item15, its room contents/doors/platform and Chuxiu courtyard','existing Yikun side-alley and Chuxiu approach geometry/metadata remain unchanged','photo bronze vat, pedestal, crane and rail, fine inscription, room access'],unknown:['surveyed dimensions/current admission, full hidden facade and roof junctions','complete historic/current furnishings','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
