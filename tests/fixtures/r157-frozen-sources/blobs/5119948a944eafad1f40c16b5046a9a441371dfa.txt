import { WUMEN_ASCENT_PROFILE as P } from './WumenAscentProfile.js';

function ceilFloat32(value) {
  const floats = new Float32Array([value]);
  if (floats[0] < value) { const bits = new Uint32Array(floats.buffer); bits[0] += floats[0] >= 0 ? 1 : -1; }
  return floats[0];
}

/** Remove only the south-wall top hidden by the existing outer-fold paving.
 * The paving and wall both end at y=10; keeping both upward faces causes
 * camera-dependent depth ties. This removes an internal face of their union,
 * without lowering the solid wall, raising the floor or changing physics.
 * All other faces retain their exact vertex/normal/UV bytes. The remaining
 * top uses the original affine UV registration, including at newly cut edges.
 */
export function fitWumenLandingWallTop(wallBody, side) {
  const requireFit = (ok, reason) => { if (!ok) throw new Error(`Wumen landing wall top: ${reason}`); };
  requireFit(side === -1 || side === 1, 'side must be -1 or +1');
  requireFit(wallBody?.isMesh && !wallBody.isInstancedMesh && !Array.isArray(wallBody.material)
    && wallBody.children.length === 0, 'expected a fresh plain wall-body mesh');
  requireFit(wallBody.quaternion.x === 0 && wallBody.quaternion.y === 0 && wallBody.quaternion.z === 0
    && wallBody.quaternion.w === 1 && wallBody.scale.x === 1 && wallBody.scale.y === 1 && wallBody.scale.z === 1,
  'expected a translated, unrotated wall body');
  const geometry = wallBody.geometry, attrs = geometry.attributes;
  requireFit(!geometry.index && Object.keys(attrs).sort().join(',') === 'normal,position,uv', 'expected non-indexed position/normal/UV geometry');
  const { position, normal, uv } = attrs;
  requireFit(position.itemSize === 3 && normal.itemSize === 3 && uv.itemSize === 2
    && [position, normal, uv].every(a => a.count === 36 && !a.isInterleavedBufferAttribute
      && a.array instanceof Float32Array && a.array.every(Number.isFinite)), 'expected one finite six-face box');
  const top = [];
  for (let i = 0; i < position.count; i++) if (normal.getY(i) === 1) top.push(i);
  requireFit(top.join(',') === '12,13,14,15,16,17', 'unexpected box top topology');
  const x0 = Math.min(...top.map(i => position.getX(i))), x1 = Math.max(...top.map(i => position.getX(i)));
  const z0 = Math.min(...top.map(i => position.getZ(i))), z1 = Math.max(...top.map(i => position.getZ(i)));
  const y = position.getY(top[0]);
  requireFit(top.every(i => position.getY(i) === y && normal.getX(i) === 0 && normal.getZ(i) === 0
    && [x0, x1].includes(position.getX(i)) && [z0, z1].includes(position.getZ(i))), 'expected an axis-aligned rectangular top');
  const near = (a, b) => Math.abs(a - b) < 1e-5;
  requireFit(near(y + wallBody.position.y, P.retained.southWallTop)
    && near(z0 + wallBody.position.z, P.retained.worldAnchorZ + P.retained.southWallMinZ)
    && near(z1 + wallBody.position.z, P.retained.worldAnchorZ + P.retained.southWallMaxZ), 'wall no longer matches the retained interface');
  const xa = Math.fround(Math.min(side * P.fit.flightOuterX, side * P.fit.outerX) - wallBody.position.x);
  const xb = Math.fround(Math.max(side * P.fit.flightOuterX, side * P.fit.outerX) - wallBody.position.x);
  // Enclosure bakes world Z into Float32 while the gate retains its separate
  // world translation. Round the notch inward to the next representable world
  // coordinate, rather than exposing a micrometre-wide gap south of the slab.
  // The residual top strip is covered by the existing 0.45m south parapet.
  const cutWorldZ = ceilFloat32(P.retained.worldAnchorZ + P.fit.upperBand[0]);
  const za = Math.fround(cutWorldZ - wallBody.position.z);
  requireFit(x0 < xa && xa < xb && xb < x1 && z0 < za && za < z1, 'covered paving patch must be an interior notch at the north edge');
  const corner = (x, z) => top.find(i => position.getX(i) === x && position.getZ(i) === z);
  const c00 = corner(x0, z0), c10 = corner(x1, z0), c01 = corner(x0, z1);
  requireFit([c00, c10, c01, corner(x1, z1)].every(i => i !== undefined), 'missing original top corner');
  for (const get of [i => uv.getX(i), i => uv.getY(i)]) {
    requireFit(get(corner(x1, z1)) === get(c10) + get(c01) - get(c00)
      && top.every(i => get(i) === get(corner(position.getX(i), position.getZ(i)))), 'top UV mapping must remain affine and continuous');
  }
  const rows = [];
  const vertex = (x, z) => {
    const old = corner(x, z), tx = (x - x0) / (x1 - x0), tz = (z - z0) / (z1 - z0);
    const interpolate = get => get(c00) + tx * (get(c10) - get(c00)) + tz * (get(c01) - get(c00));
    rows.push({ position: [x, y, z], normal: [0, 1, 0],
      uv: old === undefined ? [interpolate(i => uv.getX(i)), interpolate(i => uv.getY(i))] : [uv.getX(old), uv.getY(old)] });
  };
  const rect = (a, b, c, d) => { vertex(a, c); vertex(a, d); vertex(b, c); vertex(a, d); vertex(b, d); vertex(b, c); };
  rect(x0, xa, z0, z1); rect(xa, xb, z0, za); rect(xb, x1, z0, z1);
  requireFit(geometry.groups.length === 6 && geometry.groups.every((g, i) => g.start === i * 6 && g.count === 6), 'unexpected box material groups');
  for (const [name, attr] of Object.entries(attrs)) {
    const values = new Float32Array(48 * attr.itemSize);
    values.set(attr.array.subarray(0, 12 * attr.itemSize));
    rows.forEach((row, i) => values.set(row[name], (12 + i) * attr.itemSize));
    values.set(attr.array.subarray(18 * attr.itemSize), 30 * attr.itemSize);
    geometry.setAttribute(name, new attr.constructor(values, attr.itemSize, attr.normalized));
  }
  geometry.groups[2].count = 18;
  for (let i = 3; i < geometry.groups.length; i++) geometry.groups[i].start += 12;
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  return wallBody;
}
