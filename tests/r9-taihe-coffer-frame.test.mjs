import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import fs from 'node:fs';
import { captureTaiheControl, hash } from './lib/taihe-core-fixture.mjs';
import { TAIHE_CORE as P } from '../src/scene/palace/special/TaiheCoreProfile.js';
import { TAIHE_COFFER_TRIAL as Q, taiheCofferBars, taiheCofferBarGeometry, buildTaiheCofferFrame } from '../src/scene/palace/special/TaiheCofferFrame.js';
import { mergeByMaterial } from '../src/utils/MergeUtils.js';

test('bounded central coffer candidate declares all 280 added triangles and buffer allocation', () => {
  let triangles = 0, bytes = 0;
  const bars = taiheCofferBars(); assert.equal(bars.length, 28);
  for (const bar of bars) {
    const g = taiheCofferBarGeometry(bar); triangles += g.index.count / 3;
    bytes += g.index.array.byteLength + Object.values(g.attributes).reduce((n, a) => n + a.array.byteLength, 0);
    g.computeBoundingBox(); const b = g.boundingBox;
    assert.ok(b.min.x >= P.columns.x[0] - 1e-5 && b.max.x <= P.columns.x[1] + 1e-5);
    assert.ok(b.min.z >= P.columns.redCompanionZ - 1e-5 && b.max.z <= P.columns.goldZ.at(-1) + 1e-5);
    assert.ok(Math.abs(b.min.y - (P.ceilingY - Q.drop)) < 1e-5);
    assert.ok(Math.abs(b.max.y - P.ceilingY) < 1e-5); g.dispose();
  }
  assert.equal(triangles, 280); assert.equal(bytes, 23184);
  assert.equal(P.budgets.sVisibleTriangles, 18000); // unchanged core cap, no claimed total saving
});

test('no bar intrudes into the retained caisson opening or plaque envelope', () => {
  const h = P.caisson.nominalSpan / 2;
  for (const bar of taiheCofferBars()) {
    const g = taiheCofferBarGeometry(bar); g.computeBoundingBox(); const b = g.boundingBox;
    const overlapX = Math.min(b.max.x, h) - Math.max(b.min.x, -h);
    const overlapZ = Math.min(b.max.z, P.caisson.z + h) - Math.max(b.min.z, P.caisson.z - h);
    assert.ok(overlapX < 1e-5 || overlapZ < 1e-5);
    assert.ok(b.min.y > P.plaque.bottomY + P.plaque.height); g.dispose();
  }
});

test('all retained faces are finite, nondegenerate and outward, with real side and underside faces', () => {
  for (const bar of taiheCofferBars()) {
    const g = taiheCofferBarGeometry(bar), p = g.attributes.position, n = g.attributes.normal;
    for (const a of Object.values(g.attributes)) assert.ok([...a.array].every(Number.isFinite));
    const normals = new Set();
    for (let i = 0; i < g.index.count; i += 3) {
      const ids = [0, 1, 2].map(j => g.index.getX(i + j));
      const [a, b, c] = ids.map(k => new THREE.Vector3().fromBufferAttribute(p, k));
      const normal = new THREE.Vector3().fromBufferAttribute(n, ids[0]);
      assert.ok(b.sub(a).cross(c.sub(a)).dot(normal) > 1e-8);
      assert.ok(normal.y < .99); normals.add(normal.toArray().join(','));
    }
    assert.equal(normals.size, 5); assert.ok(normals.has('0,-1,0')); g.dispose();
  }
});

test('crossing undersides use identical global artwork coordinates and normals', () => {
  for (const bar of taiheCofferBars()) {
    const g = taiheCofferBarGeometry(bar), { position: p, normal: n, uv } = g.attributes;
    for (let i = 0; i < p.count; i++) if (n.getY(i) < -.99) {
      assert.ok(Math.abs(uv.getX(i) - p.getX(i) / Q.cadence) < 1e-5);
      assert.ok(Math.abs(uv.getY(i) - p.getZ(i) / Q.cadence) < 1e-5);
    }
    g.dispose();
  }
});

test('new frames share the retained ceiling material/texture and merge into its existing batch', () => {
  const { builder, group } = captureTaiheControl('太和殿');
  const frames = group.children.filter(o => o.userData.taihePermanent === 'coffer-frame');
  const panels = group.children.filter(o => o.userData.taihePermanent === 'ceiling');
  assert.equal(frames.length, 28); assert.equal(panels.length, 4);
  assert.ok(frames.every(o => o.material === panels[0].material));
  const map = panels[0].material.map;
  assert.equal(map.image.width, 512); assert.equal(map.image.height, 512);
  assert.ok(frames.every(o => o.castShadow && o.receiveShadow));
  const merged = mergeByMaterial(group);
  assert.equal(merged.children.filter(o => o.material === panels[0].material).length, 1);
  builder.dispose();
});

test('frame builder does not register navigation, move core owners or allocate another material', () => {
  const { builder, group } = captureTaiheControl('太和殿');
  const before = hash({ colliders: builder.colliders, walkables: builder.walkables });
  const materialCount = builder.ownedMaterials.length;
  const target = new THREE.Group(); buildTaiheCofferFrame(builder, target, { x0: 17, z0: -6, y: 2 });
  assert.equal(hash({ colliders: builder.colliders, walkables: builder.walkables }), before);
  assert.equal(builder.ownedMaterials.length, materialCount);
  assert.ok(target.children.every(o => o.position.equals(new THREE.Vector3(17, 2, -6))));
  assert.equal(group.children.filter(o => o.userData.taiheCoreOwner).length, 8);
  builder.dispose(); target.children.forEach(o => o.geometry.dispose());
});

test('only two explicit integration lines change the frozen R8 core source', () => {
  const current = fs.readFileSync(new URL('../src/scene/palace/special/TaiheCore.js', import.meta.url), 'utf8');
  const importLine = "import { buildTaiheCofferFrame } from './TaiheCofferFrame.js';\n";
  const callLine = '  buildTaiheCofferFrame(builder,g,{x0,z0,y});\n';
  assert.equal(current.split(importLine).length, 2); assert.equal(current.split(callLine).length, 2);
  const restored = current.replace(importLine, '').replace(callLine, '');
  const expected = fs.readFileSync(new URL('./fixtures/r9-coffer-core-baseline.sha256', import.meta.url), 'utf8').trim();
  assert.equal(hash(restored), expected);
});
