import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { buildWorld } from './lib/world.mjs';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { wuyingGalleryRoute, wuyingGateApproach } from './lib/r52-wuying-routes.mjs';
import { wuyingMoonTerraceAccess } from '../src/scene/palace/special/WuyingMoonTerrace.js';
import { runWuyingConsumerChecks } from './lib/r52-wuying-consumer-checks.mjs';

const data = JSON.parse(readFileSync(new URL('../data/zones/outer-west.json', import.meta.url)));
const front = data.items.find(i => i.southCourtProfile === 'wuying-front');
const gate = data.items.find(i => i.southGateProfile === 'wuying');
const dump = contract => JSON.parse(execFileSync(process.execPath, [new URL('./stepwalk.cjs', import.meta.url).pathname, '60,10', '0,1', 'all'], {
  encoding: 'utf8', env: { ...process.env, DUMP: '', DUMP_JSON: '1', FIXED_ROUTE_CONTRACT: contract },
}));

test('R52 fixed-route successor changes only Wuying ingress and preserves the original Xihe/bridge prefix and gallery endpoint', () => {
  const old = dump('r48-leaf-turn'), current = dump('r52');
  assert.equal(current.length, 33);
  assert.deepEqual(current.map(r => r.name), old.map(r => r.name));
  let changed = 0;
  for (let i = 0; i < current.length; i++) {
    if (current[i].name !== '熙和门→武英门→武英殿内') { assert.deepEqual(current[i], old[i]); continue; }
    changed++;
    const first = wuyingGateApproach(gate, front)[0];
    const cut = old[i].pts.findIndex(p => p[0] === first[0] && p[1] === first[1]);
    assert.ok(cut > 2);
    assert.deepEqual(current[i].pts.slice(0, cut), old[i].pts.slice(0, cut));
    assert.deepEqual(current[i].pts.slice(0, 2), [[30, -298], [30, -324]]);
    assert.deepEqual(current[i].pts.at(-1), old[i].pts.at(-1));
    assert.deepEqual(current[i].pts.slice(cut), [...wuyingGateApproach(gate, front).slice(0, -1), ...wuyingGalleryRoute(front)]);
    assert.equal(current[i].waypointDriver, old[i].waypointDriver);
  }
  assert.equal(changed, 1);
});

test('R52 both successor sides keep every canonical tread contact without rounding or removing original I-plan turns', () => {
  for (const side of ['west', 'east']) {
    const expected = wuyingMoonTerraceAccess(front, side).points.map(p => [p.x, p.z]);
    const points = wuyingGalleryRoute(front, { side });
    assert.deepEqual(points.slice(0, expected.length), expected);
    assert.equal(expected[0][0] > front.x, side === 'west');
    assert.deepEqual(points.slice(-4), [[front.x, front.z - 5.95], [front.x + (side === 'west' ? 5 : -5), front.z - 5.95], [front.x + (side === 'west' ? 5 : -5), front.z + 5.7], [front.x, front.z + 5.7]]);
  }
  assert.throws(() => wuyingGalleryRoute(front, { side: 'centre' }), /known side/);
  assert.throws(() => wuyingGalleryRoute(front, { rear: front }), /rear hall/);
});

const W = await buildWorld();
test('old ground-height spawn remains rejected inside the solid deck, not silently rescued', () => {
  const x = 219.5, z = -212.2;
  assert.equal(W.cm.getGroundHeight(x, z, 0, .6), 0);
  assert.equal(W.cm.checkCollision(new W.THREE.Vector3(x, 1.7, z)), true);
  assert.equal(W.cm.getGroundHeight(x, z, Infinity), 1.2);
});
test('R52 successor inherits only the declared two covered-ramp removals and nineteen new non-rescue supports', () => {
  // CollisionManager deliberately strips authoring-only flags. Capture the
  // authored primitives, then compare their real registration normalization.
  const builder = new ZoneBase(library(), data);
  try {
    builder.buildGate(gate); builder.buildHall(front);
    const added = builder.kit.walkables.filter(w => w.wuyingMoonTerrace);
    assert.equal(added.length, 19);
    assert.ok(added.every(w => w.rescue === false));
    const registered = new CollisionManager(); registered.addWalkables(added);
    const key = w => JSON.stringify({ ...w, tag: undefined });
    for (const support of registered.walkables) assert.equal(W.cm.walkables.filter(w => key(w) === key(support)).length, 1, 'one exact actual registered support: ' + key(support));
  } finally { builder.kit.dispose(builder.kit.root); }
  const oldHallRamp = w => w.type === 'ramp' && w.axis === 'z' && Math.abs(w.a0 + 208.6) < 1e-7 && Math.abs(w.a1 + 210.52) < 1e-7 && Math.abs((w.minX + w.maxX) / 2 - 219.5) < 1e-7;
  const oldGateRamp = w => w.type === 'ramp' && w.axis === 'z' && Math.abs(w.a0 + 240.05) < 1e-7 && Math.abs(w.a1 + 238.77) < 1e-7;
  assert.equal(W.cm.walkables.filter(oldHallRamp).length, 0);
  const remainingGateRamps = W.cm.walkables.filter(oldGateRamp);
  assert.equal(remainingGateRamps.length, 2);
  assert.ok(remainingGateRamps.every(w => Math.abs((w.minX + w.maxX) / 2 - 220.8) > 6));
});
for (const fps of [10, 60]) for (const sprint of [false, true]) for (const backward of [false, true]) {
  test(`R52 current Wuying front/rear auto-consumers use actual lateral gate and moon stairs ${fps}/${sprint}/${backward}`, t => {
    runWuyingConsumerChecks(t, W, { fps, sprint, backward });
  });
}
