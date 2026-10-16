import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);

test('fourteen source-backed cards have unique exact scene bindings and preserved historical distinctions', async () => {
  const { PlaceCatalog } = await import('../src/ui/PlaceCatalog.js');
  const catalog = new PlaceCatalog();
  assert.equal(catalog.places.length, 14);
  assert.equal(new Set(catalog.places.map(p => p.id)).size, 14);
  assert.match(catalog.get('taihe').functionTag, /典礼/);
  assert.equal(catalog.get('baohe').people.filter(p => p.relation === 'temporary-resident').length, 2);
  assert.match(catalog.get('qianqing').summary.text, /雍正/);
  assert.match(catalog.get('kunning').summary.text, /明代.*清代/);
  assert.equal(catalog.get('qinan').modelExperience.navigationMode, 'exterior-view');
  assert.equal(catalog.get('taihe-gate').siteAccess.reopensAt, null);
  for (const p of catalog.places) {
    assert.equal(catalog.forBinding(p.sceneBinding), p);
    assert.ok(catalog.sourcesFor(p).length >= 2);
    for (const person of p.people) if (['resident', 'temporary-resident'].includes(person.relation)) assert.ok(p.residenceNote?.sourceIds.length);
  }
});

for (const [name, mutate] of [
  ['duplicate ID', d => d.places[1].id = d.places[0].id],
  ['duplicate binding', d => d.places[1].sceneBinding = d.places[0].sceneBinding],
  ['missing scene', d => d.places[0].sceneBinding.name = '不存在'],
  ['unknown field', d => d.places[0].location = [0, 0]],
  ['missing source', d => d.places[0].summary.sourceIds = ['missing']],
  ['empty sources', d => d.sources = []],
  ['nonofficial link', d => d.sources[0].url = 'https://example.com/a'],
  ['script link', d => d.sources[0].url = 'javascript:alert(1)'],
  ['tracking link', d => d.sources[0].url += '?tracking=1'],
  ['HTML', d => d.places[0].summary.text = '<script>alert(1)</script>'],
  ['overlong name', d => d.places[0].people[0].name = 'a'.repeat(2000)],
  ['missing residence evidence', d => delete d.places.find(p => p.id === 'baohe').residenceNote],
  ['fake live access', d => d.places[0].siteAccess.status = 'open-now'],
  ['different target', d => d.places[0].modelExperience.teleportTargetName = '太和殿'],
]) test(`catalog rejects ${name} without silently attaching unrelated facts`, async () => {
  const { PlaceCatalog } = await import('../src/ui/PlaceCatalog.js');
  const data = JSON.parse(readFileSync(new URL('data/places/zh-CN.json', root), 'utf8')); mutate(data);
  assert.throws(() => new PlaceCatalog(data), /Place catalog/);
});

test('Qinan profile-bound map footprint resolves despite asymmetric map center', async () => {
  const { PlaceCatalog } = await import('../src/ui/PlaceCatalog.js');
  const catalog = new PlaceCatalog();
  const item = { kind: 'hall', name: '钦安殿', x: 0, z: 492, qinanProfile: 'qinan', structure: 'qinan-hall' };
  assert.equal(catalog.forMapItem(item, [item])?.id, 'qinan');
  assert.equal(catalog.forMapItem(item, [item, { ...item }]), null);
  assert.equal(catalog.forMapItem({ ...item, qinanProfile: 'other' }, [{ ...item, qinanProfile: 'other' }]), null);
});
