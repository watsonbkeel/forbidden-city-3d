import {restorePreWumenVerticalSource} from '../lib/wumen-vertical-source-delta.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { V14_GROUND_DOOR_DELTAS, restoreV13GroundDoorSource } from '../lib/v14-ground-door-source-delta.mjs';

const current = restorePreWumenVerticalSource('src/scene/PalaceBuilder.js',fs.readFileSync(new URL('../../src/scene/PalaceBuilder.js', import.meta.url)));
test('two finite door proxy additions restore exact V13 builder bytes', () => {
  assert.notDeepEqual(restoreV13GroundDoorSource(current), current);
});
for (const [index, delta] of V14_GROUND_DOOR_DELTAS.entries()) {
  for (const kind of ['missing', 'duplicated', 'modified']) {
    test(`ground-leaf source guard rejects ${kind} registration ${index}`, () => {
      const replacement = kind === 'missing' ? delta.before
        : kind === 'duplicated' ? delta.after + delta.after
          : delta.after.replace('Math.min(3, b.max.y)', 'Math.min(4, b.max.y)');
      assert.throws(() => restoreV13GroundDoorSource(Buffer.from(current.toString().replace(delta.after, replacement))));
    });
  }
}
test('ground-leaf source guard rejects unrelated retained-byte changes', () => {
  assert.throws(() => restoreV13GroundDoorSource(Buffer.concat([current, Buffer.from('\n')])));
  assert.throws(() => restoreV13GroundDoorSource(Buffer.from(current.toString().replace(
    "import * as THREE from 'three';", "import * as THREE from 'unapproved-three';"))));
});
