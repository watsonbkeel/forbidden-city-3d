import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build, createServer } from 'vite';
import { SettingsMenu as UncompiledSettingsMenu } from '../src/ui/SettingsMenu.js';
import { createDOM } from './lib/ui-dom.mjs';

// Exercise Vite's actual DEV transform and production tree-shaking. This is
// compilation/DOM-contract coverage, not browser, full-world or GPU acceptance.
const root = fileURLToPath(new URL('..', import.meta.url));
const previousNodeEnv = process.env.NODE_ENV;
let developmentCode, productionCode;
try {
  process.env.NODE_ENV = 'development';
  const server = await createServer({ root, configFile: false, logLevel: 'silent', server: { middlewareMode: true, watch: null }, appType: 'custom' });
  try {
    developmentCode = (await server.transformRequest('/src/ui/SettingsMenu.js')).code;
  } finally {
    await server.close();
  }
  process.env.NODE_ENV = 'production';
  const bundle = await build({ root, configFile: false, logLevel: 'silent', build: {
    write: false, minify: true, target: 'esnext', lib: {
      entry: fileURLToPath(new URL('../src/ui/SettingsMenu.js', import.meta.url)), formats: ['es'],
    },
  } });
  productionCode = [bundle].flat().flatMap(result => result.output).find(item => item.type === 'chunk' && item.isEntry).code;
} finally {
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
}
const importCode = code => import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const { SettingsMenu: DevelopmentSettingsMenu } = await importCode(developmentCode);
const { SettingsMenu: ProductionSettingsMenu } = await importCode(productionCode);

function setup(t, options = {}, Menu = DevelopmentSettingsMenu) {
  const original = { document: globalThis.document, window: globalThis.window };
  const dom = createDOM();
  Object.assign(globalThis, { document: dom.document, window: dom.window });
  const menu = new Menu(document.body);
  menu.init(options);
  t.after(() => { menu.dispose(); Object.assign(globalThis, original); });
  return { menu, dom };
}
const previewButton = menu => menu.panel.querySelector('#characters-preview-toggle-btn');

test('DEV opt-in exposes an accessible preview button but initial true never activates it', t => {
  const calls = [];
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true, characterPreviewActive: true, onCharacterPreviewToggle: value => { calls.push(value); return value; } });
  const button = previewButton(menu);
  assert.ok(button, 'DEV opt-in creates the dedicated preview button');
  assert.equal(button.getAttribute('type'), 'button');
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(menu.characterPreviewActive, false);
  assert.deepEqual(calls, []);
  assert.ok(menu.getFocusableElements().includes(button));
  assert.equal(button.getAttribute('aria-describedby'), 'characters-preview-limit');
  const limits = menu.panel.querySelector('#characters-preview-limit').textContent;
  for (const pattern of [/preview.*未验收/, /实机性能/, /完整场景/, /具体史料/, /本次页面/, /刷新/]) assert.match(limits, pattern);
});

test('DEV default hides preview without changing ordinary character defaults', t => {
  const { menu } = setup(t);
  assert.equal(previewButton(menu), null);
  assert.equal(menu.panel.querySelector('#characters-toggle-btn').getAttribute('aria-pressed'), 'true');
  assert.equal(menu.panel.querySelector('#characters-toggle-btn').textContent, '宫廷人物已开启（候选）');
  menu.setCharacterPreviewActive(true);
  assert.equal(previewButton(menu), null);
  assert.equal(menu.characterPreviewActive, false);
});

test('DEV candidate availability suppresses a duplicate experimental preview control', t => {
  let calls = 0;
  const { menu } = setup(t, { charactersAvailable: true, allowCharacterPreview: true, charactersApproved: false,
    onCharacterPreviewToggle: () => { calls++; return true; } });
  assert.equal(previewButton(menu), null);
  menu.setCharacterPreviewActive(true);
  assert.equal(menu.characterPreviewActive, false);
  assert.equal(calls, 0);
  assert.equal(menu.panel.querySelector('#characters-toggle-btn').textContent, '宫廷人物已开启（候选）');
});

test('candidate availability arriving in a snapshot hides and deactivates the stale DEV control', t => {
  const calls = [];
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true,
    onCharacterPreviewToggle: value => { calls.push(value); return value; } });
  const button = previewButton(menu);
  button.click();
  menu.setCharacterStatus({ enabled: true, contentEnabled: true, registered: 38, loaded: 38, visible: 12, pending: 0, errors: 0, daylight: 1 });
  assert.equal(button.hidden, true);
  assert.equal(menu.panel.querySelector('#characters-preview-status').hidden, true);
  assert.equal(menu.panel.querySelector('#characters-preview-limit').hidden, true);
  assert.equal(menu.characterPreviewActive, false);
  assert.ok(!menu.getFocusableElements().includes(button));
  button.click();
  menu.setCharacterPreviewActive(true);
  assert.deepEqual(calls, [true]);
  assert.equal(menu.characterPreviewActive, false);
  assert.equal(menu.panel.querySelector('#characters-toggle-btn').textContent, '宫廷人物已开启（候选）');
  assert.equal(menu.launcher.querySelector('strong').textContent, '结构研究预览');
});

