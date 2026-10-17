import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import * as THREE from 'three';

const url = new URL('../../src/render/SolidMaterialBatch.js', import.meta.url);
const batching = existsSync(url) ? await import(url) : null;
test('solid material batching has a dedicated, explicit helper', () => {
  assert.equal(typeof batching?.batchSolidMaterials, 'function');
});
const realTest = (name, fn) => test(name, { skip: !batching }, fn);
const solid = (name, color, roughness) => new THREE.MeshStandardMaterial({ name, color, roughness });

function fixture() {
  const root = new THREE.Group();
  root.position.set(5, 7, -3);
  root.rotation.set(0.2, -0.3, 0.1);
  root.scale.set(1.1, 0.9, 1.3);
  const materials = [solid('red', 0xa33214, 0.36), solid('blue', 0x184cbd, 0.85)];
  const meshes = materials.map((material, i) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(2 + i, 3, 1), material);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.position.set(i * 4, i, -i);
    mesh.rotation.set(0.1 * i, -0.4 * i, 0.2 * i);
    mesh.scale.set(i ? -1.2 : 1, 1.3, 0.8);
    root.add(mesh);
    return mesh;
  });
  const other = new THREE.Mesh(new THREE.BoxGeometry(), solid('untouched', 0x33aa22, 0.5));
  root.add(other);
  return { root, materials, meshes, other };
}

function expectedAttributes(mesh) {
  mesh.updateMatrix();
  const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
  if (!mesh.matrix.equals(new THREE.Matrix4())) geometry.applyMatrix4(mesh.matrix);
  if (mesh.matrix.determinant() < 0) for (const attribute of Object.values(geometry.attributes)) {
    for (let i = 0; i < attribute.count; i += 3) for (let j = 0; j < attribute.itemSize; j++) {
      const a = (i + 1) * attribute.itemSize + j, b = (i + 2) * attribute.itemSize + j;
      [attribute.array[a], attribute.array[b]] = [attribute.array[b], attribute.array[a]];
    }
  }
  const result = Object.fromEntries(Object.entries(geometry.attributes).map(([name, a]) => [name, Array.from(a.array)]));
  geometry.dispose();
  return result;
}

realTest('all triangles, transformed positions, normals, UVs and original linear colors/roughness survive', () => {
  const { root, materials, meshes, other } = fixture();
  const expected = meshes.map(expectedAttributes);
  root.updateMatrixWorld(true);
  const matrix = root.matrixWorld.clone();
  const mesh = batching.batchSolidMaterials(root, materials, { name: 'test_batch' });
  root.updateMatrixWorld(true);
  assert.deepEqual(root.children, [other, mesh]);
  assert.deepEqual(root.matrixWorld.elements, matrix.elements, 'root world transform remains untouched');
  assert.equal(mesh.geometry.index, null);
  assert.equal(mesh.geometry.groups.length, 0, 'one draw, not material groups');
  for (const name of ['position', 'normal', 'uv']) {
    assert.deepEqual(Array.from(mesh.geometry.attributes[name].array), expected.flatMap(a => a[name]), name);
  }
  const colors = mesh.geometry.attributes.color, roughness = mesh.geometry.attributes.solidRoughness;
  let vertex = 0;
  for (let i = 0; i < meshes.length; i++) {
    const material = materials[i], count = expected[i].position.length / 3;
    for (let j = 0; j < count; j++, vertex++) {
      assert.deepEqual([colors.getX(vertex), colors.getY(vertex), colors.getZ(vertex)], material.color.toArray().map(Math.fround));
      assert.equal(roughness.getX(vertex), Math.fround(material.roughness));
      assert.equal(batching.solidMaterialNameAt(mesh, Math.floor(vertex / 3)), material.name);
    }
  }
  assert.equal(vertex, mesh.geometry.attributes.position.count);
  assert.equal(batching.solidMaterialNameAt(mesh, -1), null);
  assert.equal(batching.solidMaterialNameAt(mesh, vertex / 3), null);
  assert.equal(batching.solidMaterialNameAt(other, 0), 'untouched');
  assert.equal(mesh.castShadow, true);
  assert.equal(mesh.receiveShadow, true);
  assert.ok(mesh.geometry.boundingBox && mesh.geometry.boundingSphere);
});

realTest('post-finish identity geometry retains every position and normal bit exactly', () => {
  const { root, materials, meshes } = fixture();
  for (const mesh of meshes) {
    mesh.position.set(0, 0, 0); mesh.rotation.set(0, 0, 0); mesh.scale.set(1, 1, 1);
    // A non-unit stored normal catches an unnecessary applyMatrix4(identity).
    mesh.geometry.attributes.normal.array[0] = 0.12345678;
  }
  const expected = meshes.map(expectedAttributes);
  const batch = batching.batchSolidMaterials(root, materials);
  for (const key of ['position', 'normal', 'uv']) {
    assert.deepEqual(Array.from(batch.geometry.attributes[key].array), expected.flatMap(a => a[key]));
  }
});

