import test from'node:test';import assert from'node:assert/strict';import * as THREE from'three';import{LAYOUT,PLAYER}from'../src/config/constants.js';import{INITIAL_VIEW_POSITION as position}from'../src/config/initialView.js';import{Environment}from'../src/scene/Environment.js';import{buildWorld,walkStraight}from'./lib/world.mjs';import{captureGate}from'./lib/gate-tower-fixture.mjs';let promise;const world=()=>promise??=buildWorld();const near=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-8,label);
// Original current-state fixture assumes all env.objects are Mesh and crashes
// during cleanup after its assertions passed. Use the production group-aware lifecycle.
test('R80 successor: existing ground mesh, logical support, body and head are clear inside unchanged bounds', async () => {
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
  } finally { env.dispose(); }
});

test('R80 real collision world permits all 54m forward to the existing pre-gate approach without raised support', async () => {
  const W = await world();
  const result = walkStraight(W, [position.x, position.z], [0, -440]);
  assert.deepEqual(result, { reached: 54, total: 54, end: [0, -440], feet: 0 });
  for (let z = position.z; z <= -440; z += .25) {
    const eye = new THREE.Vector3(0, PLAYER.HEIGHT, z);
    assert.equal(W.cm.getGroundHeight(0, z, 0, PLAYER.STEP_UP), 0, `ground z=${z}`);
    assert.equal(W.cm.checkCollision(eye, .5), false, `body z=${z}`);
  }
});

