import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const ZHIFANG_FIT=Object.freeze({x:-236.5,z:-166,width:18.5,depth:6,eave:3.9,ridge:5.8,roofWidth:18.7,roofDepth:7.6});
export const ZHIFANG_SOURCES=Object.freeze(['https://www.dpm.org.cn/explore/building/236526.html','https://img.dpm.org.cn/Uploads/pdf/3718/T00021_00.pdf','https://www.dpm.org.cn/Uploads/File/2020/05/22/u5ec7aa3e2df0c.pdf']);
const ID='zhifang-provisional-shell',OBJECT='FC-92B6D8420A',identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Five bays behind Chuanxin are supported by official prose; the museum
 * Ale sketch places a horizontal row at the north. No own modern facade
 * or measured plan is available. Roof type, roof color, orientation and all
 * facade closures below are explicitly ENGINEERING PLACEHOLDERS, not findings.
 * No contemporary public access, doors, windows, furnitures or rear court
 * enclosure is inferred. Do not use this to resolve the kitchen/board-room
 * identity conflict. The river, existing buildings and pathways stay unchanged. */
export function buildZhifangShell(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,arrays=['colliders','walkables','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||kit.root.children.some(o=>o.userData.structure?.id===ID)||arrays.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children))throw Error('Zhifang requires retained outer-east and one untransformed pre-finish registration');
 const p=ZHIFANG_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
 const geos=[],materials=[],owners=[];
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.9});materials.push(m);return m;};
 const red=material('zhifang-plain-red-fit',0x9b4938),wood=material('zhifang-exposed-timber-fit',0x644a35),stone=material('zhifang-ground-stone-fit',0xa9a69c),yellow=material('zhifang-unverified-neutral-roof-fit',0x787b75);
 const mesh=(geo,mat,role,parts)=>{geos.push(geo);const m=new T.Mesh(geo,mat);m.name='zhifang-'+role;m.userData.zhifangRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);parts.push(m);return m;};
 const box=(parts,role,mat,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role,parts);
 const own=(parts,id)=>{frame.updateMatrixWorld(true);const vertices=[];for(const m of parts){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const v=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);vertices.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+id),b=shape.box.clone();b.triangleSupport=shape;b.zhifangGate={id,objectId:OBJECT};owners.push(b);for(const m of parts)m.userData.zhifangOwner=shape.id;}finally{g.dispose();}};
 const one=(id,mat,w,h,d,x,y,z)=>{const a=[];box(a,id,mat,w,h,d,x,y,z);own(a,id);};
 const prism=(points,x0,x1)=>{const s=new T.Shape();points.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 const half=3.8,curve=z=>p.eave+(p.ridge-p.eave)*(.35*(1-Math.abs(z)/half)+.65*(1-Math.abs(z)/half)**2);
 try{
  // Visible flush support, no threshold or imaginary access stair.
  one('flush-stone-paving',stone,18.9,.08,6.4,0,-.04,0);
  for(const sign of[-1,1]){
   one('unverified-end-closure-'+sign,red,.24,3.9,6,sign*9.13,1.95,0);
   one('unverified-long-closure-'+sign,red,18.5,3.9,.24,0,1.95,sign*2.88);
  }
  // Six plain column lines only express the documented five-bay count.
  for(const x of[-9.25,-5.55,-1.85,1.85,5.55,9.25])for(const z of[-3,3]){const a=[];mesh(new T.CylinderGeometry(.14,.16,3.9,8).translate(x,1.95,z),red,'five-bay-column',a);own(a,'column-'+x+'-'+z);}
  for(const z of[-3,3])one('unverified-plain-beam-'+z,wood,18.7,.22,.24,0,3.8,z);
  const points=Array.from({length:17},(_,i)=>{const z=-half+2*half*i/16;return[z,curve(z)];});
  // A neutral two-slope hard-gable envelope is a deliberate game choice,
  // NOT a claim that this building has hard-gable or gray tiles in reality.
  for(const sign of[-1,1]){const a=[];mesh(prism([[-half,3.9],...points,[half,3.9]],sign<0?-9.35:9.11,sign<0?-9.11:9.35),red,'unverified-gable-fit',a);own(a,'gable-'+sign);}
  const a=[];mesh(prism([...points,...points.toReversed().map(([z,y])=>[z,y-.14])],-9.35,9.35),yellow,'unverified-two-slope-roof',a);
  for(let i=0;i<=46;i++){const x=-9.29+18.58*i/46,path=new T.CatmullRomCurve3(points.map(([z,y])=>new T.Vector3(x,y+.018,z)));mesh(new T.TubeGeometry(path,16,.035,4,false),yellow,'unverified-neutral-tile-roll',a);}
  box(a,'plain-fitted-ridge',yellow,18.7,.20,.24,0,5.88,0);own(a,'unverified-roof-fit');
 }catch(e){for(const g of geos)g.dispose();for(const m of materials)m.dispose();throw e;}
 const meta={id:ID,objectId:OBJECT,name:'传心殿值房（暂定外壳）',...p,bays:5,roof:'UNVERIFIED_HARD_GABLE_ENGINEERING_PLACEHOLDER',roofVerified:false,tileColor:'UNVERIFIED_NEUTRAL_GRAY_GAME_PALETTE',tileColorVerified:false,front:'UNVERIFIED_SOUTH_FACING_ENGINEERING_FIT',orientationVerified:false,dimensions:'OFFICIAL_FIVE_BAY_COUNT_AND_SKETCH_ROW_ONLY_ENGINEERING_FIT_NOT_SURVEYED',currentExistenceVerified:false,modernFacadeVerified:false,wholeCourtyardAccepted:false,inventedWindows:0,modeledDoorLeaves:0,interiorFurnishings:0,sourceUrls:[...ZHIFANG_SOURCES],sourceImageLimit:'NO_OWN_CURRENT_PHOTOGRAPH',plainInfillStatus:'CLOSED_SIMPLIFIED_GAME_SHELL_NOT_EVIDENCE_OF_REAL_SOLID_WALLS_OR_PUBLIC_ACCESS',unknown:['current physical identity and condition','roof type and tile color','front orientation and door/window arrangement','measured dimensions and exact placement','modern public access','painted artwork and ridge ornaments','GPU/mobile visual acceptance'],triangleOwners:owners.length};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...owners);kit.owned.push(...materials);kit.mapItems.push({kind:'hall',name:'值房（官文五间；屋顶朝向暂定；无现况图）',x:p.x,z:p.z,w:p.width,d:p.depth,rot:0,objectId:OBJECT,sourceStatus:meta.dimensions});return{frame,meta};
}
