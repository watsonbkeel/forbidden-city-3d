import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWorld } from './lib/world.mjs';
import { setupMap } from './lib/map-fixture.mjs';
import baseline from './fixtures/v19-four-place-cards.json' with { type: 'json' };

// Actual seven-zone ZoneBase/CourtKit map records, exactly the records that
// ZoneManager.getMapItems passes to Minimap. Existing CPU helper only stubs
// textures and final geometry batching; no browser, WebGL or server is started.
let world;
const actualMapItems = async () => (world ??= await buildWorld({ statics: false })).mapItems;
const additions = [['wenhua', '文华殿'], ['wuying', '武英殿'], ['tiren', '体仁阁'], ['hongyi', '弘义阁']];

test('production seven-zone map list resolves all five zone cards and excludes Wuying region', async t => {
  const items = await actualMapItems();
  const s = await setupMap(t);
  s.map.items = items;
  s.map.renderBase();
  assert.deepEqual(items.filter(item => item.name === '武英殿').map(item => item.kind), ['hall']);
  assert.equal(items.some(item => item.kind === 'region'), false);
  for (const [id, name] of [['qinan', '钦安殿'], ...additions]) {
    const matches = items.filter(item => item.name === name);
    assert.equal(matches.length, 1, name);
    assert.equal(s.map.placeCatalog.forMapItem(matches[0], items)?.id, id);
    assert.equal(s.map.labels.filter(label => label.placeId === id).length, 1, `${name} actual canvas label`);
    assert.equal(s.map.placeCatalog.forMapItem(matches[0], [...items, { ...matches[0] }]), null);
    if (id !== 'qinan') {
      for (const patch of [{ x: matches[0].x + 1 }, { z: matches[0].z + 1 }, { kind: 'region' }]) {
        const changed = { ...matches[0], ...patch };
        assert.equal(s.map.placeCatalog.forMapItem(changed, items), null);
      }
    }
    if (matches[0].pavilionProfile) {
      for (const patch of [{ pavilionProfile: 'other' }, { pavilionProfile: undefined }, { w: matches[0].w + 1 }, { d: matches[0].d + 1 }]) {
        const changed = { ...matches[0], ...patch };
        assert.equal(s.map.placeCatalog.forMapItem(changed, items), null);
      }
    }
  }
});

for (const mobile of [false, true]) for (const [id, name] of additions) {
  test(`${name}: ${mobile ? 'mobile' : 'desktop'} card selection requires a distinct explicit travel action`, async t => {
    const items = await actualMapItems();
    const s = await setupMap(t, { mobile });
    s.map.items = items;
    s.map.hasTeleportTarget = target => items.some(item => item.kind === 'hall' && item.name === target);
    s.map.renderBase();
    s.map.toggle();
    const label = s.map.labels.find(label => label.placeId === id);
    assert.ok(label);
    s.map.selectMapLabel(label);
    assert.equal(s.map.selectedPlaceId, id);
    assert.deepEqual(s.teleports, [], 'reading cannot invoke travel');
    assert.match(s.map.placePanel.element.textContent, /模型漫游不代表现场开放许可/);
    const button = s.map.container.querySelector('#place-travel');
    assert.ok(button, 'existing target resolves from real building map records');
    button.click();
    assert.deepEqual(s.teleports, [name]);
    assert.equal(s.map.visible, false);
  });
}

test('159 information buttons preserve the original fourteen and leave all eight quick travel buttons and their actions unchanged', async t => {
  const s = await setupMap(t);
  const info = s.map.container.querySelector('#place-list').querySelectorAll('button');
  assert.equal(info.length, 159);
  assert.deepEqual(info.slice(10,14).map(button => button.textContent), additions.map(([, name]) => name));
  const quick = s.map.container.querySelector('#teleport-points').querySelectorAll('button');
  assert.equal(quick.length, 8);
  for (const [index, point] of baseline.quickPoints.entries()) {
    assert.equal(quick[index].textContent, `${index + 1} 前往${point.name}`);
    assert.equal(quick[index].dataset.teleport, point.target);
    s.map.toggle();
    quick[index].click();
    assert.equal(s.teleports.at(-1), point.target);
    assert.equal(s.map.visible, false);
  }
  assert.deepEqual(s.teleports, baseline.quickPoints.map(point => point.target));
});
