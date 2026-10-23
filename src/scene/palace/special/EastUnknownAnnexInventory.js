import * as THREE from 'three';
import {furnishRoom} from '../interiors.js';

// Frozen R61 declarations: unnamed fitted shells, not verified room identities.
const DECLARATIONS = {
  "3": {
    "kind": "hall",
    "x": -93,
    "z": 347.4,
    "w": 24,
    "d": 9.6,
    "pad": 0.6,
    "ph": 0.45,
    "colH": 6.08,
    "roof": "gable",
    "bays": 5,
    "rearHallProfile": "jingren-rear",
    "map": "hall"
  },
  "4": {
    "kind": "hall",
    "x": -109.88,
    "z": 319.8,
    "rot": "west",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "5": {
    "kind": "hall",
    "x": -77,
    "z": 319.8,
    "rot": "east",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "10": {
    "kind": "hall",
    "x": -93,
    "z": 403.9,
    "w": 24,
    "d": 9.6,
    "pad": 0.6,
    "ph": 0.45,
    "colH": 6.08,
    "roof": "gable",
    "bays": 5,
    "rearHallProfile": "chengqian-rear",
    "map": "hall"
  },
  "11": {
    "kind": "hall",
    "x": -110.08,
    "z": 370.6,
    "rot": "west",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "12": {
    "kind": "hall",
    "x": -77.12,
    "z": 370.6,
    "rot": "east",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "17": {
    "kind": "hall",
    "x": -93,
    "z": 456,
    "w": 24,
    "d": 9.6,
    "pad": 0.6,
    "ph": 0.45,
    "colH": 6.08,
    "roof": "gable",
    "bays": 5,
    "rearHallProfile": "zhongcui-rear",
    "map": "hall"
  },
  "18": {
    "kind": "hall",
    "x": -109.88,
    "z": 422,
    "rot": "west",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "19": {
    "kind": "hall",
    "x": -76.92,
    "z": 422,
    "rot": "east",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "24": {
    "kind": "hall",
    "structure": "yanxi-storehouse",
    "storehouseProfile": "north",
    "x": -148.2,
    "z": 341.6,
    "w": 24,
    "d": 9.6,
    "pad": 0.6,
    "ph": 0.45,
    "colH": 6.08,
    "roof": "xieshan",
    "map": "hall",
    "source": "estimated"
  },
  "25": {
    "kind": "hall",
    "structure": "yanxi-storehouse",
    "storehouseProfile": "east",
    "x": -164.68,
    "z": 313.7,
    "rot": "west",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "26": {
    "kind": "hall",
    "structure": "yanxi-storehouse",
    "storehouseProfile": "west",
    "x": -131.72,
    "z": 313.7,
    "rot": "east",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "31": {
    "kind": "hall",
    "x": -148.7,
    "z": 401.9,
    "w": 24,
    "d": 9.6,
    "pad": 0.6,
    "ph": 0.45,
    "colH": 6.08,
    "roof": "gable",
    "bays": 5,
    "rearHallProfile": "yonghe-rear",
    "map": "hall"
  },
  "32": {
    "kind": "hall",
    "x": -165.48,
    "z": 367.9,
    "rot": "west",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "33": {
    "kind": "hall",
    "x": -132.52,
    "z": 367.9,
    "rot": "east",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "38": {
    "kind": "hall",
    "x": -148.5,
    "z": 453.5,
    "w": 24,
    "d": 9.6,
    "pad": 0.6,
    "ph": 0.45,
    "colH": 6.08,
    "roof": "xieshan",
    "map": "hall"
  },
  "39": {
    "kind": "hall",
    "x": -165.98,
    "z": 421,
    "rot": "west",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "40": {
    "kind": "hall",
    "x": -133.02,
    "z": 421,
    "rot": "east",
    "w": 11.2,
    "d": 7.04,
    "pad": 0.5,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall",
    "source": "estimated"
  },
  "44": {
    "kind": "hall",
    "x": -83.7,
    "z": 501.6,
    "w": 18.9,
    "d": 7.2,
    "pad": 0.4,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall"
  },
  "45": {
    "kind": "hall",
    "x": -112.2,
    "z": 501.6,
    "w": 18.9,
    "d": 7.2,
    "pad": 0.4,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall"
  },
  "46": {
    "kind": "hall",
    "x": -142.2,
    "z": 501.6,
    "w": 18.9,
    "d": 7.2,
    "pad": 0.4,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall"
  },
  "47": {
    "kind": "hall",
    "x": -170.8,
    "z": 501.6,
    "w": 18.9,
    "d": 7.2,
    "pad": 0.4,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall"
  },
  "48": {
    "kind": "hall",
    "x": -199.5,
    "z": 501.6,
    "w": 18.9,
    "d": 7.2,
    "pad": 0.4,
    "ph": 0.45,
    "colH": 5.44,
    "roof": "gable",
    "brackets": false,
    "map": "hall"
  },
  "54": {
    "kind": "hall",
    "x": -182.5,
    "z": 283.4,
    "w": 51.6,
    "d": 20,
    "pad": 1,
    "ph": 0.9,
    "colH": 7.36,
    "roof": "wudian",
    "map": "hall"
  }
};
const ORIGINAL_IDS={3:'east-six/jingren-rear',10:'east-six/chengqian-rear',17:'east-six/zhongcui-rear',
  24:'east-six/yanxi-storehouse-north',25:'east-six/yanxi-storehouse-east',26:'east-six/yanxi-storehouse-west',31:'east-six/yonghe-rear'};
const R62_FACADE_IDS={38:'jingyang-rear-facade',54:'east-six/fengxian-rear'};
const SCOPE = 'r62-east-24-unnamed-annex-furnish-room-only';
const STATUS = 'UNKNOWN_INVENTORY_WITHHELD_NOT_KNOWN_EMPTY';
const fail = reason => { throw new Error(`East unknown annex: ${reason}`); };
const equal = (a,b) => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(k => Object.hasOwn(b,k) && equal(a[k],b[k]));
};

/** A virtual explicit opt-in; the source zone declarations remain unchanged.
 * No missing-policy default and no name-based or region-based targeting. */
export function validateEastUnknownAnnexInventoryPolicy({zoneId,itemIndex,item} = {}) {
  if (item?.furnishingPolicy === undefined) return null;
  const expected = DECLARATIONS[itemIndex];
  const policy = {mode:'unknown-inventory',target:`east-six/items/${itemIndex}`,scope:SCOPE};
  if (zoneId !== 'east-six' || !Number.isInteger(itemIndex) || !expected || !equal(item.furnishingPolicy,policy)) fail('explicit policy/target mismatch');
  const {furnishingPolicy,...declaration} = item;
  if (!equal(declaration,expected)) fail('declaration identity/envelope drift');
  return Object.freeze(policy);
}
function transformMatches(object,position,rotation=0) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0,rotation,0));
  return object?.matrixAutoUpdate === true && object.matrixWorldAutoUpdate === true && equal(object.position.toArray(),position) &&
    equal(object.quaternion.toArray(),q.toArray()) && equal(object.scale.toArray(),[1,1,1]);
}
function attributeEqual(a,b) {
  return !!a && !!b && a.itemSize===b.itemSize && a.count===b.count && a.normalized===b.normalized && a.usage===b.usage && a.gpuType===b.gpuType &&
    a.array?.constructor===b.array?.constructor && a.array.length===b.array.length && a.array.every((v,i)=>v===b.array[i]);
}
function geometryEqual(a,b) {
  return a?.isBufferGeometry===true && !a.isInstancedBufferGeometry && a.type===b.type && a.name===b.name && equal(a.userData,b.userData) && equal(a.parameters,b.parameters) && equal(Object.keys(a.attributes).sort(),Object.keys(b.attributes).sort()) &&
    Object.keys(b.attributes).every(k=>attributeEqual(a.attributes[k],b.attributes[k])) && attributeEqual(a.index,b.index) &&
    equal(a.groups,b.groups) && equal(a.drawRange,b.drawRange) && equal(a.morphAttributes,{}) && !a.morphTargetsRelative;
}
function writableRecord(record,keys) {
  return !!record && Object.getPrototypeOf(record)===Object.prototype && keys.every(key=>{
    const d=Object.getOwnPropertyDescriptor(record,key);
    return d ? d.writable===true : Object.isExtensible(record);
  });
}
function spliceable(array) {
  return Array.isArray(array) && Object.getPrototypeOf(array)===Array.prototype && array.splice===Array.prototype.splice && array.indexOf===Array.prototype.indexOf && Object.isExtensible(array) && Object.getOwnPropertyDescriptor(array,'length').writable &&
    Object.keys(array).every(k=>{const d=Object.getOwnPropertyDescriptor(array,k);return d.writable&&d.configurable});
}
function hasListeners(object) {
  return object?._listeners && Object.values(object._listeners).some(list=>!Array.isArray(list)||list.length>0);
}
function geometryResources(geometry) {
  if(!geometry)return [];
  return [geometry,...[...Object.values(geometry.attributes??{}),geometry.index].filter(Boolean).flatMap(a=>[a,a.array,a.array?.buffer].filter(Boolean))];
}
function materialMatches(actual,key,kit) {
  const options = {
    wood:{name:'kit_furn_wood',color:0x5a2f1c,roughness:.55,metalness:.05},
    cloth:{name:'kit_furn_cloth',color:0xb98a2e,roughness:.9,metalness:.05},
    lacquer:{name:'kit_lacquer',color:0x7a1d12,roughness:.4,metalness:.1},
    gold:{name:'kit_gold',color:0xe2b048,roughness:.28,metalness:.8},
  };
  if (!options[key] || actual !== kit._interiorMats?.[key] || kit.owned.filter(m=>m===actual).length!==1 ||
      (['lacquer','gold'].includes(key) && actual!==kit[key])) return false;
  const reference = new THREE.MeshStandardMaterial(options[key]);
  try {
    // Compare every own rendering property, not just the material name/color.
    // Per-instance IDs, update version and harmless disposal listeners are not
    // render state. No runtime kit material is disposed here or on removal.
    const omit = new Set(['id','uuid','version','_listeners']);
    const payload = m => Object.fromEntries(Object.keys(m).filter(k=>!omit.has(k)).map(k=>[k,m[k]]));
    return equal(payload(actual),payload(reference)) && actual.onBeforeCompile===reference.onBeforeCompile &&
      actual.customProgramCacheKey===reference.customProgramCacheKey;
  } finally { reference.dispose(); }
}
function roomPlan(item,index,f) {
  let bays = item.bays ?? Math.max(3,Math.round(item.w/3.6)|1);
  // Dedicated R62 facade corrections retain a single navigation room. These
  // exact structure identities may refine bays without changing source data.
  if (index===38 && f.userData.structure?.id==='jingyang-rear-facade') bays=5;
  if (index===54 && f.userData.structure?.id==='east-six/fengxian-rear') bays=9;
  const bay=item.w/bays, x0=-item.w/2+.35, x1=-item.w/2+bays*bay-.35;
  return {kind:item.w>=14?'hall':'room', room:{x0,x1,z0:-item.d/2+.3,z1:item.d/2-.3,y:item.ph,
    doorX:-item.w/2+(Math.floor((bays-1)/2)+.5)*bay,h:item.colH-THREE.MathUtils.clamp(item.colH*.12,.45,.85),backDoor:false}};
}
function expectedRoom(item,plan,matrix,id,extra) {
  const {room:r,kind}=plan, toW=(x,z)=>new THREE.Vector3(x,0,z).applyMatrix4(matrix);
  const a=toW(r.x0,-item.d/2),b=toW(r.x1,item.d/2),pt=p=>{const v=toW(p.x,p.z);return {x:+v.x.toFixed(2),z:+v.z.toFixed(2)}};
  return {id,name:null,kind,min:{x:Math.min(a.x,b.x),y:item.ph,z:Math.min(a.z,b.z)},max:{x:Math.max(a.x,b.x),y:item.ph+r.h,z:Math.max(a.z,b.z)},floorY:item.ph,
    doors:[pt({x:r.doorX,z:-item.d/2})],cover:extra.cover.map(pt),spawns:extra.spawns.map(pt)};
}
/** Re-run only the tiny original room preset against an isolated recorder.
 * This creates at most eight temporary BoxGeometry objects, never a second
 * hall or world, never adds anything to kit, and reuses materials read-only. */
function recordLegacyPreset(kit,plan,matrix) {
  const meshes=[],colliders=[],recorder={
    interiorMaterials:()=>kit._interiorMats,
    mesh(_f,geometry,material,x,y,z) {const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;meshes.push(m);return m},
    col(_f,x0,y0,z0,x1,y1,z1) {colliders.push(new THREE.Box3(new THREE.Vector3(x0,y0,z0),new THREE.Vector3(x1,y1,z1)).applyMatrix4(matrix))},
  };
  try {
    const extra=furnishRoom(recorder,null,plan.kind,plan.room,1);
    const count=plan.kind==='hall'?8:6;
    if (meshes.length!==count || colliders.length!==count || extra.cover.length!==(plan.kind==='hall'?2:1) || extra.spawns.length!==2) fail('legacy preset output drift');
    return {meshes,colliders,extra,dispose:()=>meshes.forEach(m=>m.geometry.dispose())};
  } catch (error) {meshes.forEach(m=>m.geometry.dispose());throw error}
}

/** Run after the existing hall/facade builder and before kit.finish(). It
 * withholds only the exact old furnishRoom output and dedicated colliders.
 * Everything is validated first; no bbox-overlap selection, no generic cleanup,
 * no full-hall mesh-count lock, no source mutation and no shared-kit changes. */
export function applyEastUnknownAnnexInventory(kit,context,built) {
  const policy=validateEastUnknownAnnexInventoryPolicy(context);
  if (!policy) return built;
  const {item,itemIndex}=context,f=built?.f,rotation=item.rot==='west'?-Math.PI/2:item.rot==='east'?Math.PI/2:0;
  if (!kit?.root?.isGroup || kit.root.name!=='east-six' || kit.root.parent!==null || !transformMatches(kit.root,[0,0,0]) ||
      !f?.isGroup || f.parent!==kit.root || !transformMatches(f,[item.x,0,item.z],rotation) ||
      built.top!==item.ph || built.PW!==item.w+2*item.pad || built.PD!==item.d+2*item.pad || f.userData.eastUnknownAnnexInventory ||
      kit.root.children.filter(o=>o.isGroup&&transformMatches(o,[item.x,0,item.z],rotation)).length!==1) fail('frame identity/transform/duplicate mismatch');
  const structureId=f.userData.structure?.id;
  if(structureId!==ORIGINAL_IDS[itemIndex] && (!Object.hasOwn(R62_FACADE_IDS,itemIndex)||structureId!==R62_FACADE_IDS[itemIndex]))fail('retained structure identity drift');
  if (!Array.isArray(kit.colliders)||!Array.isArray(kit.rooms)||!Array.isArray(kit.owned)||!Array.isArray(kit.walkables)||!kit._interiorMats||kit._lastFurnish!==null) fail('missing or unfinished runtime registrations');
  const matrix=new THREE.Matrix4().compose(f.position,f.quaternion,f.scale),plan=roomPlan(item,itemIndex,f);
  const expected=recordLegacyPreset(kit,plan,matrix);
  let targets,colliders,room;
  try {
    const materialKeys=new Map(Object.entries(kit._interiorMats).map(([k,v])=>[v,k]));
    for (const m of expected.meshes) if (!materialMatches(m.material,materialKeys.get(m.material),kit)) fail('material identity/render-state drift');
    targets=expected.meshes.map(ref=>{
      const matches=[];
      // Traverse only this exact frame, matching the entire original primitive
      // payload and pose. A nested duplicate fails rather than being swept up.
      f.traverse(m=>{if(m.isMesh&&transformMatches(m,ref.position.toArray())&&geometryEqual(m.geometry,ref.geometry))matches.push(m)});
      if(matches.length!==1)fail('missing/duplicate/corrupted exact primitive');
      const m=matches[0];
      if(Object.getPrototypeOf(m)!==THREE.Mesh.prototype||m.parent!==f||m.isInstancedMesh||m.children.length||m.name!==''||!equal(m.userData,{})||!m.visible||!m.castShadow||!m.receiveShadow||m.material!==ref.material||m.layers.mask!==ref.layers.mask||m.renderOrder!==ref.renderOrder||m.frustumCulled!==ref.frustumCulled||m.onBeforeRender!==ref.onBeforeRender||m.onAfterRender!==ref.onAfterRender||m.customDepthMaterial!==ref.customDepthMaterial||m.customDistanceMaterial!==ref.customDistanceMaterial||m.onBeforeShadow!==ref.onBeforeShadow||m.onAfterShadow!==ref.onAfterShadow)fail('primitive ownership/material/metadata drift');
      return m;
    });
    const geometries=new Set(targets.map(m=>m.geometry));
    if (new Set(targets).size!==targets.length||geometries.size!==targets.length)fail('primitive resource identity is not unique');
    const resources=targets.flatMap(m=>geometryResources(m.geometry)),exclusive=new Set(resources);
    if(resources.length!==exclusive.size)fail('primitive vertex/index payload is shared');
    let shared=false;
    kit.root.traverse(m=>{if(!targets.includes(m)&&geometryResources(m.geometry).some(r=>exclusive.has(r)))shared=true});
    if(shared)fail('primitive geometry borrowed by another object');
    // This helper runs before finish()/rendering. Original primitives have no
    // lifecycle observers; rejecting custom hooks prevents callback exceptions
    // or side effects from turning the later commit into partial deletion.
    if(f.remove!==THREE.Object3D.prototype.remove||targets.some(m=>hasListeners(m)||hasListeners(m.geometry)||
      m.removeFromParent!==THREE.Object3D.prototype.removeFromParent||m.dispatchEvent!==THREE.EventDispatcher.prototype.dispatchEvent||
      m.geometry.dispose!==THREE.BufferGeometry.prototype.dispose||m.geometry.dispatchEvent!==THREE.EventDispatcher.prototype.dispatchEvent))fail('custom primitive lifecycle hooks');
    colliders=expected.colliders.map(ref=>{
      const matches=kit.colliders.filter(c=>c?.isBox3&&c.equals(ref));
      if(matches.length!==1)fail('missing/duplicate/drifted exact collider');
      if(kit.walkables.some(w=>w.box===matches[0]))fail('collider borrowed as a floor support');
      return matches[0];
    });
    if(new Set(colliders).size!==colliders.length)fail('collider ownership is not unique');
    const roomMatches=kit.rooms.filter(r=>equal(r.min,expectedRoom(item,plan,matrix,r.id,expected.extra).min)&&equal(r.max,expectedRoom(item,plan,matrix,r.id,expected.extra).max));
    if(roomMatches.length!==1)fail('candidate room bounds are missing or duplicated');
    room=roomMatches[0];
    if(!Number.isInteger(room.id)||room.id!==kit.rooms.indexOf(room)||!equal(room,expectedRoom(item,plan,matrix,room.id,expected.extra)))fail('candidate room kind/doors/cover/spawns drift');
  } finally {expected.dispose()}

  // Prepare metadata and prove every write target is mutable before removing
  // anything. Damaged metadata must not turn a rejected call into partial loss.
  const previous=f.userData.structure;
  if(previous?.limitations!==undefined && (!Array.isArray(previous.limitations)||previous.limitations.some(v=>typeof v!=='string')))fail('malformed retained limitations');
  const evidence={inventoryStatus:'UNKNOWN',accepted:false,knownEmpty:false,furnishingPolicy:{...policy},
    furnitureStatus:STATUS,presetUseStatus:'UNVERIFIED',roomBoundsStatus:'NOT_VALIDATED',
    candidatePresetUse:plan.kind,legacyNavigationKindPreserved:true,removedCoverCount:room.cover.length};
  const nextStructure={...previous,...evidence,
    // Technical identity for the existing shell, not a newly asserted room or
    // historical name. Existing source-backed structure IDs always win.
    id:previous?.id??`east-six/unnamed-annex-${itemIndex}`,
    interiorStatus:'GENERIC_FURNISH_ROOM_WITHHELD_CURRENT_INVENTORY_UNKNOWN',
    inventoryBinding:policy.target,inventoryIdentityStatus:'ORIGINAL_UNNAMED_DECLARATION_NOT_CONFIRMED_HISTORICAL_ROOM',
    currentInventoryVerified:false,
    limitations:[...(previous?.limitations??[]),
      'Only exact legacy furnishRoom placeholders and their own collisions/cover are withheld; no current or historic empty-room claim.',
      'Legacy navigation kind, doors, floor and spawns remain; preset use is UNVERIFIED and room boundaries NOT_VALIDATED.']};
  const removalRecord={...policy,removedMeshes:targets.length,removedColliders:colliders.length,removedCover:evidence.removedCoverCount};
  if(!writableRecord(room,[...Object.keys(evidence),'cover'])||!writableRecord(f.userData,['structure','eastUnknownAnnexInventory'])||
    !spliceable(kit.colliders)||!spliceable(f.children)||targets.some(m=>!Object.getOwnPropertyDescriptor(m,'parent')?.writable))fail('removal transaction targets are not mutable');

  // Atomic scene/registration commit after complete validation. Geometry is
  // exclusive to removed meshes; shared kit materials are never disposed.
  for(const m of targets)m.removeFromParent();
  for(const c of colliders)kit.colliders.splice(kit.colliders.indexOf(c),1);
  Object.assign(room,evidence,{cover:[]});
  f.userData.structure=nextStructure;
  f.userData.eastUnknownAnnexInventory=removalRecord;
  for(const m of targets)m.geometry.dispose();
  return built;
}
