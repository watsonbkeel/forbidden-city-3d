import test from 'node:test';
import assert from 'node:assert/strict';
import { readHistoricalSource } from './lib/historical-sources.mjs';
import baseline from './fixtures/v7-qinan-route-baseline.json' with { type: 'json' };
import { V9_INPUT_INSERTIONS, expectedV9FirstPersonBytes, assertV9FirstPersonBytes } from './lib/v9-input-source-delta.mjs';

const historical = readHistoricalSource(baseline.commit, 'src/controls/FirstPerson.js');
// Preserve the immutable component contract while the actual controller is
// checked by the separately composed V9 map guard.
const current = readHistoricalSource('3d196a60ead843fcc029a7fcd406374f9b699fc8', 'src/controls/FirstPerson.js');

test('frozen input component retains exactly the historical controller plus its four approved V9 insertions', () => {
  assertV9FirstPersonBytes(historical, current);
  assert.notDeepEqual(current, historical, 'this is an explicit version change, not unchanged V8 bytes');
});

for (const [index, { anchor }] of V9_INPUT_INSERTIONS.entries()) {
  test(`V9 source guard rejects missing or duplicate exact context anchor ${index + 1}`, () => {
    for (const replacement of ['', anchor + anchor]) {
      const changed = Buffer.from(historical.toString('utf8').replace(anchor, replacement));
      assert.throws(() => expectedV9FirstPersonBytes(changed), /anchor must occur exactly once/);
    }
  });
}

test('V9 source guard rejects unrelated historical edits and arbitrary current whitespace', () => {
  assert.throws(() => expectedV9FirstPersonBytes(Buffer.concat([historical, Buffer.from('\n')])), /unchanged historical/);
  assert.throws(() => assertV9FirstPersonBytes(historical, Buffer.concat([current, Buffer.from('\n')])), /exactly the historical bytes/);
});

test('V9 source guard rejects omitted additions, changed physics, and a matrix sync moved ahead of Q/E', () => {
  for (const { addition } of V9_INPUT_INSERTIONS) {
    assert.throws(() => assertV9FirstPersonBytes(historical,
      Buffer.from(current.toString('utf8').replace(addition, ''))), /exactly the historical bytes/);
  }
  const physics = current.toString('utf8').replace('Math.exp(-10 * delta)', 'Math.exp(-11 * delta)');
  assert.throws(() => assertV9FirstPersonBytes(historical, Buffer.from(physics)), /exactly the historical bytes/);
  const early = current.toString('utf8').replace('      this.camera.updateMatrix();\n', '')
    .replace('  update() {\n', '  update() {\n    this.camera.updateMatrix();\n');
  assert.throws(() => assertV9FirstPersonBytes(historical, Buffer.from(early)), /exactly the historical bytes/);
});
