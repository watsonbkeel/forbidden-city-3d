import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { BatchedBuilder } from '../../src/render/BatchedBuilder.js';
import { TextureLibrary, TEXTURE_SPECS } from '../../src/utils/TextureLibrary.js';
import { PalaceBuilder } from '../../src/scene/PalaceBuilder.js';
import { captureGate, meshFingerprint } from '../lib/gate-tower-fixture.mjs';

const ridge = () => new THREE.MeshStandardMaterial({ name: 'roof_ridge_glaze', color: 0xc98f2c, roughness: .36, metalness: .05 });
function fixture() {
  const scene = new THREE.Scene(), parent = new THREE.Group();
  parent.position.set(5, 7, -3); scene.add(parent);
  const meshes = [ridge(), ridge()].map((material, i) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2 + i, 3, 1), material);
    mesh.position.set(i * 4, i, -i); mesh.castShadow = mesh.receiveShadow = true;
    mesh.geometry.computeBoundingSphere();
    parent.add(mesh); return mesh;
  });
  return { scene, parent, meshes, batcher: new BatchedBuilder(scene) };
}
function run(f) { f.batcher.begin(); const result = [...f.batcher.batches]; f.batcher.end(); return result; }

function assertBatchPayload(batch, entries) {
  for (const { mesh, id } of entries) {
    const range = batch._reservedRanges[id];
    for (const [key, attribute] of Object.entries(mesh.geometry.attributes)) {
      const actual = batch.geometry.attributes[key].array;
      assert.deepEqual(Array.from(actual.slice(range.vertexStart * attribute.itemSize, (range.vertexStart + attribute.count) * attribute.itemSize)), Array.from(attribute.array), key);
    }
    if (mesh.geometry.index) {
      const actualIndex = batch.geometry.index.array.slice(range.indexStart, range.indexStart + mesh.geometry.index.count);
      assert.deepEqual(Array.from(actualIndex, value => value - range.vertexStart), Array.from(mesh.geometry.index.array));
    } else assert.equal(batch.geometry.index, null);
    const matrix = new THREE.Matrix4(); batch.getMatrixAt(id, matrix);
    assert.deepEqual(matrix.elements, mesh.matrixWorld.elements.map(Math.fround));
    assert.ok(batch.getBoundingSphereAt(id, new THREE.Sphere()).equals(mesh.geometry.boundingSphere));
    assert.deepEqual(batch.material.color.toArray(), mesh.material.color.toArray());
    assert.equal(batch.material.roughness, mesh.material.roughness);
    assert.equal(batch.material.metalness, mesh.material.metalness);
  }
}

test('exact eligible roof solids share a batch while retaining original source objects and geometry', () => {
  const f = fixture(), materials = f.meshes.map(m => m.material), geometries = f.meshes.map(m => m.geometry);
  const before = meshFingerprint(f.scene), batches = run(f);
  assert.equal(batches.length, 1, 'distinct but exact roof materials should batch');
  assert.deepEqual(batches[0].entries.map(e => e.mesh), f.meshes);
  assert.equal(batches[0].batch.material, materials[0]);
  assert.equal(meshFingerprint(f.scene), before);
  f.meshes.forEach((mesh, i) => { assert.equal(mesh.material, materials[i]); assert.equal(mesh.geometry, geometries[i]); });
});

for (const [name, mutate] of [
  ['other name', m => { m.name = 'other-solid'; }],
  ['color', m => { m.color.r += .001; }],
  ['roughness', m => { m.roughness += .001; }],
  ['metalness', m => { m.metalness += .001; }],
  ['side', m => { m.side = THREE.DoubleSide; }],
  ['shadow side', m => { m.shadowSide = THREE.BackSide; }],
  ['emissive', m => { m.emissive.setHex(0x222222); }],
  ['texture', m => { m.map = new THREE.Texture(); }],
  ['normal scale', m => { m.normalScale.set(2, 1); }],
  ['environment rotation', m => { m.envMapRotation.x = .1; }],
  ['clipping', m => { m.clippingPlanes = [new THREE.Plane()]; }],
  ['shader hook', m => { m.onBeforeCompile = () => {}; }],
  ['render hook', m => { m.onBeforeRender = () => {}; }],
  ['cache hook', m => { m.customProgramCacheKey = () => 'custom'; }],
  ['defines', m => { m.defines.EXTRA = 1; }],
  ['unknown property', m => { m.futureFeature = true; }],
  ['alpha test', m => { m.alphaTest = .1; }],
  ['vertex colors', m => { m.vertexColors = true; }],
  ['polygon offset', m => { m.polygonOffset = true; }],
  ['stencil', m => { m.stencilWrite = true; }],
  ['invisible material', m => { m.visible = false; }],
  ['nonfinite value', m => { m.roughness = NaN; }],
  ['deleted render field', m => { delete m.colorWrite; }],
  ['nonenumerable override', m => { Object.defineProperty(m, 'colorWrite', { value: false }); }],
  ['sub-byte color difference', m => { m.color.r += 1e-12; }],
  ['custom material prototype', m => Object.setPrototypeOf(m, Object.create(THREE.MeshStandardMaterial.prototype))],
]) test(`distinct roof materials with ${name} remain UUID-isolated`, () => {
  const f = fixture(); mutate(f.meshes[1].material);
  assert.equal(run(f).length, 0);
});

