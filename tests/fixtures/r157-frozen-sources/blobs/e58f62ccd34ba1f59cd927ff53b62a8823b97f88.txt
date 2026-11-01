import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const standard = new THREE.MeshStandardMaterial();
const identity = new THREE.Matrix4();
const metadataKeys = new Set(['uuid', 'name', 'version', 'userData', '_listeners']);
const variableKeys = new Set(['color', 'roughness']);
const meshFlags = ['castShadow', 'receiveShadow', 'visible', 'renderOrder', 'frustumCulled'];
const fail = reason => { throw new Error(`Solid material batch: ${reason}`); };
const equal = (a, b) => a === b || (a?.equals && a.equals(b));

function validateMaterials(materials) {
  if (materials.length < 2 || new Set(materials).size !== materials.length) fail('select at least two distinct materials');
  for (const material of materials) {
    if (material?.constructor !== THREE.MeshStandardMaterial) fail('only plain MeshStandardMaterial is supported');
    if (material.transparent || material.opacity !== 1 || material.alphaTest !== 0 || material.alphaHash || material.vertexColors) {
      fail('only opaque, solid, non-vertex-colored materials are supported');
    }
    if (!Number.isFinite(material.roughness) || material.roughness < 0 || material.roughness > 1 || !material.color.toArray().every(Number.isFinite)) {
      fail('invalid color or roughness');
    }
    for (const hook of ['onBuild', 'onBeforeRender', 'onBeforeCompile', 'customProgramCacheKey']) {
      if (material[hook] !== standard[hook]) fail(`custom material ${hook} is unsupported`);
    }
    if (JSON.stringify(material.defines) !== JSON.stringify(standard.defines)) fail('custom material defines are unsupported');
    if (material.clippingPlanes?.length) fail('material clipping is unsupported');
    for (const key of Object.keys(material)) {
      if (metadataKeys.has(key)) continue;
      if (!Object.hasOwn(standard, key)) fail(`unsupported material property ${key}`);
      if (material[key]?.isTexture) fail(`textured material ${key} is unsupported`);
      if (variableKeys.has(key) || key === 'defines') continue;
      if (!equal(material[key], materials[0][key])) fail(`incompatible material property ${key}`);
    }
  }
}

function validateMeshes(root, meshes, materials) {
  if (materials.some(material => !meshes.some(mesh => mesh.material === material))) fail('a selected material has no direct mesh');
  const first = meshes[0];
  const attributes = Object.keys(first.geometry.attributes).sort().join(',');
  for (const mesh of meshes) {
    if (mesh.constructor !== THREE.Mesh || mesh.parent !== root || mesh.children.length || mesh.customDepthMaterial || mesh.customDistanceMaterial) {
      fail('only flat, ordinary meshes without custom shadow materials are supported');
    }
    if (meshFlags.some(key => mesh[key] !== first[key]) || mesh.layers.mask !== first.layers.mask) fail('incompatible mesh render/shadow flags');
    for (const hook of ['onBeforeRender', 'onAfterRender', 'onBeforeShadow', 'onAfterShadow']) {
      if (mesh[hook] !== THREE.Object3D.prototype[hook]) fail('custom mesh render/shadow callbacks are unsupported');
    }
    if (!mesh.matrixWorldAutoUpdate) fail('independently frozen world transforms are unsupported');
    const geometry = mesh.geometry;
    if (geometry.drawRange.start !== 0 || geometry.drawRange.count !== Infinity) fail('partial draw ranges are unsupported');
    if (Object.keys(geometry.morphAttributes).length) fail('morph geometry is unsupported');
    if (!geometry.attributes.position || !geometry.attributes.normal || Object.keys(geometry.attributes).sort().join(',') !== attributes) {
      fail('geometry must have matching position/normal/optional UV attributes');
    }
    for (const [key, attribute] of Object.entries(geometry.attributes)) {
      if (!['position', 'normal', 'uv'].includes(key) || attribute.isInterleavedBufferAttribute || attribute.normalized || !(attribute.array instanceof Float32Array)) {
        fail(`unsupported geometry attribute ${key}`);
      }
      if (attribute.count !== geometry.attributes.position.count || attribute.itemSize !== (key === 'uv' ? 2 : 3)) fail(`invalid geometry attribute ${key}`);
    }
    const count = geometry.index?.count ?? geometry.attributes.position.count;
    if (!count || count % 3) fail('geometry must contain whole triangles');
    if (mesh.matrixAutoUpdate) mesh.updateMatrix();
    if (!mesh.matrix.elements.every(Number.isFinite) || mesh.matrix.determinant() === 0) fail('invalid or singular mesh transform');
  }
}

