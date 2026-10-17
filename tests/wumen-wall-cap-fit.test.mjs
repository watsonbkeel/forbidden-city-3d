import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildWallCap } from '../src/scene/RoofBuilder.js';

// A missing implementation reports a feature assertion rather than an import crash.
const implementation = await import('../src/scene/palace/special/WumenWallCapFit.js')
  .catch(error => ({ error }));
test('Wumen wall-cap fit has an isolated geometry-only entry point', () => {
  assert.equal(typeof implementation.fitWumenWallCap, 'function', implementation.error?.message);
});

if (implementation.fitWumenWallCap) {
  const { fitWumenWallCap } = implementation;
  const LENGTH = 312.2;
  const TRIM = 37.9;
  const close = (a, b, tolerance = 1e-5) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
  const xyz = (attribute, i) => new THREE.Vector3().fromBufferAttribute(attribute, i);
  function fixture() {
    const shared = new Map();
    const texture = new THREE.Texture();
    let requests = 0;
    const library = {
      material(name) {
        requests++;
        if (!shared.has(name)) shared.set(name, new THREE.MeshStandardMaterial({ name, map: texture }));
        return shared.get(name);
      },
      tileSize: name => name === 'wall_red' ? 2.7 : 1.3,
      aspect: () => 1,
    };
    const cap = buildWallCap(library, { length: LENGTH, thickness: 8.6 });
    return { cap, shared, texture, requests: () => requests };
  }
  function snapshot(cap) {
    return cap.children.map(mesh => ({
      mesh, geometry: mesh.geometry, material: mesh.material, map: mesh.material.map,
      index: mesh.geometry.index,
      attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([name, attribute]) =>
        [name, { attribute, itemSize: attribute.itemSize, array: attribute.array.slice() }])),
    }));
  }
  function assertUntouched(cap, before) {
    assert.deepEqual(cap.children, before.map(entry => entry.mesh));
    for (const entry of before) for (const [name, old] of Object.entries(entry.attributes)) {
      assert.equal(entry.mesh.geometry.attributes[name], old.attribute);
      assert.deepEqual(entry.mesh.geometry.attributes[name].array, old.array);
    }
  }
  for (const side of [-1, 1]) {
    test(`cap fit side ${side} preserves ownership, topology and every remote-end vertex attribute`, () => {
      const f = fixture(); const before = snapshot(f.cap);
      const ownership = f.cap.userData.ownedMaterials;
      const metadata = { ...f.cap.userData };
      const requests = f.requests();
      const result = fitWumenWallCap(f.cap, { length: LENGTH, side, trimDistance: TRIM });
      assert.equal(result, f.cap);
      assert.equal(f.cap.userData.ownedMaterials, ownership);
      assert.deepEqual(f.cap.userData, metadata);
      assert.equal(f.requests(), requests);
      assert.deepEqual(f.cap.children, before.map(entry => entry.mesh));
      for (const entry of before) {
        const mesh = entry.mesh;
        assert.equal(mesh.geometry, entry.geometry);
        assert.equal(mesh.material, entry.material);
        assert.equal(mesh.material.map, entry.map);
        assert.equal(mesh.geometry.index, entry.index);
        const oldPosition = entry.attributes.position.array;
        for (const [name, old] of Object.entries(entry.attributes)) {
          const actual = mesh.geometry.attributes[name];
          assert.equal(actual, old.attribute);
          assert.equal(actual.array.length, old.array.length);
          for (let i = 0; i < actual.count; i++) {
            if (oldPosition[i * 3] * side < 0) continue;
            for (let k = 0; k < old.itemSize; k++) assert.equal(actual.array[i * old.itemSize + k], old.array[i * old.itemSize + k]);
          }
        }
        assert.deepEqual(mesh.geometry.attributes.normal.array, entry.attributes.normal.array);
      }
    });

    test(`cap fit side ${side} moves existing closed ends and keeps longitudinal texture coordinates registered`, () => {
      const { cap } = fixture(); const before = snapshot(cap);
      fitWumenWallCap(cap, { length: LENGTH, side, trimDistance: TRIM });
      let movedEndTriangles = 0; let spanningTriangles = 0;
      for (const entry of before) {
        const { position, uv, normal } = entry.mesh.geometry.attributes;
        const oldPosition = new THREE.BufferAttribute(entry.attributes.position.array, 3);
        const oldUv = new THREE.BufferAttribute(entry.attributes.uv.array, 2);
        for (let i = 0; i < position.count; i += 3) {
          const original = [0, 1, 2].map(j => xyz(oldPosition, i + j));
          const fitted = [0, 1, 2].map(j => xyz(position, i + j));
          const oldCross = original[1].clone().sub(original[0]).cross(original[2].clone().sub(original[0]));
          const newCross = fitted[1].clone().sub(fitted[0]).cross(fitted[2].clone().sub(fitted[0]));
          assert.ok(newCross.length() > 1e-7, `degenerate triangle ${entry.mesh.name}/${i / 3}`);
          assert.ok(oldCross.dot(newCross) > 0, 'triangle winding changed');
          const endFace = original.every(p => p.x === original[0].x);
          if (endFace) {
            close(oldCross.length(), newCross.length());
            if (original[0].x * side < 0) movedEndTriangles++;
            for (let j = 0; j < 3; j++) {
              assert.equal(uv.getX(i + j), oldUv.getX(i + j));
              assert.equal(uv.getY(i + j), oldUv.getY(i + j));
            }
          } else {
            spanningTriangles++;
            // Compare the original triangle's affine UV field at retained points.
            // This catches texture rescaling, including the non-world-space box ridge UVs.
            const e1 = original[1].clone().sub(original[0]);
            const e2 = original[2].clone().sub(original[0]);
            const d11 = e1.dot(e1), d12 = e1.dot(e2), d22 = e2.dot(e2);
            const det = d11 * d22 - d12 * d12;
            for (const weights of [[.2, .3, .5], [.7, .1, .2], [0, 1, 0], [1, 0, 0]]) {
              const point = new THREE.Vector3();
              for (let j = 0; j < 3; j++) point.addScaledVector(fitted[j], weights[j]);
              const delta = point.sub(original[0]);
              const b1 = (d22 * delta.dot(e1) - d12 * delta.dot(e2)) / det;
              const b2 = (d11 * delta.dot(e2) - d12 * delta.dot(e1)) / det;
              for (const component of ['getX', 'getY']) {
                const expected = oldUv[component](i) + b1 * (oldUv[component](i + 1) - oldUv[component](i)) + b2 * (oldUv[component](i + 2) - oldUv[component](i));
                const actual = weights.reduce((sum, weight, j) => sum + weight * uv[component](i + j), 0);
                close(actual, expected, 2e-5);
              }
            }
          }
          for (let j = 0; j < 3; j++) {
            const n = xyz(normal, i + j);
            close(n.length(), 1, 1e-6);
            assert.ok(newCross.dot(n) > 0, 'vertex normal opposes face winding');
            assert.ok(fitted[j].toArray().every(Number.isFinite));
            assert.equal(fitted[j].y, original[j].y);
            assert.equal(fitted[j].z, original[j].z);
            const expectedX = original[j].x * side < 0 ? -side * (LENGTH / 2 - TRIM) : original[j].x;
            close(fitted[j].x, expectedX);
          }
        }
      }
      assert.equal(movedEndTriangles, 20, 'all brick, gable and ridge end faces translate intact');
      assert.equal(spanningTriangles, 36);
    });

    test(`cap fit side ${side} clears the provisional Wumen flight footprint without moving the remote cap`, () => {
      const { cap } = fixture();
      fitWumenWallCap(cap, { length: LENGTH, side, trimDistance: TRIM });
      cap.position.set(side * (60 + LENGTH / 2), 10, -420.7);
      const bounds = new THREE.Box3().setFromObject(cap);
      const inner = side > 0 ? bounds.min.x : -bounds.max.x;
      const outer = side > 0 ? bounds.max.x : -bounds.min.x;
      close(inner, 97.9); close(outer, 372.2);
      close(bounds.min.y, 10); close(bounds.max.y, 12.965);
      close(bounds.min.z, -425.35); close(bounds.max.z, -416.05);
      // Retained return/turning footprint ends at |x|=97.9. Boundary contact is allowed.
      assert.ok(inner >= 97.9 - 1e-5);
      for (const mesh of cap.children) {
        const p = mesh.geometry.attributes.position;
        const box = mesh.geometry.boundingBox;
        assert.ok(box && mesh.geometry.boundingSphere);
        for (let i = 0; i < p.count; i++) {
          assert.ok(box.containsPoint(xyz(p, i)));
          assert.ok(mesh.geometry.boundingSphere.containsPoint(xyz(p, i)));
        }
      }
    });
  }

  test('zero trim is an exact no-op', () => {
    const { cap } = fixture(); const before = snapshot(cap);
    assert.equal(fitWumenWallCap(cap, { length: LENGTH, side: 1, trimDistance: 0 }), cap);
    assertUntouched(cap, before);
  });

  test('invalid fit parameters fail before any cap geometry changes', () => {
    for (const invalid of [{ length: 0 }, { length: NaN }, { side: 0 }, { side: .5 }, { trimDistance: -1 }, { trimDistance: LENGTH }, { trimDistance: Infinity }]) {
      const { cap } = fixture(); const before = snapshot(cap);
      assert.throws(() => fitWumenWallCap(cap, { length: LENGTH, side: 1, trimDistance: TRIM, ...invalid }), /Wumen wall cap/);
      assertUntouched(cap, before);
    }
  });

  test('unexpected generated geometry fails closed with no partial mutation of earlier meshes', () => {
    const corruptions = [
      cap => { cap.children[1].position.x = 1; },
      cap => { cap.children[1].geometry.attributes.position.setX(0, 0); },
      cap => { cap.children[1].geometry.attributes.uv.setX(0, NaN); },
      cap => { cap.children[1].geometry.setIndex([0, 1, 2]); },
      cap => { cap.children[1].geometry.deleteAttribute('normal'); },
      cap => { cap.children[1].geometry.attributes.position.setY(0, 987); },
    ];
    for (const corrupt of corruptions) {
      const { cap } = fixture(); corrupt(cap); const before = snapshot(cap);
      assert.throws(() => fitWumenWallCap(cap, { length: LENGTH, side: 1, trimDistance: TRIM }), /Wumen wall cap/);
      assertUntouched(cap, before);
    }
  });
}
