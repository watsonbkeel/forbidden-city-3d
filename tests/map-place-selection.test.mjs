import test from 'node:test';
import assert from 'node:assert/strict';
import { setupMap, mapPointer, touchAt } from './lib/map-fixture.mjs';

const select = (s, id = 'taihe') => s.map.showPlace(id);
const travel = s => s.map.container.querySelector('#place-travel');

for (const mobile of [false, true]) test(`place selection preserves held ${mobile ? 'joystick' : 'keyboard'} timing and map lifecycle`, async t => {
  const s = await setupMap(t, { mobile });
  s.map.hasTeleportTarget = name => name === '太和殿';
  s.map.toggle();
  if (mobile) s.touch('touchstart'); else s.key('keydown', 'KeyW');
  s.frame(2000);
  const start = mobile ? s.c.runStartTime : s.c.keyPressTimes.get('KeyW');
  const generation = s.c.joystick?.sessionGeneration;
  const view = { ...s.map.view };
  const lifecycle = t.mock.method(s.lifecycle, 'setVisible');
  s.map.labels = [{ name: '太和殿', placeId: 'taihe', x: s.map.view.cx, y: s.map.view.cy, width: 10000, height: 10000 }];
  mapPointer(s, 'pointerdown', 4); mapPointer(s, 'pointerup', 4);
  assert.deepEqual(s.teleports, [], 'a canvas selection never teleports');
  assert.equal(s.map.selectedPlaceId, 'taihe');
  assert.match(s.map.container.querySelector('#place-info').textContent, /国家典礼/);
  const p = s.logical(); s.frame(100);
  assert.ok(s.logical().distanceTo(p) > 0);
  s.map.container.querySelector('#place-back').click();
  assert.equal(s.map.detailVisible, false);
  assert.deepEqual(s.map.view, view);
  assert.equal(lifecycle.mock.callCount(), 0);
  assert.equal(mobile ? s.c.runStartTime : s.c.keyPressTimes.get('KeyW'), start);
  if (mobile) assert.equal(s.c.joystick.sessionGeneration, generation);
});

test('known and unknown cards need a separately resolved explicit travel button', async t => {
  const s = await setupMap(t); s.map.toggle();
  s.map.hasTeleportTarget = name => ['太和殿', '未收录殿'].includes(name);
  select(s); assert.deepEqual(s.teleports, []); travel(s).click();
  assert.deepEqual(s.teleports, ['太和殿']); assert.equal(s.map.visible, false);
  s.map.toggle(); s.map.selectMapLabel({ name: '未收录殿' });
  assert.match(s.map.container.querySelector('#place-info').textContent, /尚未收录/);
  travel(s).click(); assert.deepEqual(s.teleports, ['太和殿', '未收录殿']);
  s.map.toggle(); s.map.selectMapLabel({ name: '不存在' });
  assert.equal(travel(s), null);
});

for (const boundary of ['replace', 'back', 'compact', 'close', 'dispose']) test(`${boundary} invalidates pending and detached travel clicks`, async t => {
  const s = await setupMap(t, { mobile: true }); s.map.hasTeleportTarget = () => true;
  s.map.toggle(); select(s); s.touch('touchstart', 1);
  const button = travel(s), held = { identifier: 1, target: s.document.body, clientX: 88, clientY: 230 };
  touchAt(s, button, 'touchstart', 2, 200, 100, [held]);
  if (boundary === 'replace') select(s, 'baohe');
  if (boundary === 'back') s.map.backToMap();
  if (boundary === 'compact') s.map.setCompact(true);
  if (boundary === 'close') s.map.toggle();
  if (boundary === 'dispose') s.map.dispose();
  touchAt(s, button, 'touchend', 2, 200, 100, [held]); button.click();
  assert.deepEqual(s.teleports, []);
  if (!['close', 'dispose'].includes(boundary)) assert.equal(s.c.joystick.touchId, 1);
});

test('travel failure keeps card; second-finger success deduplicates compatibility click', async t => {
  const s = await setupMap(t, { mobile: true }); s.map.hasTeleportTarget = () => true;
  s.map.toggle(); select(s); let calls = 0;
  s.map.onTeleport = () => { calls++; return false; };
  travel(s).click(); assert.equal(calls, 1); assert.equal(s.map.detailVisible, true);
  assert.equal(s.map.visible, true);
  s.map.onTeleport = () => { calls++; return true; };
  const button = travel(s), held = { identifier: 1, target: s.document.body, clientX: 88, clientY: 230 };
  touchAt(s, button, 'touchstart', 2, 200, 100, [held]); touchAt(s, button, 'touchend', 2, 200, 100, [held]);
  s.dispatch(button, 'click', { detail: 1 }); assert.equal(calls, 2); assert.equal(s.map.visible, false);
});

