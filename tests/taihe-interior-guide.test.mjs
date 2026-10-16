import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { PlaceCatalog } from '../src/ui/PlaceCatalog.js';
import { PlaceInfoPanel } from '../src/ui/PlaceInfoPanel.js';
import { createDOM } from './lib/ui-dom.mjs';
import { setupMap } from './lib/map-fixture.mjs';
import { baseline, sha, restoreTaiheGuideCatalog, restoreTaiheGuideSource } from './lib/taihe-guide-retention.mjs';
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const raw = read('data/places/zh-CN.json'), data = JSON.parse(raw);
const guide = d => d.places.find(p => p.id === 'taihe').interiorGuide;

// This is a text/data addition. These tests create no browser, renderer or server.
test('exact six reviewed Taihe entries and eight cached sources retain the complete frozen catalog', () => {
  const restored = JSON.parse(restoreTaiheGuideCatalog(raw));
  assert.equal(restored.places.length, 14);
  assert.equal(data.places.filter(p => p.interiorGuide).length, 1);
  assert.deepEqual(guide(data).items.map(item => item.id), [
    'taihe-throne-screen', 'taihe-jianji-suiyou', 'taihe-caisson-pearls',
    'taihe-six-gold-columns', 'taihe-four-paired-displays', 'taihe-ceremony-not-residence',
  ]);
  for (const place of data.places.filter(p => p.id !== 'taihe')) {
    assert.equal(JSON.stringify(place), JSON.stringify(restored.places.find(p => p.id === place.id)));
  }
  assert.equal(data.sources.length, 29);
  assert.equal(new Set(data.sources.map(s => s.url)).size, 29);
  assert.ok(data.sources.slice(21).every(s => s.retrievalMethod === 'official-cached-source' && s.publishedAt === (s.id === 'taihe-plaque-restoration' ? '2002-09-19' : null)));
  assert.match(guide(data).items[1].text, /故宫2002年记录称原匾下落未明.*1900年旧照复制.*同年9月18日/);
  assert.doesNotMatch(guide(data).items[1].text, /失踪|原匾保存至今/);
});

test('sourcesFor resolves every per-guide reference exactly once alongside the existing sources', () => {
  const catalog = new PlaceCatalog(), place = catalog.get('taihe');
  const before = new PlaceCatalog(JSON.parse(restoreTaiheGuideCatalog(raw)));
  const expected = [...new Set([...before.sourcesFor(before.get('taihe')).map(s => s.id), ...place.interiorGuide.items.flatMap(item => item.sourceIds)])];
  const sources = catalog.sourcesFor(place);
  assert.deepEqual(sources.map(s => s.id), expected);
  assert.equal(new Set(sources.map(s => s.url)).size, sources.length);
  for (const item of place.interiorGuide.items) for (const id of item.sourceIds) assert.ok(sources.includes(catalog.sources.get(id)));
  for (const p of catalog.places.filter(p => p.id !== 'taihe')) assert.deepEqual(catalog.sourcesFor(p), before.sourcesFor(before.get(p.id)));
});

