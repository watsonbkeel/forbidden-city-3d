/** One coherent, reversible frontage fit. The museum establishes nine bays,
 * central three communicating bays, side warm rooms and two end passages.
 * The unscaled plan supports wider central framing, NOT these metric widths.
 * Rounded stations retain the inherited 46 m envelope; no survey claim.
 */
export const QIANQING_FRONTAGE_FIT = Object.freeze({
  id: 'qianqing-frontage-warm-rooms-r34',
  status: 'OFFICIAL_TOPOLOGY_WITH_ESTIMATED_FRONTAGE_NOT_SURVEY',
  source: 'https://www.dpm.org.cn/explore/building/236472.html',
  plan: 'https://img.dpm.org.cn/Uploads/pdf/2201/T00008_00.pdf',
  fittedStations: Object.freeze([-23,-18,-13,-8,-3.25,3.25,8,13,18,23]),
  warmRoomInnerIndices: Object.freeze([3,6]),
  openBayIndices: Object.freeze([3,4,5]),
  assumption: 'Central bay 6.5 m; adjacent bays 4.75 m; other bays 5 m. Rounded model fit, not measured axes.',
});
export function qianqingFrontageGrid(width) {
  if(!Number.isFinite(width)||Math.abs(width-46)>1e-8)throw Error('Unregistered Qianqing frontage envelope');
  const x=[...QIANQING_FRONTAGE_FIT.fittedStations];
  return {...QIANQING_FRONTAGE_FIT,x,openLeft:x[3],openRight:x[6],passageInner:x[8],passageBayWidth:x[9]-x[8]};
}
