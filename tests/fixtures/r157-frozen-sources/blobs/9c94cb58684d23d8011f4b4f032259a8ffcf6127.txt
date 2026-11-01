import * as THREE from 'three';
import { applyBoxUV } from '../../utils/GeometryUV.js';

/**
 * Plan-supported topology, deliberately provisional dimensions. The 1960 plan
 * registers near z57 from Zhonghe and z60 from Taihe; its outer ink is about
 * 5–6m wide. z58 / outside width5 are compatibility choices, NOT a survey or
 * measured clear width. Current museum visitor access is unknown.
 */
export function threeHallTerraceProfile(rects, { layers, lh, run, setback, waistIndex, hall }) {
  const centerZ = 58, outerWidth = 5, cheekWidth = 0.45;
  const openingZ = [centerZ - outerWidth / 2, centerZ + outerWidth / 2];
  const walkableCrossZ = [openingZ[0] + cheekWidth, openingZ[1] - cheekWidth];
  const profile = {
    id: 'three-hall-waist-stairs', waistIndex, centerZ, outerWidth, cheekWidth,
    openingZ, walkableCrossZ, bodyCenterCrossZ: [walkableCrossZ[0] + 0.5, walkableCrossZ[1] - 0.5],
    evidenceClass: 'ENGINEERING_ASSUMPTION_WITH_PLAN_SUPPORTED_TOPOLOGY',
    tierDimensions: 'INHERITED_PROVISIONAL', currentAccessStatus: 'UNKNOWN',
    sourceIds: ['yu1960-three-halls-plan', 'sun2020-three-terraces-photo'],
    uncertainty: { coordinateEnvelopeM: 3, outerWidthEnvelopeM: 1, statisticalInterval: false },
    flights: [], approaches: {},
  };
  for (let tier = 0; tier < layers; tier++) for (const [side, dir] of [['east', -1], ['west', 1]]) {
    const xEdge = dir * (rects[waistIndex].hw + (layers - 1 - tier) * setback);
    const y0 = tier * lh, y1 = y0 + lh, xToe = xEdge + dir * run;
    const f = {
      id: `${profile.id}:${side}:${tier + 1}`, side, dir, tier: tier + 1,
      rectIndex: waistIndex, xEdge, xToe, centerZ, y0, y1, run,
      width: outerWidth, cheekWidth, treadCount: Math.max(3, Math.round(lh / 0.16)),
      openingZ: [...openingZ], walkableCrossZ: [...walkableCrossZ],
      landingBeforeNextTier: tier < layers - 1 ? setback - run : null,
    };
    f.ramp = { type: 'ramp', axis: 'x', minX: Math.min(xEdge, xToe), maxX: Math.max(xEdge, xToe),
      minZ: walkableCrossZ[0], maxZ: walkableCrossZ[1], a0: xEdge, a1: xToe, y0: y1, y1: y0 };
    profile.flights.push(f);
  }
  for (const [side, dir] of [['east', -1], ['west', 1]]) {
    const flights = profile.flights.filter(f => f.side === side);
    const last = flights.at(-1), topX = last.xEdge - dir;
    // QA waypoints retain every physical toe/head and both intervening landings.
    // The approach/turn clearances are gameplay checks, not source dimensions.
    const points = [
      { kind: 'groundOutside', x: flights[0].xToe + dir * 4.3, z: centerZ, y: 0 },
      ...flights.flatMap(f => [
        { kind: 'toe', flightId: f.id, x: f.xToe, z: centerZ, y: f.y0 },
        { kind: 'head', flightId: f.id, x: f.xEdge, z: centerZ, y: f.y1 },
      ]),
      { kind: 'upperLanding', x: topX, z: centerZ, y: last.y1 },
      { kind: 'plinthApproach', x: topX, z: hall.position.z, y: last.y1 },
      { kind: 'veranda', x: dir * (hall.dimensions.width / 2 - 1.7), z: hall.position.z },
    ];
    profile.approaches[side] = { side, points };
  }
  return profile;
}

/** Closed union of the inherited tread boxes: top, all risers, two stepped
 * side profiles, toe, head and underside. No overlapping full tread boxes and
 * no hidden-face credit. 17 treads -> 140 triangles, before the two cheeks.
 */
export function closedTerraceStairGeometry(flight, tileSize) {
  const { run, y0, y1, width, dir, xEdge, centerZ, treadCount: n } = flight;
  const rise = y1 - y0;
  const shape = new THREE.Shape();
  // Triangulate in an exact integer grid first. Floating metre arithmetic
  // creates collinear near-zero-area cap slivers in Earcut. Scaling afterward
  // retains all 36 boundary vertices and all 34 valid triangles per side.
  shape.moveTo(0, 0); shape.lineTo(n, 0);
  for (let k = n - 1; k >= 0; k--) {
    const top = n - k;
    shape.lineTo(k + 1, top);
    shape.lineTo(k, top);
  }
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false, steps: 1, curveSegments: 1 });
  geometry.scale(run / n, rise / (n + 1), 1);
  geometry.translate(0, 0, -width / 2);
  if (dir < 0) geometry.rotateY(Math.PI); // Rotation retains outward winding.
  geometry.translate(xEdge, y0, centerZ);
  return applyBoxUV(geometry, tileSize);
}
