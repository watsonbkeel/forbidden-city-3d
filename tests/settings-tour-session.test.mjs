import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

async function setup({ mobile = false, map = false, freeMove = map, locked = !mobile && !map, welcome = 'flex' } = {}) {
  const url = new URL('../src/ui/SettingsTourSession.js', import.meta.url);
  assert.ok(existsSync(url), 'settings lifecycle must explicitly pause and resume tour inputs');
  const { SettingsTourSession } = await import(url);
  const controls = {
    controls: { isLocked: locked },
    freeMove, jumpQueued: true, lookTouchId: 4, joystickActive: true, pressedKeys: new Set(['KeyW']),
    position: 0, ticks: 0, locks: 0, unlocks: 0, prevTime: 0,
    motion: { speed: 3, sprint: true, footstep: true },
    stop() { this.pressedKeys.clear(); this.lookTouchId = null; this.joystickActive = false; },
    setFreeMove(value) { this.freeMove = value; },
    lock() { this.locks++; this.controls.isLocked = true; }, unlock() { this.unlocks++; this.controls.isLocked = false; },
    update() { this.ticks++; this.position += 1; },
  };
  const minimap = { visible: map };
  const welcomeOverlay = { style: { display: welcome } };
  return { controls, minimap, welcomeOverlay, session: new SettingsTourSession({ controls, isMobile: mobile, minimap, welcomeOverlay }) };
}

for (const mobile of [false, true]) {
  test(`opening settings clears pending inputs and freezes updates on ${mobile ? 'mobile' : 'desktop'}`, async () => {
    const { controls, welcomeOverlay, session } = await setup({ mobile });
    session.open(); session.open();
    assert.equal(session.paused, true);
    assert.equal(controls.freeMove, false);
    assert.equal(controls.pressedKeys.size, 0);
    assert.equal(controls.joystickActive, false);
    assert.equal(controls.lookTouchId, null);
    assert.equal(controls.jumpQueued, false);
    assert.equal(welcomeOverlay.style.display, 'none');
    session.updateControls(); session.updateControls();
    assert.equal(controls.position, 0); assert.equal(controls.ticks, 0);
    assert.deepEqual(controls.motion, { speed: 0, sprint: false, footstep: false });
    session.resume(); session.resume();
    assert.equal(session.paused, false);
    assert.equal(controls.freeMove, false);
    assert.equal(controls.locks, mobile ? 0 : 1, 'resume locks desktop only once');
    assert.ok(controls.prevTime > 0);
    session.updateControls();
    assert.equal(controls.position, 1); assert.equal(controls.ticks, 1);
  });
}

test('closing settings restores map free-move without locking or closing the map', async () => {
  const { controls, minimap, welcomeOverlay, session } = await setup({ map: true });
  session.open(); assert.equal(controls.freeMove, false);
  session.resume();
  assert.equal(controls.freeMove, true); assert.equal(minimap.visible, true);
  assert.equal(controls.locks, 0); assert.equal(welcomeOverlay.style.display, 'none');
});

test('source/quality actions cannot alter session state and every reopening captures current map mode', async () => {
  const { controls, minimap, session } = await setup();
  session.open(); session.updateControls();
  assert.equal(session.paused, true); assert.equal(controls.freeMove, false);
  session.resume();
  controls.freeMove = true; minimap.visible = true;
  session.open(); session.resume();
  assert.equal(controls.freeMove, true); assert.equal(controls.locks, 1);
});

test('a denied desktop relock leaves the welcome click fallback usable and the session unpaused', async () => {
  const { controls, welcomeOverlay, session } = await setup();
  controls.lock = () => { throw new Error('user gesture needed'); };
  session.open();
  assert.doesNotThrow(() => session.resume());
  assert.equal(session.paused, false); assert.equal(welcomeOverlay.style.display, 'flex');
  session.updateControls(); assert.equal(controls.ticks, 1);
});

test('main app wires menu opening, resuming and frame updates through the session', () => {
  const source = readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(source, /new SettingsTourSession\(/);
  assert.match(source, /onOpen:\s*\(\) => this\.settingsTourSession\.open\(\)/);
  const resumeBody = source.match(/onResume:\s*\(\) => \{([\s\S]*?)\n      \},/);
  assert.ok(resumeBody, 'settings resume remains an explicit callback');
  for (const occupied of [false, true]) {
    let resumed = 0; const welcome = { style: { display: 'flex' } };
    const app = { settingsTourSession: { resume() { resumed++; } }, flight: { occupied } };
    new Function('document', resumeBody[1]).call(app, { getElementById: () => welcome });
    assert.equal(resumed, 1);
    assert.equal(welcome.style.display, occupied ? 'none' : 'flex');
  }
  assert.match(source, /this\.settingsTourSession\.updateControls\(\)/);
  assert.match(source, /this\.minimap\?\.visible\s*\|\|\s*this\.settingsMenu\?\.visible/);
  assert.match(source, /event\.repeat/);
});

for (const welcome of ['flex', 'none']) {
  test(`closing a menu opened unlocked restores its ${welcome} welcome state without entering pointer lock`, async () => {
    const { controls, welcomeOverlay, session } = await setup({ locked: false, welcome });
    session.open(); session.resume();
    assert.equal(controls.locks, 0);
    assert.equal(controls.controls.isLocked, false);
    assert.equal(welcomeOverlay.style.display, welcome);
  });
}

test('native Escape already unlocked before menu opening retains the ordinary click-to-resume fallback', async () => {
  const { controls, welcomeOverlay, session } = await setup({ locked: true });
  controls.unlock(); // Browser-native ordering: unlock event precedes application keydown.
  welcomeOverlay.style.display = 'flex';
  session.open(); session.resume();
  assert.equal(controls.locks, 0);
  assert.equal(welcomeOverlay.style.display, 'flex');
});

test('a programmatic map change during settings updates the eventual mode without unpausing inputs', async () => {
  for (const map of [false, true]) {
    const { controls, minimap, session } = await setup({ map });
    session.open();
    assert.equal(typeof session.mapChanged, 'function');
    minimap.visible = !map;
    session.mapChanged(!map);
    assert.equal(session.paused, true); assert.equal(controls.freeMove, false); assert.equal(controls.locks, 0);
    session.resume();
    assert.equal(controls.freeMove, !map);
    assert.equal(controls.locks, map ? 1 : 0);
  }
});
