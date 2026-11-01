import * as THREE from 'three';

// Exact legacy declarations, not a generic furniture-removal mechanism.
const DECLARATIONS = {
  "2": {
    "kind": "hall",
    "name": "景仁宫",
    "structure": "east-residential-facade",
    "facadeProfile": "jingren-rear-entry",
    "x": -93.4,
    "z": 331,
    "w": 28.0,
    "d": 13.7,
    "pad": 0.8,
    "ph": 0.6,
    "colH": 6.72,
    "bays": 5,
    "baysSource": "https://www.dpm.org.cn/explore/building/236509.html",
    "baySpacingStatus": "equal-subdivision-provisional",
    "roof": "xieshan",
    "enter": true,
    "throne": true,
    "interior": "A:palace-front"
  },
  "9": {
    "kind": "hall",
    "name": "承乾宫",
    "x": -93.6,
    "z": 381.8,
    "w": 27.7,
    "d": 14.5,
    "pad": 0.8,
    "ph": 0.6,
    "colH": 6.72,
    "bays": 5,
    "baysSource": "https://www.dpm.org.cn/explore/building/236438.html",
    "baySpacingStatus": "equal-subdivision-provisional",
    "roof": "xieshan",
    "enter": true,
    "throne": true,
    "interior": "A:palace-front"
  },
  "16": {
    "kind": "hall",
    "name": "钟粹宫",
    "structure": "east-residential-facade",
    "facadeProfile": "zhongcui-front-veranda",
    "x": -93.4,
    "z": 433.2,
    "w": 28.6,
    "d": 15.2,
    "pad": 0.8,
    "ph": 0.6,
    "colH": 6.72,
    "bays": 5,
    "baysSource": "https://www.dpm.org.cn/explore/building/236484.html",
    "baySpacingStatus": "equal-subdivision-provisional",
    "roof": "xieshan",
    "enter": true,
    "throne": true,
    "interior": "A:palace-front"
  },
  "30": {
    "kind": "hall",
    "name": "永和宫",
    "structure": "east-residential-facade",
    "facadeProfile": "yonghe-open-baoxia",
    "x": -149,
    "z": 379.1,
    "w": 27.8,
    "d": 12,
    "pad": 0.8,
    "ph": 0.6,
    "colH": 6.72,
    "bays": 5,
    "baysSource": "https://www.dpm.org.cn/explore/building/236518.html",
    "baySpacingStatus": "equal-subdivision-provisional",
    "roof": "xieshan",
    "enter": true,
    "throne": true,
    "interior": "A:palace-front"
  },
  "37": {
    "kind": "hall",
    "name": "景阳宫",
    "x": -149.5,
    "z": 432.2,
    "w": 20.7,
    "d": 14.4,
    "pad": 0.8,
    "ph": 0.6,
    "colH": 6.72,
    "bays": 3,
    "baysSource": "https://www.dpm.org.cn/explore/building/236511.html",
    "baySpacingStatus": "equal-subdivision-provisional",
    "roof": "wudian",
    "enter": true,
    "throne": true,
    "interior": "A:palace-front"
  }
};
const IDS = {
  2: 'east-six/jingren-rear-entry',
  9: 'east-six/r48-chengqian-front',
  16: 'east-six/zhongcui-front-veranda',
  30: 'east-six/yonghe-open-baoxia',
  37: 'east-six/r48-jingyang-front',
};
const STATUS = 'UNKNOWN_INVENTORY_WITHHELD_NOT_KNOWN_EMPTY';
const fail = reason => { throw new Error(`East unknown throne: ${reason}`); };
const equal = (a, b) => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(k => Object.hasOwn(b, k) && equal(a[k], b[k]));
};

/** Validate before building, then strip only furnishingPolicy for the legacy
 * builder. A missing policy is deliberately a no-op, including other halls. */
export function validateEastUnknownThroneInventoryPolicy({ zoneId, itemIndex, item } = {}) {
  if (item?.furnishingPolicy === undefined) return null;
  const expected = DECLARATIONS[itemIndex];
  const policy = { mode: 'unknown-inventory', target: `east-six/items/${itemIndex}`, scope: 'r62-east-five-generic-thrones-only' };
  if (zoneId !== 'east-six' || !Number.isInteger(itemIndex) || !expected || !equal(item.furnishingPolicy, policy)) fail('explicit policy/target mismatch');
  const { furnishingPolicy, ...declaration } = item;
  if (!equal(declaration, expected)) fail('declaration identity/envelope drift');
  return Object.freeze(policy);
}

