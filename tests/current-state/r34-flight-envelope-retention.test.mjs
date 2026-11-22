import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {stageNativeR34} from '../lib/r34-resident-night-native-fixture.mjs';
import {FlightEnvelope} from '../../src/scene/flight/FlightEnvelope.js';
const native = stageNativeR34('scene');
test.after(native.dispose);
const {PalaceBuilder, PriorBuilder, historicalEnvelope, PALACE_LAYOUT, library} = await (async () => {
  try {
    return {
      PalaceBuilder:(await import(new URL('src/scene/PalaceBuilder.js', native.after))).PalaceBuilder,
      PriorBuilder:(await import(new URL('src/scene/PalaceBuilder.js', native.before))).PalaceBuilder,
      historicalEnvelope:(await import(new URL('src/scene/flight/FlightEnvelope.js', native.after))).FlightEnvelope,
      PALACE_LAYOUT:(await import(new URL('src/scene/Layout.js', native.after))).PALACE_LAYOUT,
      library:(await import(new URL('tests/lib/inner-palace-fixture.mjs', native.after))).library
    };
  } catch (error) {
    native.dispose();
    throw error;
  }
})();
function envelope(Builder) {
  const scene=new THREE.Scene(),builder=new Builder(scene,library());
  try {
    builder.buildAll(PALACE_LAYOUT);
    const original = new historicalEnvelope().addRoot(scene);
    const current = new FlightEnvelope().addRoot(scene);
    // Resident-only historical input; current streamed water/zone collection
    // has a separate current world acceptance test.
    for (const key of ['bounds','cellSize','clearance','heights','water']) assert.deepEqual(current[key],original[key],key);
    assert.deepEqual(current.summary(),original.summary());
    return current;
  }
  finally {builder.dispose();}
}
test('raw R34 interior fits preserve every independently frozen R33 flight roof and water cell',()=>{
  const before=envelope(PriorBuilder),after=envelope(PalaceBuilder);
  assert.deepEqual(after.bounds,before.bounds);
  assert.equal(after.cellSize,before.cellSize);
  assert.equal(after.clearance,before.clearance);
  assert.equal(after.heights.length,331250);
  assert.deepEqual(after.heights,before.heights);
  assert.deepEqual(after.water,before.water);
  assert.equal(after.maxHeight,before.maxHeight);
  // Actual added warm-room geometry, not a waived old R33 triangle assertion.
  assert.equal(after.triangles-before.triangles,384);
  assert.equal(after.meshes-before.meshes,2);
});
