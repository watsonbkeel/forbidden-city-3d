import * as THREE from 'three';
import { applyBoxUV } from '../../../utils/GeometryUV.js';
import { gateRailFacade } from '../gateRailFacade.js';
import { WUMEN_ASCENT_PROFILE, wumenAscentGeometry } from './WumenAscentProfile.js';

/** Builds only Wumen's ascent and retained platform edge/support. The parent
 * already builds its solid slab, doorways and towers. Normal builder ownership,
 * shared library materials and exact world translations are retained.
 */
export function buildWumenAscent(builder, parent, profile = WUMEN_ASCENT_PROFILE) {
  const group = new THREE.Group(); group.name = 'wumen-folded-ascent'; parent.add(group);
  const geometry = wumenAscentGeometry(profile), f = profile.fit, retained = profile.retained;
  const beforeC = builder.colliders.length, beforeW = builder.walkables.length;
  const lib = builder.library;
  const brick = lib.material('wall_brick'), brickTile = lib.tileSize('wall_brick');
  const add = (geo, material, name) => {
    const mesh = new THREE.Mesh(geo, material); mesh.name = name;
    mesh.castShadow = mesh.receiveShadow = true; group.add(mesh); return mesh;
  };
  const box = (bounds, y0, y1, material = 'wall_brick', name = '') => {
    const mesh = builder.libBox(group, material, bounds.maxX - bounds.minX, y1 - y0, bounds.maxZ - bounds.minZ,
      (bounds.minX + bounds.maxX) / 2, (y0 + y1) / 2, (bounds.minZ + bounds.maxZ) / 2);
    mesh.name = name; return mesh;
  };
  const col = (bounds, y0, y1) => builder.col(bounds.minX, y0, bounds.minZ, bounds.maxX, y1, bounds.maxZ);
  const supportBox = (bounds, y) => builder.walkables.push({ type: 'box', rescue: false, box: new THREE.Box3(
    new THREE.Vector3(bounds.minX + builder.ox, y, bounds.minZ + builder.oz),
    new THREE.Vector3(bounds.maxX + builder.ox, y, bounds.maxZ + builder.oz)) });
  const height = (flight, a) => flight.y0 + (flight.y1 - flight.y0) * (a - flight.a0) / (flight.a1 - flight.a0);
  const slice = (bounds, axis, a0, a1) => ({ ...bounds,
    ...(axis === 'x' ? { minX: Math.min(a0, a1), maxX: Math.max(a0, a1) } : { minZ: Math.min(a0, a1), maxZ: Math.max(a0, a1) }) });
  const eachSlice = (bounds, axis, a0, a1, maximum, callback) => {
    const n = Math.ceil(Math.abs(a1 - a0) / maximum);
    for (let i = 0; i < n; i++) {
      const a = a0 + (a1 - a0) * i / n, b = a0 + (a1 - a0) * (i + 1) / n;
      callback(slice(bounds, axis, a, b), a, b);
    }
  };
  const wedge = (bounds, axis, bottom, top, name) => {
    const geo = new THREE.BoxGeometry(bounds.maxX - bounds.minX, 1, bounds.maxZ - bounds.minZ);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + (bounds.minX + bounds.maxX) / 2, z = p.getZ(i) + (bounds.minZ + bounds.maxZ) / 2;
      const a = axis === 'x' ? x : z;
      p.setXYZ(i, x, p.getY(i) > 0 ? top(a) : bottom(a), z);
    }
    geo.computeVertexNormals();
    return add(applyBoxUV(geo, brickTile), brick, name);
  };
  // Most proxies follow visible masonry plus finite AABB endpoint
  // conservatism. Only the four disclosed wall-adjacent boundary types use
  // the inherited +1.5 m virtual no-vault policy; no support is added.
  const barrier = (bounds, axis, a0, a1, top, name, noVault = false) => {
    wedge(bounds, axis, () => 0, top, name);
    eachSlice(bounds, axis, a0, a1, f.barrierSlice, (b, a, c) => col(b, 0, Math.max(top(a), top(c)) + (noVault ? profile.gameplaySafety.noVaultExtension : 0)));
  };
  const flatBarrier = (bounds, floor, name, noVault = false) => { box(bounds, 0, floor + f.parapetHeight, 'wall_brick', name); col(bounds, 0, floor + f.parapetHeight + (noVault ? profile.gameplaySafety.noVaultExtension : 0)); };
  for (const side of geometry.sides) {
    const s = side.sign;
    const rect = (x0, x1, z0, z1) => ({ minX: Math.min(s * x0, s * x1), maxX: Math.max(s * x0, s * x1), minZ: z0, maxZ: z1 });
    const [first, middle, upper] = side.flights;
    for (const flight of side.flights) {
      const support = { ...flight };
      if (flight.axis === 'z') { support.minX += f.parapetThickness; support.maxX -= f.parapetThickness; }
      else if (flight === middle) support.maxZ -= f.parapetThickness;
      else support.minZ += f.parapetThickness;
      const base = flight === upper ? retained.southWallTop - .3 : 0;
      wedge(flight, flight.axis, () => base, a => Math.max(base + .015, height(flight, a) - .12), `${flight.id}-body`);
      const n = Math.max(4, Math.round((flight.y1 - flight.y0) / f.targetRiser));
      for (let i = 0; i < n; i++) {
        const a = flight.a0 + (flight.a1 - flight.a0) * i / n, b = flight.a0 + (flight.a1 - flight.a0) * (i + 1) / n;
        const top = flight.y0 + (flight.y1 - flight.y0) * (i + 1) / n;
        box(slice(support, flight.axis, a, b), top - f.treadThickness, top, 'stone_slab', `${flight.id}-tread-${i}`);
      }
      eachSlice(flight, flight.axis, flight.a0, flight.a1, f.bodySlice, (b, a, c) => {
        const top = Math.min(height(flight, a), height(flight, c)) - .05;
        if (top > .3) col(b, 0, top);
      });
      // Never use legacy gateAscent.toWorld: it assumes X endpoints even for Z.
      builder.walkables.push({ type: 'ramp', axis: flight.axis,
        minX: support.minX + builder.ox, maxX: support.maxX + builder.ox,
        minZ: support.minZ + builder.oz, maxZ: support.maxZ + builder.oz,
        a0: flight.a0 + (flight.axis === 'x' ? builder.ox : builder.oz),
        a1: flight.a1 + (flight.axis === 'x' ? builder.ox : builder.oz), y0: flight.y0, y1: flight.y1 });
    }
    for (const landing of side.landings) {
      box(landing, 0, landing.y - .12, 'wall_brick', `${landing.id}-body`);
      box(landing, landing.y - .12, landing.y, 'stone_slab', `${landing.id}-surface`);
      col(landing, 0, landing.y - .05); supportBox(landing, landing.y);
    }
    // North approach sides; the south end opens onto the inner turn landing.
    for (const [x0, x1] of [[60, 60.45], [65.75, 66.2]]) barrier(rect(x0, x1, 9.85, 25.15), 'z', 25.15, 9.85, z => height(first, z) + f.parapetHeight, `${first.id}-side-${x0}`);
    barrier(rect(66.2, 91.7, 9.4, 9.85), 'x', s * 66.2, s * 91.7, x => height(middle, x) + f.parapetHeight, `${middle.id}-north-wall`);
    barrier(rect(66.2, 91.7, 3.2, 3.65), 'x', s * 66.2, s * 91.7, x => height(upper, x) + f.parapetHeight, `${side.name}-central-retaining-wall`);
    barrier(rect(66.2, 91.7, -3, -2.55), 'x', s * 66.2, s * 91.7, x => height(upper, x) + f.parapetHeight, `${upper.id}-south-wall`, true);
    flatBarrier(rect(60, 60.45, 3.65, 9.85), 3.3, `${side.name}-inner-west-wall`);
    flatBarrier(rect(60, 66.2, 3.2, 3.65), 12.3, `${side.name}-terminal-divider`);
    flatBarrier(rect(60, 66.2, -3, -2.55), 12.3, `${side.name}-terminal-south-wall`, true);
    flatBarrier(rect(97.45, 97.9, -3, 9.85), 10, `${side.name}-outer-end-wall`, true);
    flatBarrier(rect(91.7, 97.9, -3, -2.55), 10, `${side.name}-outer-south-wall`, true);
    flatBarrier(rect(91.7, 97.9, 9.4, 9.85), 10, `${side.name}-outer-north-wall`);
  }
  // New low north approaches run beside the retained 12 m solid abutment.
  // Its original ground-only proxies stop at y3; close only these exposed
  // side faces so a jump cannot enter visibly solid masonry. The host body is
  // rendered by PalaceBuilder, and the real upper return opening stays clear.
  for (const s of [-1, 1]) builder.col(s * 59.55, 0, 3.2, s * 60, 12, retained.platformNorth);
  supportBox({ minX: -60, maxX: 60, minZ: retained.platformSouth, maxZ: retained.platformNorth }, retained.platformTop);
  // Retain the previous upper-terrace rails and their existing gameplay safety
  // proxies. Only the two side openings move to the actual return-flight band.
  const railMat = lib.material('balustrade', { alphaTest: .5, side: THREE.DoubleSide });
  const rail = (x0, z0, x1, z1) => {
    if (Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0)) < .3) return;
    const geo = applyBoxUV(new THREE.BoxGeometry(Math.max(Math.abs(x1 - x0), .2), 1.2, Math.max(Math.abs(z1 - z0), .2)), lib.tileSize('balustrade'));
    gateRailFacade(geo, true);
    const mesh = add(geo, railMat, 'retained-platform-rail');
    mesh.position.set((x0 + x1) / 2, retained.platformTop + .6, (z0 + z1) / 2);
    builder.col(Math.min(x0, x1) - .1, retained.platformTop + .2, Math.min(z0, z1) - .1,
      Math.max(x0, x1) + .1, retained.platformTop + 4.2, Math.max(z0, z1) + .1);
  };
  rail(-59.7, -13, 59.7, -13); rail(-59.7, 18.3, 59.7, 18.3);
  for (const s of [-1, 1]) { rail(s * 59.7, -13, s * 59.7, -3); rail(s * 59.7, 3.2, s * 59.7, 18.3); }
  const counts = { meshes: 0, triangles: 0, colliders: builder.colliders.length - beforeC, walkables: builder.walkables.length - beforeW };
  group.traverse(o => { if (o.isMesh) { counts.meshes++; counts.triangles += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3; } });
  group.userData.structure = { id: profile.id, status: profile.status, counts, wallInterface: profile.wallInterface, gameplaySafety: profile.gameplaySafety };
  return { group, geometry, counts };
}
