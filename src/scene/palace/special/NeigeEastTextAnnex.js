import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='neige-east-text-annex',FIT='ENGINEERING_FIT_NOT_SURVEYED';
export const NEIGE_EAST_TEXT_ANNEX_SOURCE='https://www.dpm.org.cn/explore/building/236523.html';
export const NEIGE_EAST_TEXT_ANNEX_FIT=Object.freeze({x:-182.4,z:-363,width:14.8,depth:6.4,roofDepth:7.6,eave:4.35,ridge:5.95,bays:4,doorX:-1.85,doorClearWidth:2.8,doorClearHeight:3.12});
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Official text supports an eastern four-bay gray hard-gable ear room.
 * It does NOT verify this facade, current office identity, south-facing opening,
 * dimensions, position, present survival of an individually identified wing,
 * or public access. The plain ground-flush open bay is an interactive fit.
 * This is not a mirrored photograph, a measured restoration or lost Manbentang.
 */
export function buildNeigeEastTextAnnex(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,keys=['colliders','walkables','rooms','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||!['neige-main-court','neige-storehouse-candidate-a','neige-south-connecting-gate','neige-west-annex-visible-segment','neige-text-side-wings'].every(id=>kit.root.children.some(o=>o.userData.structure?.id===id))||kit.root.children.some(o=>o.userData.structure?.id===ID)||keys.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children)||typeof kit.lib?.material!=='function')throw Error('Neige east text annex requires original outer-east after five Neige groups, once, untransformed');
 const p=NEIGE_EAST_TEXT_ANNEX_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
 const owned=[],geometries=[],colliders=[],brick=kit.lib.material('wall_brick'),stone=kit.lib.material('stone_slab');
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.92});owned.push(m);return m;};
 const red=material('neige-east-text-plain-red-panel',0x8e3327),wood=material('neige-east-text-plain-post',0x493126),gray=material('neige-east-text-gray-roof',0x696c68);
 const mesh=(a,g,mat,role)=>{if(mat===brick||mat===stone)g=applyBoxUV(g,kit.lib.tileSize(mat===brick?'wall_brick':'stone_slab'));geometries.push(g);const m=new T.Mesh(g,mat);m.name=ID+'-'+role;m.userData.neigeEastEarRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);a.push(m);return m;};
 const box=(a,role,mat,w,h,d,x,y,z)=>mesh(a,new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role);
 const own=(a,key)=>{frame.updateMatrixWorld(true);const v=[];for(const m of a){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const q=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);v.push(Math.fround(q.x),Math.fround(q.y),Math.fround(q.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const s=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+key),c=s.box.clone();c.triangleSupport=s;c.neigeEastTextAnnex={id:key,parentObjectId:'FC-E09ED30C27'};colliders.push(c);for(const m of a)m.userData.neigeEastEarOwner=s.id;}finally{g.dispose();}};
 const prism=(section,x0,x1)=>{const s=new T.Shape();section.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 try{
  const floor=[];box(floor,'ground-flush-visible-floor',stone,p.width,.06,p.depth,0,-.03,0);own(floor,'visible-floor');
  for(const s of[-1,1]){const a=[];box(a,'plain-brick-end',brick,.24,p.eave,p.depth,s*7.28,p.eave/2,0);own(a,'end-'+s);}
  const back=[];box(back,'plain-unverified-back',brick,14.32,p.eave,.24,0,p.eave/2,3.08);own(back,'back');
  const posts=[];for(const x of[-7.31,-3.7,0,3.7,7.31])box(posts,'front-bay-post',wood,.18,p.eave,.24,x,p.eave/2,-3.26);own(posts,'front-posts');
  for(const cx of[-5.55,-1.85,1.85,5.55]){const a=[];
   if(cx!==p.doorX){box(a,'plain-closed-front-panel',red,3.52,p.eave,.16,cx,p.eave/2,-3.24);}
   else{
    box(a,'plain-door-lintel',wood,3.52,p.eave-p.doorClearHeight,.24,cx,(p.eave+p.doorClearHeight)/2,-3.26);
    for(const s of[-1,1]){box(a,'plain-door-jamb',wood,.16,p.doorClearHeight,.24,cx+s*1.48,p.doorClearHeight/2,-3.26);box(a,'plain-door-side-panel',red,.20,p.doorClearHeight,.16,cx+s*1.66,p.doorClearHeight/2,-3.24);box(a,'visible-folded-leaf',red,.09,3.02,.76,cx+s*1.605,1.51,-2.72);}
   }
   // Keep touching door-frame/panel solids as separate closed owners. A single
   // disconnected owner can deduplicate coincident exit/entry ray hits and
   // falsely classify the visible open aperture as inside a solid. Geometry
   // remains identical; only ownership follows the seven actual closed parts.
   if(cx===p.doorX)a.forEach((m,i)=>own([m],'open-door-part-'+i));else own(a,'front-bay-'+cx);
  }
  const half=p.roofDepth/2,n=14,curve=z=>p.eave+(p.ridge-p.eave)*(.55*(1-Math.abs(z)/half)+.45*(1-Math.abs(z)/half)**2),points=Array.from({length:n+1},(_,i)=>{const z=-half+2*half*i/n;return[z,curve(z)]});
  for(const s of[-1,1]){const a=[],section=[[-3.2,p.eave],[3.2,p.eave],...Array.from({length:n+1},(_,i)=>{const z=3.2-6.4*i/n;return[z,curve(z)-.14]})];mesh(a,prism(section,s<0?-7.4:7.16,s<0?-7.16:7.4),brick,'gray-hard-gable-face');own(a,'gable-'+s);}
  const roof=[];mesh(roof,prism([...points,...points.toReversed().map(([z,y])=>[z,y-.14])],-7.4,7.4),gray,'gray-hard-gable-roof');
  const strip=[...points.map(([z,y])=>[z,y+.05]),...points.toReversed().map(([z,y])=>[z,y+.008])];
  // Repeated plain rolls show gray tiles, not a surveyed tile count or motif.
  for(let i=0;i<=48;i++){const x=-7.34+14.68*i/48;mesh(roof,prism(strip,x-.035,x+.035),gray,'plain-gray-tile-roll');}
  box(roof,'gray-roof-ridge',gray,14.8,.15,.18,0,p.ridge+.07,0);own(roof,'real-closed-roof');
 }catch(e){geometries.forEach(g=>g.dispose());owned.forEach(m=>m.dispose());throw e;}
 const meta={id:ID,parentObjectId:'FC-E09ED30C27',historicalIdentityCandidate:'FC-12AA4B4366',name:'内阁东四间灰瓦耳房（文字依据候选）',side:'east',...p,roofType:'GRAY_HARD_GABLE_TEXT_BASED',evidenceBasis:'OFFICIAL_TEXT_NOT_PHOTO_RECONSTRUCTION',textSupported:['east of main hall','four bays','gray hard-gable roof'],placement:FIT,dimensions:FIT,facadeOrientation:'SOUTH_FACING_ENGINEERING_FIT_NOT_TEXT_VERIFIED',openingState:'ONE_VISIBLE_OPEN_BAY_INTERACTIVE_FIT_NOT_PUBLIC_ADMISSION',wholeObjectAccepted:false,interiorFurnishings:0,sourceUrls:[NEIGE_EAST_TEXT_ANNEX_SOURCE],triangleOwners:colliders.length,unknown:['individual present-day survival, elevation and historical office correspondence','measured location, span, depth and height','facade orientation and original doors/windows/thresholds','fine lattice, carving, decoration and interior layout','post2023repair condition and public admission','GPU/mobile visual acceptance']};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...owned);kit.mapItems.push({kind:'hall',name:meta.name,x:p.x,z:p.z,w:p.width,d:p.depth,parentObjectId:meta.parentObjectId,sourceStatus:meta.evidenceBasis});return{frame,meta,colliders};
}
