import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { setupMap } from '../lib/map-fixture.mjs';
import { publicMapItem } from '../../src/ui/PublicPlaceNames.js';
import { NEIGE_SECOND_STORE_FIT, NEIGE_SECOND_STORE_ENTRY } from '../../src/scene/palace/special/NeigeSecondStorehouse.js';
import { PALACE_LAYOUT } from '../../src/scene/Layout.js';

// Vite accepts the existing zone index's JSON imports without attributes.
// Match that loader behavior only; do not alter production source or data.
const jsonHook = registerHooks({ load(url, context, next) {
  return next(url, url.endsWith('.json') ? { ...context, importAttributes: { ...context.importAttributes, type: 'json' } } : context);
} });
let Teleport;
try { ({ Teleport } = await import('../../src/ui/Teleport.js')); } finally { jsonHook.deregister(); }
const { ZONES } = await import('../../data/zones/index.js');

// Transport keys are deliberately distinct. These are UI fixtures, not a
// claim of full-World/GPU/mobile validation. The second frame is validated by
// the production entry resolver, using the unchanged builder's exported fit.
const firstName = '内阁大库';
const secondName = '内阁大库第二体';
const rawSecondName = '内阁大库第二体（文字拟合、库别待核）';
const fit = NEIGE_SECOND_STORE_FIT;
const first = Object.freeze({ kind: 'hall', name: firstName, x: -221, z: -365, w: 42, d: 12, rot: Math.PI });
const rawSecond = Object.freeze({ kind: 'hall', name: rawSecondName, structure: 'neige-storehouse-candidate-b',
  entryProfile: NEIGE_SECOND_STORE_ENTRY, parentObjectId: 'FC-40EB11CF20',
  x: fit.x, z: fit.z, w: fit.width, d: fit.depth, rot: Math.PI,
  sourceStatus: 'OFFICIAL_TEXT_NOT_SECOND_STORE_PHOTO' });
const second = publicMapItem(rawSecond);
const travel = s => s.map.container.querySelector('#place-travel');

test('map canvas paints the verified aggregate name while retaining two distinct hit targets', async t => {
  const s = await setupMap(t);
  s.map.items = [first, second];
  s.map.labels = []; s.map.labelPaintRecords = [];
  const painted = [];
  s.map.ctx.fillText = text => painted.push(text);
  s.map.drawSideItems();
  assert.deepEqual(s.map.labels.map(label => label.name), [firstName, secondName]);
  assert.deepEqual(s.map.labelPaintRecords.map(label => label.text), [firstName, firstName]);
  assert.deepEqual(painted, [firstName, firstName]);
  assert.equal(s.map.labels[0].width, s.map.labels[1].width, 'measure the displayed name, not the internal suffix');
});

test('queued map labels normalize before decluttering without changing target identity', async t => {
  const s = await setupMap(t);
  s.map.labelQueue = [];
  s.map.drawLabel(secondName, 20, 30, true, 9);
  assert.equal(s.map.labelQueue[0].text, firstName);
  assert.equal(s.map.labelQueue[0].targetName, secondName);
});

test('all static layout, zone and catalog display names avoid obvious working labels', async t => {
  const s = await setupMap(t);
  const rows = [...PALACE_LAYOUT, ...ZONES.flatMap(zone => zone.items), ...s.map.placeCatalog.places];
  s.map.labelQueue = [];
  for (const row of rows) if (row.name) s.map.drawLabel(row.name, 0, 0, false);
  assert.ok(s.map.labelQueue.length > 300);
  for (const label of s.map.labelQueue) assert.doesNotMatch(label.text, /第二体|暂定|待核|未验|未经|拟合|候选|占位|游戏适配|游戏入口/);
});

for (const mobile of [false, true]) test(`detail, accessibility, resume and distinct travel keys remain correct in ${mobile ? 'touch fixture' : 'keyboard fixture'}`, async t => {
  const s = await setupMap(t, { mobile });
  s.map.items = [first, second];
  s.map.hasTeleportTarget = name => [firstName, secondName].includes(name);
  s.map.toggle();
  s.map.selectMapLabel({ name: secondName });
  assert.equal(s.map.container.querySelector('#place-title').textContent, firstName);
  assert.equal(travel(s).getAttribute('aria-label'), `前往${firstName}`);
  assert.equal(s.map.placeAnnouncement.textContent, `已选择${firstName}`);
  assert.equal(s.map.selection.name, secondName, 'internal selected identity stays unique');
  const staleSecondButton = travel(s);
  s.map.backToMap();
  assert.equal(s.map.resumePlace.textContent, `继续阅读${firstName}`);
  s.map.resumePlace.click();
  assert.equal(s.map.selection.name, secondName);
  const generation = s.map.selectionGeneration;
  s.map.selectMapLabel({ name: firstName });
  assert.ok(s.map.selectionGeneration > generation, 'same title must not keep the other building selected');
  staleSecondButton.click();
  assert.deepEqual(s.teleports, [], 'detached button cannot travel to a stale target');
  travel(s).click();
  assert.deepEqual(s.teleports, [firstName]);
  s.map.toggle(); s.map.selectMapLabel({ name: secondName }); travel(s).click();
  assert.deepEqual(s.teleports, [firstName, secondName]);
  assert.doesNotMatch(s.map.placePanel.element.textContent, /第二体|文字拟合|库别待核/);
});

test('direct details accept raw research name without displaying it or erasing provenance', async t => {
  const s = await setupMap(t);
  const title = s.map.placePanel.render({ name: rawSecondName, canTravel: true, onTravel() {} });
  assert.equal(title.textContent, firstName);
  assert.equal(travel(s).getAttribute('aria-label'), `前往${firstName}`);
  assert.equal(rawSecond.name, rawSecondName);
  assert.deepEqual(second, { ...rawSecond, name: secondName });
});

test('teleport retains distinct frames and sanitizes progress and blocked messages', async t => {
  const s = await setupMap(t);
  const loaded = [];
  const manager = { getMapItems: () => [first, second], ensureLoadedAt: (x, z) => loaded.push([x, z]) };
  const teleport = new Teleport(s.c, manager, s.cm);
  t.after(() => teleport.dispose());
  assert.equal(teleport.targets.get(firstName), first);
  assert.equal(teleport.targets.get(secondName), second);
  const a = teleport.landingFor(firstName), b = teleport.landingFor(secondName);
  assert.notDeepEqual([a.x, a.z], [b.x, b.z]);
  assert.deepEqual([b.x, b.z, b.lookAtX, b.lookAtZ], [-262.5, -351.12, -262.5, -359.12]);
  // Only landing availability is stubbed: this tests UI text, not collision safety.
  let progress;
  t.mock.method(teleport, 'resolveLanding', () => { progress = teleport.overlay.textContent; return null; });
  assert.equal(teleport.go(secondName), null);
  assert.equal(progress, `前往 ${firstName}…`);
  assert.equal(teleport.overlay.textContent, `${firstName}门前受阻，暂不能传送`);
  assert.deepEqual(loaded, [[fit.x, fit.z], [b.x, b.z]]);
});
