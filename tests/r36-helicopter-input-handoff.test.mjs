import test from 'node:test';
import assert from 'node:assert/strict';
import { setupInput, THREE, PLAYER } from './lib/input-fixture.mjs';
import { FlightTour } from '../src/scene/flight/FlightTour.js';
import { FlightEnvelope } from '../src/scene/flight/FlightEnvelope.js';

function setup(t, { mobile = false } = {}) {
  let dispose = () => {}; t.after(() => dispose());
  const s = setupInput(t, { mobile });
  const Element = s.document.body.constructor;
  Object.defineProperty(Element.prototype, 'dataset', { configurable: true, get() {
    return Object.fromEntries([...this.attributes].filter(([k]) => k.startsWith('data-')).map(([k, v]) => [k.slice(5), v]));
  } });
  Object.defineProperty(Element.prototype, 'parentElement', { configurable: true, get() { return this.parentNode instanceof Element ? this.parentNode : null; } });
  Element.prototype.blur = function () { if (s.document.activeElement === this) s.document.activeElement = s.document.body; };
  s.document.head = s.document.createElement('head');
  s.c.setPosition(22, PLAYER.HEIGHT, -494);
  const f = new FlightTour({ scene: new THREE.Scene(), camera: s.camera, controls: s.c, collisionManager: s.cm,
    zoneManager: { ensureLoadedAt() {} }, envelope: new FlightEnvelope() });
  dispose = () => f.dispose();
  return { ...s, f };
}

test('H dismount after native Escape restores actual walking mouse and keys, not only the mode flag', t => {
  const s = setup(t), { f, c, document } = s;
  s.key('keydown', 'KeyH'); assert(f.occupied);
  document.exitPointerLock(); assert(f.operationsOpen);
  f.boardButton.focus();
  s.key('keydown', 'KeyH'); assert(!f.occupied); assert(!f.operationsOpen);
  assert.equal(document.pointerLockElement, c.domElement, 'H and button use the same real pointer-lock handoff');
  assert.equal(c.controls.isLocked, true);
  assert.equal(c.lookLocked, false); assert.equal(c.headBobEnabled, true);
  assert(!f.panel.contains(document.activeElement), 'hidden flight controls no longer retain keyboard focus');
  const q = s.camera.quaternion.clone();
  s.dispatch(document, 'mousemove', { movementX: 80, movementY: 30 });
  assert(q.angleTo(s.camera.quaternion) > .05, 'actual Three PointerLockControls rotates the walking camera');
  s.key('keydown', 'KeyW'); assert(c.moveForward); assert.equal(f.keys.size, 0);
  s.key('keyup', 'KeyW'); assert(!c.moveForward);
  assert.equal(f.panel.hidden, true, 'full flight controls disappear immediately after exit');
});

test('proximity only shows a non-modal boarding affordance; far H belongs to ordinary walking', t => {
  const s = setup(t), { f, c, document } = s;
  document.body.focus(); const lock = t.mock.method(c, 'lock'); const unlock = t.mock.method(c, 'unlock');
  f.updateUI(); assert.equal(f.panel.hidden, true); assert.equal(f.boardingPrompt.hidden, false);
  assert.equal(document.activeElement, document.body); assert.equal(f.operationsOpen, false);
  c.setPosition(40, PLAYER.HEIGHT, -494); f.update(.1, 200);
  assert.equal(f.boardingPrompt.hidden, true); assert.equal(s.key('keydown', 'KeyH').defaultPrevented, false);
  assert(!f.occupied); assert.equal(lock.mock.callCount(), 0); assert.equal(unlock.mock.callCount(), 0);
  c.setPosition(22, PLAYER.HEIGHT, -494); f.update(.1, 400); assert.equal(f.boardingPrompt.hidden, false);
  f.boardingButton.click(); assert(f.occupied); assert.equal(f.boardingPrompt.hidden, true); assert.equal(f.panel.hidden, false);
});

