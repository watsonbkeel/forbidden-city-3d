import test from 'node:test';
import assert from 'node:assert/strict';
import { setupMap } from './lib/map-fixture.mjs';
import { buildWorld } from './lib/world.mjs';
import { FLIGHT_BOUNDS } from '../src/scene/flight/FlightEnvelope.js';

const SIX_PALACES = ['景仁宫', '承乾宫', '钟粹宫', '延禧宫', '永和宫', '景阳宫', '永寿宫', '翊坤宫', '储秀宫', '太极殿', '长春宫', '咸福宫'];
let world;
async function fixture(t, mobile = false) {
  world ??= await buildWorld({ statics: false });
  const s = await setupMap(t, { mobile });
  const m = s.map;
  m.items = world.mapItems;
  m.worldBounds = FLIGHT_BOUNDS;
  m.mapHeight = Math.round(m.mapSize * (FLIGHT_BOUNDS.maxZ - FLIGHT_BOUNDS.minZ) / (FLIGHT_BOUNDS.maxX - FLIGHT_BOUNDS.minX) * .82);
  // This unit fixture models full-width CJK glyphs at the actual chosen font
  // size. The companion CPU raster test measures the installed Noto CJK font.
  const ctx = m.baseCanvas.getContext('2d');
  ctx.measureText = text => ({ width: [...text].length * Number(/([\d.]+)px/.exec(ctx.font)?.[1] ?? 10) });
  m.renderBase();
  m.toggle();
  return { ...s, m };
}
function overlap(a, b) {
  return Math.abs(a.x - b.x) < (a.width + b.width) / 2 && Math.abs(a.y - b.y) < (a.height + b.height) / 2;
}
function assertReadable(m) {
  for (const a of m.labels) {
    const lines = a.mode === 'exterior-view' || m.items.find(i => i.name === a.name)?.historicalSite ? 2 : 1;
    const screenFontSize = (a.height * m.pxPerUnit - 2) / lines;
    assert.ok(screenFontSize >= 12 - 1e-9, `${a.name}: legible screen height`);
    assert.ok(screenFontSize <= 13 + 1e-9, `${a.name}: text must not balloon with map zoom`);
    for (const b of m.labels) if (a !== b) assert.equal(overlap(a, b), false, `${a.name} overlaps ${b.name}`);
  }
}

for (const mobile of [false, true]) test(`R49 all twelve palace names are readable at district zoom, ${mobile ? 'touch' : 'desktop'}`, async t => {
  const { m } = await fixture(t, mobile);
  m.view.k = 4;
  const center = m.worldToMap(0, 380); m.view.cx = center.x; m.view.cy = center.y;
  m.drawMap();
  for (const name of SIX_PALACES) assert.ok(m.labels.some(l => l.name === name), `${name} must not be crowded out by a gate`);
  assertReadable(m);
});

test('R49 real label rectangles across all zones never overlap, and gate details return at close zoom', async t => {
  const { m } = await fixture(t);
  const counts = [];
  for (const k of [1, 2, 4, 8]) {
    m.view.k = k; m.drawMap(); assertReadable(m);
    counts.push(m.labels.filter(l => /门$/.test(l.name)).length);
  }
  assert.ok(counts.at(-1) > counts[0], `zoom must reveal details: ${counts}`);
  for (const name of ['景仁门', '承乾门', '钟粹门', '永寿门', '咸福门']) assert.ok(m.labels.some(l => l.name === name), name);
});

test('R49 visible palace text selects the exact card without travel while held walking continues', async t => {
  const s = await fixture(t); const { m } = s;
  m.view.k = 4; m.drawMap();
  for (const name of SIX_PALACES) {
    const label = m.labels.find(l => l.name === name); assert.ok(label, name);
    s.key('keydown', 'KeyW'); s.frame(100); const before = s.logical();
    m.handleMapClick(m.mapToScreen(label.x, label.y));
    assert.equal(m.placeCatalog.get(m.selectedPlaceId)?.name, name);
    s.frame(100); assert.ok(s.logical().distanceTo(before) > 0);
    assert.deepEqual(s.teleports, []); s.key('keyup', 'KeyW'); m.backToMap();
  }
  assert.equal(m.placeCatalog.places.length, 159);
  assert.equal(m.placeCatalog.places.filter(p => ['partial-identity', 'partial-history', 'identity-unresolved', 'identity-inferred'].includes(p.evidenceStatus)).length, 7);
});

