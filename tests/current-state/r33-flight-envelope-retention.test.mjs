import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from 'three';
import {stageNativeR33} from '../lib/r33-native-fixture.mjs';
import {FlightEnvelope} from '../../src/scene/flight/FlightEnvelope.js';
const native = stageNativeR33();
test.after(native.dispose);
const {PalaceBuilder, oldBuilder, historicalEnvelope, PALACE_LAYOUT, library} = await (async () => {
  try {
    return {
      PalaceBuilder:(await import(new URL('src/scene/PalaceBuilder.js', native.after))).PalaceBuilder,
      oldBuilder:(await import(new URL('src/scene/PalaceBuilder.js', native.before))).PalaceBuilder,
      historicalEnvelope:(await import(new URL('src/scene/flight/FlightEnvelope.js', native.after))).FlightEnvelope,
      PALACE_LAYOUT:(await import(new URL('src/scene/Layout.js', native.after))).PALACE_LAYOUT,
      library:(await import(new URL('tests/lib/inner-palace-fixture.mjs', native.after))).library
    };
  } catch (error) {
    native.dispose();
    throw error;
  }
})();
const digest = array => createHash('sha256').update(Buffer.from(array.buffer, array.byteOffset, array.byteLength)).digest('hex');
function envelope(Builder) {
  const scene = new THREE.Scene(), builder = new Builder(scene, library());
  try {
    builder.buildAll(PALACE_LAYOUT);
    const original = new historicalEnvelope().addRoot(scene);
    const current = new FlightEnvelope().addRoot(scene);
    // The unchanged original assertion still exercises the live envelope
    // class on this historical resident input; validate it against the native
    // R33 class as well, without attaching current streamed water or zones.
    for (const key of ['bounds', 'cellSize', 'clearance', 'heights', 'water']) assert.deepEqual(current[key], original[key], key);
    assert.deepEqual(current.summary(), original.summary());
    return current;
  }
  finally {builder.dispose();}
}
test('frozen R33 static resident geometry preserves every R32 FlightEnvelope roof-height and water cell', t => {
  const before = envelope(oldBuilder), after = envelope(PalaceBuilder);
  assert.deepEqual(after.bounds, before.bounds);
  assert.equal(after.cellSize, before.cellSize);
  assert.equal(after.clearance, before.clearance);
  assert.deepEqual(after.heights, before.heights);
  assert.deepEqual(after.water, before.water);
  assert.equal(after.heights.length, 331250);
  assert.equal(after.triangles - before.triangles, 1032);
  assert.equal(after.meshes, before.meshes);
  assert.equal(after.maxHeight, before.maxHeight);
  t.diagnostic(JSON.stringify({cells: after.heights.length, heightsSHA256: digest(after.heights), waterSHA256: digest(after.water), before: before.summary(), after: after.summary()}));
});
