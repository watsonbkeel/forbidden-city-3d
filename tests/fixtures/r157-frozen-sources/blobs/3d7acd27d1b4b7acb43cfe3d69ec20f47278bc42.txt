import * as THREE from 'three';
export const YANGXIN_EAST_PARTS=Object.freeze(['CHAIR','CHAIR_CUSHION','CHAIR_BACK','CHAIR_BACK_PAD','CHAIR_ARM_-1','CHAIR_LEG_-1_-1','CHAIR_LEG_-1_1','CHAIR_ARM_1','CHAIR_LEG_1_-1','CHAIR_LEG_1_1','FOOTSTOOL','FOOTSTOOL_PAD','CURTAIN_HEADER','CURTAIN','SOUTH_KANG',...Array.from({length:3},(_,i)=>['KANG_CUSHION_'+i,'KANG_BACK_'+i]).flat(),'NORTH_WEST','NORTH_WEST_TRANSOM','NORTH_EAST','NORTH_EAST_TRANSOM','NORTH_DOOR_HEADER','PALE_CEILING']);
/** Validate only the bounded optional Yangxin S layer, before any registration.
 * Fitted furniture is not historical inventory; its COLLISION proxy is its own
 * actual box, never a three-metre invisible throne enclosure. */
export function validateYangxinEast(root){
 if(root.getObjectByName('COL_east_dais'))throw Error('Yangxin obsolete east ghost collider');
 root.updateMatrixWorld(true);const names=new Map();root.traverse(o=>{if(o.isMesh){if(names.has(o.name))throw Error('Yangxin duplicate mesh identity');names.set(o.name,o);}});
 for(const part of YANGXIN_EAST_PARTS){const name='R88_YX_'+part,a=names.get(name),b=names.get('COL_'+name);if(!a||!b)throw Error('Yangxin missing east component '+part);if(a.userData.fit!=='PHOTO_FIT_NOT_SURVEYED'||b.userData.visibleOwner!==name)throw Error('Yangxin missing east provenance');const aa=new THREE.Box3().setFromObject(a),bb=new THREE.Box3().setFromObject(b);if(![...aa.min,...aa.max,...bb.min,...bb.max].every(Number.isFinite)||aa.isEmpty()||!aa.equals(bb))throw Error('Yangxin collision mismatch '+part);if(aa.min.x< -17.6||aa.max.x> -6.15||aa.min.y<0||aa.max.y>4.4||aa.min.z< -5.7||aa.max.z>.6)throw Error('Yangxin fitted component escaped east bounds');}
 for(const [name]of names)if((name.startsWith('R88_YX_')||name.startsWith('COL_R88_YX_'))&&!YANGXIN_EAST_PARTS.some(p=>name==='R88_YX_'+p||name==='COL_R88_YX_'+p))throw Error('Yangxin unexpected east component');
 for(const name of['merged_gold_lacquer','merged_red_lacquer','merged_wood_floor','COL_part_-1_n','COL_part_-1_s','WALK_dais_low'])if(!names.has(name))throw Error('Yangxin missing retained component '+name);
 return {parts:YANGXIN_EAST_PARTS.length,fit:'PHOTO_FIT_NOT_SURVEYED'};
}