function flipWinding(geometry) {
  for (const attribute of Object.values(geometry.attributes)) {
    const { array, itemSize, count } = attribute;
    for (let i = 0; i < count; i += 3) for (let j = 0; j < itemSize; j++) {
      const a = (i + 1) * itemSize + j, b = (i + 2) * itemSize + j;
      [array[a], array[b]] = [array[b], array[a]];
    }
  }
}

function configureShader(material) {
  material.color.setRGB(1, 1, 1);
  material.vertexColors = true;
  material.roughness = 1;
  material.customProgramCacheKey = () => 'solid-material-batch-v1';
  material.onBeforeCompile = shader => {
    const vertex = '#include <common>', begin = '#include <begin_vertex>';
    const fragment = '#include <common>', roughness = '#include <roughnessmap_fragment>';
    if (!shader.vertexShader.includes(vertex) || !shader.vertexShader.includes(begin) ||
        !shader.fragmentShader.includes(fragment) || !shader.fragmentShader.includes(roughness)) fail('unsupported standard shader chunks');
    shader.vertexShader = shader.vertexShader
      .replace(vertex, `${vertex}\nattribute float solidRoughness;\nvarying float vSolidRoughness;`)
      .replace(begin, `${begin}\nvSolidRoughness = solidRoughness;`);
    // Keep Three's original physical roughness floor, derivative correction and
    // lighting. Only replace the old per-material uniform with a constant-per-
    // triangle attribute, before the normal physical lighting chunks consume it.
    shader.fragmentShader = shader.fragmentShader
      .replace(fragment, `${fragment}\nvarying float vSolidRoughness;`)
      .replace(roughness, `${roughness}\nroughnessFactor *= vSolidRoughness;`);
  };
}

/**
 * Batch explicitly selected, compatible solid materials AFTER mergeByMaterial.
 * Only direct meshes are accepted. Root transforms and all nonselected objects
 * stay unchanged. Each triangle keeps its linear color and roughness; no vertex
 * welding, decimation, UV changes or material groups are introduced.
 *
 * Ownership: caller transfers the selected geometries. Replaced geometries are
 * disposed once unless another object under root still uses them. Source
 * materials remain caller-owned (including its material cache); caller must
 * register the returned material and dispose the returned geometry normally.
 * Unsupported input throws before replacing/disposal of any source resource.
 */
export function batchSolidMaterials(root, materials, { name = 'solid_material_batch' } = {}) {
  validateMaterials(materials);
  const selected = new Set(materials);
  const meshes = root.children.filter(mesh => selected.has(mesh.material));
  validateMeshes(root, meshes, materials);
  const parts = [];
  const sources = [];
  let geometry, material;
  try {
    let firstTriangle = 0;
    for (const mesh of meshes) {
      const part = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      parts.push(part);
      // Post-finish meshes are identity. Avoid even a normal renormalization in
      // that common path: every existing position and normal bit stays intact.
      if (!mesh.matrix.equals(identity)) part.applyMatrix4(mesh.matrix);
      if (mesh.matrix.determinant() < 0) flipWinding(part);
      const count = part.attributes.position.count;
      const color = mesh.material.color.toArray(); // THREE.Color is already linear.
      const colors = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) colors.set(color, i * 3);
      part.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      part.setAttribute('solidRoughness', new THREE.Float32BufferAttribute(new Float32Array(count).fill(mesh.material.roughness), 1));
      sources.push({ materialName: mesh.material.name, firstTriangle, triangleCount: count / 3,
        color, roughness: mesh.material.roughness });
      firstTriangle += count / 3;
    }
    geometry = mergeGeometries(parts, false);
    if (!geometry) fail('geometry concatenation failed');
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    material = materials[0].clone();
    material.name = name;
    configureShader(material);
  } catch (error) {
    geometry?.dispose();
    material?.dispose();
    throw error;
  } finally {
    parts.forEach(part => part.dispose());
  }
  const batch = new THREE.Mesh(geometry, material);
  batch.name = name;
  for (const key of meshFlags) batch[key] = meshes[0][key];
  batch.layers.mask = meshes[0].layers.mask;
  batch.userData.solidMaterialBatch = { version: 1, sources };
  const replaced = new Set(meshes.map(mesh => mesh.geometry));
  meshes.forEach(mesh => root.remove(mesh));
  root.traverse(object => { if (object.geometry) replaced.delete(object.geometry); });
  root.add(batch);
  replaced.forEach(old => old.dispose());
  return batch;
}

/** Resolve an actual raycast triangle to its original material identity. */
export function solidMaterialNameAt(mesh, faceIndex) {
  const sources = mesh.userData.solidMaterialBatch?.sources;
  if (!sources) return mesh.material?.name ?? null;
  if (!Number.isInteger(faceIndex) || faceIndex < 0) return null;
  return sources.find(source => faceIndex >= source.firstTriangle && faceIndex < source.firstTriangle + source.triangleCount)?.materialName ?? null;
}
