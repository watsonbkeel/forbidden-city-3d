import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { Environment } from '../../src/scene/Environment.js';
import { TextureLibrary } from '../../src/utils/TextureLibrary.js';

export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const targetToLight = env => env.dirLight.position.clone().sub(env.dirLight.target.position);
export const modelBearing = vector => (THREE.MathUtils.radToDeg(Math.atan2(-vector.x, vector.z)) + 360) % 360;

// Exercise the real initialization sequence and real TextureLibrary materials.
// Only GPU PMREM generation is replaced by an observation of its input scene.
// Texture image bytes are not loaded; this fixture cannot prove rendered pixels.
class CPUEnvironment extends Environment {
  setupIBL() {
    this.lightAtIBL = targetToLight(this);
    this.sceneAtIBL = this.scene;
  }
}
export function environmentFixture() {
  const library = new TextureLibrary();
  for (const name of ['ground_brick', 'stone_slab', 'skyline']) {
    const texture = new THREE.Texture({ width: 1211, height: 301 });
    library.configure(texture, name, 'color');
    library.colors.set(name, texture);
  }
  return new CPUEnvironment(new THREE.Scene(), null, library);
}

export function shadowSettings(light) {
  const { camera, mapSize, bias, normalBias, radius, autoUpdate } = light.shadow;
  return {
    castShadow: light.castShadow,
    camera: Object.fromEntries(['left', 'right', 'top', 'bottom', 'near', 'far'].map(key => [key, camera[key]])),
    mapSize: mapSize.toArray(), bias, normalBias, radius, autoUpdate,
  };
}
export function unchangedEnvironmentSnapshot(env) {
  const lights = env.scene.children.filter(object => object.isLight).map(light => ({
    type: light.type, color: light.color.getHex(), intensity: light.intensity,
    groundColor: light.groundColor?.getHex() ?? null,
    // The target-to-main-light direction is the one allowed changing quantity.
    position: light === env.dirLight ? 'AZIMUTH_STUDY' : light.position.toArray(),
    target: light.target?.position.toArray() ?? null,
  }));
  const materials = env.objects.filter(object => object.isMesh).map(mesh => ({
    geometry: mesh.geometry.type,
    position: mesh.position.toArray(), rotation: mesh.rotation.toArray(),
    castShadow: mesh.castShadow, receiveShadow: mesh.receiveShadow,
    type: mesh.material.type, name: mesh.material.name,
    color: mesh.material.color?.getHex() ?? null,
    roughness: mesh.material.roughness ?? null, metalness: mesh.material.metalness ?? null,
    side: mesh.material.side, transparent: mesh.material.transparent,
    opacity: mesh.material.opacity, alphaTest: mesh.material.alphaTest,
    depthWrite: mesh.material.depthWrite, fog: mesh.material.fog,
    map: mesh.material.map?.name ?? null,
    uniforms: mesh === env.sky ? Object.fromEntries(Object.entries(mesh.material.uniforms).map(([key, value]) => [key, value.value.getHex()])) : null,
    vertexShaderSHA256: mesh.material.vertexShader ? sha256(mesh.material.vertexShader) : null,
    fragmentShaderSHA256: mesh.material.fragmentShader ? sha256(mesh.material.fragmentShader) : null,
  }));
  return {
    lights, materials,
    fog: { isFogExp2: env.scene.fog.isFogExp2, color: env.scene.fog.color.getHex(), density: env.scene.fog.density },
    shadow: shadowSettings(env.dirLight),
    legacySunPosition: env.sunPosition.toArray(),
  };
}
export function protectedEnvironmentMethods() {
  const names = ['init', 'setupSky', 'setupSkyline', 'setupGround', 'setupFog', 'setupLights', 'setupIBL', 'setQuality', 'update', 'dispose'];
  return Object.fromEntries(names.map(name => {
    // Permit only initial sun placement to consume the shared candidate offset.
    const source = Environment.prototype[name].toString().replace(/^    dirLight\.position\.(?:set\(100, 200, 100\)|copy\(dirLight\.target\.position\)\.add\(this\.shadowOffset\));$/m, '    SUN_POSITION_FROM_SHARED_OFFSET;');
    return [name, sha256(source)];
  }));
}
