import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { PLAYER } from '../src/config/constants.js';
import { library } from './lib/inner-palace-fixture.mjs';
import { buildWorld, loadZoneJsons, hallGeom, walkStraight } from './lib/world.mjs';
import { replayTerrace } from './lib/terrace-walk.mjs';
import { bindProfileSupports, traceProfileSupports } from './lib/profile-support-trace.mjs';

// These are the eleven changed principal halls, not every building whose width
// happens to produce five bays. Removing/ignoring explicit bays, retaining the
// old column/window collider grid, or opening a closed panel must fail below.
const changed = [
  ['east-six', '景仁宫', 5], ['east-six', '承乾宫', 5],
  ['east-six', '钟粹宫', 5], ['east-six', '永和宫', 5],
  ['east-six', '景阳宫', 3], ['west-six', '永寿宫', 5],
  ['west-six', '翊坤宫', 5], ['west-six', '储秀宫', 5],
  ['west-six', '太极殿', 5], ['west-six', '长春宫', 5],
  ['west-six', '咸福宫', 3],
];
const zones = loadZoneJsons();
let worldPromise;
const fullWorld = () => worldPromise ??= buildWorld({ zones });
const near = (a, b, message) => assert.ok(Math.abs(a - b) < 1e-6, `${message}: ${a} != ${b}`);
const sameBox = (a, b) => a.min.distanceTo(b.min) < 1e-7 && a.max.distanceTo(b.max) < 1e-7;
const fixtures = new Map();

function palace(zoneId, name) {
  if (fixtures.has(name)) return fixtures.get(name);
  const data = zones.find(z => z.json.id === zoneId).json;
  const matches = data.items.filter(i => i.kind === 'hall' && i.name === name);
  assert.equal(matches.length, 1, `${name}: one actual zone hall`);
  const item = matches[0], zone = new ZoneBase(library(), data);
  zone.buildHall(item);
  const frame = zone.kit.root.children.find(g => g.userData.structure);
  assert.ok(frame, `${name}: actual CourtKit hall frame`);
  frame.updateMatrixWorld(true);
  const result = { item, zone, frame, g: hallGeom(item) };
  fixtures.set(name, result);
  return result;
}

function supportProfile(f) {
  const { item, zone } = f;
  const boxes = zone.kit.walkables.filter(w => w.type === 'box');
  const ramps = zone.kit.walkables.filter(w => w.type === 'ramp');
  assert.equal(boxes.length, 1, `${item.name}: one actual platform`);
  assert.equal(ramps.length, 1, `${item.name}: existing central front flight only`);
  return {
    supports: {
      platform: { type: 'box', supportId: `${item.name}:platform`,
        min: boxes[0].box.min.toArray(), max: boxes[0].box.max.toArray() },
      ramps: ramps.map((r, i) => ({ ...r, supportId: `${item.name}:stair:${i}` })),
    },
  };
}

function blocked(W, f, label, a, b) {
  const start = f.g.toW(...a), end = f.g.toW(...b);
  const result = walkStraight(W, start, end, { feet0: f.item.ph, step: .05 });
  assert.ok(result.reached >= .1, `${f.item.name}/${label}: start must be clear, ${JSON.stringify(result)}`);
  assert.ok(result.reached < result.total - .8,
    `${f.item.name}/${label}: forbidden shortcut crossed, ${JSON.stringify(result)}`);
  return result;
}

test('R32 palace coverage is exactly eleven explicit principal halls', () => {
  assert.equal(changed.length, 11);
  assert.equal(new Set(changed.map(([, name]) => name)).size, 11);
  const actual = zones.flatMap(z => z.json.items.filter(i => i.baysSource).map(i => i.name)).sort();
  assert.deepEqual(actual, changed.map(([, name]) => name).sort());
});

