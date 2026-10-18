/** Baohe1941 plan48 and transverse section46, independently read from metre
 * rulers. These rounded axis registrations are not a current-condition survey.
 * The ~24.97m floor/plinth envelope is distinct from the ~21.6m column depth. */
export const BAOHE_DEPTH_GRID = Object.freeze({
  id: 'baohe-five-unequal-depth-bays-1941',
  z: Object.freeze([-10.8, -8.3, -3.7, 3.6, 8.2, 10.8]),
  frontDoorRow: 1, rearDoorRow: 5, reducedRow: 2,
  omittedIndices: Object.freeze([2,3,4,5,6,7]),
  registrationAllowance: .3,
  dimensionsStatus: 'ROUNDED_DRAWING_AXES_NOT_CURRENT_SURVEY',
  frontageStatus: 'R17_INNER_STATIONS_PERIMETER_STILL_PROVISIONAL',
  plan: 'https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/b1ced0e6c4924342bf1d7cfb86b47788.jpg',
  section: 'https://file-pano.dpm.org.cn/hotspotImage/2026/06/25/7776fc4d6c3247cf86f04b6a49387405.jpg',
});

export function baoheDepthGrid(depth) {
  if (!Number.isFinite(depth) || depth < 24.4 || depth > 25.6) {
    throw Error('Baohe depth registration requires its retained approximately25m floor envelope');
  }
  const p=BAOHE_DEPTH_GRID;
  return {...p, depthBays:5, frontDoorZ:p.z[p.frontDoorRow], rearDoorZ:p.z[p.rearDoorRow],
    southEaveZ:p.z[0], northEaveZ:p.z.at(-1),
    sideWallDepth:p.z.at(-1)-p.z[0], sideWallCentre:(p.z.at(-1)+p.z[0])/2};
}

export function baoheDepthColumnPresent(i,k,bays,depthBays) {
  if (bays!==9 || depthBays!==5 || !Number.isInteger(i) || !Number.isInteger(k)
      || i<0 || i>bays || k<0 || k>depthBays) throw Error('Baohe reviewed9by5 station identity');
  return !(k===BAOHE_DEPTH_GRID.reducedRow && BAOHE_DEPTH_GRID.omittedIndices.includes(i));
}
