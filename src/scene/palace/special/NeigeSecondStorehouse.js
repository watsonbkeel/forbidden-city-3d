import * as T from 'three';
import {applyBoxUV} from '../../../utils/GeometryUV.js';
import {createTriangleTemplate,triangleInstance} from '../../../utils/TriangleSupport.js';
const ID='neige-storehouse-candidate-b',FIT='ENGINEERING_FIT_NOT_SURVEYED';
export const NEIGE_SECOND_STORE_FIT=Object.freeze({x:-273,z:-365,width:42,depth:12,eave:5.4,ridge:8.7,bays:10,front:'north',doorClearWidth:2.7,doorClearHeight:3.1});
export const NEIGE_SECOND_STORE_SOURCES=Object.freeze(['https://www.dpm.org.cn/explore/building/236579.html','https://www.dpm.org.cn/Uploads/pdf/6179/T00018_00.pdf','https://www.dpm.org.cn/Uploads/pdf/6179/T00025_00.pdf','https://www.dpm.org.cn/Uploads/File/pdf/dc/90/c9/dc90c935d785bbdf396ad66173ebf391.pdf']);
const identity=o=>o?.isObject3D&&o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.equals(new T.Vector3(1,1,1));
/** Second text-based exterior, NOT an identified red-book/records library.
 * Official2008 text describes two surviving masonry stores and north iron
 * windows. Its historical citations give ten bays/two doors each. Exact modern
 * elevations, window census, roof design and internal upper floors are NOT
 * verified. The eight window fields and one visible open door are plain fits,
 * not copies of an unidentified photograph or permission for current access. */
