import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PlaceCatalog } from '../src/ui/PlaceCatalog.js';
import { Minimap } from '../src/ui/Minimap.js';
import { FLIGHT_BOUNDS } from '../src/scene/flight/FlightEnvelope.js';
import { FLIGHT_RULES, HELICOPTER_HOME, LANDING_CHOICES, TOUR_ROUTE } from '../src/scene/flight/FlightState.js';
import { LAYOUT } from '../src/config/constants.js';
import { setupMap } from './lib/map-fixture.mjs';

// This is a current-source contract, not an R35 source projection. The digest
// binds only the existing 159 public identities and scene bindings read at
// 0d7bbf23; geometry, interiors and newly supported facts may change in R36.
const IDENTITY_SHA256 = '735e97769d42d4cb2da01272909b850b4b903e5fd277b6f907614bccfbef4b1f';
const unresolved = [
  ['南薰门', 'place-outer-west-be7146ea73', 'identity-unresolved'],
  ['太极门', 'place-west-six-1dd691141c', 'identity-inferred'],
  ['长康左门', 'place-garden-d2b1db1c8c', 'partial-history'],
  ['长康右门', 'place-garden-e18d4b34ca', 'partial-history'],
  ['南三所西所后殿', 'place-outer-east-3f2ebd1b02', 'partial-identity'],
  ['南三所中所后殿撷芳殿', 'place-outer-east-1db501eb23', 'partial-identity'],
  ['南三所东所后殿', 'place-outer-east-4642f5088e', 'partial-identity'],
];

test('R36 keeps all 159 stable public identities bound exactly once to current scene data', () => {
  const catalog = new PlaceCatalog();
  assert.equal(catalog.places.length, 159);
  const identities = catalog.places.map(({ id, name, sceneBinding }) => ({ id, name, sceneBinding }))
    .sort((a, b) => a.id.localeCompare(b.id));
  assert.equal(createHash('sha256').update(JSON.stringify(identities)).digest('hex'), IDENTITY_SHA256);
  for (const place of catalog.places) {
    assert.equal(catalog.forBinding(place.sceneBinding), place, place.name);
    assert.equal(place.modelExperience.teleportTargetName, place.name, place.name);
  }
});

test('R36 does not silently resolve any of the seven acknowledged identity/history gaps', () => {
  const catalog = new PlaceCatalog();
  const actual = catalog.places.filter(place => unresolved.some(([, , status]) => place.evidenceStatus === status));
  assert.equal(actual.length, 7);
  for (const [name, id, status] of unresolved) {
    const place = catalog.get(id);
    assert.equal(place.name, name);
    assert.equal(place.evidenceStatus, status, name);
  }
  assert.deepEqual(catalog.get('place-outer-west-be7146ea73').functions, []);
  assert.deepEqual(catalog.get('place-outer-west-be7146ea73').people, []);
  for (const [name, id, status] of unresolved.filter(row => row[2] === 'partial-identity')) {
    assert.deepEqual(catalog.get(id).people, [], name + ' cannot gain invented residents');
  }
});

for (const mobile of [false, true]) test(`R36 south hall search/card/back stays non-travelling on ${mobile ? 'touch' : 'desktop'}`, async t => {
  const s = await setupMap(t, { mobile });
  s.map.toggle();
  const input = s.map.container.querySelector('#place-search');
  for (const [name, id] of [['文华殿', 'wenhua'], ['武英殿', 'wuying'], ['文渊阁', 'place-outer-east-fd3d76e74d']]) {
    input.value = name;
    s.dispatch(input, 'input');
    const buttons = s.map.container.querySelector('#place-directory').querySelectorAll('button').filter(button => !button.hidden);
    assert.equal(buttons.length, 1, name);
    assert.equal(buttons[0].textContent, name);
    buttons[0].focus();
    s.map.container.scrollTop = 110;
    buttons[0].click();
    assert.equal(s.map.selectedPlaceId, id);
    assert.equal(s.map.placePanel.element.querySelector('#place-title').textContent, name);
    assert.deepEqual(s.teleports, [], 'opening an evidence card is not permission to travel');
    s.map.placeBack.click();
    assert.equal(input.value, name);
    assert.equal(s.document.activeElement, buttons[0]);
    assert.equal(s.map.container.scrollTop, 110);
  }
  input.value = '';
  s.dispatch(input, 'input');
  assert.equal(s.map.container.querySelector('#place-search-count').textContent, '显示 159 / 159 个地点');
});

test('R36 keeps flight limits, home and declared landing targets, rather than shrinking the world around new geometry', () => {
  assert.deepEqual(FLIGHT_BOUNDS, { minX: -530, maxX: 530, minZ: -590, maxZ: 660 });
  assert.deepEqual(HELICOPTER_HOME, { x: 18, y: 0, z: -494 });
  assert.equal(FLIGHT_RULES.radius, 5.7);
  assert.equal(FLIGHT_RULES.maximumAltitude, 180);
  assert.equal(FLIGHT_RULES.idleMs, 300000);
  assert.deepEqual(LANDING_CHOICES.map(({ id, x, z }) => ({ id, x, z })), [
    { id: 'wumen', x: 18, z: -494 },
    { id: 'taihe-court', x: 35, z: -155 },
    { id: 'qianqing-square', x: 25, z: 245 },
  ]);
});

test('R36 southern coordinates and existing tour remain on current map with north up and east right', t => {
  t.mock.method(Minimap.prototype, 'init', () => {});
  const walking = new Minimap();
  assert.deepEqual(walking.worldBounds, LAYOUT.BOUNDARY);
  const map = new Minimap({ worldBounds: FLIGHT_BOUNDS });
  assert.deepEqual(map.worldToMap(FLIGHT_BOUNDS.minX, FLIGHT_BOUNDS.maxZ), { x: map.mapSize, y: 0 });
  assert.deepEqual(map.worldToMap(FLIGHT_BOUNDS.maxX, FLIGHT_BOUNDS.minZ), { x: 0, y: map.mapHeight });
  const south=['outer-east','outer-west'].flatMap(id=>JSON.parse(readFileSync(new URL(`../data/zones/${id}.json`,import.meta.url))).items)
    .filter(item=>item.name&&['south-court-hall','wenyuan-pavilion'].includes(item.structure));
  assert.equal(south.length,5,'read the current dedicated halls, not the superseded group centroids');
  for (const point of [...TOUR_ROUTE,...south]) {
    const mapped = map.worldToMap(point.x, point.z);
    assert.ok(mapped.x >= 0 && mapped.x <= map.mapSize && mapped.y >= 0 && mapped.y <= map.mapHeight, point.name);
  }
  const east=south.find(i=>i.name==='文华殿'),west=south.find(i=>i.name==='武英殿');
  assert.ok(map.worldToMap(east.x,east.z).x > map.worldToMap(west.x,west.z).x, 'model negative X is geographic east');
});
