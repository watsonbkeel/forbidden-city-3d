import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const LUANJIA_EAST_FIT=Object.freeze({x:-352,z:-331,width:25,depth:9,eave:6.6,ridge:9.2,roofDepth:10.8});
export const LUANJIA_EAST_SOURCE='https://www.dpm.org.cn/explore/building/236525.html';
const ID='luanjia-east-provisional-wing',PARENT='FC-33770DFDD3',FIT='OFFICIAL_PROSE_ENGINEERING_FIT_NOT_SURVEYED';
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** ONE existing east warehouse only: prose supports5bays, yellow hard-gable,
 * two internal levels. No own-facade photo verified, no measured footprint.
 * Plain closure/pier rhythm and west-facing front are game engineering fits.
 * No south10bay store, vanished office courts, invented windows or internal
 * floor/stair inventory. A closed red panel is NOT verified historical door. */
export function buildLuanjiaEastWing(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,keys=['colliders','walkables','rooms','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||kit.root.children.some(o=>o.userData.structure?.id===ID)||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children)||keys.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k])))throw Error('Luanjia east wing requires original outer-east and one untransformed pre-finish registration');
 const p=LUANJIA_EAST_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);frame.rotation.y=-Math.PI/2;
 const geos=[],owned=[],colliders=[],brick=kit.lib.material('wall_brick'),yellow=kit.lib.material('roof_tile'),stone=kit.lib.material('stone_slab');
 const red=new T.MeshStandardMaterial({name:'luanjia-unverified-plain-closed-panel',color:0x8a3c30,roughness:.9});owned.push(red);
 const mesh=(geo,mat,role,key)=>{
  if(mat!==red){const name=mat===yellow?'roof_tile':mat===stone?'stone_slab':'wall_brick';const original=geo;geo=applyBoxUV(original,kit.lib.tileSize(name));}
  geos.push(geo);const m=new T.Mesh(geo,mat);m.name=ID+':'+key;m.userData.luanjiaRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);frame.updateMatrixWorld(true);
  const a=[],pos=geo.attributes.position,ix=geo.index;for(let i=0;i<(ix?.count??pos.count);i++){const v=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);a.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}
  const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(a,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+key),c=shape.box.clone();c.triangleSupport=shape;c.luanjiaEastWing={id:key,parentObjectId:PARENT};colliders.push(c);m.userData.luanjiaOwner=shape.id;}finally{g.dispose();}return m;
 };
 const box=(role,mat,w,h,d,x,y,z,key=role)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role,key);
 const prism=(points,x0,x1)=>{const s=new T.Shape();points.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 try{
  box('flush-ground-stone',stone,25,.08,9,0,-.04,0);
  for(const sign of[-1,1]){
   box('plain-long-masonry',brick,25,6.6,.32,0,3.3,sign*4.34,'long-wall-'+sign);
   box('plain-end-masonry',brick,.32,6.6,9,sign*12.34,3.3,0,'end-wall-'+sign);
  }
  // Six shallow piers express text's five bays, NOT a photograph-derived
  // timber post order. Plain two-level seam does not invent an upper floor.
  for(let i=0;i<=5;i++)box('fitted-bay-pier',brick,.30,6.6,.24,-12.2+24.4*i/5,3.3,-4.52,'bay-pier-'+i);
  box('unverified-two-level-seam',brick,24.7,.14,.12,0,3.3,-4.55);
  box('unverified-closed-panel',red,2.2,2.7,.10,0,1.35,-4.57);
  const half=5.4,curve=z=>p.eave+(p.ridge-p.eave)*(.4*(1-Math.abs(z)/half)+.6*(1-Math.abs(z)/half)**2),points=Array.from({length:17},(_,i)=>{const z=-half+2*half*i/16;return[z,curve(z)]});
  for(const sign of[-1,1])mesh(prism([[-half,6.3],...points.map(([z,y])=>[z,y-.16]),[half,6.3]],sign<0?-12.5:12.18,sign<0?-12.18:12.5),brick,'plain-hard-gable-end','gable-'+sign);
  mesh(prism([...points,...points.toReversed().map(([z,y])=>[z,y-.16])],-12.5,12.5),yellow,'yellow-hard-gable-roof','roof');
  box('plain-unornamented-ridge',yellow,25,.18,.24,0,9.25,0);
 }catch(error){for(const g of geos)g.dispose();for(const m of owned)m.dispose();throw error;}
 const meta={id:ID,parentObjectId:PARENT,name:'銮驾库东侧五间大库（暂定大形）',...p,bays:5,roofType:'YELLOW_HARD_GABLE_TEXT_BASED',documentedInternalLevels:2,modeledUpperFloors:0,modeledStairs:0,modeledWindows:0,interiorFurnishings:0,front:'WEST_FACING_TOPOLOGY_FIT_NOT_EXPLICIT_PROSE',modernFacadeVerified:false,wholeObjectAccepted:false,southWarehouseBuilt:false,vanishedBuildingsBuilt:false,placement:FIT,facadeStatus:'PLAIN_UNVERIFIED_CLOSURE_NOT_PHOTO_RECONSTRUCTION',access:'CLOSED_FITTED_PANEL_NOT_CURRENT_PUBLIC_ADMISSION',sourceUrls:[LUANJIA_EAST_SOURCE],sourceImageLimit:'NO_OWN_FACADE_PHOTO_VERIFICATION',triangleOwners:colliders.length,unknown:['precise east-warehouse photographic identity','measured footprint and location','modern windows doors paint and repaired condition','internal two-level floor structure and access','GPU/mobile visual acceptance']};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...owned);kit.mapItems.push({kind:'hall',name:'銮驾库东库（官文五间；暂定大形；未经官照验证）',x:p.x,z:p.z,w:p.depth,d:p.width,rot:-Math.PI/2,parentObjectId:PARENT,sourceStatus:FIT});return{frame,meta,colliders};
}
