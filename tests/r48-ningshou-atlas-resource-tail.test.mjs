import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { resourceBudget } from './lib/resource-budget.mjs';
// CPU ownership/atlas registration only, not GPU acceptance or a source claim
// that every old/default plaque is historically supported. Original R35 remains.
function disposals(resource) {
  let count = 0;
  resource.addEventListener('dispose', () => count++);
  return () => count;
}

function zoneFixture(t) {
  const originalDocument = globalThis.document;
  const context = new Proxy({}, { get: () => () => ({ data: [] }), set: () => true });
  globalThis.document = {
    createElement: () => ({ getContext: () => context, width: 0, height: 0 }),
    createElementNS: () => ({ addEventListener() {}, removeEventListener() {} }),
  };
  t.after(() => { globalThis.document = originalDocument; });
  const sharedTexture = new THREE.Texture(), materials = new Map();
  const library = {
    material(name) {
      if (!materials.has(name)) materials.set(name, new THREE.MeshStandardMaterial({ name, map: sharedTexture }));
      return materials.get(name);
    },
    tileSize: () => 1,
    aspect: () => 1,
  };
  const source = JSON.parse(fs.readFileSync(new URL('../data/zones/ningshou.json', import.meta.url)));
  assert.equal(source.items.length, 50, 'exercise the complete shipped zone, including its plaque atlas');
  assert.equal(source.items.filter(item => item.kind === 'nineDragonWall').length, 1);
  t.after(() => { for (const material of materials.values()) material.dispose(); sharedTexture.dispose(); });
  return { library, sharedTexture, materials, config: source };
}

test('R48 current full Ningshou executes the formerly masked four-reload photo/plaque resource ownership tail', t => {
  const { library, config, sharedTexture, materials } = zoneFixture(t);
  const sharedTextureDisposals = disposals(sharedTexture), retired = [];
  let expectedBudget, expectedNavigation, expectedLabels;
  for (let cycle = 0; cycle < 4; cycle++) {
    const builder = new ZoneBase(library, config), data = builder.build();
    const faces = [], plaques = [];
    data.group.traverse(object => {
      if (object.material?.name === 'kit_nine_dragon_face') faces.push(object);
      if (object.material?.name === 'kit_plaques') plaques.push(object);
    });
    assert.equal(faces.length, 1);
    assert.equal(plaques.length, 1);
    // The old R35 fixed count is deliberately NOT rewritten. Assert the actual
    // current registration-to-render contract before executing its ownership tail.
    assert.ok(builder.kit.plaques.length > 0);
    assert.ok(builder.kit.plaques.every(p => typeof p.text === 'string' && p.text.trim()));
    assert.equal(plaques[0].geometry.index?.count ?? plaques[0].geometry.attributes.position.count,
      builder.kit.plaques.length * 6, 'every registered plaque remains exactly two atlas-rendered triangles');
    const labels = builder.kit.plaques.map(p => p.text);
    if (cycle === 0) expectedLabels = labels;
    else assert.deepEqual(labels, expectedLabels, 'all current label registrations survive reload unchanged');
    const material = faces[0].material, texture = material.map;
    const atlasMaterial = plaques[0].material, atlas = atlasMaterial.map;
    assert.ok(texture?.isTexture);
    assert.notEqual(texture, sharedTexture, 'photo is owned by this zone, not the shared library');
    assert.equal(texture.colorSpace, THREE.SRGBColorSpace);
    assert.equal(texture.anisotropy, 8);
    assert.ok(atlas?.isCanvasTexture);
    assert.notEqual(atlas, texture);
    const textureCount = disposals(texture), materialCount = disposals(material);
    const atlasCount = disposals(atlas), atlasMaterialCount = disposals(atlasMaterial);
    retired.push(textureCount, atlasCount);
    const budget = resourceBudget([data.group]);
    const navigation = JSON.stringify({ colliders: data.colliders, walkables: data.walkables, mapItems: data.mapItems });
    if (cycle === 0) { expectedBudget = budget; expectedNavigation = navigation; }
    else {
      assert.deepEqual(budget, expectedBudget, 'reload preserves the exact geometry/material inventory');
      assert.equal(navigation, expectedNavigation, 'reload preserves collision and map data');
    }
    const sharedMaterialCounts = [...materials.values()].map(disposals);
    builder.dispose();
    builder.dispose();
    assert.equal(materialCount(), 1);
    assert.equal(atlasMaterialCount(), 1);
    assert.equal(atlasCount(), 1, `plaque atlas generation ${cycle} is released once`);
    assert.equal(textureCount(), 1, `private photo texture generation ${cycle} is released once`);
    retired.forEach(count => assert.equal(count(), 1));
    assert.equal(sharedTextureDisposals(), 0, 'zone cannot release borrowed textures');
    sharedMaterialCounts.forEach(count => assert.equal(count(), 0, 'zone cannot release borrowed materials'));
  }
});
