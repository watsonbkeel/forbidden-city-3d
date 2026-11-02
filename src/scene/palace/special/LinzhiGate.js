import * as T from 'three';
import {CourtKit} from '../kit.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='linzhi-gate-photo-fit',done=new WeakSet();
export const LINZHI_FIT=Object.freeze({x:-120.8,z:303.4,bays:1,thresholdHeight:.06,bounds:Object.freeze([-125,0,301,-116.6,7,306])});
/** Own official BACK photo shows closed leaves. Opening the leaves is explicitly
 * gameplay adaptation to preserve the existing East Second Street, not a claim
 * that the real gate is currently open. Front/details and all dimensions fit. */
export function buildLinzhiGate(kit,zoneId){
 if(zoneId!=='east-six')return false;
 if(kit?.root?.name!=='east-six'||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||!kit.root.scale.equals(new T.Vector3(1,1,1))||done.has(kit)||['colliders','walkables','owned','rooms','mapItems'].some(k=>!Array.isArray(kit[k])||!Object.isExtensible(kit[k]))||!Object.isExtensible(kit.root.children))throw Error('Untransformed mutable east-six host, once only, required');
 const staged=new CourtKit(kit.lib,'east-six');let f,meta;
 try{
  f=staged.frame(-120.8,303.4,0);f.name=ID;
  const green=new T.MeshStandardMaterial({name:'linzhi-glazed-green-coarse-fit',color:0x406e4b,roughness:.7});staged.owned.push(green);
  const box=(role,mat,w,h,d,x,y,z)=>{const m=staged.box(f,mat,w,h,d,x,y,z);m.name=ID+'/'+role;return m;};
  for(const sign of[-1,1]){
   const x=sign*2.4;
   box('stone-jamb-foot','stone_slab',1.4,.8,1.7,x,.4,0);
   box('jamb','wall_red',1.2,3.4,1.5,x,2.5,0);
   // Two real leaves lie beside, not across, the clear passage. Their thin
   // bodies remain collidable; no large invisible box closes the opening.
   box('open-leaf-fit','wood_column',.12,3.35,1.7,sign*1.78,1.745,.9);
  }
  const threshold=box('threshold-fit','stone_slab',3.4,.06,.45,0,.03,0);threshold.userData.linzhiThreshold=true;
  box('green-header-fit','wood_column',6.2,.46,1.65,0,4.18,0).material=green;
  box('green-upper-band-fit','wood_column',6.3,.24,1.8,0,4.53,0).material=green;
  const roof=staged.roof(f,{type:'xieshan',width:6,depth:2.4,baseY:4.65,height:1.05,overhang:.5,brackets:false});roof.name=ID+'/single-roof';
  f.updateWorldMatrix(true,true);let ownerIndex=0;
  // Separate closed wall/leaf/column owners. Roof meshes remain their actual
  // elevated surfaces; no low merged AABB across the open front porch.
  f.traverse(m=>{if(!m.isMesh)return;if(m.userData.linzhiThreshold){const b=new T.Box3().setFromObject(m);b.linzhiThreshold=m.name;staged.colliders.push(b);const top=b.clone();top.min.y=top.max.y;staged.walkables.push({type:'box',box:top,rescue:false});return;}
   const vertices=[],p=m.geometry.attributes.position,ix=m.geometry.index;
   for(let k=0;k<(ix?.count??p.count);k+=3){const vs=[0,1,2].map(j=>{const v=new T.Vector3().fromBufferAttribute(p,ix?.getX(k+j)??k+j).applyMatrix4(m.matrixWorld);return new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));});if(new T.Triangle(...vs).getArea()>=1e-12)vertices.push(...vs.flatMap(v=>v.toArray()));}
   if(!vertices.length)return;const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+'/'+ownerIndex++),owner=shape.box.clone();owner.triangleSupport=shape;staged.colliders.push(owner);}finally{g.dispose();}
  });
  const b=new T.Box3().setFromObject(f),safe=new T.Box3(new T.Vector3(-125,-1e-6,301),new T.Vector3(-116.6,7,306));if(!safe.containsBox(b))throw Error('Linzhi body escaped cleared reserve');
  meta={id:ID,sourceObjectId:'FC-75AB2BF1F2',source:'https://www.dpm.org.cn/explore/building/236552.html',ownPhoto:'https://img.dpm.org.cn/Uploads/Picture/dc/13162[1024].jpg',photoView:'OFFICIAL_CAPTION_BACK',bays:1,photoLeafState:'CLOSED',gameLeafState:'OPEN_GAMEPLAY_ADAPTATION',frontElevationVerified:false,wholeObjectAccepted:false,currentAdmissionVerified:false,newRooms:0,newMapItems:0,
   sourceSupported:['one-bay yellow glazed xieshan with green simulated-timber eaves','own back view red double leaves and stone-foot jambs','south gate of East Second Street'],
   fit:['all dimensions, roof details, colors and front/hidden faces','centred on existing game street (-120.8,303.4), anchor not survey','open leaves preserve gameplay passage despite closed photo','visible .06m threshold adapted for easy walking'],
   excluded:['transverse new courtyard walls','any movement of original street or courtyard walls','Cangzhen/Zhongsi/Qianying gate identities','fine carved glazed ornament or door text unsupported by back view'],unknown:['current opening or admission','surveyed dimensions','unseen front appearance and fine motifs','GPU/mobile appearance']};f.userData.structure=meta;
 }catch(e){staged.dispose(staged.root);throw e;}
 kit.root.add(...[...staged.root.children]);kit.colliders.push(...staged.colliders);kit.walkables.push(...staged.walkables);kit.owned.push(...staged.owned);done.add(kit);return{frame:f,meta};
}
