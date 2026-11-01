import * as THREE from 'three';

const KEY = 'donghua_central_nine_row_front';
const near = (a,b) => Number.isFinite(a) && Math.abs(a-b)<1e-8;
const unit = o => o.scale.toArray().every(x=>x===1);
const unrotated = o => near(o.rotation.x,0)&&near(o.rotation.y,0)&&near(o.rotation.z,0);

// A reviewed declaration, never a name-only or shared city-gate override.
export function isDonghuaCentralDoorTarget({zoneId,itemIndex,item}={}) {
  return zoneId==='outer-east'&&itemIndex===21&&item?.kind==='cityGate'&&
    item.cityGateProfile==='east-west'&&item.name==='东华门'&&
    item.x===-365.8&&item.z===-257&&item.rot==='east'&&
    ['w','h','t','width','height','depth','open','gateKind','gateProfile'].every(k=>item[k]===undefined);
}

/** Only the two passage-facing skins of the existing central portal change.
 * World ray/UV tests establish local +Z on leaf 0 and local -Z on leaf 1.
 * Every original triangle, vertex attribute, transform, collider and support is
 * retained. Other portals and unobserved backs keep their original material.
 * The 8-column / 9-row layout is supported; color, rings, spacing and aspect
 * remain inherited, uncalibrated artwork. This is not complete gate acceptance.
 */
export function applyDonghuaCentralDoorFront(kit,frame,binding) {
  if(!isDonghuaCentralDoorTarget(binding)||frame?.parent!==kit.root||
    frame.userData.donghuaCentralDoorFront?.status==='PARTIAL_COUNT_CORRECTED'||
    frame.name!=='city-gate-东华门'||!near(frame.position.x,-365.8)||!near(frame.position.y,0)||!near(frame.position.z,-257)||
    !near(frame.rotation.x,0)||!near(frame.rotation.y,Math.PI/2)||!near(frame.rotation.z,0)||!unit(frame)||
    frame.userData.structure?.id!=='city-gates/donghua'||frame.userData.cityGate?.portalCount!==3)return false;
  const portals=frame.children.filter(o=>o.name.startsWith('portal-'));
  if(portals.length!==3||!portals.every((o,i)=>o.name===`portal-${[-8.4,0,8.4][i]}`&&
    near(o.position.x,[-8.4,0,8.4][i])&&near(o.position.y,0)&&near(o.position.z,0)&&unrotated(o)&&unit(o)))return false;
  const portal=portals[1],lib=kit.lib,base=lib.material('door_studded');
  const sizes=lib.quality==='hd'?[[762,1024],[381,512]]:lib.quality==='sd'?[[381,512],[190,256]]:null;
  const loaded=lib.materials instanceof Map&&lib.colors instanceof Map&&lib.normals instanceof Map&&
    lib.has?.('door_studded')===true&&sizes&&base.map===lib.colors.get('door_studded')&&
    base.normalMap===lib.normals.get('door_studded')&&[base.map,base.normalMap].every((t,i)=>
      t?.image?.width===sizes[i][0]&&t.image.height===sizes[i][1]);
  if(!loaded) {
    const state={objectId:'FC-C8AD5BD621',status:'NOT_CORRECTED',reason:'SOURCE_UNAVAILABLE',
      detail:'Requires loaded HD/SD project albedo and matching normal. Original materials and geometry retained.'};
    frame.userData.donghuaCentralDoorFront=state;kit.root.userData.donghuaCentralDoorFront=state;return false;
  }
  const leaves=portal.children;
  if(leaves.length!==2||!leaves.every(o=>o.isMesh&&o.material===base))return false;
  const prepared=[];
  for(const [i,leaf] of leaves.entries()) {
    const g=leaf.geometry,a=g.attributes,idx=g.index,p=g.parameters,facing=[1,-1][i];
    if(!p||!near(p.width,2.64)||!near(p.height,6)||!near(p.depth,.25)||idx?.count!==36||
      !near(leaf.position.x,[-2.61,2.61][i])||!near(leaf.position.y,0)||!near(leaf.position.z,-5.18)||
      !near(leaf.rotation.x,0)||!near(leaf.rotation.y,Math.PI/2)||!near(leaf.rotation.z,0)||!unit(leaf)||
      leaf.children.length||!a.position||!a.normal||!a.uv)return false;
    const front=[],keep=[];
    for(let k=0;k<idx.count;k+=3) {
      const ids=[idx.getX(k),idx.getX(k+1),idx.getX(k+2)];
      (ids.every(j=>a.normal.getZ(j)===facing)?front:keep).push(...ids);
    }
    if(front.length!==6||keep.length!==30||!front.every(j=>near(a.position.getZ(j),facing*.125)))return false;
    prepared.push({leaf,g,front,keep});
  }
  const material=frontMaterial(lib,base);
  for(const {leaf,g,front,keep} of prepared) {
    const skinGeometry=g.clone();skinGeometry.setIndex(front);skinGeometry.clearGroups();
    g.setIndex(keep);g.clearGroups();
    const skin=new THREE.Mesh(skinGeometry,material);skin.castShadow=leaf.castShadow;skin.receiveShadow=leaf.receiveShadow;
    skin.name='donghua-central-nine-row-front';
    skin.userData={role:skin.name,objectId:'FC-C8AD5BD621',status:'VERIFY_PENDING',
      scope:'Central two passage-facing skins only: 8 columns / 9 rows. Hardware, color, spacing and aspect remain inherited and uncalibrated.'};
    leaf.add(skin);
  }
  const state={objectId:'FC-C8AD5BD621',status:'PARTIAL_COUNT_CORRECTED',verticalRows:9,horizontalColumns:8,
    portal:'portal-0',faces:['LOCAL_PLUS_Z','LOCAL_MINUS_Z'],
    hardware:'INHERITED_VERTICALLY_RESCALED_UNCALIBRATED',color:'INHERITED_UNCALIBRATED',spacing:'INHERITED_REMAPPED_UNCALIBRATED',
    visibleGraphicFit:{minY:0,maxY:6,verticalScale:1024/926,meaning:'DISPLAY_FIT_NOT_MEASUREMENT_NO_BOTTOM_PADDING'}};
  frame.userData.donghuaCentralDoorFront=state;kit.root.userData.donghuaCentralDoorFront=state;
  return true;
}

