/** Nine desired contracts, independently reproduced red on unmodified V8.
 * Portable repo-native fixtures; no imports of external audit files.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { setupInput, horizontalBasis } from './lib/input-fixture.mjs';

for (const mobile of [false, true]) test(`${mobile ? 'touch' : 'pointer-lock mouse'} turn moves along the latest view on the next update`, t => {
  const s = setupInput(t, { mobile });
  if (mobile) s.touch('touchstart'); else s.key('keydown', 'KeyW');
  for (let i = 0; i < 12; i++) s.frame(100);
  const before = s.logical();
  if (mobile) { s.touch('touchstart', 2, 200, 700); s.touch('touchmove', 2, 200, 700 + Math.PI / 2 / .005); }
  else s.dispatch(s.document, 'mousemove', { movementX: Math.PI / 2 / .002, movementY: 0 });
  const expected = horizontalBasis(s.camera).forward.normalize();
  const movement = s.frame(100).sub(before).setY(0).normalize();
  assert.ok(movement.dot(expected) > .999999, `latest-view dot product ${movement.dot(expected)}, expected ~1`);
});

for (const code of ['KeyQ', 'KeyE']) test(`map ${code} turn is used by movement in the same update`, t => {
  const s = setupInput(t, { map: true });
  s.key('keydown', 'KeyW'); for (let i = 0; i < 10; i++) s.frame(100);
  const before = s.logical(); s.key('keydown', code);
  const movement = s.frame(100).sub(before).setY(0).normalize();
  const expected = horizontalBasis(s.camera).forward.normalize();
  assert.ok(movement.dot(expected) > .999999, `latest-view dot product ${movement.dot(expected)}, expected ~1`);
});

for (const interruption of ['touchend', 'touchcancel', 'blur']) test(`${interruption} then same-frame joystick reacquisition starts a fresh run delay`, t => {
  const s = setupInput(t, { mobile: true });
  s.touch('touchstart'); for (let i = 0; i < 25; i++) s.frame(100);
  assert.equal(s.c.mobileRunning, true, 'fixture naturally reached running');
  if (interruption === 'blur') s.dispatch(s.window, 'blur'); else s.touch(interruption);
  assert.equal(s.c.joystick.isActive(), false, 'release reset the joystick');
  s.advance(1); s.touch('touchstart', 3); s.frame(100);
  assert.equal(s.c.mobileRunning, false, 'a new 100 ms hold must not inherit the prior 2 second run timer');
});

for (const interruption of ['blur', 'unlock']) test(`${interruption} cancels an unconsumed jump request`, t => {
  const s = setupInput(t);
  s.key('keydown', 'Space');
  if (interruption === 'blur') s.dispatch(s.window, 'blur'); else s.c.unlock();
  s.frame(100);
  assert.equal(s.c.airborne, false, `stopped player unexpectedly jumped to feetY=${s.c.feetY}`);
  assert.equal(s.c.feetY, 0);
});
