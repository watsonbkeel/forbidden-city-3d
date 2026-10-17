import test from 'node:test';
import assert from 'node:assert/strict';
import { setupInput, horizontalBasis, THREE, PLAYER } from './lib/input-fixture.mjs';
import { SettingsTourSession } from '../src/ui/SettingsTourSession.js';

const near = (actual, expected, message, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${message}: ${actual} versus ${expected}`);

for (const mobile of [false, true]) for (const pitch of [-1, 1]) for (const right of [-1, 0, 1]) {
  test(`latest ${mobile ? 'touch' : 'mouse'} yaw preserves horizontal speed at pitch extreme ${pitch}, strafe ${right}`, t => {
    const s = setupInput(t, { mobile });
    let f = 1, r = right, speed = PLAYER.MOVE_SPEED;
    if (mobile) {
      s.touch('touchstart', 1, 230, 88 + right * 30);
      const d = s.c.joystick.getDelta(); f = -d.y; r = d.x; speed = PLAYER.JOYSTICK_SPEED;
      s.touch('touchstart', 2, 200, 700);
      s.touch('touchmove', 2, 200 + pitch * 10000, 700 + .7 / .005);
    } else {
      s.key('keydown', 'KeyW');
      if (right) s.key('keydown', right > 0 ? 'KeyD' : 'KeyA');
      const length = Math.hypot(f, r); f /= length; r /= length;
      s.dispatch(s.document, 'mousemove', { movementX: .7 / .002, movementY: pitch * 10000 });
    }
    const { forward, right: basisRight } = horizontalBasis(s.camera);
    const expected = forward.multiplyScalar(f).addScaledVector(basisRight, r).multiplyScalar(speed * (1 - Math.exp(-1)) * .1);
    const before = s.logical(), moved = s.frame(100).sub(before);
    near(moved.x, expected.x, 'current-yaw X'); near(moved.z, expected.z, 'current-yaw Z');
    near(moved.y, 0, 'pitch cannot fly or sink');
    near(Math.hypot(moved.x, moved.z), Math.hypot(f, r) * speed * (1 - Math.exp(-1)) * .1, 'normalized horizontal speed');
  });
}

for (const code of ['KeyQ', 'KeyE']) for (const interval of [1000 / 60, 100, 666.6]) {
  test(`map ${code} diagonal turn at ${interval} ms uses current yaw and the original delta cap`, t => {
    const s = setupInput(t, { map: true });
    s.key('keydown', 'KeyW'); s.key('keydown', 'KeyD'); s.key('keydown', code);
    const before = s.logical();
    const moved = s.frame(interval).sub(before).setY(0);
    const dt = Math.min(interval / 1000, .1);
    const yaw = (code === 'KeyQ' ? 1 : -1) * 1.6 * dt;
    near(new THREE.Euler().setFromQuaternion(s.camera.quaternion, 'YXZ').y, yaw, 'unchanged Q/E turn rate');
    const { forward, right } = horizontalBasis(s.camera);
    const expected = forward.add(right).normalize().multiplyScalar(5 * (1 - Math.exp(-10 * dt)) * dt);
    near(moved.x, expected.x, 'same-update X'); near(moved.z, expected.z, 'same-update Z');
  });
}

for (const interval of [1000 / 60, 100, 666.6]) {
  test(`fresh mouse yaw reaches a collision corner without shrinking the 1 m body at ${interval} ms`, t => {
    const s = setupInput(t);
    s.cm.addCollider(new THREE.Box3(new THREE.Vector3(3, 0, -100), new THREE.Vector3(3.05, 3, 100)));
    s.cm.addCollider(new THREE.Box3(new THREE.Vector3(-100, 0, -3.05), new THREE.Vector3(100, 3, -3)));
    s.key('keydown', 'ShiftLeft'); s.key('keydown', 'KeyW');
    s.dispatch(s.document, 'mousemove', { movementX: Math.PI / 4 / .002, movementY: 200 });
    const expected = horizontalBasis(s.camera).forward.normalize();
    const before = s.logical(), first = s.frame(interval).sub(before).setY(0);
    assert.ok(first.normalize().dot(expected) > .999999, 'the first move already uses the new corner heading');
    for (let i = 0; i < Math.ceil(3000 / interval); i++) {
      const start = s.logical(), end = s.frame(interval);
      assert.equal(s.cm.checkCollision(end, .5), false, 'actual 1 m XZ body cannot overlap either wall');
      assert.ok(Math.hypot(end.x - start.x, end.z - start.z) <= 1.2 + 1e-9, 'original speed/delta cap');
      assert.ok(end.x <= 2.5 && end.z >= -2.5, 'half-metre clearance from both corner walls');
    }
    assert.ok(s.logical().x > 2.2 && s.logical().z < -2.2, 'test actually reaches the bounded corner');
  });
}

for (const interruption of ['touchend', 'touchcancel', 'blur']) for (const reusedId of [false, true]) {
  test(`${interruption}, ${reusedId ? 'reused' : 'new'} finger ID: new ownership keeps the full 2 s run delay`, t => {
    const s = setupInput(t, { mobile: true });
    s.touch('touchstart'); for (let i = 0; i < 25; i++) s.frame(100);
    assert.equal(s.c.mobileRunning, true);
    const oldStart = s.c.runStartTime, oldVelocity = s.c.velocity.z;
    if (interruption === 'blur') s.dispatch(s.window, 'blur'); else s.touch(interruption);
    if (interruption === 'blur') near(s.c.velocity.z, 0, 'blur hard stop');
    else near(s.c.velocity.z, oldVelocity, 'ordinary release preserves inertia before RAF');
    s.touch('touchstart', reusedId ? 1 : 3);
    s.frame(100);
    assert.equal(s.c.mobileRunning, false); assert.equal(s.c.joystick.running, false);
    assert.ok(s.c.runStartTime > oldStart, 'new ownership replaces the old timer');
    const start = s.c.runStartTime;
    for (let i = 0; i < 19; i++) s.frame(100);
    s.frame(99); assert.equal(s.now() - start, 1999); assert.equal(s.c.mobileRunning, false);
    s.frame(1); assert.equal(s.now() - start, 2000); assert.equal(s.c.mobileRunning, true);
  });
}

for (const type of ['touchend', 'touchcancel']) {
  test(`unrelated ${type} neither releases joystick ownership nor restarts its run timer`, t => {
    const s = setupInput(t, { mobile: true });
    s.touch('touchstart'); for (let i = 0; i < 25; i++) s.frame(100);
    const oldStart = s.c.runStartTime;
    s.touch('touchstart', 2, 200, 700); s.touch(type, 2, 200, 700);
    s.touch('touchstart', 3); // A second finger inside the pad cannot take ownership.
    assert.equal(s.c.joystick.touchId, 1); s.frame(100);
    assert.equal(s.c.mobileRunning, true); assert.equal(s.c.runStartTime, oldStart);
  });
}

test('several release/reacquire cycles between frames still belong to the final ownership session', t => {
  const s = setupInput(t, { mobile: true });
  s.touch('touchstart'); for (let i = 0; i < 25; i++) s.frame(100);
  for (let i = 0; i < 3; i++) { s.touch('touchend'); s.touch('touchstart'); }
  s.frame(100); assert.equal(s.c.mobileRunning, false);
});

test('direction and magnitude changes retain their existing mobile run reset policy', t => {
  const s = setupInput(t, { mobile: true });
  s.touch('touchstart'); for (let i = 0; i < 25; i++) s.frame(100);
  s.touch('touchmove', 1, 260, 118); s.frame(100);
  assert.equal(s.c.mobileRunning, false, '90 degree direction change restarts delay');
  for (let i = 0; i < 20; i++) s.frame(100);
  assert.equal(s.c.mobileRunning, true);
  s.touch('touchmove', 1, 260, 98); s.frame(100);
  assert.equal(s.c.mobileRunning, false, 'low magnitude exits run');
  s.touch('touchmove', 1, 260, 118); s.frame(100);
  assert.equal(s.c.mobileRunning, false, 'strong input after low magnitude restarts delay');
});

const interruptions = {
  stop: s => s.c.stop(),
  blur: s => s.dispatch(s.window, 'blur'),
  'pointer-lock loss': s => s.document.exitPointerLock(),
  'explicit unlock': s => s.c.unlock(),
  'free-move cancellation': s => s.c.setFreeMove(false),
};
for (const [name, interrupt] of Object.entries(interruptions)) {
  test(`${name} cancels only an unconsumed jump`, t => {
    const s = setupInput(t);
    s.key('keydown', 'Space'); assert.equal(s.c.jumpQueued, true);
    interrupt(s); assert.equal(s.c.jumpQueued, false);
    s.frame(100); assert.equal(s.c.airborne, false); assert.equal(s.c.feetY, 0);
  });
  test(`${name} preserves airborne vertical velocity and subsequent gravity`, t => {
    const s = setupInput(t);
    s.key('keydown', 'Space'); s.frame(100);
    assert.equal(s.c.airborne, true);
    const feet = s.c.feetY, velocity = s.c.verticalVelocity;
    s.c.jump(); interrupt(s);
    assert.equal(s.c.jumpQueued, false); assert.equal(s.c.airborne, true);
    near(s.c.feetY, feet, 'no vertical snap'); near(s.c.verticalVelocity, velocity, 'no jump cancellation');
    s.frame(100);
    near(s.c.verticalVelocity, velocity - PLAYER.GRAVITY * .1, 'gravity continues');
    near(s.c.feetY, feet + (velocity - PLAYER.GRAVITY * .1) * .1, 'vertical integration continues');
    for (let i = 0; i < 30; i++) s.frame(100);
    assert.equal(s.c.airborne, false); assert.equal(s.c.feetY, 0);
  });
}

test('Space keyup leaves a valid tap queued; free-move unlock event preserves accepted map inputs', t => {
  const s = setupInput(t, { map: true });
  s.key('keydown', 'Space'); s.key('keyup', 'Space');
  s.c.controls.dispatchEvent({ type: 'unlock' });
  assert.equal(s.c.jumpQueued, true, 'map-mode conditional unlock is not a cancellation boundary');
  s.frame(100); assert.equal(s.c.airborne, true);
});

for (const mobile of [false, true]) {
  test(`settings cancels queued ${mobile ? 'mobile' : 'desktop'} jump but preserves an airborne jump across pause/resume`, t => {
    const s = setupInput(t, { mobile });
    const session = new SettingsTourSession({ controls: s.c, isMobile: mobile,
      minimap: { visible: false }, welcomeOverlay: { style: {} } });
    s.c.jump(); session.open(); session.resume(); s.frame(100);
    assert.equal(s.c.airborne, false, 'pending jump must not survive modal cancellation');
    s.c.jump(); s.frame(100); const feet = s.c.feetY, velocity = s.c.verticalVelocity;
    session.open(); s.frame(5000, () => session.updateControls());
    near(s.c.feetY, feet, 'pause freezes vertical state'); near(s.c.verticalVelocity, velocity, 'pause preserves jump');
    session.resume(); s.frame(100, () => session.updateControls());
    near(s.c.verticalVelocity, velocity - PLAYER.GRAVITY * .1, 'resumed gravity');
    near(s.c.feetY, feet + (velocity - PLAYER.GRAVITY * .1) * .1, 'resumed jump, no new impulse');
  });
}

test('mobile settings resume and same-frame reacquisition start a new run session', t => {
  const s = setupInput(t, { mobile: true });
  const session = new SettingsTourSession({ controls: s.c, isMobile: true,
    minimap: { visible: false }, welcomeOverlay: { style: {} } });
  s.touch('touchstart'); for (let i = 0; i < 25; i++) s.frame(100);
  assert.equal(s.c.mobileRunning, true);
  session.open(); session.resume();
  s.touch('touchmove'); assert.equal(s.c.joystick.isActive(), false, 'old held touch cannot reacquire');
  s.touch('touchend'); s.touch('touchstart'); s.frame(100);
  assert.equal(s.c.mobileRunning, false);
});
