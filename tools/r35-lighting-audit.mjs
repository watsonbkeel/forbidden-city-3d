/** CPU-only lighting policy audit. Never launches a browser or claims pixels.
 * Run from any working directory: node tools/r35-lighting-audit.mjs > report.json
 * The exact capture cameras and manual inspection targets live in the fixture.
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { Environment } from '../src/scene/Environment.js';
import { getBeijingDayCycle } from '../src/scene/sky/BeijingDayCycle.js';
import { r34NightSource, restorePreR34NightSource } from '../tests/lib/r34-night-source-retention.mjs';

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url));
const sha = value => createHash('sha256').update(value).digest('hex');
const manifestPath = 'tests/fixtures/r35-lighting-qa.json';
const manifest = JSON.parse(read(manifestPath));
const dayCyclePath = 'src/scene/sky/BeijingDayCycle.js';
const currentDayCycle = read(dayCyclePath);
// The independently frozen R33 source is recovered only from the complete,
// exact accepted R34 night source. Unknown edits fail instead of fabricating
// a baseline; this reporter must be deliberately revised after future tuning.
const priorSource = restorePreR34NightSource(dayCyclePath, currentDayCycle);
const { getBeijingDayCycle: priorCycle } = await import('data:text/javascript;base64,' + priorSource.toString('base64'));
const sourcePaths = [dayCyclePath, 'src/scene/Environment.js', 'src/scene/interior/InteriorLoader.js',
  'main.js', 'data/interiors/taihe.json', 'data/interiors/qianqing.json', manifestPath];
const sourceSHA256 = Object.fromEntries(sourcePaths.map(path => [path, sha(read(path))]));
const renderer = { toneMappingExposure: manifest.rendererExposure };
const scene = new THREE.Scene(), environment = new Environment(scene, renderer, {});
environment.setupSky(); environment.setupFog(); environment.setupLights();
const states = manifest.timeCases.map(({ id, date }) => {
  environment.setTimePreview(new Date(date));
  const cycle = environment.dayCycle, light = cycle.lighting;
  return {
    id, date, beijingTime: cycle.beijingTime.timeLabel, phase: cycle.phase,
    sunElevationDegrees: cycle.sun.elevationDegrees,
    daylight: light.daylight,
    rendererExposure: renderer.toneMappingExposure,
    sunIntensity: environment.dirLight.intensity,
    hemisphereIntensity: environment.hemiLight.intensity,
    hemisphereSkyColorLinear: environment.hemiLight.color.toArray(),
    hemisphereGroundColorLinear: environment.hemiLight.groundColor.toArray(),
    fillIntensity: environment.fillLight.intensity,
    fillColorLinear: environment.fillLight.color.toArray(),
    skyOnlyIBLIntensityParameter: light.environmentIntensity,
    sceneLightCount: scene.children.filter(object => object.isLight).length,
    sunShadowEnabled: environment.dirLight.castShadow,
    gardenGlowCount: environment.nightLampGlow.count,
    gardenGlowVisible: environment.nightLampGlow.visible,
    gardenGlowOpacity: environment.nightLampGlow.material.opacity,
  };
});
environment.dispose();
const luminance = color => color[0] * .2126 + color[1] * .7152 + color[2] * .0722;
// This is incident diffuse-light arithmetic for unit normals, before BRDF,
// material, texture, shadows, occlusion, IBL, tone mapping and display output.
// It is useful for comparative coverage, not a screen-brightness measurement.
const diffuseProxy = (light, normal) => {
  const hemisphere = (normal[1] + 1) / 2;
  const fill = Math.max(0, (-normal[0] + normal[1] - normal[2]) / Math.sqrt(3));
  return light.hemisphereIntensity * (luminance(light.hemisphereSkyColor) * hemisphere
    + luminance(light.hemisphereGroundColor) * (1 - hemisphere))
    + light.fillIntensity * luminance(light.fillColor) * fill;
};
const nightDate = new Date(manifest.timeCases.find(time => time.id === 'night').date);
const currentNight = getBeijingDayCycle(nightDate).lighting, priorNight = priorCycle(nightDate).lighting;
const normals = [['paving/up', [0, 1, 0]], ['west-facing', [1, 0, 0]], ['east-facing', [-1, 0, 0]],
  ['north-facing', [0, 0, 1]], ['south-facing', [0, 0, -1]], ['eave/ceiling-down', [0, -1, 0]]]
  .map(([name, normal]) => {
    const before = diffuseProxy(priorNight, normal), after = diffuseProxy(currentNight, normal);
    return { name, normal, r33DiffuseProxy: before, r34DiffuseProxy: after, r34ToR33Ratio: after / before };
  });
console.log(JSON.stringify({
  schema: 1,
  baselineCommit: manifest.baselineCommit,
  scope: 'CPU-only source/lighting arithmetic; no rendered image, luminance threshold, manual walking or FPS acceptance',
  visualAcceptance: 'NOT_RUN', gpuPerformanceAcceptance: 'NOT_RUN',
  dayCyclePolicyChangedSinceR34: sha(currentDayCycle) !== r34NightSource.files[dayCyclePath].candidateSHA256,
  sourceSHA256, states, normals,
  notes: [
    'DayCycle.lighting.exposure is a legacy descriptive field, not a renderer assignment. The live renderer remains at 0.70.',
    'The four glowing garden faces are visual cues, not emitted irradiance. They add no point lights or shadows.',
    'Taihe and Qianqing optional S point lights retain their existing intensity/distance values and stay independent of time.',
    'Do not increase global gain, sky color, exposure or interior lights based solely on this numerical report.',
  ],
}, null, 2));
