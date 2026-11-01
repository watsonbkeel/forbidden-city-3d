import * as THREE from 'three';

const KEY='zuoyi_nine_row_front';
const near=(a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-8;

// One reviewed declaration only. The eight inherited columns, their horizontal
// positions, ornament, and every unobserved face remain unverified.
export function isZuoyiDoorTarget({zoneId,itemIndex,item}={}){
 return zoneId==='axis-courts'&&itemIndex===2&&item?.kind==='gate'&&item.name==='左翼门'&&
  item.x===-106.47&&item.z===-53.1&&item.rot==='east'&&item.style==='hall'&&
  ['w','h','t','gateKind','gateProfile','roof','brackets','layers','eaveCount','open'].every(k=>item[k]===undefined);
}

/**
 * Correct only the original passage-facing skins after the ordinary gate build.
 * The two identically rotated leaves expose opposite local faces to the passage:
 * first +Z, second -Z. The original first -Z face remains untouched.
 * No source-image files, doorway geometry, leaf pose, colliders, or neighbors
 * change. Register derivatives in TextureLibrary's existing ownership maps,
 * so both leaves share them and the library's ordinary dispose owns teardown.
 */
export function applyZuoyiDoorFront(kit,frame,binding){
 if(!isZuoyiDoorTarget(binding)||frame?.parent!==kit.root||
  !near(frame.position.x,-106.47)||!near(frame.position.y,0)||!near(frame.position.z,-53.1)||
  !near(frame.rotation.y,Math.PI/2)||!near(frame.rotation.x,0)||!near(frame.rotation.z,0)||
  frame.scale.toArray().some(x=>x!==1)||frame.userData.structure?.gateKind!=='three-bay')return false;
 const base=kit.lib.material('door_studded');
 // A failed file load or a CPU material-only fixture is not evidence of ten
 // rows. Keep those doors exactly as supplied rather than crashing or falsely
 // labelling a 64px solid fallback as a corrected nine-row image.
 const lib=kit.lib,sizes=lib.quality==='hd'?[[762,1024],[381,512]]:lib.quality==='sd'?[[381,512],[190,256]]:null;
 const actual=lib.materials instanceof Map&&lib.colors instanceof Map&&lib.normals instanceof Map&&
  lib.has?.('door_studded')===true&&sizes&&base.map===lib.colors.get('door_studded')&&
  base.normalMap===lib.normals.get('door_studded')&&
  [base.map,base.normalMap].every((t,i)=>t?.image?.width===sizes[i][0]&&t.image.height===sizes[i][1]);
 if(!actual){
  const state={objectId:'FC-BC06FBAC15',status:'NOT_CORRECTED',reason:'SOURCE_UNAVAILABLE',
   detail:'Requires successfully loaded HD/SD project albedo and matching normal map. Original material and geometry retained.'};
  frame.userData.zuoyiDoorFront=state;kit.root.userData.zuoyiDoorFront=state;return false;
 }
 const leaves=frame.children.filter(m=>m.isMesh&&m.material===base);
 if(leaves.length!==2)return false;
 const prepared=[];
 for(const [i,leaf] of leaves.entries()){
  const g=leaf.geometry,a=g.attributes,idx=g.index,p=g.parameters;
  if(!p||!near(p.width,2.25)||!near(p.height,4.4)||!near(p.depth,.25)||idx?.count!==36||
   !near(leaf.position.x,[-2.18,2.18][i])||!near(leaf.position.y,0)||!near(leaf.position.z,1.425)||
   !near(leaf.rotation.x,0)||!near(leaf.rotation.y,Math.PI/2)||!near(leaf.rotation.z,0)||
   leaf.scale.toArray().some(x=>x!==1)||leaf.children.length||!a.normal||!a.uv)return false;
  const front=[],keep=[],facing=[1,-1][i];
  for(let k=0;k<idx.count;k+=3){const ids=[idx.getX(k),idx.getX(k+1),idx.getX(k+2)];
   (ids.every(j=>a.normal.getZ(j)===facing)?front:keep).push(...ids);
  }
  if(front.length!==6||keep.length!==30||!front.every(j=>near(a.position.getZ(j),facing*.125)))return false;
  prepared.push({leaf,g,front,keep});
 }
 const material=frontMaterial(kit.lib,base);
 for(const {leaf,g,front,keep} of prepared){
  const skinGeometry=g.clone();skinGeometry.setIndex(front);skinGeometry.clearGroups();
  g.setIndex(keep);g.clearGroups();
  const skin=new THREE.Mesh(skinGeometry,material);skin.castShadow=leaf.castShadow;skin.receiveShadow=leaf.receiveShadow;
  skin.name='zuoyi-nine-row-front';skin.userData={role:skin.name,objectId:'FC-BC06FBAC15',status:'VERIFY_PENDING',
   scope:'Nine vertical rows only. Eight columns, hardware, color, and all other faces are inherited and unverified; y positions and aspect are not calibrated.'};
  leaf.add(skin);
 }
 const state={objectId:'FC-BC06FBAC15',status:'PARTIAL_COUNT_CORRECTED',verticalRows:9,horizontalCount:'INHERITED_UNVERIFIED',hardware:'INHERITED_VERTICALLY_RESCALED_UNCALIBRATED',visibleGraphicFit:{minY:.47,maxY:4.4,meaning:'DISPLAY_FIT_NOT_MEASUREMENT'},faces:['LOCAL_PLUS_Z','LOCAL_MINUS_Z']};
 frame.userData.zuoyiDoorFront=state;kit.root.userData.zuoyiDoorFront=state;
 return true;
}

function frontMaterial(lib,base){
 const cached=lib.materials.get(KEY);if(cached)return cached;
 const map=remap(base.map,`${KEY}_color`),normalMap=base.normalMap?remap(base.normalMap,`${KEY}_normal`):null;
 const material=base.clone();material.name=KEY;material.map=map;material.normalMap=normalMap;
 lib.colors.set(KEY,map);if(normalMap)lib.normals.set(KEY,normalMap);lib.materials.set(KEY,material);
 return material;
}

function remap(source,name){
 // Remove only row 2 (the empty-hardware band y=136..234 in the existing
 // 1024-high project asset). Keep ALL x pixels, both edge bands and complete
 // lion-ring region. Fit the remaining 926 rows above the retained slab: the
 // existing leaf starts at y=0, but its slab occludes through y=.46. A .01 gap
 // places the graphic in y=.47..4.4, without moving any geometry or UVs.
 // This is reversible canvas layout, NOT measured hardware/spacing calibration.
 // Relative to original retained pixels, y scale is (1-.47/4.4)*1024/926
 // (~.988), instead of the old isolated-skin 1.106 stretch. All x is unchanged.
 const image=source.image,w=image.width,h=image.height,cut0=h*136/1024,cut1=h*234/1024;
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d'),contentHeight=h*(1-.47/4.4),scale=contentHeight/(h-(cut1-cut0)),join=cut0*scale;
 // Hidden lower padding keeps the project's inherited fallback red and a flat
 // tangent-space normal. It introduces no additional studs or invented carving.
 ctx.fillStyle=source.colorSpace===THREE.SRGBColorSpace?'#9a1f16':'rgb(128,128,255)';
 ctx.fillRect(0,0,w,h);
 ctx.drawImage(image,0,0,w,cut0,0,0,w,join);
 ctx.drawImage(image,0,cut1,w,h-cut1,0,join,w,contentHeight-join);
 // Texture.clone() shares THREE.Source: replacing .image would mutate every
 // gate's original texture. Detach the source explicitly before assignment.
 const texture=source.clone();texture.source=new THREE.Source(canvas);texture.name=name;texture.needsUpdate=true;
 return texture;
}
