import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { registerHooks } from 'node:module';
import { buildWorld, pointBlocked, walkStraight } from './lib/world.mjs';
import { buildAutoRoutes } from './lib/auto-routes.mjs';
import { pavilionGeometry } from '../src/scene/palace/special/PavilionProfiles.js';
import { PLAYER, TELEPORT } from '../src/config/constants.js';

// Match Vite's JSON import handling without replacing Teleport or its methods.
const jsonImports = registerHooks({ load(url, context, next) {
  return next(url, url.endsWith('.json') ? { ...context, importAttributes: { ...context.importAttributes, type: 'json' } } : context);
} });
const { Teleport } = await import('../src/ui/Teleport.js');
jsonImports.deregister();

const W = await buildWorld();
const zones = W.zones.map(z => z.json);
const pavilions = zones.flatMap(z => z.items).filter(i => i.pavilionProfile);
// Version-scoped V3/V4/V6 fixtures exclude only the new V7 昭德 route.
const routes = buildAutoRoutes(W, zones).filter(r => r.gateProfile !== 'zhaode');
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-6, `${label}: ${actual} != ${expected}`);

test('V4 preserves all 51 V3 automatic identities and all 50 non-pavilion point sequences', () => {
  // Captured from published V3 c27ba9e47cfe2fc4dc3e82f4d8faf145e69745b3.
  const baseline = routes.filter(r => !r.pavilionFlight && !r.terraceSide && r.hall !== '弘义阁');
  assert.equal(baseline.length, 51);
  assert.equal(sha(baseline.map(r => r.name)), 'a98606c24eb75a1bc1aca254167f219c5df23c13c1f5c703b090568d730f7f20');
  assert.equal(sha(baseline.filter(r => r.hall !== '体仁阁').map(({ name, pts }) => ({ name, pts }))),
    '432fc33d73f7d96de9ea56c34b8b0ee640f2ca5f4ac9eaa49b2ccbd31976aa44');
  assert.equal(routes.filter(r => r.hall === '弘义阁' && !r.pavilionFlight).length, 1, 'Hongyi is one newly enterable hall route');
  assert.equal(routes.filter(r => r.pavilionFlight).length, 4, 'four added front-flight round trips');
  assert.equal(routes.filter(r => !r.terraceSide).length, 56);
  assert.equal(routes.length, 58);
});

test('the static collision world exposes actual pavilion room and map geometry', () => {
  assert.ok(Array.isArray(W.rooms), 'expose built room metadata rather than reconstructing it from dimensions');
  assert.ok(Array.isArray(W.mapItems), 'expose actual built map dimensions for the Teleport fallback');
  assert.equal(pavilions.length, 2);
  for (const item of pavilions) {
    const g = pavilionGeometry(item), rooms = W.rooms.filter(r => r.name === item.name);
    assert.equal(rooms.length, 1, 'exactly one publicly enterable lower room');
    near(rooms[0].floorY, g.lower.floorY, 'lower floor');
    assert.equal(rooms[0].doors.length, 1);
    const [x, z] = g.toWorld(0, g.lower.front);
    assert.ok(Math.hypot(rooms[0].doors[0].x - x, rooms[0].doors[0].z - z) < 0.015);
    assert.ok(W.mapItems.some(m => m.name === item.name));
  }
});

test('both gate-to-pavilion routes keep the complete physical approach before returning', () => {
  assert.equal(pavilions.length, 2);
  for (const item of pavilions) {
    const g = pavilionGeometry(item), route = routes.find(r => r.hall === item.name && !r.pavilionFlight);
    assert.ok(route, `${item.name}: a gate-to-lower-room route is required`);
    assert.ok(!route.plan.some(p => p.includes('交由浏览器')), route.plan.join('; '));
    const approach = g.approaches[route.pavilionApproach];
    assert.ok(approach, 'the approach must name the physical front flight');
    const go = approach.worldPoints.map(p => [p.x, p.z]);
    const interiorIndex = (route.pts.length - 1) / 2;
    assert.deepEqual(route.pts.slice(interiorIndex - go.length + 1, interiorIndex + 1), go);
    assert.deepEqual(route.pts.slice(interiorIndex + 1), route.pts.slice(0, interiorIndex).reverse());
  }
});

test('the central carved strip, platform side, lower windows and rear stay physically blocked', () => {
  assert.equal(pavilions.length, 2);
  for (const item of pavilions) {
    const g = pavilionGeometry(item), strip = g.royalStrip;
    const [x, z] = g.toWorld(0, (strip.zToe + strip.zTop) / 2);
    assert.equal(pointBlocked(W, x, z, g.elevations.front_court), true, 'the real sloped stone blocks a ground-level visitor');
    const from = g.toWorld(0, strip.zToe - 2.4), into = g.toWorld(0, g.platform.z0 + 2.2);
    const cut = walkStraight(W, from, into, { feet0: g.elevations.front_court });
    assert.ok(cut.reached < cut.total - 1, 'direct center-strip shortcut must fail');
    for (const [lx, lz] of [[0, g.lower.rear], [g.lower.width / 2, 0], [g.lower.intervals[4], g.lower.front]]) {
      assert.equal(pointBlocked(W, ...g.toWorld(lx, lz), g.lower.floorY), true, 'walls/windows remain solid');
    }
    assert.equal(pointBlocked(W, ...g.toWorld(10, g.platform.z0 + 1), 0), true, 'ground-level visitors cannot enter the platform side');
    assert.equal(W.cm.getGroundHeight(...g.toWorld(0, 0), g.lower.floorY, PLAYER.STEP_UP), g.lower.floorY,
      'the upper floor must not rescue lower-floor visitors upstairs');
  }
});

test('unchanged Teleport safety resolves the actual pavilion front on the lower terrace', () => {
  assert.equal(pavilions.length, 2);
  assert.deepEqual([TELEPORT.MIN_WALK, TELEPORT.NEAR_FRONT, TELEPORT.MIN_DISTANCE, TELEPORT.MAX_LATERAL, PLAYER.STEP_UP], [3, 2, 1, 6, 0.6]);
  const teleport = Object.create(Teleport.prototype);
  teleport.targets = new Map(pavilions.map(i => [i.name, i]));
  teleport.zoneManager = { getMapItems: () => W.mapItems };
  teleport.collisionManager = W.cm;
  for (const item of pavilions) {
    const physical = pavilionGeometry(item), g = teleport.geometryFor(item.name);
    const [frontX, frontZ] = physical.toWorld(0, physical.lower.front);
    near(g.frontX, frontX, 'actual front X'); near(g.frontZ, frontZ, 'actual front Z');
    near(g.half, physical.lower.depth / 2, 'actual building half-depth');
    const landing = teleport.resolveLanding(item.name);
    assert.ok(landing, `${item.name}: existing safety search must resolve a landing`);
    assert.equal(teleport.isSafe(landing, g), true);
    assert.equal(teleport.lineOfSight(landing, g), true);
    assert.equal(pointBlocked(W, landing.x, landing.z, landing.y), false);
    near(landing.y, physical.platform.y, 'safe lower terrace landing');
    assert.ok(Math.abs(landing.lateral) <= TELEPORT.MAX_LATERAL);
    // The map intentionally draws the off-centre terrace footprint; the real
    // target record must continue supplying the building's own measured depth.
    const map = W.mapItems.find(m => m.name === item.name);
    near(Math.abs(Math.sin(physical.rot)) > 0.5 ? map.w : map.d, physical.platform.depth, 'map terrace depth');
    near(item.d, physical.lower.depth, 'target depth takes precedence over terrace map bounds');
  }
});
