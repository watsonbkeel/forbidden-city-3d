import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {historicalR31Dependency} from './lib/historical-r31-scene-dependencies.mjs';
import {restorePreR32Source} from './lib/r32-source-retention.mjs';
import { LAYOUT, DIMENSIONS, PLAYER } from '../src/config/constants.js';
import { ZoneBase } from '../src/scene/zones/ZoneBase.js';
import { captureGate } from './lib/gate-tower-fixture.mjs';
import { buildWorld, walkStraight } from './lib/world.mjs';

// These are model-relative checks. They do not establish surveyed dimensions,
// the Museum's present visitor exit, or permission to enter an upper terrace.
const world = await buildWorld();
const root=new URL('../',import.meta.url);
const {ZoneBase:HistoricalR31ZoneBase}=await import(historicalR31Dependency('./src/scene/zones/ZoneBase.js',root));
const gate = captureGate('神武门');
const platform = gate.builder.walkables.find(w => w.type === 'box');
const northFace = platform.box.max.z;
const bodyRadius = .5; // The unchanged FirstPerson body and collision default.
const clearCenterZ = northFace + bodyRadius;
const modelExitZ = northFace + 2;
const legalCenterMax = LAYOUT.BOUNDARY.maxZ - bodyRadius;
const regions = [];
const historicalRegions=[];
for (const { file, json } of world.zones) {
  const zone = new ZoneBase(gate.lib, json);
  zone.kit.finish = () => new world.THREE.Group();
  regions.push(...zone.build().regions);
  const path='data/zones/'+file;
  const historicalZone=new HistoricalR31ZoneBase(gate.lib,JSON.parse(restorePreR32Source(path,fs.readFileSync(new URL(path,root)))));
  historicalZone.kit.finish=()=>new world.THREE.Group();
  historicalRegions.push(...historicalZone.build().regions);
}
world.cm.setRegions(regions);
const eye = (z, feet = 0, x = 0) => new world.THREE.Vector3(x, feet + PLAYER.HEIGHT, z);

// Reverting the label rule to SHENWU_Z + 20 must fail the reachable exterior
// cases, while moving the historical anchor/boundary cannot make this pass.
test('modeled north face and legal body envelope derive from unchanged geometry and policy', () => {
  assert.equal(LAYOUT.SHENWU_Z, 542);
  assert.equal(northFace, 555.23);
  assert.equal(northFace, LAYOUT.SHENWU_Z + DIMENSIONS.SHENWU.depth / 2);
  assert.equal(legalCenterMax, 559.5);
  assert.equal(modelExitZ, 557.23);
  assert.ok(modelExitZ < legalCenterMax);
  assert.equal(historicalRegions.length, 250, 'exact source-restored R31 retains every historical named region');
  assert.equal(regions.length,249,'actual R32 excludes the removed fictional Yanxi interior region');
});

test('the complete actual region list differs only by the exact removed Yanxi room, never the exit region',()=>{
  const hash=rows=>createHash('sha256').update(JSON.stringify(rows)).digest('hex');
  assert.equal(hash(historicalRegions),'7fa3ab98f5b6e307e840e99060fc70c0a2f41f18948281d5d21085e4f948b01b');
  assert.equal(hash(regions),'6bb901e84a642ae34ac2499d758655189587763da746c3203738b6bd8759bd43');
  const expected=structuredClone(historicalRegions),index=108;
  assert.equal(expected.filter(r=>r.name==='延禧宫').length,2,'the courtyard label remains separately registered');
  assert.deepEqual(expected.splice(index,1),[{name:'延禧宫',minX:-156,maxX:-140.39999999999998,minZ:319.04999999999995,maxZ:330.75}]);
  assert.deepEqual(regions,expected,'full ordered regions retain every other original byte');
});

