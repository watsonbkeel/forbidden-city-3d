import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TextureLibrary as CurrentTextureLibrary, TEXTURE_SPECS as currentSpecs} from '../../src/utils/TextureLibrary.js';
import {historicalR34ModuleURL} from '../lib/historical-r34-source-dependencies.mjs';

const {TextureLibrary: FrozenTextureLibrary, TEXTURE_SPECS: frozenSpecs} = await import(historicalR34ModuleURL('src/utils/TextureLibrary.js'));
function library(Library) {
  const result = new Library();
  for (const name of Object.keys(frozenSpecs)) {
    result.colors.set(name, new THREE.Texture());
    result.normals.set(name, new THREE.Texture());
  }
  return result;
}

test('historical material snapshots execute the independently frozen R34 class without redirecting raw production imports', async () => {
  assert.notEqual(FrozenTextureLibrary, CurrentTextureLibrary);
  assert.deepEqual(frozenSpecs, currentSpecs);
  const historical = library(FrozenTextureLibrary), current = library(CurrentTextureLibrary);
  try {
    for (const name of Object.keys(frozenSpecs)) {
      const material = historical.material(name);
      assert.equal(material.roughness, .85, name);
      assert.equal(material.metalness, 0, name);
      assert.deepEqual(material.normalScale.toArray(), [1, 1], name);
    }
    const old = new THREE.Texture(), live = new THREE.Texture();
    old.repeat.set(20, 20); live.repeat.set(20, 20);
    historical.configure(old, 'ground_brick', 'color');
    current.configure(live, 'ground_brick', 'color');
    assert.deepEqual(old.repeat.toArray(), [20, 20], 'frozen historical behavior is not silently patched');
    assert.deepEqual(live.repeat.toArray(), [1, 1], 'raw current behavior independently includes the actual R35 fix');
    assert.equal((await import('../../src/utils/TextureLibrary.js')).TextureLibrary, CurrentTextureLibrary);
    old.dispose(); live.dispose();
  } finally {
    historical.dispose(); current.dispose();
  }
});

test('independent R34 module transport accepts only explicitly registered source dependencies', () => {
  for (const name of ['src/unknown.js', '../src/utils/TextureLibrary.js', 'src/../utils/TextureLibrary.js', '__proto__', 'constructor', 'public/textures/hd/manifest.json']) {
    assert.throws(() => historicalR34ModuleURL(name), /registered independent R34 module/);
  }
  assert.match(historicalR34ModuleURL('src/utils/TextureLibrary.js'), /r34FrozenSource=2cd8189db462e34a2ffc5573a435db8a0a77cccb$/);
});
