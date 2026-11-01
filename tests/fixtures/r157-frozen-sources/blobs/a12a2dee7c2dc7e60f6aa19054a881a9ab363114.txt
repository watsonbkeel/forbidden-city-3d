import * as THREE from 'three';
import { drawTaiheCeilingTile } from './TaiheCeilingArtwork.js';

// Original illustrative tile, informed by the museum photo's motif categories.
// Repeat spacing and colors remain model estimates, not measured paint data.
export const TAIHE_CEILING_TILE = Object.freeze({ size: 512, rgbaMipBytes: 1398100, cacheKey: 'taihe_ceiling_medallion' });
export function taiheCeilingMaterial(builder) {
  const { cacheKey, size } = TAIHE_CEILING_TILE;
  if (builder._own.has(cacheKey)) return builder._own.get(cacheKey);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Taihe ceiling requires a Canvas2D context');
  drawTaiheCeilingTile(context, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'taihe-ceiling-original-medallion';
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  const material = builder.ownMat(cacheKey, {
    name: 'taihe_ceiling_medallion', map: texture, roughness: 0.8, side: THREE.DoubleSide,
  });
  let disposed = false;
  material.addEventListener('dispose', () => {
    if (!disposed) { disposed = true; texture.dispose(); }
  });
  return material;
}
