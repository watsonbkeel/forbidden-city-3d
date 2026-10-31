import * as THREE from 'three';

// A face is removable only if one opaque convex box covers the whole triangle
// AND a small step toward its outward side. The second condition retains two
// coincident exterior skins instead of accidentally removing both of them.
const EDGE_TOLERANCE = 5e-6;
const OUTWARD_PROBE = 5e-5;

/**
 * Remove buried pavilion surfaces before material batching. The caller supplies
 * only its real, closed box solids; arbitrary geometry bounds are not solids.
 * No vertices are moved, surviving normals/UVs stay exact, and no scene node,
 * structural metadata, collision volume, material or shadow flag is changed.
 * All source geometry is freshly assembly-owned. External instances must not
 * share it; replaced geometry is disposed after internal references are checked.
 */
export function prunePavilionCoveredFaces(root, solidBoxes) {
  root.updateMatrixWorld(true);
  const inverseRoot = root.matrixWorld.clone().invert();
  const meshes = [];
  root.traverse(mesh => { if (mesh.isMesh) meshes.push(mesh); });
  const meshSet = new Set(meshes);
  // Validate the complete input before touching any source resource.
  for (const mesh of meshes) {
    const g = mesh.geometry, count = g.index?.count ?? g.attributes.position?.count;
    const determinant = new THREE.Matrix4().multiplyMatrices(inverseRoot, mesh.matrixWorld).determinant();
    if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-12) {
      throw new Error('Unsupported singular pavilion transform');
    }
    if (mesh.isInstancedMesh || mesh.isSkinnedMesh || Array.isArray(mesh.material) || !Number.isFinite(count) || count % 3 ||
      Object.values(g.attributes).some(a => a.isInterleavedBufferAttribute) || Object.keys(g.morphAttributes).length ||
      g.drawRange.start !== 0 || (g.drawRange.count !== Infinity && g.drawRange.count !== count)) {
      throw new Error('Unsupported pavilion source geometry layout');
    }
  }
  const boxes = solidBoxes.map(mesh => {
    const material = mesh.material;
    let active = true;
    for (let parent = mesh; parent; parent = parent.parent) {
      active &&= parent.visible;
      if (parent === root) break;
    }
    if (!meshSet.has(mesh) || !active || !material.visible || Array.isArray(material) ||
      material.transparent || material.opacity !== 1 || material.alphaTest > 0 || material.wireframe ||
      !mesh.castShadow || !material.depthWrite ||
      material.displacementMap || material.side === THREE.BackSide || material.clippingPlanes?.length ||
      meshes.some(source => source.layers.mask !== mesh.layers.mask)) {
      throw new Error('Pavilion occluders must be opaque solid boxes in the same assembly');
    }
    const geometry = mesh.geometry;
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox.clone();
    assertClosedBox(geometry, bounds);
    const matrix = new THREE.Matrix4().multiplyMatrices(inverseRoot, mesh.matrixWorld);
    return { mesh, bounds, worldBounds: bounds.clone().applyMatrix4(matrix), inverse: matrix.clone().invert() };
  });
  const points = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const normal = new THREE.Vector3(), edge = new THREE.Vector3(), probe = new THREE.Vector3(), local = new THREE.Vector3();
  const triangleBounds = new THREE.Box3();
  const report = { sourceTriangles: 0, coveredTriangles: 0, degenerateTriangles: 0, removedTriangles: 0, retainedTriangles: 0 };
  const replaced = new Set();
  for (const mesh of meshes) {
    const geometry = mesh.geometry, positions = geometry.attributes.position, index = geometry.index;
    const count = index?.count ?? positions.count;
    const matrix = new THREE.Matrix4().multiplyMatrices(inverseRoot, mesh.matrixWorld);
    geometry.computeBoundingBox();
    const meshBounds = geometry.boundingBox.clone().applyMatrix4(matrix);
    const candidates = boxes.filter(box => box.mesh !== mesh && box.worldBounds.intersectsBox(meshBounds));
    const orientation = matrix.determinant() < 0 ? -1 : 1;
    const kept = [];
    for (let offset = 0; offset < count; offset += 3) {
      report.sourceTriangles++;
      for (let j = 0; j < 3; j++) points[j].fromBufferAttribute(positions, index ? index.getX(offset + j) : offset + j).applyMatrix4(matrix);
      normal.subVectors(points[1], points[0]).cross(edge.subVectors(points[2], points[0]));
      if (normal.lengthSq() < 1e-18) {
        report.degenerateTriangles++;
        continue;
      }
      normal.normalize().multiplyScalar(orientation);
      triangleBounds.setFromPoints(points);
      probe.copy(points[0]).add(points[1]).add(points[2]).multiplyScalar(1 / 3).addScaledVector(normal, OUTWARD_PROBE);
      const covered = candidates.some(box => {
        if (mesh === box.mesh || !box.worldBounds.intersectsBox(triangleBounds)) return false;
        const { min, max } = box.bounds;
        if (!points.every(point => {
          local.copy(point).applyMatrix4(box.inverse);
          return local.x >= min.x - EDGE_TOLERANCE && local.x <= max.x + EDGE_TOLERANCE &&
            local.y >= min.y - EDGE_TOLERANCE && local.y <= max.y + EDGE_TOLERANCE &&
            local.z >= min.z - EDGE_TOLERANCE && local.z <= max.z + EDGE_TOLERANCE;
        })) return false;
        return box.bounds.containsPoint(local.copy(probe).applyMatrix4(box.inverse));
      });
      if (covered) report.coveredTriangles++;
      else for (let j = 0; j < 3; j++) kept.push(index ? index.getX(offset + j) : offset + j);
    }
    if (kept.length === count) continue;
    // Keep the complete surveyed primitive's vertices and local bounds for
    // structural inspection; only its submitted triangle index is reduced.
    const replacement = geometry.clone();
    replacement.clearGroups();
    replacement.setIndex(kept);
    mesh.geometry = replacement;
    replaced.add(geometry);
  }
  // Dispose replaced resources once, only after no assembly mesh references it.
  root.traverse(mesh => { if (mesh.geometry) replaced.delete(mesh.geometry); });
  replaced.forEach(geometry => geometry.dispose());
  report.removedTriangles = report.coveredTriangles + report.degenerateTriangles;
  report.retainedTriangles = report.sourceTriangles - report.removedTriangles;
  return report;
}

