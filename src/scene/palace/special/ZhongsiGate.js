import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='zhongsi-gate-photo-fit',done=new WeakSet();
export const ZHONGSI_FIT=Object.freeze({x:122.4,z:303.9,bays:1,thresholdHeight:.06,bounds:Object.freeze([118.2,0,301.5,126.6,7,306.5])});
/** Own official partial-front and back photos plus explicit single-bay text.
 * Gate proportions are separately fitted; this is not a mirrored Linzhi claim.
 * Open leaves/low threshold preserve game traffic, not current admission. */
export function buildZhongsiGate(kit,zoneId){
 if(zoneId!=='west-six')return false;
 if(kit?.root?.name!=='west-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable west-six host, once only, required');
 const staged=new CourtKit(kit.lib,'west-six');let f,meta;
 try{
  f=staged.frame(122.4,303.9,0);f.name=ID;
  const green=new T.MeshStandardMaterial({name:'zhongsi-glazed-green-coarse-fit',color:0x406e4b,roughness:.7});staged.owned.push(green);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  for(const sign of[-1,1]){
   const x=sign*2.5;
   box('stone-jamb-foot','stone_slab',1.4,1,1.7,x,.5,0);
   box('jamb','wall_red',1.2,3.2,1.5,x,2.6,0);
   // Two real leaves lie beside, not across, the clear passage. Their thin
   // bodies remain collidable; no large invisible box closes the opening.
   box('open-leaf-fit','wood_column',.12,3.35,1.7,sign*1.88,1.745,.9);
  }
  const threshold=box('threshold-fit','stone_slab',3.6,.06,.45,0,.03,0);threshold.userData.zhongsiThreshold=true;
  box('green-header-fit','wood_column',6.4,.46,1.65,0,4.18,0).material=green;
  box('green-upper-band-fit','wood_column',6.5,.24,1.8,0,4.53,0).material=green;
  const roof=staged.roof(f,{type:'xieshan',width:6.2,depth:2.2,baseY:4.65,height:1.05,overhang:.5,brackets:false});roof.name=ID+'/single-roof';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.zhongsiThreshold){const b=new T.Box3().setFromObject(m);b.zhongsiThreshold=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(118.2,-1e-6,301.5),new T.Vector3(126.6,7,306.5));if(!safe.containsBox(b))throw Error('Zhongsi body escaped cleared reserve');
  meta={id:ID,sourceObjectId:'FC-CF00F15FA8',source:'https://www.dpm.org.cn/explore/building/236551.html',ownPhotos:['https://img.dpm.org.cn/Uploads/Picture/dc/13146[1024].jpg','https://img.dpm.org.cn/Uploads/Picture/dc/13145[1024].jpg'],photoView:'PARTLY_OCCLUDED_FRONT_AND_BACK_WITH_GUARDROOM',bays:1,photoLeafState:'FRONT_PARTLY_OPEN_BACK_CLOSED',gameLeafState:'OPEN_GAMEPLAY_ADAPTATION',completeUnoccludedElevationVerified:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['own front/back complementary views: yellow roof, green header, red jambs and stone feet','text: south-facing one-bay yellow glazed xieshan, green simulated timber, two palace leaves','south end of West Second Street; separate from Baizi and Linzhi gates'],
   fit:['all dimensions, coarse colors, hidden elevations and fine decoration','location (122.4,303.9) relative to original street, anchor not survey','both leaves opened to preserve gameplay passage','visible .06m low threshold, not reconstructed historical removable sill'],
   excluded:['new transverse walls or adjacent photographed guardroom','any movement of Yangxin north wall, original street or courtyard walls','Linzhi/Cangzhen/Baizi identities','fine glazing motifs/plaque script not reconstructed'],unknown:['current opening or admission','surveyed dimensions and fully unoccluded elevations','exact historical removable-threshold configuration','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
