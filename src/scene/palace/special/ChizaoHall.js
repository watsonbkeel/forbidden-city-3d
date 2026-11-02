import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='chizao-source-fit',done=new WeakSet();
export const CHIZAO_FIT=Object.freeze({x:-58.8,z:514.5,width:14,depth:3.6,bays:5,bounds:Object.freeze([-66.3,0,511.8,-51.3,5.5,517.2])});
export function buildChizaoHall(kit,zoneId){
 if(zoneId!=='garden')return false;
 if(kit?.root?.name!=='garden'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable west-six host, once only, required');
 const staged=new CourtKit(kit.lib,'garden');let f,meta;
 try{
  f=staged.frame(-58.8,514.5,0);f.name=ID;
  const box=(role,mat,w,h,d,x,y,z)=>{const m=typeof mat==='string'?staged.box(f,mat,w,h,d,x,y,z):staged.mesh(f,new T.BoxGeometry(w,h,d),mat,x,y,z);m.name=ID+'/'+role;return m;};
  const stone=(role,mat,w,h,d,x,y,z)=>{const m=box(role,mat,w,h,d,x,y,z);m.userData.chizaoStoneTop=true;return m;};
  stone('platform','wall_brick',14.8,.2,4.2,0,.1,0);
  stone('front-step','stone_slab',2.8,.1,.4,0,.05,-2.3);
  box('closed-back-fit','wall_red',14,3.1,.24,0,1.75,1.68);
  for(const x of[-6.88,6.88])box('closed-side-fit','wall_red',.24,3.1,3.36,x,1.75,0);
  // A recessed closed facade leaves a genuine low exterior porch. Its exact
  // depth and exact window proportions are fitted, not photo measurements.
  const dark=new T.MeshStandardMaterial({name:'chizao_coarse_upper_window_fit',color:0x342d29,roughness:.9}),light=new T.MeshStandardMaterial({name:'chizao_coarse_lower_window_fit',color:0x858c8b,roughness:.6});staged.owned.push(dark,light);
  for(const x of[-1.05,-.35,.35,1.05]){box('closed-central-leaf','wood_column',.7,2.85,.2,x,1.625,-.9);box('central-upper-glazing-coarse',dark,.52,1.2,.04,x,2.12,-1.02);}
  for(const x of[-5.6,-2.8,2.8,5.6]){
   box('closed-window-backing','wall_red',2.8,3.1,.24,x,1.75,-.9);
   box('sill-window',light,2.36,1.12,.04,x,1.18,-1.04);
   box('coarse-upper-window',dark,2.36,.86,.04,x,2.3,-1.04);
   for(const dx of[-.7,0,.7])box('coarse-window-upright','wood_column',.05,.86,.05,x+dx,2.3,-1.07);
  }
  for(let i=0;i<6;i++){const x=-7+i*2.8,m=staged.mesh(f,new T.CylinderGeometry(.13,.15,3.2,10),kit.lib.material('wood_column'),x,1.8,-1.9);m.name=ID+'/front-column';}
  box('front-header','caihua_beam',14,.3,.3,0,3.35,-1.8);
  const roof=staged.roof(f,{type:'gable',hardGableEnd:true,width:14,depth:3.6,baseY:3.5,height:1.5,overhang:.5,brackets:false});roof.name=ID+'/official-hard-gable-main';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.chizaoStoneTop){const b=new T.Box3().setFromObject(m);b.chizaoStoneTop=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-66.3,-1e-6,511.8),new T.Vector3(-51.3,5.5,517.2));if(!safe.containsBox(b))throw Error('Chizao actual geometry escaped approved full envelope '+JSON.stringify({min:b.min.toArray(),max:b.max.toArray()}));
  meta={id:ID,sourceObjectId:'FC-35C163B4E4',name:'摛藻堂',source:'https://www.dpm.org.cn/explore/building/236432.html',identityEvidence:'OWN_OFFICIAL_CHIZAO_TEXT_AND_PHOTO',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/2020/04/16/s5e980a146322f.jpg',bays:5,closedCentralLeaves:4,photoDoorState:'CLOSED_CENTER_WITH_MODERN_SHOP_SIGN_NOT_MODELED',gameDoorState:'CLOSED_EXTERIOR_ONLY_NO_INTERIOR',facadeVerified:false,roofTypeVerified:true,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['own official text: east of Duixiu hill against north wall; south-facing five-bay yellow hard-gable, front porch, central door and adjacent/outer sill windows','own photograph behind foreground Fubi pavilion: four red closed leaves with glazed upper sections, upper lattice/lower window regions, gray low base'],
   fit:['all coordinates and dimensions, including width14/depth3.6 and eastward offset to preserve original x48/north cross paths; not survey','hidden sides/back and outer bays; coarse window bars/colors, recessed closed facade; no modern shop fixture','visible .2 platform/.1 step and exact matching tops; only exterior porch approach'],
   excluded:['foreground Fubi columns/roof/stone rails, retained pond/pavilion/north approach','shop sign/plaque/furniture/interior admission and unmodeled west ear-room doorway','landscape trimming or tree removal; all original garden trees/beds/paths remain unchanged'],unknown:['exact current facade details and material pattern','surveyed coordinates/current public admission','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