export function buildNeigeSecondStorehouse(kit,zone){
 if(zone?.id!=='outer-east')return false;
 const b=zone.bounds,keys=['colliders','walkables','rooms','owned','mapItems'];
 if(!b||b.x0!==-382||b.x1!==-131.95||b.z0!==-400||b.z1!==111.5||kit?.root?.name!=='outer-east'||!identity(kit.root)||!['neige-main-court','neige-storehouse-candidate-a','neige-south-connecting-gate','neige-west-annex-visible-segment','neige-text-side-wings','neige-east-text-annex'].every(id=>kit.root.children.some(o=>o.userData.structure?.id===id))||kit.root.children.some(o=>o.userData.structure?.id===ID)||keys.some(k=>!Array.isArray(kit[k])||Object.isFrozen(kit[k])||!Object.isExtensible(kit[k]))||Object.isFrozen(kit.root.children)||!Object.isExtensible(kit.root.children)||typeof kit.lib?.material!=='function')throw Error('Second Neige store requires original outer-east after six Neige groups, once, untransformed');
 const p=NEIGE_SECOND_STORE_FIT,frame=new T.Group();frame.name=ID;frame.position.set(p.x,0,p.z);
 const owned=[],geometries=[],colliders=[],brick=kit.lib.material('wall_brick'),stone=kit.lib.material('stone_slab');
 const material=(name,color)=>{const m=new T.MeshStandardMaterial({name,color,roughness:.92});owned.push(m);return m;};
 const iron=material('neige-second-store-iron-fit',0x3a3c36),roofMat=material('neige-second-store-muted-roof-fit',0x9b8b64);
 const mesh=(a,g,mat,role)=>{if(mat===brick||mat===stone)g=applyBoxUV(g,kit.lib.tileSize(mat===brick?'wall_brick':'stone_slab'));geometries.push(g);const m=new T.Mesh(g,mat);m.name=ID+'-'+role;m.userData.secondStoreRole=role;m.castShadow=m.receiveShadow=true;frame.add(m);a.push(m);return m;};
 const box=(a,role,mat,w,h,d,x,y,z)=>mesh(a,new T.BoxGeometry(w,h,d).translate(x,y,z),mat,role);
 const own=(a,key)=>{frame.updateMatrixWorld(true);const v=[];for(const m of a){const pos=m.geometry.attributes.position,ix=m.geometry.index;for(let i=0;i<(ix?.count??pos.count);i++){const q=new T.Vector3().fromBufferAttribute(pos,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);v.push(Math.fround(q.x),Math.fround(q.y),Math.fround(q.z));}}const g=new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(v,3));try{const s=triangleInstance(createTriangleTemplate(g),[0,0,0],ID+':'+key),c=s.box.clone();c.triangleSupport=s;c.neigeSecondStore={id:key,parentObjectId:'FC-40EB11CF20'};colliders.push(c);for(const m of a)m.userData.secondStoreOwner=s.id;}finally{g.dispose();}};
 // Each touching wall/frame/door box is one closed owner: do not combine
 // coplanar contact faces into an odd-parity false solid across an aperture.
 const solid=(key,role,mat,w,h,d,x,y,z)=>{const a=[];box(a,role,mat,w,h,d,x,y,z);own(a,key);};
 const prism=(section,x0,x1)=>{const s=new T.Shape();section.forEach(([z,y],i)=>s[i?'lineTo':'moveTo'](z,y));s.closePath();const g=new T.ExtrudeGeometry(s,{depth:x1-x0,bevelEnabled:false,steps:1});g.rotateY(Math.PI/2);g.translate(x0,0,0);return g;};
 try{
  solid('floor','visible-ground-flush-floor',stone,42.4,.06,12.4,0,-.03,0);
  solid('south-wall','plain-masonry-back',brick,42.4,5.4,.4,0,2.7,-5.8);
  for(const s of[-1,1])solid('end-wall-'+s,'plain-masonry-end',brick,.4,5.4,12,s*21,2.7,0);
  for(let i=0;i<10;i++){const cx=-18.9+i*4.2,key='bay-'+i;
   if(i===2||i===7){
    for(const s of[-1,1]){solid(key+'-wall-'+s,'plain-door-pier',brick,.6,3.3,.44,cx+s*1.8,1.65,5.78);solid(key+'-jamb-'+s,'plain-stone-door-jamb',stone,.15,3.3,.64,cx+s*1.425,1.65,5.88);}
    solid(key+'-top','plain-masonry-head',brick,4.2,2.1,.44,cx,4.35,5.78);solid(key+'-lintel','plain-stone-door-lintel',stone,2.7,.2,.64,cx,3.2,5.88);
    for(const s of[-1,1]){if(i===7)solid(key+'-open-leaf-'+s,'visible-open-iron-door',iron,.09,3.06,1.25,cx+s*1.565,1.53,5.20);else solid(key+'-closed-leaf-'+s,'visible-closed-iron-door',iron,1.344,3.08,.10,cx+s*.675,1.54,6.05);}
   }else{
    solid(key+'-base','plain-window-masonry-base',brick,4.2,2.3,.44,cx,1.15,5.78);solid(key+'-top','plain-window-masonry-head',brick,4.2,1,.44,cx,4.9,5.78);
    for(const s of[-1,1]){solid(key+'-pier-'+s,'plain-window-masonry-pier',brick,1,2.1,.44,cx+s*1.6,3.35,5.78);solid(key+'-stone-side-'+s,'window-stone-frame',stone,.16,2.42,.3,cx+s*1.18,3.35,6.03);}
    for(const y of[2.22,4.48])solid(key+'-stone-rail-'+y,'window-stone-frame',stone,2.2,.16,.3,cx,y,6.03);
    const bars=[];for(let k=-3;k<=3;k++)box(bars,'iron-window-bars',iron,.065,2.1,.065,cx+k*.28,3.35,6.01);own(bars,key+'-iron-bars');
    // Eight fields and hinged-out positions are a text-guided layout fit,
    // not the five-window order of the already represented photo facade.
    for(const s of[-1,1])solid(key+'-iron-shutter-'+s,'plain-folded-iron-window-shutter',iron,.075,2.1,1.02,cx+s*1.17,3.35,6.58);
   }
  }
  const n=16,half=6.65,curve=z=>p.eave+(p.ridge-p.eave)*(.45*(1-Math.abs(z)/half)+.55*(1-Math.abs(z)/half)**2),points=Array.from({length:n+1},(_,i)=>{const z=-half+2*half*i/n;return[z,curve(z)]});
  for(const s of[-1,1]){const a=[],section=[[-6,5.2],[6,5.2],...Array.from({length:n+1},(_,i)=>{const z=6-12*i/n;return[z,curve(z)-.10]})];mesh(a,prism(section,s<0?-21.2:20.8,s<0?-20.8:21.2),brick,'plain-masonry-gable-fit');own(a,'gable-'+s);}
  const roof=[];mesh(roof,prism([...points,...points.toReversed().map(([z,y])=>[z,y-.18])],-21.2,21.2),roofMat,'plain-pitched-roof');
  const strip=[...points.map(([z,y])=>[z,y+.045]),...points.toReversed().map(([z,y])=>[z,y+.008])];
  for(let i=0;i<=54;i++){const x=-21.14+42.28*i/54;mesh(roof,prism(strip,x-.035,x+.035),roofMat,'plain-roof-roll-fit');}
  box(roof,'plain-roof-ridge-fit',roofMat,42.4,.15,.18,0,p.ridge+.07,0);own(roof,'real-closed-roof');
 }catch(e){geometries.forEach(g=>g.dispose());owned.forEach(m=>m.dispose());throw e;}
 const meta={id:ID,parentObjectId:'FC-40EB11CF20',name:'内阁大库第二体（文字拟合、库别待核）',...p,identityUnresolved:true,representedStorehouses:1,doorCount:2,windowCountFit:8,evidenceBasis:'OFFICIAL_TEXT_NOT_SECOND_STORE_PHOTO',textSupported:['two masonry stores still extant in2008 account','historical ten bays and two doors per store','north-facing stone-framed iron-bar/iron-shutter windows'],placement:FIT,dimensions:FIT,roofDesign:'PLAIN_PITCHED_MUTED_TONE_ENGINEERING_FIT_NOT_CURRENT_ROOF_SURVEY',openingLayout:'EIGHT_WINDOWS_TWO_DOOR_POSITIONS_ENGINEERING_FIT_NOT_PHOTO_ORDER',openState:'ONE_VISIBLE_OPEN_DOOR_INTERACTIVE_FIT_NOT_PUBLIC_ADMISSION',wholeObjectAccepted:false,interiorFurnishings:0,modelledUpperFloors:0,sourceUrls:[...NEIGE_SECOND_STORE_SOURCES],triangleOwners:colliders.length,unknown:['which photo and present building correspond to red-book or records store','measured position/span/depth/height','actual current window count, door positions, roof type and color','modern upper-floor layout, partitions and contents','post2023repair condition and present access','GPU/mobile visual acceptance']};
 frame.userData.structure=meta;kit.root.add(frame);kit.colliders.push(...colliders);kit.owned.push(...owned);kit.mapItems.push({kind:'hall',name:meta.name,x:p.x,z:p.z,w:p.width,d:p.depth,rot:Math.PI,parentObjectId:meta.parentObjectId,sourceStatus:meta.evidenceBasis});return{frame,meta,colliders};
}
