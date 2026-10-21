import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import * as THREE from 'three';
import { CourtKit } from '../src/scene/palace/kit.js';
import { CollisionManager } from '../src/utils/Collision.js';

const url = new URL('../src/scene/palace/special/YanxiRuin.js', import.meta.url);
const api = existsSync(url) ? await import(url) : {};
const ctx = new Proxy({}, { get: () => () => ({ data: [] }), set: () => true });
globalThis.document ??= { createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }) };
const ITEM = { kind: 'hall', name: '延禧宫', structure: 'yanxi-ruin', ruinProfile: 'lingzhao-current', x: -148.2, z: 324.9, w: 16.3, d: 11.7 };
const near = (a, b, note = '') => assert.ok(Math.abs(a - b) < 1e-5, `${note}: ${a} != ${b}`);
const nodes = (root, role) => { const out = []; root.traverse(o => { if (o.userData.role === role) out.push(o); }); return out; };
function library() {
  const materials = new Map();
  return { materials, tileSize: () => 1, aspect: () => 1, material: n => {
    if (!materials.has(n)) materials.set(n, new THREE.MeshStandardMaterial({ name: n }));
    return materials.get(n);
  } };
}
function fixture(change = {}) {
  assert.equal(typeof api.buildYanxiRuin, 'function', 'dedicated ruin builder must exist');
  const lib = library(), kit = new CourtKit(lib), built = api.buildYanxiRuin(kit, { ...ITEM, ...change });
  kit.root.updateMatrixWorld(true);
  const cm = new CollisionManager(); cm.rivers = []; cm.addColliders(kit.colliders); cm.addWalkables(kit.walkables);
  return { ...built, root: built.f, lib, kit, cm };
}
const ray = (root, p, d, far = 100) => new THREE.Raycaster(new THREE.Vector3(...p), new THREE.Vector3(...d), 0, far).intersectObject(root, true);

test('present-day profile is explicit, registered, and distinguishes southern hexagons from northern octagons', () => {
  const { g, root, kit } = fixture();
  assert.equal(g.id, 'east-six/yanxi-ruin'); assert.equal(g.profile, 'lingzhao-current');
  assert.deepEqual([g.x, g.z, g.core.w, g.core.d], [-148.2, 324.9, 16.3, 11.7]);
  assert.deepEqual(g.cornerPavilions.filter(p => p.z < 0).map(p => p.sides), [6, 6]);
  assert.deepEqual(g.cornerPavilions.filter(p => p.z > 0).map(p => p.sides), [8, 8]);
  assert.equal(g.centralPavilion.sides, 8); assert.equal(g.centralPavilion.tiers, 2);
  assert.equal(root.userData.structure.dimensionStatus, 'registered-envelope-photo-fit-not-survey');
  assert.equal(kit.rooms.length, 0); assert.equal(kit.walkables.length, 0);
  assert.equal(kit.mapItems.length, 1); assert.equal(kit.mapItems[0].name, '延禧宫');
  assert.equal(kit.mapItems[0].navigation.mode, 'exterior-view');
  assert.ok(Object.isFrozen(api.YANXI_RUIN_PROFILE));
});

test('malformed profile, anchor drift, and generic palace overrides fail before registration', () => {
  assert.equal(typeof api.buildYanxiRuin, 'function');
  for (const change of [{ structure: 'hall' }, { ruinProfile: 'completed-crystal-palace' }, { x: -148 }, { z: NaN },
    { w: 17 }, { d: Infinity }, { rot: null }, { rot: 'east' }, { roof: 'xieshan' }, { enter: true },
    { throne: true }, { interior: 'A:palace-front' }, { colH: 6.72 }, { layers: 2 }]) {
    const kit = new CourtKit(library());
    assert.throws(() => api.buildYanxiRuin(kit, { ...ITEM, ...change }), /Yanxi|profile|anchor|generic|dimension|rotation/i);
    assert.equal(kit.root.children.length, 0); assert.equal(kit.colliders.length, 0);
  }
});