function identityTransform(object, position = [0, 0, 0]) {
  return object?.matrixAutoUpdate === true && equal(object.position.toArray(), position) &&
    equal(object.quaternion.toArray(), [0, 0, 0, 1]) && equal(object.scale.toArray(), [1, 1, 1]);
}
function attributeEqual(a, b) {
  return !!a && !!b && a.itemSize === b.itemSize && a.normalized === b.normalized &&
    a.array?.constructor === b.array?.constructor && a.array.length === b.array.length && a.array.every((v, i) => v === b.array[i]);
}
function legacyBox(geometry, size) {
  // Compare actual vertex/normal/UV/index payload, not just a bounding box or
  // mutable constructor parameters. Temporary validation geometry is owned here.
  const expected = new THREE.BoxGeometry(...size);
  try {
    return geometry?.type === 'BoxGeometry' && equal(geometry.parameters, expected.parameters) &&
      equal(Object.keys(geometry.attributes).sort(), Object.keys(expected.attributes).sort()) &&
      Object.keys(expected.attributes).every(k => attributeEqual(geometry.attributes[k], expected.attributes[k])) &&
      attributeEqual(geometry.index, expected.index) && equal(geometry.groups, expected.groups) &&
      equal(geometry.drawRange, expected.drawRange) && equal(geometry.morphAttributes, {}) && !geometry.morphTargetsRelative;
  } finally { expected.dispose(); }
}
function legacyMaterial(material, kind) {
  const gold = kind === 'gold';
  return material?.isMeshStandardMaterial === true && material.name === `kit_${kind}` &&
    material.color.getHex() === (gold ? 0xe2b048 : 0x7a1d12) && material.roughness === (gold ? .28 : .4) &&
    material.metalness === (gold ? .8 : .1) && material.opacity === 1 && material.transparent === false &&
    material.visible === true && material.colorWrite === true && material.depthWrite === true &&
    material.side === THREE.FrontSide && material.depthTest === true && material.alphaTest === 0 &&
    material.emissive.getHex() === 0 && material.emissiveIntensity === 1 && material.vertexColors === false &&
    ['map', 'alphaMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap', 'bumpMap', 'displacementMap', 'envMap', 'lightMap'].every(k => material[k] === null) &&
    material.wireframe === false;
}
function expectedRoom(item, index, id) {
  const n = item.bays, bay = item.w / n, x0 = -item.w / 2 + .35, x1 = -item.w / 2 + n * bay - .35;
  const inset = index === 16 ? 2 : 0, doorX = -item.w / 2 + (Math.floor((n - 1) / 2) + .5) * bay;
  const pt = (x, z) => ({ x: +(item.x + x).toFixed(2), z: +(item.z + z).toFixed(2) });
  const beamH = THREE.MathUtils.clamp(item.colH * .12, .45, .85);
  return { id, name: item.name, kind: 'throne',
    min: { x: item.x + x0, y: item.ph, z: item.z + (-item.d / 2 + inset) },
    max: { x: item.x + x1, y: item.ph + (item.colH - beamH), z: item.z + item.d / 2 },
    floorY: item.ph,
    doors: [pt(doorX, -item.d / 2 + inset), ...(index === 2 ? [pt(doorX, item.d / 2)] : [])],
    cover: [], spawns: [pt((x0 + x1) / 2, inset / 2)],
  };
}

/** Withhold four known unverified primitives and their one exact world box.
 * Validate the entire removal set, ownership, registration and declaration
 * before changing anything. No other mesh, collider or navigation field is
 * selected by overlap, broad bounding-box predicates, names, or material alone.
 * Run after dedicated hall/nameboard assembly and before kit.finish(). */
