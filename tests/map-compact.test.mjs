import test from 'node:test';
import assert from 'node:assert/strict';
import { setupMap, mapPointer, touchAt } from './lib/map-fixture.mjs';

const modeButton = s => s.map.container.querySelector('#minimap-size-toggle');
const compact = s => {
  const button = modeButton(s);
  assert.ok(button, 'an explicit collapse/expand control exists');
  button.click();
};

for (const mobile of [false, true]) test(`compact layout preserves live ${mobile ? 'joystick' : 'keyboard'} walking and exact view state`, async t => {
  const s = await setupMap(t, { mobile });
  s.map.toggle();
  if (mobile) s.touch('touchstart'); else s.key('keydown', 'ArrowUp');
  for (let i = 0; i < 25; i++) s.frame(100);
  const generation = s.c.joystick?.sessionGeneration;
  const time = mobile ? s.c.runStartTime : s.c.keyPressTimes.get('ArrowUp');
  s.map.view = { k: 3.5, cx: 277, cy: 192 };
  const view = { ...s.map.view };
  const lifecycle = t.mock.method(s.lifecycle, 'setVisible');
  for (let i = 0; i < 4; i++) {
    s.map.canvas.clientWidth = i % 2 ? 730 : 198;
    compact(s);
    assert.equal(s.map.compact, i % 2 === 0);
    assert.equal(s.map.visible, true);
    assert.equal(s.c.mapOpen, true);
    assert.equal(s.c.freeMove, true);
    assert.equal(s.c.controls.isLocked, false);
    assert.deepEqual(s.map.view, view, 'layout-only resizing must not clamp or reset pan');
    const p = s.logical();
    s.frame(100);
    assert.ok(s.logical().distanceTo(p) > 0);
  }
  assert.equal(lifecycle.mock.callCount(), 0, 'mode switches are not open/close transitions');
  assert.equal(mobile ? s.c.runStartTime : s.c.keyPressTimes.get('ArrowUp'), time);
  if (mobile) assert.equal(s.c.joystick.sessionGeneration, generation);
  if (mobile) s.touch('touchend'); else s.key('keyup', 'ArrowUp');
  assert.equal(mobile ? s.c.joystick.active : s.c.moveForward, false);
});

test('compact closes normally, restores full-map default and keeps the closed mobile preview distinct', async t => {
  const s = await setupMap(t, { mobile: true });
  s.map.preview.focus();
  s.map.preview.click();
  compact(s);
  assert.equal(s.map.preview.style.display, 'none');
  assert.equal(s.map.preview.getAttribute('aria-expanded'), 'true');
  s.map.container.querySelector('#minimap-close').click();
  assert.equal(s.map.visible, false);
  assert.equal(s.map.compact, false);
  assert.equal(s.c.mapOpen, false);
  assert.equal(s.map.preview.style.display, 'block');
  assert.equal(s.document.activeElement, s.map.preview);
  s.map.preview.click();
  assert.equal(s.map.compact, false);
  assert.equal(s.map.view.k, 2, 'existing fresh-open player focus stays unchanged');
});

test('compact details are hidden and inert, focused details move to expand, and disclosure stays reachable', async t => {
  const s = await setupMap(t);
  s.map.toggle();
  s.map.container.querySelector('#teleport-points').querySelector('button').focus();
  compact(s);
  assert.equal(s.document.activeElement, modeButton(s));
  for (const id of ['minimap-title', 'minimap-tools', 'minimap-help', 'teleport-points']) {
    const element = s.map.container.querySelector(`#${id}`);
    assert.ok(element.hidden, `${id} hidden`);
    assert.ok(element.inert, `${id} not focusable`);
  }
  assert.equal(s.map.container.contains(s.menu.launcher), true);
  assert.equal(s.menu.launcher.hidden, false);
  assert.equal(s.menu.launcher.inert, false);
  assert.match(s.map.container.querySelector('#minimap-compact-hint').textContent, /展开.*传送/);
  assert.equal(modeButton(s).getAttribute('aria-expanded'), 'false');
  compact(s);
  assert.equal(modeButton(s).getAttribute('aria-expanded'), 'true');
  assert.equal(s.map.container.querySelector('#teleport-points').hidden, false);
  assert.equal(s.map.container.querySelector('#teleport-points').inert, false);
});