test('polygonal corner joins close the masonry enclosure above the openings without internal cross-walls', () => {
  const { root } = fixture();
  for (let i = 0; i < 180; i++) {
    const a = i * Math.PI / 90, direction = [Math.cos(a), 0, Math.sin(a)];
    assert.ok(ray(root, [ITEM.x, 4.0, ITEM.z], direction, 10).some(h => h.object.userData.role === 'yanxi-masonry-arch-wall'), `unintended corner-join gap at ${i * 2} degrees`);
  }
});

test('actual ruin has pale masonry, exposed iron, five pavilion structures, and no broad tiled roof or throne', () => {
  const { root } = fixture();
  assert.equal(nodes(root, 'yanxi-corner-pavilion').length, 4);
  assert.equal(nodes(root, 'yanxi-central-pavilion').length, 1);
  assert.equal(nodes(root, 'yanxi-exterior-iron-column').length, 18);
  assert.equal(nodes(root, 'yanxi-interior-iron-column').length, 4);
  assert.ok(nodes(root, 'yanxi-masonry-arch-wall').length >= 8);
  assert.ok(nodes(root, 'yanxi-exposed-beam').length >= 8);
  assert.ok(nodes(root, 'yanxi-central-surviving-cap').length > 0);
  const forbidden = [];
  root.traverse(o => { if (/roof_tile|kit_roof|throne|宝座|歇山|庑殿/.test(`${o.name} ${o.material?.name ?? ''}`)) forbidden.push(o.name); });
  assert.deepEqual(forbidden, []);
  // Probe real sky openings above the main upper-level structural grid.
  for (const [x, z] of [[3.1, 2.1], [-3.1, 2.1], [3.1, -2.1], [-3.1, -2.1]]) {
    const hits = ray(root, [ITEM.x + x, 15, ITEM.z + z], [0, -1, 0]);
    assert.equal(hits.some(h => h.point.y > 5.1), false, `no invented finished upper roof at ${x}/${z}`);
  }
});

test('front arch apertures are real through-holes, with visible intrados rather than black decals', () => {
  const { g, root } = fixture();
  const facade = nodes(root, 'yanxi-masonry-arch-wall').find(m => m.userData.wallId === 'main-south');
  assert.ok(facade);
  for (const sign of [-1, 1]) {
    assert.equal(ray(facade, [ITEM.x, 1.8, ITEM.z + g.body.frontZ + sign], [0, 0, -sign], 2).length, 0);
    assert.ok(ray(facade, [ITEM.x + 2.0, 1.8, ITEM.z + g.body.frontZ + sign], [0, 0, -sign], 2).length);
    assert.equal(ray(facade, [ITEM.x + g.body.windowX, 2.4, ITEM.z + g.body.frontZ + sign], [0, 0, -sign], 2).length, 0);
  }
  assert.ok(ray(facade, [ITEM.x, 1.8, ITEM.z + g.body.frontZ], [0, 1, 0], 3).length, 'arched opening has an actual underside');
  const merged = fixture(); const mesh = merged.kit.finish(); mesh.updateMatrixWorld(true);
  assert.ok(ray(mesh, [ITEM.x, 1.8, ITEM.z + g.body.frontZ], [0, 1, 0], 3).length, 'intrados survives material merge');
  merged.kit.dispose(mesh);
});

