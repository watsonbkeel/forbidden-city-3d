import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {registerHooks} from 'node:module';
import * as THREE from 'three';
import {library} from '../lib/inner-palace-fixture.mjs';
import {historicalR32ModuleURL} from '../lib/historical-r32-scene-dependencies.mjs';
import {FlightEnvelope} from '../../src/scene/flight/FlightEnvelope.js';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
registerHooks({load(url, context, next) {
  if (url.endsWith('.json')) return {format: 'module', source: 'export default ' + fs.readFileSync(new URL(url), 'utf8'), shortCircuit: true};
  return next(url, context);
}});
const {PalaceBuilder} = await import('../../src/scene/PalaceBuilder.js');
const oldBuilder = (await import(historicalR32ModuleURL('src/scene/PalaceBuilder.js'))).PalaceBuilder;
const digest = array => createHash('sha256').update(Buffer.from(array.buffer, array.byteOffset, array.byteLength)).digest('hex');
function envelope(Builder) {
  const scene = new THREE.Scene(), builder = new Builder(scene, library());
  try {builder.buildAll(PALACE_LAYOUT); return new FlightEnvelope().addRoot(scene);}
  finally {builder.dispose();}
}
test('actual R33 static resident geometry preserves every R32 FlightEnvelope roof-height and water cell', t => {
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
