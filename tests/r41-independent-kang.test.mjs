import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from 'three';
import { CourtKit } from '../src/scene/palace/kit.js';
import { buildChuxiuHall } from '../src/scene/palace/special/ChuxiuHall.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { library } from './lib/inner-palace-fixture.mjs';

const config = JSON.parse(readFileSync(new URL('../data/zones/west-six.json', import.meta.url)));
const item = config.items.find(i => i.name === '储秀宫' && i.kind === 'hall');
// Independently generated from git show cd1c843:src/scene/palace/special/ChuxiuHall.js,
// not from the mutable working tree, after the production finish() merge.
const baselineMergedHash = '6b300ab4975d4573e9bab6fd8417825eb49839fd3cb630f41e34ebecd6ac2ea7';
const expected = [
  ['west-next-north', 5.42, 4.9, 4.1, 2.4],
  ['west-next-south', 5.42, -3.7, 4.1, 1.8],
  ['west-end-south', 10.84, -3.7, 3.8, 1.8],
];
const source = 'https://www.dpm.org.cn/Uploads/File/2024/07/22/u669dcd8dc5647.pdf';
function fixture() {
  const kit = new CourtKit(library(), 'west-six');
  const built = buildChuxiuHall(kit, item);
  kit.root.updateMatrixWorld(true);
  const kangs = [];
  kit.root.traverse(o => { if (o.userData.role === 'chuxiu-restored-kang') kangs.push(o); });
  return { kit, kangs, ...built };
}
function geometryRows(geo, material) {
  const p = geo.attributes.position, idx = geo.index, rows = [];
  for (let n = 0; n < (idx?.count ?? p.count); n++) {
    const i = idx ? idx.getX(n) : n;
    rows.push(JSON.stringify([material, ...Object.keys(geo.attributes).sort().map(k => {
      const a = geo.attributes[k];
      return [k, ...Array.from(a.array.subarray(i * a.itemSize, (i + 1) * a.itemSize))];
    })]));
  }
  return rows;
}
function multiset(rows) {
  const out = new Map();
  for (const row of rows) out.set(row, (out.get(row) ?? 0) + 1);
  return out;
}

test('R41 independent merged vertices add only three exact fitted boxes and retain every R40 attribute', () => {
  const { kit, kangs } = fixture();
  assert.equal(kangs.length, 3);
  const merged = kit.finish(), rows = [];
  merged.traverse(m => { if (m.isMesh) rows.push(...geometryRows(m.geometry, m.material.name)); });
  assert.equal(rows.length, 28026 + 3 * 36);
  const remaining = multiset(rows);
  for (const [, x, z, w, d] of expected) {
    const geo = new THREE.BoxGeometry(w, .45, d).toNonIndexed();
    geo.applyMatrix4(new THREE.Matrix4().makeTranslation(item.x + x, item.ph + .225, item.z + z));
    for (const row of geometryRows(geo, 'chuxiu_zitan_fit')) {
      const count = remaining.get(row) ?? 0;
      assert.ok(count > 0, 'expected world vertex, normal and UV are present after material merge');
      if (count === 1) remaining.delete(row); else remaining.set(row, count - 1);
    }
    geo.dispose();
  }
  const retained = [...remaining].flatMap(([row, count]) => Array(count).fill(row)).sort();
  assert.equal(crypto.createHash('sha256').update(JSON.stringify(retained)).digest('hex'), baselineMergedHash);
  const record = merged.userData.architecture.find(r => r.id === 'west-six/chuxiu-household').restoredDisplay;
  assert.equal(record.source, source);
  assert.equal(record.sourcePage, 265);
  assert.equal(record.currentInventoryVerified, false);
  assert.equal(record.state, '1971_RESTORED_DISPLAY_DESCRIBED_IN_1982_NOT_2026_INVENTORY');
  assert.equal(record.geometryStatus, 'PLAIN_KANG_VOLUMES_NOT_MATCHED_PHOTO_OR_CARVING');
  assert.match(record.limitations.join(' '), /Figures\s*11 and\s*12.*neither is a matched western-kang photograph/);
  assert.deepEqual(record.components.map(c => [c.id, c.x, c.z, c.w, c.d]), expected);
  kit.dispose(merged);
});

test('R41 independent low-kang contacts match all four visible faces and do not extend into the adjacent floor', () => {
  const { kit, kangs } = fixture();
  const cm = new CollisionManager();
  cm.rivers = [];
  cm.addColliders(kit.colliders);
  cm.addWalkables(kit.walkables);
  for (const [id, x, z, w, d] of expected) {
    const mesh = kangs.find(m => m.userData.id === id);
    assert.ok(mesh, id);
    const worldX = item.x + x, worldZ = item.z + z;
    const top = new THREE.Raycaster(new THREE.Vector3(worldX, item.ph + 1, worldZ), new THREE.Vector3(0, -1, 0), 0, 1).intersectObject(mesh)[0];
    assert.ok(top, 'visible top surface exists');
    assert.ok(Math.abs(top.point.y - (item.ph + .45)) < 1e-6);
    assert.ok(Math.abs(cm.supportHeight(worldX, worldZ, item.ph + .5, .01) - top.point.y) < 1e-6);
    for (const [axis, half, other] of [['x', w / 2, d / 2], ['z', d / 2, w / 2]]) {
      for (const sign of [-1, 1]) for (const fraction of [-.8, 0, .8]) {
        const location = inset => axis === 'x'
          ? new THREE.Vector3(worldX + sign * (half + inset), item.ph + 1.7, worldZ + fraction * other)
          : new THREE.Vector3(worldX + fraction * other, item.ph + 1.7, worldZ + sign * (half + inset));
        assert.equal(cm.checkCollision(location(-.04), .01), true, `${id} ${axis} ${sign} interior contact`);
        assert.equal(cm.checkCollision(location(.04), .01), false, `${id} ${axis} ${sign} exterior clearance`);
      }
    }
  }
  kit.dispose(kit.finish());
});

test('R41 independent repeated merge/disposal releases kang geometry once without new material ownership', () => {
  for (let run = 0; run < 3; run++) {
    const { kit, kangs } = fixture(), watched = new Map();
    const watch = resource => {
      if (watched.has(resource)) return;
      watched.set(resource, 0);
      resource.addEventListener('dispose', () => watched.set(resource, watched.get(resource) + 1));
    };
    assert.equal(kit.owned.length, 16, 'no new per-kang material ownership');
    const shared = kit.owned.find(m => m.name === 'chuxiu_zitan_fit');
    for (const m of kangs) { assert.equal(m.material, shared); watch(m.geometry); }
    for (const m of kit.owned) { watch(m); if (m.map && m.name.startsWith('chuxiu_')) watch(m.map); }
    const merged = kit.finish();
    assert.equal(kit.owned.length, 17, 'only the unchanged plaque atlas is added during finish');
    for (const m of kangs) assert.equal(watched.get(m.geometry), 1, 'source kang geometry released by merge');
    for (const m of kit.owned) watch(m);
    for (const tex of kit.ownedTextures ?? []) watch(tex);
    merged.traverse(m => { if (m.geometry) watch(m.geometry); });
    kit.dispose(merged);
    for (const [resource, count] of watched) assert.equal(count, 1, resource.name || resource.type);
    assert.equal(kit.colliders.length, 0);
    assert.equal(kit.walkables.length, 0);
  }
});
