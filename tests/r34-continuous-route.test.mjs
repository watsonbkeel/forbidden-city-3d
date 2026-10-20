import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { registerHooks } from 'node:module';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FirstPersonControls } from '../src/controls/FirstPerson.js';
import { buildWorld } from './lib/world.mjs';
import { replayTerrace, traceTerraceGround } from './lib/terrace-walk.mjs';
import { continuousVisitorRoute } from './lib/continuous-visitor-route.mjs';
import { connectedChuxiuVisitorRoute } from './lib/chuxiu-visitor-route.mjs';

registerHooks({ load(url, context, next) {
  if (url.endsWith('.json')) return { format: 'module', source: `export default ${fs.readFileSync(new URL(url), 'utf8')}`, shortCircuit: true };
  return next(url, context);
} });
const { InteriorLoader } = await import('../src/scene/interior/InteriorLoader.js');
const { INTERIORS } = await import('../src/scene/interior/registry.js');
const W = await buildWorld({ retainScene: true });
const loader = new InteriorLoader(W.scene, W.cm, { registry: Object.fromEntries(['taihe', 'qianqing', 'kunning'].map(id => [id, INTERIORS[id]])) });
loader.gltf.load = async (url, ok, _progress, fail) => {
  try {
    const bytes = fs.readFileSync(new URL('../public' + url, import.meta.url));
    ok(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length), ''));
  } catch (error) { fail(error); }
};
const center = continuousVisitorRoute();
const chuxiu = connectedChuxiuVisitorRoute();
const bridges = [-1.5, 0, 1.5].map(bridgeLane => continuousVisitorRoute({ allBridges: true, bridgeLane }));

function verify(t, route, options) {
  const points = options.reverse ? route.points.toReversed() : route.points;
  const trace = traceTerraceGround(W.cm, { flights: [] });
  const placement = t.mock.method(FirstPersonControls.prototype, 'setPosition');
  let result;
  try { result = replayTerrace(t, W, points, { ...options, recordFrames: true }); }
  finally { trace.restore(); placement.mock.restore(); }
  assert.equal(placement.mock.callCount(), 1, 'only initial ground placement, no segment teleports');
  assert.ok(result.arrived, JSON.stringify({ stuckAt: result.stuckAt, end: result.end, crossing: result.driver.crossings.at(-1) }));
  assert.equal(result.startFeet, 0, 'one ordinary ground spawn, not a high spawn per segment');
  assert.equal(result.end[2], 0, 'settled at the ground-level opposite exit');
  assert.equal(result.driver.crossings.length, points.length - 1, 'every contact crossed continuously');
  assert.equal(trace.samples.some(s => s.source === 'rescue' || s.source === 'unverified'), false, 'no height rescue can hide a broken stair');
  assert.ok(result.frames.every(f => [f.x, f.z, f.feet, f.ground, f.speed].every(Number.isFinite)));
  assert.ok(result.frames.every(f => f.feet >= 0 && f.feet < 11), 'no below-ground fall or rooftop spawn');
  for (const [name, x, z] of [
    ['Taihe', 6.2, 10], ['Zhonghe', 5, 65], ['Baohe', 6.1, 126],
    ['Qianqing', 6.5, 320], ['Jiaotai', 3.7, 355], ['Kunning', -5.111111, 381.2],
    ...(route === chuxiu ? [['Tihe', 94, 401], ['Chuxiu gallery', 106.4, 420], ['Chuxiu hall', 94.8, 433.5]] : []),
  ]) {
    // The high eligibility limit is diagnostic only, never a movement input.
    // It finds the independently built actual floor even if a broken controller
    // were to travel underneath it and still eventually reach the endpoint.
    const expected = W.cm.getGroundHeight(x, z, 0, 999);
    const samples = result.frames.filter(f => Math.abs(f.x - x) < .7 && Math.abs(f.z - z) < 1.2);
    assert.ok(samples.length > 0, `${name}: actual trajectory visits this floor`);
    assert.ok(samples.every(f => f.ground >= expected - .01 && f.feet >= expected - .2), `${name}: never underneath the actual hall/gallery floor`);
  }
  if (options.sprint) assert.ok(result.maxSpeed > 11.9, 'real sprint on straight approaches');
  t.diagnostic(JSON.stringify({ frames: result.frames.length, crossed: result.driver.crossings.length, maxFeet: result.maxFeet, maxSpeed: result.maxSpeed, end: result.end }));
}

for (const state of ['B', 'S']) test(`${state}: continuous visitor route, real controller CPU coverage (not browser walking)`, async t => {
  if (state === 'S') {
    for (const id of loader.ids()) assert.equal(await loader.load(id), true, `${id}: actual loader installs checked asset`);
    assert.deepEqual(loader.stats.loaded.sort(), ['kunning', 'qianqing', 'taihe']);
  }
  for (const reverse of [false, true]) for (const backward of [false, true]) for (const fps of [60, 20, 10]) for (const sprint of [false, true]) {
    await t.test(`central axis reverse=${reverse} S-key=${backward} ${fps}Hz sprint=${sprint}`, t => verify(t, center, { reverse, backward, fps, sprint }));
  }
  for (const reverse of [false, true]) for (const fps of [60, 20, 10]) for (const sprint of [false, true]) {
    await t.test(`full axis with Chuxiu excursion reverse=${reverse} ${fps}Hz sprint=${sprint}`, t => verify(t, chuxiu, { reverse, fps, sprint }));
  }
  for (const [index, route] of bridges.entries()) for (const reverse of [false, true]) for (const fps of [60, 10]) {
    await t.test(`all five bridges connected to full axis lane=${[-1.5, 0, 1.5][index]} reverse=${reverse} ${fps}Hz`, t => verify(t, route, { reverse, fps, sprint: true }));
  }
});
test.after(() => loader.dispose());
