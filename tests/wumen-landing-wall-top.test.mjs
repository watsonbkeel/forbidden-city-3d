import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { captureGate } from './lib/gate-tower-fixture.mjs';
import { Enclosure } from '../src/scene/Enclosure.js';
import { mergeByMaterial } from '../src/utils/MergeUtils.js';
import { WUMEN_ASCENT_PROFILE as P } from '../src/scene/palace/special/WumenAscentProfile.js';
import { fitWumenLandingWallTop } from '../src/scene/palace/special/WumenLandingWallTop.js';

// This executes the production builders and merge, with only texture loading
// omitted. Removing the local covered-face fit must restore the two y=10 hits.
function fixture(legacy = false) {
  const gate = captureGate();
  const enclosure = new Enclosure(new THREE.Scene(), gate.lib);
  if (legacy) enclosure.addWallSegment = function (parent, { wumenCapFit, ...opts }, ...rest) {
    return Enclosure.prototype.addWallSegment.call(this, parent, opts, ...rest);
  };
  const walls = new THREE.Group(); walls.name = 'enclosure';
  enclosure.buildOuterWalls(walls); walls.updateMatrixWorld(true);
  return { ...gate, enclosure, walls };
}
const bodies = f => f.walls.children.filter(o => o.isMesh && o.material.name === 'wall_red'
  && Math.abs(o.position.z + 420.7) < 1e-8);
function merged(f) {
  const gate = mergeByMaterial(f.group);
  gate.position.set(0, 0, P.retained.worldAnchorZ);
  const walls = mergeByMaterial(f.walls);
  const root = new THREE.Group(); root.add(gate, walls); root.updateMatrixWorld(true);
  return root;
}
function hits(root, x, localZ) {
  const ray = new THREE.Raycaster(new THREE.Vector3(x, 10.05, P.retained.worldAnchorZ + localZ), new THREE.Vector3(0, -1, 0));
  return ray.intersectObject(root, true).filter(h => Math.abs(h.point.y - 10) < 1e-7);
}

test('both production merged fold landings have only stone at y=10, with adjacent red wall tops retained', () => {
  const before = merged(fixture(true)), after = merged(fixture());
  for (const sign of [-1, 1]) {
    for (const x of [91.71, 94.8, 97.44]) for (const z of [-2.54, .1, 3.19]) {
      const old = hits(before, sign * x, z), current = hits(after, sign * x, z);
      assert.ok(old.some(h => h.object.material.name === 'wall_red'), 'baseline reproduces coplanar red wall');
      assert.ok(old.some(h => h.object.material.name === 'stone_slab'), 'baseline reproduces coplanar paving');
      assert.ok(current.some(h => h.object.material.name === 'stone_slab'), `stone retained at ${sign * x}/${z}`);
      assert.equal(current.some(h => h.object.material.name === 'wall_red'), false, `covered red top at ${sign * x}/${z}`);
    }
    for (const [x, z] of [[91.69, .1], [97.91, .1], [94.8, -3.01], [150, .1]]) {
      assert.ok(hits(after, sign * x, z).some(h => h.object.material.name === 'wall_red'), `adjacent red top at ${sign * x}/${z}`);
    }
    assert.equal(hits(after, sign * 94.8, 3.21).some(h => h.object.material.name === 'wall_red'), false, 'north of wall remains paving');
  }
});

