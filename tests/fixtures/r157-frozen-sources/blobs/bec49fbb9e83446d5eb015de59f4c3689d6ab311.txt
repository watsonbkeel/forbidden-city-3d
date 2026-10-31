/** R92 east-only compatibility fit, not a current survey.
 * 1941 Museum plan: total lower width128.50m, east setbacks5.55/5.11m.
 * Metric-bar registration supports upper53–55m/lower64–66m. Upper53.6m
 * is a rounded engineering anchor. Existing north Z, heights, west side and
 * north approach geometry remain intentionally inherited, not re-surveyed.
 */
export const BAOHE_EAST_TERRACE = Object.freeze({
  id:'baohe-east-terrace', side:'east', upperHalfWidth:53.6,
  eastEdges:Object.freeze([-64.26,-58.71,-53.6]),
  outerWallStartX:-64.97666666666667,
  evidence:'1941_METRIC_PLAN_WITH_CURRENT_PHOTO_TOPOLOGY_AND_LONGITUDINAL_COMPATIBILITY',
});
export function baoheEastTerraceProfile(rects,{layers,lh}) {
  if(rects?.length!==3||layers!==3||Math.abs(lh-8/3)>1e-8||Math.abs(rects[2].hw-28.85)>1e-8)throw Error('Baohe east terrace requires retained three-hall controls');
  return {...BAOHE_EAST_TERRACE,eastEdges:[...BAOHE_EAST_TERRACE.eastEdges],rectIndex:2,
    northZ:rects[2].z1,southZ:rects[2].z0,levels:[lh,2*lh,3*lh],westUpperX:rects[2].hw};
}
