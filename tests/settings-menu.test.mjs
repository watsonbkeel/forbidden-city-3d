import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SettingsMenu } from '../src/ui/SettingsMenu.js';

class Element {
  constructor() { this.style = {}; this.children = []; this.listeners = new Map(); this.buttons = new Map(); }
  set innerHTML(value) {
    for (const [, id, label] of value.matchAll(/<button id="([^"]+)"[\s\S]*?>([^<]*)<\/button>/g)) {
      const button = new Element(); button.textContent = label; this.buttons.set(`#${id}`, button);
    }
  }
  querySelector(selector) { return this.buttons.get(selector); }
  appendChild(child) { this.children.push(child); }
  addEventListener(name, handler) { this.listeners.set(name, handler); }
  click() { this.listeners.get('click')?.({ target: this }); }
  remove() { this.removed = true; }
}

function setup(t, options = {}) {
  const old = globalThis.document;
  globalThis.document = { createElement: () => new Element() };
  t.after(() => { globalThis.document = old; });
  const menu = new SettingsMenu(new Element());
  menu.init(options);
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
