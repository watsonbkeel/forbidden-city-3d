import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { CourtKit } from '../../src/scene/palace/kit.js';
import { CollisionManager } from '../../src/utils/Collision.js';
import { parseRot, walkStraight } from '../lib/world.mjs';

// Real CourtKit/geometry/collision; only browser texture loading is replaced,
// matching tests/lib/world.mjs. Removing a storey, closing the veranda, or
// turning a blocked bay into a door must fail these assertions.
const materials = new Map();
const lib = new Proxy({
  material: name => materials.get(name) ?? (materials.set(name, new THREE.MeshStandardMaterial({ name })), materials.get(name)),
  tileSize: () => 1,
  aspect: () => 1,
}, { get: (target, key) => key in target ? target[key] : () => null });
const mod = await import('../../src/scene/palace/special/TirenPavilion.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND' && error.message.includes('TirenPavilion.js')) return {};
  throw error;
});
const options = { x: -98.4, z: -109.3, rot: parseRot('west'), w: 44.1, d: 12, ph: 3.2, pad: 1, name: '体仁阁', plaque: false };
const nodes = (group, role) => { const found = []; group.traverse(o => { if (o.userData.role === role) found.push(o); }); return found; };
function fixture(extra = {}) {
  assert.equal(typeof mod.buildTirenPavilion, 'function', 'a distinct two-storey pavilion builder is required');
  const kit = new CourtKit(lib);
  const built = mod.buildTirenPavilion(kit, { ...options, ...extra });
  const group = built.f;
  group.updateMatrixWorld(true);
  const localToWorld = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(group.matrixWorld);
  const cm = new CollisionManager();
  cm.rivers = [];
  cm.addColliders(kit.colliders);
  cm.addWalkables(kit.walkables);
  const blocked = (x, feetY, z) => cm.checkCollision(localToWorld(x, feetY + 1.7, z), 0.5);
  return { kit, built, group, info: group.userData.pavilion, cm, localToWorld, blocked };
}

test('Tiren has two separately framed, floored structural storeys', () => {
  const { group, info } = fixture();
  assert.equal(info.storeys.length, 2);
  assert.deepEqual(info.storeys.map(s => s.bays), [9, 7]);
  assert.equal(info.storeys[0].depthBays, 3);
  assert.ok(info.storeys[1].floorY > info.storeys[0].floorY + info.storeys[0].height);
  assert.equal(nodes(group, 'storey-floor').length, 2);
  for (const s of info.storeys) {
    const columns = nodes(group, 'storey-column').filter(n => n.userData.level === s.level);
    assert.ok(columns.length >= 2 * (s.bays + 1));
    for (const c of columns) {
      c.geometry.computeBoundingBox();
      const h = c.geometry.boundingBox.max.y - c.geometry.boundingBox.min.y;
      assert.ok(Math.abs(h - s.height) < 1e-5);
      assert.ok(Math.abs(c.position.y - (s.floorY + s.height / 2)) < 1e-5);
    }
  }
});

test('upper veranda has 24 square eave supports and a continuous four-sided walkable ring', () => {
  const { group, info, kit, blocked } = fixture();
  const supports = nodes(group, 'balcony-eave-support');
  assert.equal(supports.length, 24);
  assert.equal(new Set(supports.map(s => `${s.position.x},${s.position.z}`)).size, 24);
  for (const support of supports) {
    support.geometry.computeBoundingBox();
    const size = support.geometry.boundingBox.getSize(new THREE.Vector3());
    assert.ok(Math.abs(size.x - size.z) < 1e-6, 'square section in evaluated geometry');
    assert.ok(size.x > 0.1 && size.x < 0.5);
  }
  assert.equal(nodes(group, 'balcony-deck').length, 4);
  assert.equal(nodes(group, 'balcony-railing').length, 4);
  const upper = info.storeys[1];
  const { width, depth } = info.balcony;
  const frontZ = -(depth / 2 + upper.depth / 2) / 2;
  const sideX = (width / 2 + upper.width / 2) / 2;
  assert.equal(blocked(0, upper.floorY, frontZ), false, 'front balcony must be physical clear space');
  assert.equal(blocked(sideX, upper.floorY, 0), false, 'side balcony must be physical clear space');
  assert.equal(blocked(0, upper.floorY, -frontZ), false, 'rear balcony must be physical clear space');
  assert.equal(blocked(-sideX, upper.floorY, 0), false, 'other side balcony must be physical clear space');
  const elevated = kit.walkables.filter(w => w.type === 'box' && Math.abs(w.box.max.y - upper.floorY) < 1e-5);
  assert.ok(elevated.length >= 5);
  assert.ok(elevated.every(w => w.rescue === false), 'upper floor must not teleport ground-level visitors upstairs');
});

