import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const CHUANXIN_ZHUBAN_FIT=Object.freeze({x:-243,z:-182.5,width:9.6,depth:5.6,eave:3.4,ridge:5.2,roofWidth:9.8,roofDepth:7.2,rotation:Math.PI/2});
export const CHUANXIN_ZHUBAN_SOURCES=Object.freeze(['https://www.dpm.org.cn/explore/building/236526.html','https://img.dpm.org.cn/Uploads/pdf/3718/T00021_00.pdf','https://www.dpm.org.cn/Uploads/File/2020/05/22/u5ec7aa3e2df0c.pdf']);
const ID='chuanxin-zhuban-provisional-volume',OBJECT='FC-73FC3BE9A7',identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Three bays behind Chuanxin main hall are supported by official prose.
 * Current physical identity, precise position and all facade/roof properties
 * are UNVERIFIED. The museum sketch's L-shaped attribution conflicts with
 * the kitchen identification literature: no L-wing or factual east-side
 * identification is adopted. This rectangle is an expressly provisional
 * game volume, NOT a current building reconstruction or admission claim.
 * Distinct from Neige's same-named writing room; no Neige identity is rebound. */
export function buildChuanxinZhubanShell(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,arrays=['colliders','walkables','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||kit.root.children.some(o=>o.userData.structure?.id===ID)||arrays.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children))throw Error('ChuanxinZhuban requires retained outer-east and one untransformed pre-finish registration');
 const p=CHUANXIN_ZHUBAN_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);frame.rotation.y=p.rotation;
 const geos=[],materials=[],owners=[];
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.9});materials.push(m);return m;};
 const red=material('chuanxinZhuban-plain-red-fit',0x9b4938),wood=material('chuanxinZhuban-exposed-timber-fit',0x644a35),stone=material('chuanxinZhuban-ground-stone-fit',0xa9a69c),yellow=material('chuanxinZhuban-unverified-neutral-roof-fit',0x787b75);
 const mesh=(geo,mat,role,parts)=>{geos.push(geo);const m=new T.Mesh(geo,mat);m.name='chuanxinZhuban-'+role;m.userData.chuanxinZhubanRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);parts.push(m);return m;};
 const box=(parts,role,mat,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role,parts);
 const own=(parts,id)=>{frame.updateMatrixWorld(true);const vertices=[];for(const m of parts){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const v=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);vertices.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+id),b=shape.box.clone();b.triangleSupport=shape;b.chuanxinZhubanGate={id,objectId:OBJECT};owners.push(b);for(const m of parts)m.userData.chuanxinZhubanOwner=shape.id;}finally{g.dispose();}};
 const one=(id,mat,w,h,d,x,y,z)=>{const a=[];box(a,id,mat,w,h,d,x,y,z);own(a,id);};
 const prism=(points,x0,x1)=>{const s=new T.Shape();points.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 const half=3.6,curve=z=>p.eave+(p.ridge-p.eave)*(.35*(1-Math.abs(z)/half)+.65*(1-Math.abs(z)/half)**2);
 try{
  one('flush-visible-support',stone,10,.08,6,0,-.04,0);
  for(const sign of[-1,1]){
   one('unverified-end-infill-'+sign,red,.24,3.4,5.6,sign*4.68,1.7,0);
   one('unverified-long-infill-'+sign,red,9.6,3.4,.24,0,1.7,sign*2.68);
  }
  // Four equally spaced column lines express three documented bays only.
  for(const x of[-4.8,-1.6,1.6,4.8])for(const z of[-2.8,2.8]){const a=[];mesh(new T.CylinderGeometry(.13,.15,3.4,8).translate(x,1.7,z),red,'three-bay-fit-column',a);own(a,'column-'+x+'-'+z);}
  for(const z of[-2.8,2.8])one('unverified-fit-beam-'+z,wood,9.8,.20,.22,0,3.3,z);
  const points=Array.from({length:17},(_,i)=>{const z=-half+2*half*i/16;return[z,curve(z)];});
  // Roof profile and neutral color are not specified by the source prose.
  for(const sign of[-1,1]){const a=[];mesh(prism([[-half,3.4],...points,[half,3.4]],sign<0?-4.9:4.66,sign<0?-4.66:4.9),red,'unverified-plain-gable-fit',a);own(a,'gable-'+sign);}
  const a=[];mesh(prism([...points,...points.toReversed().map(([z,y])=>[z,y-.14])],-4.9,4.9),yellow,'unverified-two-slope-fit',a);
  for(let i=0;i<=26;i++){const x=-4.84+9.68*i/26,path=new T.CatmullRomCurve3(points.map(([z,y])=>new T.Vector3(x,y+.018,z)));mesh(new T.TubeGeometry(path,16,.035,4,false),yellow,'unverified-tile-fit',a);}
  box(a,'plain-fitted-ridge',yellow,9.8,.18,.22,0,5.27,0);own(a,'unverified-roof-fit');
 }catch(e){for(const g of geos)g.dispose();for(const m of materials)m.dispose();throw e;}
 const meta={id:ID,objectId:OBJECT,name:'传心殿祝版房（三间暂定体量）',...p,bays:3,neigeSameName:false,roof:'UNVERIFIED_HARD_GABLE_ENGINEERING_PLACEHOLDER',roofVerified:false,tileColor:'UNVERIFIED_NEUTRAL_GRAY_GAME_PALETTE',tileColorVerified:false,orientationVerified:false,locationVerified:false,currentIdentityVerified:false,lShapeAdopted:false,eastSideIdentityClaimed:false,modernFacadeVerified:false,currentExistenceVerified:false,wholeCourtyardAccepted:false,modeledWindows:0,modeledDoorLeaves:0,interiorFurnishings:0,dimensions:'OFFICIAL_THREE_BAY_COUNT_BEHIND_CHUANXIN_ONLY_ENGINEERING_PLACEMENT_NOT_SURVEYED',sourceUrls:[...CHUANXIN_ZHUBAN_SOURCES],sourceImageLimit:'NO_VERIFIED_OWN_CURRENT_FACADE_OR_L_SHAPED_IDENTIFICATION',identityConflict:'REAR_BOARD_ROOM_VS_KITCHEN_L_SHAPE_IDENTITY_UNRESOLVED',plainInfillStatus:'CLOSED_SIMPLIFIED_GAME_VOLUME_NOT_REAL_FACADE_OR_PUBLIC_ADMISSION',unknown:['current physical identity and existence','exact position relative to rear kitchen','roof form and tile color','orientation and doors/windows','measured dimensions','modern public access','GPU/mobile visual acceptance'],triangleOwners:owners.length};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...owners);kit.owned.push(...materials);kit.mapItems.push({kind:'hall',name:'传心祝版房（三间暂定；身份位置未核）',x:p.x,z:p.z,w:p.depth,d:p.width,rot:p.rotation,objectId:OBJECT,sourceStatus:meta.dimensions,neigeSameName:false});return{frame,meta};
}
