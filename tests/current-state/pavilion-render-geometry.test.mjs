import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

const module = await import('../../src/render/PavilionRenderGeometry.js').catch(error => {
  if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
  throw error;
});
const triangles = mesh => (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count) / 3;
const prune = (root, boxes) => {
  assert.equal(typeof module.prunePavilionCoveredFaces, 'function', 'pavilion-only covered-face pruning must exist');
  return module.prunePavilionCoveredFaces(root, boxes);
};
function box(root, x, y, z, w = 2, h = 2, d = 2) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial());
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  root.add(mesh);
  return mesh;
}
function face(root, points) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3));
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
  root.add(mesh);
  return mesh;
}

test('only the two touching internal box faces are removed, with exact surviving attributes', () => {
  const root = new THREE.Group(), a = box(root, 0, 0, 0), b = box(root, 2, 0, 0);
  const original = a.geometry.toNonIndexed();
  let disposed = 0;
  a.geometry.addEventListener('dispose', () => disposed++);
  const report = prune(root, [a, b]);
  assert.equal(report.removedTriangles, 4);
  assert.equal(triangles(a), 10); assert.equal(triangles(b), 10);
  assert.equal(disposed, 1);
  const retained = a.geometry.toNonIndexed();
  for (const [name, attribute] of Object.entries(retained.attributes)) {
    assert.deepEqual(Array.from(attribute.array), Array.from(original.attributes[name].array).slice(6 * attribute.itemSize), name);
  }
  a.geometry.computeBoundingBox();
  assert.deepEqual(a.geometry.boundingBox.min.toArray(), [-1, -1, -1]);
  assert.deepEqual(a.geometry.boundingBox.max.toArray(), [1, 1, 1]);
  assert.equal(a.castShadow, true); assert.equal(a.receiveShadow, true);
  assert.equal(root.children.length, 2);
});

test('coincident exposed faces are retained rather than deleting both overlapping skins', () => {
  const root = new THREE.Group(), a = box(root, 0, 0, 0), b = box(root, 0, 0, 0);
  const report = prune(root, [a, b]);
  assert.equal(report.removedTriangles, 0);
  assert.equal(triangles(a) + triangles(b), 24);
});

test('a buried face is removed only when one actual rotated box encloses the entire triangle', () => {
  const root = new THREE.Group(), occluder = box(root, 0, 0, 0, 4, 2, .2);
  occluder.rotation.y = Math.PI / 4;
  const buried = face(root, [[-.01, -.2, 0], [.01, -.2, 0], [0, .2, 0]]);
  const exposed = face(root, [[1, -.2, 1], [1.1, -.2, 1], [1, .2, 1]]);
  const report = prune(root, [occluder]);
  assert.equal(report.removedTriangles, 1);
  assert.equal(triangles(buried), 0); assert.equal(triangles(exposed), 1);
});

test('a face crossing an uncovered gap is preserved even when all its corners are in the union of boxes', () => {
  const root = new THREE.Group(), a = box(root, -1.5, 0, 0), b = box(root, 1.5, 0, 0);
  const bridge = face(root, [[-1.5, -.5, 0], [1.5, -.5, 0], [-1.5, .5, 0]]);
  prune(root, [a, b]);
  assert.equal(triangles(bridge), 1);
});

test('only explicit opaque solid-box occluders are accepted', () => {
  const root = new THREE.Group(), a = box(root, 0, 0, 0);
  a.material.transparent = true;
  assert.throws(() => prune(root, [a]), /opaque|solid/i);
});

test('nonuniformly scaled rotated solid boxes use their exact local volume', () => {
  const root = new THREE.Group(), occluder = box(root, 0, 0, 0);
  occluder.rotation.z = .6; occluder.scale.set(2, .3, .7);
  const buried = face(root, [[-.04, -.03, 0], [.04, -.03, 0], [0, .03, 0]]);
  const exposed = face(root, [[1, -1, 0], [1.1, -1, 0], [1, -.9, 0]]);
  prune(root, [occluder]);
  assert.equal(triangles(buried), 0); assert.equal(triangles(exposed), 1);
});

test('alpha-tested boxes cannot justify removing geometry behind their cutouts', () => {
  const root = new THREE.Group(), a = box(root, 0, 0, 0);
  a.material.alphaTest = .5;
  assert.throws(() => prune(root, [a]), /opaque|solid/i);
});

test('shared source geometry stays alive if any unchanged instance retains it', () => {
  const root = new THREE.Group(), a = box(root, 0, 0, 0), b = box(root, 2, 0, 0);
  const shared = a.geometry, untouched = new THREE.Mesh(shared, a.material);
  untouched.position.x = 20; untouched.castShadow = true; root.add(untouched);
  let disposed = 0; shared.addEventListener('dispose', () => disposed++);
  prune(root, [a, b, untouched]);
  assert.notEqual(a.geometry, shared); assert.equal(untouched.geometry, shared);
  assert.equal(disposed, 0); assert.equal(triangles(untouched), 12);
});

