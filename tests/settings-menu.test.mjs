import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SettingsMenu } from '../src/ui/SettingsMenu.js';

import { createDOM } from './lib/ui-dom.mjs';

function setup(t, options = {}) {
  const oldDocument = globalThis.document, oldWindow = globalThis.window;
  const dom = createDOM();
  globalThis.document = dom.document; globalThis.window = dom.window;
  const scene = document.createElement('div'); scene.id = 'scene-container'; document.body.appendChild(scene);
  const menu = new SettingsMenu(document.body);
  menu.init(options);
  t.after(() => { menu.dispose(); globalThis.document = oldDocument; globalThis.window = oldWindow; });
  menu.dom = dom;
  return menu;
}

test('initial controls show the actual low-quality and muted state before first open', t => {
  const menu = setup(t, { initialQuality: 'low', initialSound: false });
  assert.equal(menu.panel.querySelector('#quality-toggle-btn').textContent, '低画质');
  assert.equal(menu.panel.querySelector('#sound-toggle-btn').textContent, '🔇 音效已关闭');
});

test('one quality-button click emits the selected setting exactly once', t => {
  const applied = [];
  const menu = setup(t, { initialQuality: 'low', onQualityChange: value => applied.push(value) });
  const button = menu.panel.querySelector('#quality-toggle-btn');
  menu.show();
  button.click();
  assert.equal(menu.currentQuality, 'high');
  assert.equal(button.textContent, '高画质');
  assert.deepEqual(applied, ['high']);
  button.click();
  assert.equal(menu.currentQuality, 'low');
  assert.equal(button.textContent, '低画质');
  assert.deepEqual(applied, ['high', 'low']);
});

test('opening and closing the menu never changes quality or emits a quality callback', t => {
  const applied = [];
  const menu = setup(t, { initialQuality: 'low', onQualityChange: value => applied.push(value) });
  menu.show(); menu.hide(); menu.show();
  assert.equal(menu.currentQuality, 'low');
  assert.deepEqual(applied, []);
});

