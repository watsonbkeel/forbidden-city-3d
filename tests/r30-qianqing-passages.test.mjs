import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { registerHooks } from 'node:module';
registerHooks({ load(u, c, n) { if (u.endsWith('.json')) return { format: 'module', source: 'export default ' + fs.readFileSync(new URL(u), 'utf8'), shortCircuit: true }; return n(u, c); } });
import * as T from 'three';
import { PalaceBuilder } from '../src/scene/PalaceBuilder.js';
import { PALACE_LAYOUT } from '../src/scene/Layout.js';
import { library, sceneRows } from './lib/inner-palace-fixture.mjs';
import { FlightEnvelope } from '../src/scene/flight/FlightEnvelope.js';
import { qianqingPassageFrame, buildQianqingPassageMouth, buildQianqingPassageWalls } from '../src/scene/palace/QianqingEndPassages.js';
import { buildWorld, walkStraight } from './lib/world.mjs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const read = p => fs.readFileSync(new URL('../' + p, import.meta.url));
const base = JSON.parse(read('tests/fixtures/r30-qianqing-passage-baseline.json'));
const scene = new T.Scene(), b = new PalaceBuilder(scene, library()); b.buildAll(PALACE_LAYOUT); scene.updateMatrixWorld(true);
const f = scene.getObjectByName('后三宫').userData.qianqingPassages;
const serial = x => JSON.parse(JSON.stringify(x)), hash = x => createHash('sha256').update(x).digest('hex');
const box = (x0, y0, z0, x1, y1, z1) => ({ min: { x: x0, y: y0, z: z0 }, max: { x: x1, y: y1, z: z1 } });
const eq = (x, y) => ['min', 'max'].every(k => ['x', 'y', 'z'].every(a => Math.abs(x[k][a] - y[k][a]) < 1e-8));

test('two explicit estimated passages preserve hall anchors and reject unsupported registration', () => {
  assert.deepEqual([f.x0, f.z0, f.y, f.w, f.d], [0, 316.8, 2.16, 46, 25]);
  assert.deepEqual(f.bays, [0, 8]); assert.match(f.status, /NOT_SURVEY/);
  assert.match(f.sideDoorPose, /NOT_VERIFIED/); assert.match(f.frontVerandaSetback, /UNREGISTERED/);
  assert.ok(f.clearWidth > 4 && f.clearWidth < 4.02);
  for (const patch of [{ d: 24 }, { w: 48 }, { y: 2 }, { z0: 317 }, { H: 8 }]) assert.throws(() => qianqingPassageFrame({ ...f, ...patch }), /Unregistered/);
  assert.throws(() => buildQianqingPassageWalls(b, scene.getObjectByName('后三宫'), f), /Duplicate/);
  assert.throws(() => buildQianqingPassageMouth(b, new T.Group(), f, 0, f.zSouth), /Unknown/);
});

test('only four facade spans change; 14 geometry-backed passage colliders are added and all walking surfaces remain exact', () => {
  const old = structuredClone(base.colliders), now = serial(b.colliders);
  for (const z of [304.3, 329.3]) for (const sign of [-1, 1]) {
    const a = [sign * 23, sign * (46 / 6)].sort((x, y) => x - y);
    const c = box(a[0], 2.16, z - .25, a[1], 5.16, z + .25), i = old.findIndex(v => eq(v, c)); assert.ok(i >= 0);
    const next = [sign * (23 - 46 / 9), sign * (46 / 6)].sort((x, y) => x - y);
    old[i] = box(next[0], 2.16, z - .25, next[1], 5.16, z + .25);
  }
  const added = [...now];
  for (const c of old) { const i = added.findIndex(v => eq(c, v)); assert.ok(i >= 0, 'retained collider missing'); added.splice(i, 1); }
  assert.equal(now.length, 2503); assert.equal(added.length, 14); assert.deepEqual(serial(b.walkables), base.walkables);
  for (const c of added) { assert.ok(c.min.y === 2.16 || Math.abs(c.min.y - (2.16 + f.doorH - .18)) < 1e-8); assert.ok(c.min.x >= -23 && c.max.x <= 23); assert.ok(c.min.z >= 304.12 && c.max.z <= 329.48); }
});

test('raw mouths and complete inner walls meet the inherited floor/ceiling and bind closed side-door boundaries', () => {
  const raw = new T.Group(), bb = new PalaceBuilder(new T.Scene(), library());
  bb.buildHall(raw, PALACE_LAYOUT.find(x => x.name === '乾清宫'), 2.16, { heightReferenceY: 7 });
  const parts = raw.children.filter(x => x.userData.qianqingPassage);
  assert.equal(parts.filter(x => x.userData.qianqingPassage.kind === 'mouth-jamb').length, 8);
  assert.equal(parts.filter(x => x.userData.qianqingPassage.kind === 'mouth-lintel').length, 4);
  assert.equal(parts.filter(x => x.userData.qianqingPassage.kind === 'inner-wall').length, 4);
  assert.equal(parts.filter(x => x.userData.qianqingPassage.kind === 'closed-side-door').length, 2);
  raw.updateMatrixWorld(true);
  for (const p of parts) {
    const q = new T.Box3().setFromObject(p); assert.ok(q.min.y >= 2.16 - 1e-5 && q.max.y <= 9.38 + 1e-5);
    assert.ok(q.min.x >= -23 - 1e-5 && q.max.x <= 23 + 1e-5);
    assert.ok(q.min.z >= 304.12 - 1e-5 && q.max.z <= 329.48 + 1e-5);
  }
  bb.dispose();
});

