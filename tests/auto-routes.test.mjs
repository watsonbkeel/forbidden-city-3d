import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { buildWorld, gateGeom, hallGeom, parseRot, pointBlocked, walkStraight } from './lib/world.mjs';
import { buildAutoRoutes, zoneRoutes } from './lib/auto-routes.mjs';
import { FirstPersonControls } from '../src/controls/FirstPerson.js';
import { replayTerrace } from './lib/terrace-walk.mjs';
import { sideGateGeometry } from '../src/scene/palace/special/SideGateProfiles.js';
import { pavilionGeometry } from '../src/scene/palace/special/PavilionProfiles.js';

const W = await buildWorld();
const zone = W.zones.find(z => z.json.id === 'outer-west').json;
const yudeRoute = () => zoneRoutes(W, zone).find(r => r.hall === '浴德堂');
const fixedRoutes = () => execFileSync(process.execPath, [new URL('./stepwalk.cjs', import.meta.url).pathname, '60,10', '0,1', 'all'],
  { env: { ...process.env, DUMP: '1' }, encoding: 'utf8' }).trim().split('\n').map(line => {
  const start = line.indexOf('[[');
  return { name: line.slice(0, start).trim(), pts: JSON.parse(line.slice(start)) };
});

function assertWalkable(world, pts) {
  let feet;
  for (let k = 1; k < pts.length; k++) {
    const result = walkStraight(world, pts[k - 1], pts[k], { feet0: feet });
    assert.ok(result.reached >= result.total - 0.5,
      `segment ${k} ${JSON.stringify(pts[k - 1])} → ${JSON.stringify(pts[k])}: ${JSON.stringify(result)}`);
    feet = result.feet;
  }
}

// Browserless replay of the real controller. Only event targets and the clock
// are stubbed; movement, collision, head bob, radius, 0.8 m arrival and the
// segment time/stuck budgets are unchanged from stepwalk-runner.cjs.
function replay(t, world, pts, fps, sprint) {
  const noop = () => {};
  const doc = { ...globalThis.document, addEventListener: noop, removeEventListener: noop, exitPointerLock: noop };
  const oldDoc = globalThis.document, oldWindow = globalThis.window;
  globalThis.document = doc;
  globalThis.window = { addEventListener: noop, removeEventListener: noop };
  let time = 0;
  const clock = t.mock.method(performance, 'now', () => time);
  const camera = new world.THREE.PerspectiveCamera();
  const controls = new FirstPersonControls(camera, { ownerDocument: doc, addEventListener: noop, removeEventListener: noop }, world.cm);
  controls.controls.isLocked = true;
  controls.setPosition(pts[0][0], 300, pts[0][1]);
  controls.moveForward = true;
  controls.canSprint = sprint;
  const terraces = world.cm.walkables.filter(w => w.type === 'box' && w.rescue !== false && w.box.max.y >= 1).map(w => w.box);
  let fellUnder = null;
  try {
    for (let k = 1; k < pts.length; k++) {
      const [x, z] = pts[k];
      const limit = Math.ceil(Math.hypot(x - camera.position.x, z - camera.position.z) / 2 * fps) + fps * 4;
      let stuck = 0, last = [camera.position.x, camera.position.z], reached = false;
      for (let frame = 0; frame < limit; frame++) {
        time += 1000 / fps;
        camera.lookAt(x, camera.position.y, z);
        controls.update();
        const p = camera.position;
        if (!fellUnder && controls.verticalVelocity === 0 && terraces.some(b => p.x > b.min.x + 1 && p.x < b.max.x - 1 && p.z > b.min.z + 1 && p.z < b.max.z - 1 && controls.feetY < b.max.y - 1.2)) {
          fellUnder = [p.x, p.z, controls.feetY];
        }
        if (Math.hypot(p.x - x, p.z - z) < 0.8) { reached = true; break; }
        if (frame % fps === 0 && frame > 0) {
          if (Math.hypot(p.x - last[0], p.z - last[1]) < 0.3) stuck++; else stuck = 0;
          last = [p.x, p.z];
          if (stuck >= 2) break;
        }
      }
      if (!reached) return { arrived: false, stuckAt: pts[k], end: [camera.position.x, camera.position.z, controls.feetY], fellUnder };
    }
    return { arrived: true, fellUnder };
  } finally {
    controls.dispose();
    clock.mock.restore();
    globalThis.document = oldDoc;
    globalThis.window = oldWindow;
  }
}

