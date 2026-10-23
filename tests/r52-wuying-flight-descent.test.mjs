import test from 'node:test';
import { flightWorld } from './lib/r15-flight-world.mjs';
import { loadZoneJsons } from './lib/world.mjs';
import { verifyWuyingFlightDescent } from './lib/r52-wuying-flight-check.mjs';

// Standalone CPU functional wrapper. The release integrator imports the helper
// instead and gives it the envelope from its single already-built world.
const W = flightWorld();
W.halls = loadZoneJsons().flatMap(({ json }) => json.items.filter(item => item.kind === 'hall').map(item => ({ item })));
for (const fps of [10, 60]) test(`R52 production flight cannot descend through Wuying and still returns, descends and exits at home ${fps}Hz`, () => {
  verifyWuyingFlightDescent(W, W.envelope, { fps });
});