for (const [name, mutate] of [
  ['unknown guide field', g => g.coordinates = [0, 0]],
  ['unknown item field', g => g.items[0].onClick = 'travel'],
  ['empty guide', g => g.items = []],
  ['overlong list', g => g.items.push({ ...g.items[0], id: 'extra' })],
  ['duplicate item', g => g.items[1].id = g.items[0].id],
  ['invalid item ID', g => g.items[0].id = 'NOT AN ID'],
  ['overlong ID', g => g.items[0].id = 'a'.repeat(81)],
  ['overlong title', g => g.items[0].title = 'a'.repeat(81)],
  ['overlong text', g => g.items[0].text = 'a'.repeat(81)],
  ['overlong notice', g => g.notice = 'a'.repeat(401)],
  ['HTML title', g => g.items[0].title = '<img>'],
  ['HTML text', g => g.items[0].text = '<script>'],
  ['HTML notice', g => g.notice = '<iframe>'],
  ['multiline HTML title', g => g.items[0].title = 'text\n<img>'],
  ['multiline HTML text', g => g.items[0].text = 'text\n<script>'],
  ['multiline HTML notice', g => g.notice = 'text\n<iframe>'],
  ['blank title', g => g.items[0].title = ' '],
  ['blank text', g => g.items[0].text = ' '],
  ['blank notice', g => g.notice = ' '],
  ['missing guide source', g => g.items[0].sourceIds = ['missing']],
  ['duplicate guide source', g => g.items[0].sourceIds.push(g.items[0].sourceIds[0])],
  ['empty guide sources', g => g.items[0].sourceIds = []],
]) test(`guide rejects ${name}`, () => {
  const changed = structuredClone(data); mutate(guide(changed));
  assert.throws(() => new PlaceCatalog(changed), /Place catalog/);
});
for (const url of ['http://www.dpm.org.cn/x', 'https://evil.example/x', 'https://www.dpm.org.cn.evil.example/x', 'https://user:password@www.dpm.org.cn/x', 'https://www.dpm.org.cn:444/x', 'https://www.dpm.org.cn/x?tracking=1', 'https://www.dpm.org.cn/x#fragment', 'javascript:alert(1)']) test(`cached source rejects unsafe URL ${url}`, () => {
  const changed = structuredClone(data); changed.sources.at(-1).url = url;
  assert.throws(() => new PlaceCatalog(changed), /Place catalog/);
});
for (const [name, mutate] of [
  ['unknown provenance', s => s.retrievalMethod = 'fresh-verified'],
  ['duplicate ID', (s, d) => s.id = d.sources[0].id],
  ['unknown field', s => s.localFile = '/private/cache'],
]) test(`cached source rejects ${name}`, () => {
  const changed = structuredClone(data); mutate(changed.sources.at(-1), changed);
  assert.throws(() => new PlaceCatalog(changed), /Place catalog/);
});

test('optional guide uses the same nonmodal text panel and absent cards retain the exact DOM tree', async t => {
  const dom = createDOM();
  const saved = globalThis.document; globalThis.document = dom.document;
  t.after(() => { if (saved === undefined) delete globalThis.document; else globalThis.document = saved; });
  const oldSource = restoreTaiheGuideSource('src/ui/PlaceInfoPanel.js', read('src/ui/PlaceInfoPanel.js'));
  const { PlaceInfoPanel: FrozenPanel } = await import(`data:text/javascript,${encodeURIComponent(oldSource)}`);
  const frozenPanel = new FrozenPanel();
  const snapshot = node => ({ tag: node.tagName, attributes: [...node.attributes], text: node._text, children: node.children.map(snapshot) });
  const catalog = new PlaceCatalog(), panel = new PlaceInfoPanel(); let trips = 0;
  const render = place => panel.render({ place, name: place.name, sources: catalog.sourcesFor(place), canTravel: true, onTravel: () => trips++ });
  render(catalog.get('taihe'));
  assert.equal(panel.element.getAttribute('role'), 'region'); assert.equal(panel.element.getAttribute('aria-modal'), null);
  const headings = panel.element.querySelectorAll('h3').map(n => n.textContent);
  assert.equal(headings.filter(h => h === '殿内看点').length, 1);
  for (const item of guide(data).items) assert.ok(panel.element.textContent.includes(`${item.title}：${item.text}`));
  assert.ok(panel.element.textContent.includes(guide(data).notice));
  assert.equal(panel.element.querySelectorAll('button').length, 1);
  assert.equal(trips, 0); assert.equal(panel.element.querySelectorAll('img,iframe,canvas,dialog').length, 0);
  const sourceLinks = panel.element.querySelectorAll('a');
  assert.equal(sourceLinks.length, catalog.sourcesFor(catalog.get('taihe')).length);
  for (const a of sourceLinks) { assert.equal(a.getAttribute('target'), '_blank'); assert.equal(a.getAttribute('rel'), 'noopener noreferrer'); }
  for (const p of catalog.places.filter(p => p.id !== 'taihe')) {
    render(p); assert.ok(!panel.element.textContent.includes('殿内看点'));
    frozenPanel.render({ place: p, name: p.name, sources: catalog.sourcesFor(p), canTravel: true, onTravel: () => trips++ });
    assert.deepEqual(snapshot(panel.element), snapshot(frozenPanel.element), `${p.id}: original DOM tree retained`);
  }
  frozenPanel.dispose();
  panel.dispose();
});