test('pool floor lies below grade, bank is physical, and public-ground routes cannot cross its visible safety boundary', () => {
  const { g, root, cm, kit } = fixture();
  assert.equal(g.pool.waterState, 'dry-unfilled-preview');
  const floor = nodes(root, 'yanxi-dry-pool-floor')[0];
  const hits = ray(floor, [ITEM.x + 9, 5, ITEM.z], [0, -1, 0]);
  assert.ok(hits.length); near(hits[0].point.y, g.pool.bottomY);
  near(api.YANXI_RUIN_GROUND_CUTOUT.w, g.pool.w); near(api.YANXI_RUIN_GROUND_CUTOUT.d, g.pool.d);
  assert.equal(nodes(root, 'yanxi-pool-retaining-wall').length, 4);
  assert.equal(nodes(root, 'yanxi-safety-boundary').length, 4);
  const [hx, hz] = [g.pool.guardW / 2, g.pool.guardD / 2];
  for (const sign of [-1, 1]) {
    for (let x = -hx; x <= hx; x += .5) assert.ok(cm.checkCollision(new THREE.Vector3(ITEM.x + x, 1.7, ITEM.z + sign * hz), .5));
    for (let z = -hz; z <= hz; z += .5) assert.ok(cm.checkCollision(new THREE.Vector3(ITEM.x + sign * hx, 1.7, ITEM.z + z), .5));
    for (const p of [[0, sign * (hz + 1.5)], [sign * (hx + 1.5), 0]]) {
      assert.equal(cm.checkCollision(new THREE.Vector3(ITEM.x + p[0], 1.7, ITEM.z + p[1]), .5), false);
      near(cm.getGroundHeight(ITEM.x + p[0], ITEM.z + p[1], 0), 0);
    }
  }
  assert.equal(kit.walkables.length, 0, 'no invisible pool cover, rescue plane, or invented public interior route');
  const n = api.YANXI_RUIN_NAVIGATION;
  assert.equal(cm.checkCollision(new THREE.Vector3(n.position.x, 1.7, n.position.z), .5), false);
  assert.ok(n.position.z < ITEM.z - hz - 1);
});

test('role-counted actual geometry is finite, nondegenerate, bounded, and within the explicit local budget', () => {
  const { root, g, kit } = fixture();
  let count = 0, meshes = 0;
  root.traverse(m => {
    if (!m.isMesh) return; meshes++; assert.ok(m.userData.role, m.name);
    for (const a of Object.values(m.geometry.attributes)) assert.ok([...a.array].every(Number.isFinite), m.name);
    const p = m.geometry.attributes.position, ix = m.geometry.index; count += (ix?.count ?? p.count) / 3;
    for (let i = 0; i < (ix?.count ?? p.count); i += 3) {
      const v = [0, 1, 2].map(k => new THREE.Vector3().fromBufferAttribute(p, ix ? ix.getX(i + k) : i + k));
      assert.ok(v[1].sub(v[0]).cross(v[2].sub(v[0])).length() > 1e-9, `${m.name} degenerate triangle ${i / 3}`);
    }
  });
  assert.ok(count <= 12000, `${count} triangles exceeds 12000 local cap`);
  assert.ok(meshes <= 650, `${meshes} meshes exceeds 650 pre-merge cap`);
  near(root.userData.structure.roleBudget.triangleInstances, count);
  near(Object.values(root.userData.structure.roleBudget.roles).reduce((n, r) => n + r.triangleInstances, 0), count);
  const b = new THREE.Box3().setFromObject(root);
  assert.ok(b.min.x >= ITEM.x - g.pool.guardW / 2 - .3 && b.max.x <= ITEM.x + g.pool.guardW / 2 + .3);
  assert.ok(b.min.z >= ITEM.z - g.pool.guardD / 2 - .3 && b.max.z <= ITEM.z + g.pool.guardD / 2 + .3);
  const merged = kit.finish(); assert.ok(merged.children.length <= 5, 'maximum five material draw buckets');
  assert.equal(merged.userData.architecture.length, 1); assert.equal(merged.userData.architecture[0].id, g.id);
  kit.dispose(merged);
});

test('merge and unload dispose owned geometries/materials exactly once without leaking shared library material', () => {
  for (let cycle = 0; cycle < 2; cycle++) {
    const { root, lib, kit } = fixture(), counts = new Map();
    const watch = r => { if (counts.has(r)) return; counts.set(r, 0); r.addEventListener('dispose', () => counts.set(r, counts.get(r) + 1)); };
    root.traverse(o => { if (o.geometry) watch(o.geometry); }); const source = [...counts.keys()];
    const owned = [...kit.owned]; owned.forEach(watch); const shared = [...lib.materials.values()]; shared.forEach(watch);
    const merged = kit.finish(); source.forEach(g => assert.equal(counts.get(g), 1));
    const dest = []; merged.traverse(o => { if (o.geometry) { dest.push(o.geometry); watch(o.geometry); } });
    kit.dispose(merged); [...owned, ...dest].forEach(r => assert.equal(counts.get(r), 1));
    shared.forEach(r => assert.equal(counts.get(r), 0)); assert.equal(kit.colliders.length, 0);
  }
});