test('R49 label placement does not depend on gates arriving first in a zone record', async t => {
  const { m } = await fixture(t);
  m.view.k = 4; m.renderBase(); m.drawMap();
  const before = new Set(m.labels.filter(l => SIX_PALACES.includes(l.name)).map(l => l.name));
  m.items = [...m.items].sort((a, b) => (a.kind === 'gate' ? -1 : 1) - (b.kind === 'gate' ? -1 : 1));
  m.renderBase(); m.drawMap();
  assert.deepEqual(new Set(m.labels.filter(l => SIX_PALACES.includes(l.name)).map(l => l.name)), before);
  assert.equal(before.size, 12);
});

test('R49 no side-zone gate can displace a palace or hall at any supported zoom tier', async t => {
  const { m } = await fixture(t);
  const halls = new Set(world.mapItems.filter(i => i.kind === 'hall').map(i => i.name));
  for (const k of [1, 2, 4, 8]) {
    m.view.k = k; m.items = world.mapItems; m.renderBase();
    const withGates = new Set(m.labels.filter(l => halls.has(l.name)).map(l => l.name));
    m.items = world.mapItems.filter(i => !['gate', 'cityGate'].includes(i.kind)); m.renderBase();
    const withoutGates = new Set(m.labels.filter(l => halls.has(l.name)).map(l => l.name));
    assert.deepEqual(withGates, withoutGates, `all named hall priorities at ${k * 100}%`);
  }
});

test('R49 scale changes refresh measured hit boxes but walking/panning reuses the cached base map', async t => {
  const { m } = await fixture(t, true);
  m.view.k = 4; m.drawMap(); const render = t.mock.method(m, 'renderBase');
  m.drawMap(); m.view.cx += 1; m.drawMap();
  assert.equal(render.mock.callCount(), 0, 'no full map rebuild per walking frame or pan');
  m.zoomAt(1.2); assert.equal(render.mock.callCount(), 1); assertReadable(m);
  m.canvas.clientWidth = 240; m.resizeCanvas(); m.drawMap(); assertReadable(m);
  m.setCompact(true); assertReadable(m);
  m.setCompact(false); m.toggle(); m.drawPreview();
  assert.equal(m.baseLabelScale, m.previewSize / m.previewView);
  m.toggle(); assert.equal(m.baseLabelScale, m.pxPerUnit); assertReadable(m);
});

test('R49 maximum desktop zoom paints legible glyphs at display scale, never as tiny base-map glyphs', async t => {
  const { m } = await fixture(t);
  m.viewW = 742; m.viewH = 718; m.view.k = 8; m.dpr = 2;
  const point = m.worldToMap(95, 380); m.view.cx = point.x; m.view.cy = point.y;
  const raster = [], painted = [];
  m.baseCanvas.getContext('2d').fillText = text => raster.push(text);
  m.ctx.fillText = function(text) { painted.push({ text, font: this.font }); };
  m.drawMap();
  assert.equal(raster.filter(text => text === '翊坤宫').length, 0, 'do not magnify a ~5px baked glyph');
  assert.ok(painted.some(p => p.text === '翊坤宫'), 'the visible palace is painted in the display layer');
  for (const p of painted) assert.ok(/^\D*(12|13)px sans-serif$/.test(p.font), `${p.text}: ${p.font}`);
});

