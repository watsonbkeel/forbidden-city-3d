import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { TextureLibrary, TEXTURE_SPECS } from '../../src/utils/TextureLibrary.js';
import { TextureGenerator } from '../../src/utils/TextureGenerator.js';
import { applyPlanarUV } from '../../src/utils/GeometryUV.js';

// Canvas drawing is not available in Node. Keep the real texture generator,
// TextureLibrary, Three texture and geometry/UV code; only stub the 2D context.
const context = new Proxy({}, {
  get: (_, key) => key === 'createLinearGradient'
    ? () => ({ addColorStop() {} })
    : () => ({ data: [] }),
  set: () => true,
});
globalThis.document ??= {
  createElement: () => ({ getContext: () => context, width: 0, height: 0 }),
  createElementNS: () => ({ addEventListener() {}, removeEventListener() {} }),
};

test('ground fallback keeps the library metre-scaled UV contract instead of double-tiling', () => {
  const library = new TextureLibrary();
  const generated = TextureGenerator.createGroundTexture();
  // The legacy generator remains unchanged for its other callers.
  assert.deepEqual(generated.repeat.toArray(), [20, 20]);
  generated.dispose();

  const fallback = library.color('ground_brick');
  assert.equal(library.tileSize('ground_brick'), 4);
  assert.deepEqual(fallback.repeat.toArray(), [1, 1]);

  const geometry = applyPlanarUV(new THREE.PlaneGeometry(4, 4), 'z', 4);
  const uv = geometry.attributes.uv;
  const u = Array.from({ length: uv.count }, (_, i) => uv.getX(i) * fallback.repeat.x);
  const v = Array.from({ length: uv.count }, (_, i) => uv.getY(i) * fallback.repeat.y);
  assert.equal(Math.max(...u) - Math.min(...u), 1);
  assert.equal(Math.max(...v) - Math.min(...v), 1);
  assert.equal(library.color('ground_brick'), fallback, 'fallback is shared, not cloned');
  assert.equal(library.owns(fallback), true);
  geometry.dispose();
  library.dispose();
});

test('configure applies unit repeats identically to color and normal textures for every spec', () => {
  const library = new TextureLibrary({ anisotropy: 8 });
  for (const [name, spec] of Object.entries(TEXTURE_SPECS)) {
    for (const kind of ['color', 'normal']) {
      const texture = new THREE.Texture();
      texture.repeat.set(20, 13);
      const result = library.configure(texture, name, kind);
      assert.equal(result, texture, `${name}/${kind}: retains object identity`);
      assert.deepEqual(texture.repeat.toArray(), [1, 1], `${name}/${kind}`);
      assert.equal(texture.wrapS, spec.wrap === 'clamp' ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping);
      assert.equal(texture.wrapT, spec.wrap === 'repeat' ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping);
      assert.equal(texture.colorSpace, kind === 'color' ? THREE.SRGBColorSpace : THREE.NoColorSpace);
      assert.equal(texture.anisotropy, 8);
      assert.equal(texture.name, `${name}_${kind}`);
      assert.equal(texture.version, 1);
      texture.dispose();
    }
  }
  library.dispose();
});

test('all procedural fallbacks retain documented tile size and shared material ownership', () => {
  const library = new TextureLibrary();
  for (const [name, spec] of Object.entries(TEXTURE_SPECS)) {
    const material = library.material(name);
    assert.equal(library.tileSize(name), spec.tileSize);
    assert.deepEqual(material.map.repeat.toArray(), [1, 1], name);
    assert.equal(material.map, library.color(name), name);
    assert.equal(library.material(name), material, name);
    assert.equal(library.owns(material), true);
    assert.equal(library.owns(material.map), true);
  }
  assert.equal(library.allTextures().length, Object.keys(TEXTURE_SPECS).length);
  library.dispose();
});

test('failed file loading returns a correctly scaled usable fallback without changing manifest scale', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    json: async () => ({
      textures: { ground_brick: { color: 'missing.webp', tileSize: 8 } },
    }),
  }));
  t.mock.method(console, 'warn', () => {});
  const library = new TextureLibrary();
  t.mock.method(library.loader, 'loadAsync', async () => { throw new Error('test missing image'); });
  const progress = [];
  assert.equal(await library.load((done, total) => progress.push([done, total])), library);
  assert.deepEqual(progress, [[1, 1]]);
  assert.equal(library.has('ground_brick'), false);
  assert.equal(library.tileSize('ground_brick'), 8, 'manifest dimensions remain authoritative');
  assert.deepEqual(library.color('ground_brick').repeat.toArray(), [1, 1]);
  assert.equal(library.material('ground_brick').normalMap, null);
  library.dispose();
});