for (const mobile of [false, true]) test(`existing disclosure pauses compact ${mobile ? 'touch' : 'desktop'} movement and resumes with fresh input`, async t => {
  const s = await setupMap(t, { mobile });
  s.map.toggle(); compact(s);
  if (mobile) s.touch('touchstart'); else s.key('keydown', 'KeyW');
  s.frame(100); s.c.jump();
  s.menu.launcher.click();
  assert.equal(s.menu.visible, true);
  assert.equal(s.settingsSession.paused, true);
  assert.equal(s.c.freeMove, false);
  assert.equal(s.c.jumpQueued, false);
  const p = s.logical();
  s.frame(1000, () => s.settingsSession.updateControls());
  assert.equal(s.logical().distanceTo(p), 0);
  s.menu.hide();
  assert.equal(s.map.compact, true);
  assert.equal(s.c.freeMove, true);
  if (mobile) { s.touch('touchmove'); assert.equal(s.c.joystick.active, false); s.touch('touchend'); s.touch('touchstart'); }
  else { s.key('keydown', 'KeyW', { repeat: true }); assert.equal(s.c.moveForward, false); s.key('keyup', 'KeyW'); s.key('keydown', 'KeyW'); }
  s.frame(100);
  assert.ok(s.logical().distanceTo(p) > 0);
  s.map.toggle();
  assert.equal(s.menu.launcher.parentNode, s.document.body);
  assert.equal(s.menu.launcher.hidden, false);
  assert.equal(s.menu.launcher.inert, false);
});

test('compact map taps never teleport; pan and wheel still work; expanded labels retain teleport', async t => {
  const s = await setupMap(t);
  s.map.toggle(); s.map.canvas.clientWidth = 198; compact(s);
  s.map.labels = [{ name: '太和殿', x: s.map.view.cx, y: s.map.view.cy, width: 10000, height: 10000 }];
  mapPointer(s, 'pointerdown', 1); mapPointer(s, 'pointerup', 1);
  assert.deepEqual(s.teleports, []);
  const cx = s.map.view.cx;
  mapPointer(s, 'pointerdown', 2); mapPointer(s, 'pointermove', 2, 260, 90); mapPointer(s, 'pointerup', 2, 260, 90);
  assert.notEqual(s.map.view.cx, cx);
  const zoom = s.map.view.k;
  s.dispatch(s.map.canvas, 'wheel', { clientX: 240, clientY: 70, deltaY: -1 });
  assert.ok(s.map.view.k > zoom);
  assert.deepEqual(s.teleports, []);
  compact(s);
  mapPointer(s, 'pointerdown', 3); mapPointer(s, 'pointerup', 3);
  assert.deepEqual(s.teleports, ['太和殿']);
  assert.equal(s.map.visible, false);
});

test('mode switch cancels canvas capture and pending secondary taps without cancelling held joystick', async t => {
  const s = await setupMap(t, { mobile: true });
  s.map.toggle(); s.touch('touchstart', 1);
  const held = { identifier: 1, target: s.document.body, clientX: 88, clientY: 230 };
  const zoomButton = s.map.container.querySelectorAll('button').find(b => b.title === '放大');
  touchAt(s, zoomButton, 'touchstart', 2, 200, 100, [held]);
  mapPointer(s, 'pointerdown', 3);
  compact(s);
  const view = { ...s.map.view };
  assert.equal(s.map.canvas.hasPointerCapture(3), false);
  assert.equal(s.c.joystick.touchId, 1);
  touchAt(s, zoomButton, 'touchend', 2, 200, 100, [held]);
  mapPointer(s, 'pointerup', 3);
  assert.deepEqual(s.map.view, view);
  assert.deepEqual(s.teleports, []);
  touchAt(s, modeButton(s), 'touchstart', 4, 200, 100, [held]);
  touchAt(s, modeButton(s), 'touchend', 4, 200, 100, [held]);
  assert.equal(s.map.compact, false);
  s.dispatch(modeButton(s), 'click', { detail: 1 });
  assert.equal(s.map.compact, false, 'compatibility click cannot collapse again');
  assert.equal(s.c.joystick.touchId, 1);
});