for (const mobile of [false, true]) test(`Taihe guide retains ${mobile ? 'joystick' : 'keyboard'} movement, eight quick controls and explicit travel`, async t => {
  const s = await setupMap(t, { mobile }); s.map.hasTeleportTarget = () => true; s.map.toggle();
  if (mobile) s.touch('touchstart'); else s.key('keydown', 'KeyW');
  s.frame(2000); const start = mobile ? s.c.runStartTime : s.c.keyPressTimes.get('KeyW');
  s.map.showPlace('taihe'); assert.deepEqual(s.teleports, []);
  const p = s.logical(); s.frame(100); assert.ok(s.logical().distanceTo(p) > 0);
  assert.equal(mobile ? s.c.runStartTime : s.c.keyPressTimes.get('KeyW'), start);
  assert.equal(s.map.container.querySelector('#teleport-points').querySelectorAll('button').length, 8);
  const panel = s.map.placePanel.element; assert.ok(panel.textContent.includes('殿内看点'));
  panel.scrollTop = 200; s.dispatch(panel, 'scroll'); assert.deepEqual(s.teleports, []);
  panel.querySelector('#place-travel').click(); assert.deepEqual(s.teleports, ['太和殿']);
});

test('JSON schema dates already use one regex escape and match runtime date shape without weakening', () => {
  const schema = JSON.parse(read('data/places/catalog.schema.json')); const patterns = [];
  const walk = value => { if (!value || typeof value !== 'object') return; if (typeof value.pattern === 'string' && value.pattern.includes('d{4}')) patterns.push(value.pattern); Object.values(value).forEach(walk); }; walk(schema);
  assert.equal(patterns.length, 8);
  for (const pattern of patterns) { assert.equal(pattern, '^\\d{4}-\\d{2}-\\d{2}$'); assert.ok(new RegExp(pattern).test('2026-10-16')); for (const bad of ['2026-1-16','today','\\dddd-\\dd-\\dd']) assert.ok(!new RegExp(pattern).test(bad)); }
});

test('Draft 2020-12 schema validates the catalog and rejects bounded guide mutations', () => {
  const script = `import json,jsonschema\ns=json.load(open('data/places/catalog.schema.json'));d=json.load(open('data/places/zh-CN.json'));v=jsonschema.Draft202012Validator(s);v.check_schema(s);v.validate(d)\ng=next(p for p in d['places'] if p['id']=='taihe')['interiorGuide']\nfor field,value in [('notice','a'*401),('notice','text'+chr(10)+'<iframe>'),('items',[]),('extra',True)]:\n c=json.loads(json.dumps(d));cg=next(p for p in c['places'] if p['id']=='taihe')['interiorGuide'];cg[field]=value;assert not v.is_valid(c),field\nfor field,value in [('text','a'*81),('title','<b>'),('title','text'+chr(10)+'<b>'),('text','text'+chr(10)+'<script>'),('sourceIds',['taihe','taihe']),('coordinates',[0,0])]:\n c=json.loads(json.dumps(d));cg=next(p for p in c['places'] if p['id']=='taihe')['interiorGuide'];cg['items'][0][field]=value;assert not v.is_valid(c),field\nprint('schema and negative guide cases passed')`;
  const result = spawnSync('python', ['-c', script], { cwd: new URL('../', import.meta.url), encoding: 'utf8' }); assert.equal(result.status, 0, result.stderr);
});