test('all other palace groups are exact; complete resident cost includes the new inner walls', () => {
  const rows = sceneRows(scene); // R30 passage adds one batch; registered R31 surfaces add two. for (const [name, row] of Object.entries(base.groups)) if (name !== '后三宫') assert.deepEqual(rows[name], row);
  assert.equal(rows['后三宫'].triangles - base.groups['后三宫'].triangles, 288);
  assert.equal(rows['后三宫'].meshes - base.groups['后三宫'].meshes, 3);
});

test('unchanged roof envelope forbids low rotor flight through new pedestrian passages', () => {
  const grid = new FlightEnvelope(); for (const root of b.ownedObjects) grid.addRoot(root);
  assert.equal(hash(new Uint8Array(grid.heights.buffer)), base.flightHeightSHA256);
  assert.equal(hash(grid.water), base.flightWaterSHA256);
  for (const sign of [-1, 1]) for (const z of [304.3, 311.3, 316.8, 329.3]) {
    assert.equal(grid.isSafe({ x: sign * f.centerX, y: 4, z }, 7), false);
    assert.equal(grid.isSafe({ x: sign * f.centerX, y: 100, z }, 7), true);
  }
});

test('loaded real S proxies preserve both end routes, exterior approaches and rear-court connection in both directions', async () => {
  const w = await buildWorld(), cfg = JSON.parse(read('data/interiors/qianqing.json')), bytes = read('public' + cfg.model);
  const root = (await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '')).scene;
  root.position.set(cfg.frame.x, 2.16, cfg.frame.z); root.updateMatrixWorld(true);
  root.traverse(o => { if (!o.isMesh) return; const box = new T.Box3().setFromObject(o); if (o.name.startsWith('COL_')) w.cm.addCollider(box, 'interior:qianqing'); if (o.name.startsWith('WALK_')) w.cm.addWalkable({ type: 'box', box, rescue: false }, 'interior:qianqing'); });
  let legs = 0;
  for (const sign of [-1, 1]) {
    const p = [[0, 301], [sign * f.centerX, 301], [sign * f.centerX, 331], [0, 331], [0, 346]];
    const route = [...p, ...p.slice(0, -1).reverse()]; let feet = 2;
    for (let i = 1; i < route.length; i++) { const r = walkStraight(w, route[i - 1], route[i], { feet0: feet, step: .05 }); assert.ok(r.reached >= r.total - .1, JSON.stringify({ sign, i, r })); assert.ok(Math.hypot(r.end[0] - route[i][0], r.end[1] - route[i][1]) < .1, 'actual endpoint'); feet = r.feet; legs++; }
    for (const offset of [-1.4, 0, 1.4]) for (const [z0, z1] of [[301, 331], [331, 301]]) {
      const x = sign * f.centerX + offset, original = w.cm.getValidPosition;
      // Passive per-step assertion: a projected-distance success cannot hide
      // sliding into another lane around a blocked column or jamb.
      w.cm.getValidPosition = function (...args) { const p = original.apply(this, args); assert.ok(Math.abs(p.x - x) < .02, 'lane drift'); return p; };
      try { const r = walkStraight(w, [x, z0], [x, z1], { feet0: 2, step: .05 }); assert.ok(r.reached >= r.total - .1, JSON.stringify({ sign, offset, r })); assert.ok(Math.hypot(r.end[0] - x, r.end[1] - z1) < .1, 'lane endpoint'); legs++; }
      finally { w.cm.getValidPosition = original; }
    }
    for (const z of [307, 311.3, 324]) { const r = walkStraight(w, [sign * f.centerX, z], [sign * (f.inner - 2), z], { feet0: 2.16, step: .05 }); assert.ok(r.reached < r.total - 1, 'inner wall/closed door must block'); }
    const outer = walkStraight(w, [sign * f.centerX, 316.8], [sign * 25, 316.8], { feet0: 2.16, step: .05 }); assert.ok(outer.reached < outer.total - 1);
    const window = walkStraight(w, [sign * 12, 301], [sign * 12, 308], { feet0: 2, step: .05 }); assert.ok(window.reached < window.total - 2, 'window bay must stay closed');
    const edge = walkStraight(w, [sign * f.centerX + 1.7, 301], [sign * f.centerX + 1.7, 307], { feet0: 2, step: .05 }); assert.ok(edge.reached < edge.total - 1, 'jamb edge must block player width');
  }
  assert.equal(legs, 28);
});
