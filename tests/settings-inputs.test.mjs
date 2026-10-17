import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CollisionManager } from '../src/utils/Collision.js';
import { FirstPersonControls } from '../src/controls/FirstPerson.js';
import { SettingsMenu } from '../src/ui/SettingsMenu.js';
import { SettingsTourSession } from '../src/ui/SettingsTourSession.js';
import { createDOM } from './lib/ui-dom.mjs';

function setup(t, { mobile = false, map = false } = {}) {
  const saved = Object.fromEntries(['document', 'window', 'navigator'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const dom = createDOM();
  Object.defineProperty(globalThis, 'document', { configurable: true, value: dom.document });
  Object.defineProperty(globalThis, 'window', { configurable: true, value: dom.window });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { userAgent: mobile ? 'iPhone' : 'Node test desktop' } });
  document.body.ownerDocument = document;
  document.body.requestPointerLock = () => { document.pointerLockElement = document.body; dom.dispatch(document, 'pointerlockchange'); };
  document.exitPointerLock = () => { document.pointerLockElement = null; dom.dispatch(document, 'pointerlockchange'); };
  const controls = new FirstPersonControls(new THREE.PerspectiveCamera(), document.body, new CollisionManager());
  controls.setPosition(0, 1.7, 0);
  if (map) controls.setFreeMove(true);
  else if (!mobile) controls.lock();
  let now = performance.now();
  t.mock.method(performance, 'now', () => now);
  const minimap = { visible: map };
  const welcomeOverlay = { style: {} };
  const session = new SettingsTourSession({ controls, isMobile: mobile, minimap, welcomeOverlay });
  const listenerCounts = [window.listenerCount(), document.listenerCount(), document.body.listenerCount()];
  let qualityCallbacks = 0;
  const menu = new SettingsMenu(document.body);
  menu.init({ onOpen: () => session.open(), onResume: () => session.resume(), onQualityChange: () => qualityCallbacks++ });
  const frame = () => { now += 1000 / 60; session.updateControls(); };
  t.after(() => {
    menu.dispose(); controls.dispose();
    for (const [name, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
    }
  });
  return { ...dom, controls, minimap, menu, session, frame, listenerCounts, callbacks: () => qualityCallbacks };
}

test('real desktop controller stops held movement, ignores modal keys, then resumes map mode on Escape', t => {
  // No test replacement of movement or CollisionManager methods.
  const state = setup(t, { map: true });
  const { controls, menu, dispatch, frame, minimap } = state;
  dispatch(document.body, 'keydown', { key: 'w', code: 'KeyW' });
  for (let i = 0; i < 12; i++) frame();
  assert.ok(controls.camera.position.z < -0.01);
  controls.jump();
  menu.show();
  const position = controls.camera.position.clone();
  assert.equal(controls.pressedKeys.size, 0); assert.equal(controls.jumpQueued, false);
  const content = menu.panel.querySelector('#settings-content');
  for (const [key, code] of [['w', 'KeyW'], [' ', 'Space'], ['q', 'KeyQ'], ['1', 'Digit1'], ['m', 'KeyM']]) {
    dispatch(content, 'keydown', { key, code });
  }
  for (let i = 0; i < 60; i++) frame();
  assert.equal(controls.camera.position.distanceTo(position), 0);
  assert.equal(controls.pressedKeys.size, 0); assert.equal(controls.jumpQueued, false);
  menu.panel.querySelector('#quality-toggle-btn').click();
  menu.panel.querySelector('#preview-details').querySelector('summary').click();
  assert.equal(state.callbacks(), 1); assert.equal(state.session.paused, true);
  assert.equal(controls.freeMove, false);
  dispatch(content, 'keydown', { key: 'Escape', code: 'Escape' });
  assert.equal(menu.visible, false); assert.equal(controls.freeMove, true); assert.equal(minimap.visible, true);
  assert.equal(controls.controls.isLocked, false);
  dispatch(document.body, 'keydown', { key: 'w', code: 'KeyW' });
  for (let i = 0; i < 12; i++) frame();
  assert.ok(controls.camera.position.distanceTo(position) > 0.01);
});

test('real mobile joystick resets on opening and modal touches do not reactivate it; Continue restores walking', t => {
  const { controls, menu, dispatch, frame } = setup(t, { mobile: true });
  controls.joystick.base.getBoundingClientRect = () => ({ left: 28, top: 200, width: 120, height: 120 });
  const touch = target => {
    const finger = { identifier: 7, clientX: 88, clientY: 220, target };
    return { touches: [finger], changedTouches: [finger] };
  };
  dispatch(document.body, 'touchstart', touch(document.body));
  for (let i = 0; i < 12; i++) frame();
  assert.ok(controls.joystick.isActive());
  assert.ok(controls.camera.position.z < -0.01);
  menu.show();
  const position = controls.camera.position.clone();
  const quaternion = controls.camera.quaternion.clone();
  assert.equal(controls.joystick.isActive(), false);
  const content = menu.panel.querySelector('#settings-content');
  dispatch(content, 'touchstart', touch(content));
  dispatch(content, 'touchmove', { changedTouches: [{ identifier: 7, clientX: 120, clientY: 260, target: content }] });
  for (let i = 0; i < 60; i++) frame();
  assert.equal(controls.joystick.isActive(), false);
  assert.equal(controls.camera.position.distanceTo(position), 0);
  assert.equal(controls.camera.quaternion.angleTo(quaternion), 0);
  menu.panel.querySelector('#resume-btn').click();
  dispatch(document.body, 'touchstart', touch(document.body));
  for (let i = 0; i < 12; i++) frame();
  assert.ok(controls.joystick.isActive());
  assert.ok(controls.camera.position.distanceTo(position) > 0.01);
});

test('disposing an open menu removes its handlers without changing the controller mode or adding a relock', t => {
  const { menu, controls, listenerCounts } = setup(t);
  menu.show();
  assert.equal(controls.controls.isLocked, false);
  menu.dispose();
  assert.deepEqual([window.listenerCount(), document.listenerCount(), document.body.listenerCount()], listenerCounts);
  assert.equal(controls.controls.isLocked, false);
});

test('a second finger can open settings while the real joystick remains held, without a synthetic click', t => {
  const { controls, menu, dispatch, frame } = setup(t, { mobile: true });
  controls.joystick.base.getBoundingClientRect = () => ({ left: 28, top: 200, width: 120, height: 120 });
  const held = { identifier: 1, clientX: 88, clientY: 220, target: document.body };
  dispatch(document.body, 'touchstart', { touches: [held], changedTouches: [held] });
  for (let i = 0; i < 12; i++) frame();
  assert.equal(controls.joystick.isActive(), true);
  const launcher = document.getElementById('structural-preview-button');
  const second = { identifier: 2, clientX: 195, clientY: 580, target: launcher };
  dispatch(launcher, 'touchstart', { touches: [held, second], changedTouches: [second] });
  assert.equal(menu.visible, true);
  assert.equal(document.activeElement.id, 'settings-title');
  assert.equal(controls.joystick.isActive(), false);
  const position = controls.camera.position.clone();
  dispatch(document.body, 'touchmove', { touches: [held], changedTouches: [{ ...held, clientY: 200 }] });
  for (let i = 0; i < 60; i++) frame();
  assert.equal(controls.camera.position.distanceTo(position), 0);
  dispatch(launcher, 'touchend', { touches: [held], changedTouches: [second] });
  const tapWhileHeld = target => {
    const finger = { identifier: 3, target, clientX: 195, clientY: 400 };
    dispatch(target, 'touchstart', { touches: [held, finger], changedTouches: [finger] });
    dispatch(target, 'touchend', { touches: [held], changedTouches: [finger] });
  };
  const quality = menu.currentQuality;
  tapWhileHeld(menu.panel.querySelector('#quality-toggle-btn'));
  assert.notEqual(menu.currentQuality, quality);
  assert.equal(menu.visible, true);
  tapWhileHeld(menu.panel.querySelector('#resume-btn'));
  assert.equal(menu.visible, false, 'Continue works even while the original first finger remains held');
  const basePosition = controls.camera.position.clone().sub(controls.bobOffset);
  dispatch(document.body, 'touchmove', { touches: [held], changedTouches: [{ ...held, clientY: 180 }] });
  for (let i = 0; i < 30; i++) frame();
  assert.equal(controls.joystick.isActive(), false, 'closing cannot reacquire the old held touch');
  assert.equal(controls.joystick.touchId, null);
  assert.equal(controls.motion.speed, 0);
  assert.ok(controls.camera.position.clone().sub(controls.bobOffset).distanceTo(basePosition) < 1e-9);
  dispatch(document.body, 'touchend', { touches: [], changedTouches: [held] });
  dispatch(document.body, 'touchstart', { touches: [held], changedTouches: [held] });
  for (let i = 0; i < 12; i++) frame();
  assert.ok(controls.camera.position.distanceTo(position) > 0.01);
});
