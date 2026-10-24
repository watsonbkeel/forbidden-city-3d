import * as THREE from 'three';

const ROLE = 'r63-qinzheng-footstool';
const FIT = 'REVERSIBLE_MODEL_FIT_NOT_SURVEYED';
/** One visible object only. The URL date is not the photograph capture date.
 * Width follows the photo's roughly 0.27 stool/kang ratio against the retained
 * 3.3 m R53 kang. Depth, height and joinery are unmeasured compatibility fits.
 * No carved ornament, woven surface, rug, vessels or side stands are inferred. */
export const QINZHENG_FOOTSTOOL = Object.freeze({
  role: ROLE, catalogId: 'place-west-six-17d883bce6',
  photo: 'https://img.dpm.org.cn/Uploads/image/2026/04/30/2-stivNCrFc313.jpg',
  photoUrlDate: '2026-04-30', photographyDate: null,
  dimensionStatus: FIT, historicalInventoryVerified: false,
  x0: 11.15, x1: 12.05, z0: -2.64, z1: -2.10,
  baseY: .62, topY: .76, topThickness: .045, footWidth: .075,
  photoWidthRatioApproximate: .27, fittedWidthRatio: .9 / 3.3,
  floorPolicy: 'FEET_REACH_RETAINED_B_FLOOR_0.62_S_FLOOR_OVERLAPS_LOWER_FEET_NO_FLOAT_OR_NEW_FLOOR',
  stage: 'PHOTO_SUPPORTED_BASIC_FORM_PARTIAL_NOT_FULL_RESTORATION',
});

/** Append after buildYangxinWestWarmRooms. Permanent B ownership: the actual
 * unchanged S InteriorLoader can load/unload around it without replacing it. */
export function buildQinzhengFootstool(kit, item, f) {
  if (item.name !== '养心殿' || item.x !== 108.6 || item.z !== 277.5 || item.w !== 36 || item.d !== 12 || item.ph !== .6 || item.colH !== 7.68 || ![undefined, 0, 'south'].includes(item.rot)) throw Error('R63 Qinzheng footstool identity/envelope mismatch');
  if (!f || f.parent !== kit.root || f.position.x !== item.x || f.position.z !== item.z || f.rotation.y !== 0 || !f.userData.yangxinWestWarmRooms) throw Error('R63 Qinzheng footstool requires retained R53 frame');
  if (f.userData.qinzhengFootstool) throw Error('R63 Qinzheng footstool already built');
  const p = QINZHENG_FOOTSTOOL, g = new THREE.Group();
  g.name = ROLE; g.userData = {role: ROLE, dimensionStatus: FIT, source: p.photo}; f.add(g); f.updateWorldMatrix(true, true);
  const material = new THREE.MeshStandardMaterial({name: `${ROLE}-dark-wood`, color: 0x291e1b, roughness: .66}); kit.owned.push(material);
  const box = (part,x0,x1,y0,y1,z0,z1) => {
    const role=`${ROLE}-${part}`, m=kit.mesh(g,new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),material,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
    m.name=role; m.userData={role,solid:true,dimensionStatus:FIT,source:p.photo,representation:'PLAIN_BASIC_FORM_NO_UNVERIFIED_CARVING'};
    kit.col(f,x0,y0,z0,x1,y1,z1); kit.colliders.at(-1).sourceRole=role;
    return m;
  };
  const underside=p.topY-p.topThickness;
  box('top',p.x0,p.x1,underside,p.topY,p.z0,p.z1);
  let i=0;
  for(const x of[p.x0+.025,p.x1-.025-p.footWidth]) for(const z of[p.z0+.025,p.z1-.025-p.footWidth]) box(`foot-${++i}`,x,x+p.footWidth,p.baseY,underside,z,z+p.footWidth);
  kit.walkBox(f,p.x0,p.z0,p.x1,p.z1,p.topY);
  Object.assign(kit.walkables.at(-1),{rescue:false,sourceRole:`${ROLE}-top`});
  const metadata={...p,streamingOwnership:'PERMANENT_B_NOT_OPTIONAL_S',newMeshes:5,newTriangles:60,newColliders:5,newSupports:1,materialStatus:'PLAIN_DARK_WOOD_PHOTO_COLOR_FIT_NOT_MATERIAL_IDENTIFICATION',floorOverlapLimitation:'Retained S floor top is about 0.667337 m, embedding the lower feet by about 0.047337 m. B feet meet the actual 0.62 m floor. Existing floors and physics are unchanged.'};
  f.userData.qinzhengFootstool=metadata;
  return metadata;
}
