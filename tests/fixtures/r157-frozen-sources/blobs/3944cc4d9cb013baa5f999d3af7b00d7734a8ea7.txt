import * as THREE from 'three';
import { TAIHE_CAISSON_FALLBACK_DATA } from './TaiheCaissonFallbackData.js';

// The framed caisson shell and central dragon are source-informed approximations.
// Flat per-face normals retain the brow/muzzle planes at the coarse tier.
// Reuse existing material identities; the normal merge preserves eight batches.
function floats(encoded) {
  const bytes = Uint8Array.from(atob(encoded), value => value.charCodeAt(0));
  const view = new DataView(bytes.buffer), values = new Float32Array(bytes.length / 4);
  for (let i = 0; i < values.length; i++) values[i] = view.getFloat32(i * 4, true);
  return values;
}

export function appendTaiheCaissonDetail(group, materials) {
  for (const batch of TAIHE_CAISSON_FALLBACK_DATA) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(floats(batch.position), 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(floats(batch.normal), 3));
    const mesh = new THREE.Mesh(geometry, materials[batch.material]);
    mesh.name = `taihe-caisson-shell-and-dragon-${batch.material}`;
    group.add(mesh);
  }
}