test('lower nine bays are brick, three windows, double plank door, three windows, brick', () => {
  const { group, info, blocked } = fixture();
  const bays = nodes(group, 'lower-front-bay').sort((a, b) => a.userData.bay - b.userData.bay);
  assert.equal(bays.length, 9);
  assert.deepEqual(bays.map(b => b.userData.kind), ['brick', 'window', 'window', 'window', 'door', 'window', 'window', 'window', 'brick']);
  assert.equal(nodes(group, 'lower-door-leaf').length, 2);
  assert.equal(nodes(group, 'lower-window').length, 6);
  assert.ok(nodes(group, 'lower-window-bar').length >= 6 * 10, 'real bars, not a door texture');
  const lower = info.storeys[0];
  const endX = lower.width / 2 - lower.width / 18;
  assert.equal(blocked(0, lower.floorY, -lower.depth / 2), true, 'closed central door is solid');
  assert.equal(blocked(endX, lower.floorY, -lower.depth / 2), true);
  assert.equal(blocked(-endX, lower.floorY, -lower.depth / 2), true);
  assert.equal(blocked(lower.width / 2, lower.floorY, 0), true);
  assert.equal(blocked(0, lower.floorY, lower.depth / 2), true);
});

test('explicit entry opens only the central double door, never side or rear bays', () => {
  const { group, info, blocked } = fixture({ enter: true });
  const lower = info.storeys[0];
  assert.equal(blocked(0, lower.floorY, -lower.depth / 2), false);
  assert.equal(blocked(0, lower.floorY, 0), false);
  for (const leaf of nodes(group, 'lower-door-leaf')) assert.ok(Math.abs(leaf.rotation.y) > 1);
  assert.equal(blocked(lower.width / 2 - lower.width / 18, lower.floorY, -lower.depth / 2), true);
  assert.equal(blocked(0, lower.floorY, lower.depth / 2), true);
});

test('upper seven-bay front has 28 physical lattice leaves and solid wooden side/rear walls', () => {
  const { group, info, blocked } = fixture();
  assert.equal(nodes(group, 'upper-front-bay').length, 7);
  assert.equal(nodes(group, 'upper-lattice-leaf').length, 28);
  assert.ok(nodes(group, 'upper-lattice-bar').length > 28);
  const upper = info.storeys[1];
  assert.equal(blocked(upper.width / 2, upper.floorY, 0), true);
  assert.equal(blocked(0, upper.floorY, upper.depth / 2), true);
});

test('preserves placement, faces west, and uses a single hip roof over genuine storeys', () => {
  const { group, info } = fixture();
  assert.deepEqual(group.position.toArray(), [options.x, 0, options.z]);
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(group.quaternion);
  assert.ok(forward.x > 0.999, 'west is +X in this project');
  assert.ok(Math.abs(forward.z) < 1e-9);
  assert.equal(info.facing, 'west');
  const roof = nodes(group, 'upper-hip-roof');
  assert.equal(roof.length, 1);
  assert.equal(roof[0].userData.roofType, 'wudian');
  assert.equal(roof[0].userData.layers, 1);
  assert.equal(nodes(group, 'lower-eave-skirt').length, 1);
  assert.equal(info.dimensions.status, 'mixed-evidence');
  assert.equal(info.source, 'https://www.dpm.org.cn/explore/building/236453.html');
});


