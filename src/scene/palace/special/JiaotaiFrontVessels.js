import * as THREE from 'three';

const FIT_HEIGHT=1.0, FIT_RADIAL_SCALE=.75;
const SOURCE = 'https://www.dpm.org.cn/explore/building/236467.html';
const IMAGES = Object.freeze([
  'https://file-pano.dpm.org.cn/hotspotImage/2026/03/20/13ecc40ac5cb4d2088f3b95fbaf234b7.jpg',
  'https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/0bc08ae37c874033a64fc729863f8548.jpg',
]);
const close = (a,b)=>Number.isFinite(a)&&Math.abs(a-b)<1e-5;
const identity = o=>o.position.lengthSq()===0&&o.rotation.x===0&&o.rotation.y===0&&o.rotation.z===0&&o.scale.x===1&&o.scale.y===1&&o.scale.z===1;
const PLATFORM_DATA = (()=>{
  const g=new THREE.BoxGeometry(4.8,.20,3.6);
  const result={index:Array.from(g.index.array),attributes:Object.fromEntries(Object.entries(g.attributes).map(([name,a])=>[name,{itemSize:a.itemSize,array:Array.from(a.array)}]))};
  g.dispose();return result;
})();
function retainedPlatformGeometry(g) {
  const same=(a,b)=>a?.length===b.length&&b.every((value,i)=>a[i]===value);
  return same(g.index?.array,PLATFORM_DATA.index)&&Object.keys(g.attributes).length===Object.keys(PLATFORM_DATA.attributes).length&&Object.entries(PLATFORM_DATA.attributes).every(([name,expected])=>g.attributes[name]?.itemSize===expected.itemSize&&same(g.attributes[name].array,expected.array));
}