function vertexRows(mesh, top) {
  const a = mesh.geometry.attributes, rows = [];
  for (let i = 0; i < a.position.count; i++) {
    if ((a.normal.getY(i) > .99) !== top) continue;
    rows.push(Object.fromEntries(Object.entries(a).map(([name, attr]) => [name, Array.from(attr.array.slice(i * attr.itemSize, (i + 1) * attr.itemSize))])));
  }
  return rows;
}
test('only the two upward faces change; every non-top vertex/normal/UV and physics stays exact', () => {
  const before = fixture(true), after = fixture();
  assert.deepEqual(after.enclosure.colliders, before.enclosure.colliders);
  assert.deepEqual(after.builder.colliders, before.builder.colliders);
  assert.deepEqual(after.builder.walkables, before.builder.walkables);
  for (let i = 0; i < 2; i++) {
    const a = bodies(before)[i], b = bodies(after)[i];
    assert.deepEqual(a.position, b.position);
    assert.deepEqual(vertexRows(b, false), vertexRows(a, false));
    assert.equal(b.geometry.attributes.position.count - a.geometry.attributes.position.count, 12, 'four extra triangles per wall');
    assert.deepEqual(new THREE.Box3().setFromObject(b), new THREE.Box3().setFromObject(a));
  }
});

function polygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) { const a = points[i], b = points[(i + 1) % points.length]; area += a[0] * b[1] - a[1] * b[0]; }
  return Math.abs(area) / 2;
}
function clip(points, axis, limit, keepGreater) {
  const output = [], inside = p => keepGreater ? p[axis] >= limit : p[axis] <= limit;
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length], ai = inside(a), bi = inside(b);
    if (ai) output.push(a);
    if (ai !== bi) { const t = (limit - a[axis]) / (b[axis] - a[axis]); output.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]); }
  }
  return output;
}
test('the mirrored notch is conservatively contained by the covered patch, with remaining top area and UV registration retained', () => {
  const before = fixture(true), after = fixture();
  for (let i = 0; i < 2; i++) {
    const a = bodies(before)[i], b = bodies(after)[i], sign = Math.sign(b.position.x);
    const old = vertexRows(a, true), current = vertexRows(b, true);
    const x0 = Math.min(...old.map(r => r.position[0])), x1 = Math.max(...old.map(r => r.position[0]));
    const z0 = Math.min(...old.map(r => r.position[2])), z1 = Math.max(...old.map(r => r.position[2]));
    const xa = Math.fround(Math.min(sign * 91.7, sign * 97.9) - b.position.x);
    const xb = Math.fround(Math.max(sign * 91.7, sign * 97.9) - b.position.x);
    const za = Math.min(...current.map(r => r.position[2]).filter(z => z > z0));
    let keptArea = 0, overlapArea = 0;
    for (let j = 0; j < current.length; j += 3) {
      const points = current.slice(j, j + 3).map(r => [r.position[0], r.position[2]]);
      keptArea += polygonArea(points);
      overlapArea += polygonArea(clip(clip(clip(points, 0, xa, true), 0, xb, false), 1, za, true));
      const vertices = current.slice(j, j + 3).map(r => new THREE.Vector3(...r.position));
      assert.ok(new THREE.Triangle(...vertices).getNormal(new THREE.Vector3()).y > .99999);
    }
    assert.ok(overlapArea < 1e-8, `positive-area top remains inside notch: ${overlapArea}`);
    assert.ok(Math.abs(keptArea - ((x1 - x0) * (z1 - z0) - (xb - xa) * (z1 - za))) < 1e-8);
    assert.ok((xb - xa) * (z1 - za) < 38.44, 'conservative Float32 notch stays within nominal covered area');
    for (const r of current) {
      assert.ok(r.position[0] >= x0 && r.position[0] <= x1 && r.position[2] >= z0 && r.position[2] <= z1);
      assert.deepEqual(r.normal, [0, 1, 0]);
      assert.equal(r.uv[0], r.position[0]); assert.equal(r.uv[1], r.position[2]);
    }
    for (const r of old) assert.ok(current.some(s => JSON.stringify(s) === JSON.stringify(r)), 'original exposed corner attributes retained exactly');
  }
});

