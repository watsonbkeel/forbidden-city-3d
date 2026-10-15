import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readHistoricalSource } from '../lib/historical-sources.mjs';
import { assertV9MapMainBytes } from '../lib/v9-map-source-delta.mjs';
import { assertGateConstantsBytes } from '../lib/v9-gate-constants-delta.mjs';
import * as THREE from 'three';
import { Environment } from '../../src/scene/Environment.js';
import { getSunPosition } from '../../src/scene/sky/SkySetup.js';
import { environmentFixture, targetToLight, modelBearing, shadowSettings, unchangedEnvironmentSnapshot, protectedEnvironmentMethods, sha256 } from '../lib/environment-lighting.mjs';

const baseline = JSON.parse(readFileSync(new URL('../fixtures/environment-lighting-v7.json', import.meta.url), 'utf8'));
// Independently accepted exact-pixel optimization, integrated after the isolated
// azimuth study. Preserve the historical V7 fixture and allow only this named
// skyline-side delta; all other state/source comparisons remain strict.
const acceptedSkyline = Object.freeze({
  commit: 'a59fa7ec18b6ce991128a2e7700ba09be3128078',
  sourceSHA256: '938c59be0e2fc13d69d364011cfe1d579defacf83ae3b2d63feb57c2b71871d0',
  materialSide: THREE.BackSide,
});
const candidate = new THREE.Vector3(100, 200, -100);
const original = new THREE.Vector3(...baseline.targetToLight);
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-10, `${label}: ${actual} != ${expected}`);
function initialized(t) {
  const env = environmentFixture();
  env.init();
  t.after(() => { env.dispose(); env.library.dispose(); });
  return env;
}

test('initial real directional light is the southwest candidate before the PMREM boundary', t => {
  const env = initialized(t);
  assert.deepEqual(targetToLight(env).toArray(), candidate.toArray());
  assert.deepEqual(env.lightAtIBL.toArray(), candidate.toArray());
  assert.equal(env.sceneAtIBL, env.scene);
});

test('runtime real light retains the candidate at translated and elevated cameras', t => {
  const env = initialized(t);
  const camera = new THREE.PerspectiveCamera();
  for (const position of [[0, 1.7, -419.6], [-293.2, 30, 142.545], [80, 1.7, 542], [12, 300, -90], [0, 0, 0]]) {
    camera.position.fromArray(position);
    env.update(camera, 1 / 60);
    assert.deepEqual(targetToLight(env).toArray(), candidate.toArray());
    assert.deepEqual(env.dirLight.target.position.toArray(), [position[0], 0, position[2]]);
    assert.deepEqual(env.sky.position.toArray(), position);
    assert.deepEqual(env.skylineRing.position.toArray(), [position[0], 30, position[2]]);
  }
});

test('initial setup and runtime consume the same offset rather than separate hardcoded sun positions', t => {
  const env = environmentFixture();
  // A distinct value catches a second hardcoded initial position, even if it
  // happens to equal the normal candidate. This is a test-only perturbation.
  env.shadowOffset.set(25, 80, -50);
  env.init();
  t.after(() => { env.dispose(); env.library.dispose(); });
  assert.deepEqual(env.lightAtIBL.toArray(), [25, 80, -50]);
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(-80, 5, 300);
  env.update(camera, 1 / 10);
  assert.deepEqual(targetToLight(env).toArray(), [25, 80, -50]);
});

test('candidate preserves V7 light distance, elevation, unoccluded ground incidence and flat-ground shadow length', t => {
  const env = initialized(t);
  const actual = targetToLight(env);
  const elevation = v => THREE.MathUtils.radToDeg(Math.atan2(v.y, Math.hypot(v.x, v.z)));
  const incidence = v => v.clone().normalize().dot(new THREE.Vector3(0, 1, 0));
  const shadowLengthPerHeight = v => Math.hypot(v.x, v.z) / v.y;
  close(actual.length(), original.length(), 'distance');
  close(actual.length(), 244.94897427831782, 'distance in model units');
  close(elevation(actual), elevation(original), 'elevation');
  close(elevation(actual), 54.735610317245346, 'elevation degrees');
  close(incidence(actual), incidence(original), 'unoccluded horizontal ground cosine');
  close(incidence(actual), Math.sqrt(2 / 3), 'ground cosine');
  close(shadowLengthPerHeight(actual), shadowLengthPerHeight(original), 'flat-ground shadow length / height');
});