test('gate depth follows explicit topology, including narrow five-bay and wide ordinary gates', () => {
  const base = { kind: 'gate', x: 0, z: 0 };
  assert.equal(gateGeom({ ...base, w: 34.9, style: 'hall', gateKind: 'five-bay' }).half, 5.8);
  assert.equal(gateGeom({ ...base, w: 18, gateKind: 'five-bay' }).half, 4);
  assert.equal(gateGeom({ ...base, w: 28, gateKind: 'three-bay' }).half, 4);
  assert.equal(gateGeom({ ...base, w: 28, style: 'hall' }).half, 4);
  assert.equal(gateGeom({ ...base, w: 28 }).half, 7.5);
  assert.equal(gateGeom({ ...base, w: 28, style: 'hall', gateKind: 'wall' }).half, 7.5);
});

test('rotated gate depth matches the actual five-bay platform extents', async () => {
  for (const rot of [0, 'east', 'north', 'west']) {
    const item = { kind: 'gate', x: 17, z: 23, w: 34.9, rot, gateKind: 'five-bay' };
    const world = await buildWorld({ zones: [{ json: { id: 'rotated-gate', items: [item] } }], statics: false });
    const g = gateGeom(item);
    for (const side of [-1, 1]) {
      const at = distance => [g.x + side * g.dir[0] * distance, g.z + side * g.dir[1] * distance];
      assert.equal(world.cm.getGroundHeight(...at(g.half - 0.05), 0, 0.6), 0.45);
      assert.equal(world.cm.getGroundHeight(...at(g.half + 0.05), 0, 0.6), 0);
    }
  }
});

test('the old Yude corner retains the rear-column collision and early-turn controller failure', t => {
  const old = [[220.8, -259.8], [220.8, -243.8], [246, -243.8], [246, -183.8], [246, -180.3]];
  const exact = walkStraight(W, old[1], old[2]);
  assert.ok(exact.reached >= exact.total - 0.5, 'exact old line masks the early-turn bug');
  const clipped = walkStraight(W, [220.8, -244.1], [246, -244.1]);
  assert.ok(clipped.reached < 3, 'rear gate column must remain physical');
  assert.equal(pointBlocked(W, 246, -242), true, 'the old L corner after correcting the depth is inside Huanzhang Hall');
  const result = replay(t, W, old, 60, false);
  assert.equal(result.arrived, false);
  assert.deepEqual(result.stuckAt, old[2]);
});

test('generated Yude round-trip clears real colliders and avoids an unplanned fallback', () => {
  const route = yudeRoute();
  assert.ok(!route.plan.some(line => line.includes('交由浏览器')), route.plan.join('; '));
  assertWalkable(W, route.pts);
});

for (const fps of [60, 10]) for (const sprint of [false, true]) {
  test(`generated Yude round-trip reaches every waypoint with the real controller: ${fps} fps, sprint=${sprint}`, t => {
    const result = replay(t, W, yudeRoute().pts, fps, sprint);
    assert.equal(result.arrived, true, JSON.stringify(result));
  });
}

test('pavilion route geometry follows the measured profile rather than legacy hall padding or a center stair', () => {
  for (const pavilionProfile of ['hongyi', 'tiren']) {
    const item = { kind: 'hall', pavilionProfile, x: 30, z: 40, w: 12, d: 6, ph: 0.9, pad: 1, enter: true };
    const physical = pavilionGeometry(item), g = hallGeom(item);
    assert.equal(g.profile?.profile, pavilionProfile, 'use the production geometry helper');
    assert.equal(g.w, physical.lower.width);
    assert.equal(g.d, physical.lower.depth);
    assert.equal(g.ph, physical.lower.floorY);
    assert.deepEqual(g.roomBounds, physical.roomBounds);
    assert.equal(g.front, physical.lower.front);
    assert.deepEqual(g.toW(0, g.front), physical.toWorld(0, physical.lower.front));
  }
});

