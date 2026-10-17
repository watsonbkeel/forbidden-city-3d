import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { PalaceBuilder } from '../src/scene/PalaceBuilder.js';
import { CollisionManager } from '../src/utils/Collision.js';
import { LAYOUT, PLAYER } from '../src/config/constants.js';
import { replayGateTower } from './lib/gate-tower-walk.mjs';

// Missing implementation is an explicit feature assertion, not an import crash.
const modules = await Promise.all([
  import('../src/scene/palace/special/WumenAscentProfile.js'),
  import('../src/scene/palace/special/WumenAscent.js'),
]).catch(error => ({ error }));
test('Wumen has an isolated three-flight source profile and normal builder', () => {
  assert.ok(Array.isArray(modules), `Missing folded ascent implementation: ${modules.error?.message}`);
});
if (Array.isArray(modules)) {
  const [{ WUMEN_ASCENT_PROFILE: P, wumenAscentGeometry }, { buildWumenAscent }] = modules;
  function fixture(x = 0, z = LAYOUT.WUMEN_Z) {
    const materials = new Map();
    const library = { material(name, params = {}) { const key = name + JSON.stringify(params); if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ name, ...params })); return materials.get(key); }, tileSize: () => 1 };
    const builder = new PalaceBuilder(new THREE.Scene(), library);
    builder.ox = x; builder.oz = z;
    const group = new THREE.Group();
    const result = buildWumenAscent(builder, group);
    const cm = new CollisionManager(); cm.addColliders(builder.colliders); cm.addWalkables(builder.walkables);
    return { THREE, builder, group, result, cm, materials };
  }
  const G = wumenAscentGeometry();
  const close = (a, b, message = '') => assert.ok(Math.abs(a - b) < 1e-8, `${message}: ${a} != ${b}`);
  test('documentary dimensions stay separate from finite engineering registration and retained anchors', () => {
    assert.match(P.status, /NOT_MEASURED_2026/);
    assert.deepEqual(P.documentary.horizontalLengths, [15.3, 25.59, 25.5]);
    assert.equal(P.documentary.firstWidth, 6.2);
    assert.deepEqual(P.fit.flightRuns, [15.3, 25.5, 25.5]);
    assert.deepEqual(P.fit.floorLevels, [0, 3.3, 10, 12.3]);
    assert.equal(P.fit.terminalLandingLength, 6.2);
    assert.equal(P.retained.platformHalfWidth, 60);
    assert.equal(P.retained.platformSouth, -13.3);
    assert.equal(P.retained.platformNorth, 18.6);
    assert.equal(P.retained.worldAnchorZ, LAYOUT.WUMEN_Z);
    assert.ok(Object.isFrozen(P) && Object.isFrozen(P.fit));
    assert.ok(P.sources.every(source => source.url.startsWith('https://')));
    assert.match(P.limitations.join(' '), /step|tread/i);
  });
  test('each mirrored route enters from north, turns out, folds back, and reaches original platform', () => {
    assert.equal(G.sides.length, 2);
    for (const side of G.sides) {
      assert.equal(side.flights.length, 3); assert.equal(side.landings.length, 3);
      const [first, middle, upper] = side.flights;
      assert.deepEqual(side.flights.map(f => f.axis), ['z', 'x', 'x']);
      close(first.a0 - first.a1, 15.3);
      assert.ok((middle.a1 - middle.a0) * side.sign > 0);
      assert.ok((upper.a1 - upper.a0) * side.sign < 0);
      for (const f of side.flights) assert.ok((f.y1 - f.y0) / Math.abs(f.a1 - f.a0) < .27);
      assert.deepEqual(side.flights.map(f => [f.y0, f.y1]), [[0, 3.3], [3.3, 10], [10, 12.3]]);
      assert.equal(side.route.at(-1)[0], side.sign * 58);
      assert.ok(side.route[0][1] > 25.15);
    }
    for (let i = 0; i < G.sides[0].route.length; i++) {
      close(G.sides[0].route[i][0], -G.sides[1].route[i][0]);
      close(G.sides[0].route[i][1], G.sides[1].route[i][1]);
    }
  });
  test('axis-aware world registration translates both ramp types and every landing exactly once', () => {
    const a = fixture(0, 0), b = fixture(7, -419.6);
    assert.equal(a.builder.walkables.length, 13);
    assert.equal(a.builder.walkables.filter(w => w.type === 'ramp').length, 6);
    for (let i = 0; i < a.builder.walkables.length; i++) {
      const u = a.builder.walkables[i], v = b.builder.walkables[i];
      if (u.type === 'box') {
        assert.equal(v.rescue, false);
        close(v.box.min.x - u.box.min.x, 7); close(v.box.max.z - u.box.max.z, -419.6);
        close(v.box.max.y, u.box.max.y);
      } else {
        assert.equal(v.axis, u.axis);
        close(v.a0 - u.a0, u.axis === 'x' ? 7 : -419.6);
        close(v.a1 - u.a1, u.axis === 'x' ? 7 : -419.6);
        close(v.minX - u.minX, 7); close(v.minZ - u.minZ, -419.6);
        close(v.y0, u.y0); close(v.y1, u.y1);
      }
    }
    for (let i = 0; i < a.builder.colliders.length; i++) {
      assert.ok(a.builder.colliders[i].clone().translate(new THREE.Vector3(7, 0, -419.6)).equals(b.builder.colliders[i]));
    }
  });
  test('all supports have visible masonry/treads at the declared surface; no invisible bridge', () => {
    const f = fixture(0, 0); f.group.updateMatrixWorld(true);
    const ray = new THREE.Raycaster();
    for (const side of G.sides) {
      for (const flight of side.flights) for (const t of [.08, .27, .51, .83, .98]) {
        const a = flight.a0 + (flight.a1 - flight.a0) * t;
        const x = flight.axis === 'x' ? a : (flight.minX + flight.maxX) / 2;
        const z = flight.axis === 'z' ? a : (flight.minZ + flight.maxZ) / 2;
        const support = flight.y0 + (flight.y1 - flight.y0) * t;
        ray.set(new THREE.Vector3(x, 30, z), new THREE.Vector3(0, -1, 0));
        const hits = ray.intersectObject(f.result.group, true);
        assert.ok(hits.length > 0, flight.id);
        assert.ok(hits[0].point.y >= support - .01 && hits[0].point.y <= support + .19, `${flight.id}: support ${support}, mesh ${hits[0].point.y}`);
      }
      for (const landing of side.landings) {
        const x = (landing.minX + landing.maxX) / 2, z = (landing.minZ + landing.maxZ) / 2;
        ray.set(new THREE.Vector3(x, 30, z), new THREE.Vector3(0, -1, 0));
        close(ray.intersectObject(f.result.group, true)[0].point.y, landing.y, landing.id);
      }
    }
  });
  test('new meshes have finite UVs, unit normals, shared library materials, and disposable geometry', () => {
    const f = fixture(); const geometries = new Set();
    f.result.group.traverse(mesh => {
      if (!mesh.isMesh) return;
      assert.ok([...f.materials.values()].includes(mesh.material));
      assert.equal(mesh.visible, true); assert.equal(mesh.castShadow, true); assert.equal(mesh.receiveShadow, true);
      const { position, normal, uv } = mesh.geometry.attributes;
      assert.ok(position && normal && uv); assert.equal(uv.count, position.count);
      for (const attribute of [position, normal, uv]) assert.ok(Array.from(attribute.array).every(Number.isFinite));
      for (let i = 0; i < normal.count; i++) assert.ok(Math.abs(Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i)) - 1) < 1e-5);
      geometries.add(mesh.geometry);
    });
    let disposed = 0; for (const geometry of geometries) { geometry.addEventListener('dispose', () => disposed++); geometry.dispose(); }
    assert.equal(disposed, geometries.size);
    assert.equal(f.builder.ownedMaterials.length, 0);
  });
  test('finite candidate budget stays near the measured old 150 mesh / 1784 triangle / 304 collider ascent', () => {
    const f = fixture(); let meshes = 0, triangles = 0;
    f.result.group.traverse(o => { if (o.isMesh) { meshes++; triangles += (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3; } });
    assert.deepEqual(f.result.counts, { meshes, triangles, colliders: f.builder.colliders.length, walkables: f.builder.walkables.length });
    assert.ok(meshes <= 190, String(meshes)); assert.ok(triangles <= 2300, String(triangles));
    assert.ok(f.builder.colliders.length <= 304, String(f.builder.colliders.length));
  });
  test('outer edges and folded-flight separator block ordinary crossing while top openings remain usable', () => {
    const f = fixture();
    for (const sign of [-1, 1]) {
      const x = sign * 80, localZ = 6.75;
      const y = 3.3 + (80 - 66.2) / 25.5 * 6.7;
      for (const targetZ of [1, 12]) {
        const from = new THREE.Vector3(x, y + PLAYER.HEIGHT, localZ + LAYOUT.WUMEN_Z);
        const target = from.clone(); target.z = targetZ + LAYOUT.WUMEN_Z;
        const valid = f.cm.getValidPosition(from, target, .5, y, .6);
        assert.ok(Math.abs(valid.z - target.z) > 1, `crossed barrier at ${sign}/${targetZ}`);
      }
      assert.equal(f.cm.checkCollision(new THREE.Vector3(sign * 59.7, 12.3 + PLAYER.HEIGHT, .1 + LAYOUT.WUMEN_Z), .5), false);
      assert.equal(f.cm.checkCollision(new THREE.Vector3(sign * 59.7, 12.3 + PLAYER.HEIGHT, 8 + LAYOUT.WUMEN_Z), .5), true);
    }
    assert.equal(f.cm.getGroundHeight(0, LAYOUT.WUMEN_Z, 0, .6), 0, 'ground portal must not rescue to terrace');
  });
  test('retained visible abutment faces block airborne entry from the new low approach', () => {
    const f = fixture();
    for (const sign of [-1, 1]) for (const localZ of [6.75, 12, 16]) {
      const x = sign * 63.1, z = localZ + LAYOUT.WUMEN_Z;
      const ground = f.cm.getGroundHeight(x, z, 12.3, .6), airFeet = ground + 1.75;
      const start = new THREE.Vector3(x, airFeet + PLAYER.HEIGHT, z), target = start.clone(); target.x = sign * 58;
      const valid = f.cm.getValidPosition(start, target, .5, ground, .6, airFeet);
      assert.ok(Math.abs(valid.x) >= 60.5 - 1e-8, `entered solid abutment: side=${sign}, z=${localZ}, end=${valid.x}`);
    }
    for (const sign of [-1, 1]) {
      const start = new THREE.Vector3(sign * 63.1, 12.3 + PLAYER.HEIGHT, .1 + LAYOUT.WUMEN_Z), target = start.clone(); target.x = sign * 58;
      const valid = f.cm.getValidPosition(start, target, .5, 12.3, .6);
      close(valid.x, target.x, 'upper return opening must remain open');
    }
  });
  test('finite jump apex cannot vault the four wall-adjacent boundary types on either side', () => {
    const f = fixture();
    const apex = PLAYER.JUMP_VELOCITY ** 2 / (2 * PLAYER.GRAVITY);
    const probes = [
      { name: 'return-south', from: [80, .1], to: [80, -5] },
      { name: 'terminal-south', from: [63.1, .1], to: [63.1, -5] },
      { name: 'outer-fold-south', from: [94.8, .1], to: [94.8, -5] },
      { name: 'outer-fold-end', from: [94.8, -1.1], to: [100, -1.1] },
    ];
    for (const sign of [-1, 1]) for (const probe of probes) {
      const x = sign * probe.from[0], z = probe.from[1] + LAYOUT.WUMEN_Z;
      const ground = f.cm.getGroundHeight(x, z, 12.3, .6), airFeet = ground + apex;
      const start = new THREE.Vector3(x, airFeet + PLAYER.HEIGHT, z);
      const target = new THREE.Vector3(sign * probe.to[0], start.y, probe.to[1] + LAYOUT.WUMEN_Z);
      const valid = f.cm.getValidPosition(start, target, .5, ground, .6, airFeet);
      if (probe.name === 'outer-fold-end') assert.ok(Math.abs(valid.x) <= 96.95 + 1e-8, `vaulted ${sign}/${probe.name}: ${valid.x}`);
      else assert.ok(valid.z - LAYOUT.WUMEN_Z >= -2.05 - 1e-8, `vaulted ${sign}/${probe.name}: ${valid.z - LAYOUT.WUMEN_Z}`);
    }
    assert.equal(P.gameplaySafety.noVaultExtension, 1.5);
    assert.deepEqual(P.gameplaySafety.boundaries, probes.map(probe => probe.name));
    assert.match(P.gameplaySafety.classification, /VIRTUAL/);
    assert.equal(f.result.counts.colliders, 268);
    assert.equal(f.result.counts.meshes, 182);
    assert.equal(f.result.counts.triangles, 2160);
  });
  for (const sign of [-1, 1]) for (const fps of [60, 10]) for (const sprint of [false, true]) for (const backward of [false, true]) {
    test(`real controller folded ascent roundtrip: side=${sign}, ${fps}Hz, sprint=${sprint}, backward=${backward}`, t => {
      const f = fixture(); const route = G.sides.find(s => s.sign === sign).route;
      const points = [...route, ...route.slice(0, -1).reverse()].map(([x, z]) => [x, z + LAYOUT.WUMEN_Z]);
      const result = replayGateTower(t, f, points, { startFeet: 0, fps, sprint, backward });
      const compact = { arrived: result.arrived, end: result.end, stuckAt: result.stuckAt, maxFeet: result.maxFeet, bodyCollisions: result.logicalBodyCollisionFrames.slice(0, 2) };
      assert.equal(result.arrived, true, JSON.stringify(compact)); close(result.end[2], 0);
      assert.ok(result.maxFeet >= 12.29); assert.equal(result.logicalBodyCollisionFrames.length, 0, JSON.stringify(compact));
      assert.ok(result.supportQueries.every(q => q.source !== 'rescue' && q.source !== 'unverified'));
      assert.equal(result.driver.crossings.length, points.length - 1);
    });
  }
}
