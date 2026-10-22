import test from 'node:test';
import assert from 'node:assert/strict';
import { SettingsMenu } from '../src/ui/SettingsMenu.js';
import { createDOM } from './lib/ui-dom.mjs';

function setup(t, options = {}) {
  const original = { document: globalThis.document, window: globalThis.window };
  const dom = createDOM();
  Object.assign(globalThis, { document: dom.document, window: dom.window });
  const menu = new SettingsMenu(document.body);
  menu.init(options);
  t.after(() => { menu.dispose(); Object.assign(globalThis, original); });
  return menu;
}
const button = menu => menu.panel.querySelector('#characters-toggle-btn');
const status = menu => menu.panel.querySelector('#characters-status');
const ready = changes => ({
  enabled: true, contentEnabled: true, registered: 38, loaded: 38, visible: 12,
  pending: 0, errors: 0, daylight: 1, rollout: 'candidate-visible',
  acceptance: { complete: false, appearance: 'confirmed', gpu: 'unverified', mobile: 'unverified', history: 'partial' },
  ...changes,
});

test('candidate characters default on without approval or developer mode', t => {
  const menu = setup(t, { charactersApproved: false });
  assert.equal(button(menu).textContent, '宫廷人物已开启（候选）');
  assert.equal(button(menu).getAttribute('aria-pressed'), 'true');
  assert.equal(menu.charactersAvailable, true);
  assert.equal(menu.panel.querySelector('#characters-preview-toggle-btn'), null);
  assert.doesNotMatch(menu.panel.querySelector('#characters-interpretation').textContent, /尚未批量显示|人物功能仍待/);
});

test('ordinary candidate toggle remains reversible and emits only requested state', t => {
  const changes = [];
  const menu = setup(t, { charactersApproved: false, onCharactersToggle: value => changes.push(value) });
  button(menu).click();
  assert.equal(button(menu).textContent, '宫廷人物已关闭');
  button(menu).click();
  assert.equal(button(menu).textContent, '宫廷人物已开启（候选）');
  assert.deepEqual(changes, [false, true]);
});

test('availability is independent of approval and approval cannot claim full acceptance', t => {
  const menu = setup(t, { charactersAvailable: false, charactersApproved: true });
  assert.equal(button(menu).textContent, '宫廷人物暂不可用');
  assert.match(status(menu).textContent, /人物内容暂不可用/);
  const limits = menu.panel.querySelector('#characters-acceptance').textContent;
  for (const pattern of [/外观已确认/, /GPU/, /手机/, /具体史料/, /未完整验收/]) assert.match(limits, pattern);
  assert.doesNotMatch(limits, /全部通过|完整验收通过|已全验收/);
});

test('an initially disabled feature is not advertised as preparing', t => {
  const menu = setup(t, { initialCharacters: false });
  assert.equal(button(menu).textContent, '宫廷人物已关闭');
  assert.match(status(menu).textContent, /人物已关闭/);
  assert.doesNotMatch(status(menu).textContent, /准备中/);
});

test('before the first snapshot the UI reports preparation rather than completion', t => {
  const menu = setup(t);
  assert.ok(status(menu));
  assert.equal(status(menu).getAttribute('role'), 'status');
  assert.equal(status(menu).getAttribute('aria-live'), 'polite');
  assert.match(status(menu).textContent, /准备中/);
  assert.doesNotMatch(status(menu).textContent, /就绪|已完成|38/);
});

test('read-only readiness synchronization distinguishes registered, loaded, visible and pending', t => {
  const changes = [];
  const menu = setup(t, { onCharactersToggle: value => changes.push(value) });
  const snapshot = Object.freeze(ready({ loaded: 20, visible: 8, pending: 18 }));
  menu.setCharacterStatus(snapshot);
  for (const pattern of [/人物准备中/, /已注册 38/, /已加载 20/, /当前可见 8/, /准备中 18/, /失败 0/]) assert.match(status(menu).textContent, pattern);
  assert.doesNotMatch(status(menu).textContent, /数据就绪|已完成/);
  assert.deepEqual(changes, []);
  assert.equal(snapshot.pending, 18);
});

test('failures remain explicit even while other characters are still preparing', t => {
  const menu = setup(t);
  menu.setCharacterStatus(ready({ loaded: 20, visible: 8, pending: 17, errors: 1 }));
  assert.match(status(menu).textContent, /人物加载失败/);
  assert.match(status(menu).textContent, /准备中 17/);
  assert.match(status(menu).textContent, /失败 1/);
  assert.doesNotMatch(status(menu).textContent, /数据就绪|已完成/);
});

