import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { V10_RENDER_LIFECYCLE_DELTAS, restoreV9PostProcessingBytes,
  assertV10PostProcessingBytes } from './lib/v10-render-lifecycle-source-delta.mjs';

const baseline = JSON.parse(readFileSync(new URL('./fixtures/environment-lighting-v7.json', import.meta.url), 'utf8'));
const historicalHash = baseline.protectedSourcesSHA256['src/render/PostProcessing.js'];
const current = readFileSync(new URL('../src/render/PostProcessing.js', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const check = bytes => assertV10PostProcessingBytes(bytes, historicalHash);

test('the two finite lifecycle changes restore exactly the unchanged protected V7/V8/V9 bytes', () => {
  assert.equal(historicalHash, 'e945f42d6972ce7f1551c5958f25a15aa9f670e0a4b95afc73e8d1ace08c531b');
  assert.equal(V10_RENDER_LIFECYCLE_DELTAS.length, 2);
  const restored = restoreV9PostProcessingBytes(current);
  assert.equal(sha(restored), historicalHash);
  assert.notDeepEqual(restored, current, 'V10 explicitly changes lifecycle behavior');
  check(current);
  let reapplied = restored.toString('utf8');
  for (const { before, after } of V10_RENDER_LIFECYCLE_DELTAS) {
    assert.equal(reapplied.split(before).length - 1, 1);
    reapplied = reapplied.replace(before, after);
  }
  assert.deepEqual(Buffer.from(reapplied), current, 'the finite edit is byte-reversible');
});

for (const [index, { after }] of V10_RENDER_LIFECYCLE_DELTAS.entries()) {
  for (const [label, replacement] of [['missing', ''], ['duplicate', after + after]]) {
    test(`source guard rejects ${label} exact replacement context ${index + 1}`, () => {
      const mutated = Buffer.from(current.toString('utf8').replace(after, replacement));
      assert.notDeepEqual(mutated, current);
      assert.throws(() => check(mutated), /replacement must occur exactly once/);
    });
  }
}

const mutations = [
  ['unrelated quality side effect', source => source.replace('    this.init(quality);',
    '    this.init(quality); this.scene.clear();')],
  ['reintroduced quality batch disposal', source => source.replace('    this.disposePostProcessing();',
    '    this.disposePostProcessing(); this.batchedBuilder.dispose();')],
  ['removed full batch disposal', source => source.replace('    this.batchedBuilder.dispose();\n', '')],
  ['optional Bloom cleanup', source => source.replace('        if (pass.dispose) pass.dispose();',
    '        if (pass === this.bloomPass) pass.materialHighPassFilter?.dispose();\n        if (pass.dispose) pass.dispose();')],
  ['existing SSAO cleanup changed', source => source.replace('pass.noiseTexture?.dispose();',
    'pass.noiseTexture = null;')],
  ['unrelated renderer behavior', source => source.replace('    this.camera.updateMatrixWorld();',
    '    this.camera.updateMatrixWorld(true);')],
  ['arbitrary trailing whitespace', source => source + '\n'],
];
for (const [label, mutate] of mutations) {
  test(`source guard rejects ${label}`, () => {
    const mutated = Buffer.from(mutate(current.toString('utf8')));
    assert.notDeepEqual(mutated, current, 'mutation must actually change bytes');
    assert.throws(() => check(mutated));
  });
}

test('source guard rejects unchanged V9 and changed historical baseline hash', () => {
  assert.throws(() => check(restoreV9PostProcessingBytes(current)), /replacement must occur exactly once/);
  assert.throws(() => assertV10PostProcessingBytes(current, sha(current)), /unchanged protected historical bytes/);
});
