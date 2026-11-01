import * as THREE from 'three';

const EPS = 1e-8;

/** Clip a real face to the actual square player-bottom footprint. */
function clipPlane(vertices, axis, boundary, sign) {
  const out = [];
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i], b = vertices[(i + 1) % vertices.length];
    const da = sign * (a[axis] - boundary), db = sign * (b[axis] - boundary);
    if (da >= -EPS) out.push(a);
    if ((da >= 0) !== (db >= 0)) out.push(a.clone().lerp(b, da / (da - db)));
  }
  return out;
}

/** Physical contact only: obstruction of a standing pose must not erase a floor.
 * Higher roofs do not hide reachable lower faces. No broadphase top is support. */
export function duixiuFootContact(shape, x, z, maxTop, radius = .5) {
  if (![x, z, radius].every(Number.isFinite) || Number.isNaN(maxTop) || radius <= 0)
    throw new TypeError('Finite footprint and positive radius required');
  const ox = x - shape.offset.x, oz = z - shape.offset.z;
  let best = null;
  for (let i = 0; i < shape.template.triangles.length; i++) {
    const face = shape.template.triangles[i];
    if (face.normal.y <= EPS || ox + radius < face.box.min.x || ox - radius > face.box.max.x ||
        oz + radius < face.box.min.z || oz - radius > face.box.max.z) continue;
    let polygon = [face.triangle.a, face.triangle.b, face.triangle.c];
    for (const [axis, bound, sign] of [['x', ox-radius, 1], ['x', ox+radius, -1], ['z', oz-radius, 1], ['z', oz+radius, -1]]) {
      polygon = clipPlane(polygon, axis, bound, sign);
      if (!polygon.length) break;
    }
    if (!polygon.length) continue;
    const highest = polygon.reduce((a, b) => a.y > b.y ? a : b);
    const height = highest.y + shape.offset.y;
    if (height > maxTop + EPS || (best && height <= best.height)) continue;
    best = {height, witness: highest.clone().add(shape.offset), instanceId: shape.id,
      triangleId: i, terrainId: 'duixiu'};
  }
  return best;
}

/** Fine broadphase only. Original leaf owners and their order never change. */
export class DuixiuTerrainIndex {
  constructor(owners) {
    this.owners = owners;
    this.cells = new Map();
    owners.forEach((owner, index) => {
      for (let x = Math.floor(owner.box.min.x); x <= Math.floor(owner.box.max.x); x++)
        for (let z = Math.floor(owner.box.min.z); z <= Math.floor(owner.box.max.z); z++) {
          const key = `${x}:${z}`;
          if (!this.cells.has(key)) this.cells.set(key, []);
          this.cells.get(key).push(index);
        }
    });
  }
  query(box) {
    const found = new Set();
    for (let x = Math.floor(box.min.x); x <= Math.floor(box.max.x); x++)
      for (let z = Math.floor(box.min.z); z <= Math.floor(box.max.z); z++)
        for (const i of this.cells.get(`${x}:${z}`) ?? [])
          if (this.owners[i].box.intersectsBox(box)) found.add(i);
    return [...found].sort((a,b) => a-b).map(i => this.owners[i]);
  }
}