test('DEV experimental snapshot reports its real preparation rather than unavailable content', t => {
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true,
    onCharacterPreviewToggle: value => value });
  previewButton(menu).click();
  menu.setCharacterStatus({ enabled: true, contentEnabled: false, rollout: 'preview-unverified', registered: 38, loaded: 10, visible: 2, pending: 28, errors: 0, daylight: 0 });
  const text = menu.panel.querySelector('#characters-status').textContent;
  assert.match(text, /人物实验预览.*未验收.*人物准备中/);
  assert.match(text, /已加载 10.*准备中 28/);
  assert.match(text, /守卫保留/);
  assert.doesNotMatch(text, /内容暂不可用|数据就绪/);
});

test('production candidate is on without approval and retains incomplete acceptance notice', t => {
  const { menu } = setup(t, { charactersApproved: false }, ProductionSettingsMenu);
  assert.equal(menu.panel.querySelector('#characters-toggle-btn').textContent, '宫廷人物已开启（候选）');
  assert.equal(menu.panel.querySelector('#characters-toggle-btn').getAttribute('aria-pressed'), 'true');
  assert.match(menu.panel.querySelector('#characters-acceptance').textContent, /GPU.*手机.*具体史料.*未完整验收/);
  assert.equal(previewButton(menu), null);
});

test('DEV explicit refusal cannot be bypassed by an initial active state or public synchronization', t => {
  const { menu } = setup(t, { allowCharacterPreview: false, characterPreviewActive: true });
  menu.setCharacterPreviewActive(true);
  assert.equal(previewButton(menu), null);
  assert.equal(menu.characterPreviewActive, false);
});

test('ordinary character clicks and opening settings cannot enable the experimental preview', t => {
  const ordinary = [], preview = [];
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true, charactersApproved: false,
    onCharactersToggle: value => ordinary.push(value), onCharacterPreviewToggle: value => { preview.push(value); return value; } });
  menu.show(); menu.hide(); menu.show();
  const button = menu.panel.querySelector('#characters-toggle-btn');
  button.click(); button.click();
  assert.deepEqual(ordinary, [false, true]);
  assert.deepEqual(preview, []);
  assert.equal(menu.characterPreviewActive, false);
  assert.match(button.textContent, /暂不可用/);
});

test('preview clicks display only the returned actual state and never change approval', t => {
  const calls = [];
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true, charactersApproved: false,
    onCharacterPreviewToggle: value => { calls.push(value); return value; } });
  const button = previewButton(menu);
  const originalLauncher = menu.launcher.querySelector('span').textContent;
  menu.show(); button.click();
  assert.deepEqual(calls, [true]);
  assert.equal(menu.characterPreviewActive, true);
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.equal(menu.charactersApproved, false);
  assert.match(menu.panel.querySelector('#characters-toggle-btn').textContent, /preview.*未验收/);
  assert.match(menu.panel.querySelector('#characters-preview-status').textContent, /preview.*未验收/);
  menu.hide();
  for (const pattern of [/preview.*未验收/, /实机性能/, /完整场景/, /具体史料/, /刷新/]) assert.match(menu.launcher.textContent, pattern);
  assert.match(menu.launcher.querySelector('strong').textContent, /preview.*未验收/, 'compact map hides the span, so its surviving title must retain the warning');
  menu.show(); button.click();
  assert.deepEqual(calls, [true, false]);
  assert.equal(menu.characterPreviewActive, false);
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(menu.launcher.querySelector('span').textContent, originalLauncher);
  assert.equal(menu.launcher.querySelector('strong').textContent, '结构研究预览');
  assert.match(menu.panel.querySelector('#characters-toggle-btn').textContent, /暂不可用/);
});

test('false return leaves preview off rather than claiming activation', t => {
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true, onCharacterPreviewToggle: () => false });
  previewButton(menu).click();
  assert.equal(menu.characterPreviewActive, false);
  assert.equal(previewButton(menu).getAttribute('aria-pressed'), 'false');
  assert.doesNotMatch(menu.panel.querySelector('#characters-preview-status').textContent, /已开启/);
});

test('throw and invalid return keep the prior state and show a local failure hint', t => {
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true, onCharacterPreviewToggle: () => { throw new Error('fixture failure'); } });
  const button = previewButton(menu);
  assert.doesNotThrow(() => button.click());
  assert.equal(menu.characterPreviewActive, false);
  assert.match(menu.panel.querySelector('#characters-preview-status').textContent, /失败|未确认/);
  menu.onCharacterPreviewToggle = () => undefined;
  button.click();
  assert.equal(menu.characterPreviewActive, false);
  assert.match(menu.panel.querySelector('#characters-preview-status').textContent, /失败|未确认/);
  menu.onCharacterPreviewToggle = value => value;
  button.click();
  menu.onCharacterPreviewToggle = () => 'false';
  button.click();
  assert.equal(menu.characterPreviewActive, true, 'invalid disable does not pretend preview is off');
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.match(menu.panel.querySelector('#characters-preview-status').textContent, /失败|未确认/);
});

