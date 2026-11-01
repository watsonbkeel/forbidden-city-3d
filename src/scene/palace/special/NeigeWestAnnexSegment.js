import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='neige-west-annex-visible-segment',FIT='PHOTO_TOPOLOGY_ENGINEERING_FIT_NOT_SURVEYED';
export const NEIGE_WEST_ANNEX_FIT=Object.freeze({x:-144.85,z:-365.2,width:4.5,depth:6.4,roofWidth:5.1,roofDepth:7.8,eave:4.35,ridge:5.95,front:'south',fragment:true});
export const NEIGE_WEST_ANNEX_SOURCES=Object.freeze(['https://www.dpm.org.cn/explore/building/236523.html','https://img.dpm.org.cn/Uploads/Picture/dc/8036.jpg']);
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Only the cropped lower gray-tiled/red-lattice segment at the left of8036.
 * West is inferred from the documented south-facing hall. The page describes
 * a four-bay west ear room historically used as Jichafang; neither full extent
 * nor present identity is proven by this cropped photo. Do not bind its object
 * ID or mirror another wing. Size, placement, repeat spacing and plain hidden
 * ends are reversible fits. Closed panels assert no current visitor admission. */
export function buildNeigeWestAnnexSegment(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,keys=['colliders','walkables','rooms','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||!['neige-main-court','neige-storehouse-candidate-a','neige-south-connecting-gate'].every(id=>kit.root.children.some(o=>o.userData.structure?.id===id))||kit.root.children.some(o=>o.userData.structure?.id===ID)||keys.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children)||typeof kit.lib?.material!=='function')throw Error('Neige west segment requires original outer-east after main/store/south gate, once, untransformed');
 const p=NEIGE_WEST_ANNEX_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
 const owned=[],geometries=[],colliders=[],brick=kit.lib.material('wall_brick'),stone=kit.lib.material('stone_slab');
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.92});owned.push(m);return m;};
 const red=material('neige-ear-red-wood',0x8e3327),dark=material('neige-ear-dark-closed-lattice-backing',0x392d23),gray=material('neige-ear-gray-tile',0x696c68);
 const add=(a,geo,mat,role)=>{if(mat===brick||mat===stone)geo=applyBoxUV(geo,kit.lib.tileSize(mat===brick?'wall_brick':'stone_slab'));geometries.push(geo);const m=new T.Mesh(geo,mat);m.name=ID+'-'+role;m.userData.neigeAnnexRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);a.push(m);return m;};
 const box=(a,role,mat,w,h,d,x,y,z)=>add(a,new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role);
 const own=(a,key)=>{frame.updateMatrixWorld(true);const v=[];for(const m of a){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const q=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);v.push(Math.fround(q.x),Math.fround(q.y),Math.fround(q.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+key),c=shape.box.clone();c.triangleSupport=shape;c.neigeWestAnnex={id:key,parentObjectId:'FC-E09ED30C27'};colliders.push(c);for(const m of a)m.userData.neigeAnnexOwner=shape.id;}finally{g.dispose();}};
 const prism=(section,x0,x1)=>{const sh=new T.Shape();section.forEach(([z,y],i)=>sh[i?'lineTo':'moveTo'](z,y));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 try{
  const base=[];box(base,'low-stone-base',stone,4.5,.22,6.4,0,.11,0);own(base,'visible-plinth');
  // Plain closed hidden walls bound only this short visible fragment, not a
  // reconstructed four-bay plan. No invisible full-volume interior collider.
  for(const s of[-1,1]){const a=[];box(a,'plain-unphotographed-end',brick,.24,4.02,6.4,s*2.13,2.23,0);own(a,'plain-end-'+s);}
  const back=[];box(back,'plain-unphotographed-back',brick,4.02,4.02,.24,0,2.23,3.08);own(back,'plain-back');
  const front=[];box(front,'front-red-upper-band',red,4.02,.38,.24,0,4.05,-3.08);
  for(const x of[-2.12,0,2.12])box(front,'front-red-post',red,.18,3.72,.28,x,2.08,-3.10);
  // Two repeated display panels are a spacing fit of the cropped red facade,
  // not evidence for two/four bays or a particular door-leaf census.
  for(const s of[-1,1]){const x=s*1.06,w=1.94;box(front,'closed-red-lower-panel',red,w,1.12,.12,x,.78,-3.13);box(front,'closed-red-lattice',dark,w,2.35,.07,x,2.545,-3.105);
   for(const y of[1.40,3.69])box(front,'lattice-red-rail',red,w,.09,.12,x,y,-3.17);
   for(let i=0;i<=6;i++)box(front,'lattice-red-stile',red,.035,2.24,.11,x-w/2+i*w/6,2.545,-3.175);
   for(const y of[1.91,2.54,3.17])box(front,'lattice-red-crossbar',red,w,.035,.11,x,y,-3.175);
  }own(front,'closed-visible-red-front');
  const half=3.9,n=16,curve=z=>p.eave+(p.ridge-p.eave)*(.55*(1-Math.abs(z)/half)+.45*(1-Math.abs(z)/half)**2),points=Array.from({length:n+1},(_,i)=>{const z=-half+2*half*i/n;return[z,curve(z)]});
  for(const s of[-1,1]){const a=[],section=[[-3.2,4.24],[3.2,4.24],...Array.from({length:n+1},(_,i)=>{const z=3.2-6.4*i/n;return[z,curve(z)-.145]})];add(a,prism(section,s<0?-2.25:2.01,s<0?-2.01:2.25),brick,'plain-gray-gable');own(a,'gable-'+s);}
  const roof=[];add(roof,prism([...points,...points.toReversed().map(([z,y])=>[z,y-.14])],-2.55,2.55),gray,'gray-roof-shell');
  // Closed low strips establish the clearly visible tiling; no guessed beasts,
  // carved ridge or photographic tile inventory. Every strip has true caps.
  const strip=[...points.map(([z,y])=>[z,y+.055]),...points.toReversed().map(([z,y])=>[z,y+.008])];
  for(let i=0;i<=20;i++){const x=-2.48+4.96*i/20;add(roof,prism(strip,x-.035,x+.035),gray,'plain-gray-tile-roll');}
  box(roof,'plain-gray-ridge',gray,5.1,.15,.18,0,6.02,0);own(roof,'closed-visible-gray-roof');
 }catch(error){geometries.forEach(g=>g.dispose());owned.forEach(m=>m.dispose());throw error;}
 const meta={id:ID,parentObjectId:'FC-E09ED30C27',historicalIdentityCandidate:'FC-93081154E4',name:'内阁西侧灰瓦耳房可见段（身份候选）',...p,dimensions:FIT,scope:'CROPPED_WEST_GRAY_ROOF_RED_LATTICE_FRAGMENT_ONLY',sourceUrls:[...NEIGE_WEST_ANNEX_SOURCES],sourcePhotographDate:null,representedEarRoomSegments:1,wholeObjectAccepted:false,interiorFurnishings:0,openingState:'VISIBLE_CLOSED_FACADE_FIT_NOT_PUBLIC_ADMISSION',triangleOwners:colliders.length,unknown:['full four-bay extent and exact current office identity','photograph date and post2023repair state','measured coordinates, depth and height','exact lattice motif, panel count and door status','unphotographed end/rear elevations and interior','GPU/mobile visual acceptance']};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...owned);kit.mapItems.push({kind:'hall',name:meta.name,x:p.x,z:p.z,w:p.width,d:p.depth,parentObjectId:meta.parentObjectId,sourceStatus:FIT});return{frame,meta,colliders};
}
