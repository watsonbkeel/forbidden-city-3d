/** Wumen-only topology candidate. Model registration is not a present-day survey.
 * +Z is north; -X is east. All coordinates are relative to the retained gate
 * origin, NOT the old ascent subgroup's z=2.65 center.
 */
const freeze = object => {
  if (object && typeof object === 'object') { Object.values(object).forEach(freeze); Object.freeze(object); }
  return object;
};
export const WUMEN_ASCENT_PROFILE = freeze({
  id: 'wumen-folded-ascent-source-fit',
  status: 'SOURCE_GROUNDED_TOPOLOGY_ENGINEERING_FIT_NOT_MEASURED_2026',
  sources: [
    { id: 'topology', url: 'https://www.dpm.org.cn/Uploads/File/2021/11/23/u619c5a27422d3.pdf', evidence: '2021 exhibition plan, printed pp152–153: both three-leg folded ascents; no scale or levels.' },
    { id: 'dimensions', url: 'https://img.dpm.org.cn/Uploads/pdf/2196/T00014_00.pdf', evidence: 'Zheng Lianzhang, printed p14, publication year not established: width6.2, horizontal lengths15.3/25.59/25.5, abutment13.' },
    { id: 'modern-steps', url: 'https://www.cactch.org.cn/webfile/upload/2021/02-09/09-55-430520991296728.pdf', evidence: '2013 paper, printed p457 and fig13 p463: some Wumen surfacing changed to steps; modern gate shown. Donghuamen plans are not Wumen plans.' },
    { id: 'appearance', url: 'https://www.dpm.org.cn/explore/building/236454.html', evidence: 'Official Wumen photographs support masonry appearance, not measured dimensions or photograph date.' },
  ],
  documentary: { firstWidth: 6.2, horizontalLengths: [15.3, 25.59, 25.5], oldAbutmentHeight: 13,
    interpretation: 'Historical reported runs are retained separately. Their start/end datums and contemporary registration are unknown.' },
  retained: { platformHalfWidth: 60, platformSouth: -13.3, platformNorth: 18.6, platformTop: 12.3,
    worldAnchorZ: -419.6, southWallTop: 10, southWallMinZ: -5.4, southWallMaxZ: 3.2 },
  fit: { width: 6.2, flightRuns: [15.3, 25.5, 25.5], floorLevels: [0, 3.3, 10, 12.3],
    terminalLandingLength: 6.2, innerX: 60, flightInnerX: 66.2, flightOuterX: 91.7, outerX: 97.9,
    upperBand: [-3, 3.2], middleBand: [3.65, 9.85], firstNorthZ: 25.15,
    parapetThickness: .45, parapetHeight: 1.1, targetRiser: .18, treadThickness: .18,
    bodySlice: 1, barrierSlice: 2,
    registration: 'First run15.3 and gross width6.2 reused; outward25.59 rounded to25.5. Return25.5 is a sloped-run fit PLUS a separate6.2 terminal landing. No claim those extra landing extents were in the published lengths.',
    levels: '3.3 is a provisional first landing. 10 is the retained wall interface; 12.3 is the retained gate slab. These are not surveyed intermediate elevations.' },
  gameplaySafety: {
    classification: 'VIRTUAL_GAMEPLAY_SAFETY_PROXY_NOT_SURVEYED_GEOMETRY',
    noVaultExtension: 1.5,
    boundaries: ['return-south', 'terminal-south', 'outer-fold-south', 'outer-fold-end'],
    explanation: 'Only these wall-adjacent parapet colliders extend1.5 above their visible1.1 m masonry, retaining the old ascent no-vault policy. This prevents jumps into the inherited non-walkable wall body or adjacent cap; it is not a wall height measurement, visible rail, bridge or extra support surface.',
  },
  wallInterface: { absoluteX: [60, 97.9], capExclusion: true, retainSolidWall: true, openWallWalkway: false,
    explanation: 'Return rises10→12.3 on retained wall masonry. Exclude only intersecting cap geometry over this interval; retain unrelated crenels, wall body and global wall non-walkability.' },
  limitations: [
    'Exact present-day flight endpoints, levels, landing widths and masonry batter remain unmeasured.',
    'Rendered equal treads are a provisional legible surface, not documented current tread counts or an exact division of steps and serrated paving.',
    'Mirrored geometry is a minimal model fit; the two sides are not claimed surveyed mirror images.',
    'Museum circulation directions and access restrictions vary by exhibition; this model grants no current visitor-access inference.',
  ],
});

/** Plain-data geometry shared by the renderer and CPU navigation checks. */
export function wumenAscentGeometry(profile = WUMEN_ASCENT_PROFILE) {
  const f = profile.fit;
  const rect = (sign, x0, x1, z0, z1) => ({ minX: Math.min(sign * x0, sign * x1), maxX: Math.max(sign * x0, sign * x1), minZ: z0, maxZ: z1 });
  const sides = [-1, 1].map(sign => {
    const prefix = sign < 0 ? 'east' : 'west';
    const flight = (name, axis, a0, a1, y0, y1, bounds) => ({ id: `${prefix}-${name}`, axis, a0, a1, y0, y1, ...bounds });
    const flights = [
      flight('north-entry', 'z', f.firstNorthZ, f.middleBand[1], 0, 3.3, rect(sign, f.innerX, f.flightInnerX, f.middleBand[1], f.firstNorthZ)),
      flight('outward', 'x', sign * f.flightInnerX, sign * f.flightOuterX, 3.3, 10, rect(sign, f.flightInnerX, f.flightOuterX, ...f.middleBand)),
      flight('return', 'x', sign * f.flightOuterX, sign * f.flightInnerX, 10, 12.3, rect(sign, f.flightInnerX, f.flightOuterX, ...f.upperBand)),
    ];
    const landings = [
      { id: `${prefix}-inner-turn`, ...rect(sign, f.innerX, f.flightInnerX, ...f.middleBand), y: 3.3 },
      { id: `${prefix}-outer-fold`, ...rect(sign, f.flightOuterX, f.outerX, f.upperBand[0], f.middleBand[1]), y: 10 },
      { id: `${prefix}-terminal`, ...rect(sign, f.innerX, f.flightInnerX, ...f.upperBand), y: 12.3 },
    ];
    const route = [[63.1, 27.15], [63.1, 25.15], [63.1, 9.85], [63.1, 6.75], [66.2, 6.75], [91.7, 6.75],
      [94.8, 6.75], [94.8, .1], [91.7, .1], [66.2, .1], [63.1, .1], [58, .1]].map(([x, z]) => [sign * x, z]);
    return { sign, name: prefix, flights, landings, route };
  });
  return { profile, sides };
}
