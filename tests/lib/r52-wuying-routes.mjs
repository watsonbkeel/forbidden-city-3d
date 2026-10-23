import { southCourtGateGeometry } from '../../src/scene/palace/special/SouthCourtGates.js';
import { wuyingMoonTerraceAccess } from '../../src/scene/palace/special/WuyingMoonTerrace.js';

// R52 successor routes for the actual solid moon terrace. These change only QA
// inputs, not support selection, colliders, production movement, or old oracles.
// The canonical side labels follow the model (west is positive world X).
export function wuyingGalleryRoute(front, { side = 'west', rear } = {}) {
  const access = wuyingMoonTerraceAccess(front, side);
  const x = front.x, z = front.z, aisle = side === 'west' ? 5 : -5;
  const points = [...access.points.map(p => [p.x, p.z]),
    [x, z - 5.95], [x + aisle, z - 5.95], [x + aisle, z + 5.7], [x, z + 5.7]];
  if (rear) {
    if (rear.southCourtProfile !== 'wuying-rear') throw Error('Wuying route needs its registered rear hall');
    points.push([x, rear.z - 5], [x, rear.z - .5]);
  }
  return points;
}

export function wuyingGateApproach(gate, front, side = 'west') {
  const g = southCourtGateGeometry(gate);
  if (g.profile !== 'wuying') throw Error('Wuying route needs its registered gate');
  const access = wuyingMoonTerraceAccess(front, side), toe = access.points[0];
  const portal = g.portals.find(p => side === 'west' ? p.x > g.x : p.x < g.x);
  const south = g.southToe - 2, north = g.northToe + 2;
  // The gate's centre north stair is now covered. Cross a real lateral portal
  // and its retained north stair before moving around the solid causeway.
  return [[g.x, south], [portal.x, south], [portal.x, north], [toe.x, north], [toe.x, toe.z]];
}

export function wuyingGateToGallery(gate, front, options = {}) {
  const access = wuyingGateApproach(gate, front, options.side);
  return [...access.slice(0, -1), ...wuyingGalleryRoute(front, options)];
}
