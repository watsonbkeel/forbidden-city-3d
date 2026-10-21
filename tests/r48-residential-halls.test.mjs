import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import * as THREE from 'three';
import { CourtKit } from '../src/scene/palace/kit.js';
import { library, hash } from './lib/inner-palace-fixture.mjs';
import { CollisionManager } from '../src/utils/Collision.js';
import { replayTerrace, traceTerraceGround } from './lib/terrace-walk.mjs';

const path = new URL('../src/scene/palace/special/RemainingResidentialHalls.js', import.meta.url);
const api = existsSync(path) ? await import(path) : {};
const scope = JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/residential-scope.json', import.meta.url)));
const names = ['承乾宫', '景阳宫', '永寿宫', '永寿宫后殿', '咸福宫'];
const nodes = (root, role) => { const out = []; root.traverse(o => { if (o.userData.role === role) out.push(o); }); return out; };
function fixture(name) {
  assert.equal(typeof api.resolveRemainingProfile, 'function', 'R48 precise residential resolver is missing');
  const row = scope.find(r => r.name === name), item = structuredClone(row.baselineItem);
  const p = api.resolveRemainingProfile(row.zone, item);
  assert.ok(p, `${name} must have a dedicated source-bound profile`);
  const kit = new CourtKit(library(), row.zone), snapshot = JSON.stringify(item);
  const built = api.buildRemainingHall(kit, item, p);
  assert.equal(JSON.stringify(item), snapshot, 'profile must not mutate shared item');
  kit.root.updateMatrixWorld(true);
  const cm = new CollisionManager(); cm.rivers = []; cm.addColliders(kit.colliders); cm.addWalkables(kit.walkables);
  return { row, item, p, kit, cm, ...built };
}

test('R48 residential resolver matches only approved exact identities, never generic hall names', () => {
  assert.equal(typeof api.resolveRemainingProfile, 'function', 'R48 precise residential resolver is missing');
  for (const name of names) {
    const row = scope.find(r => r.name === name), p = api.resolveRemainingProfile(row.zone, row.baselineItem);
    assert.equal(p.catalogId, row.id); assert.equal(p.mode, 'replace');
    assert.equal(api.resolveRemainingProfile('garden', row.baselineItem), null);
    for (const change of [{ x: 0 }, { z: 0 }, { kind: 'pavilion' }, { name: name + '别殿' }])
      assert.equal(api.resolveRemainingProfile(row.zone, { ...row.baselineItem, ...change }), null);
  }
  for (const name of ['储秀宫', '翊坤宫', '长春宫', '景仁宫', '钟粹宫', '永和宫'])
    assert.equal(api.resolveRemainingProfile('west-six', { kind: 'hall', name, x: 0, z: 0 }), null);
});

for (const name of names) {
  test(`R48 ${name} source-bound shell changes retain unresolved furnishing and finite geometry`, () => {
    const { kit, f, item, p } = fixture(name);
    assert.equal(f.userData.structure.catalogId, p.catalogId);
    assert.equal(f.userData.structure.dimensionStatus, 'REVERSIBLE_MODEL_FIT_NOT_SURVEYED');
    assert.equal(f.userData.structure.currentInventoryVerified, false);
    assert.ok(f.userData.structure.retainedUnverified.includes('furnishings'));
    assert.equal(kit.mapItems.filter(m => m.name === name).length, 1);
    assert.ok(kit.rooms.length > 0);
    let tris = 0;
    f.traverse(m => { if (m.isMesh) { tris += (m.geometry.index?.count ?? m.geometry.attributes.position.count) / 3; for (const a of Object.values(m.geometry.attributes)) assert.ok([...a.array].every(Number.isFinite)); } });
    assert.ok(tris < 100000, `${name}: ${tris} triangles`);
    // The official description's silence does not justify deleting existing furniture.
    const old = new CourtKit(library(), p.zone); old.hall(item);
    const oldFurniture = []; old.root.traverse(m => { if (m.isMesh && ['gold', 'lacquer'].some(n => m.material?.name?.includes(n))) oldFurniture.push(m); });
    const newFurniture = []; f.traverse(m => { if (m.isMesh && ['gold', 'lacquer'].some(n => m.material?.name?.includes(n))) newFurniture.push(m); });
    assert.equal(newFurniture.length, oldFurniture.length);
  });
  for (const fps of [10, 60]) test(`R48 ${name} retains repeatable entry and exit at ${fps} Hz`, t => {
    const { item, kit, cm } = fixture(name), front = [item.x, item.z - item.d / 2 - (item.pad ?? 1) - 2];
    const inside = [item.x, item.z - 1.2], east = [item.x - item.w / 2 + 3, item.z - 1.2];
    const trace = traceTerraceGround(cm, { flights: [] });
    try { const result = replayTerrace(t, { cm, THREE }, [front, inside, east, inside, front, inside, front], { fps, sprint: false, recordFrames: true }); assert.equal(result.arrived, true, JSON.stringify({ ...result, frames: undefined })); assert.equal(trace.samples.some(s => s.source === 'rescue'), false); }
    finally { trace.restore(); }
    for (const r of kit.rooms) for (const door of r.doors) assert.equal(cm.checkCollision(new THREE.Vector3(door.x, item.ph + 1.7, door.z), .45), false);
  });
  test(`R48 ${name} survives material merging and releases every owned resource once`, () => {
    const { kit, p } = fixture(name), counts = [];
    for (const m of kit.owned) { const c = { n: 0 }; m.addEventListener('dispose', () => c.n++); counts.push(c); }
    const merged = kit.finish(); assert.ok(merged.userData.architecture.some(r => r.catalogId === p.catalogId));
    kit.dispose(merged); assert.ok(counts.length); assert.ok(counts.every(c => c.n === 1));
  });
}