test('R49 mobile update never alternates preview/full-map scales in the same frame', async t => {
  const s = await fixture(t, true), { m } = s;
  const base = t.mock.method(m, 'renderBase');
  const preview = t.mock.method(m, 'drawPreview');
  const full = t.mock.method(m, 'drawMap');
  m.view.k = 4; m.drawMap();
  const initialBuilds = base.mock.callCount();
  for (let i = 0; i < 10; i++) { s.advance(100); m.update(s.camera); }
  assert.equal(preview.mock.callCount(), 0);
  assert.equal(base.mock.callCount(), initialBuilds);
  m.toggle();
  const fullCalls = full.mock.callCount();
  for (let i = 0; i < 10; i++) { s.advance(100); m.update(s.camera); }
  assert.equal(full.mock.callCount(), fullCalls);
  assert.equal(preview.mock.callCount(), 10);
  assert.equal(base.mock.callCount(), initialBuilds + 1, 'closing swaps to the preview scale once');
});

const SIX_PALACE_IDS = {
  景仁宫: 'place-east-six-6af6dcfc02', 承乾宫: 'place-east-six-42d58b9b0d', 钟粹宫: 'place-east-six-479353af2c',
  延禧宫: 'place-east-six-1400b5fc62', 永和宫: 'place-east-six-d2b7eec1f3', 景阳宫: 'place-east-six-9da5992a78',
  永寿宫: 'place-west-six-62bf56b1f3', 翊坤宫: 'place-west-six-374b36682d', 储秀宫: 'place-west-six-b0a68a4270',
  太极殿: 'place-west-six-bbdb208a58', 长春宫: 'place-west-six-7afded67d3', 咸福宫: 'place-west-six-99f5aa211a',
};
const DEFAULT_PALACE_LABELS = ['景仁宫', '承乾宫', '钟粹宫', '永寿宫', '翊坤宫', '储秀宫'];
function enterMap(s, mobile) {
  if (mobile) s.m.preview.click();
  else s.dispatch(s.window, 'keydown', { key: 'm', code: 'KeyM', repeat: false });
  assert.equal(s.m.visible, true);
  assert.equal(s.m.container.style.display, 'block');
  assert.equal(s.m.canvas.hidden, false);
}
function pointer(s, type, id, point, mobile) {
  const r = s.m.canvas.getBoundingClientRect();
  s.dispatch(s.m.canvas, type, { pointerId: id, pointerType: mobile ? 'touch' : 'mouse',
    clientX: r.left + point.x, clientY: r.top + point.y });
}
function panToLabel(s, label, mobile) {
  const m = s.m;
  for (let i = 0; i < 30; i++) {
    const point = m.mapToScreen(label.x, label.y), hw = label.width * m.pxPerUnit / 2, hh = label.height * m.pxPerUnit / 2;
    if (point.x - hw >= 0 && point.x + hw <= m.viewW && point.y - hh >= 0 && point.y + hh <= m.viewH) return point;
    const center = { x: m.viewW / 2, y: m.viewH / 2 };
    const end = { x: center.x + Math.max(-60, Math.min(60, center.x - point.x)),
      y: center.y + Math.max(-60, Math.min(60, center.y - point.y)) };
    pointer(s, 'pointerdown', 100 + i, center, mobile);
    pointer(s, 'pointermove', 100 + i, end, mobile);
    pointer(s, 'pointerup', 100 + i, end, mobile);
    assert.equal(m.detailVisible, false, 'panning must not select or travel');
  }
  assert.fail(`${label.name}: could not pan the real label completely into the viewport`);
}

