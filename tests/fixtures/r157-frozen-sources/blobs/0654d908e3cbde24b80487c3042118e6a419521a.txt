import * as THREE from 'three';

// Original procedural illustration of the photographed square brick pavement.
// Spacing, seam width and PBR values are estimates, not conservation measurements.
export const TAIHE_FLOOR = Object.freeze({
  size: 512, tiles: 4, estimatedBrickMetres: .70, tileMetres: 2.80,
  rgbaMipBytes: 1398100, cacheKey: 'taihe_square_brick_floor',
  roughness: .32, metalness: 0,
});
const tileShade = (x, y) => ((x * 13 + y * 7 + x * y * 3) % 17 - 8) * .38;

export function taiheFloorPixels() {
  const { size, tiles } = TAIHE_FLOOR, cell = size / tiles;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const tx = Math.floor(x / cell), ty = Math.floor(y / cell);
    const dx = Math.min(x % cell + .5, cell - (x % cell + .5));
    const dy = Math.min(y % cell + .5, cell - (y % cell + .5));
    // Narrow flush joints: no deep outdoor-stone normal map or baked highlights.
    const seam = Math.max(0, 1 - Math.min(dx, dy) / .8);
    const grain = (((x * 37 + y * 73 + x * y * 11) % 101) / 100 - .5) * 2;
    const mottle = Math.sin(x / size * Math.PI * 12) * Math.sin(y / size * Math.PI * 8) * 1.2;
    const value = tileShade(tx, ty) + grain + mottle + seam * 70;
    const i = (y * size + x) * 4;
    data[i] = Math.round(46 + value); data[i + 1] = Math.round(45 + value);
    data[i + 2] = Math.round(42 + value); data[i + 3] = 255;
  }
  return data;
}

export function taiheFloorMaterial(builder) {
  const p = TAIHE_FLOOR;
  if (builder._own.has(p.cacheKey)) return builder._own.get(p.cacheKey);
  const texture = new THREE.DataTexture(taiheFloorPixels(), p.size, p.size, THREE.RGBAFormat);
  texture.name = 'taihe-original-square-brick';
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.min(builder.library.anisotropy ?? 4, 4);
  texture.needsUpdate = true;
  const material = builder.ownMat(p.cacheKey, {
    name: p.cacheKey, color: 0xffffff, map: texture,
    roughness: p.roughness, metalness: p.metalness,
  });
  let disposed = false;
  material.addEventListener('dispose', () => {
    if (!disposed) { disposed = true; texture.dispose(); }
  });
  return material;
}
