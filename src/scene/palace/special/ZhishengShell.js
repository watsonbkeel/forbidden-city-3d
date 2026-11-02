import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const ZHISHENG_FIT=Object.freeze({x:-236.5,z:-245,width:21,depth:10,eave:4.3,ridge:7,roofWidth:21.2,roofDepth:11.6});
export const ZHISHENG_SOURCES=Object.freeze(['https://www.dpm.org.cn/explore/building/236526.html','https://img.dpm.org.cn/Uploads/pdf/3718/T00021_00.pdf','https://www.dpm.org.cn/lemmas/244489.html','https://img.dpm.org.cn/Uploads/File/2020/11/13/u5fae21c07c127.pdf']);
const ID='zhisheng-provisional-shell',OBJECT='FC-905A51A8BC',identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** PROVISIONAL game shell only. Official main prose and Huang Yanhong's
 * 2001 article say hard-gable; the official glossary instead says hip-and-gable.
 * This unresolved major silhouette conflict is explicit on the map and metadata.
 * Five bays, three depth bays, yellow roof and north orientation follow prose.
 * No own verified complete roof/facade image. Blank infill is NOT fenestration
 * reconstruction. North doorway is game access, not evidence of current opening.
 * No court walls, shrine kitchen, rear rooms, historic stove or road alteration. */
export function buildZhishengShell(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,arrays=['colliders','walkables','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||kit.root.children.some(o=>o.userData.structure?.id===ID)||arrays.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children))throw Error('Zhisheng requires retained outer-east and one untransformed pre-finish registration');
 const p=ZHISHENG_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
 const geos=[],materials=[],owners=[];
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.9});materials.push(m);return m;};
 const red=material('zhisheng-plain-red-fit',0x9b4938),wood=material('zhisheng-exposed-timber-fit',0x644a35),stone=material('zhisheng-ground-stone-fit',0xa9a69c),yellow=kit.lib.material('roof_tile');
 const mesh=(geo,mat,role,parts)=>{geos.push(geo);const m=new T.Mesh(geo,mat);m.name='zhisheng-'+role;m.userData.zhishengRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);parts.push(m);return m;};
 const box=(parts,role,mat,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role,parts);
 const own=(parts,id)=>{frame.updateMatrixWorld(true);const vertices=[];for(const m of parts){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const v=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);vertices.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+id),b=shape.box.clone();b.triangleSupport=shape;b.zhishengGate={id,objectId:OBJECT};owners.push(b);for(const m of parts)m.userData.zhishengOwner=shape.id;}finally{g.dispose();}};
 const one=(id,mat,w,h,d,x,y,z)=>{const a=[];box(a,id,mat,w,h,d,x,y,z);own(a,id);};
 const prism=(points,x0,x1)=>{const s=new T.Shape();points.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 const half=5.8,curve=z=>p.eave+(p.ridge-p.eave)*(.35*(1-Math.abs(z)/half)+.65*(1-Math.abs(z)/half)**2);
 try{
  // Flush solid paving retains ground at0, requiring no invented stairs,
  // walkable fallback or physical contact exception.
  one('flush-stone-paving',stone,21.6,.08,10.6,0,-.04,0);
  // Two unfenestrated end walls and closed south rear are explicitly an
  // unverified plain envelope. Only the north centre is opened for game access.
  for(const sign of[-1,1])one('plain-end-wall-'+sign,red,.24,4.3,10,sign*10.38,2.15,0);
  one('plain-closed-south-wall',red,21,4.3,.24,0,2.15,-4.88);
  for(const sign of[-1,1])one('unverified-north-infill-'+sign,red,8.4,4.3,.24,sign*6.3,2.15,4.88);
  // Six column lines express five width bays; transverse depth division is
  // retained as a sourced count, not fabricated measured joinery inside.
  for(const x of[-10.5,-6.3,-2.1,2.1,6.3,10.5])for(const z of[-5,5]){const a=[];mesh(new T.CylinderGeometry(.16,.19,4.3,10).translate(x,2.15,z),red,'five-bay-column',a);own(a,'column-'+x+'-'+z);}
  for(const z of[-5,5])one('plain-head-beam-'+z,wood,21.2,.24,.28,0,4.15,z);
  const points=Array.from({length:25},(_,i)=>{const z=-half+2*half*i/24;return[z,curve(z)];});
  // Hard-gable hypothesis: solid gable ends reach the two-slope roof; no
  // projecting hip corners or invented ridge beasts. Roof type stays disputed.
  for(const sign of[-1,1]){const a=[];mesh(prism([[-half,4.3],...points,[half,4.3]],sign<0?-10.6:10.36,sign<0?-10.36:10.6),red,'provisional-hard-gable-end',a);own(a,'gable-'+sign);}
  const a=[];mesh(prism([...points,...points.toReversed().map(([z,y])=>[z,y-.16])],-10.6,10.6),yellow,'provisional-hard-gable-roof',a);
  for(let i=0;i<=60;i++){const x=-10.54+21.08*i/60,path=new T.CatmullRomCurve3(points.map(([z,y])=>new T.Vector3(x,y+.023,z)));mesh(new T.TubeGeometry(path,24,.041,5,false),yellow,'yellow-tile-roll',a);}
  box(a,'plain-ridge',yellow,21.2,.22,.26,0,7.10,0);own(a,'provisional-yellow-roof');
 }catch(e){for(const g of geos)g.dispose();for(const m of materials)m.dispose();throw e;}
 const meta={id:ID,objectId:OBJECT,name:'治牲所（暂定外壳）',...p,bays:5,depthBays:3,roof:'yingshan-provisional',front:'north',dimensions:'OFFICIAL_PROSE_TOPOLOGY_ENGINEERING_FIT_NOT_SURVEYED',roofConflictResolved:false,roofConflict:'MAIN_OFFICIAL_PROSE_YINGSHAN_VS_OFFICIAL_GLOSSARY_XIESHAN_UNRESOLVED',existenceEvidence:'2019_OFFICIAL_JOURNAL_RECORDS_EXISTING_SOOT_BLACKENED_FRAMING_NOT_2026_SURVEY',openState:'NORTH_ENTRY_GAME_ADAPTATION_NOT_CURRENT_PUBLIC_ADMISSION_NOT_THROUGH_GATE',modernFacadeVerified:false,wholeCourtyardAccepted:false,inventedWindows:0,modeledDoorLeaves:0,interiorFurnishings:0,sourceUrls:[...ZHISHENG_SOURCES],sourceImageLimit:'NO_CONFIRMED_COMPLETE_OWN_ROOF_OR_FACADE_PHOTO',plainInfillStatus:'UNVERIFIED_PLAIN_ENVELOPE_NOT_RECONSTRUCTED_FENESTRATION',unknown:['hard-gable versus hip-and-gable official textual conflict','measured dimensions and exact placement','modern facade doors and windows','specific painted artwork and ridge ornaments','current public access','GPU/mobile visual acceptance'],triangleOwners:owners.length};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...owners);kit.owned.push(...materials);kit.mapItems.push({kind:'hall',name:'治牲所（暂定硬山；词条歇山冲突未验；游戏入口）',x:p.x,z:p.z,w:p.width,d:p.depth,rot:0,objectId:OBJECT,sourceStatus:meta.dimensions});return{frame,meta};
}
