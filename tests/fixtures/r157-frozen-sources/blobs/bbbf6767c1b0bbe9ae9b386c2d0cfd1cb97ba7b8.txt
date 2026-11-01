import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Conservative, rotation-independent LOCAL bounds, in model metres. The origin
 * is the ground plane under the main rotor, +Z is forward, +Y is up, and -X is
 * pilot right (matching the tour's north/east convention). These are fictional
 * vehicle dimensions, not surveyed aviation data or permission to fly/land.
 *
 * min/max include the complete main- and tail-rotor swept volumes, not just the
 * parked blade positions. horizontalRadius includes the tail rotor too: do not
 * use rotorRadius alone as a whole-aircraft collision radius. bodyY intentionally
 * covers ALL geometry, including the mast/rotor. groundClearance=0 refers to the
 * skid contact plane; the underside of the cabin is approximately 0.55 m above it.
 * For a pitched/rolled vehicle, transform this local box before collision tests.
 */
export const HELICOPTER_MODEL_BOUNDS = Object.freeze({
  min: Object.freeze([-5, 0, -5.6]),
  max: Object.freeze([5, 3.6, 5]),
  bodyY: Object.freeze([0, 3.6]),
  rotorRadius: 5,
  tailRotorRadius: 0.7,
  horizontalRadius: 5.6,
  groundClearance: 0,
});

const TAU = Math.PI * 2;
const UP = new THREE.Vector3(0, 1, 0);

/**
 * Build a lightweight, generic civilian helicopter for the virtual tour.
 * No textures, brands, weapons, external assets, lights, or global resources.
 *
 * Returns { group, mainRotor, tailRotor, cockpitAnchor, exitOffsets, bounds,
 * update, dispose }. Anchors are local THREE.Vector3 values. Exit offsets are
 * ground-level walker positions, not eye positions; the caller must check ground
 * support, collision, and stopped rotors before exiting. The camera belongs to
 * the controller. All four materials and eight merged geometries are owned here.
 *
 * Opaque FrontSide glazing gives the outside a dark reflective canopy while its
 * inward back faces are culled. The pilot can see through it without a second
 * render pass or hiding the aircraft; solid side frames/dashboard remain visible.
 */
export function createHelicopterModel() {
  const group = new THREE.Group();
  group.name = 'virtual-tour-helicopter';
  group.userData.forwardAxis = '+Z';
  group.userData.rightAxis = '-X';
  group.userData.description = 'Fictional civilian transport for a virtual tour; not historical reconstruction or real-world flight/landing permission.';

  const materials = {
    body: new THREE.MeshStandardMaterial({ color: 0xe8ece9, roughness: 0.48, metalness: 0.18 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x183543, roughness: 0.2, metalness: 0.25 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x283038, roughness: 0.52, metalness: 0.45 }),
    accent: new THREE.MeshStandardMaterial({ color: 0xc94036, roughness: 0.5, metalness: 0.1 }),
  };
  for (const [key, material] of Object.entries(materials)) material.name = `helicopter-${key}`;
  const ownedGeometries = new Set();
  const bodyParts = { body: [], glass: [], metal: [], accent: [] };

  // All primitive solids are closed. Bake the transforms and merge by material
  // before rendering: four stationary draw calls and two per rotating assembly.
  function add(parts, material, geometry, position = [0, 0, 0], scale = [1, 1, 1], quaternion = new THREE.Quaternion()) {
    const baked = geometry.index ? geometry.toNonIndexed() : geometry;
    if (baked !== geometry) geometry.dispose();
    const matrix = new THREE.Matrix4().compose(new THREE.Vector3(...position), quaternion, new THREE.Vector3(...scale));
    baked.applyMatrix4(matrix);
    parts[material].push(baked);
  }

  function ellipsoid(material, position, scale, width = 12, height = 8) {
    add(bodyParts, material, new THREE.SphereGeometry(1, width, height), position, scale);
  }

  function box(parts, material, size, position, rotationX = 0) {
    const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), rotationX);
    add(parts, material, new THREE.BoxGeometry(...size), position, [1, 1, 1], quaternion);
  }

  function tube(parts, material, from, to, radius, endRadius = radius, segments = 6) {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, direction.clone().normalize());
    add(parts, material, new THREE.CylinderGeometry(endRadius, radius, direction.length(), segments, 1, false), start.add(end).multiplyScalar(0.5).toArray(), [1, 1, 1], quaternion);
  }

  function finish(parts, target, prefix) {
    for (const [key, geometries] of Object.entries(parts)) {
      if (!geometries.length) continue;
      const geometry = mergeGeometries(geometries, false);
      for (const source of geometries) source.dispose();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      ownedGeometries.add(geometry);
      const mesh = new THREE.Mesh(geometry, materials[key]);
      mesh.name = `${prefix}-${key}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      target.add(mesh);
    }
  }

  // Rounded lower hull, rear cabin, dark forward canopy and compact engine pod.
  ellipsoid('body', [0, 1.23, 0.02], [1.13, 0.68, 1.95], 16, 8);
  ellipsoid('body', [0, 1.9, -0.75], [1.03, 0.7, 1.15]);
  ellipsoid('glass', [0, 1.85, 0.78], [1.1, 0.83, 1.52], 16, 10);
  ellipsoid('body', [0, 2.5, -0.5], [0.65, 0.4, 1.1], 12, 6);
  for (const side of [-1, 1]) {
    ellipsoid('glass', [side * 1.015, 1.98, -0.7], [0.055, 0.32, 0.58], 10, 6);
    box(bodyParts, 'accent', [0.05, 0.13, 1.9], [side * 1.08, 1.34, -0.28]);
    tube(bodyParts, 'metal', [side * 0.4, 2.57, -1.18], [side * 0.4, 2.61, -1.58], 0.12);
  }

  // Tapered tail boom, swept fin and stabilizer, with a simple red fin marking.
  tube(bodyParts, 'body', [0, 1.9, -1.1], [0, 2.25, -4.7], 0.43, 0.13, 8);
  box(bodyParts, 'body', [0.12, 0.86, 0.55], [0, 2.78, -4.65], -0.3);
  box(bodyParts, 'accent', [0.13, 0.16, 0.55], [0, 3.08, -4.74], -0.3);
  box(bodyParts, 'body', [1.3, 0.08, 0.4], [0, 2.28, -3.95]);
  tube(bodyParts, 'metal', [0.12, 2.4, -4.85], [-0.3, 2.4, -4.85], 0.07);

  // Skid centres are 0.08 m high with 0.08 m radius: exact base y=0.
  for (const side of [-1, 1]) {
    const x = side * 1.25;
    tube(bodyParts, 'metal', [x, 0.08, -1.55], [x, 0.08, 1.55], 0.08, 0.08, 8);
    // Slightly overlap the closed bends, avoiding coincident cap edges.
    tube(bodyParts, 'metal', [x, 0.08, 1.53], [x, 0.3, 1.85], 0.08, 0.08, 8);
    tube(bodyParts, 'metal', [x, 0.08, -1.53], [x, 0.2, -1.78], 0.08, 0.08, 8);
    for (const z of [-0.9, 0.9]) tube(bodyParts, 'metal', [side * 0.8, 0.98, z], [x, 0.18, z], 0.055);
  }

  // A clear central windscreen, two narrow pillars and a low cockpit coaming.
  for (const side of [-1, 1]) {
    tube(bodyParts, 'body', [side * 0.67, 2.5, 1.12], [side * 0.93, 1.55, 1.6], 0.045);
    tube(bodyParts, 'body', [side * 0.93, 1.55, 1.6], [side * 1.0, 1.55, 0.05], 0.04);
    box(bodyParts, 'metal', [0.48, 0.62, 0.42], [side * 0.48, 1.47, 0.02]);
  }
  tube(bodyParts, 'body', [-0.67, 2.5, 1.12], [0.67, 2.5, 1.12], 0.045);
  box(bodyParts, 'metal', [1.5, 0.2, 0.45], [0, 1.51, 1.47], 0.12);
  tube(bodyParts, 'metal', [0, 2.79, 0], [0, 3.45, 0], 0.085, 0.085, 8);
  finish(bodyParts, group, 'helicopter');

  const mainRotor = new THREE.Group();
  mainRotor.name = 'helicopter-main-rotor';
  mainRotor.position.set(0, 3.45, 0);
  const mainParts = { metal: [], accent: [] };
  // Tip corner radius is < 5 m at every angle; there is no large alpha disc.
  box(mainParts, 'metal', [9.5, 0.055, 0.22], [0, 0, 0]);
  box(mainParts, 'metal', [0.22, 0.055, 9.5], [0, 0, 0]);
  for (const side of [-1, 1]) {
    box(mainParts, 'accent', [0.2, 0.06, 0.22], [side * 4.85, 0, 0]);
    box(mainParts, 'accent', [0.22, 0.06, 0.2], [0, 0, side * 4.85]);
  }
  add(mainParts, 'metal', new THREE.CylinderGeometry(0.19, 0.23, 0.18, 8), [0, 0, 0]);
  finish(mainParts, mainRotor, 'helicopter-main-rotor');
  group.add(mainRotor);

  const tailRotor = new THREE.Group();
  tailRotor.name = 'helicopter-tail-rotor';
  tailRotor.position.set(-0.3, 2.4, -4.85);
  const tailParts = { metal: [], accent: [] };
  box(tailParts, 'metal', [0.045, 1.2, 0.1], [0, 0, 0]);
  box(tailParts, 'metal', [0.045, 0.1, 1.2], [0, 0, 0]);
  for (const side of [-1, 1]) {
    box(tailParts, 'accent', [0.05, 0.07, 0.1], [0, side * 0.635, 0]);
    box(tailParts, 'accent', [0.05, 0.1, 0.07], [0, 0, side * 0.635]);
  }
  finish(tailParts, tailRotor, 'helicopter-tail-rotor');
  group.add(tailRotor);

  let disposed = false;
  return {
    group,
    mainRotor,
    tailRotor,
    cockpitAnchor: new THREE.Vector3(0, 2, 1.2),
    exitOffsets: [new THREE.Vector3(-2.1, 0, 0.4), new THREE.Vector3(2.1, 0, 0.4)],
    bounds: HELICOPTER_MODEL_BOUNDS,
    // This is visual animation only. Caller owns flight physics/spool state.
    // Bound a resumed-tab delta to 0.1 s; wrapped angles never grow unbounded.
    update(dt, normalizedRPM = 0) {
      if (disposed || !Number.isFinite(dt) || dt <= 0 || !Number.isFinite(normalizedRPM)) return;
      const speed = Math.min(1, Math.max(0, normalizedRPM));
      const elapsed = Math.min(dt, 0.1);
      mainRotor.rotation.y = (mainRotor.rotation.y + elapsed * speed * 40) % TAU;
      tailRotor.rotation.x = (tailRotor.rotation.x + elapsed * speed * 132) % TAU;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      for (const geometry of ownedGeometries) geometry.dispose();
      for (const material of Object.values(materials)) material.dispose();
    },
  };
}
