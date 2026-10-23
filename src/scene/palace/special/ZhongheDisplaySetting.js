import * as THREE from 'three';

/** A bounded visible-form correction from one 400 x 313 official photograph.
 * The second official encoding is the same view, not corroborating geometry.
 * All dimensions below fit the inherited shell; none is a survey measurement. */
export const ZHONGHE_DISPLAY=Object.freeze({
 id:'zhonghe-display-setting-r55',
 source:'https://www.dpm.org.cn/explore/building/236464.html',
 displaySource:'https://www.dpm.org.cn/show/225723.html',
 image:'https://img.dpm.org.cn/Uploads/Picture/dc/1569.jpg',
 imageSha256:'22ef4565e4c0623818aed244cda77aa3fd704d110de5b4496eef4067595d67fe',
 sourcePixels:[400,313],independentViewpoints:1,photographyDate:null,reconstructionYear:null,
 dimensionStatus:'REVERSIBLE_PHOTO_FIT_NOT_MEASURED',
 stage:'SOURCE_BOUNDED_BASE_MATERIALS_PARTIAL_NOT_RESTORATION',
 observation:['single-low-continuous-platform','open-under-seat-and-between-arms','independent-tall-central-framed-screen'],
 unknown:['precise-dimensions','screen-leaf-count','carving-and-inscriptions','hidden-back-and-joinery','material-identification','complete-furnishing-inventory'],
});
const PALETTE={
 // Broad visible color families only, not a claim to identify stone, timber,
 // textile, gilding, age or reflectance from this small dark photograph.
 platform:{color:0x8f9786,roughness:.92},rim:{color:0x5c4e3c,roughness:.8},
 wood:{color:0x675132,roughness:.68,metalness:.08},ochre:{color:0xb8a055,roughness:.78,metalness:.12},
};

/** Zhonghe-only authoring replacement. Old central furniture is never created;
 * no runtime deletion, material matching, shared-material edits or S overlay. */
