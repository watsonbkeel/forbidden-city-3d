import {restorePreR15Source}from './lib/r15-flight-source-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setupMap } from './lib/map-fixture.mjs';
import { LOADING_WELCOME_DELTA, restoreLoadingWelcomeBytes } from './lib/loading-welcome-source-delta.mjs';

// Execute the exact deferred production callback without starting WebGL. The
// existing fixture retains the production M handler and map/settings lifecycle.
const source = readFileSync(new URL('../main.js', import.meta.url), 'utf8');
const method = source.match(/^  onLoadComplete\(\) \{[\s\S]*?^  \}/m)?.[0];
assert.ok(method, 'the production loading-complete method is present');

async function setup(t, { mobile = false, welcome = true } = {}) {
  const s = await setupMap(t, { mobile });
  s.c.unlock();
  const overlay = welcome ? s.document.createElement('div') : null;
  if (overlay) {
    overlay.id = 'welcome-overlay';
    overlay.style.display = 'none';
    s.document.body.appendChild(overlay);
  }
  const loading = s.document.createElement('div');
  loading.id = 'loading-screen';
  loading.style.display = 'flex';
  s.document.body.appendChild(loading);
  s.lifecycle.welcomeOverlay = overlay;
  s.settingsSession.welcomeOverlay = overlay;
  let callback;
  const schedule = (fn, delay) => {
    assert.equal(delay, 500, 'retain the existing completion delay');
    callback = fn;
    return 7;
  };
  const app = new Function('document', 'setTimeout', 'console', `return ({${method}});`)(
    s.document, schedule, { log() {} },
  );
  Object.assign(app, { isMobile: mobile, controls: s.c, minimap: s.map, settingsMenu: s.menu, disposed: false });
  app.onLoadComplete();
  assert.equal(app.loadingTimeout, 7);
  return { ...s, app, overlay, loading, complete: () => callback() };
}

test('ordinary desktop loading completion keeps the click-to-enter welcome', async t => {
  const s = await setup(t);
  s.complete();
  assert.equal(s.loading.style.display, 'none');
  assert.equal(s.overlay.style.display, 'flex');
});

test('M opened during the final loading delay is not covered by the welcome callback', async t => {
  const s = await setup(t);
  s.key('keydown', 'KeyM', { key: 'm' });
  s.key('keyup', 'KeyM', { key: 'm' });
  assert.equal(s.map.visible, true);
  assert.equal(s.c.mapOpen, true);
  assert.equal(s.c.freeMove, true);
  assert.equal(s.overlay.style.display, 'none');
  s.complete();
  assert.equal(s.loading.style.display, 'none');
  assert.equal(s.map.visible, true);
  assert.equal(s.c.freeMove, true);
  assert.equal(s.overlay.style.display, 'none');
});

test('settings opened during the final loading delay keeps the welcome hidden', async t => {
  const s = await setup(t);
  s.menu.show();
  assert.equal(s.menu.visible, true);
  assert.equal(s.settingsSession.paused, true);
  s.complete();
  assert.equal(s.loading.style.display, 'none');
  assert.equal(s.overlay.style.display, 'none');
  assert.equal(s.settingsSession.paused, true);
  assert.equal(s.c.freeMove, false);
});

test('pointer lock acquired before completion does not reshow the welcome', async t => {
  const s = await setup(t);
  s.c.lock();
  assert.equal(s.c.controls.isLocked, true);
  s.complete();
  assert.equal(s.loading.style.display, 'none');
  assert.equal(s.overlay.style.display, 'none');
});

for (const mapOpen of [false, true]) test(`mobile auto-entry remains unchanged with mapOpen=${mapOpen}`, async t => {
  const s = await setup(t, { mobile: true });
  if (mapOpen) s.map.preview.click();
  s.complete();
  assert.equal(s.loading.style.display, 'none');
  assert.equal(s.overlay.style.display, 'none');
  assert.equal(s.map.visible, mapOpen);
});

test('a missing welcome element does not block loading completion', async t => {
  const s = await setup(t, { welcome: false });
  assert.doesNotThrow(() => s.complete());
  assert.equal(s.loading.style.display, 'none');
});

test('absent optional map/settings UI preserves ordinary desktop entry', async t => {
  const s = await setup(t);
  s.app.minimap = undefined;
  s.app.settingsMenu = undefined;
  s.complete();
  assert.equal(s.loading.style.display, 'none');
  assert.equal(s.overlay.style.display, 'flex');
});

test('disposed app does not mutate loading or welcome from the pending callback', async t => {
  const s = await setup(t);
  s.app.disposed = true;
  s.complete();
  assert.equal(s.loading.style.display, 'flex');
  assert.equal(s.overlay.style.display, 'none');
});

const historicalSource=restorePreR15Source('main.js',Buffer.from(source)).toString();
test('the one deferred welcome condition restores the exact published main.js bytes', () => {
  const restored = restoreLoadingWelcomeBytes(historicalSource).toString();
  assert.equal(restored.split(LOADING_WELCOME_DELTA.before).length - 1, 1);
  assert.equal(restored.replace(LOADING_WELCOME_DELTA.before, LOADING_WELCOME_DELTA.after), historicalSource);
});

for (const [name, replacement] of [
  ['missing', ''],
  ['omitted', LOADING_WELCOME_DELTA.before],
  ['duplicate', LOADING_WELCOME_DELTA.after + LOADING_WELCOME_DELTA.after],
  ['changed', LOADING_WELCOME_DELTA.after.replace('&& !this.minimap?.visible ', '')],
]) test(`loading welcome source boundary rejects ${name} condition`, () => {
  assert.throws(() => restoreLoadingWelcomeBytes(historicalSource.replace(LOADING_WELCOME_DELTA.after, replacement)), /exactly once|must equal/);
});

test('loading welcome source boundary rejects unrelated bytes, frame timing and map close changes', () => {
  for (const changed of [
    historicalSource + '\n',
    historicalSource.replace('}, 500);', '}, 600);'),
    historicalSource.replace('this.mapTourSession.setVisible(visible);', 'this.mapTourSession.setVisible(true);'),
  ]) {
    assert.notEqual(changed, historicalSource);
    assert.throws(() => restoreLoadingWelcomeBytes(changed), /must equal/);
  }
});