export function applyEastUnknownThroneInventory(kit, context, built) {
  const policy = validateEastUnknownThroneInventoryPolicy(context);
  if (!policy) return built;
  const { itemIndex: index, item } = context, f = built?.f;
  if (!kit?.root?.isGroup || kit.root.name !== 'east-six' || kit.root.parent !== null || !identityTransform(kit.root) ||
    !f?.isGroup || f.parent !== kit.root || !identityTransform(f, [item.x, 0, item.z]) ||
    built.top !== item.ph || built.PW !== item.w + 2 * item.pad || built.PD !== item.d + 2 * item.pad ||
    f.userData.structure?.id !== IDS[index] || f.userData.eastUnknownThroneInventory ||
    kit.root.children.filter(o => o.userData.structure?.id === IDS[index]).length !== 1) fail('frame identity/transform/duplicate mismatch');
  if (!Array.isArray(kit.colliders) || !Array.isArray(kit.rooms)) fail('missing runtime registrations');
  const tz = item.d / 2 - (index === 2 ? Math.min(3.4, item.d * .36) : Math.min(2.6, item.d * .3));
  const tw = Math.min(item.w / item.bays * 1.4, 5), y = item.ph;
  const specs = [
    { part: 'platform', size: [tw, .5, 2.4], position: [0, y + .25, tz], kind: 'lacquer' },
    { part: 'seat', size: [1.4, .6, 1], position: [0, y + .8, tz], kind: 'gold' },
    { part: 'back', size: [1.5, 1.2, .2], position: [0, y + 1.6, tz + .5], kind: 'gold' },
    { part: 'screen', size: [tw * .8, 2.6, .25], position: [0, y + 1.8, tz + 1.15], kind: 'gold' },
  ];
  const targets = [];
  f.traverse(m => { if (m.userData.role === 'retained-throne-component') targets.push(m); });
  if (targets.length !== 4) fail('requires exactly four declared generic components');
  for (const s of specs) {
    const matches = targets.filter(m => m.userData.thronePart === s.part);
    if (matches.length !== 1) fail('duplicate/missing component identity');
    const m = matches[0];
    if (!m.isMesh || m.isInstancedMesh || m.parent !== f || m.children.length ||
      !equal(m.userData, { role: 'retained-throne-component', thronePart: s.part }) ||
      !identityTransform(m, s.position) || !m.visible || !m.castShadow || !m.receiveShadow ||
      m.material !== kit[s.kind] || !legacyMaterial(m.material, s.kind) || !legacyBox(m.geometry, s.size)) fail(`non-legacy material/shape/transform: ${s.part}`);
    if (f.children.some(other => other !== m && other.isMesh && identityTransform(other, s.position) && legacyBox(other.geometry, s.size))) fail('duplicate untagged generic component shape');
  }
  const geometries = new Set(targets.map(m => m.geometry));
  if (geometries.size !== 4) fail('component geometry is not exclusively allocated');
  let shared = false;
  kit.root.traverse(m => { if (!targets.includes(m) && geometries.has(m.geometry)) shared = true; });
  if (shared) fail('component geometry is borrowed by another object');
  const collider = new THREE.Box3(new THREE.Vector3(-tw / 2, y, tz - 1.2), new THREE.Vector3(tw / 2, y + 3, tz + 1.3));
  collider.translate(new THREE.Vector3(item.x, 0, item.z));
  const colliderMatches = kit.colliders.filter(c => c?.isBox3 && c.equals(collider));
  if (colliderMatches.length !== 1) fail('missing/duplicate/drifted exact world collider');
  const rooms = kit.rooms.filter(r => r.name === item.name);
  if (rooms.length !== 1 || !Number.isInteger(rooms[0].id) || rooms[0].id !== kit.rooms.indexOf(rooms[0]) ||
    !equal(rooms[0], expectedRoom(item, index, rooms[0].id))) fail('candidate room identity/bounds/doors drift');

  // Validation complete. Preserve legacy navigation kind and all navigation
  // coordinates; attach evidence semantics without declaring a historical void.
  const evidence = { inventoryStatus: 'UNKNOWN', accepted: false, knownEmpty: false,
    furnishingPolicy: { ...policy }, furnitureStatus: STATUS,
    candidateRoomUse: 'throne', roomUseStatus: 'UNVERIFIED', roomBoundaryStatus: 'UNVERIFIED', legacyNavigationKindPreserved: true };
  for (const m of targets) m.removeFromParent();
  kit.colliders.splice(kit.colliders.indexOf(colliderMatches[0]), 1);
  for (const g of geometries) g.dispose(); // Never dispose borrowed kit materials.
  Object.assign(rooms[0], evidence);
  const previous = f.userData.structure;
  f.userData.structure = { ...previous, ...evidence,
    currentInventoryVerified: false, furniturePolicy: STATUS, seatPlacementStatus: 'NOT_ASSERTED_UNKNOWN_INVENTORY',
    retainedUnverified: previous.retainedUnverified?.filter(s => s !== 'furnishings'),
    limitations: [...(previous.limitations ?? []).filter(s => s !== 'Unspecified pre-existing furnishings are retained as unverified placeholders.'),
      'Unverified generic throne primitives withheld; current inventory is UNKNOWN, not a known-empty or historical empty room.',
      'Retained room kind and bounds support navigation only; candidate use and boundaries remain UNVERIFIED.'],
  };
  f.userData.eastUnknownThroneInventory = { ...policy, removedMeshes: 4, removedColliders: 1 };
  if (built.p) built.p = { ...built.p, ...evidence, furniturePolicy: STATUS, seatPlacementStatus: 'NOT_ASSERTED_UNKNOWN_INVENTORY' };
  return built;
}
