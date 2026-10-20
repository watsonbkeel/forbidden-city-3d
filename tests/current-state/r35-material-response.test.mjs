import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { TextureLibrary, TEXTURE_SPECS } from '../../src/utils/TextureLibrary.js';

const response = {
  ground_brick: { roughness: .85, normalScale: .65 },
  stone_slab: { roughness: .85, normalScale: .5 },
  wall_red: { roughness: .92, normalScale: .8 },
  wood_column: { roughness: .65, normalScale: .6 },
};

function fixture(quality = 'hd', withNormals = true) {
  const library = new TextureLibrary({ quality });
  library.manifest = JSON.parse(fs.readFileSync(
    new URL(`../../public/textures/${quality}/manifest.json`, import.meta.url),
  ));
  // No raster claim: real asset dimensions and production configuration, with
  // image decoding replaced by dimension-only images in this CPU unit test.
  for (const name of Object.keys(TEXTURE_SPECS)) {
    const info = library.manifest.textures[name];
    library.colors.set(name, library.configure(new THREE.Texture(info[quality]), name, 'color'));
    if (withNormals && info.normal) {
      library.normals.set(name, library.configure(new THREE.Texture(info[quality]), name, 'normal'));
    }
  }
  return library;
}

for (const quality of ['hd', 'sd']) {
  test(`${quality}: four route surfaces use bounded response defaults, not albedo or scale changes`, () => {
    const library = fixture(quality);
    for (const [name, expected] of Object.entries(response)) {
      const material = library.material(name);
      assert.equal(material.roughness, expected.roughness, `${name}: roughness`);
      assert.deepEqual(material.normalScale.toArray(), [expected.normalScale, expected.normalScale], name);
      assert.equal(material.color.getHex(), 0xffffff, `${name}: no albedo tint`);
      assert.equal(material.metalness, 0, `${name}: nonmetallic`);
      assert.equal(material.map, library.colors.get(name), `${name}: original color texture`);
      assert.equal(material.normalMap, library.normals.get(name), `${name}: original normal texture`);
      assert.equal(library.tileSize(name), TEXTURE_SPECS[name].tileSize);
      assert.deepEqual(material.map.repeat.toArray(), [1, 1]);
      assert.deepEqual(material.normalMap.repeat.toArray(), [1, 1]);
    }
    library.dispose();
  });
}

test('all other material defaults remain exactly neutral, including already mild marble', () => {
  const library = fixture();
  for (const name of Object.keys(TEXTURE_SPECS).filter(name => !Object.hasOwn(response, name))) {
    const material = library.material(name);
    assert.equal(material.roughness, .85, name);
    assert.deepEqual(material.normalScale.toArray(), [1, 1], name);
    assert.equal(material.color.getHex(), 0xffffff, name);
    assert.equal(material.metalness, 0, name);
  }
  library.dispose();
});

test('explicit roughness, color, metalness and scalar/zero/vector normal overrides win without mutating input', () => {
  const library = fixture();
  for (const name of Object.keys(response)) {
    for (const scale of [0, 1.5, [0, .35]]) {
      const params = { color: 0x55524e, roughness: .35, metalness: .1, normalScale: scale };
      const original = structuredClone(params);
      const material = library.material(name, params);
      assert.equal(material.roughness, .35, name);
      assert.equal(material.color.getHex(), 0x55524e, name);
      assert.equal(material.metalness, .1, name);
      assert.deepEqual(material.normalScale.toArray(), Array.isArray(scale) ? scale : [scale, scale], name);
      assert.deepEqual(params, original);
      assert.equal(library.material(name, params), material, 'same cache instance');
    }
  }
  library.dispose();
});

test('existing road, ground and interior roughness overrides remain authoritative', () => {
  const library = fixture();
  for (const [name, params] of [
    ['ground_brick', { roughness: .88, metalness: 0 }],
    ['stone_slab', { roughness: .75, metalness: 0 }],
    ['stone_slab', { color: 0x55524e, roughness: .35 }],
    ['stone_slab', { color: 0x55524e, roughness: .8 }],
  ]) {
    const material = library.material(name, params);
    assert.equal(material.roughness, params.roughness);
    assert.deepEqual(material.normalScale.toArray(), [response[name].normalScale, response[name].normalScale]);
    assert.equal(material.color.getHex(), params.color ?? 0xffffff);
  }
  library.dispose();
});

test('missing normal maps remain absent instead of allocating replacements or changing texture ownership', () => {
  const library = fixture('hd', false);
  for (const name of Object.keys(response)) {
    const material = library.material(name);
    assert.equal(material.normalMap, null);
    assert.deepEqual(material.normalScale.toArray(), [1, 1]);
    assert.equal(library.owns(material), true);
    assert.equal(library.owns(material.map), true);
    assert.equal(library.material(name), material);
  }
  assert.equal(library.normals.size, 0);
  assert.equal(library.allTextures().length, 22);
  library.dispose();
});

test('response variants reuse textures and preserve single-owner disposal with no extra resources', () => {
  const library = fixture();
  const textures = library.allTextures();
  const disposedTextures = new Map(textures.map(texture => [texture, 0]));
  for (const texture of textures) texture.addEventListener('dispose', () => {
    disposedTextures.set(texture, disposedTextures.get(texture) + 1);
  });
  const materials = [];
  for (const name of Object.keys(response)) {
    const original = library.material(name);
    const variant = library.material(name, { roughness: .42 });
    assert.notEqual(original, variant);
    assert.equal(original.map, variant.map);
    assert.equal(original.normalMap, variant.normalMap);
    materials.push(original, variant);
  }
  assert.equal(library.allTextures().length, textures.length);
  const disposedMaterials = new Map(materials.map(material => [material, 0]));
  for (const material of materials) material.addEventListener('dispose', () => {
    disposedMaterials.set(material, disposedMaterials.get(material) + 1);
  });
  library.dispose();
  assert.ok([...disposedTextures.values()].every(count => count === 1));
  assert.ok([...disposedMaterials.values()].every(count => count === 1));
  assert.equal(library.materials.size, 0);
  assert.equal(library.allTextures().length, 0);
});
