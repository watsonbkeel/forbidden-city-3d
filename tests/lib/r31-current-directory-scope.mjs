// Preserve the exact R31 core. Later physical cards, supplemental entries and
// map-only facilities have separate, source-backed inventories, not a new 159.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { restoreBeforeR163FiveCards } from './r163-five-cards-retention.mjs';

const read = name => readFileSync(new URL('../../data/places/' + name, import.meta.url));
const bytes = read('zh-CN.json');
const primaryIds = JSON.parse(bytes).places.map(place => place.id);
const historicIds = JSON.parse(restoreBeforeR163FiveCards(bytes)).places.map(place => place.id);
const supplement = JSON.parse(read('supplemental.json'));
const supplementalIds = supplement.records.map(row => row.id);
const facilityIds = ['FC-D156902D78', 'FC-B9097C61D8', 'FC-74F8C30390', 'FC-17AFD38428'];
const nodes = (map, id) => [...map.container.querySelector('#' + id).querySelectorAll('button')];

export const currentPrimaryCount = primaryIds.length;
export const aggregateCount = primaryIds.length + supplementalIds.length + facilityIds.length;

export function assertPrimaryIds(ids) {
  assert.equal(historicIds.length, 159, 'frozen R31 core, after exact R163 reversal');
  assert.deepEqual(ids, primaryIds);
  assert.deepEqual(ids.slice(0, 159), historicIds);
  assert.equal(ids.length, 159 + 5);
}

export function assertDirectoryInventory(map) {
  assertPrimaryIds(nodes(map, 'place-directory').map(button => button.getAttribute('data-place-id')));
  assert.equal(supplement.originalCardCount, primaryIds.length);
  assert.equal(supplementalIds.length, supplement.supplementalMapCardCount + supplement.supplementalDirectoryCardCount);
  assert.equal(supplement.candidateCardDenominator, primaryIds.length + supplementalIds.length);
  assert.deepEqual(nodes(map, 'supplemental-place-directory').map(button => button.getAttribute('data-place-id')), supplementalIds);
  const facilities = map.directoryEntries.filter(entry => entry.facility);
  assert.deepEqual(facilities.map(entry => entry.facility.id), facilityIds);
  assert.deepEqual(nodes(map, 'bridge-facility-directory'), facilities.map(entry => entry.button));
}

export function assertVisibleTotal(map) {
  const buttons = ['place-directory', 'supplemental-place-directory', 'bridge-facility-directory'].flatMap(id => nodes(map, id));
  assert.equal(buttons.length, aggregateCount);
  assert.ok(buttons.every(button => button.inert === button.hidden), 'all matching sections follow the input');
  const visible = buttons.filter(button => !button.hidden).length;
  const counter = map.container.querySelector('#place-search-count').textContent;
  if (visible) assert.equal(counter, `显示 ${visible} / ${aggregateCount} 个地点`);
  else assert.match(counter, /未找到/);
}
