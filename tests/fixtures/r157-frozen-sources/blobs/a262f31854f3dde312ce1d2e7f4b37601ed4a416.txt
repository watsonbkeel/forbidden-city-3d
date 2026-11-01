/** Identity correction only. The inherited four depth stations are provisional.
 * The museum's1941 plan and building description agree that the six middle
 * front inner posts are omitted; the rear middle posts are NOT throne cutouts.
 * This is not a reconstruction of all five depth bays or a historical count. */
export const BAOHE_COLUMN_IDENTITY = Object.freeze({
  id: 'baohe-front-reduced-column-identity',
  source: 'https://www.dpm.org.cn/explore/building/236434.html',
  plan: 'https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/b1ced0e6c4924342bf1d7cfb86b47788.jpg',
  depthStatus: 'RETAINED_FOUR_STATIONS_NOT_FIVE_BAY_RESTORATION',
  omittedFrontIndices: Object.freeze([2,3,4,5,6,7]),
  restoredRearIndices: Object.freeze([4,5]),
  columnFinish: 'red-wood; inner-gold-column terminology does not imply gilding',
});

export function baoheColumnPresent(i, k, bays, depthBays) {
  if (bays !== 9 || depthBays !== 3 || !Number.isInteger(i) || !Number.isInteger(k)
      || i < 0 || i > bays || k < 0 || k > depthBays) {
    throw new Error('Baohe column identity requires its explicitly retained9×3 registration');
  }
  return !(k === 1 && BAOHE_COLUMN_IDENTITY.omittedFrontIndices.includes(i));
}
