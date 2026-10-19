/** Nominal common terrace from the Palace Museum's 后三宫 description.
 * The small one-stone hall lip is a PHOTO-FIT trial, not a surveyed height.
 * Current official oblique views show the three halls opening near the common
 * deck, rather than three additional 1.5–2m staircases stacked on it.
 */
export const INNER_PALACE_LEVELS = Object.freeze({
  terraceY: 2,
  hallLip: .16,
  hallFloorY: 2.16,
  causewayWidth: 10,
  heightSource: 'https://www.dpm.org.cn/explore/building/236467.html',
  widthSource: 'https://img.dpm.org.cn/Uploads/pdf/2201/T00007_00.pdf',
  heightStatus: 'museum nominal common terrace; local level datum approximate',
  lipStatus: 'single-stone topology photo-compared; 0.16m is provisional',
  widthStatus: '1983 museum article states approximately 10m; edge basis unspecified',
});

export function buildInnerPalaceLip(b, g, { z0, w, d, y, ph }) {
  if (y !== INNER_PALACE_LEVELS.terraceY || ph !== INNER_PALACE_LEVELS.hallLip)
    throw new Error('Inner-palace common-deck/lip interface drift');
  b.libBox(g, 'stone_slab', w, ph, d, 0, y + ph / 2, z0, 'box');
  b.walkBox(-w / 2, z0 - d / 2, w / 2, z0 + d / 2, y + ph);
  // This is the actual low stone body, not an invisible tall stair cheek.
  // The unchanged player step clearance permits stepping onto it from the deck.
  b.col(-w / 2, y, z0 - d / 2, w / 2, y + ph, z0 + d / 2);
  return y + ph;
}