// Closed radial solid, without duplicated pole rings or zero-area cap faces.
// Profiles are reversible visual fits; not measurements of an identified vessel.
function radialSolid(profile,segments=16) {
  const vertices=[0,profile[0][1]*FIT_HEIGHT/1.45,0],uv=[.5,0],indices=[];
  for(const [r,y] of profile)for(let j=0;j<segments;j++){
    const a=2*Math.PI*j/segments;vertices.push(r*FIT_RADIAL_SCALE*Math.cos(a),y*FIT_HEIGHT/1.45,r*FIT_RADIAL_SCALE*Math.sin(a));uv.push(j/segments,y/1.45);
  }
  const top=vertices.length/3;vertices.push(0,profile.at(-1)[1]*FIT_HEIGHT/1.45,0);uv.push(.5,1);
  for(let j=0;j<segments;j++){
    const next=(j+1)%segments;indices.push(0,1+j,1+next);
    for(let k=0;k<profile.length-1;k++){const a=1+k*segments+j,b=1+k*segments+next,c=a+segments,d=b+segments;indices.push(a,c,b,b,c,d);}
    indices.push(1+(profile.length-1)*segments+j,top,1+(profile.length-1)*segments+next);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();return geo;
}

/** Two pale tall lidded vessels visible at the FRONT corners of Jiaotai's low
 * carpeted platform, separate from the two blue floor braziers. Historical
 * object name, metal identity, engraved/perforated design and hidden back are
 * UNKNOWN. Do not call these a pair of silver originals or copy them elsewhere.
 * Hook after buildJiaotaiDisplaySetting, before authoring-time merge.
 */
export function buildJiaotaiFrontVessels(builder,shell) {
  const structure=shell?.userData.structure,display=structure?.displaySetting;
  if(structure?.frontVessels)throw Error('Jiaotai front vessels already installed');
  const anchors=shell?.children.filter(m=>m.isMesh&&m.name==='r54-jiaotai-low-platform')??[];
  if(builder.ox!==0||builder.oz!==0||structure?.id!=='jiaotaidian'||structure.floorY!==2.16||structure.bodyH!==6.2||display?.id!=='jiaotai-display-setting-r54'||display.frame.x!==0||display.frame.y!==2.16||display.frame.z!==354.1||anchors.length!==1)throw Error('Jiaotai front vessels require the canonical retained display');
  for(let p=shell;p;p=p.parent)if(!identity(p))throw Error('Jiaotai front vessels require untransformed authoring ancestors');
  shell.updateMatrixWorld(true);const anchor=new THREE.Box3().setFromObject(anchors[0]),size=anchor.getSize(new THREE.Vector3()),center=anchor.getCenter(new THREE.Vector3());
  if(!retainedPlatformGeometry(anchors[0].geometry)||anchors[0].rotation.x!==0||anchors[0].rotation.y!==0||anchors[0].rotation.z!==0||anchors[0].scale.x!==1||anchors[0].scale.y!==1||anchors[0].scale.z!==1||!close(size.x,4.8)||!close(size.y,.2)||!close(size.z,3.6)||!close(center.x,0)||!close(center.y,2.29)||!close(center.z,357.1))throw Error('Jiaotai front vessel low-platform anchor changed');
  const beforeColliders=builder.colliders.length,beforeMaterials=builder.ownedMaterials.length;
  const staged=new THREE.Group(),parts=[],groups=[];
  let material;
  try {
    material=new THREE.MeshStandardMaterial({name:'r159-jiaotai-front-vessel',color:0xa7b5b4,roughness:.54,metalness:.35});
    for(const [role,profile]of[
    ['round-foot',[[.18,0],[.18,.025],[.15,.045],[.145,.07],[.10,.085],[.07,.12],[.075,.16]]],
    ['narrow-upright-body',[[.075,.16],[.10,.18],[.10,.20],[.068,.225],[.066,1.02],[.095,1.045],[.095,1.075],[.075,1.12]]],
    ['roof-form-lid',[[.075,1.12],[.145,1.14],[.165,1.175],[.135,1.19],[.09,1.255],[.06,1.285],[.045,1.30],[.035,1.34],[.025,1.35],[.025,1.39],[.009,1.45]]],
    ])parts.push([role,radialSolid(profile)]);
  const record={id:'jiaotai-front-vessels-r159',entityId:'FC-DD2C183004',source:SOURCE,images:[...IMAGES],photographyDate:null,uploadPathDates:['2026-03-20','2026-06-25'],target:'OFFICIAL_PRESENT_DAY_DISPLAY_IMAGES_CAPTURE_DATES_UNSPECIFIED',count:2,sides:['west','east'],historicObjectName:null,materialIdentity:'UNVERIFIED_PALE_METAL_APPEARANCE_ONLY',dimensionStatus:'PHOTO_FIT_TO_RETAINED_PLATFORM_NOT_SURVEYED',height:FIT_HEIGHT,radialScale:FIT_RADIAL_SCALE,photoFit:'VISIBLE_FRONT_EDGE_AND_FEET_GROUND_CONTROL_13ECC_PHOTO_RANGE_NOT_REAR_CORNER_CALIBRATION',accepted:false,wholeInteriorAccepted:false,contact:'VISIBLE_PART_AABB_ENVELOPES_NO_NEW_WALKABLE_OR_EXACT_TRIANGLE_CLAIM',colliders:[],unknown:['historical object name','metal identity','engraved and perforated patterns','hidden back','original dimensions','exact exhibition and photography dates'],frame:{x:center.x,y:anchor.max.y,z:anchor.min.z+.30}};
  for(const [side,sign]of[['west',1],['east',-1]]){
    const group=new THREE.Group();group.name=`r159-jiaotai-${side}-front-vessel`;group.position.set(center.x+sign*2.08,anchor.max.y,record.frame.z);group.userData.jiaotaiFrontVessel={side,source:IMAGES,detail:'SOURCE_BOUNDED_SILHOUETTE_NO_ENGRAVING'};staged.add(group);groups.push(group);
    for(const [role,geo]of parts){const mesh=new THREE.Mesh(geo,material);mesh.name=`r159-jiaotai-${side}-${role}`;mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);mesh.updateWorldMatrix(true,false);const box=new THREE.Box3().setFromObject(mesh);record.colliders.push({owner:mesh.name,min:box.min.toArray(),max:box.max.toArray()});}
  }
  // All visual transforms are resolved independently before registration.
  // No authoring scene/owned-material mutation is published until all six
  // collider registrations succeeded. Any early or partial col failure rolls
  // back the exact original arrays and disposes only this staged candidate.
  for(const row of record.colliders){
    const n=builder.colliders.length;builder.col(...row.min,...row.max);
    if(builder.colliders.length!==n+1)throw Error('Jiaotai front vessel collider registration did not append one owner');
    builder.colliders.at(-1).r159JiaotaiFrontVessel=row.owner;
  }
  builder.ownedMaterials.push(material);
  for(const group of [...staged.children])shell.add(group);
  structure.frontVessels=record;return record;
  } catch(error) {
    builder.colliders.length=beforeColliders;
    builder.ownedMaterials.length=beforeMaterials;
    for(const group of groups)group.removeFromParent();
    for(const [,geometry]of parts)geometry.dispose();
    material?.dispose();throw error;
  }
}
