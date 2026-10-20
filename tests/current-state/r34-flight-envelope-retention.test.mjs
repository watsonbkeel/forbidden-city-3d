import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
import {library} from '../lib/inner-palace-fixture.mjs';
import {historicalR33ModuleURL} from '../lib/historical-r33-scene-dependencies.mjs';
import {FlightEnvelope} from '../../src/scene/flight/FlightEnvelope.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
registerHooks({load(url, context, next) {
  if (url.endsWith('.json')) return {format:'module',source:'export default '+fs.readFileSync(new URL(url),'utf8'),shortCircuit:true};
  return next(url,context);
}});
const {PalaceBuilder} = await import('../../src/scene/PalaceBuilder.js');
const PriorBuilder = (await import(historicalR33ModuleURL('src/scene/PalaceBuilder.js'))).PalaceBuilder;
function envelope(Builder) {
  const scene=new THREE.Scene(),builder=new Builder(scene,library());
  try {builder.buildAll(PALACE_LAYOUT);return new FlightEnvelope().addRoot(scene);}
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
