import * as THREE from 'three';
import { mergeByMaterial } from '../../../utils/MergeUtils.js';
import { YANXI_RUIN_PROFILE as P } from './YanxiRuin.js';

// At 120 m, a 0.1 m iron member is less than one pixel high in the 720p/FOV70
// budget camera. Keep the full ruin at 100 m overhead and on all ground visits.
// Only visual geometry switches; the original builder owns every collider.
export const YANXI_RUIN_LOD = Object.freeze({ distance: 120, hysteresis: .1, farTriangleCap: 1200 });
const equalY = (a, b) => Math.abs(a - b) < 1e-6;
const retained = new Set(['yanxi-dry-pool-floor', 'yanxi-pool-retaining-wall', 'yanxi-pool-stone-coping',
  'yanxi-lower-platform', 'yanxi-central-surviving-cap', 'yanxi-central-cap-finial', 'yanxi-corner-sheet-remnant']);
const ribbon = mesh => new THREE.PlaneGeometry(mesh.geometry.parameters.width, mesh.geometry.parameters.height);
function openPost(mesh) {
  const geometry = mesh.geometry.clone();
  const indices = geometry.index ? [...geometry.index.array] : Array.from({length:geometry.attributes.position.count},(_,i)=>i);
  // BoxGeometry's top/bottom faces are hidden inside the retained horizontal
  // frame bands. Four full-width side faces preserve all viewing directions.
  geometry.setIndex([...indices.slice(0, 12), ...indices.slice(24)]);
  geometry.clearGroups();
  return geometry;
}
function stairRamp() {
  const front = -P.core.d / 2, toe = -P.pool.d / 2 + .35, low = P.pool.bottomY;
  const points = [[-1.55,low,toe],[1.55,low,toe],[1.55,low,front],[-1.55,low,front],
    [-1.55,P.body.floorY/5,toe],[1.55,P.body.floorY/5,toe],[1.55,P.body.floorY,front],[-1.55,P.body.floorY,front]];
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
  geometry.setIndex([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5]);
  geometry.computeVertexNormals();
  return geometry;
}

/** Capture before merge destroys source roles. No registration or physics writes. */
export function captureYanxiRuinFar(frame, ownedMaterials) {
  const root = new THREE.Group(), materials = new Map(), counts = {};
  root.name = 'yanxi-ruin-far';
  frame.updateMatrixWorld(true);
  const inverse = frame.matrixWorld.clone().invert();
  let stairAdded = false;
  frame.traverse(mesh => {
    if (!mesh.isMesh) return;
    const role = mesh.userData.role, p = mesh.geometry.parameters;
    let geometry, localTransform = true;
    if (retained.has(role)) geometry = mesh.geometry.clone();
    else if (role === 'yanxi-masonry-arch-wall') {
      // Real door/window holes survive. These distant two-sided silhouettes
      // omit subpixel intrados depth and reduce each arch to two straight spans.
      geometry = new THREE.ShapeGeometry(p.shapes, 1);
    } else if (role === 'yanxi-pavilion-frame-post' || role === 'yanxi-central-iron-post') geometry = openPost(mesh);
    else if (role === 'yanxi-pavilion-ring') {
      const q = P.cornerPavilions.find(q => q.id === mesh.parent.userData.pavilionId);
      if (q && (equalY(mesh.position.y, q.upperBaseY) || equalY(mesh.position.y, q.upperTopY))) geometry = ribbon(mesh);
    } else if (role === 'yanxi-central-ring') {
      const c = P.centralPavilion;
      if ([c.baseY,c.lowerTopY,c.upperBaseY,c.upperTopY].some(y => equalY(mesh.position.y,y))) geometry = ribbon(mesh);
    } else if (role === 'yanxi-central-balcony-edge') {
      if (equalY(mesh.position.y, P.centralPavilion.lowerTopY + .18)) geometry = ribbon(mesh);
    } else if (['yanxi-corner-crown-rib','yanxi-exposed-beam','yanxi-front-stair-cheek'].includes(role)) geometry = ribbon(mesh);
    else if (role === 'yanxi-safety-rail' && equalY(mesh.position.y, P.pool.guardTopY)) geometry = ribbon(mesh);
    else if (role === 'yanxi-safety-post' && mesh === mesh.parent.children.find(o => o.userData.role === role)) geometry = mesh.geometry.clone();
    else if (role === 'yanxi-protected-front-stair' && !stairAdded) {
      geometry = stairRamp(); localTransform = false; stairAdded = true;
    }
    if (!geometry) return;
    if (localTransform) geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld));
    if (!materials.has(mesh.material)) {
      const material = mesh.material.clone(); material.name = `${mesh.material.name}_far`; material.side = THREE.DoubleSide;
      materials.set(mesh.material,material); ownedMaterials.push(material);
    }
    const copy = new THREE.Mesh(geometry,materials.get(mesh.material));
    copy.name = role; copy.userData = { ...mesh.userData }; copy.castShadow = mesh.castShadow; copy.receiveShadow = mesh.receiveShadow;
    root.add(copy);
    const count = (geometry.index?.count ?? geometry.attributes.position.count) / 3;
    counts[role] = (counts[role] ?? 0) + count;
  });
  root.userData.silhouette = {
    pavilions: [...P.cornerPavilions.map(q => ({ id:q.id,sides:q.sides,remnant:q.remnant })),{ id:'central',sides:8 }],
    centralTiers: 2, water: false, roles: counts,
    triangleInstances: Object.values(counts).reduce((a,b) => a+b,0),
    omittedDetails: 'collars, string courses, lower frame infill, tiny crown trim; distant stair treads become a ramp',
    materialPolicy: 'Owned double-sided distant silhouettes; exact original near materials remain unchanged.',
  };
  return root;
}

/** A parent noMerge tag cannot protect descendants from MergeUtils.traverse. */
export function detachYanxiRuinFrames(root) {
  const frames = root.children.filter(child => child.userData.structure?.id === P.id);
  for (const frame of frames) frame.removeFromParent();
  return frames;
}

/** Call only after CourtKit.finish, so near/far never flatten into one mesh. */
export function installYanxiRuinLODs(root, frames, ownedMaterials) {
  const lods = [];
  for (const frame of frames) {
    const farRaw = captureYanxiRuinFar(frame,ownedMaterials);
    const near = mergeByMaterial(frame,{ name:'yanxi-ruin-near' });
    const far = mergeByMaterial(farRaw,{ name:'yanxi-ruin-far' });
    const lod = new THREE.LOD(); lod.name = 'yanxi-ruin-distance-detail';
    lod.position.copy(frame.position); lod.quaternion.copy(frame.quaternion); lod.scale.copy(frame.scale);
    near.position.set(0,0,0); near.quaternion.identity(); near.scale.set(1,1,1);
    lod.addLevel(near,0); lod.addLevel(far,YANXI_RUIN_LOD.distance,YANXI_RUIN_LOD.hysteresis); far.visible = false;
    lod.userData = { profileId:P.profileId, navigation:'EXACT_NEAR_COLLISION_AT_ALL_DISTANCES',
      nearTriangles:frame.userData.structure.roleBudget.triangleInstances, farTriangles:far.userData.silhouette.triangleInstances };
    root.add(lod); root.userData.architecture.push(structuredClone(frame.userData.structure)); lods.push(lod);
  }
  return lods;
}