test('main can synchronize ordinary off without invoking preview callbacks', t => {
  const calls = [];
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true, charactersApproved: false,
    onCharacterPreviewToggle: value => { calls.push(value); return value; } });
  menu.onCharactersToggle = active => { if (!active) menu.setCharacterPreviewActive(false); };
  previewButton(menu).click();
  menu.panel.querySelector('#characters-toggle-btn').click();
  assert.deepEqual(calls, [true]);
  assert.equal(menu.characterPreviewActive, false);
  assert.equal(previewButton(menu).getAttribute('aria-pressed'), 'false');
  assert.equal(menu.panel.querySelector('#characters-toggle-btn').textContent, '宫廷人物已关闭');
});

test('same-state synchronization is a no-op and preserves local transition failure feedback', t => {
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true, onCharacterPreviewToggle: () => undefined });
  const button = previewButton(menu);
  button.click();
  const status = menu.panel.querySelector('#characters-preview-status');
  const failure = status.textContent;
  let writes = 0;
  const setAttribute = button.setAttribute.bind(button);
  button.setAttribute = (...args) => { writes++; setAttribute(...args); };
  for (let i = 0; i < 60; i++) menu.setCharacterPreviewActive(false);
  assert.equal(writes, 0, 'per-frame same-state synchronization does not mutate the control');
  assert.equal(status.textContent, failure);
  menu.onCharacterPreviewToggle = value => value;
  button.click();
  assert.equal(menu.characterPreviewActive, true);
  writes = 0;
  for (let i = 0; i < 60; i++) menu.setCharacterPreviewActive(true);
  assert.equal(writes, 0);
  menu.setCharacterPreviewActive(false);
  assert.equal(writes, 1, 'an actual state change still paints exactly once');
});

test('preview participates in the existing focus trap, Escape, and second-finger touch path only', t => {
  let calls = 0, leaks = 0;
  const { menu, dom } = setup(t, { charactersAvailable: false, allowCharacterPreview: true, onCharacterPreviewToggle: value => { calls++; return value; } });
  document.body.addEventListener('touchstart', () => leaks++);
  menu.launcher.focus(); menu.show();
  const button = previewButton(menu);
  button.focus();
  const held = { identifier: 1, target: document.body };
  const second = { identifier: 2, target: button, clientX: 50, clientY: 50 };
  dom.dispatch(button, 'touchstart', { touches: [held, second], changedTouches: [second] });
  dom.dispatch(button, 'touchend', { touches: [held], changedTouches: [second] });
  assert.equal(calls, 1); assert.equal(leaks, 0);
  assert.equal(document.activeElement, button);
  const resume = menu.panel.querySelector('#resume-btn');
  resume.focus();
  dom.dispatch(resume, 'keydown', { key: 'Tab', code: 'Tab' });
  assert.equal(document.activeElement.id, 'settings-close-btn');
  dom.dispatch(button, 'keydown', { key: 'Escape', code: 'Escape' });
  assert.equal(menu.visible, false);
  assert.equal(document.activeElement, menu.launcher);
  assert.equal(calls, 1, 'dismissal does not silently toggle preview');
  assert.equal(dom.dispatch(document.body, 'keydown', { key: 'w', code: 'KeyW' }).stopped, undefined, 'closed modal does not capture global keys');
});

test('dispose removes preview callbacks and reinit starts off without stale click handlers', t => {
  let calls = 0;
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true, onCharacterPreviewToggle: value => { calls++; return value; } });
  const oldButton = previewButton(menu);
  oldButton.click(); menu.dispose(); oldButton.click();
  assert.equal(calls, 1);
  assert.equal(menu.characterPreviewActive, false);
  assert.equal(menu.onCharacterPreviewToggle, null);
  assert.equal(menu.listeners.length, 0);
  menu.init({ charactersAvailable: false, allowCharacterPreview: true, characterPreviewActive: true, onCharacterPreviewToggle: value => { calls++; return value; } });
  assert.equal(previewButton(menu).getAttribute('aria-pressed'), 'false');
  previewButton(menu).click();
  assert.equal(calls, 2);
});

test('real production bundle removes preview UI and callback path despite injected options and setters', t => {
  let calls = 0;
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true, characterPreviewActive: true, onCharacterPreviewToggle: () => { calls++; return true; } }, ProductionSettingsMenu);
  assert.equal(previewButton(menu), null);
  menu.setCharacterPreviewActive(true);
  menu.show(); menu.panel.querySelector('#characters-toggle-btn').click();
  assert.equal(menu.characterPreviewActive, false);
  assert.equal(calls, 0);
  for (const marker of ['characters-preview-toggle-btn', 'characters-preview-limit', 'characters-preview-status', '人物实验预览', 'preview 未验收']) assert.ok(!productionCode.includes(marker), `${marker} is actually absent from the production bundle`);
});

test('uncompiled Node module is fail-closed when import.meta.env is missing', t => {
  const { menu } = setup(t, { charactersAvailable: false, allowCharacterPreview: true, characterPreviewActive: true }, UncompiledSettingsMenu);
  assert.equal(previewButton(menu), null);
  menu.setCharacterPreviewActive(true);
  assert.equal(menu.characterPreviewActive, false);
});