test('actual merged Float32 notch is contained by the actual paving, without an epsilon hiding a gap', t => {
  const f = fixture(), rawBodies = bodies(f);
  for (const body of rawBodies) {
    const sign = Math.sign(body.position.x), name = sign < 0 ? 'east' : 'west';
    const surface = f.group.getObjectByName(`${name}-outer-fold-surface`);
    const cloned = surface.clone(); cloned.geometry = surface.geometry.clone();
    const slabRoot = new THREE.Group(); slabRoot.add(cloned);
    const slab = mergeByMaterial(slabRoot); slab.position.z = P.retained.worldAnchorZ; slab.updateMatrixWorld(true);
    const slabBounds = new THREE.Box3().setFromObject(slab);
    const wallRoot = new THREE.Group(), copiedBody = body.clone(); copiedBody.geometry = body.geometry.clone(); wallRoot.add(copiedBody);
    const wall = mergeByMaterial(wallRoot); wall.updateMatrixWorld(true);
    const rows = vertexRows(wall.children[0], true), xs = [...new Set(rows.map(r => r.position[0]))].sort((a, b) => a - b);
    const zs = [...new Set(rows.map(r => r.position[2]))].sort((a, b) => a - b);
    const hole = { minX: xs[1], maxX: xs[2], minZ: zs[1], maxZ: zs[2] };
    assert.ok(hole.minX >= slabBounds.min.x); assert.ok(hole.maxX <= slabBounds.max.x);
    assert.ok(hole.minZ >= slabBounds.min.z); assert.ok(hole.maxZ <= slabBounds.max.z);
    assert.equal(hole.minX, slabBounds.min.x); assert.equal(hole.maxX, slabBounds.max.x);
    // Exact present-builder quantization: no arbitrary visibility tolerance.
    assert.equal(hole.minZ - slabBounds.min.z, 0.00002465248110183893);
    t.diagnostic(JSON.stringify({ side: name, mergedNotch: hole,
      mergedPaving: { min: slabBounds.min.toArray(), max: slabBounds.max.toArray() },
      southInsetMicrometres: (hole.minZ - slabBounds.min.z) * 1e6 }));
  }
});

test('top UVs are interpolated from the original mapping, not remapped with assumed tile dimensions', () => {
  const body = bodies(fixture(true))[0], uv = body.geometry.attributes.uv, pos = body.geometry.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) * .5 + 7, pos.getZ(i) * .25 - 3);
  const nonTop = vertexRows(body, false), oldTop = vertexRows(body, true);
  const [a, c, b] = oldTop;
  fitWumenLandingWallTop(body, 1);
  assert.deepEqual(vertexRows(body, false), nonTop);
  for (const r of vertexRows(body, true)) {
    const tx = (r.position[0] - a.position[0]) / (b.position[0] - a.position[0]);
    const tz = (r.position[2] - a.position[2]) / (c.position[2] - a.position[2]);
    assert.equal(r.uv[0], Math.fround(a.uv[0] + tx * (b.uv[0] - a.uv[0])));
    assert.equal(r.uv[1], Math.fround(a.uv[1] + tz * (c.uv[1] - a.uv[1])));
  }
});

test('unexpected inputs fail closed before changing any wall attribute', () => {
  for (const change of [b => { b.position.y += .01; }, b => { b.position.z += .01; },
    b => { b.rotation.y = .1; }, b => { b.geometry.attributes.normal.setY(12, 0); },
    b => { b.geometry.attributes.uv.setY(16, 100); },
    b => { b.geometry.groups[2].count = 3; }]) {
    const body = bodies(fixture(true))[0]; change(body);
    const before = Object.fromEntries(Object.entries(body.geometry.attributes).map(([name, a]) => [name, Array.from(a.array)]));
    assert.throws(() => fitWumenLandingWallTop(body, 1), /Wumen landing wall top/);
    assert.deepEqual(Object.fromEntries(Object.entries(body.geometry.attributes).map(([name, a]) => [name, Array.from(a.array)])), before);
  }
  assert.throws(() => fitWumenLandingWallTop(bodies(fixture(true))[0], 0), /side/);
});