test('unrelated equal solids and equal nondefault/textured roof materials remain UUID-isolated', () => {
  const texture = new THREE.Texture();
  for (const mutate of [m => { m.name = 'unrelated'; }, m => { m.side = THREE.DoubleSide; }, m => { m.map = texture; }]) {
    const f = fixture();
    for (const mesh of f.meshes) mutate(mesh.material);
    assert.equal(run(f).length, 0);
  }
});

for (const [name, mutate] of [
  ['layers', m => m.layers.set(2)],
  ['render order', m => { m.renderOrder = 7; }],
  ['unculled mesh', m => { m.frustumCulled = false; }],
  ['custom depth', m => { m.customDepthMaterial = new THREE.MeshDepthMaterial(); }],
  ['custom distance', m => { m.customDistanceMaterial = new THREE.MeshDistanceMaterial(); }],
  ['custom render callback', m => { m.onBeforeRender = () => {}; }],
  ['custom shadow callback', m => { m.onBeforeShadow = () => {}; }],
  ['partial draw range', m => m.geometry.setDrawRange(3, 6)],
  ['mirrored transform', m => { m.scale.x = -1; }],
  ['frozen world matrix', m => { m.matrixWorldAutoUpdate = false; }],
  ['child mesh', m => m.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()))],
  ['parent render order', m => { const group = new THREE.Group(); group.renderOrder = 1; m.parent.add(group); group.add(m); }],
  ['sheared world transform', m => { m.matrixAutoUpdate = false; m.matrix.makeShear(.3, 0, 0, 0, 0, 0); }],
  ['different attribute storage', m => { m.geometry.setAttribute('position', new THREE.BufferAttribute(new Float64Array(m.geometry.attributes.position.array), 3)); }],
  ['custom attribute', m => { m.geometry.setAttribute('extra', new THREE.Float32BufferAttribute(new Float32Array(m.geometry.attributes.position.count), 1)); }],
  ['integer GPU attribute interpretation', m => { m.geometry.attributes.normal.gpuType = THREE.IntType; }],
  ['projective world transform', m => { m.parent.position.set(0, 0, 0); m.matrixAutoUpdate = false; m.matrix.elements[3] = .25; }],
  ['custom mesh prototype', m => Object.setPrototypeOf(m, Object.create(THREE.Mesh.prototype))],
  ['non-scalar index', m => { m.geometry.index.itemSize = 2; }],
  ['dynamic attributes', m => { m.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage); }],
  ['dynamic indices', m => { m.geometry.index.setUsage(THREE.DynamicDrawUsage); }],
]) test(`new equivalence does not enroll ${name}`, () => {
  const f = fixture(); mutate(f.meshes[1]); assert.equal(run(f).length, 0);
});

test('changed material values, replacements, and unsupported state invalidate previous equivalence', () => {
  const f = fixture(); assert.equal(run(f).length, 1);
  for (const [change, restore] of [
    [m => { m.roughness = .5; }, m => { m.roughness = .36; }],
    [m => m.color.setHex(0xff0000), m => m.color.setHex(0xc98f2c)],
    [m => { m.metalness = .8; }, m => { m.metalness = .05; }],
    [m => { m.map = new THREE.Texture(); }, m => { m.map = null; }],
  ]) {
    change(f.meshes[1].material); assert.equal(run(f).length, 0, 'mutated source must split immediately');
    restore(f.meshes[1].material); assert.equal(run(f).length, 1);
  }
  const oldRepresentative = f.meshes[0].material; f.meshes[0].material = ridge();
  assert.equal(run(f)[0].batch.material, f.meshes[0].material, 'equal-valued replacement must replace the old owned representative');
  assert.notEqual(f.batcher.batches[0].batch.material, oldRepresentative);
  const original = f.meshes[1].material;
  f.meshes[1].material = ridge(); f.meshes[1].material.roughness = .2;
  assert.equal(run(f).length, 0);
  f.meshes[1].material = original; assert.equal(run(f).length, 1);
  f.meshes[1].onAfterShadow = () => {}; assert.equal(run(f).length, 0);
});