test('map has 159 keyboard information buttons, separate unchanged quick travel, safe sources and nonmodal region', async t => {
  const s = await setupMap(t); s.map.toggle();
  const list = s.map.container.querySelector('#place-list');
  assert.equal(list.querySelectorAll('button').length, 159);
  list.querySelectorAll('button')[2].click();
  const panel = s.map.container.querySelector('#place-info');
  assert.equal(panel.getAttribute('role'), 'region'); assert.equal(panel.getAttribute('aria-modal'), null);
  assert.match(panel.textContent, /模型漫游不代表现场开放许可/);
  for (const a of panel.querySelectorAll('a')) {
    assert.match(a.getAttribute('href'), /^https:\/\/(?:www|img)\.dpm\.org\.cn\//);
    assert.equal(a.getAttribute('rel'), 'noopener noreferrer'); assert.equal(a.getAttribute('target'), '_blank');
  }
  assert.deepEqual(s.map.container.querySelector('#teleport-points').querySelectorAll('button').map(b => b.dataset.teleport), ['午门','太和殿','乾清宫','御花园','景仁宫','永寿宫','宁寿宫','神武门']);
});

test('compact hides details and returns to summary with explicit continue-reading', async t => {
  const s = await setupMap(t); s.map.hasTeleportTarget = () => true; s.map.toggle(); select(s);
  travel(s).focus(); s.map.setCompact(true);
  assert.equal(s.document.activeElement, s.map.sizeToggle);
  const panel = s.map.container.querySelector('#place-info');
  assert.equal(panel.hidden, true); assert.equal(panel.inert, true);
  s.map.setCompact(false); assert.equal(s.map.detailVisible, false);
  s.map.container.querySelector('#place-resume').click(); assert.equal(s.map.detailVisible, true);
});

test('repeated map tap and resize while reading do not redraw or reset selection/view', async t => {
  const s = await setupMap(t); s.map.toggle(); select(s); const view = { ...s.map.view };
  const button = travel(s), generation = s.map.selectionGeneration;
  select(s); s.map._onResize();
  assert.equal(travel(s), button); assert.equal(s.map.selectionGeneration, generation);
  assert.equal(s.map.canvas.hidden, true); assert.deepEqual(s.map.view, view);
});

test('missing or ambiguous side binding never borrows a card and unknown ID is inert', async t => {
  const s = await setupMap(t); s.map.toggle();
  assert.equal(s.map.showPlace('missing'), false); assert.equal(s.map.detailVisible, false);
  s.map.selectMapLabel({ name: '别处', placeId: 'taihe' });
  assert.equal(s.map.selectedPlaceId, null); assert.match(s.map.placePanel.element.textContent, /尚未收录/);
});

test('compatibility and double clicks alone cannot activate newly shown travel', async t => {
  const s = await setupMap(t); s.map.hasTeleportTarget = () => true; s.map.toggle(); select(s);
  const button = travel(s);
  s.dispatch(button, 'click', { detail: 1 });
  s.dispatch(button, 'click', { detail: 2 });
  assert.deepEqual(s.teleports, []);
  s.dispatch(button, 'pointerdown', { pointerId: 2, isPrimary: true });
  s.dispatch(button, 'click', { detail: 1 });
  assert.deepEqual(s.teleports, ['太和殿']);
});

for (const end of ['pointercancel', 'drag']) test(`travel ${end} cannot activate through a later native click`, async t => {
  const s = await setupMap(t); s.map.hasTeleportTarget = () => true; s.map.toggle(); select(s);
  const button = travel(s);
  s.dispatch(button, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 });
  if (end === 'pointercancel') s.dispatch(button, 'pointercancel', { pointerId: 1 });
  else s.dispatch(button, 'pointermove', { pointerId: 1, clientX: 20, clientY: 0 });
  s.dispatch(button, 'click', { detail: 1 }); assert.deepEqual(s.teleports, []);
});

test('source links accept the existing validated second-finger tap without travel', async t => {
  const s = await setupMap(t, { mobile: true }); s.map.toggle(); select(s); s.touch('touchstart', 1);
  const link = s.map.placePanel.element.querySelector('a'); let opens = 0;
  link.addEventListener('click', () => opens++);
  const held = { identifier: 1, target: s.document.body, clientX: 88, clientY: 230 };
  touchAt(s, link, 'touchstart', 2, 200, 100, [held]); touchAt(s, link, 'touchend', 2, 200, 100, [held]);
  s.dispatch(link, 'click', { detail: 1 });
  assert.equal(opens, 1); assert.equal(s.c.joystick.touchId, 1); assert.deepEqual(s.teleports, []);
});

test('settings pauses and resumes the same detail card with fresh inputs', async t => {
  const s = await setupMap(t, { mobile: true }); s.map.toggle(); select(s);
  s.touch('touchstart', 1); s.frame(100); s.menu.launcher.click();
  assert.equal(s.settingsSession.paused, true); assert.equal(s.c.freeMove, false);
  s.menu.hide(); assert.equal(s.map.selectedPlaceId, 'taihe'); assert.equal(s.map.detailVisible, true);
  assert.equal(s.c.freeMove, true); assert.equal(s.c.joystick.active, false);
  s.touch('touchmove', 1); assert.equal(s.c.joystick.active, false);
});

