import assert from 'node:assert/strict';
import test from 'node:test';
import { setupMap } from '../lib/map-fixture.mjs';

// The catalogue now includes supplemental places and facilities. Test identity
// and user behavior, not a denominator frozen by the earlier R31 replay.
const historicalNames = [
  ['玄武门', 'place-layout-5ecc54dc81'],
  ['奉天殿', 'taihe'],
  ['思顺斋', 'place-west-six-64bc5aa115'],
  ['未央宫', 'place-west-six-bbdb208a58'],
  ['启祥宫', 'place-west-six-bbdb208a58'],
];

test('five historical place names resolve to the expected current cards and never auto-travel', async t => {
  const fixture = await setupMap(t);
  const { map } = fixture;
  map.toggle();
  const input = map.container.querySelector('#place-search');
  for (const [name, expectedId] of historicalNames) {
    input.value = name;
    fixture.dispatch(input, 'input');
    const visible = map.directoryEntries.filter(entry => !entry.button.hidden);
    assert.equal(visible.length, 1, name);
    visible[0].button.click();
    assert.equal(map.selectedPlaceId, expectedId, name);
    map.placeBack.click();
    assert.equal(input.value, name, 'Back retains the search');
  }
  assert.deepEqual(fixture.teleports, [], 'Opening a card must not teleport the player');
});