test('two pavilion flights each retain exact toe, top, terrace, door and interior points in both directions', () => {
  const items = ['hongyi', 'tiren'].map((pavilionProfile, i) => ({
    kind: 'hall', structure: 'surveyed-pavilion', pavilionProfile, name: `pavilion-${i}`, x: i * 100, z: 0, enter: true,
  }));
  const routes = buildAutoRoutes(W, [{ id: 'pavilion-coverage', items }]);
  assert.equal(routes.length, 4, 'one explicit round trip per physical front stair flight');
  for (const item of items) {
    const g = pavilionGeometry(item), own = routes.filter(r => r.hall === item.name);
    assert.deepEqual(own.map(r => r.pavilionFlight), ['frontLeft', 'frontRight']);
    for (const route of own) {
      const approach = g.approaches[route.pavilionFlight];
      const go = approach.worldPoints.map(p => [p.x, p.z]);
      assert.deepEqual(approach.points.map(p => p.kind), ['outside', 'groundToe', 'stairTop', 'platform', 'terraceTurn', 'centralDoor', 'interior']);
      assert.deepEqual(route.pts, [...go, ...go.slice(0, -1).reverse()], 'never simplify or round away physical route points');
      assert.equal(approach.points[1].x, g.frontFlights.find(f => f.side === route.pavilionFlight).centerX);
      assert.ok(Math.abs(approach.points[1].x) > g.royalStrip.width / 2, 'use a side flight, not the carved strip');
    }
  }
});

for (const fps of [60, 10]) for (const sprint of [false, true]) {
  test(`all 33 fixed routes retain real-controller passage: ${fps} fps, sprint=${sprint}`, t => {
    const routes = fixedRoutes();
    assert.equal(routes.length, 33);
    const failures = [];
    for (const route of routes) {
      const result = replay(t, W, route.pts, fps, sprint);
      if (!result.arrived || result.fellUnder) failures.push({ name: route.name, ...result });
    }
    assert.deepEqual(failures, []);
  });
}

test('the four fixed high-gate transits reach actual ramp toes and ground before turning', () => {
  const routes = fixedRoutes().filter(route => /^(协和门|熙和门)→/.test(route.name));
  assert.equal(routes.length, 4);
  for (const route of routes) {
    const gate = W.gates.find(g => g.item.name === route.name.split('→')[0]);
    const g = gate.profile, front = g.ramps.find(r => r.side === 'front'), rear = g.ramps.find(r => r.side === 'rear');
    for (const z of [rear.zToe + 2, rear.zToe, rear.zTop, front.zTop, front.zToe, front.zToe - 2]) {
      const point = g.toWorld(0, z);
      assert.ok(route.pts.some(p => Math.hypot(p[0] - point[0], p[1] - point[1]) < 1e-6), `${route.name}: missing physical transit point ${point}`);
    }
    const oldCorner = g.toWorld(0, -20);
    assert.ok(W.cm.getGroundHeight(...oldCorner, g.platformY) > 0, 'old 20 m corner is on the slope, although controller traversal remains possible');
    const groundedCorner = g.toWorld(0, front.zToe - 2);
    assert.equal(W.cm.getGroundHeight(...groundedCorner, g.platformY), 0);
  }
});

