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
  const material = new THREE.MeshBasicMaterial({ color: 0xb58c36, fog: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `${group.name}-silhouette`;
  mesh.castShadow = false;
  mesh.visible = false;
  mesh.userData.noMerge = true;
  return mesh;
}
