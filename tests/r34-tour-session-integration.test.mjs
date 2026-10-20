import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';
import * as THREE from 'three';
import { setupInput, PLAYER } from './lib/input-fixture.mjs';
import { flightWorld } from './lib/r15-flight-world.mjs';
import { FlightTour } from '../src/scene/flight/FlightTour.js';
import { createPhysicalWaypointDriver } from './lib/physical-waypoints.mjs';
import { continuousVisitorRoute } from './lib/continuous-visitor-route.mjs';

// Execute the actual main.createUI callbacks, rather than copying their logic.
// Only suppress application startup/WebGL and export its otherwise private class.
const mainURL = new URL('../main.js', import.meta.url).href;
registerHooks({ load(url, context, next) {
  if (url.endsWith('.json')) return { format: 'module', source: `export default ${fs.readFileSync(new URL(url), 'utf8')}`, shortCircuit: true };
  if (url === mainURL) {
    const source = fs.readFileSync(new URL(url), 'utf8');
    const marker = '// 本地开发暴露实例用于回归测试；生产页面不增加调试入口。';
    assert.equal(source.split(marker).length, 2, 'only the explicit application startup tail is replaced');
    return { format: 'module', source: source.slice(0, source.indexOf(marker)) + '\nexport { ForbiddenCityApp };', shortCircuit: true };
  }
  return next(url, context);
} });
const { ForbiddenCityApp } = await import('../main.js');
const W = flightWorld();
const route = continuousVisitorRoute().points;

function setup(t, { mobile = false } = {}) {
  let cleanup = () => {}; t.after(() => cleanup());
  const s = setupInput(t, { mobile });
  s.Element = s.document.body.constructor;
  s.window.innerWidth = mobile ? 390 : 960; s.window.innerHeight = mobile ? 844 : 540; s.window.devicePixelRatio = 1;
  s.document.head = s.document.createElement('head');
  Object.defineProperty(s.Element.prototype, 'dataset', { configurable: true, get() {
    return Object.fromEntries([...this.attributes].filter(([key]) => key.startsWith('data-')).map(([key, value]) => [key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), value]));
  } });
  Object.defineProperty(s.Element.prototype, 'parentElement', { configurable: true, get() { return this.parentNode instanceof s.Element ? this.parentNode : null; } });
  s.Element.prototype.blur = function () { if (s.document.activeElement === this) s.document.activeElement = s.document.body; };
  const create = s.document.createElement;
  s.document.createElement = tag => {
    const el = create(tag);
    if (tag === 'canvas') {
      const context = new Proxy({ measureText: text => ({ width: String(text).length * 6 }) }, { get: (o, k) => k in o ? o[k] : () => {} });
      el.getContext = () => context; el.clientWidth = 300;
      el.getBoundingClientRect = () => ({ left: 200, top: 30, width: 300, height: 300 });
      const captured = new Set(); el.setPointerCapture = id => captured.add(id); el.hasPointerCapture = id => captured.has(id); el.releasePointerCapture = id => captured.delete(id);
    }
    return el;
  };
  const welcome = s.document.createElement('div'); welcome.id = 'welcome-overlay'; s.document.body.appendChild(welcome);
  const app = new ForbiddenCityApp();
  app.scene = new THREE.Scene(); app.camera = s.camera; app.controls = s.c; app.collisionManager = W.cm;
  s.c.collisionManager = W.cm;
  app.zoneManager = { getMapItems: () => [...W.zoneManager.prebuilt.values()].flatMap(z => z.data.mapItems), ensureLoadedAt() {} };
  app.createUI(); app.bindWelcomeOverlay();
  const modeChanges = [];
  app.flight = new FlightTour({ scene: app.scene, camera: s.camera, controls: s.c, collisionManager: W.cm, zoneManager: app.zoneManager, envelope: W.envelope,
    isPaused: () => app.settingsTourSession.paused, onModeChange: occupied => {
      modeChanges.push(occupied);
      if (!occupied) { s.c.setMapOpen(app.minimap.visible); s.c.setFreeMove(app.minimap.visible); }
    } });
  // This is the same frame ownership as main.animate, with rendering omitted.
  const frame = (ms = 100) => s.frame(ms, () => {
    if (app.flight.occupied) s.c.prevTime = s.now(); else app.settingsTourSession.updateControls();
    app.flight.update(Math.min(ms / 1000, .1), s.now());
  });
  cleanup = () => {
    app.flight.dispose(); app.helpPanel.dispose(); app.settingsMenu.dispose(); app.minimap.dispose(); app.teleport.dispose();
    s.window.removeEventListener('keydown', app._onTeleportKey); s.window.removeEventListener('keydown', app._onKeyDown);
    s.c.controls.removeEventListener('lock', app._onLock); s.c.controls.removeEventListener('unlock', app._onUnlock);
  };
  return { ...s, app, frame, modeChanges };
}