test('the same bounded detour works after translating, renaming, and rotating the courtyard', async () => {
  const source = zone.items.filter(i => ['武英门', '武英殿', '焕章殿', '浴德堂'].includes(i.name));
  const items = source.map((item, index) => ({
    ...item, name: `building-${index}`, x: item.z + 300, z: -item.x + 400,
    rot: parseRot(item.rot) + Math.PI / 2,
    enter: item.name === '浴德堂',
  }));
  const rotated = { id: 'translated-court', items };
  const world = await buildWorld({ zones: [{ json: rotated }], statics: false });
  const [route] = zoneRoutes(world, rotated);
  assert.ok(route);
  assert.ok(!route.plan.some(line => line.includes('交由浏览器')), route.plan.join('; '));
  assertWalkable(world, route.pts);
});

test('all baseline and explicit profile routes retain real-collision round-trip passage', () => {
  const routes = buildAutoRoutes(W, W.zones.map(z => z.json));
  assert.equal(routes.filter(route => !route.gateProfile && !route.pavilionFlight && !route.terraceSide).length, 40, '39 baseline hall/cross routes plus the newly enterable Hongyi hall');
  const portalCount = W.gates.filter(g => g.item.gateProfile).reduce((n, g) => n + sideGateGeometry(g.item).portals.length, 0);
  assert.equal(routes.filter(route => route.pavilionFlight).length, 4, 'one round trip per actual pavilion front flight');
  assert.equal(routes.length, 40 + portalCount + 4 + 2, '51 original identities, one Hongyi hall route, four pavilion flight routes and two terrace routes');
  for (const route of routes) assert.doesNotThrow(() => assertWalkable(W, route.pts), route.name);
});

for (const fps of [60, 10]) for (const sprint of [false, true]) {
  test(`all 58 automatic routes retain real-controller passage: ${fps} fps, sprint=${sprint}`, t => {
    const routes = buildAutoRoutes(W, W.zones.map(z => z.json));
    assert.equal(routes.length, 58);
    assert.equal(routes.filter(r => r.pavilionFlight).length, 4, 'both front flights of both pavilions, ascending and descending');
    const failures = [];
    for (const route of routes) {
      const result = route.waypointDriver === 'physical-crossing-v1'
        ? replayTerrace(t, W, route.pts, { fps, sprint }) : replay(t, W, route.pts, fps, sprint);
      if (!result.arrived || result.fellUnder) failures.push({ name: route.name, ...result });
    }
    assert.deepEqual(failures, []);
  });
}

test('profile gate extents follow independent front/rear ramp toes and explicit facing', () => {
  for (const gateProfile of ['xiehe', 'xihe', 'jingyun', 'longzong']) for (const rot of [undefined, 0, 'east', 'north', 'west']) {
    const item = { kind: 'gate', x: 30, z: 80, gateKind: 'five-bay', gateProfile, rot };
    const physical = sideGateGeometry(item), g = gateGeom(item);
    assert.equal(g.rot, physical.rot);
    assert.equal(g.front, -physical.ramps.find(r => r.side === 'front').zToe);
    assert.equal(g.rear, physical.ramps.find(r => r.side === 'rear').zToe);
    assert.equal(g.half, Math.max(g.front, g.rear));
    assert.equal(g.platformY, physical.platformY);
  }
});

test('all four profile gates get three toe/top-preserving passage round trips', () => {
  const items = ['xiehe', 'xihe', 'jingyun', 'longzong'].map((gateProfile, i) => ({
    kind: 'gate', gateKind: 'five-bay', gateProfile, name: `profile-${i}`, x: 0, z: i * 80,
  }));
  const routes = buildAutoRoutes(W, [{ id: 'profile-coverage', items }]);
  assert.equal(routes.length, 12);
  for (const item of items) {
    const g = sideGateGeometry(item), front = g.ramps.find(r => r.side === 'front'), rear = g.ramps.find(r => r.side === 'rear');
    const own = routes.filter(r => r.gate === item.name);
    assert.deepEqual(own.map(r => r.portalCenter), g.portalCenters);
    for (const route of own) {
      const local = route.pts.map(([x, z]) => [
        (x - item.x) * Math.cos(g.rot) - (z - item.z) * Math.sin(g.rot),
        (x - item.x) * Math.sin(g.rot) + (z - item.z) * Math.cos(g.rot),
      ]);
      assert.ok(local.every(([x]) => Math.abs(x - route.portalCenter) < 1e-6));
      assert.deepEqual(local.slice(0, 6).map(p => +p[1].toFixed(6)),
        [front.zToe - 2, front.zToe, front.zTop, rear.zTop, rear.zToe, rear.zToe + 2]);
      assert.deepEqual(route.pts.slice(6), route.pts.slice(0, 5).reverse());
    }
  }
});

