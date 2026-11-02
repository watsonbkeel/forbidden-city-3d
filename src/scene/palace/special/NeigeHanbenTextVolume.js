import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='neige-hanben-text-volume',FIT='ENGINEERING_FIT_NOT_SURVEYED';
export const NEIGE_HANBEN_FIT=Object.freeze({x:-176,z:-387.2,width:9.6,depth:3.8,roofDepth:4.6,eave:4.15,ridge:5.95,bays:3,front:'south',doorClearWidth:2.6,doorClearHeight:3.1});
export const NEIGE_HANBEN_SOURCES=Object.freeze(['https://www.dpm.org.cn/explore/building/236523.html','https://www.dpm.org.cn/Uploads/pdf/6179/T00018_00.pdf','https://www.dpm.org.cn/Uploads/File/pdf/dc/90/c9/dc90c935d785bbdf396ad66173ebf391.pdf']);
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Historical text supports three south-facing bays south of the eastern
 * Han-ticket wing, NOT individual present survival or a current facade.
 * All roof/form/material/opening/size details here are plain reversible fits.
 * The visible open middle bay is interactive, not a claim of public admission.
 * Depth is a shallow engineering fit retaining the pre-existing5.7m rotor
 * landing clearance; neither that depth nor the site spacing is surveyed.
 * Never bind lost Manbentang, invent furnishings, or copy an adjacent facade. */