for (const [width, height] of [[390, 844], [844, 390], [1280, 720], [844, 240]]) {
  test(`compact canvas budget is bounded at ${width}×${height}; very short mode keeps an explicit expand control`, async t => {
    const s = await setupMap(t, { mobile: width < 1000 });
    s.window.innerWidth = width; s.window.innerHeight = height;
    s.map.toggle(); compact(s);
    assert.ok(s.map.viewH > 0 && s.map.viewH <= 144);
    assert.equal(s.map.canvas.hidden, height < 340);
    assert.equal(modeButton(s).hidden, false);
    assert.equal(s.menu.launcher.hidden, false);
    assert.equal(s.map.container.querySelector('#minimap-close').hidden, false);
  });
}

test('compact follows the visual viewport and restores canvas when the viewport recovers', async t => {
  const s = await setupMap(t, { mobile: true });
  s.map.toggle(); compact(s);
  s.window.visualViewport = { height: 240, addEventListener() {}, removeEventListener() {} };
  s.map._onResize();
  assert.equal(s.map.canvas.hidden, true);
  s.window.visualViewport.height = 844;
  s.map._onResize();
  assert.equal(s.map.canvas.hidden, false);
});

test('heading uses +Z north and +X west, with no redundant text mutations', async t => {
  const s = await setupMap(t);
  const heading = s.map.container.querySelector('#minimap-heading');
  assert.ok(heading, 'readable orientation cue exists');
  const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(heading), 'textContent');
  let writes = 0;
  Object.defineProperty(heading, 'textContent', {
    get() { return descriptor.get.call(this); },
    set(value) { writes++; descriptor.set.call(this, value); },
  });
  for (const [x, z, name] of [[0, 1, '北'], [-1, 1, '东北'], [-1, 0, '东'], [-1, -1, '东南'], [0, -1, '南'], [1, -1, '西南'], [1, 0, '西'], [1, 1, '西北']]) {
    s.camera.lookAt(x, s.camera.position.y, z); s.camera.updateMatrixWorld(true);
    s.map.update(s.camera);
    assert.equal(heading.textContent, `朝向 ${name}`);
    const count = writes;
    s.map.update(s.camera); s.map.update(s.camera);
    assert.equal(writes, count);
  }
});

test('recovering a hidden compact canvas measures its visible width after the layout state changes', async t => {
  const s = await setupMap(t, { mobile: true });
  s.window.innerWidth = 844; s.window.innerHeight = 240;
  s.map.toggle(); compact(s);
  Object.defineProperty(s.map.canvas, 'clientWidth', { get() { return this.hidden ? 0 : 198; } });
  s.window.innerHeight = 390;
  s.map._onResize();
  assert.equal(s.map.canvas.hidden, false);
  assert.equal(s.map.viewW, 198, 'pointer coordinates use the restored canvas, not hidden fallback width');
});

test('compact pinch zoom retains multi-contact ownership and never teleports on the final lift', async t => {
  const s = await setupMap(t, { mobile: true });
  s.map.toggle(); s.map.canvas.clientWidth = 198; compact(s);
  const zoom = s.map.view.k;
  mapPointer(s, 'pointerdown', 1, 220, 70); mapPointer(s, 'pointerdown', 2, 260, 70);
  mapPointer(s, 'pointermove', 2, 280, 70); mapPointer(s, 'pointermove', 2, 300, 70);
  assert.ok(s.map.view.k > zoom);
  mapPointer(s, 'pointerup', 1, 220, 70); mapPointer(s, 'pointerup', 2, 300, 70);
  assert.deepEqual(s.teleports, []);
  assert.equal(s.map.visible, true);
});