test('ground label changes only after the whole player body clears the modeled north face', () => {
  for (const z of [550, northFace, clearCenterZ - 1e-6, clearCenterZ]) {
    assert.equal(world.cm.getCurrentLocation(eye(z)), '神武门', `still gate at z=${z}`);
  }
  for (const z of [clearCenterZ + 1e-6, modelExitZ, legalCenterMax - .01, legalCenterMax]) {
    assert.equal(world.cm.getCurrentLocation(eye(z)), '神武门外', `clear exterior at z=${z}`);
    assert.equal(world.cm.checkBoundary(eye(z)), true);
    assert.equal(world.cm.checkCollision(eye(z)), false);
    assert.equal(world.cm.getGroundHeight(0, z, 0, PLAYER.STEP_UP), 0);
  }
});

test('exterior label stays stable through ordinary jumps while supported upper terrace points remain inside', () => {
  const jumpApex = PLAYER.JUMP_VELOCITY ** 2 / (2 * PLAYER.GRAVITY);
  for (const feet of [0, PLAYER.STEP_UP, PLAYER.STEP_UP + 1e-6, jumpApex]) {
    assert.equal(world.cm.getCurrentLocation(eye(modelExitZ, feet)), '神武门外', `jump feet=${feet}`);
  }
  for (const z of [LAYOUT.SHENWU_Z - 11.2, LAYOUT.SHENWU_Z, LAYOUT.SHENWU_Z + 11.2]) {
    assert.equal(world.cm.getCurrentLocation(eye(z, platform.box.max.y, 23.5)), '神武门');
    assert.equal(world.cm.getGroundHeight(23.5, z, platform.box.max.y, PLAYER.STEP_UP), platform.box.max.y);
  }
  assert.equal(world.cm.getCurrentLocation({ x: 0, z: modelExitZ }), '神武门外', 'legacy XZ-only callers remain supported');
});

test('ground passage reaches the independent modeled exit in both directions without moving the legacy endpoint', () => {
  const oldEndpoint = LAYOUT.BOUNDARY.maxZ - 10;
  assert.equal(oldEndpoint, 550);
  for (const [from, to] of [[oldEndpoint, modelExitZ], [modelExitZ, oldEndpoint]]) {
    const result = walkStraight(world, [0, from], [0, to], { feet0: 0, step: .05 });
    assert.ok(Math.hypot(result.end[0], result.end[1] - to) < .08, JSON.stringify(result));
    assert.equal(result.feet, 0);
    assert.equal(world.cm.getCurrentLocation(eye(result.end[1])), to === modelExitZ ? '神武门外' : '神武门');
  }
  assert.equal(world.cm.checkBoundary(eye(legalCenterMax)), true);
  assert.equal(world.cm.checkBoundary(eye(legalCenterMax + 1e-6)), false);
  const blocked = world.cm.getValidPosition(eye(legalCenterMax), eye(legalCenterMax + 1), undefined, 0);
  assert.equal(blocked.z, legalCenterMax, 'the wayfinding change cannot enlarge the world');
});

test('named regions and the existing side-axis and south-axis labels retain their precedence', () => {
  for (const { json } of world.zones) for (const item of json.items.filter(item => item.kind === 'region')) {
    const position = eye((item.z0 + item.z1) / 2, 0, (item.x0 + item.x1) / 2);
    const expected = world.cm.regions.find(r => position.x >= r.minX && position.x <= r.maxX && position.z >= r.minZ && position.z <= r.maxZ);
    assert.ok(expected);
    assert.equal(world.cm.getCurrentLocation(position), expected.name);
  }
  assert.equal(world.cm.getCurrentLocation(eye(modelExitZ, 0, -69)), '东路·宁寿宫一带');
  assert.equal(world.cm.getCurrentLocation(eye(modelExitZ, 0, 69)), '西路·建福宫一带');
  assert.equal(world.cm.getCurrentLocation(eye(modelExitZ, 0, -377)), '东华门外');
  assert.equal(world.cm.getCurrentLocation(eye(modelExitZ, 0, 377)), '西华门外');
  assert.equal(world.cm.getCurrentLocation(eye(-494)), '午门外广场');
});
