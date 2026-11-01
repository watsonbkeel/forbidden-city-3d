import * as THREE from 'three';
import { applyBoxUV } from '../../../utils/GeometryUV.js';

/** Official frontal/oblique photographs show narrow treads beside the middle
 * carved stone, in addition to the two separate outer stair groups. Retain the
 * project's approximate width/run and 0.32 stone fraction; these are not survey
 * dimensions. No temporary visitor barriers are copied as permanent fabric. */
export const QIANQING_IMPERIAL_STAIR = Object.freeze({
  source: 'https://www.dpm.org.cn/explore/building/236473.html',
  photo: 'https://img.dpm.org.cn/Uploads/Picture/2020/11/17/s5fb36b5c3ba59.jpg',
  stoneFraction: .32, curbWidth: .45,
  currentVisitorAccess: 'UNKNOWN',
});

export function buildQianqingImperialStair(b, g, { zEdge, y1, run, width }) {
  const p = QIANQING_IMPERIAL_STAIR, stoneW = width * p.stoneFraction;
  const flankW = (width - stoneW) / 2, n = Math.max(3, Math.round(y1 / .16));
  const sr = run / n, marble = b.library.material('marble'), tile = b.library.tileSize('marble');
  for (const side of [-1, 1]) {
    const cx = side * (stoneW / 2 + flankW / 2);
    for (let k = 0; k < n; k++) {
      const top = y1 - (k + 1) * y1 / (n + 1);
      b.box(g, marble, flankW, top, sr, cx, top / 2,
        zEdge - (k + .5) * sr, { box: tile });
    }
    // Original outer curb and its collision footprint are unchanged. There is
    // no invented inner curb squeezing the photographed narrow stair strips.
    const curb = b.box(g, marble, p.curbWidth, .4, Math.hypot(run, y1),
      side * (width / 2 - p.curbWidth / 2), y1 / 2 + .1,
      zEdge - run / 2, { box: tile });
    curb.rotation.x = -Math.atan2(y1, run);
    for (let j = 0; j < 4; j++) b.col(side * (width / 2 - p.curbWidth), 0,
      zEdge - j * run / 4, side * width / 2, y1 - j * y1 / 4 + .9,
      zEdge - (j + 1) * run / 4);
    b.walkRampZ(side < 0 ? -width / 2 + p.curbWidth : stoneW / 2,
      side < 0 ? -stoneW / 2 : width / 2 - p.curbWidth,
      zEdge, zEdge - run, y1, 0);
  }
  const section = new THREE.Shape();
  section.moveTo(0, 0); section.lineTo(run, 0); section.lineTo(0, y1); section.closePath();
  const geometry = new THREE.ExtrudeGeometry(section, { depth: stoneW,
    bevelEnabled: false, steps: 1, curveSegments: 1 });
  geometry.translate(0, 0, -stoneW / 2); geometry.rotateY(Math.PI / 2);
  geometry.translate(0, 0, zEdge);
  const body = new THREE.Mesh(applyBoxUV(geometry, tile), marble);
  body.name = 'qianqing-central-stone-body'; body.castShadow = body.receiveShadow = true; g.add(body);
  const slab = b.libBox(g, 'yulu', stoneW, .15, Math.hypot(run, y1),
    0, y1 / 2 + .06, zEdge - run / 2, 'raw');
  slab.rotation.x = -Math.atan2(y1, run);
  // Tight low boxes follow the solid incline. No walkable crosses the carving;
  // visitors in the game can use either outer flight or the real side strips.
  for (let j = 0; j < 16; j++) b.col(-stoneW / 2, 0, zEdge - j * run / 16,
    stoneW / 2, y1 - j * y1 / 16 + .15, zEdge - (j + 1) * run / 16);
  return { ...p, width, stoneWidth: stoneW, flankWidth: flankW,
    flankClearWidth: flankW - p.curbWidth, run, height: y1, provisional: true };
}
