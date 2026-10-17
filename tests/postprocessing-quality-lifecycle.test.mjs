import assert from 'node:assert/strict';
import test from 'node:test';
import * as THREE from 'three';
import { PostProcessing } from '../src/render/PostProcessing.js';

// Only the WebGL renderer boundary is replaced. Composer, passes, targets,
// materials, scene graph and BatchedMesh are the installed Three r162 code.
// These tests prove CPU ownership/identity, not GPU or browser stability.
function fixture(t, quality = 'high') {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera();
  const material = new THREE.MeshStandardMaterial();
  const parent = new THREE.Group();
  const sources = [0, 1].map(x => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material);
    mesh.position.x = x;
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  });
  scene.add(parent);
  let target = null, clearAlpha = 1;
  const clearColor = new THREE.Color();
  const renderer = {
    width: 320, height: 180, pixelRatio: 1,
    autoClear: true, autoClearColor: true, autoClearDepth: true, autoClearStencil: true,
    capabilities: { isWebGL2: true }, outputColorSpace: THREE.SRGBColorSpace,
    toneMapping: THREE.NoToneMapping, toneMappingExposure: 1,
    getSize(out) { return out.set(this.width, this.height); },
    getPixelRatio() { return this.pixelRatio; },
    getRenderTarget() { return target; },
    setRenderTarget(value) { target = value; },
    getClearColor(out) { return out.copy(clearColor); },
    setClearColor(value, alpha) { clearColor.set(value); if (alpha !== undefined) clearAlpha = alpha; },
    getClearAlpha() { return clearAlpha; },
    setClearAlpha(value) { clearAlpha = value; },
    clear() {}, clearDepth() {},
    render(object, renderCamera) { this.onRender?.(object, renderCamera); },
  };
  const pipeline = new PostProcessing(renderer, scene, camera);
  pipeline.init(quality);
  pipeline.render();
  t.after(() => {
    pipeline.dispose();
    sources.forEach(mesh => mesh.geometry.dispose());
    material.dispose();
  });
  assert.equal(pipeline.batchedBuilder.batches.length, 1, 'fixture must build a real batch');
  return { pipeline, renderer, scene, camera, parent, sources, material };
}

function disposalCount(resource) {
  let count = 0;
  resource.addEventListener('dispose', () => count++);
  return () => count;
}

function watchPipeline(pipeline) {
  const { composer, ssaoPass: ssao, bloomPass: bloom, fxaaPass } = pipeline;
  const resources = [composer.renderTarget1, composer.renderTarget2,
    composer.copyPass.material, fxaaPass.material,
    ...composer.passes.filter(pass => pass.constructor.name === 'OutputPass').map(pass => pass.material)];
  if (ssao) resources.push(ssao.normalRenderTarget, ssao.ssaoRenderTarget, ssao.blurRenderTarget,
    ssao.normalMaterial, ssao.blurMaterial, ssao.copyMaterial, ssao.depthRenderMaterial,
    ssao.noiseTexture, ssao.ssaoMaterial);
  if (bloom) resources.push(...bloom.renderTargetsHorizontal, ...bloom.renderTargetsVertical,
    bloom.renderTargetBright, ...bloom.separableBlurMaterials,
    bloom.compositeMaterial, bloom.blendMaterial, bloom.basic);
  // Known upstream r162 omission: materialHighPassFilter is covered separately.
  const counts = resources.map(disposalCount);
  return { composer, counts, assertReleased() {
    counts.forEach((count, i) => assert.equal(count(), 1, `owned pipeline resource ${i} is released once`));
  } };
}

test('high/low/medium changes retain existing batch identity through the next actual render', t => {
  const { pipeline } = fixture(t);
  const builder = pipeline.batchedBuilder;
  const original = builder.batches[0];
  const sources = builder.sources;
  const signature = builder.signature;
  const geometryReleased = disposalCount(original.batch.geometry);
  const textureReleased = disposalCount(original.batch._matricesTexture);
  for (const quality of ['low', 'high', 'medium', 'high', 'low', 'high']) {
    pipeline.setQuality(quality);
    assert.equal(builder.batches[0], original, 'quality switch must not discard batch');
    assert.equal(builder.sources, sources);
    assert.equal(builder.signature, signature);
    pipeline.render();
    assert.equal(builder.batches[0], original, 'next frame must reuse batch');
    assert.equal(geometryReleased(), 0);
    assert.equal(textureReleased(), 0);
  }
});

test('every quality change disposes old postprocess targets/materials and installs correct passes', t => {
  const { pipeline } = fixture(t);
  for (const quality of ['low', 'high', 'medium', 'high']) {
    const old = watchPipeline(pipeline);
    pipeline.setQuality(quality);
    old.assertReleased();
    assert.notEqual(pipeline.composer, old.composer);
    assert.equal(pipeline.quality, quality);
    assert.equal(!!pipeline.ssaoPass, quality === 'high');
    assert.equal(!!pipeline.bloomPass, quality === 'high');
    assert.equal(pipeline.composer.passes.length, quality === 'high' ? 5 : 3);
    assert.equal(pipeline.composer.passes[0].scene, pipeline.scene);
    assert.equal(pipeline.composer.passes[0].camera, pipeline.camera);
    pipeline.render();
  }
});

test('same quality is a resource-preserving no-op', t => {
  const { pipeline } = fixture(t);
  const old = watchPipeline(pipeline);
  const original = pipeline.batchedBuilder.batches[0];
  pipeline.setQuality('high');
  assert.equal(pipeline.composer, old.composer);
  assert.equal(pipeline.batchedBuilder.batches[0], original);
  old.counts.forEach(count => assert.equal(count(), 0));
});