export function buildNeigeHanbenTextVolume(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,keys=['colliders','walkables','rooms','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||!['neige-main-court','neige-storehouse-candidate-a','neige-south-connecting-gate','neige-west-annex-visible-segment','neige-text-side-wings','neige-east-text-annex','neige-storehouse-candidate-b'].every(id=>kit.root.children.some(o=>o.userData.structure?.id===id))||kit.root.children.some(o=>o.userData.structure?.id===ID)||keys.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children)||typeof kit.lib?.material!=='function')throw Error('Hanben text volume requires original outer-east after seven Neige groups, once, untransformed');
 const p=NEIGE_HANBEN_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
 const owned=[],geos=[],colliders=[],brick=kit.lib.material('wall_brick'),stone=kit.lib.material('stone_slab');
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.92});owned.push(m);return m;};
 const red=material('hanben-plain-red-facade-fit',0x8e4438),wood=material('hanben-plain-timber-fit',0x634336),roofMat=material('hanben-unverified-muted-roof-fit',0x75756b);
 const mesh=(a,g,mat,role)=>{if(mat===brick||mat===stone)g=applyBoxUV(g,kit.lib.tileSize(mat===brick?'wall_brick':'stone_slab'));geos.push(g);const m=new T.Mesh(g,mat);m.name=ID+'-'+role;m.userData.hanbenRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);a.push(m);return m;};
 const box=(a,role,mat,w,h,d,x,y,z)=>mesh(a,new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role);
 const own=(a,key)=>{frame.updateMatrixWorld(true);const v=[];for(const m of a){const q=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??q.count);i++){const w=new T.Vector3().fromBufferAttribute(q,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);v.push(Math.fround(w.x),Math.fround(w.y),Math.fround(w.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const s=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+key),c=s.box.clone();c.triangleSupport=s;c.hanbenText={id:key,parentObjectId:'FC-E09ED30C27'};colliders.push(c);for(const m of a)m.userData.hanbenOwner=s.id;}finally{g.dispose();}};
 // Each touching closed frame/panel/leaf is an independent solid owner.
 const solid=(key,role,mat,w,h,d,x,y,z)=>{const a=[];box(a,role,mat,w,h,d,x,y,z);own(a,key);};
 const prism=(section,x0,x1)=>{const s=new T.Shape();section.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 try{
  solid('floor','visible-ground-flush-floor',stone,9.6,.06,3.8,0,-.03,0);
  solid('back','plain-unverified-brick-back',brick,9.6,4.15,.20,0,2.075,1.8);
  for(const s of[-1,1])solid('end-'+s,'plain-unverified-brick-end',brick,.20,4.15,3.8,s*4.7,2.075,0);
  for(const s of[-1,1])solid('front-panel-'+s,'plain-closed-side-panel',red,3.04,4.15,.18,s*3.2,2.075,-1.8);
  for(const x of[-4.7,-1.6,1.6,4.7])solid('front-post-'+x,'plain-three-bay-front-post',wood,.16,4.15,.24,x,2.075,-1.84);
  for(const s of[-1,1])solid('jamb-'+s,'plain-door-jamb-fit',wood,.22,3.28,.26,s*1.41,1.64,-1.8);
  solid('lintel','plain-door-lintel-fit',wood,2.6,.18,.26,0,3.19,-1.8);
  solid('upper','plain-middle-upper-panel-fit',red,3.04,.87,.18,0,3.715,-1.8);
  for(const s of[-1,1])solid('open-leaf-'+s,'visible-open-leaf',red,.08,3.04,1.15,s*1.48,1.52,-1.14);
  const n=12,half=2.3,curve=z=>p.eave+(p.ridge-p.eave)*(.45*(1-Math.abs(z)/half)+.55*(1-Math.abs(z)/half)**2),pts=Array.from({length:n+1},(_,i)=>{const z=-half+2*half*i/n;return[z,curve(z)]});
  for(const s of[-1,1]){const a=[],section=[[-1.9,4.02],[1.9,4.02],...Array.from({length:n+1},(_,i)=>{const z=1.9-3.8*i/n;return[z,curve(z)-.12]})];mesh(a,prism(section,s<0?-4.8:4.6,s<0?-4.6:4.8),brick,'plain-gable-roof-fill-fit');own(a,'gable-'+s);}
  const roof=[];mesh(roof,prism([...pts,...pts.toReversed().map(([z,y])=>[z,y-.14])],-4.8,4.8),roofMat,'plain-pitched-roof');
  const strip=[...pts.map(([z,y])=>[z,y+.04]),...pts.toReversed().map(([z,y])=>[z,y+.006])];
  for(let i=0;i<=24;i++){const x=-4.74+9.48*i/24;mesh(roof,prism(strip,x-.035,x+.035),roofMat,'plain-roof-roll-fit');}
  box(roof,'plain-ridge-fit',roofMat,9.6,.13,.16,0,p.ridge+.06,0);own(roof,'true-closed-roof');
 }catch(e){geos.forEach(g=>g.dispose());owned.forEach(m=>m.dispose());throw e;}
 const meta={id:ID,parentObjectId:'FC-E09ED30C27',historicalIdentityCandidate:'FC-2C486A3479',name:'内阁汉本堂（三间文字暂定体量，现存待核）',...p,evidenceBasis:'OFFICIAL_HISTORICAL_TEXT_NOT_CURRENT_PHOTO',currentSurvival:'UNVERIFIED_NOT_CURRENT_RECONSTRUCTION',textSupported:['three bays','south-facing south of eastern Han-ticket wing'],placement:FIT,dimensions:FIT,roofDesign:'PLAIN_MUTED_PITCHED_ROOF_ENGINEERING_FIT_NOT_VERIFIED_FORM_OR_COLOR',facades:'PLAIN_SIMPLIFIED_ENGINEERING_FIT_NOT_VERIFIED_OPENINGS_OR_ORNAMENT',openState:'VISIBLE_OPEN_MIDDLE_BAY_INTERACTION_FIT_NOT_PUBLIC_ADMISSION',wholeObjectAccepted:false,interiorFurnishings:0,sourceUrls:[...NEIGE_HANBEN_SOURCES],triangleOwners:colliders.length,unknown:['individual current survival and exact historic/current physical correspondence','surveyed dimensions and distance from eastern wing/city wall','actual roof form, material, color and full elevations','original openings, threshold, internal partition and furnishings','current access and post2023repair status','GPU/mobile appearance']};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...owned);kit.mapItems.push({kind:'hall',name:meta.name,x:p.x,z:p.z,w:p.width,d:p.depth,rot:0,parentObjectId:meta.parentObjectId,sourceStatus:meta.evidenceBasis});return{frame,meta,colliders};
}