export function buildZhongheDisplaySetting(builder,shell,{x0,z0,y,H,ztb0,ztb1,thW,bayW}) {
 if(shell.userData.structure?.id!=='zhonghedian')throw Error('Zhonghe display requires the registered Zhonghe shell');
 if(shell.userData.structure.displaySetting)throw Error('Zhonghe display already installed');
 const depth=ztb1-ztb0,zc=(ztb0+ztb1)/2;
 const record={...structuredClone(ZHONGHE_DISPLAY),frame:{x:x0,y,z:z0},inheritedAnchors:{ztb0,ztb1,thW,bayW},colliders:[],walkables:[],
  replacement:{call:'SquareHalls/Zhonghe/throneArea',removed:['legacy-double-high-platform-and-three-stairs','legacy-solid-gold-chair','legacy-high-screen-and-three-flat-caps','legacy-high-furniture-envelope'],retained:['all-shell-and-four-doors','continuous-flat-ceiling','original-plaque','two-inherited-unverified-tripods']},
  supportRevision:{retainedHighScreen:false,oldScreenBottomRelativeToFloor:1.25,newScreenBottomRelativeToFloor:.21,reason:'The legacy screen depended on the removed high dais. Replace the entire target screen with an independently grounded low-platform screen; do not add a pedestal to preserve obsolete bytes.'},
  fit:{platformThickness:.18,platformWidth:thW,platformDepth:depth,visibleFloorOffset:.03,chairCenterLocalZ:zc-z0+.38,screenLocalZ:ztb1-z0-.52,screenTopRelativeToFloor:3.13},
  retainedFurnishingStatus:'Legacy tripods retained unchanged, not newly identified or verified from this photograph'};
 shell.userData.structure.displaySetting=record;

 // Exact retained legacy calls: position, dimensions, geometry, material,
 // shadow flags and two original tripod colliders are left unchanged.
 const bronze=builder.ownMat('bronze',{color:0x4a3b28,metalness:.7,roughness:.45});
 for(const s of [-1,1])builder.tripod(shell,bronze,x0+s*thW*.35,y,ztb0-2.2);
 const plaque=builder.plaqueMesh('允执厥中',4.2,1.3,false);
 plaque.position.set(x0,y+H-1.1,ztb0-.5);plaque.rotation.y=Math.PI;shell.add(plaque);

 const mats=Object.fromEntries(Object.entries(PALETTE).map(([id,p])=>[id,builder.ownMat(`r55-zhonghe-${id}`,{name:`r55-zhonghe-${id}`,...p})]));
 function add(id,geometry,material,x,cy,z,{solid=true}={}){
  const m=new THREE.Mesh(geometry,mats[material]);m.name=`r55-zhonghe-${id}`;m.userData.zhongheDisplayId=m.name;
  m.position.set(x0+x,y+cy,z);m.castShadow=true;m.receiveShadow=true;shell.add(m);m.updateMatrixWorld(true);
  if(solid){const b=new THREE.Box3().setFromObject(m);builder.col(...b.min.toArray(),...b.max.toArray());
   record.colliders.push({owner:m.name,min:[b.min.x+builder.ox,b.min.y,b.min.z+builder.oz],max:[b.max.x+builder.ox,b.max.y,b.max.z+builder.oz]});}
  return m;
 }
 const box=(id,material,w,h,d,x,cy,z,solid=true)=>add(id,new THREE.BoxGeometry(w,h,d),material,x,cy,z,{solid});
 const base=box('low-platform','platform',thW,.18,depth,0,.12,zc);
 const b=new THREE.Box3().setFromObject(base),support={type:'box',box:new THREE.Box3(new THREE.Vector3(b.min.x+builder.ox,b.max.y,b.min.z+builder.oz),new THREE.Vector3(b.max.x+builder.ox,b.max.y,b.max.z+builder.oz)),rescue:false};
 builder.walkables.push(support);record.walkables.push({owner:base.name,min:support.box.min.toArray(),max:support.box.max.toArray(),rescue:false});
 // Thin front fascia replaces, rather than conceals, the former 0.6 m tiers.
 box('platform-front-fascia','rim',thW,.065,.025,0,.095,ztb0-.0125);

 const seatZ=zc+.38,seatBottom=.71,seatTop=.87;
 for(const sx of [-1,1])for(const sz of [-1,1])box(`chair-leg-${sx}-${sz}`,'wood',.12,.50,.12,sx*.68,.46,seatZ+sz*.43);
 box('chair-seat','wood',1.72,.16,1.12,0,(seatBottom+seatTop)/2,seatZ);
 box('chair-seat-pad','ochre',1.49,.055,.91,0,seatTop+.0275,seatZ);
 for(const sx of [-1,1]){
  box(`chair-back-post-${sx}`,'wood',.10,1.02,.12,sx*.76,1.38,seatZ+.47);
  box(`chair-arm-${sx}`,'wood',.105,.09,1.04,sx*.77,1.215,seatZ);
  box(`chair-front-arm-post-${sx}`,'wood',.09,.30,.09,sx*.77,1.02,seatZ-.43);
 }
 box('chair-back-panel','ochre',1.42,.76,.075,0,1.32,seatZ+.46);
 box('chair-upper-rail','wood',1.62,.12,.14,0,1.85,seatZ+.47);

 // One simple opaque screen silhouette, not an asserted count of screen leaves.
 // A low continuous bottom rail bears on the actual platform. The broad blank
 // front field is recessed between dark rails; no invented reverse ornament.
 const screenZ=ztb1-.52,screenW=Math.min(thW*.64,2.92),half=screenW/2;
 const outline=new THREE.Shape();outline.moveTo(-half,.21);outline.lineTo(half,.21);outline.lineTo(half,2.95);
 outline.lineTo(.77,2.95);outline.lineTo(.63,3.13);outline.lineTo(-.63,3.13);outline.lineTo(-.77,2.95);outline.lineTo(-half,2.95);outline.closePath();
 const geo=new THREE.ExtrudeGeometry(outline,{depth:.18,bevelEnabled:false,steps:1,curveSegments:1});geo.translate(0,0,-.09);
 // Its AABB is exact for the occupied body up to y=2.95; above that the thin
 // crown envelope is conservative and well above the player's head, not a
 // floor-to-ceiling ghost barrier across the room.
 add('screen-frame-body',geo,'wood',0,0,screenZ);
 box('screen-front-field','ochre',screenW-.32,2.37,.026,0,1.535,screenZ-.103);
 box('screen-bottom-rail','wood',screenW,.14,.23,0,.28,screenZ);
 return record;
}
