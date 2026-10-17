import * as THREE from 'three';
import { TAIHE_DISPLAY_FALLBACK_DATA } from './TaiheDisplayFallbackData.js';

// Generated little-endian float32 data has independent vertices for every
// triangle, including opposing FrontSide sheets. Do not weld or recompute
// indexed normals. Existing Taihe material objects and sides are retained.
function floats(encoded) {
  const bytes = Uint8Array.from(atob(encoded), value => value.charCodeAt(0));
  const view = new DataView(bytes.buffer);
  const values = new Float32Array(bytes.length / 4);
  for (let i = 0; i < values.length; i++) values[i] = view.getFloat32(i * 4, true);
  return values;
}

export function appendTaiheDisplayPairs(group, materials) {
  for (const batch of TAIHE_DISPLAY_FALLBACK_DATA) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(floats(batch.position), 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(floats(batch.normal), 3));
    const mesh = new THREE.Mesh(geometry, materials[batch.material]);
    mesh.name = `taihe-display-${batch.material}`;
    group.add(mesh);
  }
}