realTest('common standard material scalars and render flags survive, with a stable shader cache key', () => {
  const { root, materials, meshes } = fixture();
  for (const material of materials) {
    material.metalness = 0.3;
    material.emissive.set(0x112233);
    material.emissiveIntensity = 0.2;
    material.side = THREE.DoubleSide;
    material.envMapIntensity = 0.7;
    material.polygonOffset = true;
    material.polygonOffsetFactor = 2;
  }
  for (const mesh of meshes) { mesh.castShadow = false; mesh.layers.set(2); mesh.renderOrder = 7; mesh.frustumCulled = false; }
  const mesh = batching.batchSolidMaterials(root, materials);
  for (const key of ['metalness', 'emissiveIntensity', 'side', 'envMapIntensity', 'polygonOffset', 'polygonOffsetFactor']) {
    assert.equal(mesh.material[key], materials[0][key], key);
  }
  assert.ok(mesh.material.emissive.equals(materials[0].emissive));
  assert.equal(mesh.material.vertexColors, true);
  assert.deepEqual(mesh.material.color.toArray(), [1, 1, 1]);
  assert.equal(mesh.material.roughness, 1);
  assert.equal(mesh.castShadow, false);
  assert.equal(mesh.receiveShadow, true);
  assert.equal(mesh.layers.mask, 4);
  assert.equal(mesh.renderOrder, 7);
  assert.equal(mesh.frustumCulled, false);
  const other = fixture();
  const another = batching.batchSolidMaterials(other.root, other.materials);
  assert.equal(mesh.material.customProgramCacheKey(), another.material.customProgramCacheKey());
  assert.match(mesh.material.customProgramCacheKey(), /solid-material-batch.*v1/);
  const shader = { vertexShader: THREE.ShaderLib.standard.vertexShader, fragmentShader: THREE.ShaderLib.standard.fragmentShader };
  mesh.material.onBeforeCompile(shader);
  assert.match(shader.vertexShader, /attribute float solidRoughness;/);
  assert.match(shader.vertexShader, /vSolidRoughness = solidRoughness;/);
  assert.match(shader.fragmentShader, /#include <roughnessmap_fragment>\s+roughnessFactor \*= vSolidRoughness;/);
  assert.ok(shader.fragmentShader.indexOf('roughnessFactor *= vSolidRoughness;') < shader.fragmentShader.indexOf('#include <lights_physical_fragment>'));
  assert.throws(() => mesh.material.onBeforeCompile({ vertexShader: '', fragmentShader: '' }), /shader/i);
});

realTest('source geometries are disposed once, source materials remain caller-owned, and unrelated resources stay live', () => {
  const { root, materials, meshes, other } = fixture();
  const disposed = new Map();
  for (const resource of [...meshes.map(m => m.geometry), ...materials, other.geometry, other.material]) {
    disposed.set(resource, 0);
    resource.addEventListener('dispose', () => disposed.set(resource, disposed.get(resource) + 1));
  }
  batching.batchSolidMaterials(root, materials);
  for (const mesh of meshes) assert.equal(disposed.get(mesh.geometry), 1);
  for (const resource of [...materials, other.geometry, other.material]) assert.equal(disposed.get(resource), 0);
});

for (const [label, modify] of [
  ['texture', f => { f.materials[0].map = new THREE.Texture(); }],
  ['transparency', f => { f.materials[0].transparent = true; }],
  ['opacity', f => { f.materials[0].opacity = 0.5; }],
  ['alpha test', f => { f.materials[0].alphaTest = 0.1; }],
  ['existing vertex colors', f => { f.materials[0].vertexColors = true; }],
  ['incompatible metalness', f => { f.materials[0].metalness = 0.7; }],
  ['incompatible shadows', f => { f.meshes[0].castShadow = false; }],
  ['custom before-shadow callback', f => { f.meshes[0].onBeforeShadow = () => {}; }],
  ['custom after-shadow callback', f => { f.meshes[0].onAfterShadow = () => {}; }],
  ['independently frozen world transform', f => {
    f.meshes[0].matrixWorldAutoUpdate = false;
    f.meshes[0].matrixWorld.makeTranslation(100, 0, 0);
  }],
  ['custom shader', f => { f.materials[0].onBeforeCompile = () => {}; }],
  ['unknown material feature', f => { f.materials[0].futureProperty = 42; }],
  ['partial draw range', f => { f.meshes[0].geometry.setDrawRange(0, 3); }],
  ['existing geometry colors', f => { f.meshes[0].geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(72), 3)); }],
  ['morph geometry', f => { f.meshes[0].geometry.morphAttributes.position = [f.meshes[0].geometry.attributes.position.clone()]; }],
  ['singular transform', f => { f.meshes[0].scale.x = 0; }],
]) realTest(`rejects ${label} without changing the source tree or disposing resources`, () => {
  const f = fixture();
  modify(f);
  f.meshes.forEach(mesh => mesh.updateMatrix());
  const children = [...f.root.children];
  const states = f.meshes.map(mesh => ({
    matrix: mesh.matrix.clone(), matrixWorld: mesh.matrixWorld.clone(),
    geometry: mesh.geometry, material: mesh.material,
    attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([key, a]) => [key, Array.from(a.array)])),
  }));
  let disposals = 0;
  for (const mesh of f.meshes) for (const resource of [mesh.geometry, mesh.material]) resource.addEventListener('dispose', () => disposals++);
  assert.throws(() => batching.batchSolidMaterials(f.root, f.materials), /solid.*batch/i);
  assert.deepEqual(f.root.children, children);
  assert.equal(disposals, 0);
  for (let i = 0; i < f.meshes.length; i++) {
    const mesh = f.meshes[i], state = states[i];
    assert.equal(mesh.parent, f.root);
    assert.ok(mesh.matrix.equals(state.matrix));
    assert.ok(mesh.matrixWorld.equals(state.matrixWorld));
    assert.equal(mesh.geometry, state.geometry);
    assert.equal(mesh.material, state.material);
    for (const key of Object.keys(state.attributes)) assert.deepEqual(Array.from(mesh.geometry.attributes[key].array), state.attributes[key]);
  }
});
