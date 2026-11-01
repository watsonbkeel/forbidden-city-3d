import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/2020/04/20/s5e9d4d9c2b146.jpg';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-8;
const drift=()=>{throw Error('Kunning north balustrade retained source drift');};
/** Complete paired horizontal parapets only. The partly obscured descending
 * rail bodies, eight-character screens and modern visitor fences are excluded. */
export function applyKunningNorthBalustrades(kit,frame,item){
 const g=frame?.userData.kunningGate;if(!g||g.objectId!=='FC-60FCD2B8CC')return false;if(g.northBalustrades)return false;
 if(item.name!=='坤宁门'||item.x!==1.1||item.z!==422.7||item.rot!=='north'||item.w!==12||frame.parent!==kit.root||frame.position.x!==item.x||frame.position.y||frame.position.z!==item.z||frame.rotation.x||frame.rotation.y!==Math.PI||frame.rotation.z||!frame.scale.equals(new T.Vector3(1,1,1))||!frame.matrixAutoUpdate||!kit.root.matrixAutoUpdate||kit.root.parent||kit.root.position.lengthSq()||kit.root.rotation.toArray().slice(0,3).some(Boolean)||kit.root.scale.toArray().some(v=>v!==1)||g.front!=='north'||g.fitted.platformY!==1.2||g.fitted.northStairWidth!==10.4||g.inherited.platformWidth!==22.4||g.inherited.platformDepth!==8)drift();
 const paving=frame.children.filter(m=>m.userData.role==='kunning-platform-paving'),wall=frame.children.filter(m=>m.userData.role==='kunning-platform-masonry');
 for(const[m,w,h,d,y,mat]of[[paving[0],22.4,.08,8,1.16,'stone_slab'],[wall[0],22.4,1.12,8,.56,'wall_brick']]){
  const ref=applyBoxUV(new T.BoxGeometry(w,h,d),kit.lib.tileSize(mat)),geo=m?.geometry;
  const same=geo&&!geo.index&&!Object.keys(geo.morphAttributes).length&&geo.drawRange.start===0&&geo.drawRange.count===Infinity&&JSON.stringify(geo.groups)===JSON.stringify(ref.groups)&&Object.keys(geo.attributes).length===Object.keys(ref.attributes).length&&Object.entries(ref.attributes).every(([key,v])=>{const a=geo.attributes[key];return a?.itemSize===v.itemSize&&a.normalized===v.normalized&&!a.isInterleavedBufferAttribute&&a.count===v.count&&a.array.constructor===v.array.constructor&&a.array.every((x,i)=>x===v.array[i]);});ref.dispose();
  if(!m?.isMesh||!m.visible||!m.matrixAutoUpdate||m.material!==kit.lib.material(mat)||m.rotation.toArray().slice(0,3).some(Boolean)||!m.scale.equals(new T.Vector3(1,1,1))||m.position.x||m.position.z||!near(m.position.y,y)||!same)drift();
 }
 if(paving.length!==1||wall.length!==1)drift();
 const supports=kit.walkables.filter(w=>w.supportId==='kunning-platform');if(supports.length!==1||supports[0].type!=='box'||supports[0].rescue!==false||supports[0].box.min.toArray().some((v,i)=>!near(v,[-10.1,1.2,418.7][i]))||supports[0].box.max.toArray().some((v,i)=>!near(v,[12.3,1.2,426.7][i])))drift();
 const materials=[],geometry=[],colliders=[],stage=new T.Group();stage.name='kunning-north-horizontal-balustrades';
 const priorColliders=[...kit.colliders],priorOwned=[...kit.owned];
 const dispose=()=>{for(const v of new Set(geometry))v.dispose();for(const m of materials)m.dispose();};
 try{
  const green=new T.MeshStandardMaterial({name:'kunning_glazed_green',color:0x386b4a,roughness:.34,metalness:0});materials.push(green);const yellow=new T.MeshStandardMaterial({name:'kunning_glazed_yellow',color:0xb58c35,roughness:.34,metalness:0});materials.push(yellow);
  const pale=kit.lib.material('marble');frame.updateWorldMatrix(true,false);
  const box=(role,mat,w,h,d,x,y,z)=>{const raw=new T.BoxGeometry(w,h,d),geo=mat===pale?applyBoxUV(raw,kit.lib.tileSize('marble')):raw;geometry.push(geo);const mesh=kit.mesh(stage,geo,mat,x,y,z);mesh.name='kunning-north-'+role;mesh.userData.kunningNorthBalustrade=role;mesh.updateMatrix();const matrix=frame.matrixWorld.clone().multiply(mesh.matrix),p=geo.attributes.position,points=[];for(let k=0;k<p.count;k++){const v=new T.Vector3().fromBufferAttribute(p,k).applyMatrix4(matrix);points.push(new T.Vector3(Math.fround(v.x),Math.fround(v.y),Math.fround(v.z)));}colliders.push(new T.Box3().setFromPoints(points));return mesh;};
  for(const side of[-1,1]){
   const x=side*8.2,width=6;
   // Pale facing projects 4 cm; the lower foot projects 8 cm north.
   box('pale-foot',pale,width,.16,.16,x,.08,-4);
   box('pale-base',pale,width,.96,.08,x,.64,-4);
   box('pale-base-cap',pale,width,.23,.46,x,1.235,-3.87);
   // Broad visible color fields, not a claim of exact brick count or carving.
   for(let row=0;row<3;row++)for(let col=0;col<8;col++)box('glazed-field',(row+col)%2?green:yellow,width/8,.21666666666666667,.24,side*(5.2+(col+.5)*width/8),1.35+(row+.5)*.21666666666666667,-3.87);
   // Closed stepped cap approximates the source's rounded yellow coping.
   for(const[h,d,y]of[[.08,.4,2.04],[.08,.28,2.12],[.09,.16,2.205]])box('glazed-coping',yellow,width,h,d,x,y,-3.87);
  }
  frame.add(stage);kit.owned.push(...materials);kit.colliders.push(...colliders);
  const metadata={source:SOURCE,photographyDate:null,scope:'NORTH_HORIZONTAL_PAIR_AND_PALE_BASES_ONLY',dimensionStatus:'RETAINED_PLATFORM_AND_REVERSIBLE_PHOTO_FIT_NOT_SURVEY',patternStatus:'SIMPLIFIED_VISIBLE_COLOR_FIELDS_NOT_EXACT_BLOCK_INVENTORY',descendingRailBody:'UNVERIFIED_UNMODELED_NOT_PROVEN_OPEN',descendingCoping:'DEFERRED_WITH_OBSCURED_BODY_NOT_REPLACED_BY_WHITE_SLAB',modernVisitorFences:false,wholeGateAccepted:false,addedColliders:colliders.length};
  g.northBalustrades=metadata;frame.userData.structure={...frame.userData.structure,northBalustrades:metadata};
 }catch(error){T.Object3D.prototype.remove.call(frame,stage);Array.prototype.splice.call(kit.colliders,0,kit.colliders.length,...priorColliders);Array.prototype.splice.call(kit.owned,0,kit.owned.length,...priorOwned);delete g.northBalustrades;dispose();throw error;}
 return true;
}
