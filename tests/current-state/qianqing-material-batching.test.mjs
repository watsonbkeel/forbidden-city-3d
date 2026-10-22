import '../lib/inner-palace-fixture.mjs'; // CPU Canvas surface for the real gate plaque.
import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { PalaceBuilder } from '../../src/scene/PalaceBuilder.js';
import { buildQianqingGate } from '../../src/scene/palace/special/QianqingGate.js';
import { PALACE_LAYOUT } from '../../src/scene/Layout.js';
import { solidMaterialNameAt } from '../../src/render/SolidMaterialBatch.js';

const names = ['qianqing_window_grid', 'qianqing_window_frame', 'qianqing_window_shadow',
  'qianqing_glaze_green', 'qianqing_glaze_gold', 'qianqing_screen_center'];
const json = value => JSON.stringify(value);

function fixture() {
  const cached = new Map();
  const library = {
    material: name => cached.get(name) ?? (cached.set(name, new THREE.MeshStandardMaterial({ name })), cached.get(name)),
    tileSize: () => 1, aspect: () => 1,
    owns: material => [...cached.values()].includes(material),
  };
  const scene = new THREE.Scene();
  const builder = new PalaceBuilder(scene, library);
  const finish = builder.finish.bind(builder);
  let before;
  const disposeCounts = new Map();
  const watch = resource => {
    disposeCounts.set(resource, 0);
    resource.addEventListener('dispose', () => disposeCounts.set(resource, disposeCounts.get(resource) + 1));
  };
  // Inspect the real production finish output immediately before the new step.
  // This is a precise baseline without a second synthetic geometry builder.
  builder.finish = group => {
    const object = finish(group);
    before = {
      count: object.children.length,
      metadata: json(object.userData),
      position: object.position.toArray(),
      colliders: json(builder.colliders), walkables: json(builder.walkables),
      selected: object.children.filter(mesh => names.includes(mesh.material?.name)).map(mesh => ({
        geometry: mesh.geometry, material: mesh.material,
        attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([name, attribute]) => [name, Array.from(attribute.array)])),
      })),
      others: object.children.filter(mesh => !names.includes(mesh.material?.name)).map(mesh => ({
        mesh, geometry: mesh.geometry, material: mesh.material,
        attributes: Object.fromEntries(Object.entries(mesh.geometry.attributes).map(([name, attribute]) => [name, Array.from(attribute.array)])),
      })),
    };
    for (const source of before.selected) { watch(source.geometry); watch(source.material); }
    return object;
  };
  const object = buildQianqingGate(builder, PALACE_LAYOUT.find(item => item.name === '乾清门'));
  return { object, builder, scene, before, disposeCounts, watch, cached };
}

test('real Qianqing Gate replaces exactly six solid materials with one draw and preserves all structural data', () => {
  const { object, builder, before } = fixture();
  const batch = object.children.find(mesh => mesh.userData.solidMaterialBatch);
  assert.ok(batch, 'the dedicated six-material batch must exist');
  assert.equal(before.selected.length, 6);
  assert.equal(object.children.length, before.count - 5);
  assert.equal(batch.geometry.groups.length, 0);
  assert.deepEqual(batch.userData.solidMaterialBatch.sources.map(s => s.materialName).sort(), [...names].sort());
  assert.deepEqual(object.position.toArray(), before.position);
  assert.equal(json(object.userData), before.metadata);
  assert.equal(json(builder.colliders), before.colliders, 'all columns, door leaves, stair/connector rails and angled screen colliders are unchanged');
  assert.equal(json(builder.walkables), before.walkables, 'all three stair flights, landing and raised connector remain identical');
  for (const key of ['position', 'normal', 'uv']) {
    assert.deepEqual(Array.from(batch.geometry.attributes[key].array), before.selected.flatMap(s => s.attributes[key]), key);
  }
  let vertex = 0;
  for (const source of before.selected) {
    const count = source.attributes.position.length / 3;
    for (let i = 0; i < count; i++, vertex++) {
      const color = batch.geometry.attributes.color;
      assert.deepEqual([color.getX(vertex), color.getY(vertex), color.getZ(vertex)], source.material.color.toArray().map(Math.fround));
      assert.equal(batch.geometry.attributes.solidRoughness.getX(vertex), Math.fround(source.material.roughness));
      assert.equal(solidMaterialNameAt(batch, Math.floor(vertex / 3)), source.material.name);
    }
  }
  assert.equal(vertex, batch.geometry.attributes.position.count);
  for (const other of before.others) {
    assert.ok(object.children.includes(other.mesh));
    assert.equal(other.mesh.geometry, other.geometry);
    assert.equal(other.mesh.material, other.material);
    for (const key of Object.keys(other.attributes)) assert.deepEqual(Array.from(other.mesh.geometry.attributes[key].array), other.attributes[key]);
  }
  assert.equal(batch.castShadow, true);
  assert.equal(batch.receiveShadow, true);
  builder.dispose();
});

test('real builder disposes old/new resources exactly once while cached library materials remain owned by the library', () => {
  const { object, builder, scene, before, disposeCounts, watch, cached } = fixture();
  const batch = object.children.find(mesh => mesh.userData.solidMaterialBatch);
  assert.ok(batch, 'the batch must be registered in the real builder');
  watch(batch.geometry); watch(batch.material);
  for (const material of cached.values()) watch(material);
  assert.ok(builder.ownedMaterials.includes(batch.material));
  for (const source of before.selected) {
    assert.equal(disposeCounts.get(source.geometry), 1, 'replaced GPU geometry released immediately');
    assert.equal(disposeCounts.get(source.material), 0, 'cached source material remains caller-owned');
  }
  builder.dispose();
  builder.dispose();
  assert.equal(scene.children.length, 0);
  for (const source of before.selected) {
    assert.equal(disposeCounts.get(source.geometry), 1);
    assert.equal(disposeCounts.get(source.material), 1);
  }
  assert.equal(disposeCounts.get(batch.geometry), 1);
  assert.equal(disposeCounts.get(batch.material), 1);
  for (const material of cached.values()) assert.equal(disposeCounts.get(material), 0);
});