test('shared source geometry is disposed only once after all of its instances are replaced', () => {
  const root = new THREE.Group(), a = box(root, 0, 0, 0), b = box(root, 2, 0, 0);
  const shared = a.geometry; b.geometry.dispose(); b.geometry = shared;
  let disposed = 0, materialDisposed = 0;
  shared.addEventListener('dispose', () => disposed++);
  a.material.addEventListener('dispose', () => materialDisposed++);
  prune(root, [a, b]);
  assert.notEqual(a.geometry, shared); assert.notEqual(b.geometry, shared);
  assert.equal(disposed, 1); assert.equal(materialDisposed, 0);
});

test('deck paving and substrate partition the same solid without adding or moving any triangles', () => {
  assert.equal(typeof module.splitPavilionDeckFaces, 'function');
  const geometry = new THREE.BoxGeometry(4, .24, 2).toNonIndexed();
  const original = Object.fromEntries(Object.entries(geometry.attributes).map(([name, attribute]) => [name, Array.from(attribute.array)]));
  const { surface, body } = module.splitPavilionDeckFaces(geometry);
  assert.equal(surface.attributes.position.count, 6);
  assert.equal(body.attributes.position.count, 30);
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    const sourceTriangles = [];
    const resultTriangles = [];
    for (let i = 0; i < attribute.count; i += 3) sourceTriangles.push(JSON.stringify(original[name].slice(i * attribute.itemSize, (i + 3) * attribute.itemSize)));
    for (const part of [surface, body]) {
      const a = part.attributes[name];
      for (let i = 0; i < a.count; i += 3) resultTriangles.push(JSON.stringify(Array.from(a.array.slice(i * a.itemSize, (i + 3) * a.itemSize))));
    }
    assert.deepEqual(resultTriangles.sort(), sourceTriangles.sort(), name);
  }
});

const { CourtKit } = await import('../../src/scene/palace/kit.js');
const { buildSurveyedPavilion } = await import('../../src/scene/palace/special/SurveyedPavilion.js');
function pavilion(profile) {
  const materials = new Map();
  const lib = new Proxy({
    material: name => materials.get(name) ?? (materials.set(name, new THREE.MeshStandardMaterial({ name })), materials.get(name)),
    tileSize: () => 1, aspect: () => 1,
  }, { get: (target, key) => key in target ? target[key] : () => null });
  const kit = new CourtKit(lib), originals = new Map();
  for (const method of ['box', 'mesh', 'roof']) {
    const original = kit[method].bind(kit);
    kit[method] = (...args) => {
      const object = original(...args);
      object.traverse(mesh => { if (mesh.geometry) originals.set(mesh, mesh.geometry.clone()); });
      return object;
    };
  }
  const built = buildSurveyedPavilion(kit, { pavilionProfile: profile, x: 0, z: 0, rot: 0, enter: true, plaque: false });
  const baseline = built.f.clone(true), currentMeshes = [], baselineMeshes = [];
  built.f.traverse(mesh => { if (mesh.isMesh) currentMeshes.push(mesh); });
  baseline.traverse(mesh => { if (mesh.isMesh) baselineMeshes.push(mesh); });
  currentMeshes.forEach((mesh, i) => { baselineMeshes[i].geometry = originals.get(mesh); });
  built.f.updateMatrixWorld(true); baseline.updateMatrixWorld(true);
  return { kit, built, baseline, currentMeshes, baselineMeshes };
}
for (const profile of ['hongyi', 'tiren']) {
  test(`${profile}: hidden faces give a bounded triangle reduction while all 28 lattice leaves keep their bars`, () => {
    const { built, currentMeshes, baselineMeshes } = pavilion(profile);
    const count = meshes => meshes.reduce((total, mesh) => total + triangles(mesh), 0);
    assert.ok(count(baselineMeshes) - count(currentMeshes) >= (profile === 'hongyi' ? 2600 : 2700));
    assert.equal(currentMeshes.filter(mesh => mesh.userData.role === 'upper-lattice-bar').length, profile === 'hongyi' ? 168 : 224);
    assert.equal(currentMeshes.filter(mesh => mesh.userData.role === 'lower-window-bar').length, 114);
    assert.equal(built.f.userData.pavilion.balcony.supports, 24);
  });

  test(`${profile}: brick paving never promotes the shared flat-floor bucket to a shadow caster`, () => {
    const { kit, currentMeshes } = pavilion(profile);
    const deck = currentMeshes.filter(mesh => mesh.userData.role === 'balcony-deck');
    const body = currentMeshes.filter(mesh => mesh.userData.role === 'balcony-deck-body');
    assert.equal(deck.length, 4); assert.equal(body.length, 4);
    assert.ok(deck.every(mesh => mesh.material === kit.floorMat && !mesh.castShadow && mesh.receiveShadow));
    assert.ok(body.every(mesh => mesh.material.name === 'wall_brick' && mesh.castShadow));
    const merged = kit.finish();
    const floor = merged.children.find(mesh => mesh.material === kit.floorMat);
    assert.equal(floor.castShadow, false);
    assert.equal(merged.children.length, 12, 'no extra material bucket');
  });
}