test('detail controls retain native keyboard behavior and release held movement after focus changes', async t => {
  const s = await setupMap(t); s.map.hasTeleportTarget = () => true; s.map.toggle(); s.key('keydown', 'KeyW'); select(s);
  for (const target of [travel(s), s.map.placePanel.element.querySelector('a'), s.map.placeBack]) {
    for (const code of ['Space', 'Enter', 'Tab']) {
      const e = s.dispatch(target, 'keydown', { code, key: code === 'Space' ? ' ' : code, repeat: false });
      assert.equal(e.defaultPrevented, false); assert.equal(s.c.jumpQueued, false);
    }
  }
  s.dispatch(travel(s), 'keyup', { code: 'KeyW' }); assert.equal(s.c.moveForward, false);
});

test('closed/disposed maps reject new cards, and re-open starts with the existing player view', async t => {
  const s = await setupMap(t); assert.equal(s.map.showPlace('taihe'), false);
  s.map.toggle(); select(s); s.map.toggle(); assert.equal(s.map.selection, null);
  s.map.toggle(); assert.equal(s.map.detailVisible, false); assert.equal(s.map.view.k, 2);
  s.map.dispose(); assert.equal(s.map.showPlace('taihe'), false); assert.equal(s.map.secondaryTaps.size, 0); assert.equal(s.map.suppressedClicks.size, 0);
});

for (const duplicate of ['side-items', 'canvas-labels', 'layout-and-side']) test(`ambiguous ${duplicate} cannot offer name-only travel even when the existing target map resolves`, async t => {
  const s = await setupMap(t); s.map.hasTeleportTarget = () => true; s.map.toggle();
  const name = duplicate === 'layout-and-side' ? '太和殿' : '同名殿';
  if (duplicate === 'side-items') s.map.items = [{ kind: 'hall', name }, { kind: 'hall', name }];
  if (duplicate === 'canvas-labels') s.map.labels = [{ name }, { name }];
  if (duplicate === 'layout-and-side') s.map.items = [{ kind: 'hall', name }];
  s.map.selectMapLabel({ name });
  assert.equal(travel(s), null); assert.deepEqual(s.teleports, []);
});

test('travel cancels a mouse drag that exits and re-enters the button near its press point', async t => {
  const s = await setupMap(t); s.map.hasTeleportTarget = () => true; s.map.toggle(); s.map.showPlace('taihe');
  const button = s.map.container.querySelector('#place-travel');
  s.dispatch(button, 'pointerdown', { pointerId: 4, pointerType: 'mouse', clientX: 100, clientY: 100 });
  s.dispatch(button, 'pointerout', { pointerId: 4, pointerType: 'mouse', clientX: 103, clientY: 100, relatedTarget: s.map.placePanel.element });
  s.dispatch(button, 'pointerleave', { pointerId: 4, pointerType: 'mouse', clientX: 103, clientY: 100, relatedTarget: s.map.placePanel.element });
  s.dispatch(s.map.placePanel.element, 'pointermove', { pointerId: 4, pointerType: 'mouse', clientX: 200, clientY: 100 });
  s.dispatch(button, 'pointerover', { pointerId: 4, pointerType: 'mouse', clientX: 103, clientY: 100 });
  s.dispatch(button, 'pointermove', { pointerId: 4, pointerType: 'mouse', clientX: 103, clientY: 100 });
  s.dispatch(button, 'pointerup', { pointerId: 4, pointerType: 'mouse', clientX: 100, clientY: 100 });
  s.dispatch(button, 'click', { pointerId: 4, pointerType: 'mouse', detail: 1 });
  assert.deepEqual(s.teleports, [], 'Leaving the uncaptured button must invalidate this press, even when re-entry is within 10px');
});

test('non-hover touch pointerleave after a valid release retains its native click', async t => {
  const s = await setupMap(t, { mobile: true }); s.map.hasTeleportTarget = () => true; s.map.toggle(); select(s);
  const button = travel(s);
  s.dispatch(button, 'pointerdown', { pointerId: 4, pointerType: 'touch', clientX: 100, clientY: 100 });
  s.dispatch(button, 'pointerup', { pointerId: 4, pointerType: 'touch', clientX: 100, clientY: 100 });
  s.dispatch(button, 'pointerout', { pointerId: 4, pointerType: 'touch', clientX: 100, clientY: 100 });
  s.dispatch(button, 'pointerleave', { pointerId: 4, pointerType: 'touch', clientX: 100, clientY: 100 });
  s.dispatch(button, 'click', { pointerId: 4, pointerType: 'touch', detail: 1 });
  assert.deepEqual(s.teleports, ['太和殿']);
});
