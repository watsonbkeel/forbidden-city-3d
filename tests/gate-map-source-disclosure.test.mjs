import test from 'node:test';
import { restorePlaceInfoBytes } from './lib/place-info-source-delta.mjs';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SettingsMenu } from '../src/ui/SettingsMenu.js';
import { createDOM } from './lib/ui-dom.mjs';

function setup(t) {
  const oldDocument = globalThis.document, oldWindow = globalThis.window;
  const dom = createDOM();
  globalThis.document = dom.document; globalThis.window = dom.window;
  const menu = new SettingsMenu(document.body); menu.init();
  t.after(() => { menu.dispose(); globalThis.document = oldDocument; globalThis.window = oldWindow; });
  return menu;
}

test('V9 help explains map walking and the fresh-input teleport boundary', t => {
  const menu = setup(t), text = menu.panel.textContent;
  assert.match(text, /地图打开时仍可用方向键、WASD 或屏幕方向盘移动/);
  assert.match(text, /点击建筑名称查看介绍，再点“前往”传送；传送后，请松开再重新按键或触摸方向盘/);
  assert.match(text, /设置菜单会暂停移动/);
});

test('Wumen estimate is an axis-distance model band from a single design report, not surveyed clearance', t => {
  const text = setup(t).panel.querySelector('#preview-details').textContent;
  for (const pattern of [/午门与神武门城楼（资料核对：2026-10-15）/, /前后檐廊/, /2\.9 m/, /同一 2005 年报告的设计图与剖面图/, /柱轴至围护轴距离/, /2\.6–3\.2 m/, /不是现场实测净宽/, /门扇细节和部分内柱仍为暂定/]) assert.match(text, pattern);
});

test('Shenwu source disclosure distinguishes topology, uncertain footprint datum and deferred elevations/access', t => {
  const text = setup(t).panel.querySelector('#preview-details').textContent;
  for (const pattern of [/明间及左右次间设菱花隔扇门/, /东西面设双扇板门/, /50\.18 × 26\.46 m/, /台顶、台脚还是垛墙/, /暂按台顶范围/, /11 m 差异/, /殿基与城台顶面的高差/, /四面台阶竖向尺寸/, /不表示今日现场开放许可/]) assert.match(text, pattern);
});

test('new dated gate sources keep the older visitor-status search date and official safe links', t => {
  const details = setup(t).panel.querySelector('#preview-details');
  assert.match(details.textContent, /各项核查日期见下/);
  assert.match(details.textContent, /截至 2026-10-14 的资料检索未找到官方重新开放确认/);
  const links = details.querySelectorAll('a');
  const expected = ['https://www.dpm.org.cn/explore/building/236454.html', 'https://img.dpm.org.cn/Uploads/pdf/4884/T00124_00.pdf', 'https://img.dpm.org.cn/Uploads/pdf/4884/T00114_00.pdf', 'https://www.dpm.org.cn/explore/building/236456.html', 'https://img.dpm.org.cn/Uploads/File/2018/06/05/u5b164a2ba5129.pdf', 'https://img.dpm.org.cn/Uploads/File/2020/02/16/u5e490f5ea72b3.pdf'];
  for (const href of expected) {
    const matches = links.filter(link => link.getAttribute('href') === href);
    assert.equal(matches.length, 1, href); assert.equal(matches[0].getAttribute('target'), '_blank'); assert.equal(matches[0].getAttribute('rel'), 'noopener noreferrer');
  }
});

test('V9 settings integration changes only three approved text/link template hunks', () => {
  const delta = JSON.parse(readFileSync(new URL('./fixtures/v9-settings-source-delta.json', import.meta.url), 'utf8'));
  let source = restorePlaceInfoBytes('src/ui/SettingsMenu.js', readFileSync(new URL('../src/ui/SettingsMenu.js', import.meta.url))).toString();
  for (const hunk of delta.hunks) {
    assert.equal(source.split(hunk.after).length - 1, 1, `${hunk.name}: exact integrated context occurs once`);
    source = source.replace(hunk.after, hunk.before);
  }
  assert.equal(createHash('sha256').update(source).digest('hex'), delta.baseSha256, 'all executable handlers and original text outside approved hunks are byte-identical');
});
