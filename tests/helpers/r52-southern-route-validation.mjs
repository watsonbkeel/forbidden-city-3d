import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { FirstPersonControls } from '../../src/controls/FirstPerson.js';
import { PLAYER } from '../../src/config/constants.js';
import { gateGeom } from '../lib/world.mjs';
import { zoneRoutes } from '../lib/auto-routes.mjs';
import { replayKunning } from '../lib/kunning-walk.mjs';
import { traceTerraceGround } from '../lib/terrace-walk.mjs';

const same = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-8;
const unique = points => points.filter((p, i) => !i || !same(p, points[i - 1])).map(p => [...p]);
const roundTrip = go => unique([...go, ...go.slice(0, -1).reverse()]);
const checkpoint = (id, x, z, feet, visits = 2) => ({ id, x, z, feet, visits });
let inheritedRows;
function sourceRoutes() {
  // DUMP_JSON exits before openPage: no browser, socket or full world build.
  inheritedRows ??= JSON.parse(execFileSync(process.execPath,
    [new URL('../stepwalk.cjs', import.meta.url).pathname, '60', '0', 'all'],
    { env: { ...process.env, DUMP_JSON: '1' }, encoding: 'utf8' }));
  return structuredClone(inheritedRows);
}

/** Place a floor checkpoint on the portal actually authored by the route.
 * The portal still exists physically; a candidate run must prove its support.
 * Do not force the old central portal when a new side-access route uses a bay. */
export function authoredSouthGateCrossing(points, gate) {
  const g = gateGeom(gate), candidates = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], dz = b[1] - a[1];
    if (Math.abs(dz) < 1e-8) continue;
    const t = (gate.z - a[1]) / dz;
    if (t < 0 || t > 1) continue;
    const x = a[0] + (b[0] - a[0]) * t;
    if (g.profile.portalCenters.some(offset => Math.abs(x - gate.x - offset) < .15)) candidates.push([x, gate.z]);
  }
  assert.ok(candidates.length, `${gate.name}: route must cross an authored gate portal`);
  return candidates[0];
}

/** Author routes from unchanged source consumers, plus optional canonical R52
 * Wuying side access. No scene is built and no route is declared accepted here.
 * Metric points are model navigation fits, not current museum access claims. */
