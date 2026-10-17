import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { createSkylineRing } from '../../src/scene/sky/Skyline.js';
import { Environment } from '../../src/scene/Environment.js';
import { TextureLibrary } from '../../src/utils/TextureLibrary.js';
import { BatchedBuilder } from '../../src/render/BatchedBuilder.js';
import { ShadowSetup } from '../../src/render/ShadowSetup.js';
import { LAYOUT } from '../../src/config/constants.js';

function fixture(image = { width: 1211, height: 301 }) {
  const library = new TextureLibrary();
  const texture = library.configure(new THREE.Texture(image), 'skyline', 'color');
  library.colors.set('skyline', texture);
  return { library, texture, ring: createSkylineRing(library) };
}

function faceCounts(ring, eye) {
  ring.updateMatrixWorld(true);
  const position = ring.geometry.attributes.position;
  const indices = ring.geometry.index;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const counts = { front: 0, back: 0, edge: 0 };
  for (let i = 0; i < indices.count; i += 3) {
    a.fromBufferAttribute(position, indices.getX(i)).applyMatrix4(ring.matrixWorld);
    b.fromBufferAttribute(position, indices.getX(i + 1)).applyMatrix4(ring.matrixWorld);
    c.fromBufferAttribute(position, indices.getX(i + 2)).applyMatrix4(ring.matrixWorld);
    const normal = b.clone().sub(a).cross(c.clone().sub(a)).normalize();
    const facing = normal.dot(eye.clone().sub(a));
    counts[facing > 1e-8 ? 'front' : facing < -1e-8 ? 'back' : 'edge']++;
  }
  return counts;
}

function environment() {
  const { library, texture } = fixture();
  const env = new Environment(new THREE.Scene(), {}, library);
  env.setupSky(); env.setupSkyline(); env.setupLights();
  return { env, ring: env.skylineRing, texture };
}

test('skyline renders only its inward-visible back face without changing forceSinglePass', () => {
  // Regression: reverting just side to DoubleSide restores the empty second draw.
  const { ring } = fixture();
  assert.equal(ring.material.side, THREE.BackSide);
  assert.equal(ring.material.forceSinglePass, false);
});

test('skyline retains all 128 outward-wound side triangles and their native UVs', () => {
  const { ring } = fixture();
  const expected = new THREE.CylinderGeometry(1800, 1800, 100, 64, 1, true);
  assert.deepEqual(ring.geometry.parameters, expected.parameters);
  assert.equal(ring.geometry.index.count / 3, 128);
  assert.deepEqual(ring.geometry.index.array, expected.index.array);
  assert.deepEqual(Object.keys(ring.geometry.attributes), Object.keys(expected.attributes));
  for (const [name, attr] of Object.entries(expected.attributes)) {
    assert.deepEqual(ring.geometry.attributes[name].array, attr.array, name);
    assert.equal(ring.geometry.attributes[name].itemSize, attr.itemSize, name);
  }
  assert.deepEqual(ring.geometry.groups, expected.groups);
  assert.deepEqual(ring.geometry.morphAttributes, {});
  assert.deepEqual(ring.position.toArray(), [0, 30, 0]);
  assert.deepEqual(ring.rotation.toArray(), [0, Math.PI / 4, 0, 'XYZ']);
  assert.deepEqual(ring.scale.toArray(), [1, 1, 1]);
  expected.dispose();
});

