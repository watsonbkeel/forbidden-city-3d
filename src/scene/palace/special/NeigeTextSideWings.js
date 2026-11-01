import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='neige-text-side-wings',FIT='ENGINEERING_FIT_NOT_SURVEYED';
export const NEIGE_TEXT_WINGS_SOURCE='https://www.dpm.org.cn/explore/building/236523.html';
export const NEIGE_TEXT_WINGS_FIT=Object.freeze({z:-375.3,width:11.1,depth:5,roofWidth:11.1,roofDepth:5.8,eave:4.8,ridge:6.65,middleClearWidth:3.08,middleClearHeight:3.12,eastX:-177.5,westX:-144.5});
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** TEXT, not photo reconstruction. Official text identifies three-bay yellow
 * hard-gable east/west wings facing each other. Present individual elevations,
 * spacing, exact historical-office correspondence and openings remain unverified.
 * The two visibly open middle passages and ground-flush floors are explicit
 * interaction fits to preserve existing routes, NOT evidence of public access.
 * No furnishings, lost Manbentang, invented carving or accepted office IDs. */
export function buildNeigeTextSideWings(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,keys=['colliders','walkables','rooms','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||!['neige-main-court','neige-storehouse-candidate-a','neige-south-connecting-gate','neige-west-annex-visible-segment'].every(id=>kit.root.children.some(o=>o.userData.structure?.id===id))||kit.root.children.some(o=>o.userData.structure?.id===ID)||keys.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children)||typeof kit.lib?.material!=='function')throw Error('Neige text wings require original outer-east after four existing Neige entities, once, untransformed');
 const p=NEIGE_TEXT_WINGS_FIT,frame=new T.Group();frame.name=ID;
 const owned=[],geometries=[],colliders=[],wings=[],brick=kit.lib.material('wall_brick'),stone=kit.lib.material('stone_slab'),yellow=kit.lib.material('roof_tile');
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.9});owned.push(m);return m;};
 const red=material('neige-text-wing-plain-red',0x8c3326),wood=material('neige-text-wing-plain-dark-frame',0x60352a);
 const prism=(section,x0,x1)=>{const sh=new T.Shape();section.forEach(([z,y],i)=>sh[i?'lineTo':'moveTo'](z,y));sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 try{for(const side of['east','west']){
  const w=new T.Group();w.name=ID+'-'+side;w.position.set(side==='east'?p.eastX:p.westX,0,p.z);w.rotation.y=side==='east'?-Math.PI/2:Math.PI/2;frame.add(w);
  const add=(a,geo,mat,role)=>{const key=mat===brick?'wall_brick':mat===stone?'stone_slab':mat===yellow?'roof_tile':null;if(key)geo=applyBoxUV(geo,kit.lib.tileSize(key));geometries.push(geo);const m=new T.Mesh(geo,mat);m.name=w.name+'-'+role;m.userData.neigeWingRole=role;m.castShadow=m.receiveShadow=true;w.add(m);a.push(m);return m;};
  const box=(a,role,mat,width,h,d,x,y,z)=>add(a,new T.BoxGeometry(width,h,d).translate(x,y,z),mat,role);
  const own=(a,key)=>{frame.updateMatrixWorld(true);const v=[];for(const m of a){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const q=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);v.push(Math.fround(q.x),Math.fround(q.y),Math.fround(q.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const shape=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+side+':'+key),c=shape.box.clone();c.triangleSupport=shape;c.neigeTextWing={id:key,side,parentObjectId:'FC-E09ED30C27'};colliders.push(c);for(const m of a)m.userData.neigeWingOwner=shape.id;}finally{g.dispose();}};
  const floor=[];box(floor,'ground-flush-passage',stone,11.1,.06,5,0,-.03,0);own(floor,'ground-flush-floor');
  for(const s of[-1,1]){const a=[];box(a,'plain-brick-end',brick,.24,4.65,5,s*5.43,2.325,0);own(a,'plain-end-'+s);}
  for(const face of[-1,1]){
   // A4cm surface offset and plain contrasting post edges remove coplanar
   // flicker and make three bays legible; neither is a measured detail.
   const sidePanels=[];
   for(const s of[-1,1])box(sidePanels,face<0?'plain-closed-red-panel':'plain-unverified-rear-wall',face<0?red:brick,3.58,4.65,.20,s*3.70,2.325,face*2.44);
   own(sidePanels,face<0?'closed-front-side-bays':'closed-back-side-bays');
   const trim=[];
   // Four post positions delineate three bays; detailed spacing is a fit.
   for(const x of[-5.46,-1.85,1.85,5.46])box(trim,'plain-bay-post',wood,.18,4.65,.24,x,2.325,face*2.46);
   for(const s of[-1,1])box(trim,'middle-door-jamb',wood,.12,3.12,.24,s*1.70,1.56,face*2.40);
   box(trim,'middle-door-lintel',wood,3.52,.22,.26,0,3.23,face*2.40);
   box(trim,'plain-upper-middle-panel',red,3.52,1.31,.20,0,3.995,face*2.40);
   box(trim,'plain-front-eave-band',red,11.1,.15,.24,0,4.725,face*2.40);own(trim,'visible-frame-'+face);
   for(const s of[-1,1]){const leaf=[];box(leaf,'visible-folded-leaf',red,.10,3.00,1.15,s*1.60,1.53,face*1.78);for(const y of[.18,1.52,2.88])box(leaf,'plain-leaf-rail',wood,.12,.055,1.10,s*1.60,y,face*1.78);own(leaf,'open-middle-leaf-'+face+'-'+s);}
  }
  const n=16,half=2.9,curve=z=>p.eave+(p.ridge-p.eave)*(.5*(1-Math.abs(z)/half)+.5*(1-Math.abs(z)/half)**2),points=Array.from({length:n+1},(_,i)=>{const z=-half+2*half*i/n;return[z,curve(z)]});
  for(const s of[-1,1]){const a=[],section=[[-2.5,4.65],[2.5,4.65],...Array.from({length:n+1},(_,i)=>{const z=2.5-5*i/n;return[z,curve(z)-.16]})];add(a,prism(section,s<0?-5.55:5.31,s<0?-5.31:5.55),brick,'plain-hard-gable-face');own(a,'hard-gable-'+s);}
  const roof=[];add(roof,prism([...points,...points.toReversed().map(([z,y])=>[z,y-.15])],-5.55,5.55),yellow,'yellow-hard-gable-roof');
  // Low closed tile strips express yellow tiling, not measured tile count or
  // an unverified detailed motif. No guessed roof beasts/painted ornaments.
  const strip=[...points.map(([z,y])=>[z,y+.055]),...points.toReversed().map(([z,y])=>[z,y+.008])];
  for(let i=0;i<=38;i++){const x=-5.47+10.94*i/38;add(roof,prism(strip,x-.035,x+.035),yellow,'plain-yellow-tile-strip');}
  box(roof,'plain-yellow-ridge',yellow,11.1,.16,.19,0,6.73,0);own(roof,'true-yellow-roof');
  const wm={id:w.name,parentObjectId:'FC-E09ED30C27',historicalIdentityCandidate:side==='east'?'FC-F539E5D64D':'FC-32A68E9C3E',name:side==='east'?'内阁东三间黄瓦厢房（文字依据候选）':'内阁西三间黄瓦厢房（文字依据候选）',side,bays:3,front:side==='east'?'west':'east',roofType:'YELLOW_GLAZED_HARD_GABLE_TEXT_BASED',evidenceBasis:'OFFICIAL_TEXT_NOT_PHOTO_RECONSTRUCTION',placement:FIT,dimensions:FIT,facades:'PLAIN_SIMPLIFIED_UNVERIFIED_NOT_HISTORIC_ORNAMENT',openingState:'VISIBLE_FRONT_BACK_MIDDLE_BAY_OPEN_INTERACTIVE_FIT_NOT_PUBLIC_ADMISSION',wholeObjectAccepted:false,interiorFurnishings:0,sourceUrls:[NEIGE_TEXT_WINGS_SOURCE],x:w.position.x,z:p.z,width:p.width,depth:p.depth,rotation:w.rotation.y};w.userData.structure=wm;wings.push({frame:w,meta:wm});
 }}catch(error){geometries.forEach(g=>g.dispose());owned.forEach(m=>m.dispose());throw error;}
 const meta={id:ID,parentObjectId:'FC-E09ED30C27',name:'内阁东西三间黄瓦厢房（文字依据候选）',wingCount:2,evidenceBasis:'OFFICIAL_TEXT_NOT_PHOTO_RECONSTRUCTION',sourceUrls:[NEIGE_TEXT_WINGS_SOURCE],textSupported:['three bays each','east wing faces west and west wing faces east','yellow glazed tile hard-gable roofs'],placement:FIT,dimensions:FIT,wholeObjectAccepted:false,interiorFurnishings:0,triangleOwners:colliders.length,fit:{...p},unknown:['individual present-day elevations and exact historical office correspondence','surveyed location, span, depth and height','original openings, rear elevations and threshold levels','detailed lattice, carvings, painted decoration and room furnishings','current public access and post2023repair condition','GPU/mobile visual acceptance']};frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...owned);for(const w of wings)kit.mapItems.push({kind:'hall',name:w.meta.name,x:w.meta.x,z:w.meta.z,w:p.width,d:p.depth,rot:w.meta.rotation,parentObjectId:meta.parentObjectId,sourceStatus:meta.evidenceBasis});return{frame,meta,wings,colliders};
}