export function buildSouthernRouteFixtures({ zones, taiheSouthTiers, wuyingAccess } = {}) {
  assert.ok(zones?.length, 'inject actual candidate zone registrations');
  const rows = sourceRoutes(), getRow = name => {
    const r = rows.find(r => r.name === name); assert.ok(r, `missing inherited route ${name}`); return r.pts;
  };
  const zone = id => {
    const z = zones.map(z => z.json ?? z).find(z => z.id === id); assert.ok(z, `missing zone ${id}`); return z;
  };
  const south = court => {
    const z = zone(court === 'wenhua' ? 'outer-east' : 'outer-west');
    const limited = { ...z, items: z.items.filter(i => i.kind !== 'hall' || i.structure === 'south-court-hall') };
    const rear = zoneRoutes({}, limited).find(r => r.southCourtProfile === court + '-rear');
    assert.ok(rear && rear.pts.length % 2 === 1, 'canonical court route is an exact out-and-return chain');
    const go = rear.pts.slice(0, (rear.pts.length + 1) / 2);
    assert.deepEqual(rear.pts, roundTrip(go), 'cannot silently split a changed canonical court return');
    return { z, go, front: z.items.find(i => i.southCourtProfile === court + '-front'), rear: z.items.find(i => i.southCourtProfile === court + '-rear'), gate: z.items.find(i => i.southGateProfile === court) };
  };
  const axis1 = getRow('午门→太和门'), axis2 = getRow('太和门→太和殿内');
  assert.ok(same(axis1.at(-1), axis2[0]), 'existing axis route boundary must join exactly');
  const start = axis1[0], hub = [0, -340];
  const taihe = JSON.parse(readFileSync(new URL('../../data/architecture/taihe-core.json', import.meta.url)));
  assert.deepEqual(axis2.at(-1), [0, 5], 'review changed Taihe viewing endpoint explicitly');
  axis2[axis2.length - 1] = [0, taihe.dais.z0 - taihe.dais.steps * taihe.dais.stepRun - 1];
  const taiheGo = unique([...axis1, ...axis2]);
  const wenhua = south('wenhua'), wuying = south('wuying');
  const approach = (court, data) => {
    const name = court === 'wenhua' ? '协和门→文华门→文华殿内' : '熙和门→武英门→武英殿内';
    const pts = getRow(name), firstCourt = pts.findIndex(p => same(p, data.go[0]));
    assert.ok(firstCourt > 2, `${court}: canonical side/court handoff must remain identifiable`);
    // The inherited route approaches from north of the bridge. Wumen is south
    // already; join its south-bank waypoint, retaining the side-gate contacts.
    assert.deepEqual(pts[1], [court === 'wenhua' ? -30 : 30, -324]);
    const prefix = unique([start, hub, [pts[1][0], hub[1]], ...pts.slice(1, firstCourt)]);
    return { prefix, go: unique([...prefix, ...data.go]) };
  };
  const east = approach('wenhua', wenhua), west = approach('wuying', wuying);
  const cp = (data, rearName, journey) => [
    checkpoint(data.gate.name + '-floor', ...authoredSouthGateCrossing(journey, data.gate), gateGeom(data.gate).platformY),
    checkpoint(data.front.southCourtProfile + '-interior', data.front.x + (rearName === 'zhujing' ? 11 : 5), data.front.z, data.front.ph),
    checkpoint(rearName + '-interior', data.go.at(-1)[0], data.go.at(-1)[1], data.rear.ph, 1),
  ];
  const wumen = checkpoint('wumen-ground', start[0], start[1] + 3, 0);
  const make = (id, go, checks, { points = roundTrip(go), startFeet = 0, endFeet = 0 } = {}) => ({ id, points,
    startFeet, endFeet, acceptance: 'PENDING_ACTUAL_CANDIDATE_WORLD_RUN',
    checkpoints: [wumen, ...checks], waypointDriver: 'physical-crossing-v1' });
  const eastChecks = cp(wenhua, 'zhujing', east.go), westChecks = cp(wuying, 'jingsi', west.go);
  const routes = [
    make('wumen-taihe-return', taiheGo, [checkpoint('taihemen-floor', 0, -214.2, 3.44),
      checkpoint('taihe-interior', ...taiheGo.at(-1), taiheSouthTiers?.find(t => t.plinth)?.y1 ?? 9.9375, 1)]),
    make('wumen-wenhua-zhujing-return', east.go, eastChecks),
    make('wumen-wuying-jingsi-return', west.go, westChecks),
  ];
  const eastHub = east.go.findIndex(p => same(p, hub)), westHub = west.go.findIndex(p => same(p, hub));
  assert.ok(eastHub > 0 && westHub > 0, 'both court journeys share an explicit south-bank hub');
  const loop = unique([...east.go, ...east.go.slice(eastHub, -1).reverse(), ...west.go.slice(westHub + 1), ...west.go.slice(0, -1).reverse()]);
  routes.push(make('wumen-east-west-courts-return', [], [...eastChecks, ...westChecks], { points: loop }));
  if (wuyingAccess) {
    for (const side of ['east', 'west']) {
      const access = wuyingAccess(wuying.front, side);
      assert.ok(access?.id && access.points?.length >= 3, 'canonical Wuying side-access contract required');
      const go = access.points.map(p => [p.x, p.z]);
      assert.equal(access.points[0].feetY ?? access.points[0].y, 0, 'side stair route starts on real ground');
      const endpoint = access.points.at(-1), feet = endpoint.feetY ?? endpoint.y;
      const route = make(`wuying-${side}-stair-return`, go, [], { startFeet: 0, endFeet: 0 });
      route.checkpoints = [checkpoint('wuying-' + side + '-ground', ...go[0], 0, 1), checkpoint('wuying-' + side + '-door', ...go.at(-1), feet, 1)];
      route.checkpoints[0].radius = .45;
      route.canonicalAccessId = access.id;
      routes.push(route);
    }
  }
  return routes;
}

/** Validate recorded production results. A clean endpoint alone is insufficient:
 * each required raised floor must have been visited outward and on the return. */