test('settings modal is above the welcome blocker and below the loading screen', t => {
  const menu = setup(t);
  const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  const welcome = Number(css.match(/\.welcome-overlay\s*\{[^}]*z-index:\s*(\d+)/)[1]);
  const loading = Number(css.match(/#loading-screen\s*\{[^}]*z-index:\s*(\d+)/)[1]);
  assert.ok(Number(menu.overlay.style.zIndex) > welcome);
  assert.ok(Number(menu.overlay.style.zIndex) < loading);
});

test('short-height panel has separate non-scrolling actions and a bounded scroll region', t => {
  const menu = setup(t);
  const content = menu.panel.querySelector('#settings-content');
  assert.ok(content, 'a scrollable content region exists');
  assert.ok(content.contains(menu.panel.querySelector('#quality-toggle-btn')));
  assert.equal(content.contains(menu.panel.querySelector('#resume-btn')), false, 'Continue cannot scroll out of the panel');
  assert.equal(content.contains(menu.panel.querySelector('#settings-title')), false, 'title cannot scroll out of the panel');
  assert.equal(content.getAttribute('tabindex'), '0', 'content is keyboard-scrollable');
  const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  const rule = selector => css.match(new RegExp(`${selector}\\s*\\{([^}]*)}`))[1];
  assert.match(rule('#settings-panel'), /max-height:\s*100%/);
  assert.match(rule('#settings-panel'), /display:\s*flex/);
  assert.match(rule('#settings-content'), /min-height:\s*0/);
  assert.match(rule('#settings-content'), /overflow-y:\s*auto/);
  assert.match(rule('#settings-overlay'), /100dvh/);
  assert.match(css, /#settings-content::-webkit-scrollbar\s*\{[^}]*display:\s*block/);
});

test('preview label opens the accessible settings dialog without a keyboard', t => {
  let opened = 0;
  const menu = setup(t, { onOpen: () => opened++ });
  const launcher = document.getElementById('structural-preview-button');
  assert.ok(launcher, 'a permanent visible preview/settings button exists');
  assert.equal(launcher.tagName, 'BUTTON');
  assert.match(launcher.textContent, /游览设置/);
  // 公开声明不再挂在常驻入口上，改由设置面板内的 #preview-limit 承载（仍对用户可见）
  assert.match(menu.panel.querySelector('#preview-limit').textContent, /现场游客开放/);
  launcher.click();
  assert.equal(menu.visible, true);
  assert.equal(opened, 1);
  assert.equal(menu.panel.getAttribute('role'), 'dialog');
  assert.equal(menu.panel.getAttribute('aria-modal'), 'true');
  assert.equal(menu.panel.getAttribute('aria-labelledby'), 'settings-title');
  assert.equal(document.activeElement.id, 'settings-title');
  assert.equal(launcher.getAttribute('aria-expanded'), 'true');
});

test('source details distinguish measured structure, provisional geometry and dated visitor access', t => {
  const menu = setup(t);
  const details = menu.panel.querySelector('#preview-details');
  assert.ok(details, 'source/limits disclosure is present');
  assert.equal(details.tagName, 'DETAILS');
  assert.ok(details.querySelector('summary'));
  for (const pattern of [/2006/, /弘义阁/, /体仁阁/, /1960/, /2020/, /z\s*=\s*58\s*m/, /5\s*m/, /暂定/, /2026-07-31/, /2026-08-03/, /2026-10-14/, /未找到.*重新开放/, /现场核实/, /全宫.*核验/]) {
    assert.match(details.textContent, pattern);
  }
  const links = details.querySelectorAll('a');
  const hrefs = links.map(link => link.getAttribute('href'));
  assert.ok(hrefs.includes('https://www.dpm.org.cn/announce_detail/379422.html'));
  assert.ok(hrefs.includes('https://www.dpm.org.cn/Uploads/File/2019/11/14/u5dcd2fd72ceee.pdf'));
  assert.ok(hrefs.includes('https://www.dpm.org.cn/building/talk/223358.html'));
  for (const link of links) {
    assert.ok(['www.dpm.org.cn', 'img.dpm.org.cn'].includes(new URL(link.getAttribute('href')).hostname));
    assert.equal(link.getAttribute('target'), '_blank');
    assert.equal(link.getAttribute('rel'), 'noopener noreferrer');
  }
});

test('modal opening is idempotent and closes once through each visible action', t => {
  let opened = 0, resumed = 0;
  const menu = setup(t, { onOpen: () => opened++, onResume: () => resumed++ });
  menu.hide();
  assert.equal(resumed, 0, 'hiding an already-closed menu cannot resume gameplay');
  for (const target of ['#settings-close-btn', '#resume-btn', 'overlay']) {
    menu.show(); menu.show();
    assert.equal(document.getElementById('scene-container').inert, true);
    (target === 'overlay' ? menu.overlay : menu.panel.querySelector(target)).click();
    menu.hide();
    assert.equal(menu.visible, false);
    assert.equal(document.getElementById('scene-container').inert, false);
  }
  assert.equal(opened, 3); assert.equal(resumed, 3);
});

test('Tab wraps in the dialog, skips closed details, and restores the opener on dismissal', t => {
  const menu = setup(t);
  const opener = document.getElementById('structural-preview-button'); opener.focus(); opener.click();
  const close = menu.panel.querySelector('#settings-close-btn');
  const resume = menu.panel.querySelector('#resume-btn');
  const dispatch = (target, options = {}) => menu.dom.dispatch(target, 'keydown', { key: 'Tab', code: 'Tab', ...options });
  resume.focus();
  assert.equal(dispatch(resume).defaultPrevented, true);
  assert.equal(document.activeElement, close);
  assert.equal(dispatch(close, { shiftKey: true }).defaultPrevented, true);
  assert.equal(document.activeElement, resume);
  const detailLink = menu.panel.querySelector('#preview-details').querySelector('a');
  assert.equal(menu.getFocusableElements().includes(detailLink), false);
  menu.panel.querySelector('#preview-details').open = true;
  assert.equal(menu.getFocusableElements().includes(detailLink), true);
  menu.hide();
  assert.equal(document.activeElement, opener);
});

test('Escape closes once without propagating to the global toggle; key scrolling retains its default', t => {
  let resumed = 0, gameKeys = 0;
  const menu = setup(t, { onResume: () => resumed++ });
  window.addEventListener('keydown', () => gameKeys++);
  document.addEventListener('keydown', () => gameKeys++);
  menu.show();
  const content = menu.panel.querySelector('#settings-content');
  for (const key of ['ArrowDown', 'PageDown', 'm', '1', 'w', ' ']) {
    const event = menu.dom.dispatch(content, 'keydown', { key, code: key });
    assert.equal(event.defaultPrevented, false, `${key}: native control/scroll behavior remains available`);
  }
  assert.equal(gameKeys, 0, 'movement, map and teleport shortcuts cannot leak');
  const escape = menu.dom.dispatch(content, 'keydown', { key: 'Escape', code: 'Escape' });
  assert.equal(escape.defaultPrevented, true);
  assert.equal(resumed, 1); assert.equal(menu.visible, false); assert.equal(gameKeys, 0);
});

test('modal pointer and touch gestures do not reach body game handlers or force preventDefault', t => {
  const menu = setup(t); let leaked = 0;
  const content = menu.panel.querySelector('#settings-content');
  assert.ok(content);
  for (const name of ['click', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'wheel']) {
    document.body.addEventListener(name, () => leaked++);
    menu.show();
    const event = menu.dom.dispatch(content, name, { touches: [], changedTouches: [] });
    assert.equal(event.defaultPrevented, false, name);
    assert.equal(menu.visible, true, 'scrolling/content clicks do not dismiss');
  }
  assert.equal(leaked, 0);
});

test('dispose restores prior inert states and removes DOM/global listeners without resuming', t => {
  let resumed = 0;
  const menu = setup(t, { onResume: () => resumed++ });
  const scene = document.getElementById('scene-container'); scene.inert = true;
  const extra = document.createElement('div'); document.body.appendChild(extra);
  const overlay = menu.overlay, launcher = document.getElementById('structural-preview-button');
  menu.show();
  menu.dispose(); menu.dispose();
  assert.equal(scene.inert, true); assert.equal(extra.inert, false);
  assert.equal(menu.visible, false); assert.equal(resumed, 0);
  assert.equal(window.listenerCount(), 0);
  assert.equal(overlay.listenerCount(), 0); assert.equal(launcher.listenerCount(), 0);
  assert.equal(overlay.isConnected, false); assert.equal(launcher.isConnected, false);
});

test('a secondary touch opens the launcher once without waiting for a compatibility click', t => {
  let opened = 0;
  const menu = setup(t, { onOpen: () => opened++ });
  const launcher = document.getElementById('structural-preview-button');
  const first = { identifier: 1, target: document.body };
  const second = { identifier: 2, target: launcher };
  const touch = menu.dom.dispatch(launcher, 'touchstart', { touches: [first, second], changedTouches: [second] });
  assert.equal(menu.visible, true, 'the non-primary finger does not need a synthetic mouse click');
  assert.equal(document.activeElement.id, 'settings-title');
  assert.equal(touch.defaultPrevented, true, 'suppress a delayed compatibility click');
  launcher.click();
  assert.equal(opened, 1, 'an unexpected duplicate click is still idempotent');
});

test('a single launcher touch retains its ordinary click activation and default behavior', t => {
  let opened = 0;
  const menu = setup(t, { onOpen: () => opened++ });
  const launcher = document.getElementById('structural-preview-button');
  const first = { identifier: 1, target: launcher };
  const touch = menu.dom.dispatch(launcher, 'touchstart', { touches: [first], changedTouches: [first] });
  assert.equal(touch.defaultPrevented, false);
  assert.equal(menu.visible, false);
  launcher.click();
  assert.equal(opened, 1);
});


function secondaryGesture(menu, target, { drag = 0, cancel = false } = {}) {
  const held = { identifier: 1, target: document.body, clientX: 30, clientY: 300 };
  const touch = { identifier: 2, target, clientX: 100, clientY: 100 };
  const start = menu.dom.dispatch(target, 'touchstart', { touches: [held, touch], changedTouches: [touch] });
  if (drag) menu.dom.dispatch(target, 'touchmove', { touches: [held, { ...touch, clientY: 100 + drag }], changedTouches: [{ ...touch, clientY: 100 + drag }] });
  const end = menu.dom.dispatch(target, cancel ? 'touchcancel' : 'touchend', { touches: [held], changedTouches: [{ ...touch, clientY: 100 + drag }] });
  return { start, end };
}

test('secondary taps activate existing sound/quality, disclosure, links and dismissal once', t => {
  const qualities = [], sounds = []; let resumed = 0;
  const menu = setup(t, { onQualityChange: q => qualities.push(q), onSoundToggle: s => sounds.push(s), onResume: () => resumed++ });
  menu.show();
  for (const selector of ['#quality-toggle-btn', '#sound-toggle-btn']) {
    const { start, end } = secondaryGesture(menu, menu.panel.querySelector(selector));
    assert.equal(start.defaultPrevented, false, 'touch start stays available for scrolling');
    assert.equal(end.defaultPrevented, true, 'a recognized secondary tap suppresses compatibility click');
  }
  assert.deepEqual(qualities, ['low']); assert.deepEqual(sounds, [false]);
  const summary = menu.panel.querySelector('summary'); let disclosureClicks = 0;
  summary.addEventListener('click', () => disclosureClicks++);
  secondaryGesture(menu, summary);
  assert.equal(disclosureClicks, 1);
  const link = menu.panel.querySelector('a'); let sourceClicks = 0;
  link.addEventListener('click', () => sourceClicks++);
  secondaryGesture(menu, link); assert.equal(sourceClicks, 1);
  secondaryGesture(menu, menu.panel.querySelector('#resume-btn'));
  assert.equal(menu.visible, false); assert.equal(resumed, 1);
  menu.show(); secondaryGesture(menu, menu.panel.querySelector('#settings-close-btn'));
  assert.equal(menu.visible, false); assert.equal(resumed, 2);
});

test('secondary drags and cancelled touches never activate controls or disclosures', t => {
  let changed = 0;
  const menu = setup(t, { onQualityChange: () => changed++, onResume: () => changed++ });
  menu.show();
  const summary = menu.panel.querySelector('summary'); let disclosureClicks = 0;
  summary.addEventListener('click', () => disclosureClicks++);
  for (const target of [summary, menu.panel.querySelector('#quality-toggle-btn'), menu.panel.querySelector('#resume-btn')]) {
    for (const gesture of [{ drag: 50 }, { cancel: true }]) {
      const { start, end } = secondaryGesture(menu, target, gesture);
      assert.equal(start.defaultPrevented, false); assert.equal(end.defaultPrevented, false);
      assert.equal(menu.visible, true);
    }
  }
  assert.equal(changed, 0); assert.equal(disclosureClicks, 0);
});

test('closing clears pending secondary touches so reopening cannot apply a stale tap', t => {
  let changed = 0;
  const menu = setup(t, { onQualityChange: () => changed++ }); menu.show();
  const target = menu.panel.querySelector('#quality-toggle-btn');
  const held = { identifier: 1, target: document.body };
  const touch = { identifier: 2, target, clientX: 100, clientY: 100 };
  menu.dom.dispatch(target, 'touchstart', { touches: [held, touch], changedTouches: [touch] });
  menu.hide(); menu.show();
  menu.dom.dispatch(target, 'touchend', { touches: [held], changedTouches: [touch] });
  assert.equal(changed, 0);
  target.click(); assert.equal(changed, 1, 'ordinary click remains a single activation');
});

test('secondary long presses and displaced endings do not become clicks', t => {
  let now = 0, changed = 0;
  t.mock.method(performance, 'now', () => now);
  const menu = setup(t, { onQualityChange: () => changed++ }); menu.show();
  const target = menu.panel.querySelector('#quality-toggle-btn');
  const held = { identifier: 1, target: document.body };
  const touch = { identifier: 2, target, clientX: 100, clientY: 100 };
  for (const [duration, drift] of [[700, 0], [100, 30]]) {
    menu.dom.dispatch(target, 'touchstart', { touches: [held, touch], changedTouches: [touch] });
    now += duration;
    const event = menu.dom.dispatch(target, 'touchend', { touches: [held], changedTouches: [{ ...touch, clientX: 100 + drift }] });
    assert.equal(event.defaultPrevented, false);
  }
  assert.equal(changed, 0);
});

test('map mode places the same settings entry in map flow and restores its original host', t => {
  const menu = setup(t);
  const launcher = document.getElementById('structural-preview-button');
  const map = document.createElement('div'); map.id = 'minimap';
  const title = document.createElement('div'); title.textContent = '故宫平面图'; map.appendChild(title);
  document.body.appendChild(map);
  assert.equal(typeof menu.setMapMode, 'function', 'map and settings must explicitly share entry layout');
  menu.setMapMode(true, map); menu.setMapMode(true, map);
  assert.equal(map.children[0], launcher); assert.equal(map.children[1], title);
  assert.equal(document.body.querySelectorAll('#structural-preview-button').length, 1);
  launcher.focus(); launcher.click();
  assert.equal(map.inert, true); assert.equal(document.activeElement.id, 'settings-title');
  menu.hide(); assert.equal(map.inert, false); assert.equal(document.activeElement, launcher);
  menu.setMapMode(false, map); menu.setMapMode(false, map);
  assert.equal(launcher.parentNode, document.body);
  assert.equal(map.contains(launcher), false);
  assert.deepEqual(map.children, [title], 'map controls/children are otherwise untouched');
  assert.equal(document.body.querySelectorAll('#structural-preview-button').length, 1);
});

test('map entry uses a normal-flow sticky header with a reserved focus-scroll inset', () => {
  const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
  const header = css.match(/#minimap #structural-preview-button\s*\{([^}]*)}/)?.[1];
  assert.ok(header, 'map-specific entry layout is present');
  for (const property of [/position:\s*sticky/, /transform:\s*none/, /bottom:\s*auto/, /top:\s*0/, /margin-bottom:/]) assert.match(header, property);
  assert.match(css, /body\.map-open #minimap\s*\{[^}]*scroll-padding-top:/);
  const main = readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  assert.match(main, /this\.settingsMenu\?\.setMapMode\(visible, this\.minimap\.container\)/);
});

test('reparenting the map entry while settings are open preserves inertness and modal focus', t => {
  const menu = setup(t);
  const map = document.createElement('div'); map.id = 'minimap'; document.body.appendChild(map);
  const launcher = document.getElementById('structural-preview-button');
  assert.equal(typeof menu.setMapMode, 'function');
  menu.setMapMode(true, map); launcher.focus(); launcher.click();
  const focus = document.activeElement;
  menu.setMapMode(false, map);
  assert.equal(launcher.inert, true); assert.equal(document.activeElement, focus);
  menu.setMapMode(true, map);
  assert.equal(launcher.inert, true); assert.equal(map.inert, true); assert.equal(document.activeElement, focus);
  menu.hide();
  assert.equal(launcher.inert, false); assert.equal(map.inert, false); assert.equal(document.activeElement, launcher);
  menu.dispose();
  assert.equal(map.querySelector('#structural-preview-button'), null);
});

test('an uncancelable secondary launcher touch still opens once without attempting cancellation', t => {
  let opened = 0;
  const menu = setup(t, { onOpen: () => opened++ });
  const launcher = document.getElementById('structural-preview-button');
  const held = { identifier: 1, target: document.body };
  const touch = { identifier: 2, target: launcher };
  const event = menu.dom.dispatch(launcher, 'touchstart', { cancelable: false, touches: [held, touch], changedTouches: [touch] });
  assert.equal(opened, 1); assert.equal(menu.visible, true);
  assert.equal(event.preventDefaultCalls, 0, 'do not ask the browser to cancel an uncancelable event');
});

test('an uncancelable secondary control tap still activates once without attempting cancellation', t => {
  let changed = 0;
  const menu = setup(t, { onQualityChange: () => changed++ }); menu.show();
  const target = menu.panel.querySelector('#quality-toggle-btn');
  const held = { identifier: 1, target: document.body };
  const touch = { identifier: 2, target, clientX: 100, clientY: 100 };
  menu.dom.dispatch(target, 'touchstart', { cancelable: false, touches: [held, touch], changedTouches: [touch] });
  const event = menu.dom.dispatch(target, 'touchend', { cancelable: false, touches: [held], changedTouches: [touch] });
  assert.equal(changed, 1); assert.equal(menu.currentQuality, 'low');
  assert.equal(event.preventDefaultCalls, 0, 'a scrolling-owned event cannot be cancelled');
});
