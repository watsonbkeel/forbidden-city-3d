import test from 'node:test';
import assert from 'node:assert/strict';
import { Minimap } from '../../src/ui/Minimap.js';
import { LAYOUT } from '../../src/config/constants.js';
import { FLIGHT_BOUNDS } from '../../src/scene/flight/FlightEnvelope.js';

for (const [mode, bounds] of Object.entries({ walking: LAYOUT.BOUNDARY, flight: FLIGHT_BOUNDS })) {
  test(mode + ': north and east use the same map distance per model metre', t => {
    t.mock.method(Minimap.prototype, 'init', () => {}); // No DOM needed to test projection.
    const map = new Minimap({ worldBounds: bounds });
    try {
      const {minX, maxX, minZ, maxZ} = bounds;
      const side = Math.min(maxX - minX, maxZ - minZ) / 2;
      const origin = map.worldToMap(maxX, minZ);
      const diagonal = map.worldToMap(maxX - side, minZ + side);
      const east = diagonal.x - origin.x;
      const north = origin.y - diagonal.y;
      assert.ok(east > 0 && north > 0, 'world east is right and north is up');
      // One rounding of the backing canvas height allows at most half a pixel.
      assert.ok(Math.abs(east - north) <= 0.5, `equal world legs projected to ${east} and ${north} px`);
    } finally { map.unsubscribeLocale?.(); }
  });
}
