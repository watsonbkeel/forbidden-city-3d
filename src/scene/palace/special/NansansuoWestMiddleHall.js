import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const NANSANSUO_WEST_MIDDLE_FIT=Object.freeze({x:-251.8,z:53.5,width:19,depth:7.5,eave:4.4,ridge:7,roofWidth:19.2,roofDepth:9.5,rotation:0});
export const NANSANSUO_WEST_MIDDLE_SOURCES=Object.freeze(['https://www.dpm.org.cn/explore/building/236452.html','https://img.dpm.org.cn/Uploads/Picture/dc/7996.jpg','https://img.dpm.org.cn/static/themes/image/xf/map3.jpg']);
const ID='nansansuo-west-court-middle-fit',OBJECT='FC-D4F3E359DE',identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Official prose236452 supports all three courts sharing five-bay green
 * hard-gable middle/rear halls. This WEST shell is a text-based game fit.
 * Photograph7996 identifies the MIDDLE court only; it is not own-facade proof.
 * Dimensions, placement, plain window grids and closed infill are adaptations.
 * No retained item13 identity is changed; no interior or admission is claimed. */
export function buildNansansuoWestMiddleHall(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,arrays=['colliders','walkables','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||kit.root.children.some(o=>o.userData.structure?.id===ID)||arrays.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children))throw Error('NansansuoWestMiddleHall requires retained outer-east and one untransformed pre-finish registration');
 const p=NANSANSUO_WEST_MIDDLE_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);frame.rotation.y=p.rotation;
 const geos=[],materials=[],owners=[];
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.9});materials.push(m);return m;};
 const red=material('westMiddleHall-plain-red-fit',0x9b4938),wood=material('westMiddleHall-exposed-timber-fit',0x644a35),stone=material('westMiddleHall-ground-stone-fit',0xa9a69c),yellow=material('westMiddleHall-text-green-roof-fit',0x526c4d);
 const mesh=(geo,mat,role,parts)=>{geos.push(geo);const m=new T.Mesh(geo,mat);m.name='westMiddleHall-'+role;m.userData.westMiddleHallRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);parts.push(m);return m;};
 const box=(parts,role,mat,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role,parts);
 const own=(parts,id)=>{frame.updateMatrixWorld(true);const vertices=[];for(const m of parts){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const v=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);vertices.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+id),b=shape.box.clone();b.triangleSupport=shape;b.westMiddleHallGate={id,objectId:OBJECT};owners.push(b);for(const m of parts)m.userData.westMiddleHallOwner=shape.id;}finally{g.dispose();}};
 const one=(id,mat,w,h,d,x,y,z)=>{const a=[];box(a,id,mat,w,h,d,x,y,z);own(a,id);};
 const prism=(points,x0,x1)=>{const s=new T.Shape();points.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 const half=4.75,curve=z=>p.eave+(p.ridge-p.eave)*(.35*(1-Math.abs(z)/half)+.65*(1-Math.abs(z)/half)**2);
 try{
  one('solid-low-plinth-fit',stone,19.4,.30,7.9,0,.15,0);
  for(const sign of[-1,1]){
   one('plain-unseen-end-infill-'+sign,red,.24,4.1,7.5,sign*9.38,2.35,0);
   one('closed-front-and-back-fit-'+sign,red,19,4.1,.24,0,2.35,sign*3.63);
   one('gray-lower-front-and-back-'+sign,stone,19,1.05,.27,0,.825,sign*3.64);
  }
  const axes=[-9.5,-5.7,-1.9,1.9,5.7,9.5];
  for(const x of axes)for(const z of[-3.75,3.75]){const a=[];mesh(new T.CylinderGeometry(.16,.18,4.1,8).translate(x,2.35,z),red,'five-bay-column',a);own(a,'column-'+x+'-'+z);one('plain-bearing-fit-'+x+'-'+z,wood,.7,.2,.6,x,4.05,z);}
  for(const z of[-3.75,3.75])one('plain-fit-beam-'+z,wood,19.2,.24,.26,0,4.25,z);
  // Four broad closed window fields; exact historic lattice counts are NOT asserted.
  for(const x of[-7.6,-3.8,3.8,7.6]){const a=[];box(a,'closed-window-field-fit',stone,3.25,1.9,.06,x,2.45,-3.79);for(const dx of[-1.63,0,1.63])box(a,'window-frame-fit',red,.10,2.1,.10,x+dx,2.45,-3.84);for(const y of[1.4,2.45,3.5])box(a,'window-frame-fit',red,3.35,.10,.10,x,y,-3.84);for(let j=-5;j<=5;j++)box(a,'simplified-lattice-fit',wood,.026,1.9,.025,x+j*.27,2.45,-3.90);for(let j=0;j<7;j++)box(a,'simplified-lattice-fit',wood,3.25,.026,.025,x,1.63+j*.27,-3.90);own(a,'window-'+x);}
  const door=[];for(const x of[-.66,.66]){box(door,'closed-central-door-fit',wood,1.28,2.8,.08,x,1.7,-3.81);for(const y of[.7,1.7,2.7])box(door,'door-panel-fit',red,1.08,.72,.05,x,y,-3.88);}own(door,'closed-central-door-fit');
  const points=Array.from({length:17},(_,i)=>{const z=-half+2*half*i/16;return[z,curve(z)];});
  for(const sign of[-1,1]){const a=[];mesh(prism([[-half,4.4],...points,[half,4.4]],sign<0?-9.6:9.36,sign<0?-9.36:9.6),stone,'plain-hard-gable-fit',a);own(a,'gable-'+sign);}
  const a=[];mesh(prism([...points,...points.toReversed().map(([z,y])=>[z,y-.14])],-9.6,9.6),yellow,'green-two-slope-fit',a);
  for(let i=0;i<=38;i++){const x=-9.54+19.08*i/38,path=new T.CatmullRomCurve3(points.map(([z,y])=>new T.Vector3(x,y+.018,z)));mesh(new T.TubeGeometry(path,16,.035,4,false),yellow,'plain-tile-fit',a);}
  box(a,'plain-fitted-ridge',yellow,19.2,.18,.22,0,7.07,0);own(a,'green-roof-fit');
 }catch(e){for(const g of geos)g.dispose();for(const m of materials)m.dispose();throw e;}
 const meta={id:ID,objectId:OBJECT,name:'南三所西所中殿（位置拟合）',...p,bays:5,roof:'GREEN_HARD_GABLE_OFFICIAL_PROSE',locationVerified:false,rebindsItem13:false,currentIdentityVerified:false,officialPhotoIdentityVerified:false,identityScope:'OFFICIAL_SAME_FORM_PROSE_WITH_FITTED_POSITION_NO_OWN_FACADE_IDENTITY',wholeCourtyardAccepted:false,interiorFurnishings:0,sourceUrls:[...NANSANSUO_WEST_MIDDLE_SOURCES],sourceImage:'NO_OWN_WEST_FACADE_PHOTO_VERIFIED;7996_IS_MIDDLE_COURT_CATEGORY_REFERENCE_ONLY',dimensions:'ENGINEERING_FIT_WITHIN_SCANNED_GAP_NOT_SURVEY',plainInfillStatus:'PLAIN_CLOSED_FITTED_FRONT_AND_BACK_NO_PUBLIC_ACCESS_CLAIM',unknown:['measured position and size','precise lattice and painted decoration','unseen side and rear','own west-middle facade identity','existing item13 middle/rear identity','GPU/mobile visual acceptance'],triangleOwners:owners.length};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...owners);kit.owned.push(...materials);kit.mapItems.push({kind:'hall',name:'南三所西所中殿（位置拟合；旧北壳身份未改）',x:p.x,z:p.z,w:p.width,d:p.depth,rot:0,objectId:OBJECT,sourceStatus:meta.dimensions});return{frame,meta};
}
