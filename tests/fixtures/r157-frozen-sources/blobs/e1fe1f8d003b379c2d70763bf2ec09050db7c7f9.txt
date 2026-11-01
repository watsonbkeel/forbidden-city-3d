/**
 * Shorten only the Wumen-facing end of a freshly built, merged wall cap.
 *
 * This is a provisional model-registration fit, not a measured historical
 * dimension. `side` is the sign of the wall's world-X wing (+1 or -1).
 * The caller retains the full masonry wall, crenels and collision geometry.
 *
 * buildWallCap currently emits non-indexed triangles whose longitudinal
 * vertices are at +/- length/2. Moving the existing end faces closes the new
 * end without adding geometry. Each longitudinal triangle has an X-parallel
 * edge: its original UV gradient preserves texture registration on the entire
 * retained surface, including perimeter brick UVs and normalized ridge UVs.
 *
 * Validate every mesh before writing anything. A changed builder topology
 * must fail explicitly rather than silently stretch textures or open a cap.
 * Geometry, materials, metadata and disposal ownership remain with the caller.
 */
export function fitWumenWallCap(cap, { length, side, trimDistance }) {
  const requireFit = (condition, reason) => {
    if (!condition) throw new Error(`Wumen wall cap: ${reason}`);
  };
  requireFit(Number.isFinite(length) && length > 0, 'length must be positive and finite');
  requireFit(side === -1 || side === 1, 'side must be -1 or +1');
  requireFit(Number.isFinite(trimDistance) && trimDistance >= 0 && trimDistance < length,
    'trim distance must be finite and smaller than length');
  requireFit(cap?.isGroup && cap.children.length > 0, 'expected a fresh wall-cap group');

  const half = Math.fround(length / 2);
  const innerX = -side * half;
  const cutX = Math.fround(side * (trimDistance - length / 2));
  requireFit((side * half - cutX) * side > 0, 'trim leaves no representable cap length');
  const plans = [];
  for (const mesh of cap.children) {
    requireFit(mesh.isMesh && !mesh.isInstancedMesh && mesh.children.length === 0,
      'expected plain merged cap meshes');
    requireFit(mesh.position.lengthSq() === 0 && mesh.quaternion.x === 0 && mesh.quaternion.y === 0
      && mesh.quaternion.z === 0 && mesh.quaternion.w === 1
      && mesh.scale.x === 1 && mesh.scale.y === 1 && mesh.scale.z === 1,
    'mesh transforms must already be baked');
    requireFit(mesh.matrix.elements.every((value, i) => value === (i % 5 === 0 ? 1 : 0)),
      'mesh matrix must be identity');
    const geometry = mesh.geometry;
    const { position, normal, uv } = geometry.attributes;
    requireFit(!geometry.index && position && normal && uv && position.itemSize === 3
      && normal.itemSize === 3 && uv.itemSize === 2 && position.count > 0
      && position.count % 3 === 0 && normal.count === position.count && uv.count === position.count,
    'expected non-indexed position/normal/UV triangles');
    requireFit([position, normal, uv].every(attribute => !attribute.isInterleavedBufferAttribute
      && attribute.array instanceof Float32Array && attribute.array.every(Number.isFinite)),
    'expected finite float32 attributes');
    const positions = position.array.slice();
    const uvs = uv.array.slice();
    let innerEnd = false, outerEnd = false;
    for (let i = 0; i < position.count; i += 3) {
      const xs = [position.getX(i), position.getX(i + 1), position.getX(i + 2)];
      requireFit(xs.every(x => x === -half || x === half), 'unexpected longitudinal vertex');
      const endFace = xs.every(x => x === xs[0]);
      if (endFace) {
        if (xs[0] === innerX) innerEnd = true;
        else outerEnd = true;
      }
      let du = 0, dv = 0;
      if (!endFace) {
        let edge;
        for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) {
          if (xs[a] !== xs[b] && position.getY(i + a) === position.getY(i + b)
            && position.getZ(i + a) === position.getZ(i + b)) edge = [a, b];
        }
        requireFit(edge, 'longitudinal triangle has no X-parallel edge');
        const [a, b] = edge;
        du = (uv.getX(i + b) - uv.getX(i + a)) / (xs[b] - xs[a]);
        dv = (uv.getY(i + b) - uv.getY(i + a)) / (xs[b] - xs[a]);
      }
      for (let j = 0; j < 3; j++) {
        if (xs[j] !== innerX) continue;
        const vertex = i + j;
        positions[vertex * 3] = cutX;
        if (!endFace) {
          uvs[vertex * 2] += du * (cutX - innerX);
          uvs[vertex * 2 + 1] += dv * (cutX - innerX);
        }
      }
    }
    // Tile slopes have no independent end triangles; the wall gables close them.
    plans.push({ geometry, position, uv, positions, uvs, innerEnd, outerEnd });
  }
  requireFit(plans.some(plan => plan.innerEnd) && plans.some(plan => plan.outerEnd),
    'cap is missing original end faces');
  if (trimDistance === 0) return cap;
  for (const { geometry, position, uv, positions, uvs } of plans) {
    position.array.set(positions);
    uv.array.set(uvs);
    position.needsUpdate = true;
    uv.needsUpdate = true;
    // Cross-section and triangle winding are unchanged, so retain the original
    // normals exactly rather than perturbing remote-end smoothing.
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
  }
  return cap;
}
