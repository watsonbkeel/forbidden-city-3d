/** Official six-view imagery and the unscaled 后三宫 plan establish two
 * enclosed north–south passages. Every metric value below is an inherited
 * envelope/photo-relative approximation, NOT a measured wall registration.
 * Front-veranda setback and unequal historic column spacing remain unresolved.
 */
export const QIANQING_END_PASSAGES = Object.freeze({
  id: 'qianqing-two-enclosed-end-passages', bays: Object.freeze([0, 8]),
  status: 'OFFICIAL_THROUGH_TOPOLOGY_WITH_ESTIMATED_ENVELOPE_NOT_SURVEY',
  source: 'https://www.dpm.org.cn/explore/building/236472.html',
  plan: 'https://img.dpm.org.cn/Uploads/pdf/2201/T00008_00.pdf',
  panorama: 'https://pano.dpm.org.cn/#/panorama?regionId=61&secondAreaId=98',
  sideDoorPose: 'CLOSED_VIRTUAL_BOUNDARY_NOT_VERIFIED_PHOTOGRAPHED_POSE',
  frontVerandaSetback: 'UNREGISTERED_RETAIN_EXISTING_FACADE_PLANE',
  innerWallThickness: .36, portalDepth: .36,
  sideDoorWidth: 1.4, sideDoorHeight: 2.5, sideDoorOffsetRatio: -.22,
});

export function qianqingPassageFrame({ x0, z0, y, w, d, H, bayW, r, doorH, beamH }) {
  const values = [x0, z0, y, w, d, H, bayW, r, doorH, beamH];
  const expected = [0, 316.8, 2.16, 46, 25, 7.22, 46 / 9, (46 / 9) * .08, 7.22 * .88 * .8, 7.22 * .12];
  if (values.some((v, i) => !Number.isFinite(v) || Math.abs(v - expected[i]) > 1e-7))
    throw Error('Unregistered Qianqing passage envelope');
  const inner = w / 2 - bayW, jambWidth = r + .14;
  return Object.freeze({ ...QIANQING_END_PASSAGES, x0, z0, y, w, d, H, bayW, r, doorH, beamH,
    inner, outer: w / 2, zSouth: z0 - d / 2, zNorth: z0 + d / 2, jambWidth,
    clearWidth: bayW - 2 * jambWidth, centerX: inner + bayW / 2,
    sideDoorZ: z0 + d * QIANQING_END_PASSAGES.sideDoorOffsetRatio });
}

/** Called once for each of the four mouths. The complete side bay is no
 * longer a closed panel; narrow jambs retain collision at the actual geometry.
 * Existing high headers/beam and outer columns are left in place.
 */
export function buildQianqingPassageMouth(b, g, f, sign, zf) {
  if (![-1, 1].includes(sign) || ![f.zSouth, f.zNorth].includes(zf)) throw Error('Unknown passage mouth');
  const xc = f.x0 + sign * f.centerX;
  for (const edge of [-1, 1]) {
    const x = xc + edge * (f.bayW - f.jambWidth) / 2;
    const mesh = b.libBox(g, 'wood_column', f.jambWidth, f.doorH, f.portalDepth,
      x, f.y + f.doorH / 2, zf, 'box');
    mesh.userData.qianqingPassage = { kind: 'mouth-jamb', sign, zf, status: f.status };
    b.col(x - f.jambWidth / 2, f.y, zf - f.portalDepth / 2,
      x + f.jambWidth / 2, f.y + f.doorH, zf + f.portalDepth / 2);
  }
  const lintel = b.libBox(g, 'wood_column', f.clearWidth, .18, f.portalDepth,
    xc, f.y + f.doorH - .09, zf, 'box');
  lintel.userData.qianqingPassage = { kind: 'mouth-lintel', sign, zf, status: f.status };
  b.col(xc - f.clearWidth / 2, f.y + f.doorH - .18, zf - f.portalDepth / 2,
    xc + f.clearWidth / 2, f.y + f.doorH, zf + f.portalDepth / 2);
}

/** The inner wooden wall closes each adjacent warm-room boundary. The small
 * side doorway is a recessed closed virtual leaf; its exact position, size and
 * pose are unverified. It intentionally grants no invented warm-room access.
 */
export function buildQianqingPassageWalls(b, g, f) {
  if (g.userData.qianqingPassages) throw Error('Duplicate Qianqing passages');
  g.userData.qianqingPassages = f;
  const mat = b.ownMat('qianqing_passage_inner_wood', { color: 0x603129, roughness: .82, metalness: .01 });
  const h = f.H - f.beamH, dz = f.sideDoorWidth / 2;
  for (const sign of [-1, 1]) {
    const x = f.x0 + sign * f.inner;
    const wall = (z0, z1, y0, height, kind) => {
      const mesh = b.box(g, mat, f.innerWallThickness, height, z1 - z0, x, y0 + height / 2, (z0 + z1) / 2);
      mesh.userData.qianqingPassage = { kind, sign, status: f.status }; return mesh;
    };
    wall(f.zSouth, f.sideDoorZ - dz, f.y, h, 'inner-wall');
    wall(f.sideDoorZ + dz, f.zNorth, f.y, h, 'inner-wall');
    wall(f.sideDoorZ - dz, f.sideDoorZ + dz, f.y + f.sideDoorHeight, h - f.sideDoorHeight, 'side-door-header');
    // Leaf and timber surround remain within the same continuous collision.
    const leaf = b.libBox(g, 'wood_column', .26, f.sideDoorHeight, f.sideDoorWidth,
      x - sign * .04, f.y + f.sideDoorHeight / 2, f.sideDoorZ, 'box');
    leaf.userData.qianqingPassage = { kind: 'closed-side-door', sign, pose: f.sideDoorPose, status: f.status };
    b.libBox(g, 'wood_column', .42, .14, f.sideDoorWidth + .28, x, f.y + f.sideDoorHeight + .07, f.sideDoorZ, 'box');
    for (const side of [-1, 1]) b.libBox(g, 'wood_column', .42, f.sideDoorHeight, .14,
      x, f.y + f.sideDoorHeight / 2, f.sideDoorZ + side * (dz + .07), 'box');
    b.libBox(g, 'caihua_beam', .42, f.beamH, f.d, x, f.y + f.H - f.beamH / 2, f.z0, 'band');
    b.col(x - f.innerWallThickness / 2, f.y, f.zSouth,
      x + f.innerWallThickness / 2, f.y + f.H, f.zNorth);
  }
}