test('rejected native lock Promise keeps dismount complete and offers a fresh walking retry', async t => {
  const s = setup(t), { f, c, document } = s;
  assert(f.board()); document.exitPointerLock();
  const lock = document.body.requestPointerLock;
  document.body.requestPointerLock = () => Promise.reject(new Error('browser denied lock'));
  assert(f.exit()); await Promise.resolve(); await Promise.resolve();
  assert(!f.occupied); assert(!f.operationsOpen); assert.equal(c.controls.isLocked, false);
  assert.equal(f.walkingResumeButton.hidden, false); assert.equal(f.panel.hidden, true);
  s.key('keydown', 'KeyW'); assert.equal(f.keys.size, 0); assert.equal(c.moveForward, false);
  document.body.requestPointerLock = lock; f.walkingResumeButton.click();
  assert.equal(c.controls.isLocked, true); assert.equal(f.walkingResumeButton.hidden, true);
  const q = s.camera.quaternion.clone(); s.dispatch(document, 'mousemove', { movementX: 35, movementY: 0 });
  assert(q.angleTo(s.camera.quaternion) > .01); assert(!f.occupied);
});

test('a late exit lock after opening the map is released without returning to flight', t => {
  const s = setup(t), { f, c, document } = s;
  assert(f.board()); document.exitPointerLock();
  document.body.requestPointerLock = () => {};
  assert(f.exit()); assert.equal(f.walkingResumeButton.hidden, false);
  c.setMapOpen(true); c.setFreeMove(true); f.updateUI();
  document.pointerLockElement = c.domElement; s.dispatch(document, 'pointerlockchange');
  assert.equal(document.pointerLockElement, null); assert.equal(c.controls.isLocked, false);
  assert(c.freeMove); assert(!f.occupied); assert(!f.operationsOpen); assert(f.walkingResumeButton.hidden);
  s.key('keydown', 'KeyW'); assert(c.moveForward); assert.equal(f.keys.size, 0);
});

test('an old flight-resume Promise rejection cannot cancel a fresh boarding request', async t => {
  const s = setup(t), { f, document } = s;
  assert(f.board()); document.exitPointerLock();
  let rejectOld;
  document.body.requestPointerLock = () => new Promise((_, reject) => { rejectOld = reject; });
  assert(f.resumeOperations()); assert(f.resumePending);
  document.body.requestPointerLock = () => {};
  assert(f.exit()); assert(!f.occupied);
  s.key('keydown', 'KeyH'); assert(f.occupied); assert(f.operationsOpen); assert(f.resumePending);
  rejectOld(new Error('stale request rejected')); await Promise.resolve(); await Promise.resolve();
  assert(f.resumePending, 'the new flight request keeps its own ownership and timeout');
  assert(f.operationsOpen); assert.equal(document.pointerLockElement, null);
});

test('native unlock delivered after H dismount offers walking recovery, never reopens flight operations', t => {
  const s = setup(t), { f, c, document } = s;
  assert(f.board());
  const unlock = document.exitPointerLock;
  document.exitPointerLock = () => {}; // Native completion has not arrived yet.
  s.key('keydown', 'Escape'); assert(f.operationsOpen);
  s.key('keydown', 'KeyH'); assert(!f.occupied); assert.equal(c.controls.isLocked, true);
  document.exitPointerLock = unlock; unlock();
  assert.equal(c.controls.isLocked, false); assert(!f.operationsOpen); assert(f.panel.hidden);
  assert.equal(f.walkingResumeButton.hidden, false, 'late unlock has a visible walking-only recovery action');
  f.walkingResumeButton.click(); assert.equal(c.controls.isLocked, true); assert(!f.occupied);
  const q = s.camera.quaternion.clone(); s.dispatch(document, 'mousemove', { movementX: 25, movementY: 7 });
  assert(q.angleTo(s.camera.quaternion) > .01);
});

for (const delayedUnlock of [false, true]) test(`completed dismount does not label a later ordinary walking unlock as flight recovery (delayed=${delayedUnlock})`, t => {
  const s = setup(t), { f, c, document } = s;
  assert(f.board());
  const unlock = document.exitPointerLock;
  if(delayedUnlock){document.exitPointerLock=()=>{};s.key('keydown','Escape');}
  s.key('keydown','KeyH');assert(!f.occupied);
  if(delayedUnlock){document.exitPointerLock=unlock;unlock();assert(!f.walkingResumeButton.hidden);f.walkingResumeButton.click();}
  assert(c.controls.isLocked);assert.equal(f.walkingHandoff,false);
  c.setPosition(60,PLAYER.HEIGHT,-494);f.update(.1,200);unlock();
  assert.equal(f.walkingResumeButton.hidden,true,'ordinary walking welcome/menus own later unlocks');
  assert.equal(f.boardingPrompt.hidden,true);assert.equal(f.panel.hidden,true);
});