function searchAndReturn(s, query, expectedName) {
  const map = s.app.minimap;
  if (!map.visible) map.toggle();
  if (map.detailVisible) map.placeBack.click();
  const input = map.container.querySelector('#place-search');
  input.value = query; s.dispatch(input, 'input');
  const results = map.placeList.querySelectorAll('button').filter(b => !b.hidden);
  const button = results.find(b => b.textContent === expectedName);
  assert.ok(button, `${query} returns ${expectedName}`);
  button.focus(); map.container.scrollTop = 93;
  const before = s.camera.position.clone(), aircraft = { ...s.app.flight.position };
  button.click(); assert.equal(map.placePanel.element.querySelector('#place-title').textContent, expectedName);
  map.placeBack.click();
  assert.equal(input.value, query); assert.equal(s.document.activeElement, button); assert.equal(map.container.scrollTop, 93);
  assert.deepEqual(s.app.flight.position, aircraft); assert.ok(s.camera.position.equals(before), 'search/card/back never changes position');
  return { input, button };
}

function walk(s, points, { fps = 10, onCrossing = () => {} } = {}) {
  const driver = createPhysicalWaypointDriver(points);
  assert.ok(Math.hypot(s.logical().x - points[0][0], s.logical().z - points[0][1]) < .01, 'walking continues at current physical position');
  let frames = 0;
  while (!driver.complete && frames++ < 20000) {
    const before = s.logical(), command = driver.command([before.x, before.z], false);
    s.camera.position.sub(s.c.bobOffset); s.camera.lookAt(command.target[0], s.camera.position.y, command.target[1]); s.camera.position.add(s.c.bobOffset);
    s.camera.updateMatrixWorld(true);
    if (s.c.isMobile) { if (!s.c.joystick.isActive()) s.touch('touchstart', 101, 245, 88); }
    else s.c.moveForward = true;
    s.c.canSprint = false;
    s.frame(1000 / fps, () => s.app.settingsTourSession.updateControls());
    const after = s.logical();
    if (driver.observe([before.x, before.z], [after.x, after.z])) onCrossing(driver.index - 1);
  }
  if (s.c.isMobile) s.touch('touchend', 101, 245, 88);
  s.c.stop();
  assert.equal(driver.complete, true, JSON.stringify({ index: driver.index, target: points[driver.index], at: s.logical().toArray() }));
  return driver;
}

for (const mobile of [false, true]) test(`actual main UI: continuous walk survives map search/back and settings (${mobile ? 'mobile' : 'desktop'})`, t => {
  const s = setup(t, { mobile });
  s.c.setPosition(...[route[0][0], PLAYER.HEIGHT, route[0][1]]);
  const setPosition = t.mock.method(s.c, 'setPosition');
  const go = t.mock.method(s.app.teleport, 'go');
  let checks = 0;
  walk(s, route, { onCrossing(index) {
    if (![1, 30, 65].includes(index)) return;
    checks++;
    searchAndReturn(s, ['太和殿', '乾清宫', '玄武门'][checks - 1], ['太和殿', '乾清宫', '神武门'][checks - 1]);
    const before = s.logical();
    s.app.settingsMenu.show(); assert(s.app.settingsTourSession.paused);
    for (let i = 0; i < 10; i++) s.frame(100, () => s.app.settingsTourSession.updateControls());
    assert.ok(s.logical().equals(before), 'settings pauses real controller without movement');
    s.app.settingsMenu.hide(); assert(!s.app.settingsTourSession.paused);
    assert(s.app.minimap.visible); assert(s.c.freeMove);
    s.app.minimap.toggle(); assert(!s.c.mapOpen);
  } });
  assert.equal(checks, 3); assert.equal(setPosition.mock.callCount(), 0, 'no teleport/reset at any interruption'); assert.equal(go.mock.callCount(), 0);
  assert.ok(s.logical().z >= 549.9); assert.equal(s.c.feetY, 0);
});

