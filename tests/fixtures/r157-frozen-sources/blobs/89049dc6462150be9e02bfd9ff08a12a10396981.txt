// Bounded R60 review of the existing Nanxun hall. Unknown inventory is not empty.
const SOURCE='https://img.dpm.org.cn/Uploads/Picture/dc/3938%5B1024%5D.jpg';
function check(c){
 const {item,p,g,f}=c??{};
 if(p?.key!=='nanxun'||p?.id!=='place-outer-west-fa7f5d119e'||item?.name!=='南薰殿'||item.x!==289.6||item.z!==-315.7||item.w!==23.3||item.d!==13.4||item.ph!==.6||item.colH!==6.41||item.bays!==undefined||g.bays!==5||item.interior!=='B:hall'||item.throne||g?.key!=='nanxun'||g.w!==23.3||g.d!==13.4||g.y!==.6||g.h!==6.41||g.front!==-6.7||g.rear!==6.7||!f?.isGroup||f.position.x!==289.6||f.position.z!==-315.7||f.rotation.y!==0||!f.scale.equals({x:1,y:1,z:1}))throw Error('Nanxun review requires the exact retained declaration and frame');
}
export function withholdNanxunPlaceholderFurniture(c){
 check(c);if(c.g.inventory)throw Error('Duplicate Nanxun inventory review');
 c.g.inventory={status:'UNKNOWN',knownEmpty:false,accepted:false,displayDate:null,missingEvidence:['CURRENT_ROOM_OVERVIEW','CURRENT_INVENTORY','PLACEMENT','DISPLAY_DATE'],historicalText:'Five-tier red cabinets and portrait counts are historical inventory, not evidence for present placement.'};
 c.g.furnitureStatus='UNKNOWN_INVENTORY_GENERIC_PROPS_WITHHELD';
 c.g.withheldFurniture={priorStatus:'R48_LEGACY_UNVERIFIED_GENERIC_HALL_PRESET',notProofOfEmptyRoom:true,geometryOrCollidersGenerated:0};
}
export function applyNanxunCeilingBaseColors(c){
 check(c);if(!c.g.inventory||c.g.caissonBaseColors)throw Error('Nanxun inventory review must precede one ceiling review');
 const plan=[['nanxun-square-caisson-frame',4,'green'],['nanxun-caisson-perimeter-bracket-fit',32,'gold'],['nanxun-square-to-octagon-spandrel',1,'green'],['nanxun-octagonal-caisson-transition',1,'green'],['nanxun-circular-caisson-transition',1,'gold'],['nanxun-caisson-relief-unmodeled-core',1,'brown']];
 const targets=[];for(const [role,count,palette]of plan){const ms=c.f.children.filter(m=>m.isMesh&&m.userData.role===role);if(ms.length!==count||ms.some(m=>!m.visible||!m.material?.isMeshStandardMaterial||m.material.opacity!==1||m.material.transparent||!m.geometry?.attributes.position||m.scale.x!==1||m.scale.y!==1||m.scale.z!==1))throw Error('Nanxun ceiling role/material drift: '+role);for(const m of ms)targets.push({m,palette});}
 const room=c.kit.rooms.at(-1);if(room?.name!=='南薰殿'||room.kind!=='nanxun-source-viewing-region'||room.floorY!==.6)throw Error('Nanxun room registration drift');
 const colors={green:0x294a48,gold:0xa18a53,brown:0x796037},cache=new Map();
 for(const{m,palette}of targets){const key=palette+':'+m.material.side;let mat=cache.get(key);if(!mat){mat=m.material.clone();mat.name='r60_nanxun_caisson_base_'+key;mat.color.setHex(colors[palette]);mat.map=null;mat.normalMap=null;mat.roughness=.86;mat.metalness=0;mat.userData={...mat.userData,source:SOURCE,interpretation:'OBSERVED_BASE_COLOR_FAMILIES_ONLY_NOT_PAINTED_MOTIFS_OR_DRAGON_RELIEF',colorimetry:'FITTED_FROM_UNCALIBRATED_PHOTO'};cache.set(key,mat);c.kit.owned.push(mat);}m.material=mat;m.userData.nanxunBaseColor={palette,source:SOURCE,patternReconstructed:false,geometryChanged:false};}
 room.inventory={...c.g.inventory,missingEvidence:[...c.g.inventory.missingEvidence]};room.layout={status:'UNVERIFIED',basis:'RETAINED_MODEL_VIEWING_REGION_NOT_HISTORICAL_ROOM_SURVEY'};
 c.g.caissonBaseColors={source:SOURCE,status:'PARTIAL_BASE_COLOR_FIT',accepted:false,meshes:targets.length,materials:cache.size,geometryChanged:false,uvChanged:false,textureAdded:false,dragonRelief:'UNMODELED',finePaintedMotifs:'UNMODELED',existingCoarseBracketGeometry:'UNCHANGED_NOT_PHOTO_RECONSTRUCTION'};
 return true;
}
