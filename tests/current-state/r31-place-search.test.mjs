import test from 'node:test';
import assert from 'node:assert/strict';
import { setupMap } from '../lib/map-fixture.mjs';

const historicalNames = [
  ['玄武门', '神武门', 'place-layout-5ecc54dc81'],
  ['奉天殿', '太和殿', 'taihe'],
  ['思顺斋', '储秀宫后殿', 'place-west-six-64bc5aa115'],
  ['未央宫', '太极殿', 'place-west-six-bbdb208a58'],
  ['启祥宫', '太极殿', 'place-west-six-bbdb208a58'],
];

function search(s, value) {
  const input = s.map.container.querySelector('#place-search');
  input.value = value;
  s.dispatch(input, 'input');
  const buttons = s.map.container.querySelector('#place-directory').querySelectorAll('button');
  assert.ok(buttons.every(button => button.inert === button.hidden));
  return buttons.filter(button => !button.hidden);
}

// Removing alias terms from the real input listener must fail these assertions.
for (const mobile of [false, true]) {
  test(`historical name input opens the current card and preserves ${mobile ? 'touch' : 'keyboard'} return state`, async t => {
    const s = await setupMap(t, { mobile }); s.map.toggle();
    const input = s.map.container.querySelector('#place-search');
    const count = s.map.container.querySelector('#place-search-count');
    assert.equal(search(s, '').length, 159);
    assert.equal(count.textContent, '显示 159 / 159 个地点');
    for (const [alias, name, id] of historicalNames) {
      const [button, ...extra] = search(s, ` ${alias} `);
      assert.ok(button, alias); assert.deepEqual(extra, []);
      assert.equal(button.textContent, name);
      assert.equal(count.textContent, '显示 1 / 159 个地点');
      button.focus(); s.map.container.scrollTop = 125; button.click();
      assert.equal(s.map.selectedPlaceId, id);
      assert.equal(s.map.placePanel.element.querySelector('#place-title').textContent, name);
      assert.ok(s.map.placePanel.element.textContent.includes(alias));
      assert.equal(s.map.placeCatalog.get(id).modelExperience.teleportTargetName, name);
      s.map.placeBack.click();
      assert.equal(input.value, ` ${alias} `);
      assert.equal(s.document.activeElement, button);
      assert.equal(s.map.container.scrollTop, 125);
      assert.equal(button.hidden, false);
      assert.equal(count.textContent, '显示 1 / 159 个地点');
    }
    assert.deepEqual(s.teleports, [], 'search, card selection, and back never travel');
    assert.deepEqual(search(s, '登极').map(button => button.textContent), [], 'descriptions are not search aliases');
    assert.match(count.textContent, /未找到/);
    assert.equal(search(s, '\u3000').length, 159);
  });

  test(`皇极殿 search keeps two distinct card IDs and navigation targets on ${mobile ? 'touch' : 'desktop'}`, async t => {
    const s = await setupMap(t, { mobile }); s.map.hasTeleportTarget = () => true; s.map.toggle();
    const results = search(s, '皇极殿');
    assert.deepEqual(results.map(button => button.textContent), ['太和殿', '皇极殿']);
    assert.equal(s.map.container.querySelector('#place-search-count').textContent, '显示 2 / 159 个地点');
    const expected = [['太和殿', 'taihe'], ['皇极殿', 'place-ningshou-b607aa467b']];
    for (const [name, id] of expected) {
      if (!s.map.visible) s.map.toggle();
      if (s.map.detailVisible) s.map.placeBack.click();
      assert.equal(s.map.container.querySelector('#place-search').value, '皇极殿');
      results.find(button => button.textContent === name).click();
      assert.equal(s.map.selectedPlaceId, id);
      const travel = s.map.placePanel.element.querySelector('#place-travel');
      assert.equal(travel.getAttribute('aria-label'), `前往${name}`);
      travel.click();
      assert.equal(s.teleports.at(-1), name);
    }
    assert.deepEqual(s.teleports, ['太和殿', '皇极殿']);
  });
}

test('canonical names and demolished-site explanations remain searchable without losing their identities', async t => {
  const s = await setupMap(t); s.map.toggle();
  for (const [query, name] of [['丽景轩', '储秀宫后殿'], ['体和殿', '翊坤宫后殿'], ['体元殿', '太极殿后殿']]) {
    assert.deepEqual(search(s, query).map(button => button.textContent), [name]);
  }
  for (const name of ['储秀门', '长春门']) {
    const [button, ...extra] = search(s, `${name}旧址`);
    assert.equal(button.textContent, name); assert.deepEqual(extra, []);
    button.click();
    const place = s.map.placeCatalog.get(s.map.selectedPlaceId);
    assert.equal(place.name, name); assert.equal(place.evidenceStatus, 'historical-site');
    assert.equal(place.modelExperience.teleportTargetName, name);
    assert.match(s.map.placePanel.element.textContent, /历史地点 · 实体已拆除/);
    assert.match(s.map.placePanel.element.textContent, /不代表今天仍有门楼/);
    s.map.placeBack.click();
    assert.equal(s.map.container.querySelector('#place-search').value, `${name}旧址`);
  }
  assert.equal(search(s, '').length, 159);
  assert.deepEqual(s.teleports, []);
});