for (const [zoneId, name, bays] of changed) {
  test(`${name}: actual columns, closed window panels and collision agree with ${bays} bays`, async () => {
    const f = palace(zoneId, name), { item, frame, zone, g } = f, W = await fullWorld();
    assert.equal(item.bays, bays);
    assert.equal(g.rot, 0);
    assert.equal(item.enter, true);
    assert.equal(!!item.backDoor, false);
    const own = W.cm.colliders.filter(c => W.ownerOf(c).item === item);
    assert.equal(own.length, zone.kit.colliders.length, 'real world owns every hall collider');
    for (const b of zone.kit.colliders) assert.ok(own.some(c => sameBox(c.box, b)), 'no alternate world collision grid');
    const cols = frame.children.filter(m => m.geometry?.type === 'CylinderGeometry' &&
      m.material?.name === 'wood_column' && Math.abs(m.position.y - (item.ph + item.colH / 2)) < 1e-7);
    assert.equal(cols.length, 2 * (bays + 1));
    for (const side of [-1, 1]) {
      const row = cols.filter(m => Math.abs(m.position.z - side * item.d / 2) < 1e-7)
        .sort((a, b) => a.position.x - b.position.x);
      assert.equal(row.length, bays + 1);
      row.forEach((m, i) => {
        near(m.position.x, -item.w / 2 + i * item.w / bays, 'visible column subdivision');
        const r = m.geometry.parameters.radiusTop;
        const expected = new THREE.Box3(
          new THREE.Vector3(m.position.x - r, item.ph, m.position.z - r),
          new THREE.Vector3(m.position.x + r, item.ph + 3, m.position.z + r),
        ).applyMatrix4(frame.matrixWorld);
        assert.ok(own.some(c => sameBox(c.box, expected)), `${name}: column ${i}/${side} collider moved with mesh`);
      });
    }
    const front = -item.d / 2;
    const panels = frame.children.filter(m => m.material?.name === 'lattice_doors' &&
      Math.abs(m.position.z - front) < 1e-7 && Math.abs(m.rotation.y) < 1e-7)
      .sort((a, b) => a.position.x - b.position.x);
    assert.equal(panels.length, bays - 1, 'only the central bay is an entrance');
    for (let i = 0; i < bays; i++) {
      const x = -item.w / 2 + (i + .5) * item.w / bays;
      if (i === (bays - 1) / 2) {
        assert.equal(panels.some(m => Math.abs(m.position.x - x) < 1e-7), false);
        assert.equal(W.cm.checkCollision(new THREE.Vector3(item.x + x, item.ph + PLAYER.HEIGHT, item.z + front)), false);
        continue;
      }
      const m = panels.find(m => Math.abs(m.position.x - x) < 1e-7);
      assert.ok(m, `${name}: visible panel in bay ${i}`);
      m.geometry.computeBoundingBox();
      near(m.geometry.boundingBox.max.x - m.geometry.boundingBox.min.x,
        item.w / bays - 2 * g.r, 'actual panel vertices follow new column spacing');
      const expected = new THREE.Box3(
        new THREE.Vector3(x - g.bay / 2, item.ph, front - .25),
        new THREE.Vector3(x + g.bay / 2, item.ph + 3, front + .25),
      ).applyMatrix4(frame.matrixWorld);
      assert.ok(own.some(c => sameBox(c.box, expected)), `${name}: panel ${i} has matching collider`);
    }
    const leaves = frame.children.filter(m => m.material?.name === 'lattice_doors' && Math.abs(m.rotation.y - Math.PI / 2) < 1e-7);
    assert.equal(leaves.length, 2, 'two folded leaves preserve the actual doorway');
    const door = zone.kit.rooms[0].doors[0];
    near(door.x, item.x, 'registered door aligned to middle bay');
    near(door.z, item.z + front, 'registered door aligned to front plane');
    supportProfile(f);
  });

  // Existing six-palace halls have one front flight, not east/west flights.
  // Both lateral lanes of that real flight are tested, as well as its center.
  for (const [lane, offset, fps, sprint, backward] of [
    ['center', 0, 60, false, false],
    ['left', -1.4, 10, true, false],
    ['right', 1.4, 10, true, true],
  ]) test(`${name}: real controller ${lane} stair/entrance round trip (${fps}Hz)`, async t => {
    const f = palace(zoneId, name), W = await fullWorld(), p = supportProfile(f);
    const { item, g } = f, ramp = p.supports.ramps[0];
    const toe = Math.min(ramp.a0, ramp.a1) - item.z;
    const go = [[offset, toe - 2], [offset, toe], [offset, -g.PD / 2],
      [offset, -item.d / 2], [offset, -item.d / 2 + 2.5]].map(v => g.toW(...v));
    const route = [...go, ...go.slice(0, -1).reverse()];
    const trace = traceProfileSupports(W.cm, bindProfileSupports(W.cm, p));
    let result;
    try { result = replayTerrace(t, W, route, { fps, sprint, backward, recordFrames: true }); }
    finally { trace.restore(); }
    assert.equal(result.arrived, true, JSON.stringify({ stuckAt: result.stuckAt, end: result.end }));
    assert.equal(result.startFeet, 0, 'physical ground spawn, not a high/deck shortcut');
    near(result.end[2], 0, 'ordinary braking settles on ground');
    assert.equal(result.driver.crossings.length, route.length - 1);
    assert.ok(result.maxFeet >= item.ph - .01 && result.maxFeet <= item.ph + .01);
    const sequence = trace.samples.map(s => s.source).filter((s, i, a) => !i || s !== a[i - 1]);
    assert.deepEqual(sequence, ['ground', ramp.supportId, p.supports.platform.supportId, ramp.supportId, 'ground'],
      'actual owned stair support must be used up and down, without rescue/other surfaces');
    const stair = trace.samples.filter(s => s.source === ramp.supportId);
    assert.ok(stair.some(s => s.height > s.feetIn + 1e-5), 'real ramp ascent');
    assert.ok(stair.some(s => s.height < s.feetIn - 1e-5), 'real ramp descent');
    for (const frame of result.frames) {
      assert.ok(Number.isFinite(frame.feet) && Number.isFinite(frame.ground));
      assert.ok(frame.feet >= 0 && frame.feet <= item.ph + .01);
      if (frame.z > item.z - item.d / 2 + .7) near(frame.ground, item.ph, 'entered actual hall floor');
    }
    if (sprint) assert.ok(result.maxSpeed > PLAYER.MOVE_SPEED + .5, 'production sprint, not slowed test movement');
    t.diagnostic(JSON.stringify({ lane, queries: trace.samples.length, supportSequence: sequence,
      maxFeet: result.maxFeet, maxSpeed: result.maxSpeed, end: result.end }));
  });

  test(`${name}: closed windows, column grid, side walls and rear wall reject shortcuts`, async () => {
    const f = palace(zoneId, name), W = await fullWorld(), { item, g } = f, front = -item.d / 2;
    for (let i = 0; i < bays; i++) if (i !== (bays - 1) / 2) {
      const x = -item.w / 2 + (i + .5) * g.bay;
      blocked(W, f, `closed-window-${i}`, [x, front + 1.4], [x, front - 1.4]);
    }
    for (let i = 1; i < bays; i++) {
      const x = -item.w / 2 + i * g.bay;
      blocked(W, f, `front-column-${i}`, [x, front + 1.4], [x, front - 1.4]);
    }
    for (const sign of [-1, 1]) {
      blocked(W, f, `side-wall-${sign}`, [sign * (item.w / 2 - 1.4), 0], [sign * (item.w / 2 + 1.4), 0]);
      blocked(W, f, `rear-wall-${sign}`, [sign * item.w / 4, item.d / 2 - 1.4], [sign * item.w / 4, item.d / 2 + 1.4]);
    }
  });
}

