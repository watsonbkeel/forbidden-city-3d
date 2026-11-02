import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='shangshu-south-gallery-photo-fragment',done=new WeakSet();
export const SHANGSHU_SOURCES=Object.freeze(['https://img.dpm.org.cn/Uploads/File/2020/11/12/u5fad17a90fd05.pdf#page=6','https://www.dpm.org.cn/Uploads/File/2021/07/02/u60de8dd5a4e41.pdf#page=3']);
/** Replace ONLY a fitted 12m portion of garden12 with a photographed north
 * exterior porch. Not a whole Shangshufang, surveyed footprint or interior.
 * This is a buildWall replacement, never an after-finish decoration over a wall. */
export function buildShangshuSouthFragment(kit,item,zoneId,index){
 if(zoneId!=='garden'||index!==12)return false;
 if(kit?.root?.name!=='garden'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||item?.kind!=='wall'||JSON.stringify(item.from)!=='[-19.3,215.3]'||JSON.stringify(item.to)!=='[-54.25,215.3]'||item.h!==7||item.t!==undefined||item.gaps!==undefined||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Unchanged garden12 pre-build declaration required');
 const staged=new CourtKit(kit.lib,'garden');let f,meta;
 try{
  staged.wall(-54.25,215.3,-46,215.3,{h:7});staged.wall(-34,215.3,-19.3,215.3,{h:7});
  f=staged.frame(-40,216.8,0);f.name=ID;const dark=new T.MeshStandardMaterial({name:'shangshu-coarse-closed-dark-fit',color:0x392823,roughness:.9});staged.owned.push(dark);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m};
  // Low continuous visible grey plinth is a gameplay height fit; original
  // photograph shows a raised grey base but supplies no metric datum.
  const platform=box('low-grey-platform-fit','wall_brick',12,.2,4.4,0,.1,.2);
  box('closed-rear-wall','wall_red',12,4.2,.5,0,2.3,-1.5);
  for(const x of[-5.85,5.85])box('closed-side-return-fit','wall_red',.3,4.2,2,x,2.3,-.65);
  box('closed-front-backing','wall_red',11.7,3.7,.2,0,2.05,.2);
  // Three fitted display divisions, not a historical bay-count assertion.
  for(const x of[-3.9,0,3.9]){
   box('red-closed-door-panel','wood_column',3.5,2.8,.08,x,1.9,.34);
   box('coarse-dark-window-field','wood_column',2.9,1.35,.04,x,2.55,.39).material=dark;
   for(const dx of[-1.47,0,1.47])box('plain-red-window-frame','wood_column',.09,1.48,.08,x+dx,2.55,.43);
   for(const y of[1.81,2.55,3.29])box('plain-red-window-frame','wood_column',3,.09,.08,x,y,.43);
  }
  for(const x of[-5.8,-1.94,1.94,5.8]){
   const m=staged.mesh(f,new T.CylinderGeometry(.16,.18,4.2,12),kit.lib.material('wood_column'),x,2.3,2);m.name=ID+'/red-porch-column';
   box('grey-column-foot','stone_slab',.46,.2,.46,x,.3,2);
  }
  box('blue-green-beam','caihua_beam',12,.48,.28,0,4.25,2);
  box('rear-bearing-beam','caihua_beam',12,.35,.28,0,4.3,-1.5);
  staged.roof(f,{type:'gable',width:12,depth:4.4,baseY:4.5,height:2.0,overhang:.5,brackets:false});
  f.updateWorldMatrix(true,true);const vertices=[];f.traverse(m=>{if(!m.isMesh||m===platform)return;const a=m.geometry.attributes.position,ix=m.geometry.index;for(let k=0;k<(ix?.count??a.count);k++){const v=new T.Vector3().fromBufferAttribute(a,ix?ix.getX(k):k).applyMatrix4(m.matrixWorld);vertices.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}});
  const real=[];for(let k=0;k<vertices.length;k+=9){const a=new T.Vector3(...vertices.slice(k,k+3)),b=new T.Vector3(...vertices.slice(k+3,k+6)),c=new T.Vector3(...vertices.slice(k+6,k+9));if(new T.Triangle(a,b,c).getArea()>=1e-12)real.push(...vertices.slice(k,k+9));}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(real,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  // One true plinth top. No virtual ramp, room or step-contact exception.
  const pb=new T.Box3().setFromObject(platform);pb.shangshuVisiblePlatform=true;staged.colliders.push(pb);const top=pb.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});
  meta={id:ID,sourceObjectId:'FC-372C5E7508',name:'上书房南庑局部外观拟合',sources:[...SHANGSHU_SOURCES],sourceTarget:'garden/items/12 PARTIAL x[-46,-34] ONLY',photoSupported:['north-facing red column porch','closed red doors/windows','blue-green beam','yellow roof','grey raised base'],relativeLocationVerified:true,metricLocationVerified:false,wholeObjectAccepted:false,currentInteriorVerified:false,partialFragment:true,displayDivisions:3,displayDivisionStatus:'ENGINEERING_FIT_NOT_VERIFIED_BAY_COUNT',platformHeightStatus:'.2m GAMEPLAY FIT_NOT_PHOTO_MEASUREMENT',roofDepthAndEndsVerified:false,newRoomCount:0,newMapCount:0,oldWallActualCollisionHeight:3,retainedWallSegments:[[-54.25,-46],[-34,-19.3]],unknown:['complete room boundary and number of bays','measured size/depth/height','roof ends and hidden sides','photograph date and present-day admission','interior/current furniture','GPU/mobile visual acceptance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