test('eligible roof attribute/index updates and replacements refresh copied payloads without rebuilding unchanged frames', () => {
  const f = fixture(); let batch = run(f)[0].batch;
  assert.equal(run(f)[0].batch, batch, 'unchanged static frame keeps the batch');
  const geometry = f.meshes[1].geometry;
  for (const replace of [false, true]) {
    if (replace) geometry.setAttribute('position', geometry.attributes.position.clone());
    const position = geometry.attributes.position;
    position.setX(0, position.getX(0) + 1); position.needsUpdate = true;
    geometry.computeBoundingSphere();
    const result = run(f)[0]; assert.notEqual(result.batch, batch, 'dirty attribute or replacement rebuilds');
    assertBatchPayload(result.batch, result.entries); batch = result.batch;
    if (replace) geometry.setIndex(geometry.index.clone());
    const index = geometry.index, first = index.getX(0);
    index.setX(0, index.getX(1)); index.setX(1, first); index.needsUpdate = true;
    const changed = run(f)[0]; assert.notEqual(changed.batch, batch, 'dirty index or replacement rebuilds');
    assertBatchPayload(changed.batch, changed.entries); batch = changed.batch;
  }
});

test('a transformed scene disables only new cross-material equivalence to avoid applying its transform twice', () => {
  const f = fixture(); assert.equal(run(f).length, 1);
  f.scene.position.x = 10; assert.equal(run(f).length, 0);
  f.scene.position.x = 0; assert.equal(run(f).length, 1);
});

test('batch payload retains every source position, normal, UV and index with current world transforms', () => {
  const f = fixture(); f.parent.rotation.y = .2; f.parent.scale.set(1.2, .9, 1.1);
  f.batcher.begin(); assert.equal(f.batcher.batches.length, 1);
  const { batch, entries } = f.batcher.batches[0];
  assertBatchPayload(batch, entries);
  f.batcher.end(); f.parent.position.x += 10; f.batcher.begin();
  for (const { mesh, id } of entries) {
    const matrix = new THREE.Matrix4(); batch.getMatrixAt(id, matrix);
    assert.deepEqual(matrix.elements, mesh.matrixWorld.elements.map(Math.fround));
  }
  f.batcher.end();
});

test('source visibility, per-object frustum culling, receive flags and shadow geometry survive', () => {
  const f = fixture(); f.meshes[0].position.set(0, 0, 0); f.meshes[1].position.set(1000, 0, 0);
  f.parent.position.set(0, 0, 0); f.meshes[1].castShadow = false;
  const camera = new THREE.PerspectiveCamera(60, 1, .1, 100);
  camera.position.set(0, 0, 10); camera.lookAt(0, 0, 0); camera.updateMatrixWorld(true);
  f.batcher.begin(); assert.equal(f.batcher.batches.length, 1);
  const { batch, entries } = f.batcher.batches[0];
  assert.equal(batch.receiveShadow, true); assert.equal(batch.castShadow, true); assert.equal(batch.perObjectFrustumCulled, true);
  batch.onBeforeRender({ coordinateSystem: THREE.WebGLCoordinateSystem }, f.scene, camera, batch.geometry, batch.material);
  assert.equal(batch._multiDrawCount, 1); assert.equal(batch._multiDrawCounts[0], f.meshes[0].geometry.index.count);
  batch.onBeforeShadow({ coordinateSystem: THREE.WebGLCoordinateSystem }, batch, camera, camera, batch.geometry, new THREE.MeshDepthMaterial());
  assert.equal(batch.getVisibleAt(entries[0].id), true); assert.equal(batch.getVisibleAt(entries[1].id), false);
  assert.equal(batch._multiDrawCount, 1);
  batch.onAfterShadow(); assert.equal(batch.getVisibleAt(entries[1].id), true);
  f.batcher.end(); assert.ok(f.meshes.every(m => m.visible));
  f.parent.visible = false; f.batcher.begin();
  assert.ok(entries.every(e => !batch.getVisibleAt(e.id))); assert.equal(batch.castShadow, false);
  f.batcher.end(); assert.ok(f.meshes.every(m => m.visible));
  f.parent.visible = true; f.meshes[1].receiveShadow = false;
  assert.equal(run(f).length, 0, 'receivers with different flags stay separate');
});