test('quality switches preserve visibility/transform/shadow updates and render-finally restoration', t => {
  const { pipeline, sources, parent, renderer, scene } = fixture(t);
  const original = pipeline.batchedBuilder.batches[0];
  pipeline.setQuality('low');
  parent.position.set(3, 4, 5);
  sources[0].position.set(7, 8, 9);
  sources[1].visible = false;
  sources[0].castShadow = false;
  renderer.onRender = object => {
    if (object !== scene) return;
    assert.equal(pipeline.batchedBuilder.batches[0], original);
    assert.equal(original.batch.parent, pipeline.batchedBuilder.container);
    assert.equal(pipeline.batchedBuilder.container.parent, scene);
    assert.equal(original.batch.getVisibleAt(original.entries[0].id), true);
    assert.equal(original.batch.getVisibleAt(original.entries[1].id), false);
    assert.equal(original.batch.castShadow, false);
    const matrix = new THREE.Matrix4();
    original.batch.getMatrixAt(original.entries[0].id, matrix);
    assert.deepEqual(matrix.elements, sources[0].matrixWorld.elements);
    assert.equal(sources[0].visible, false, 'source is hidden while its batch is rendered');
  };
  pipeline.render();
  assert.deepEqual(sources.map(mesh => mesh.visible), [true, false]);
  assert.equal(pipeline.batchedBuilder.container.parent, null);
  renderer.onRender = () => { throw new Error('intentional renderer boundary failure'); };
  assert.throws(() => pipeline.render(), /intentional renderer boundary failure/);
  assert.deepEqual(sources.map(mesh => mesh.visible), [true, false]);
  assert.equal(pipeline.batchedBuilder.container.parent, null);
});

test('real scene membership changes still rebuild retained batches on the next frame', t => {
  const { pipeline, scene, material } = fixture(t);
  const original = pipeline.batchedBuilder.batches[0];
  const geometryReleased = disposalCount(original.batch.geometry);
  pipeline.setQuality('low');
  const extra = new THREE.Mesh(new THREE.BoxGeometry(), material);
  scene.add(extra);
  t.after(() => extra.geometry.dispose());
  pipeline.render();
  assert.notEqual(pipeline.batchedBuilder.batches[0], original);
  assert.equal(pipeline.batchedBuilder.sources.length, 3);
  assert.equal(geometryReleased(), 1);
  assert.equal(extra.visible, true);
});

test('quality switch keeps resize/DPR behavior and the disabled direct-render path', t => {
  const { pipeline, renderer } = fixture(t);
  const original = pipeline.batchedBuilder.batches[0];
  renderer.width = 640; renderer.height = 360; renderer.pixelRatio = 2;
  pipeline.setEnabled(false);
  pipeline.setQuality('low');
  assert.equal(pipeline.enabled, false);
  assert.equal(pipeline.composer.renderTarget1.width, 1280);
  assert.equal(pipeline.composer.renderTarget1.height, 720);
  assert.deepEqual(pipeline.fxaaPass.material.uniforms.resolution.value.toArray(), [1 / 1280, 1 / 720]);
  pipeline.render();
  assert.equal(pipeline.batchedBuilder.batches[0], original);
  pipeline.setEnabled(true);
  pipeline.setQuality('high');
  assert.equal(pipeline.ssaoPass.width, 1280);
  assert.equal(pipeline.ssaoPass.height, 720);
  pipeline.render();
  assert.equal(pipeline.batchedBuilder.batches[0], original);
});

test('full dispose still releases retained batch resources plus the active pipeline exactly once', t => {
  const { pipeline, material, sources } = fixture(t);
  const original = pipeline.batchedBuilder.batches[0];
  const geometryReleased = disposalCount(original.batch.geometry);
  const textureReleased = disposalCount(original.batch._matricesTexture);
  const sourceGeometryReleased = sources.map(mesh => disposalCount(mesh.geometry));
  const sourceMaterialReleased = disposalCount(material);
  pipeline.setQuality('low');
  pipeline.render();
  pipeline.setQuality('high');
  pipeline.render();
  const active = watchPipeline(pipeline);
  pipeline.dispose();
  active.assertReleased();
  assert.equal(geometryReleased(), 1);
  assert.equal(textureReleased(), 1);
  assert.equal(pipeline.batchedBuilder.batches.length, 0);
  assert.equal(pipeline.batchedBuilder.sources.length, 0);
  assert.equal(pipeline.batchedBuilder.signature, '');
  assert.equal(pipeline.composer, null);
  assert.equal(pipeline.ssaoPass, null);
  assert.equal(pipeline.bloomPass, null);
  assert.equal(pipeline.fxaaPass, null);
  assert.equal(pipeline.quality, null);
  pipeline.dispose();
  active.assertReleased();
  assert.equal(geometryReleased(), 1);
  assert.equal(textureReleased(), 1);
  sourceGeometryReleased.forEach(count => assert.equal(count(), 0));
  assert.equal(sourceMaterialReleased(), 0, 'scene owners retain source geometry/material ownership');
});

test('pipeline can initialize again after a complete application-style disposal', t => {
  const { pipeline } = fixture(t);
  const original = pipeline.batchedBuilder.batches[0];
  pipeline.dispose();
  pipeline.init('low');
  pipeline.render();
  assert.notEqual(pipeline.batchedBuilder.batches[0], original);
  assert.equal(pipeline.quality, 'low');
});
