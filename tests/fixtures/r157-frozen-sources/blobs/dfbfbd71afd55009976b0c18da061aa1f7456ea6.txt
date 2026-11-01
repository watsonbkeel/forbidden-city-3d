import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// 使用原屋面轮廓，不凭空猜建筑尺寸；剔除法线/UV，只留无投影远景壳。
export function buildSilhouette(group) {
  group.updateMatrixWorld(true);
  const parts = [];
  group.traverse(mesh => {
    if (!mesh.isMesh || mesh.isInstancedMesh || Array.isArray(mesh.material)) return;
    if (!/roof_tile|kit_roof/.test(mesh.material.name)) return;
    const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);
    for (const name of Object.keys(geometry.attributes)) if (name !== 'position') geometry.deleteAttribute(name);
    parts.push(geometry);
  });
  if (!parts.length) return null;
  const geometry = mergeGeometries(parts);
  parts.forEach(g => g.dispose());
  if (!geometry) return null;
  compactPositions(geometry);
  const material = new THREE.MeshBasicMaterial({ color: 0xb58c36, fog: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `${group.name}-silhouette`;
  mesh.castShadow = false;
  mesh.visible = false;
  mesh.userData.noMerge = true;
  return mesh;
}

/** Exact storage compaction, not mesh simplification. Silhouettes are unlit,
 * position-only meshes: no UV/normal seams are lost and no normals are generated.
 * Float32 bit keys avoid tolerance welding (including signed-zero ambiguity).
 * Expanded index order, triangle winding, bounds and visibility stay unchanged.
 */
function compactPositions(geometry) {
  const positions = geometry.attributes.position;
  if (geometry.index || !(positions.array instanceof Float32Array)) return;
  const source = positions.array;
  const bits = new Uint32Array(source.buffer, source.byteOffset, source.length);
  const vertices = new Map(), first = [], indices = new Uint32Array(positions.count);
  for (let i = 0; i < positions.count; i++) {
    const offset = i * 3, key = `${bits[offset]},${bits[offset + 1]},${bits[offset + 2]}`;
    let index = vertices.get(key);
    if (index === undefined) { index = first.length; vertices.set(key, index); first.push(offset); }
    indices[i] = index;
  }
  const IndexArray = first.length <= 65536 ? Uint16Array : Uint32Array;
  if (first.length * 12 + indices.length * IndexArray.BYTES_PER_ELEMENT >= source.byteLength) return;
  const unique = new Float32Array(first.length * 3);
  first.forEach((offset, index) => unique.set(source.subarray(offset, offset + 3), index * 3));
  geometry.setAttribute('position', new THREE.BufferAttribute(unique, 3));
  geometry.setIndex(new THREE.BufferAttribute(new IndexArray(indices), 1));
}