test('lower waist-roof exterior faces upward and leaves the centre open', () => {
  const { group } = fixture();
  const slopes = nodes(group, 'skirt-slope');
  assert.equal(slopes.length, 4);
  for (const slope of slopes) {
    const normals = slope.geometry.getAttribute('normal');
    for (let i = 0; i < normals.count; i++) assert.ok(normals.getY(i) > 0, 'roof exterior cannot face inward');
    const positions = slope.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      assert.ok(Math.abs(positions.getX(i)) > 20 || Math.abs(positions.getZ(i)) > 5.8, 'no centre cap masquerading as a floor');
    }
  }
});

test('veranda circulation connects its corners without rescuing visitors from the lower floor', () => {
  const { info, cm, localToWorld, blocked } = fixture({ enter: true });
  const [lower, upper] = info.storeys;
  const ground = localToWorld(0, 0, 0);
  assert.equal(cm.getGroundHeight(ground.x, ground.z, lower.floorY, 0.6), lower.floorY);
  const x = (info.balcony.width + upper.width) / 4;
  const z = (info.balcony.depth + upper.depth) / 4;
  for (const side of [-1, 1]) {
    for (let step = 0; step <= 40; step++) {
      const t = step / 40;
      assert.equal(blocked(-x + 2 * x * t, upper.floorY, side * z), false);
      assert.equal(blocked(side * x, upper.floorY, -z + 2 * z * t), false);
    }
  }
});

test('does not invent an unverified physical name plaque by default', () => {
  const { kit } = fixture({ plaque: undefined });
  assert.equal(kit.plaques.length, 0);
});


test('explicit lower central entry is reachable through either flanking front flight', () => {
  const { cm, built, info } = fixture({ enter: true });
  for (const approach of Object.values(built.geometry.approaches)) {
    let feet = 0;
    for (let i = 1; i < approach.worldPoints.length; i++) {
      const a = approach.worldPoints[i - 1], b = approach.worldPoints[i];
      const result = walkStraight({ THREE, cm }, [a.x, a.z], [b.x, b.z], { feet0: feet });
      assert.ok(result.total - result.reached < 0.06, JSON.stringify(result));
      feet = result.feet;
    }
    assert.equal(feet, info.storeys[0].floorY);
  }
});

test('explicit entry registers only the playable lower room and its west-facing central door', () => {
  const { kit, info, localToWorld } = fixture({ enter: true });
  assert.equal(kit.rooms.length, 1, 'special pavilion must retain normal room/navigation registration');
  assert.equal(kit.regions.length, 1, 'entered lower room must retain its named location region');
  const room = kit.rooms[0], region = kit.regions[0], lower = info.storeys[0];
  assert.equal(room.name, '体仁阁');
  assert.equal(region.name, '体仁阁');
  assert.equal(room.kind, 'hall');
  assert.equal(room.floorY, lower.floorY);
  assert.equal(room.min.y, lower.floorY);
  assert.ok(room.max.y <= lower.floorY + lower.height);
  assert.equal(room.doors.length, 1, 'no invented rear or upper access');
  const door = localToWorld(0, lower.floorY, -lower.depth / 2);
  assert.deepEqual(room.doors[0], { x: +door.x.toFixed(2), z: +door.z.toFixed(2) });
  assert.deepEqual([region.minX, region.maxX, region.minZ, region.maxZ],
    [room.min.x, room.max.x, room.min.z, room.max.z]);
  assert.ok(room.doors[0].x > options.x, 'central door is on the west (+X) facade');
  assert.equal(kit.rooms.some(r => r.floorY === info.storeys[1].floorY), false);
});

test('closed-reference state registers no publicly playable lower or upper room', () => {
  const { kit } = fixture({ enter: false });
  assert.equal(kit.rooms.length, 0);
  assert.equal(kit.regions.length, 0);
});