/** The paving is receive-only; its real masonry sides/underside still cast. */
export function splitPavilionDeckFaces(geometry) {
  const position = geometry.attributes.position, normal = geometry.attributes.normal, index = geometry.index;
  const count = index?.count ?? position.count, surface = [], body = [];
  for (let offset = 0; offset < count; offset += 3) {
    const vertices = [0, 1, 2].map(j => index ? index.getX(offset + j) : offset + j);
    (vertices.every(vertex => normal.getY(vertex) > .99999) ? surface : body).push(...vertices);
  }
  return { surface: copyVertices(geometry, surface), body: copyVertices(geometry, body) };
}

function copyVertices(geometry, vertices) {
  const replacement = new THREE.BufferGeometry();
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    const values = new attribute.array.constructor(vertices.length * attribute.itemSize);
    vertices.forEach((vertex, i) => {
      values.set(attribute.array.subarray(vertex * attribute.itemSize, (vertex + 1) * attribute.itemSize), i * attribute.itemSize);
    });
    replacement.setAttribute(name, new THREE.BufferAttribute(values, attribute.itemSize, attribute.normalized));
  }
  replacement.computeBoundingBox();
  replacement.computeBoundingSphere();
  return replacement;
}

// kit.box's UV projection removes BoxGeometry's type marker. Verify its actual
// six complete planar sides instead of trusting a name or an arbitrary AABB.
function assertClosedBox(geometry, bounds) {
  const position = geometry.attributes.position, index = geometry.index, count = index?.count ?? position.count;
  const size = bounds.getSize(new THREE.Vector3()), areas = [0, 0, 0, 0, 0, 0];
  const faceCorners = Array.from({ length: 6 }, () => []);
  const points = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
  const normal = new THREE.Vector3(), edge = new THREE.Vector3();
  const fail = () => { throw new Error('Pavilion occluder geometry must be a complete solid box'); };
  if (count !== 36 || Math.min(size.x, size.y, size.z) <= 0) fail();
  for (let offset = 0; offset < count; offset += 3) {
    for (let j = 0; j < 3; j++) points[j].fromBufferAttribute(position, index ? index.getX(offset + j) : offset + j);
    normal.subVectors(points[1], points[0]).cross(edge.subVectors(points[2], points[0]));
    const area = normal.length() / 2;
    normal.normalize();
    const axis = ['x', 'y', 'z'].find(axis => Math.abs(normal[axis]) > .99999);
    if (!axis || !area) fail();
    const sign = Math.sign(normal[axis]), bound = sign > 0 ? bounds.max[axis] : bounds.min[axis];
    if (!points.every(point => Math.abs(point[axis] - bound) < 1e-7)) fail();
    const side = ['x', 'y', 'z'].indexOf(axis) * 2 + (sign > 0 ? 1 : 0);
    areas[side] += area;
    const axes = ['x', 'y', 'z'].filter(value => value !== axis);
    const corners = points.map(point => axes.reduce((corner, axis, bit) => {
      if (Math.abs(point[axis] - bounds.min[axis]) < 1e-7) return corner;
      if (Math.abs(point[axis] - bounds.max[axis]) < 1e-7) return corner | (1 << bit);
      fail();
    }, 0));
    if (new Set(corners).size !== 3) fail();
    faceCorners[side].push(corners);
  }
  const expected = [size.y * size.z, size.y * size.z, size.x * size.z, size.x * size.z, size.x * size.y, size.x * size.y];
  if (areas.some((area, i) => Math.abs(area - expected[i]) > Math.max(1, expected[i]) * 1e-6)) fail();
  for (const faces of faceCorners) {
    if (faces.length !== 2 || new Set(faces.flat()).size !== 4) fail();
    const shared = faces[0].filter(corner => faces[1].includes(corner));
    if (shared.length !== 2 || (shared[0] ^ shared[1]) !== 3) fail();
  }
}