test('mirrored coincident solid boxes retain their outward skins', () => {
  const root = new THREE.Group(), a = box(root, 0, 0, 0), b = box(root, 0, 0, 0);
  a.scale.x = b.scale.x = -1;
  assert.equal(prune(root, [a, b]).removedTriangles, 0);
  assert.equal(triangles(a) + triangles(b), 24);
});

test('a sphere bounding box is never accepted as an opaque solid box', () => {
  const root = new THREE.Group(), sphere = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 6), new THREE.MeshStandardMaterial());
  root.add(sphere);
  assert.throws(() => prune(root, [sphere]), /box|cuboid/i);
});

for (const condition of ['hidden-parent', 'hidden-material', 'back-side', 'partial-range', 'interleaved', 'multi-material', 'non-casting-occluder']) {
  test(`unsupported ${condition} input is rejected before any source is changed`, () => {
    const root = new THREE.Group(), a = box(root, 0, 0, 0), b = box(root, 2, 0, 0);
    const original = a.geometry;
    if (condition === 'hidden-parent') { const parent = new THREE.Group(); root.add(parent); parent.add(b); parent.visible = false; }
    if (condition === 'hidden-material') b.material.visible = false;
    if (condition === 'back-side') b.material.side = THREE.BackSide;
    if (condition === 'partial-range') b.geometry.setDrawRange(0, 3);
    if (condition === 'interleaved') {
      const values = new THREE.InterleavedBuffer(new Float32Array(b.geometry.attributes.position.array), 3);
      b.geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(values, 3, 0));
    }
    if (condition === 'multi-material') b.material = [b.material];
    if (condition === 'non-casting-occluder') b.castShadow = false;
    assert.throws(() => prune(root, [a, b]), /unsupported|opaque|solid|box/i);
    assert.equal(a.geometry, original);
  });
}

for (const profile of ['hongyi', 'tiren']) {
  test(`${profile}: exterior, terrace and playable-interior rays retain the same first physical surface`, () => {
    const { built, baseline } = pavilion(profile);
    const rays = [];
    // Four exterior elevations plus top-down footprint samples, including the
    // openings between lattice bars rather than only architectural anchors.
    for (let y = .37; y < 28; y += 1.1) {
      for (let x = -36.37; x <= 36.37; x += 1.37) {
        rays.push([[x, y, -40], [0, 0, 1]], [[x, y, 30], [0, 0, -1]]);
      }
      for (let z = -29.31; z < 12; z += 1.37) rays.push([[-45, y, z], [1, 0, 0]], [[45, y, z], [-1, 0, 0]]);
    }
    for (let x = -35.37; x < 36; x += 2.37) for (let z = -29.31; z < 12; z += 2.37) rays.push([[x, 35, z], [0, -1, 0]]);
    const floor = built.geometry.lower.floorY;
    for (let x = -20.17; x < 21; x += 1.31) {
      rays.push([[x, floor + 1.7, 0], [0, 0, -1]], [[x, floor + 1.7, 0], [0, 0, 1]], [[x, floor + 1.7, -15], [0, 0, 1]]);
    }
    const raycaster = new THREE.Raycaster();
    let hitCount = 0;
    for (const [origin, direction] of rays) {
      raycaster.set(new THREE.Vector3(...origin), new THREE.Vector3(...direction));
      const before = raycaster.intersectObject(baseline, true)[0], after = raycaster.intersectObject(built.f, true)[0];
      assert.equal(!!after, !!before, `${origin}/${direction}: surface availability`);
      if (before) {
        hitCount++;
        assert.ok(Math.abs(before.distance - after.distance) < 1e-5, `${origin}/${direction}: ${before.distance} != ${after.distance}`);
      }
    }
    assert.ok(rays.length > 4500); assert.ok(hitCount > 2000);
  });
}

test('duplicating one triangular half of a box face cannot masquerade as a complete opaque face', () => {
  const root = new THREE.Group(), a = box(root, 0, 0, 0);
  a.geometry = a.geometry.toNonIndexed();
  for (const attribute of Object.values(a.geometry.attributes)) {
    attribute.array.set(attribute.array.slice(0, 3 * attribute.itemSize), 3 * attribute.itemSize);
  }
  assert.throws(() => prune(root, [a]), /box|complete/i);
});

test('singular transforms are rejected before source geometry changes', () => {
  const root = new THREE.Group(), a = box(root, 0, 0, 0), b = box(root, 2, 0, 0);
  const original = a.geometry; b.scale.x = 0;
  assert.throws(() => prune(root, [a, b]), /transform|singular|unsupported/i);
  assert.equal(a.geometry, original);
});

for (const Type of [THREE.InstancedMesh, THREE.SkinnedMesh]) {
  test(`${Type.name} is rejected because its rendered vertices need more than matrixWorld`, () => {
    const root = new THREE.Group(), a = box(root, 0, 0, 0);
    const deformed = new Type(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial(), 1);
    root.add(deformed);
    assert.throws(() => prune(root, [a]), /unsupported/i);
  });
}
