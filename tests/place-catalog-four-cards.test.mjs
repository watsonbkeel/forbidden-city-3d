import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PlaceCatalog } from '../src/ui/PlaceCatalog.js';
import { PALACE_LAYOUT } from '../src/scene/Layout.js';
import { TELEPORT } from '../src/config/constants.js';
import garden from '../data/zones/garden.json' with { type: 'json' };
import outerEast from '../data/zones/outer-east.json' with { type: 'json' };
import outerWest from '../data/zones/outer-west.json' with { type: 'json' };
import axisCourts from '../data/zones/axis-courts.json' with { type: 'json' };
import baseline from './fixtures/v19-four-place-cards.json' with { type: 'json' };

import { baseline as guideBaseline, restoreTaiheGuideCatalog } from './lib/taihe-guide-retention.mjs';
const raw = restoreTaiheGuideCatalog(readFileSync(new URL('../data/places/zh-CN.json', import.meta.url), 'utf8'));
const data = JSON.parse(raw);
const zones = [garden, outerEast, outerWest, axisCourts];
const building = item => ['hall', 'gate', 'cityGate'].includes(item.kind);
const sha = value => createHash('sha256').update(value).digest('hex');
const expected = [
  ['wumen', '午门'], ['taihe-gate', '太和门'], ['taihe', '太和殿'],
  ['zhonghe', '中和殿'], ['baohe', '保和殿'], ['qianqing-gate', '乾清门'],
  ['qianqing', '乾清宫'], ['jiaotai', '交泰殿'], ['kunning', '坤宁宫'],
  ['qinan', '钦安殿', 'garden'], ['wenhua', '文华殿', 'outer-east'],
  ['wuying', '武英殿', 'outer-west'], ['tiren', '体仁阁', 'axis-courts'],
  ['hongyi', '弘义阁', 'axis-courts'],
];

// This is byte retention, not a snapshot refresh: remove only the reviewed
// additions and recover the original complete V18 file's frozen SHA-256.
test('four-card delta reconstructs byte-exact V18 data including all ten old objects and fifteen sources', () => {
  assert.equal(raw, JSON.stringify(data, null, 2) + '\n');
  assert.deepEqual(data.places.map(p => p.id), [...baseline.originalPlaceIds, ...baseline.addedPlaceIds]);
  assert.deepEqual(data.sources.map(s => s.id), [...baseline.originalSourceIds, ...baseline.addedSourceIds]);
  const restored = structuredClone(data);
  restored.places = restored.places.slice(0, baseline.originalPlaceIds.length);
  restored.sources = restored.sources.slice(0, baseline.originalSourceIds.length);
  assert.equal(sha(JSON.stringify(restored, null, 2) + '\n'), baseline.baseCatalogSha256);
});

test('four added cards and six sources exactly match the independently reviewed research delta', () => {
  assert.equal(sha(JSON.stringify(data.places.slice(10))), baseline.addedPlacesSha256);
  assert.equal(sha(JSON.stringify(data.sources.slice(15))), baseline.addedSourcesSha256);
  for (const place of data.places.slice(10)) {
    assert.equal(place.siteAccess.status, 'not-verified');
    assert.equal(place.siteAccess.checkedAt, null);
    assert.deepEqual(place.siteAccess.sourceIds, ['visit', 'announcements']);
  }
});

test('default catalog retains all fourteen exact layout/zone targets without caller-supplied zones', () => {
  const catalog = new PlaceCatalog();
  assert.equal(catalog.places.length, 159);
  assert.equal(catalog.sources.size, 129);
  assert.deepEqual([...catalog.sources.values()].slice(0, 21), data.sources);
  for (const [id, name, zoneId] of expected) {
    const binding = zoneId ? { kind: 'zone', name, zoneId } : { kind: 'layout', name };
    const place = catalog.get(id);
    assert.ok(place, `missing ${id}`);
    assert.deepEqual(place.sceneBinding, binding);
    const candidates = zoneId ? zones.find(z => z.id === zoneId).items.filter(building) : PALACE_LAYOUT;
    const matches = candidates.filter(item => item.name === name);
    assert.equal(matches.length, 1);
    assert.equal(catalog.sceneItems.get(id), matches[0]);
    assert.equal(catalog.forBinding(binding), place);
    assert.equal(place.modelExperience.teleportTargetName, name);
    assert.ok(catalog.sourcesFor(place).every(source => source?.publisher === '故宫博物院'));
  }
});

test('Wuying hall resolves uniquely while its real same-name region remains in the unmodified source', () => {
  const matches = outerWest.items.filter(item => item.name === '武英殿');
  assert.deepEqual(matches.map(item => item.kind).sort(), ['hall', 'region']);
  const catalog = new PlaceCatalog();
  assert.equal(catalog.sceneItems.get('wuying'), matches.find(building));
  const region = matches.find(item => item.kind === 'region');
  assert.equal(catalog.forMapItem(region, [region]), null);
});

for (const [id, name, zoneId] of expected.slice(10)) {
  for (const mutation of ['missing', 'duplicate building', 'region only', 'wrong zone']) {
    test(`${id}: ${mutation} fails closed rather than borrowing a different source item`, () => {
      const changed = structuredClone(zones);
      const zone = changed.find(z => z.id === zoneId);
      const item = zone.items.find(item => building(item) && item.name === name);
      if (mutation === 'missing') zone.items = zone.items.filter(other => other !== item);
      if (mutation === 'duplicate building') zone.items.push({ ...item });
      if (mutation === 'region only') item.kind = 'region';
      if (mutation === 'wrong zone') zone.id = 'unrelated-zone';
      assert.throws(() => new PlaceCatalog(data, { zones: changed }), /scene binding must resolve exactly once/);
    });
  }
  test(`${id}: source-bound map item accepts only an exact, unique building target`, () => {
    const catalog = new PlaceCatalog();
    const source = zones.find(z => z.id === zoneId).items.find(item => building(item) && item.name === name);
    if (source.pavilionProfile) {
      assert.equal(catalog.forMapItem(source, [source]), null, 'raw pavilion origin is not its generated map rectangle');
    } else assert.equal(catalog.forMapItem(source, [source])?.id, id);
    assert.equal(catalog.forMapItem(source, []), null);
    assert.equal(catalog.forMapItem(source, [source, { ...source }]), null);
    const shifted = { ...source, x: source.x + 1 };
    assert.equal(catalog.forMapItem(shifted, [shifted]), null);
    const missing = { ...source, name: '未收录地点' };
    assert.equal(catalog.forMapItem(missing, [missing]), null);
    for (const kind of ['region', 'corridor', 'wall', undefined]) {
      const nonBuilding = { ...source, kind };
      assert.equal(catalog.forMapItem(nonBuilding, [nonBuilding]), null, `${kind} must not borrow ${name}`);
    }
  });
}

test('original quick-key order, target names and positions remain byte-object equivalent', () => {
  assert.deepEqual(TELEPORT.POINTS, baseline.quickPoints);
  assert.equal(JSON.stringify(TELEPORT.POINTS), JSON.stringify(baseline.quickPoints));
});