for (const mobile of [false, true]) test(`R49 normal ${mobile ? 'preview-tap' : 'M-key'} entry to twelve real canvas labels, exact cards, and separate travel`, async t => {
  const s = await fixture(t, mobile), { m } = s;
  m.toggle(); enterMap(s, mobile);
  assert.equal(m.view.k, 2, 'unmodified normal opening zoom');
  const hint = m.container.querySelector('#minimap-help');
  assert.equal(hint.hidden, false);
  assert.match(hint.textContent, /宫殿名优先，放大查看更多/);
  assert.match(hint.textContent, /钦安殿保留地面观览落点/);
  assert.deepEqual(SIX_PALACES.filter(name => m.labels.some(l => l.name === name)), DEFAULT_PALACE_LABELS);
  m.hasTeleportTarget = name => world.mapItems.some(i => i.kind === 'hall' && i.name === name);
  const painted = [];
  m.ctx.fillText = text => painted.push(text);
  const identities = [];
  for (const name of SIX_PALACES) {
    if (!m.visible) enterMap(s, mobile);
    // The real double-click handler doubles the default zoom to 400%.
    const r = m.canvas.getBoundingClientRect();
    s.dispatch(m.canvas, 'dblclick', { clientX: r.left + m.viewW / 2, clientY: r.top + m.viewH / 2 });
    assert.equal(m.view.k, 4);
    assert.deepEqual(SIX_PALACES.filter(n => m.labels.some(l => l.name === n)), SIX_PALACES);
    const label = m.labels.find(l => l.name === name);
    assert.equal(label.placeId, SIX_PALACE_IDS[name], `${name}: pinned source-bound label identity`);
    const point = panToLabel(s, label, mobile);
    painted.length = 0; m.update(s.camera);
    assert.ok(painted.includes(name), `${name} actually reaches the display-layer fillText call in the viewport`);
    const beforeTravel = [...s.teleports];
    if (mobile) s.touch('touchstart', 70); else s.key('keydown', 'KeyW');
    s.frame(100); const position = s.logical();
    pointer(s, 'pointerdown', 900, point, mobile); pointer(s, 'pointerup', 900, point, mobile);
    assert.equal(m.selectedPlaceId, SIX_PALACE_IDS[name]);
    assert.equal(m.container.querySelector('#place-title').textContent, name);
    const place = m.placeCatalog.get(m.selectedPlaceId);
    assert.equal(place.modelExperience.teleportTargetName, name);
    assert.deepEqual(s.teleports, beforeTravel, 'a real canvas click only opens the card');
    s.frame(100); assert.ok(s.logical().distanceTo(position) > 0, 'held walking continues through the real canvas click');
    if (mobile) s.touch('touchend', 70); else s.key('keyup', 'KeyW');
    const travel = m.container.querySelector('#place-travel'); assert.ok(travel);
    assert.ok(travel.getAttribute('aria-label').includes(name));
    travel.click();
    assert.deepEqual(s.teleports, [...beforeTravel, name], 'only the separate travel button emits the exact target');
    assert.equal(m.visible, false);
    identities.push({ name, labelId: label.placeId, cardId: m.placeCatalog.get(label.placeId).id, travelTarget: name });
  }
  t.diagnostic(JSON.stringify({ normalEntry: mobile ? 'preview-tap' : 'M-key', defaultLabels: DEFAULT_PALACE_LABELS,
    zoom400Labels: SIX_PALACES, exactLabelCardTravelIdentities: identities }));
});

test('R49 normal low-zoom directory search reaches the six suppressed palace names without map travel', async t => {
  const s = await fixture(t), { m } = s;
  m.toggle(); enterMap(s, false);
  const input = m.container.querySelector('#place-search');
  const omitted = SIX_PALACES.filter(name => !m.labels.some(l => l.name === name));
  assert.deepEqual(omitted, ['延禧宫', '永和宫', '景阳宫', '太极殿', '长春宫', '咸福宫']);
  for (const name of omitted) {
    input.value = name; s.dispatch(input, 'input');
    const button = m.placeList.querySelectorAll('button').find(b => !b.hidden && b.textContent === name);
    assert.ok(button, name); assert.equal(button.inert, false); button.click();
    assert.equal(m.selectedPlaceId, SIX_PALACE_IDS[name]);
    assert.equal(m.container.querySelector('#place-title').textContent, name);
    assert.deepEqual(s.teleports, []);
    m.container.querySelector('#place-back').click();
    assert.equal(m.detailVisible, false); assert.equal(m.view.k, 2);
  }
});