export function assertSouthernTrace(route, result, samples, placements) {
  assert.equal(placements, 1, route.id + ': single initial placement, never segment teleports');
  assert.equal(result.arrived, true, 'arrival failed: ' + JSON.stringify({ route: route.id, end: result.end, stuckAt: result.stuckAt }));
  assert.equal(result.startFeet, route.startFeet, route.id + ': actual start feet');
  assert.ok(Math.abs(result.end[2] - route.endFeet) < .01, route.id + ': actual end feet');
  assert.equal(result.driver.crossings.length, route.points.length - 1, route.id + ': all physical contacts');
  assert.ok(result.frames.length > 0, route.id + ': real frames required');
  assert.ok(result.frames.every(f => [f.x, f.z, f.feet, f.ground, f.speed].every(Number.isFinite)), route.id + ': finite physical samples');
  assert.ok(samples.length > 0, route.id + ': real ground samples required');
  assert.equal(samples.some(s => ['rescue', 'unverified'].includes(s.source)), false, route.id + ': rescue/unverified support rejected');
  assert.ok(samples.every(s => s.height - s.feetIn <= PLAYER.STEP_UP + 1e-6), route.id + ': step-up limit');
  assert.ok(result.frames.every(f => f.feet >= -1e-7 && f.feet <= 11), route.id + ': no below-ground or rooftop travel');
  for (const c of route.checkpoints) {
    const isNear = f => Math.hypot(f.x - c.x, f.z - c.z) < (c.radius ?? .85);
    const near = result.frames.filter(isNear);
    assert.ok(near.length > 0, `${route.id}/${c.id}: actual floor visits`);
    assert.ok(near.every(f => Math.abs(f.ground - c.feet) < .02 && f.feet >= c.feet - .2), `${route.id}/${c.id}: never under or off the required floor`);
    let visits = 0, inside = false;
    for (const f of result.frames) { const hit = isNear(f); if (hit && !inside) visits++; inside = hit; }
    assert.ok(visits >= c.visits, `${route.id}/${c.id}: outward and return visits required`);
  }
  return true;
}

/** Use the integrator's existing actual world; never call buildWorld here. */
export function runSouthernRoute(t, W, route, options = {}) {
  const placed = t.mock.method(FirstPersonControls.prototype, 'setPosition');
  const trace = traceTerraceGround(W.cm, { flights: [] });
  let result, placements;
  try {
    result = replayKunning(t, W, route.points, { ...options, startFeet: route.startFeet, recordFrames: true });
    placements = placed.mock.callCount();
  } finally { trace.restore(); placed.mock.restore(); }
  assertSouthernTrace(route, result, trace.samples, placements);
  return { id: route.id, pass: true, platform: 'CPU_REAL_CONTROLLER_NOT_WEBGL_OR_PHONE',
    fps: options.fps ?? 60, sprint: options.sprint ?? false, placements,
    frames: result.frames.length, contacts: result.driver.crossings.length, maxFeet: result.maxFeet,
    maxSpeed: result.maxSpeed, startFeet: result.startFeet, end: result.end,
    checkpoints: route.checkpoints.map(c => c.id), supportSamples: trace.samples.length };
}

/** Actual resolver safety, separate from UI/search tests and walking routes.
 * Inject the real production Teleport instance wired to this SAME world.
 * This checks resolved support/collision, not pixel layout or native controls. */
export function verifySouthernMapArrivals(W, teleport, names = ['太和殿', '文华殿', '主敬殿', '武英殿', '敬思殿']) {
  return names.map(name => {
    const landing = teleport.resolveLanding(name);
    assert.ok(landing, `${name}: production landing must resolve`);
    assert.ok([landing.x, landing.z, landing.y].every(Number.isFinite), `${name}: finite landing height`);
    const geometry = teleport.geometryFor(name);
    assert.equal(teleport.isSafe({ ...landing }, geometry), true, `${name}: actual resolver safety`);
    const highest = W.cm.getGroundHeight(landing.x, landing.z, Infinity);
    const eligible = W.cm.getGroundHeight(landing.x, landing.z, landing.y, PLAYER.STEP_UP);
    assert.ok(Math.abs(highest - landing.y) < 1e-6 && Math.abs(eligible - landing.y) < 1e-6, `${name}: resolved height must match the actual surface, not below-deck ground`);
    assert.equal(W.cm.checkCollision(new W.THREE.Vector3(landing.x, landing.y + PLAYER.HEIGHT, landing.z), .5), false, `${name}: landing body clearance`);
    return { name, x: landing.x, z: landing.z, feetY: landing.y, fallback: landing.fallback,
      entryProfile: landing.entryProfile ?? null, approachVerified: landing.approachVerified ?? null,
      pass: true, scope: 'PRODUCTION_RESOLVER_SUPPORT_AND_BODY_CLEARANCE_NOT_UI_OR_WALK_THROUGH' };
  });
}