function frontMaterial(lib,base) {
  const cached=lib.materials.get(KEY);if(cached)return cached;
  const map=remap(base.map,`${KEY}_color`),normalMap=remap(base.normalMap,`${KEY}_normal`);
  const material=base.clone();material.name=KEY;material.map=map;material.normalMap=normalMap;
  lib.colors.set(KEY,map);lib.normals.set(KEY,normalMap);lib.materials.set(KEY,material);
  return material;
}

function remap(source,name) {
  // Remove the second stud-row band [136,234) in the 1024-high project asset,
  // well above the lion-ring region. All x coordinates, the ring, and both edge
  // bands survive. The remaining 926 rows fill the ORIGINAL y=0..6 leaf, a
  // 1024/926 (~1.106) vertical display stretch, not measured photo calibration.
  // Unlike the unrelated Zuoyi gate, this portal has no .47m occluding slab.
  const image=source.image,w=image.width,h=image.height,cut0=h*136/1024,cut1=h*234/1024;
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d'),scale=h/(h-(cut1-cut0)),join=cut0*scale;
  ctx.drawImage(image,0,0,w,cut0,0,0,w,join);
  ctx.drawImage(image,0,cut1,w,h-cut1,0,join,w,h-join);
  // THREE.Texture.clone shares Source; detach before assigning derived pixels.
  const texture=source.clone();texture.source=new THREE.Source(canvas);texture.name=name;texture.needsUpdate=true;
  return texture;
}