test('rebuild and disposal release only batch-owned buffers, never source geometry, material or textures', () => {
  const f = fixture(), resources = f.meshes.flatMap(m => [m.geometry, m.material]); let sourceDisposals = 0, batchDisposals = 0;
  resources.forEach(r => r.addEventListener('dispose', () => sourceDisposals++));
  const batches = run(f); assert.equal(batches.length, 1);
  const [{ batch }] = batches;
  batch.geometry.addEventListener('dispose', () => batchDisposals++);
  batch._matricesTexture.addEventListener('dispose', () => batchDisposals++);
  f.meshes[1].material.roughness = .5; run(f);
  assert.equal(batchDisposals, 2); assert.equal(sourceDisposals, 0);
  f.batcher.dispose(); assert.equal(sourceDisposals, 0);
});

test('real Wumen reduces seven exact ridge and four finial materials to two render batches with all plaques and physics intact', () => {
  const expected = captureGate('午门'), lib = new TextureLibrary();
  for (const name of Object.keys(TEXTURE_SPECS)) lib.colors.set(name, new THREE.Texture());
  const scene = new THREE.Scene(), builder = new PalaceBuilder(scene, lib); builder.buildGate(expected.data);
  const plaque = scene.getObjectByName('wumen-south-gate-name-plaque'), group = scene.children[0];
  const original = meshFingerprint(scene), colliders = structuredClone(builder.colliders), walkables = structuredClone(builder.walkables);
  const plaqueGeometry = plaque.geometry, plaqueMaterials = plaque.material, metadata = structuredClone(plaque.userData);
  const triangles = root => { let count = 0; root.traverse(m => { if (m.isMesh) count += (m.geometry.index?.count ?? m.geometry.attributes.position.count) / 3; }); return count; };
  const originalTriangles = triangles(scene), batcher = new BatchedBuilder(scene); batcher.begin();
  const named = name => batcher.batches.filter(b => b.batch.material.name === name);
  assert.equal(named('roof_ridge_glaze').length, 1); assert.equal(named('roof_ridge_glaze')[0].entries.length, 7);
  assert.equal(named('roof_finial_gold').length, 1); assert.equal(named('roof_finial_gold')[0].entries.length, 4);
  assert.equal(batcher.batches.length, 2);
  for (const { batch, entries } of batcher.batches) {
    assertBatchPayload(batch, entries);
    assert.ok(batch.castShadow && batch.receiveShadow);
  }
  let visibleTriangles = 0; scene.traverse(m => { if (m.isMesh && m.visible) visibleTriangles += (m.geometry.index?.count ?? m.geometry.attributes.position.count) / 3; });
  assert.equal(visibleTriangles, originalTriangles);
  assert.equal(plaque.parent, group); assert.equal(plaque.visible, true); assert.equal(plaque.geometry, plaqueGeometry); assert.equal(plaque.material, plaqueMaterials);
  assert.deepEqual(plaque.userData, metadata); assert.ok(plaque.castShadow && plaque.receiveShadow);
  batcher.end(); assert.equal(meshFingerprint(scene), original); assert.equal(triangles(scene), originalTriangles);
  assert.deepEqual(structuredClone(builder.colliders), colliders); assert.deepEqual(structuredClone(builder.walkables), walkables);
  const d = plaque.userData.gatePlaque.dimensions, origin = new THREE.Vector3(3, 25, expected.data.position.z - 40);
  const target = plaque.localToWorld(new THREE.Vector3(0, d.innerHeight / 4, d.depth)), direction = target.sub(origin);
  const hit = new THREE.Raycaster(origin, direction.clone().normalize(), 0, direction.length() + 1e-5).intersectObject(group, true)[0];
  assert.equal(hit.object, plaque); assert.equal(hit.face.materialIndex, 1);
  batcher.dispose(); builder.dispose();
});
