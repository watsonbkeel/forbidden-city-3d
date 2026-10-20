import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { PostProcessing } from '../src/render/PostProcessing.js';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { resourceBudget } from './lib/resource-budget.mjs';

// Real Three r162 targets, passes, materials and disposal events. Only the
// renderer/DOM boundaries are substituted; this is not a GPU-memory test.
function pipelineFixture(t, quality = 'high') {
  const renderer = {
    getSize: out => out.set(320, 180),
    getPixelRatio: () => 1,
  };
  const pipeline = new PostProcessing(renderer, new THREE.Scene(), new THREE.PerspectiveCamera());
  pipeline.init(quality);
  t.after(() => pipeline.dispose());
  return pipeline;
}

function disposals(resource) {
  let count = 0;
  resource.addEventListener('dispose', () => count++);
  return () => count;
}

test('every high-to-low switch releases the Bloom high-pass material exactly once', t => {
  const pipeline = pipelineFixture(t), retired = [];
  for (let cycle = 0; cycle < 4; cycle++) {
    const material = pipeline.bloomPass.materialHighPassFilter;
    const count = disposals(material);
    retired.push(count);
    assert.equal(count(), 0);
    pipeline.setQuality('high');
    assert.equal(pipeline.bloomPass.materialHighPassFilter, material, 'same quality retains active ownership');
    pipeline.setQuality('low');
    assert.equal(count(), 1, `high-pass generation ${cycle} is released`);
    assert.equal(pipeline.bloomPass, null);
    retired.forEach(previous => assert.equal(previous(), 1));
    pipeline.setQuality('high');
  }
  const final = disposals(pipeline.bloomPass.materialHighPassFilter);
  pipeline.dispose();
  pipeline.dispose();
  assert.equal(final(), 1, 'active high-pass material is released once at application teardown');
  retired.forEach(previous => assert.equal(previous(), 1, 'retired materials are never released twice'));
});

test('a low-quality pipeline can dispose without a Bloom high-pass material', t => {
  const pipeline = pipelineFixture(t, 'low');
  assert.equal(pipeline.bloomPass, null);
  assert.doesNotThrow(() => pipeline.dispose());
  assert.doesNotThrow(() => pipeline.dispose());
});

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

test('full Ningshou zone releases both photo and plaque atlas while shared textures survive reloads', t => {
  const { library, config, sharedTexture, materials } = zoneFixture(t);
  const sharedTextureDisposals = disposals(sharedTexture), retired = [];
  let expectedBudget, expectedNavigation;
  for (let cycle = 0; cycle < 4; cycle++) {
    const builder = new ZoneBase(library, config), data = builder.build();
    const faces = [], plaques = [];
    data.group.traverse(object => {
      if (object.material?.name === 'kit_nine_dragon_face') faces.push(object);
      if (object.material?.name === 'kit_plaques') plaques.push(object);
    });
    assert.equal(faces.length, 1);
    assert.equal(plaques.length, 1);
    assert.equal(builder.kit.plaques.length, 30, 'finish must run the real plaque-atlas path after photo registration');
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