for (const mobile of [false, true]) test(`actual main UI: flight landing, map, interruptions, dismount walk and reboard (${mobile ? 'mobile' : 'desktop'})`, t => {
  const s = setup(t, { mobile }), f = s.app.flight;
  // One initial ground spawn near the actual home pad. Aircraft pose is never assigned.
  s.c.setPosition(22, PLAYER.HEIGHT, -494);
  f.updateUI(); f.boardButton.click(); assert(f.occupied);
  const resets = t.mock.method(s.c, 'setPosition');
  f.panel.querySelector('[data-action="tour"]').click();
  for (let i = 0; i < 150; i++) s.frame();
  assert.equal(f.state.mode, 'auto'); assert(f.position.y > 90);
  const searched = searchAndReturn(s, '乾清宫', '乾清宫');
  const go = t.mock.method(s.app.teleport, 'go');
  searched.button.click();
  const beforeTravel = s.camera.position.clone();
  s.app.minimap.placePanel.element.querySelector('#place-travel').click();
  assert.equal(go.mock.callCount(), 0, 'actual map travel callback rejects walking teleport while boarded');
  assert.ok(s.camera.position.equals(beforeTravel));
  assert(s.app.minimap.visible, 'rejected travel retains the map');
  s.app.minimap.placeBack.click();
  const beforeMapFlight = { ...f.position }; s.frame(); assert.notDeepEqual(f.position, beforeMapFlight, 'map does not pause flight');
  s.key('keydown', 'KeyW'); assert.equal(f.state.mode, 'manual'); s.frame(); s.key('keyup', 'KeyW');
  s.key('keydown', 'Escape'); assert(f.operationsOpen);
  const frozen = { ...f.position }; for (let i = 0; i < 10; i++) s.frame(); assert.deepEqual(f.position, frozen);
  assert(!f.exit(), 'airborne disembark refused'); assert.equal(resets.mock.callCount(), 0);
  s.app.settingsMenu.show(); s.frame(); assert(s.app.settingsTourSession.paused); assert.deepEqual(f.position, frozen);
  s.app.settingsMenu.hide(); assert(f.operationsOpen); assert(!s.app.settingsTourSession.paused);
  f.landingSelect.value = 'taihe-court'; f.panel.querySelector('[data-action="land"]').click();
  assert.equal(f.state.mode, 'auto');
  f.resumeButton.click(); assert(!f.operationsOpen);
  for (let i = 0; i < 1500 && !f.operationsOpen; i++) s.frame();
  assert(f.operationsOpen); assert(f.canExit()); assert.equal(f.operationsReason, 'landed');
  assert.ok(Math.hypot(f.position.x - 35, f.position.z + 155) < .02);
  f.setView('overhead'); f.boardButton.click(); assert(!f.occupied); assert.equal(resets.mock.callCount(), 1, 'one explicit disembark position placement');
  assert(!W.cm.checkCollision(s.logical(), .5)); assert.equal(s.c.feetY, 0); assert.deepEqual(s.camera.up.toArray(), [0, 1, 0]);
  assert(s.c.mapOpen && s.c.freeMove, 'walking returns to the still-open non-modal map');
  const start = [s.logical().x, s.logical().z];
  // Walk away from the exit side, then return by the same clear lane. No spawn.
  const sign = Math.sign(start[0] - f.position.x), far = [start[0] + sign * 12, start[1]];
  walk(s, [start, far]); assert(!f.canBoard());
  const physical = [s.logical().x, s.logical().z]; walk(s, [physical, start]); assert(f.canBoard());
  assert.equal(resets.mock.callCount(), 1, 'walking away and back never teleports');
  f.updateUI(); f.boardButton.click(); assert(f.occupied); assert.deepEqual(s.modeChanges, [true, false, true]);
  assert.equal(W.cm.colliders.filter(c => c.tag === 'virtual-tour-helicopter').length, 0, 'boarding removes parked collision once');
});
