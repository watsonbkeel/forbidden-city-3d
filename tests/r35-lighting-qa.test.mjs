import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const fixtureURL = new URL('./fixtures/r35-lighting-qa.json', import.meta.url);
test('R35 lighting QA has a reproducible camera/time manifest before visual calibration', () => {
  assert.ok(fs.existsSync(fixtureURL), 'missing exact R35 lighting camera/time manifest');
  const manifest = JSON.parse(fs.readFileSync(fixtureURL, 'utf8'));
  assert.equal(manifest.schema, 1);
  assert.equal(manifest.visualAcceptance, 'NOT_RUN');
  assert.deepEqual(manifest.viewport, { width: 1280, height: 720, deviceScaleFactor: 1 });
  assert.equal(manifest.camera.fov, 70);
  assert.equal(manifest.rendererExposure, 0.7);
  assert.deepEqual(manifest.qualities, ['high', 'low']);
  assert.equal(manifest.festivalLamps, false);
  assert.equal(manifest.views.length, 11);
  assert.equal(new Set(manifest.views.map(view => view.id)).size, manifest.views.length);
  for (const view of manifest.views) {
    assert.equal(view.position.length, 3);
    assert.equal(view.target.length, 3);
    assert.ok([...view.position, ...view.target].every(Number.isFinite));
    assert.ok(Math.hypot(...view.position.map((value, index) => value - view.target[index])) > 1);
    assert.ok(view.inspect.length > 0);
  }
});

import { TAIHE_CORE } from '../src/scene/palace/special/TaiheCoreProfile.js';
import { INITIAL_VIEW_POSITION } from '../src/config/initialView.js';
import { qianqingFrontageGrid } from '../src/scene/palace/QianqingFrontageGrid.js';
import { getBeijingDayCycle } from '../src/scene/sky/BeijingDayCycle.js';

const manifest = () => JSON.parse(fs.readFileSync(fixtureURL, 'utf8'));
test('R35 QA retains the production optical settings and current source-derived standing locations', () => {
  const m = manifest(), source = fs.readFileSync(new URL('../main.js', import.meta.url), 'utf8');
  const camera = source.match(/new THREE\.PerspectiveCamera\(\s*([\d.]+),\s*window.innerWidth \/ window.innerHeight,\s*([\d.]+),\s*([\d.]+)\s*\)/);
  assert.ok(camera, 'production camera declaration remains discoverable');
  assert.deepEqual(m.camera, { fov: Number(camera[1]), near: Number(camera[2]), far: Number(camera[3]) });
  assert.equal(m.rendererExposure, Number(source.match(/this\.renderer\.toneMappingExposure = ([\d.]+);/)[1]));
  assert.deepEqual(m.views[0].position, [INITIAL_VIEW_POSITION.x, INITIAL_VIEW_POSITION.y, INITIAL_VIEW_POSITION.z]);
  for (const v of m.views.filter(v => v.id.startsWith('taihe-') && v.id !== 'taihe-approach'))
    assert.equal(v.position[1], TAIHE_CORE.frame.floorY + 1.7);
  const frontage = qianqingFrontageGrid(46), expectedX = frontage.passageInner + frontage.passageBayWidth / 2;
  const passage = m.views.find(v => v.id === 'qianqing-end-passage');
  assert.equal(passage.position[0], expectedX);
  assert.equal(passage.target[0], expectedX);
});

test('R35 QA uses distinct October day, twilight and full-night lighting states in Beijing time', () => {
  const m = manifest();
  assert.deepEqual(m.timeCases.map(t => t.id), ['day', 'twilight', 'night']);
  const samples = m.timeCases.map(t => {
    assert.match(t.date, /\+08:00$/);
    const state = getBeijingDayCycle(new Date(t.date));
    assert.equal(state.phase, t.expectedPhase);
    return state.lighting;
  });
  assert.equal(samples[0].daylight, 1);
  assert.ok(samples[1].daylight > 0 && samples[1].daylight < 1);
  assert.equal(samples[2].daylight, 0);
});

