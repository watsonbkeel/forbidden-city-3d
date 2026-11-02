import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='changchun-lezhi-photo-fit',done=new WeakSet();
export const CHANGCHUN_LEZHI_FIT=Object.freeze({x:168.0,z:391.2,width:6.6,depth:2.4,bays:3,bounds:Object.freeze([165.9,0,387.4,170.1,5.5,395.0])});
export function buildChangchunLezhiWing(kit,zoneId){
 if(zoneId!=='west-six')return false;
 if(kit?.root?.name!=='west-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable west-six host, once only, required');
 const staged=new CourtKit(kit.lib,'west-six');let f,meta;
 try{
  f=staged.frame(168.0,391.2,Math.PI/2);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.changchunLezhiStoneTop=true;return m;};
  stone('platform','wall_brick',7.4,.2,3,0,.1,0);
  stone('front-step','stone_slab',2.4,.1,.4,0,.05,-1.7);
  box('closed-back-fit','wall_red',6.6,3.1,.24,0,1.75,1.08);
  for(const x of[-3.18,3.18])box('closed-side-fit','wall_red',.24,3.1,2.16,x,1.75,0);
  // Official rear-court west wing name and three bays only. No own facade
  // image: all front/side/roof details are plain engineering placeholders.
  box('closed-central-group-fit','wood_column',2.04,2.85,.16,0,1.625,-.6);
  for(const x of[-2.2,2.2])box('plain-closed-front-fit','wall_red',2.2,3.1,.24,x,1.75,-.6);
  for(let i=0;i<4;i++){const x=-3.3+i*2.2,m=staged.mesh(f,new T.CylinderGeometry(.11,.13,3.2,10),kit.lib.material('wood_column'),x,1.8,-1.3);m.name=ID+'/front-column';}
  box('front-header','caihua_beam',6.6,.3,.3,0,3.35,-1.1);
  const roof=staged.roof(f,{type:'gable',hardGableEnd:true,width:6.6,depth:2.4,baseY:3.5,height:1.5,overhang:.5,brackets:false});roof.name=ID+'/provisional-hard-gable-main';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.changchunLezhiStoneTop){const b=new T.Box3().setFromObject(m);b.changchunLezhiStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(165.9,-1e-6,387.4),new T.Vector3(170.1,5.5,395.0));if(!safe.containsBox(b))throw Error('Own rear west wing escaped approved full-height reserve '+JSON.stringify({min:b.min.toArray(),max:b.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-E5B6CB1D68',source:'https://www.dpm.org.cn/explore/building/236436.html',identityEvidence:'OFFICIAL_REAR_COURT_WEST_THREE_BAY_TEXT',ownViewpoint:null,ownGroup:null,ownPhoto:null,bays:3,photoDoorState:'UNKNOWN_NO_OWN_PHOTO',gameDoorState:'CLOSED_EXTERIOR_ONLY_NO_INTERIOR',facadeVerified:false,roofTypeVerified:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['official Changchun text: rear hall Yiqing Shushi; EAST rear wing Yishou, WEST rear wing Lezhi, each three bays','independent original FC-E5B6CB1D68, not the already-built east Yishou wing or front wings'],
   fit:['all coordinates/dimensions including compact width6.6/depth2.4; not surveyed','hard-gable roof/color, closed central group/plain front walls and hidden facade are engineering fit without own exterior photo','low .2 platform and .1 step with real Box/top; no room admission'],
   excluded:['Tihe court Yishou FC-0C3B33AC86 and Changchun east Yishou FC-E17AD83491 and any borrowed photographs','original Changchun front wings items41/42 and Yiqing rear main item40 remain unchanged','east Yishou, ear rooms, well pavilion, furniture and exact decoration','all interiors and any claim of current public access'],unknown:['full own exterior/photo, surveyed dimensions/current admission','door/window count, roof subtype and historic/current furnishings','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
