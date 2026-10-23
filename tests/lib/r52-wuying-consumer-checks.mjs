import assert from 'node:assert/strict';
import { PLAYER } from '../../src/config/constants.js';
import { zoneRoutes } from './auto-routes.mjs';
import { replayTerrace, traceTerraceGround } from './terrace-walk.mjs';

/** Integrator entry point: reuse its single already-built current world. */
export function runWuyingConsumerChecks(t, W, options) {
  const zone = W.zones.find(z => (z.json ?? z).id === 'outer-west');
  const routes = zoneRoutes(W, zone.json ?? zone).filter(r => /^wuying-(front|rear)$/.test(r.southCourtProfile));
  assert.equal(routes.length, 2);
  return routes.map(route => {
    const trace = traceTerraceGround(W.cm, { flights: [] });
    let r;
    try { r = replayTerrace(t, W, route.pts, { ...options, recordFrames: true }); }
    finally { trace.restore(); }
    const summary = { route: route.name, ...options, arrived: r.arrived, startFeet: r.startFeet,
      end: r.end, maxFeet: r.maxFeet, maxSpeed: r.maxSpeed, frames: r.frames.length,
      crossings: r.driver.crossings.length, expectedCrossings: route.pts.length - 1 };
    assert.equal(r.arrived, true, JSON.stringify({ ...summary, stuckAt: r.stuckAt }));
    assert.equal(r.startFeet, 0);
    assert.ok(Math.abs(r.end[2]) < 1e-6);
    assert.ok(r.maxFeet >= 1.19 && r.maxFeet < 1.3);
    assert.equal(summary.crossings, summary.expectedCrossings);
    assert.equal(trace.samples.some(s => s.source === 'rescue' || s.source === 'unverified'), false);
    assert.ok(trace.samples.every(s => s.height - s.feetIn <= PLAYER.STEP_UP + 1e-6));
    for (const f of r.frames) assert.equal(W.cm.checkCollision(new W.THREE.Vector3(f.x, f.ground + PLAYER.HEIGHT, f.z)), false, JSON.stringify({ route: route.name, frame: f }));
    return summary;
  });
}