for (const [label, image] of [
  ['hd', { width: 1211, height: 301 }],
  ['sd', { width: 1024, height: 255 }],
  ['missing dimensions', {}],
]) {
  test(`skyline preserves shared ${label} texture, alpha, fog and non-lighting state`, () => {
    const { library, texture, ring } = fixture(image);
    const version = texture.version;
    const second = createSkylineRing(library);
    assert.equal(ring.material.constructor, THREE.MeshBasicMaterial);
    assert.equal(ring.material.map, texture);
    assert.equal(second.material.map, texture);
    assert.equal(texture.version, version);
    assert.equal(texture.image, image);
    assert.equal(texture.wrapS, THREE.RepeatWrapping);
    assert.equal(texture.wrapT, THREE.ClampToEdgeWrapping);
    assert.equal(texture.colorSpace, THREE.SRGBColorSpace);
    assert.deepEqual(texture.repeat.toArray(), [1, 1]);
    assert.deepEqual(texture.offset.toArray(), [0, 0]);
    assert.equal(texture.rotation, 0);
    assert.equal(ring.material.transparent, true);
    assert.equal(ring.material.alphaTest, .5);
    assert.equal(ring.material.opacity, 1);
    assert.equal(ring.material.depthWrite, false);
    assert.equal(ring.material.depthTest, true);
    assert.equal(ring.material.fog, true);
    assert.equal(ring.material.envMap, null);
    assert.equal(ring.material.lightMap, null);
    assert.equal(ring.material.aoMap, null);
    assert.equal(ring.material.onBeforeCompile, THREE.Material.prototype.onBeforeCompile);
    assert.equal(ring.onBeforeRender, THREE.Object3D.prototype.onBeforeRender);
  });
}

test('origin, pre-update spawn and every palace-boundary corner see back faces only', () => {
  const { ring } = fixture();
  const { minX, maxX, minZ, maxZ } = LAYOUT.BOUNDARY;
  const start = LAYOUT.START_POSITION;
  const eyes = [new THREE.Vector3(), new THREE.Vector3(start.x, start.y, start.z)];
  for (const x of [minX, maxX]) for (const z of [minZ, maxZ]) eyes.push(new THREE.Vector3(x, 1.7, z));
  for (const eye of eyes) {
    assert.ok(Math.hypot(eye.x, eye.z) < 1800 * Math.cos(Math.PI / 64));
    assert.deepEqual(faceCounts(ring, eye), { front: 0, back: 128, edge: 0 }, eye.toArray().join(','));
  }
});

test('actual environment recentering keeps ground and bird-eye cameras behind every face at any height', () => {
  const { env, ring } = environment();
  const camera = new THREE.PerspectiveCamera(70, 1, .1, 2500);
  for (const x of [-10000, 0, 10000]) for (const z of [-10000, 542, 10000]) {
    for (const y of [-1000, 1.7, 30, 80, 250, 1000, 10000]) {
      camera.position.set(x, y, z);
      env.update(camera, .016);
      assert.deepEqual(ring.position.toArray(), [x, 30, z]);
      assert.deepEqual(faceCounts(ring, camera.position), { front: 0, back: 128, edge: 0 });
    }
  }
});

for (const loadAll of [false, true]) for (const quality of ['high', 'low']) {
  test(`actual animate body recenters after controls and before render (${loadAll ? 'all zones' : 'streaming'}, ${quality})`, () => {
    // Run the real app method with unrelated DOM/audio/streaming collaborators replaced.
    // This verifies ordering only; it does not claim a GPU or full app integration run.
    const source = readFileSync(new URL('../../main.js', import.meta.url), 'utf8');
    const method = source.slice(source.indexOf('  animate() {'), source.indexOf('\n  dispose() {'));
    const animate = new Function(`return function ${method.trim()}`)();
    const { env, ring } = environment();
    env.setQuality(quality === 'high');
    const camera = new THREE.PerspectiveCamera();
    let rendered = false;
    const previousRAF = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = () => 1;
    try {
      animate.call({
        disposed: false, _animate() {}, _lastSize: '100x100',
        getViewportSize: () => ({ width: 100, height: 100 }),
        controls: { update() { camera.position.set(9000, 900, -8000); } },
        updateLocationInfo() {}, camera, environment: env,
        palaceBuilder: {}, enclosure: { update() {} }, garden: { update() {} },
        zoneManager: { loadAll, update() {} }, ambience: { update() {} },
        isInGatePassage: () => false, lastShadowUpdate: Infinity,
        postProcessing: { render() {
          rendered = true;
          assert.deepEqual(ring.position.toArray(), [9000, 30, -8000]);
          assert.deepEqual(faceCounts(ring, camera.position), { front: 0, back: 128, edge: 0 });
        } },
      });
    } finally {
      if (previousRAF === undefined) delete globalThis.requestAnimationFrame;
      else globalThis.requestAnimationFrame = previousRAF;
    }
    assert.equal(rendered, true);
  });
}