test('raised gate probes require their actual platform height while both ramp toes start at ground', async () => {
  const item = { kind: 'gate', gateKind: 'five-bay', gateProfile: 'xiehe', name: 'raised-probe', x: 0, z: 0, rot: 0 };
  const fixture = { id: 'raised-gate-probe', items: [item] };
  const world = await buildWorld({ zones: [{ json: fixture }], statics: false });
  const g = gateGeom(item), profile = g.profile;
  assert.equal(pointBlocked(world, 0, 0, 0), true, 'solid platform must block a ground-level start inside it');
  assert.equal(pointBlocked(world, 0, 0, g.platformY), false, 'center passage is open at the actual platform height');
  for (const ramp of profile.ramps) {
    const sign = Math.sign(ramp.zToe), outside = profile.toWorld(0, ramp.zToe + sign * 2);
    const toe = profile.toWorld(0, ramp.zToe);
    assert.equal(world.cm.getGroundHeight(...toe, 0, 0.6), 0);
    assert.equal(world.cm.getGroundHeight(...outside, 0, 0.6), 0);
    assert.equal(walkStraight(world, [0, 0], outside, { feet0: 0 }).reached, -1, 'never auto-teleport a blocked start up');
    const probe = walkStraight(world, [0, 0], outside, { feet0: g.platformY });
    assert.ok(probe.reached >= probe.total - 0.5, JSON.stringify(probe));
    assert.equal(probe.feet, 0, 'platform-origin probe descends all the way to ground');
  }
  for (const route of buildAutoRoutes(world, [fixture])) assertWalkable(world, route.pts);
});

test('hall approaches use the correct profile ramp toe on either inward-facing side', async () => {
  for (const gateProfile of ['xiehe', 'xihe', 'jingyun', 'longzong']) for (const inward of [-1, 1]) {
    const item = { kind: 'gate', gateKind: 'five-bay', gateProfile, name: 'profile-approach', x: 0, z: 0, rot: 'east' };
    const g = sideGateGeometry(item), [x, z] = g.toWorld(0, inward * 60);
    const hall = { kind: 'hall', name: 'profile-destination', x, z, rot: g.rot + (inward < 0 ? Math.PI : 0), w: 16, d: 8, ph: 0.45, enter: true };
    const fixture = { id: 'profile-approach', items: [item, hall] };
    const world = await buildWorld({ zones: [{ json: fixture }], statics: false });
    const route = zoneRoutes(world, fixture).find(r => r.hall === hall.name);
    const outside = g.ramps.find(r => r.side === (inward > 0 ? 'front' : 'rear'));
    const localZ = route.pts[0][0] * Math.sin(g.rot) + route.pts[0][1] * Math.cos(g.rot);
    assert.ok(inward * (localZ - outside.zToe) < -5.9, 'start is six metres beyond the correct outside toe');
    assertWalkable(world, route.pts);
  }
});

for (const fps of [60, 10]) for (const sprint of [false, true]) {
  test(`all profile portals reach every toe/top waypoint with the real controller: ${fps} fps, sprint=${sprint}`, t => {
    const routes = buildAutoRoutes(W, W.zones.map(z => z.json)).filter(route => route.gateProfile);
    assert.equal(routes.length, 12, 'all four source profiles must be integrated before this coverage passes');
    for (const route of routes) {
      const result = replay(t, W, route.pts, fps, sprint);
      assert.equal(result.arrived, true, `${route.name}: ${JSON.stringify(result)}`);
    }
  });
}
