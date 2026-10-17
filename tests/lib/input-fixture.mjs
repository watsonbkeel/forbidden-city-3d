import * as THREE from 'three';
import { FirstPersonControls } from '../../src/controls/FirstPerson.js';
import { CollisionManager } from '../../src/utils/Collision.js';
import { PLAYER } from '../../src/config/constants.js';
import { createDOM } from './ui-dom.mjs';

// Production controls/collision/PointerLockControls, with only DOM and time mocked.
// Render-equivalent matrix updates happen AFTER controls, as in main.js. Never
// call getWorldDirection/updateMatrix before a tested movement: it masks stale yaw.
export function setupInput(t, { mobile = false, map = false } = {}) {
  const saved = Object.fromEntries(['document', 'window', 'navigator'].map(name =>
    [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const dom = createDOM();
  for (const [name, value] of Object.entries({ document: dom.document, window: dom.window,
    navigator: { userAgent: mobile ? 'iPhone' : 'CPU input test' } })) {
    Object.defineProperty(globalThis, name, { configurable: true, value });
  }
  const { document, window, dispatch } = dom;
  document.body.ownerDocument = document;
  document.body.requestPointerLock = () => {
    document.pointerLockElement = document.body; dispatch(document, 'pointerlockchange');
  };
  document.exitPointerLock = () => {
    document.pointerLockElement = null; dispatch(document, 'pointerlockchange');
  };
  let now = 0;
  const clock = t.mock.method(performance, 'now', () => now);
  const camera = new THREE.PerspectiveCamera();
  const cm = new CollisionManager();
  const c = new FirstPersonControls(camera, document.body, cm);
  c.setPosition(0, PLAYER.HEIGHT, 0);
  camera.updateMatrixWorld(true); // Initial render only, before any input.
  if (!mobile) { if (map) c.setFreeMove(true); else c.lock(); }
  if (mobile) c.joystick.base.getBoundingClientRect = () => ({ left: 28, top: 200, width: 120, height: 120 });
  const logical = () => camera.position.clone().sub(c.bobOffset);
  const key = (type, code, extra = {}) => dispatch(document.body, type, { code, repeat: false, ...extra });
  const frame = (ms, update = () => c.update()) => {
    now += ms;
    update();
    camera.updateMatrixWorld(true);
    return logical();
  };
  const fingers = new Map();
  const touch = (type, id = 1, y = 230, x = 88) => {
    const finger = { identifier: id, clientX: x, clientY: y, target: document.body };
    if (type === 'touchend' || type === 'touchcancel') fingers.delete(id);
    else fingers.set(id, finger);
    return dispatch(document.body, type, { touches: [...fingers.values()], changedTouches: [finger] });
  };
  t.after(() => {
    c.dispose(); clock.mock.restore();
    for (const [name, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
    }
  });
  return { c, cm, camera, key, frame, touch, logical, dispatch, document, window,
    now: () => now, advance: ms => now += ms };
}

// Quaternion-only expectation, including vertical-looking cameras. Matrix and
// world-direction accessors must not synchronize production state for the test.
export function horizontalBasis(camera) {
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const forward = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), right);
  return { right, forward };
}

export { THREE, PLAYER };