test('quality changes preserve the ring, map, geometry, transform and non-casting state', () => {
  const { env, ring, texture } = environment();
  const geometry = ring.geometry, material = ring.material;
  for (const high of [false, true, true, false]) {
    env.setQuality(high);
    assert.equal(env.skylineRing, ring);
    assert.equal(ring.geometry, geometry);
    assert.equal(ring.material, material);
    assert.equal(ring.material.map, texture);
    assert.deepEqual(ring.position.toArray(), [0, 30, 0]);
    assert.equal(ring.castShadow, false);
    assert.equal(ring.receiveShadow, false);
  }
});

test('skyline stays out of runtime batches and shadow-LOD promotion', () => {
  const { env, ring } = environment();
  const batcher = new BatchedBuilder(env.scene);
  assert.ok(!batcher.collect().includes(ring));
  const shadows = new ShadowSetup({});
  const camera = new THREE.PerspectiveCamera();
  for (const quality of ['high', 'low']) {
    shadows.quality = quality;
    shadows.updateShadowLOD(camera, [ring], 10000);
    assert.equal(ring.castShadow, false);
  }
});

test('outside-ring direct renders are explicitly outside the equivalence contract', () => {
  const { ring } = fixture();
  const eye = new THREE.Vector3(4000, 30, 0);
  const counts = faceCounts(ring, eye);
  assert.ok(counts.front > 0, 'an unrecentered external camera can see front faces');
  assert.ok(counts.back > 0);
  const raycaster = new THREE.Raycaster(eye, new THREE.Vector3(-1, 0, 0));
  ring.material.side = THREE.DoubleSide;
  const both = raycaster.intersectObject(ring);
  ring.material.side = THREE.BackSide;
  const back = raycaster.intersectObject(ring);
  assert.ok(both.length > back.length, 'outside views lose the near outside wall');
  assert.ok(both[0].distance < back[0].distance);
});

test('installed r162 PMREM remains at origin and baseline transparent path uses BackSide first', () => {
  // Source guards accompany geometric tests; they are not shader execution or pixel tests.
  assert.equal(THREE.REVISION, '162');
  const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
  const pmrem = read('node_modules/three/src/extras/PMREMGenerator.js');
  const capture = pmrem.slice(pmrem.indexOf('\n\t_sceneToCubeUV('), pmrem.indexOf('\n\t_textureToCubeUV('));
  assert.match(capture, /const cubeCamera = new PerspectiveCamera\( fov, aspect, near, far \)/);
  assert.doesNotMatch(capture, /cubeCamera\.position\s*[.=]/);
  const envSource = read('src/scene/Environment.js');
  const init = envSource.slice(envSource.indexOf('  init() {'), envSource.indexOf('  setupSky() {'));
  assert.ok(init.indexOf('this.setupSkyline()') < init.indexOf('this.setupIBL()'));
  assert.doesNotMatch(init, /this\.update\(/);
  const renderer = read('node_modules/three/src/renderers/WebGLRenderer.js');
  assert.match(renderer, /material\.transparent === true && material\.side === DoubleSide && material\.forceSinglePass === false/);
  assert.match(renderer, /material\.side = BackSide;[\s\S]*?renderBufferDirect\([\s\S]*?material\.side = FrontSide;[\s\S]*?renderBufferDirect\(/);
});