test('R48 Chengqian and Jingyang have different source-specific window and ceiling families', () => {
  const c = fixture('承乾宫'), j = fixture('景阳宫');
  assert.equal(nodes(c.f, 'r48-residential-window').length, 4);
  assert.equal(nodes(j.f, 'r48-residential-window').length, 2);
  assert.ok(nodes(c.f, 'r48-residential-window').every(o => o.userData.pattern === 'double-cross-four-diamond'));
  assert.ok(nodes(j.f, 'r48-residential-window').every(o => o.userData.pattern === 'rectangular-glazing'));
  assert.equal(nodes(c.f, 'r48-residential-ceiling')[0].userData.motif, 'paired-phoenix');
  assert.equal(nodes(j.f, 'r48-residential-ceiling')[0].userData.motif, 'paired-cranes');
  assert.equal(nodes(c.f, 'r48-residential-attested-plaque')[0].userData.text, '德成柔顺');
  assert.equal(nodes(j.f, 'r48-residential-attested-plaque')[0].userData.text, '柔嘉肃敬');
});

test('R48 Yongshou has front/back central doors and diamond sill windows, unlike Xianfu rear solid wall', () => {
  const y = fixture('永寿宫'), x = fixture('咸福宫');
  assert.equal(nodes(y.f, 'r48-residential-window').length, 8);
  assert.equal(nodes(x.f, 'r48-residential-window').length, 2);
  assert.equal(nodes(x.f, 'r48-residential-rear-solid-bay').length, 2);
  assert.equal(nodes(x.f, 'r48-residential-ceiling')[0].userData.motif, 'coffer-grid');
  for (const q of [y, x]) {
    assert.equal(q.kit.rooms[0].doors.length, 2);
    const p = new THREE.Vector3(q.item.x, q.item.ph + 1.7, q.item.z + q.item.d / 2);
    assert.equal(q.cm.checkCollision(p, .45), false);
  }
});

test('R48 Yongshou rear corrects seven automatic bays to five and uses an evidenced flush hard-gable', () => {
  const { f, p } = fixture('永寿宫后殿');
  assert.equal(p.shell.bays, 5); assert.equal(p.shell.roof, 'gable'); assert.equal(p.shell.hardGableEnd, true);
  assert.equal(f.userData.structure.furniturePolicy, 'RETAIN_EXISTING_UNVERIFIED_NOT_INVENTORY');
});

test('R48 residential builder rejects altered sizes and foreign profile objects before any allocation', () => {
  assert.equal(typeof api.resolveRemainingProfile, 'function');
  const row = scope.find(r => r.name === '承乾宫'), p = api.resolveRemainingProfile(row.zone, row.baselineItem);
  for (const changed of [{ ...row.baselineItem, w: 99 }, { ...row.baselineItem, rot: 1 }, { ...row.baselineItem, name: '储秀宫' }]) {
    const kit = new CourtKit(library(), row.zone), start = kit.owned.length;
    assert.throws(() => api.buildRemainingHall(kit, changed, p), /R48 residential/);
    assert.equal(kit.root.children.length, 0); assert.equal(kit.owned.length, start);
  }
  const kit = new CourtKit(library(), row.zone);
  assert.throws(() => api.buildRemainingHall(kit, row.baselineItem, { ...p, source: 'https://example.com' }), /R48 residential/);
  assert.equal(kit.root.children.length, 0);
});
