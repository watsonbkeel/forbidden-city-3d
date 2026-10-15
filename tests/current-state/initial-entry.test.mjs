import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { LAYOUT, PLAYER } from '../../src/config/constants.js';
import { INITIAL_VIEW_POSITION as position } from '../../src/config/initialView.js';
import { FirstPersonControls } from '../../src/controls/FirstPerson.js';
import { Environment } from '../../src/scene/Environment.js';
import { setupInput } from '../lib/input-fixture.mjs';
import { buildWorld, walkStraight } from '../lib/world.mjs';
import { captureGate } from '../lib/gate-tower-fixture.mjs';

const root = new URL('../../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root), 'utf8');
const main = read('main.js');
let worldPromise;
const world = () => worldPromise ??= buildWorld();
const near = (a, b, label) => assert.ok(Math.abs(a - b) < 1e-8, `${label}: ${a} vs ${b}`);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

// Execute the exact production camera/control initialization statements without
// importing main.js (which would start WebGL and the browser animation loop).
function cameraApp(window) {
  const method = main.match(/^  createCamera\(\) \{[\s\S]*?^  \}/m)?.[0];
  assert.ok(method, 'one production camera method is present');
  const app = new Function('THREE', 'window', 'INITIAL_VIEW_POSITION', `return ({${method}});`)(THREE, window, position);
  app.createCamera();
  return app;
}
function initializeControls(app, document) {
  const step = main.match(/\['控制器', \(\) => \{\n([\s\S]*?)\n      \}\]/)?.[1];
  assert.ok(step, 'one production control initialization is present');
  new Function('FirstPersonControls', 'document', 'LAYOUT', 'INITIAL_VIEW_POSITION', step)
    .call(app, FirstPersonControls, document, LAYOUT, position);
}

// Regression target: reverting to the legacy 50.4m viewpoint must fail.
test('the single separate first-entry position is 24m farther south on existing ground', () => {
  assert.deepEqual(position, { x: 0, y: 1.7, z: -494 });
  assert.deepEqual(LAYOUT.START_POSITION, { x: 0, y: 1.7, z: -470 });
  assert.notEqual(position, LAYOUT.START_POSITION);
  assert.ok(Object.isFrozen(position));
  assert.equal(position.y, PLAYER.HEIGHT);
  near(LAYOUT.WUMEN_Z - position.z, 74.4, 'distance south of Wumen anchor');
});

test('actual camera and control initialization agree at eye height 1.7 with unchanged FOV and horizontal north', async t => {
  const W = await world();
  const fixture = setupInput(t);
  fixture.window.innerWidth = 1280; fixture.window.innerHeight = 720;
  const app = cameraApp(fixture.window);
  assert.deepEqual(app.camera.position.toArray(), [0, 1.7, -494]);
  assert.equal(app.camera.fov, 70);
  assert.equal(app.camera.aspect, 16 / 9);
  assert.equal(app.camera.near, .1); assert.equal(app.camera.far, 2500);
  app.collisionManager = W.cm;
  app.bindWelcomeOverlay = () => {};
  initializeControls(app, fixture.document);
  try {
    assert.deepEqual(app.camera.position.toArray(), [0, 1.7, -494]);
    assert.equal(app.controls.feetY, 0); assert.equal(app.controls.groundY, 0);
    assert.equal(app.controls.airborne, false);
    const forward = app.camera.getWorldDirection(new THREE.Vector3());
    near(forward.x, 0, 'north x'); near(forward.y, 0, 'horizontal'); near(forward.z, 1, 'north z');
    assert.equal(app.camera.fov, 70);
  } finally { app.controls.dispose(); }
});

test('zone initialization consumes the same first-entry coordinates before controls', () => {
  const statement = main.match(/        const start = [^;]+;\n        this\.zoneManager\.init\([^\n]+\);/)?.[0];
  assert.ok(statement);
  let actual;
  const app = { zoneManager: { init: (_scene, _library, _cm, start) => { actual = start; } } };
  new Function('LAYOUT', 'INITIAL_VIEW_POSITION', statement).call(app, LAYOUT, position);
  assert.deepEqual(actual, { x: 0, z: -494 });
  assert.ok(main.indexOf(statement) < main.indexOf("['控制器'"));
});

test('existing ground mesh, logical support, body and head are clear inside unchanged bounds', async () => {
  const W = await world(), eye = new THREE.Vector3(position.x, position.y, position.z);
  assert.deepEqual(LAYOUT.BOUNDARY, { minX: -400, maxX: 400, minZ: -500, maxZ: 560 });
  assert.equal(position.z - .5 - LAYOUT.BOUNDARY.minZ, 5.5, 'body has 5.5m south-boundary clearance');
  assert.equal(W.cm.checkBoundary(eye, .5), true);
  assert.equal(W.cm.checkRiverCrossing(eye, .5), true);
  assert.equal(W.cm.getGroundHeight(position.x, position.z, 0, PLAYER.STEP_UP), 0);
  assert.equal(W.cm.checkCollision(eye, .5), false);
  const head = new THREE.Box3().setFromCenterAndSize(eye, new THREE.Vector3(.5, .5, .5));
  assert.equal(W.cm.queryBox(head).some(c => c.box.intersectsBox(head)), false);
  const { lib } = captureGate();
  const env = new Environment(new THREE.Scene(), {}, lib);
  env.setupGround(); env.scene.updateMatrixWorld(true);
  try {
    const hits = new THREE.Raycaster(eye, new THREE.Vector3(0, -1, 0)).intersectObjects(env.objects);
    assert.deepEqual(hits.map(h => h.object.material.name), ['stone_slab', 'ground_brick']);
    near(hits[0].point.y, .01, 'existing decorative road');
    near(hits[1].point.y, 0, 'existing ground');
  } finally { for (const object of env.objects) object.geometry.dispose(); }
});

test('real collision world permits all 54m forward to the existing pre-gate approach without raised support', async () => {
  const W = await world();
  const result = walkStraight(W, [position.x, position.z], [0, -440]);
  assert.deepEqual(result, { reached: 54, total: 54, end: [0, -440], feet: 0 });
  for (let z = position.z; z <= -440; z += .25) {
    const eye = new THREE.Vector3(0, PLAYER.HEIGHT, z);
    assert.equal(W.cm.getGroundHeight(0, z, 0, PLAYER.STEP_UP), 0, `ground z=${z}`);
    assert.equal(W.cm.checkCollision(eye, .5), false, `body z=${z}`);
  }
});

for (const fps of [10, 60]) for (const sprint of [false, true]) {
  test(`real controls walk the added approach at ${fps}Hz, sprint=${sprint}`, async t => {
    const W = await world(), f = setupInput(t);
    f.c.collisionManager = W.cm;
    f.c.setPosition(position.x, position.y, position.z);
    f.c.lookAt(0, LAYOUT.WUMEN_Z);
    f.camera.updateMatrixWorld(true); // The ordinary first render precedes input.
    f.key('keydown', 'KeyW');
    if (sprint) f.key('keydown', 'ShiftLeft');
    let frames = 0, logical = f.logical();
    while (logical.z < -440 && frames++ < fps * 20) {
      logical = f.frame(1000 / fps);
      near(logical.x, 0, 'axis'); near(logical.y, PLAYER.HEIGHT, 'eye height excluding bob');
      assert.equal(f.c.feetY, 0); assert.equal(f.c.groundY, 0);
      assert.equal(f.c.airborne, false);
      assert.equal(W.cm.checkCollision(logical, .5), false);
    }
    assert.ok(logical.z >= -440, `forward movement must reach the existing approach: ${logical.z}`);
  });
}

test('actual central roof fits a 16:9 initial frame without changing FOV or pitch', () => {
  const { group, data } = captureGate();
  // captureGate intentionally intercepts finish before it adds world placement.
  group.position.copy(data.position); group.updateMatrixWorld(true);
  const roof = group.children.find(o => o.name === 'roof_wudian');
  assert.ok(roof);
  function projection(z) {
    const camera = new THREE.PerspectiveCamera(70, 16 / 9, .1, 2500);
    camera.position.set(0, PLAYER.HEIGHT, z); camera.lookAt(0, PLAYER.HEIGHT, LAYOUT.WUMEN_Z); camera.updateMatrixWorld(true);
    const stats = { count: 0, maxY: -Infinity, maxAbsX: 0, clipped: 0 };
    roof.traverse(mesh => {
      if (!mesh.isMesh) return;
      assert.equal(!!mesh.isInstancedMesh, false, 'projection must handle instances explicitly if roof representation changes');
      const attribute = mesh.geometry.attributes.position, point = new THREE.Vector3();
      for (let i = 0; i < attribute.count; i++) {
        point.fromBufferAttribute(attribute, i).applyMatrix4(mesh.matrixWorld).project(camera);
        stats.count++; stats.maxY = Math.max(stats.maxY, point.y); stats.maxAbsX = Math.max(stats.maxAbsX, Math.abs(point.x));
        if (Math.abs(point.x) > 1 || Math.abs(point.y) > 1 || Math.abs(point.z) > 1) stats.clipped++;
      }
    });
    return stats;
  }
  const legacy = projection(LAYOUT.START_POSITION.z), candidate = projection(position.z);
  assert.ok(legacy.clipped > 0 && legacy.maxY > 1, 'test must reproduce old roof clipping');
  assert.ok(candidate.count > 1000, 'test projects actual roof geometry');
  assert.equal(candidate.clipped, 0);
  assert.ok(candidate.maxY < .8 && candidate.maxAbsX < .5, JSON.stringify(candidate));
});

test('the original perf harness and all six computed point/yaw tuples stay byte-exact', async () => {
  const source = read('tests/perf.cjs');
  assert.equal(sha(source), '0921cc93e20109e1a220bcbd9b05adc6f41a30b91c25233f999f1ddbd9770bd7');
  const start = source.indexOf('const ROOT = '), end = source.indexOf('\nconst percentile = ');
  assert.ok(start > 0 && end > start);
  const loadPoints = new Function('path', 'fs', 'pathToFileURL', '__dirname', `${source.slice(start, end)}\nreturn loadPoints();`);
  const points = await loadPoints(path, fs, pathToFileURL, fileURLToPath(new URL('tests', root)));
  assert.deepEqual(points, [
    { point: '午门前', pos: [0, -470], yaw: 0 },
    { point: '太和殿前', pos: [0, -74], yaw: 0 },
    { point: '乾清门', pos: [0, 195.3], yaw: 0 },
    { point: '东六宫中', pos: [-120.8, 382.6], yaw: 0 },
    { point: '宁寿宫', pos: [-293.2, 164.1], yaw: 0 },
    { point: '御花园', pos: [0, 433.7], yaw: 0 },
  ]);
  assert.equal(sha(read('src/config/constants.js')), '464eabc753a393b325c17de3a7ee1e49dc746d9fdf95ef8f7e1ed5a5c1efe439');
});