test('a system failure remains visible when the system disables characters for safety', t => {
  const menu = setup(t);
  menu.setCharacterStatus(ready({ enabled: false, visible: 0, lastError: 'fixture renderer failure' }));
  assert.equal(button(menu).textContent, '宫廷人物已关闭');
  assert.match(status(menu).textContent, /人物运行失败.*已关闭/);
  assert.doesNotMatch(status(menu).textContent, /数据就绪/);
});

test('all loaded is data readiness only and does not remove the acceptance caveat', t => {
  const menu = setup(t, { charactersApproved: true });
  menu.setCharacterStatus(ready());
  assert.match(status(menu).textContent, /人物数据就绪（候选）/);
  assert.match(status(menu).textContent, /当前可见 12/);
  assert.match(menu.panel.querySelector('#characters-acceptance').textContent, /未完整验收/);
  assert.equal(button(menu).textContent, '宫廷人物已开启（候选）');
});

test('a zero or incomplete registration never masquerades as ready', t => {
  const menu = setup(t);
  menu.setCharacterStatus(ready({ registered: 0, loaded: 0, visible: 0 }));
  assert.match(status(menu).textContent, /准备中/);
  assert.doesNotMatch(status(menu).textContent, /数据就绪/);
  menu.setCharacterStatus(ready({ loaded: 37 }));
  assert.match(status(menu).textContent, /准备中/);
});

test('night explains scheduled rest without changing daylight or character counts', t => {
  const menu = setup(t);
  const snapshot = Object.freeze(ready({ daylight: 0.12, visible: 2 }));
  menu.setCharacterStatus(snapshot);
  assert.match(status(menu).textContent, /夜间/);
  assert.match(status(menu).textContent, /朝会.*生活.*按计划休息.*守卫保留/);
  assert.match(status(menu).textContent, /当前可见 2/);
  assert.equal(snapshot.daylight, 0.12);
  menu.setCharacterStatus(ready({ daylight: 0.13 }));
  assert.doesNotMatch(status(menu).textContent, /按计划休息/);
});

test('snapshot off and unavailable are separate and invoke no command callback', t => {
  const calls = [];
  const menu = setup(t, { onCharactersToggle: value => calls.push(value) });
  menu.setCharacterStatus(ready({ enabled: false, visible: 0, daylight: 0 }));
  assert.equal(button(menu).textContent, '宫廷人物已关闭');
  assert.match(status(menu).textContent, /人物已关闭/);
  assert.doesNotMatch(status(menu).textContent, /守卫保留/);
  menu.setCharacterStatus(ready({ contentEnabled: false, rollout: 'content-unavailable' }));
  assert.equal(button(menu).textContent, '宫廷人物暂不可用');
  assert.match(status(menu).textContent, /人物内容暂不可用/);
  assert.deepEqual(calls, []);
});

test('same-value snapshots and unrelated metrics do not write the DOM each frame', t => {
  const menu = setup(t);
  menu.setCharacterStatus(ready());
  let writes = 0;
  for (const element of [status(menu), button(menu)]) {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'textContent');
    Object.defineProperty(element, 'textContent', { configurable: true, get() { return descriptor.get.call(this); }, set(value) { writes++; descriptor.set.call(this, value); } });
    const setAttribute = element.setAttribute.bind(element);
    element.setAttribute = (...args) => { writes++; return setAttribute(...args); };
  }
  for (let i = 0; i < 60; i++) menu.setCharacterStatus(ready({ daylight: 0.9 - i / 1000, updateP95Ms: i }));
  assert.equal(writes, 0, 'unchanged visible values and same daytime state are a no-op');
  menu.setCharacterStatus(ready({ visible: 11 }));
  assert.equal(writes, 1, 'only the changed status text is painted');
});

test('reinitialization resets readiness and disposed synchronization is harmless', t => {
  const menu = setup(t);
  menu.setCharacterStatus(ready());
  menu.dispose();
  assert.doesNotThrow(() => menu.setCharacterStatus(ready({ loaded: 3 })));
  menu.init();
  assert.match(status(menu).textContent, /准备中/);
  assert.doesNotMatch(status(menu).textContent, /数据就绪/);
  menu.setCharacterStatus(ready());
  assert.match(status(menu).textContent, /数据就绪/);
});
