import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const LUANJIA_SOUTH_FIT=Object.freeze({x:-340,z:-378,width:46,depth:9,eave:6.6,ridge:9.2,roofDepth:10.8});
export const LUANJIA_SOUTH_SOURCE='https://www.dpm.org.cn/explore/building/236525.html';
const ID='luanjia-south-provisional-wing',PARENT='FC-33770DFDD3',FIT='OFFICIAL_PROSE_ENGINEERING_FIT_NOT_SURVEYED';
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** ONE existing south warehouse: prose supports10bays, yellow hard-gable,
 * two internal levels. No own-facade photo verified, no measured footprint.
 * Plain closure/pier rhythm and north-facing front are engineering fits.
 * Existing east five-bay wing is required and retained unchanged. No vanished
 * office court or invented internal floors/stairs/windows/furnishings. */
export function buildLuanjiaSouthWing(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,keys=['colliders','walkables','rooms','owned','mapItems'],east=kit?.root?.children?.filter(o=>o.userData.structure?.id==='luanjia-east-provisional-wing')??[];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||east.length!==1||east[0].position.x!==-352||east[0].position.z!==-331||east[0].rotation.y!==-Math.PI/2||kit.root.children.some(o=>o.userData.structure?.id===ID)||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children)||keys.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k])))throw Error('Luanjia south wing requires original outer-east and one untransformed pre-finish registration');
 const p=LUANJIA_SOUTH_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);frame.rotation.y=Math.PI;
 const geos=[],owned=[],colliders=[],brick=kit.lib.material('wall_brick'),yellow=kit.lib.material('roof_tile'),stone=kit.lib.material('stone_slab');
 const red=new T.MeshStandardMaterial({name:'luanjia-south-unverified-plain-closed-panel',color:0x8a3c30,roughness:.9});owned.push(red);
 const mesh=(geo,mat,role,key)=>{
  if(mat!==red){const name=mat===yellow?'roof_tile':mat===stone?'stone_slab':'wall_brick';const original=geo;geo=applyBoxUV(original,kit.lib.tileSize(name));}
  geos.push(geo);const m=new T.Mesh(geo,mat);m.name=ID+':'+key;m.userData.luanjiaRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);frame.updateMatrixWorld(true);
  const a=[],pos=geo.attributes.position,ix=geo.index;for(let i=0;i<(ix?.count??pos.count);i++){const v=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);a.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}
  const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(a,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+key),c=shape.box.clone();c.triangleSupport=shape;c.luanjiaSouthWing={id:key,parentObjectId:PARENT};colliders.push(c);m.userData.luanjiaOwner=shape.id;}finally{g.dispose();}return m;
 };
 const box=(role,mat,w,h,d,x,y,z,key=role)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role,key);
 const prism=(points,x0,x1)=>{const s=new T.Shape();points.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 try{
  box('flush-ground-stone',stone,46,.08,9,0,-.04,0);
  for(const sign of[-1,1]){
   box('plain-long-masonry',brick,46,6.6,.32,0,3.3,sign*4.34,'long-wall-'+sign);
   box('plain-end-masonry',brick,.32,6.6,9,sign*22.84,3.3,0,'end-wall-'+sign);
  }
  // Eleven shallow piers express text's ten bays, NOT a photograph-derived
  // timber post order. Plain two-level seam does not invent an upper floor.
  for(let i=0;i<=10;i++)box('fitted-bay-pier',brick,.30,6.6,.24,-22.7+45.4*i/10,3.3,-4.52,'bay-pier-'+i);
  box('unverified-two-level-seam',brick,45.4,.14,.12,0,3.3,-4.55);
  // Ten bays have a central pier: keep this unverified panel inside one bay.
  box('unverified-closed-panel',red,2.2,2.7,.10,2.27,1.35,-4.57);
  const half=5.4,curve=z=>p.eave+(p.ridge-p.eave)*(.4*(1-Math.abs(z)/half)+.6*(1-Math.abs(z)/half)**2),points=Array.from({length:17},(_,i)=>{const z=-half+2*half*i/16;return[z,curve(z)]});
  for(const sign of[-1,1])mesh(prism([[-half,6.3],...points.map(([z,y])=>[z,y-.16]),[half,6.3]],sign<0?-23:22.68,sign<0?-22.68:23),brick,'plain-hard-gable-end','gable-'+sign);
  mesh(prism([...points,...points.toReversed().map(([z,y])=>[z,y-.16])],-23,23),yellow,'yellow-hard-gable-roof','roof');
  box('plain-unornamented-ridge',yellow,46,.18,.24,0,9.25,0);
 }catch(error){for(const g of geos)g.dispose();for(const m of owned)m.dispose();throw error;}
 const meta={id:ID,parentObjectId:PARENT,name:'銮驾库南侧十间大库（暂定大形）',...p,bays:10,roofType:'YELLOW_HARD_GABLE_TEXT_BASED',documentedInternalLevels:2,modeledUpperFloors:0,modeledStairs:0,modeledWindows:0,interiorFurnishings:0,front:'NORTH_FACING_TOPOLOGY_FIT_NOT_EXPLICIT_PROSE',modernFacadeVerified:false,wholeObjectAccepted:false,southWarehouseBuilt:true,eastWarehouseChanged:false,vanishedBuildingsBuilt:false,placement:FIT,facadeStatus:'PLAIN_UNVERIFIED_CLOSURE_NOT_PHOTO_RECONSTRUCTION',access:'CLOSED_FITTED_PANEL_NOT_CURRENT_PUBLIC_ADMISSION',sourceUrls:[LUANJIA_SOUTH_SOURCE],sourceImageLimit:'NO_OWN_FACADE_PHOTO_VERIFICATION',triangleOwners:colliders.length,unknown:['precise south-warehouse photographic identity','measured footprint and location','modern windows doors paint and repaired condition','internal two-level floor structure and access','GPU/mobile visual acceptance']};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...owned);kit.mapItems.push({kind:'hall',name:'銮驾库南库（官文十间；暂定大形；未经官照验证）',x:p.x,z:p.z,w:p.width,d:p.depth,rot:Math.PI,parentObjectId:PARENT,sourceStatus:FIT});return{frame,meta,colliders};
}