test('model compass uses west-positive X and north-positive Z for light and shadow directions', t => {
  const env = initialized(t);
  for (const [direction, bearing] of [[[0, 0, 1], 0], [[-1, 0, 0], 90], [[0, 0, -1], 180], [[1, 0, 0], 270]]) {
    close(modelBearing(new THREE.Vector3(...direction)), bearing, 'model cardinal');
  }
  close(modelBearing(original), 315, 'V7 target-to-light bearing');
  close(modelBearing(targetToLight(env)), 225, 'candidate target-to-light bearing');
  close(modelBearing(targetToLight(env).negate()), 45, 'candidate horizontal ray/shadow bearing');
  const unit = targetToLight(env).normalize();
  close(Math.max(0, unit.dot(new THREE.Vector3(0, 0, -1))), 1 / Math.sqrt(6), 'south-facing direct incidence');
  close(Math.max(0, unit.dot(new THREE.Vector3(0, 0, 1))), 0, 'north-facing direct incidence');
});

test('non-azimuth settings match V7 except the separately accepted exact-output skyline side', t => {
  assert.equal(baseline.baseCommit, '35914d6c2bc16dbb9fd7245d6384195ece5e125d');
  assert.equal(baseline.baseTree, 'ed7a9c4e6652925d03a4d1d4de30529de785945a');
  const expected = structuredClone(baseline.environment);
  const skyline = expected.materials.filter(m => m.geometry === 'CylinderGeometry' && m.map === 'skyline_color');
  assert.equal(skyline.length, 1);
  assert.equal(skyline[0].side, THREE.DoubleSide, 'historical fixture is not rewritten');
  skyline[0].side = acceptedSkyline.materialSide;
  assert.deepEqual(unchangedEnvironmentSnapshot(initialized(t)), expected);
});

test('both quality shadow configurations and restoration retain V7 values', t => {
  const env = initialized(t);
  for (const [label, high] of [['low', false], ['high', true]]) {
    env.setQuality(high);
    assert.deepEqual(shadowSettings(env.dirLight), baseline.quality[label]);
  }
});

test('untouched Environment methods preserve IBL intensity and setup plus all non-direction behavior', () => {
  assert.deepEqual(protectedEnvironmentMethods(), baseline.environmentMethodsSHA256);
});

test('protected sources match V7 with only the exact accepted skyline substitution and finite V9 map and gate deltas', () => {
  assert.equal(baseline.protectedSourcesSHA256['src/scene/sky/Skyline.js'],
    '1aeb74c691478690d1eae9cfab2950847c786309e2a0f37a29a56fce0b15afba');
  for (const [path, hash] of Object.entries(baseline.protectedSourcesSHA256)) {
    if (path === 'src/config/constants.js') {
      const historical = readHistoricalSource('35914d6c2bc16dbb9fd7245d6384195ece5e125d', 'src/config/constants.js');
      assert.equal(sha256(historical), hash, 'historical constants fixture remains unchanged');
      assertGateConstantsBytes(historical, readFileSync(new URL(`../../${path}`, import.meta.url)));
      continue;
    }
    const expected = path === 'src/scene/sky/Skyline.js' ? acceptedSkyline.sourceSHA256 : hash;
    const current = readFileSync(new URL(`../../${path}`, import.meta.url));
    if (path === 'main.js') {
      const historical = readHistoricalSource(baseline.baseCommit, path);
      assert.equal(sha256(historical), hash, 'the original V7 main.js hash remains pinned');
      assertV9MapMainBytes(historical, current);
    } else assert.equal(sha256(current), expected, path);
  }
});

test('unused legacy getSunPosition API behavior stays unchanged and is not the active sun vector', t => {
  const env = initialized(t);
  assert.deepEqual(getSunPosition().toArray(), baseline.environment.legacySunPosition);
  for (const [azimuth, elevation, expected] of baseline.legacyAPISamples) {
    assert.deepEqual(getSunPosition(azimuth, elevation).toArray(), expected);
  }
  assert.ok(env.sunPosition.distanceTo(targetToLight(env)) > 400000);
});

// Guard the guard: source normalization must not hide an unrelated operation
// appended to the one permitted sun-placement statement.
test('source snapshot guard rejects unrelated side effects on the sun-placement line', () => {
  const originalMethod = Environment.prototype.setupLights;
  const changedSource = originalMethod.toString().replace(
    /(^    dirLight\.position\..*;)/m,
    '$1 this.scene.background = new THREE.Color(0x000000);'
  );
  assert.notEqual(changedSource, originalMethod.toString());
  const changedMethod = new Function('THREE', `return class { ${changedSource} }`)(THREE).prototype.setupLights;
  try {
    Environment.prototype.setupLights = changedMethod;
    assert.notEqual(protectedEnvironmentMethods().setupLights, baseline.environmentMethodsSHA256.setupLights);
  } finally {
    Environment.prototype.setupLights = originalMethod;
  }
});
