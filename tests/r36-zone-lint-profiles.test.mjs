import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

// The legacy straight-line checks incorrectly reject the six-bay pond approach
// and the connector beside Wenhua's real rear circular display. A profile must
// prove an actual route instead of downgrading these failures to warnings.
test('R36 geometry CLI checks the current profiles while retaining unmigrated warnings', () => {
  const run = spawnSync(process.execPath, ['tests/zone-lint.cjs'], {
    cwd: new URL('..', import.meta.url), encoding: 'utf8', timeout: 120000,
  });
  const output = run.stdout + run.stderr;
  assert.equal(run.status, 0, output);
  assert.match(output, /错误: 0/);
  assert.match(output, /bounds 缝隙/);
  assert.match(output, /gate「钟粹门」/);
  assert.match(output, /outer-west: hall「\?」.*前门.*其他构件/);
  assert.match(output, /outer-west: hall「\?」.*后门.*其他构件/);
});

import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildWorld, walkStraight } from './lib/world.mjs';
import lint from './zone-lint.cjs';

let worldPromise;
const world = () => worldPromise ??= buildWorld();
const selected = W => [
  W.halls.find(h => h.item.structure === 'wenyuan-pavilion'),
  W.halls.find(h => h.item.southCourtProfile === 'wenhua-connector'),
];
async function withWorldMutation(change, check) {
  const W = await world(), colliders = W.cm.colliders, walkables = W.cm.walkables;
  W.cm.colliders = [...colliders]; W.cm.walkables = [...walkables];
  try { change(W); W.cm._grid = null; await check(W); }
  finally { W.cm.colliders = colliders; W.cm.walkables = walkables; W.cm._grid = null; }
}
const pondRamp = w => w.type === 'ramp' && w.axis === 'z' &&
  w.minX > -189 && w.maxX < -184 && w.minZ >= -155.6 - 1e-7 && w.maxZ <= -142.4 + 1e-7;

// Fails if the adapter replaces the real controller with a blind profile pass,
// deletes the architectural obstruction, or begins a new elevated leg.
test('R36 explicit routes keep the original obstructions and walk both ways from ground', async () => {
  const W = await world();
  for (const h of selected(W)) {
    const g = h.g, side = h.item.structure === 'wenyuan-pavilion' ? -1 : 1;
    const straight = walkStraight(W, g.toW(g.doorX, side * (g.PD / 2 + g.run + 2)),
      g.toW(g.doorX, side * (g.d / 2 - 1)));
    assert.ok(straight.reached < straight.total - .3, 'the old straight corridor must still be obstructed');
    const report = await lint.checkHallSourceProfile(W, h);
    assert.deepEqual(report.faults, []);
    assert.deepEqual(report.runs.map(run => run.fps), [10, 60]);
    for (const run of report.runs) {
      assert.equal(run.arrived, true);
      assert.equal(run.startFeet, 0);
      assert.equal(run.end[2], 0);
      assert.equal(run.crossings, report.points.length - 1);
    }
  }
});

for (const which of ['wenyuan', 'connector']) test(`R36 lint fails closed when ${which}'s actual route is blocked`, async () => {
  await withWorldMutation(W => {
    const h = selected(W)[which === 'wenyuan' ? 0 : 1], x = which === 'wenyuan' ? h.item.x - h.item.w / 12 : h.item.x;
    const z = which === 'wenyuan' ? h.item.z - h.item.d / 2 : h.item.z;
    W.cm.addCollider(new W.THREE.Box3(new W.THREE.Vector3(x - 6, 0, z - .25),
      new W.THREE.Vector3(x + 6, 5, z + .25)), 'lint-negative-blocker');
  }, async W => {
    const report = await lint.checkHallSourceProfile(W, selected(W)[which === 'wenyuan' ? 0 : 1]);
    assert.ok(report.faults.some(fault => fault.startsWith('blocked-route')), JSON.stringify(report));
  });
});

for (const partial of [false, true]) test(`R36 lint rejects ${partial ? 'one missing pond deck segment' : 'a missing pond bridge'} despite the water aperture`, async () => {
  await withWorldMutation(W => {
    const supports = W.cm.walkables.filter(pondRamp);
    assert.equal(supports.length, 32, 'mutate real registered arch segments, not source metadata');
    const removed = partial ? [supports[15]] : supports;
    W.cm.walkables = W.cm.walkables.filter(w => !removed.includes(w));
  }, async W => {
    const report = await lint.checkHallSourceProfile(W, selected(W)[0]);
    assert.ok(report.faults.some(fault => fault.startsWith('missing-bridge-support')), JSON.stringify(report));
  });
});

test('R36 lint rejects a missing actual connector floor', async () => {
  await withWorldMutation(W => {
    const h = selected(W)[1], before = W.cm.walkables.length;
    W.cm.walkables = W.cm.walkables.filter(w => !(w.type === 'box' &&
      Math.abs(w.box.min.x - (h.item.x - h.item.w / 2)) < 1e-7 &&
      Math.abs(w.box.min.z - (h.item.z - h.item.d / 2)) < 1e-7 &&
      Math.abs(w.box.max.y - h.item.ph) < 1e-7));
    assert.ok(W.cm.walkables.length < before);
  }, async W => {
    const report = await lint.checkHallSourceProfile(W, selected(W)[1]);
    assert.ok(report.faults.some(fault => /unsupported-hall-floor|blocked-route/.test(fault)), JSON.stringify(report));
  });
});

test('R36 adapter does not claim generic or unmigrated halls, and rejects malformed explicit sources', async () => {
  const W = await world();
  for (const h of W.halls.filter(h => !selected(W).includes(h))) {
    assert.equal(await lint.checkHallSourceProfile(W, h), null);
  }
  const h = selected(W)[0];
  await assert.rejects(lint.checkHallSourceProfile(W, { ...h, item: { ...h.item, x: h.item.x + 1 } }), /Wenyuan requires/);
});

test('R36 CLI still reports a real obstruction in the unmigrated generic hall path as an error', () => {
  const dir = mkdtempSync(join(tmpdir(), 'r36-lint-negative-'));
  try {
    cpSync(new URL('../data/zones/', import.meta.url), dir, { recursive: true });
    const file = join(dir, 'outer-west.json'), zone = JSON.parse(readFileSync(file, 'utf8'));
    const link = zone.items.find(item => item.southCourtProfile === 'wuying-connector');
    zone.items.push({ kind: 'wall', from: [link.x - 6, link.z - link.d / 2],
      to: [link.x + 6, link.z - link.d / 2], h: 5, t: .5 });
    writeFileSync(file, JSON.stringify(zone));
    const run = spawnSync(process.execPath, ['tests/zone-lint.cjs'], {
      cwd: new URL('..', import.meta.url), encoding: 'utf8', timeout: 120000,
      env: { ...process.env, ZONES_DIR: dir },
    });
    assert.equal(run.status, 1, run.stdout + run.stderr);
    assert.match(run.stderr, /❌ outer-west: hall「\?」.*前门.*沿中线走不进殿内/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
