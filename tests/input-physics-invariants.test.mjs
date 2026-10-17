import test from 'node:test';
import assert from 'node:assert/strict';
import { setupInput } from './lib/input-fixture.mjs';

for (const mobile of [false, true]) for (const interval of [1000 / 60, 1000 / 30, 100, 666.6]) {
  test(`${mobile ? 'mobile' : 'desktop'} ordinary release retains natural braking at ${interval} ms`, t => {
    const s = setupInput(t, { mobile });
    if (mobile) s.touch('touchstart');
    else { s.key('keydown', 'ShiftLeft'); s.key('keydown', 'KeyW'); }
    for (let i = 0; i < Math.max(60, Math.ceil(6000 / interval)); i++) s.frame(interval);
    const releaseSpeed = s.c.velocity.z;
    assert.ok(Math.abs(releaseSpeed - (mobile ? 9 : 12)) < .001, 'naturally reaches original run speed');
    if (mobile) s.touch('touchend'); else s.key('keyup', 'KeyW');
    assert.equal(s.c.velocity.z, releaseSpeed, 'release does not zero horizontal inertia');
    const start = s.logical(), dt = Math.min(interval / 1000, .1);
    let expectedSpeed = releaseSpeed, expectedDistance = 0, frames = 0;
    do {
      expectedSpeed *= Math.exp(-10 * dt);
      if (expectedSpeed < .01) expectedSpeed = 0;
      expectedDistance += expectedSpeed * dt;
      s.frame(interval); frames++;
      assert.ok(Math.abs(s.c.velocity.z - expectedSpeed) < 1e-10, 'original exponential smoothing and tiny-speed snap');
      assert.ok(Math.abs(start.z - s.logical().z - expectedDistance) < 1e-9, 'natural braking displacement, no snap');
      assert.equal(s.c.airborne, false); assert.equal(s.c.feetY, 0);
    } while (expectedSpeed && frames < 1000);
    assert.equal(s.c.velocity.lengthSq(), 0);
    assert.ok(expectedDistance > .5, 'the inherited appreciable braking tail was not erased');
    t.diagnostic(JSON.stringify({ mobile, interval, releaseSpeed, brakingMetres: expectedDistance,
      settleFrames: frames, wallTimeToSettleMs: frames * interval }));
  });
}

test('desktop walk/diagonal normalization and wall-clock auto-run keep their original thresholds', t => {
  const s = setupInput(t);
  s.key('keydown', 'KeyW'); s.key('keydown', 'KeyD');
  s.frame(1999);
  assert.ok(Math.abs(s.c.velocity.length() - 5 * (1 - Math.exp(-1))) < 1e-10, 'walk speed, normalization, and 100 ms cap');
  const before = s.c.velocity.length();
  s.frame(1);
  assert.ok(Math.abs(s.c.velocity.length() - (before + (12 - before) * (1 - Math.exp(-.01)))) < 1e-10,
    'auto-run still begins at 2 wall-clock seconds');
});