import { registerHooks } from 'node:module';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { buildWorld } from './lib/world.mjs';
registerHooks({ load(url, context, next) {
  if (url.endsWith('.json')) return { format: 'module', source: `export default ${fs.readFileSync(new URL(url), 'utf8')}`, shortCircuit: true };
  return next(url, context);
} });

test('all R35 lighting views stand on actual floors without collision in B and loaded S states', async () => {
  const { InteriorLoader } = await import('../src/scene/interior/InteriorLoader.js');
  const { INTERIORS } = await import('../src/scene/interior/registry.js');
  const world = await buildWorld({ retainScene: true });
  const loader = new InteriorLoader(world.scene, world.cm, {
    registry: Object.fromEntries(['taihe', 'qianqing'].map(id => [id, INTERIORS[id]])),
  });
  loader.gltf.load = async (url, ok, _progress, fail) => {
    try {
      const bytes = fs.readFileSync(new URL('../public' + url, import.meta.url));
      ok(await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length), ''));
    } catch (error) { fail(error); }
  };
  try {
    for (const tier of ['B', 'S']) {
      if (tier === 'S') for (const id of loader.ids()) assert.equal(await loader.load(id), true, `checked ${id} asset installs`);
      for (const view of manifest().views) {
        const [x, y, z] = view.position;
        assert.ok(Math.abs(world.cm.getGroundHeight(x, z, y - 1.7, 0.6) - (y - 1.7)) < 1e-8, `${tier} ${view.id}: eye stays one standing height over actual floor`);
        assert.equal(world.cm.checkCollision(new THREE.Vector3(x, y, z), 0.5), false, `${tier} ${view.id}: ordinary body clearance`);
      }
    }
  } finally { loader.dispose(); }
});

test('R35 night audit is an executable CPU-only report, not invented screenshot evidence', () => {
  const file = new URL('../tools/r35-lighting-audit.mjs', import.meta.url);
  assert.ok(fs.existsSync(file), 'missing reproducible lighting policy audit');
  const report = JSON.parse(execFileSync(process.execPath, [fileURLToPath(file)], { encoding: 'utf8' }));
  assert.equal(report.visualAcceptance, 'NOT_RUN');
  assert.equal(report.gpuPerformanceAcceptance, 'NOT_RUN');
  assert.equal(report.dayCyclePolicyChangedSinceR34, false);
  assert.equal(report.states.length, 3);
  for (const state of report.states) {
    assert.equal(state.rendererExposure, 0.7);
    assert.equal(state.sceneLightCount, 3);
    assert.equal(state.gardenGlowCount, 4);
    assert.ok(Number.isFinite(state.sunElevationDegrees));
  }
  assert.deepEqual(report.states[0] && [report.states[0].hemisphereIntensity, report.states[0].fillIntensity, report.states[0].skyOnlyIBLIntensityParameter], [0.5, 0.25, 0.6]);
  assert.deepEqual(report.states[2] && [report.states[2].hemisphereIntensity, report.states[2].fillIntensity, report.states[2].skyOnlyIBLIntensityParameter], [0.9, 0.5, 0.3]);
  assert.equal(report.states[0].gardenGlowVisible, false);
  assert.equal(report.states[0].gardenGlowOpacity, 0);
  assert.equal(report.states[0].sunShadowEnabled, true);
  assert.equal(report.states[2].gardenGlowOpacity, 1);
  assert.equal(report.states[2].sunShadowEnabled, false);
  assert.equal(report.states[1].gardenGlowOpacity, 1 - report.states[1].daylight);
  assert.equal(report.states[2].sunIntensity, 0);
  assert.equal(report.states[2].gardenGlowVisible, true);
  assert.equal(report.normals.length, 6);
  for (const normal of report.normals) {
    assert.ok(normal.r34ToR33Ratio > 3 && normal.r34ToR33Ratio < 4, normal.name);
    assert.ok(Number.isFinite(normal.r34DiffuseProxy));
  }
  assert.ok(Object.values(report.sourceSHA256).every(value => /^[a-f0-9]{64}$/.test(value)));
});
