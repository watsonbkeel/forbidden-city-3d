import * as T from 'three';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
export const JINGXING_FIT=Object.freeze({x:-236.5,z:-224,width:13.2,depth:6.4,eave:4.3,ridge:6.7,roofWidth:15.2,roofDepth:8.2});
export const JINGXING_SOURCES=Object.freeze(['https://www.dpm.org.cn/explore/building/236526.html','https://img.dpm.org.cn/Uploads/pdf/3718/T00021_00.pdf','https://www.dpm.org.cn/Uploads/File/2020/05/22/u5ec7aa3e2df0c.pdf']);
const ID='jingxing-gate-candidate',OBJECT='FC-CE6964B462',identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Official prose establishes three bays, south-facing suspended-gable yellow
 * roof and the historical centre passage. The museum's Ale article says this
 * gate became offices. This SIMPLE GAME FIT does not reconstruct unseen modern
 * office windows, door leaves or paintings. The map label makes that visible.
 * No south courtyard gate/walls, no rear rooms, no changed river or road. */
export function buildJingxingGate(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,arrays=['colliders','walkables','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||kit.root.children.some(o=>o.userData.structure?.id===ID)||arrays.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children))throw Error('Jingxing requires retained outer-east and one untransformed pre-finish registration');
 const p=JINGXING_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
 const geos=[],materials=[],owners=[];
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.9});materials.push(m);return m;};
 const red=material('jingxing-plain-red-fit',0x9b4938),wood=material('jingxing-exposed-timber-fit',0x644a35),stone=material('jingxing-ground-stone-fit',0xa9a69c),yellow=kit.lib.material('roof_tile');
 const mesh=(geo,mat,role,parts)=>{geos.push(geo);const m=new T.Mesh(geo,mat);m.name='jingxing-'+role;m.userData.jingxingRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);parts.push(m);return m;};
 const box=(parts,role,mat,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role,parts);
 const own=(parts,id)=>{frame.updateMatrixWorld(true);const vertices=[];for(const m of parts){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const v=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);vertices.push(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(vertices,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+id),b=shape.box.clone();b.triangleSupport=shape;b.jingxingGate={id,objectId:OBJECT};owners.push(b);for(const m of parts)m.userData.jingxingOwner=shape.id;}finally{g.dispose();}};
 const one=(id,mat,w,h,d,x,y,z)=>{const a=[];box(a,id,mat,w,h,d,x,y,z);own(a,id);};
 const prism=(points,x0,x1)=>{const s=new T.Shape();points.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 const half=4.1,curve=z=>p.eave+(p.ridge-p.eave)*(.35*(1-Math.abs(z)/half)+.65*(1-Math.abs(z)/half)**2);
 const beam=(parts,role,a,b,w)=>{const va=new T.Vector3(...a),vb=new T.Vector3(...b),dir=vb.clone().sub(va),g=new T.BoxGeometry(w,dir.length(),w);g.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize())));g.translate(...va.add(vb).multiplyScalar(.5).toArray());mesh(g,wood,role,parts);};
 try{
  // The top is exactly y=0, matching existing visible ground. No raised
  // threshold, artificial ramp, rescue plane or new ground-contact exception.
  one('flush-stone-paving',stone,13.6,.08,7.2,0,-.04,0);
  for(const s of[-1,1]){
   one('plain-end-wall-'+s,red,.24,4.3,6.4,s*6.48,2.15,0);
   one('side-bay-inner-partition-'+s,red,.18,4.3,6.4,s*2.2,2.15,0);
   for(const z of[-3.08,3.08])one('unverified-plain-side-bay-infill-'+s+'-'+z,red,4.28,4.3,.24,s*4.4,2.15,z);
  }
  for(const x of[-6.6,-2.2,2.2,6.6])for(const z of[-3.2,3.2]){const a=[];mesh(new T.CylinderGeometry(.16,.19,4.3,10).translate(x,2.15,z),red,'three-bay-column',a);own(a,'column-'+x+'-'+z);}
  for(const z of[-3.2,3.2])one('plain-head-beam-'+z,wood,13.4,.24,.28,0,4.15,z);
  // Exposed end timber and a true1m lateral roof overhang distinguish the
  // sourced suspended-gable from the main hall's hard-gable. This is NOT a
  // guessed five-flower joinery/carving or historical painted-art inventory.
  for(const x of[-6.6,6.6]){const a=[];beam(a,'exposed-end-tie',[x,4.36,-3.2],[x,4.36,3.2],.16);for(const z of[-2,0,2])beam(a,'exposed-end-post',[x,4.36,z],[x,curve(z)-.20,z],.14);for(let i=0;i<16;i++){const za=-half+2*half*i/16,zb=-half+2*half*(i+1)/16;beam(a,'exposed-end-rafter',[x,curve(za)-.14,za],[x,curve(zb)-.14,zb],.12);}own(a,'exposed-end-frame-'+x);}
  const points=Array.from({length:25},(_,i)=>{const z=-half+2*half*i/24;return[z,curve(z)];}),a=[];
  mesh(prism([...points,...points.toReversed().map(([z,y])=>[z,y-.16])],-7.6,7.6),yellow,'suspended-roof-sheet',a);
  for(let i=0;i<=50;i++){const x=-7.54+15.08*i/50,path=new T.CatmullRomCurve3(points.map(([z,y])=>new T.Vector3(x,y+.023,z)));mesh(new T.TubeGeometry(path,24,.041,5,false),yellow,'yellow-tile-roll',a);for(const t of[0,1]){const pos=path.getPoint(t),normal=path.getTangent(t).multiplyScalar(t===0?-1:1),g=new T.CircleGeometry(.041,5);g.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),normal)));g.translate(...pos.toArray());mesh(g,yellow,'tile-end',a);}}
  box(a,'plain-ridge',yellow,15.3,.22,.26,0,6.80,0);own(a,'yellow-suspended-gable');
 }catch(e){for(const g of geos)g.dispose();for(const m of materials)m.dispose();throw e;}
 const meta={id:ID,objectId:OBJECT,name:'景行门',...p,bays:3,roof:'xuanshan',front:'south',dimensions:'OFFICIAL_PROSE_TOPOLOGY_ENGINEERING_FIT_NOT_SURVEYED',presentUseEvidence:'OFFICIAL_ALE_ARTICLE_RECORDS_CONVERSION_TO_OFFICE_NOT_A_2026_SITE_SURVEY',openState:'HISTORICAL_CENTRAL_THROUGHWAY_GAME_ADAPTATION_NOT_CURRENT_PUBLIC_ADMISSION',modernFacadeVerified:false,wholeCourtyardAccepted:false,inventedWindowCount:0,modeledDoorLeaves:0,interiorFurnishings:0,sourceUrls:[...JINGXING_SOURCES],sourceImageLimit:'NO_CONFIRMED_CURRENT_COMPLETE_OWN_FACADE_PHOTO',plainSideBayStatus:'UNVERIFIED_PLAIN_CLOSURE_NOT_RECONSTRUCTED_OFFICE_FENESTRATION',unknown:['measured dimensions and exact placement','current office windows and door-leaf count','rear facade and threshold configuration','specific painted artwork and ridge ornaments','current public access','GPU/mobile visual acceptance'],triangleOwners:owners.length};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...owners);kit.owned.push(...materials);kit.mapItems.push({kind:'gate',name:'景行门（官刊：办公室；通路：游戏适配）',x:p.x,z:p.z,w:p.width,d:p.depth,rot:0,objectId:OBJECT,sourceStatus:meta.dimensions});return{frame,meta};
}