for (const path of ['main.js', 'style.css', 'src/ui/Minimap.js', 'src/ui/MapTourSession.js', 'src/ui/SettingsMenu.js', 'src/config/constants.js']) test(`${path} preserves every frozen byte, including input and scroll behavior`, () => assert.equal(sha(read(path)), baseline.baseFiles[path]));

for (const [path, deltas] of Object.entries(baseline.sourceDeltas)) {
  test(`${path} has only the exact reversible text-guide additions`, () => restoreTaiheGuideSource(path, read(path)));
  for (const [index, delta] of deltas.entries()) for (const [name, replacement] of [['missing', ''], ['old', delta.before], ['duplicate', delta.after + delta.after], ['modified', delta.after + ' ']]) test(`${path} rejects ${name} guide hunk ${index}`, () => {
    assert.throws(() => restoreTaiheGuideSource(path, read(path).replace(delta.after, replacement)), /exactly once|approved guide/);
  });
  test(`${path} rejects an unrelated byte edit`, () => assert.throws(() => restoreTaiheGuideSource(path, read(path) + '\n'), /approved guide/));
}
test('schema restores exactly after removing only optional guide definitions and honest cache provenance', () => {
  const schema = JSON.parse(read('data/places/catalog.schema.json'));
  delete schema.$defs.guideItem; delete schema.$defs.interiorGuide; delete schema.$defs.place.properties.interiorGuide;
  assert.equal(schema.$defs.source.properties.retrievalMethod.enum.pop(), 'official-cached-source');
  assert.equal(sha(JSON.stringify(schema, null, 2) + '\n'), baseline.baseFiles['data/places/catalog.schema.json']);
});
for (const [name, mutate] of [
  ['unrelated card', d => d.places[0].summary.text += ' '],
  ['old source', d => d.sources[0].title += ' '],
  ['edited guide', d => guide(d).items[0].text += ' '],
  ['extra source', d => d.sources.push({ ...d.sources.at(-1), id: 'extra' })],
  ['removed guide', d => delete d.places.find(p => p.id === 'taihe').interiorGuide],
]) test(`catalog byte boundary rejects ${name}`, () => {
  const changed = structuredClone(data); mutate(changed);
  assert.throws(() => restoreTaiheGuideCatalog(JSON.stringify(changed, null, 2) + '\n'));
});

test('guide subjects exist in the selected Taihe CPU asset without inventing hotspot coordinates', async () => {
  const { candidate } = await import('./lib/taihe-display-fixture.mjs');
  const names = candidate.inventory.map(item => item.name), has = name => assert.ok(names.includes(name), name);
  for (const name of ['throne_seat', 'throne_footstool', 'plaque_frame', 'caisson_square_to_oct', 'caisson_oct_to_round', 'caisson_upper_round', 'caisson_center_sphere']) has(name);
  assert.equal(names.filter(name => /^screen_\d$/.test(name)).length, 7);
  assert.equal(names.filter(name => /^gold_column(?:\.\d+)?$/.test(name)).length, 6);
  assert.equal(names.filter(name => /^caisson_satellite(?:\.\d+)?$/.test(name)).length, 6);
  for (const kind of ['elephant', 'luduan', 'crane', 'incense_pavilion']) for (const side of ['left', 'right']) assert.ok(names.some(name => name.startsWith(`display_${kind}:${side}_`)));
  assert.deepEqual(data.places.find(p => p.id === 'taihe').sceneBinding, { kind: 'layout', name: '太和殿' });
  for (const item of guide(data).items) assert.deepEqual(Object.keys(item), ['id', 'title', 'text', 'sourceIds']);
});
