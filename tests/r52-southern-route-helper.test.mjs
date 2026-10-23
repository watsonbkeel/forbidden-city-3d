import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CollisionManager } from '../src/utils/Collision.js';
import { gateGeom, loadZoneJsons } from './lib/world.mjs';
const apiURL = new URL('./helpers/r52-southern-route-validation.mjs', import.meta.url);
const api = await import(apiURL).catch(e => e.code === 'ERR_MODULE_NOT_FOUND' ? {} : Promise.reject(e));

test('southern route helper provides an injected-world runner, not another world builder', () => {
  assert.equal(typeof api.buildSouthernRouteFixtures, 'function');
  assert.equal(typeof api.runSouthernRoute, 'function');
  assert.equal(typeof api.assertSouthernTrace, 'function');
});

test('fixtures join three Wumen round trips and the east/west court loop without repeated spawn points', () => {
  const routes = api.buildSouthernRouteFixtures({ zones: loadZoneJsons() });
  assert.equal(routes.length, 4);
  assert.deepEqual(routes.map(r => r.id), ['wumen-taihe-return', 'wumen-wenhua-zhujing-return', 'wumen-wuying-jingsi-return', 'wumen-east-west-courts-return']);
  for (const r of routes) {
    assert.deepEqual(r.points[0], r.points.at(-1));
    assert.equal(r.checkpoints[0].id, 'wumen-ground');
    assert.equal(r.acceptance, 'PENDING_ACTUAL_CANDIDATE_WORLD_RUN');
    assert.ok(r.points.every(p => p.length === 2 && p.every(Number.isFinite)));
    assert.ok(r.points.slice(1).every((p, i) => Math.hypot(p[0] - r.points[i][0], p[1] - r.points[i][1]) > 1e-8));
  }
  assert.ok(routes[3].checkpoints.some(p => p.id === 'zhujing-interior'));
  assert.ok(routes[3].checkpoints.some(p => p.id === 'jingsi-interior'));
});

test('trace guard rejects every real failure class, including a missing outward or return floor visit', () => {
  const route = { id: 'guard-only', points: [[0, 0], [0, 5], [0, 0]], startFeet: 0, endFeet: 0,
    checkpoints: [{ id: 'raised-floor', x: 0, z: 2.5, feet: 1, visits: 2 }] };
  const frame = (waypoint, feet = 1) => ({ x: 0, z: 2.5, feet, ground: 1, speed: 3, waypoint });
  const good = { arrived: true, startFeet: 0, end: [0, 0, 0], maxSpeed: 3,
    driver: { crossings: [{ index: 1 }, { index: 2 }] }, frames: [frame(1), { ...frame(1), z: 5 }, frame(2)] };
  const trace = [{ source: 'box', height: 1, feetIn: 1 }];
  const verify = (r = good, s = trace, count = 1) => api.assertSouthernTrace(route, r, s, count);
  assert.doesNotThrow(() => verify());
  assert.throws(() => verify({ ...good, arrived: false }), /arriv/i);
  assert.throws(() => verify(good, trace, 2), /placement/i);
  assert.throws(() => verify({ ...good, startFeet: 12 }), /start feet/i);
  assert.throws(() => verify(good, [{ source: 'rescue', height: 1, feetIn: 0 }]), /rescue/i);
  assert.throws(() => verify(good, [{ source: 'unverified', height: 1, feetIn: 0 }]), /unverified/i);
  assert.throws(() => verify(good, [{ source: 'box', height: 1, feetIn: 0 }]), /step/i);
  assert.throws(() => verify({ ...good, frames: [frame(1), frame(2, 0)] }), /under|floor/i);
  assert.throws(() => verify({ ...good, frames: [frame(1)] }), /return|visits/i);
  assert.throws(() => verify({ ...good, frames: [frame(1), { ...frame(2), x: NaN }] }), /finite/i);
  assert.throws(() => verify({ ...good, driver: { crossings: [{ index: 1 }] } }), /contact/i);
});

test('injected real controller round trip preserves one placement on a tiny physical test world', t => {
  const W = { THREE, cm: new CollisionManager() };
  const r = { id: 'synthetic-flat-control-only', points: [[0, 0], [0, 6], [0, 0]], startFeet: 0, endFeet: 0,
    checkpoints: [{ id: 'middle', x: 0, z: 3, feet: 0, visits: 2 }] };
  const summary = api.runSouthernRoute(t, W, r, { fps: 10, sprint: true });
  assert.equal(summary.pass, true);
  assert.equal(summary.placements, 1);
  assert.equal(summary.platform, 'CPU_REAL_CONTROLLER_NOT_WEBGL_OR_PHONE');
});

test('map-arrival guard requires the resolved actual height, never a ground-only assertion under a new deck', () => {
  assert.equal(typeof api.verifySouthernMapArrivals, 'function');
  const cm = new CollisionManager();
  cm.addWalkables([{ type: 'box', box: new THREE.Box3(new THREE.Vector3(-3, 0, -3), new THREE.Vector3(3, 1.2, 3)), rescue: false }]);
  const W = { THREE, cm };
  const teleport = { resolveLanding: name => ({ name, x: 0, z: 0, y: 1.2, fallback: false }), geometryFor: name => ({ name }), isSafe: () => true };
  assert.equal(api.verifySouthernMapArrivals(W, teleport, ['synthetic-height-guard'])[0].feetY, 1.2);
  assert.throws(() => api.verifySouthernMapArrivals(W, { ...teleport, resolveLanding: () => ({ x: 0, z: 0, y: 0 }) }, ['synthetic-height-guard']), /surface|height/i);
  assert.throws(() => api.verifySouthernMapArrivals(W, { ...teleport, resolveLanding: () => null }, ['synthetic-height-guard']), /landing/i);
});


test('south-gate checkpoint follows the authored lateral portal rather than a stale centre', () => {
  assert.equal(typeof api.authoredSouthGateCrossing, 'function');
  const gate = loadZoneJsons().find(z => z.json.id === 'outer-west').json.items.find(i => i.southGateProfile === 'wuying');
  const geom = gateGeom(gate), x = gate.x + geom.profile.portalCenters.at(-1);
  assert.notEqual(x, gate.x);
  assert.deepEqual(api.authoredSouthGateCrossing([[x, gate.z - 2], [x, gate.z + 2]], gate), [x, gate.z]);
  assert.throws(() => api.authoredSouthGateCrossing([[x, gate.z - 2], [x, gate.z - 1]], gate), /portal/i);
  assert.throws(() => api.authoredSouthGateCrossing([[gate.x + 500, gate.z - 2], [gate.x + 500, gate.z + 2]], gate), /portal/i);
});
