import * as THREE from 'three';

// V13 budget repair: only the two repeated, generated roof solids may share
// across material identities. All source objects/materials remain caller-owned.
const roofSolids = new Set(['roof_ridge_glaze', 'roof_finial_gold']);
const standard = new THREE.MeshStandardMaterial();
const identity = new THREE.Matrix4();
const attributeIds = new WeakMap();
let nextAttributeId = 0;
const metadata = new Set(['id', 'uuid', 'name', 'version', 'userData', '_listeners']);
const scalarKeys = new Set(['color', 'roughness', 'metalness']);
const standardKeys = Object.getOwnPropertyNames(standard);
const equal = (a, b) => a === b || (a?.constructor === b?.constructor && a?.equals?.(b));

function exactRoofSolidKey(material) {
  if (Object.getPrototypeOf(material) !== THREE.MeshStandardMaterial.prototype || !roofSolids.has(material.name) ||
      Object.getOwnPropertySymbols(material).length) return null;
  for (const hook of ['onBuild', 'onBeforeRender', 'onBeforeCompile', 'customProgramCacheKey']) {
    if (material[hook] !== standard[hook]) return null;
  }
  // Validate the complete default field set, not just fields still present on
  // the source. Unknown fields fail closed; textures and custom state do too.
  if (Object.getOwnPropertyNames(material).some(key => !metadata.has(key) && !standardKeys.includes(key))) return null;
  for (const key of standardKeys) {
    if (metadata.has(key) || scalarKeys.has(key)) continue;
    if (key === 'defines') {
      if (!material.defines || Object.getPrototypeOf(material.defines) !== Object.prototype ||
          Reflect.ownKeys(material.defines).length !== 1 || material.defines.STANDARD !== '') return null;
    } else if (!equal(material[key], standard[key])) return null;
  }
  if (material.color?.constructor !== THREE.Color || !material.color.toArray().every(Number.isFinite) ||
      ![material.roughness, material.metalness].every(n => Number.isFinite(n) && n >= 0 && n <= 1)) return null;
  // Raw linear values, never getHex()/toJSON() quantization; no shader changes.
  return `exact-roof:${material.name}:${material.color.toArray().join(',')}:${material.roughness}:${material.metalness}`;
}

function canShareRoofSolid(mesh, scene) {
  if (!scene.matrixWorld.equals(identity)) return false;
  if (Object.getPrototypeOf(mesh) !== THREE.Mesh.prototype || mesh.children.length || mesh.customDepthMaterial || mesh.customDistanceMaterial ||
      !mesh.matrixWorldAutoUpdate || !mesh.frustumCulled || mesh.renderOrder !== 0 || mesh.layers.mask !== 1 ||
      mesh.geometry.drawRange.start !== 0 || mesh.geometry.drawRange.count !== Infinity) return false;
  const attributes = mesh.geometry.attributes;
  if (Object.keys(attributes).sort().join(',') !== 'normal,position,uv') return false;
  for (const [key, attribute] of Object.entries(attributes)) {
    if (![THREE.BufferAttribute.prototype, THREE.Float32BufferAttribute.prototype].includes(Object.getPrototypeOf(attribute)) ||
        !(attribute.array instanceof Float32Array) || attribute.normalized || attribute.gpuType !== THREE.FloatType || attribute.usage !== THREE.StaticDrawUsage ||
        attribute.itemSize !== (key === 'uv' ? 2 : 3) || attribute.count !== attributes.position.count) return false;
  }
  const index = mesh.geometry.index;
  if (index && (index.itemSize !== 1 || index.normalized || index.usage !== THREE.StaticDrawUsage ||
      ![THREE.BufferAttribute.prototype, THREE.Uint16BufferAttribute.prototype, THREE.Uint32BufferAttribute.prototype].includes(Object.getPrototypeOf(index)) ||
      !(index.array instanceof Uint16Array || index.array instanceof Uint32Array))) return false;
  for (const hook of ['onBeforeRender', 'onAfterRender', 'onBeforeShadow', 'onAfterShadow']) {
    if (mesh[hook] !== THREE.Object3D.prototype[hook]) return false;
  }
  for (let parent = mesh.parent; parent; parent = parent.parent) {
    if (parent.isGroup && parent.renderOrder !== 0) return false;
  }
  const e = mesh.matrixWorld.elements;
  if (!e.every(Number.isFinite) || e[3] !== 0 || e[7] !== 0 || e[11] !== 0 || e[15] !== 1 ||
      mesh.matrixWorld.determinant() <= 0) return false;
  // r162 batching cannot preserve mirrored winding or sheared normal bases.
  for (const [a, b] of [[0, 4], [0, 8], [4, 8]]) {
    const dot = e[a] * e[b] + e[a + 1] * e[b + 1] + e[a + 2] * e[b + 2];
    const lengths = Math.hypot(e[a], e[a + 1], e[a + 2]) * Math.hypot(e[b], e[b + 1], e[b + 2]);
    if (Math.abs(dot) > 1e-12 * lengths) return false;
  }
  return true;
}

function geometryRevision(geometry) {
  // Only the newly shared static roof path needs this additional copy lifetime
  // check. Revisions/identities are bounded metadata, never per-frame array hashes.
  return Object.entries({ ...geometry.attributes, index: geometry.index }).map(([name, attribute]) => {
    if (!attribute) return `${name}:none`;
    if (!attributeIds.has(attribute)) attributeIds.set(attribute, ++nextAttributeId);
    return `${name}:${attributeIds.get(attribute)}:${attribute.version}:${attribute.count}`;
  }).join(',');
}

function batchKeys(meshes, scene) {
  const materialKeys = new Map();
  return meshes.map(mesh => {
    if (!materialKeys.has(mesh.material)) materialKeys.set(mesh.material, exactRoofSolidKey(mesh.material));
    const exact = materialKeys.get(mesh.material);
    const materialKey = exact && canShareRoofSolid(mesh, scene) ? exact : mesh.material.uuid;
    const attributes = Object.entries(mesh.geometry.attributes).map(([name, a]) => `${name}:${a.itemSize}:${a.normalized}`).sort().join(',');
    return `${materialKey}:${attributes}:${!!mesh.geometry.index}:${mesh.receiveShadow}`;
  });
}

// 跨组材质批次仍保留每个源网格的矩阵与包围球；源对象保留供碰撞和释放。
export class BatchedBuilder {
  constructor(scene) {
    this.scene = scene;
    this.sources = [];
    this.batches = [];
    this.signature = '';
    this.container = new THREE.Group();
    this.container.name = 'render-batches';
  }

  collect() {
    const meshes = [];
    this.scene.traverse(obj => {
      if (obj.isMesh && !obj.isInstancedMesh && !obj.isBatchedMesh && !obj.isSkinnedMesh &&
          !obj.userData.noMerge && !Array.isArray(obj.material) && !obj.material.transparent && !obj.material.isShaderMaterial &&
          obj.geometry.attributes.position && !Object.keys(obj.geometry.morphAttributes).length) meshes.push(obj);
    });
    return meshes;
  }

  rebuild(meshes, keys = batchKeys(meshes, this.scene)) {
    this.dispose();
    const buckets = new Map();
    for (const [i, mesh] of meshes.entries()) {
      const key = keys[i];
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(mesh);
    }
    for (const members of buckets.values()) {
      if (members.length < 2) continue;
      const vertices = members.reduce((n, m) => n + m.geometry.attributes.position.count, 0);
      const indices = members.reduce((n, m) => n + (m.geometry.index?.count ?? 0), 0);
      const batch = new THREE.BatchedMesh(members.length, vertices, indices, members[0].material);
      batch.frustumCulled = false;
      batch.sortObjects = false;
      batch.receiveShadow = members[0].receiveShadow;
      const entries = members.map(mesh => ({ mesh, id: batch.addGeometry(mesh.geometry) }));
      const beforeShadow = batch.onBeforeShadow.bind(batch);
      batch.onBeforeShadow = (...args) => {
        for (const entry of entries) batch.setVisibleAt(entry.id, entry.visible && entry.mesh.castShadow);
        beforeShadow(...args);
      };
      batch.onAfterShadow = () => {
        for (const entry of entries) batch.setVisibleAt(entry.id, entry.visible);
      };
      this.batches.push({ batch, entries });
      this.container.add(batch);
    }
    this.sources = meshes;
  }

  begin() {
    this.scene.updateMatrixWorld(true);
    const meshes = this.collect(), keys = batchKeys(meshes, this.scene);
    // Include actual identities as well as current values: an equal-valued
    // replacement must not leave a batch holding an old, disposed material.
    const signature = meshes.map((m, i) =>
      `${m.uuid}:${m.material.uuid}:${m.geometry.uuid}:${keys[i]}:${keys[i].startsWith('exact-roof:') ? geometryRevision(m.geometry) : ''}`).join('|');
    if (signature !== this.signature) {
      this.rebuild(meshes, keys);
      this.signature = signature;
    }
    this.hidden = [];
    for (const { batch, entries } of this.batches) {
      batch.castShadow = false;
      for (const entry of entries) {
        const { mesh, id } = entry;
        let visible = mesh.visible;
        for (let p = mesh.parent; p && visible; p = p.parent) visible &&= p.visible;
        entry.visible = visible;
        batch.setVisibleAt(id, visible);
        batch.setMatrixAt(id, mesh.matrixWorld);
        batch.castShadow ||= visible && mesh.castShadow;
        this.hidden.push([mesh, mesh.visible]);
        mesh.visible = false;
      }
    }
    this.scene.add(this.container);
  }

  end() {
    this.container.removeFromParent();
    for (const [mesh, visible] of this.hidden) mesh.visible = visible;
    this.hidden.length = 0;
  }

  dispose() {
    for (const { batch } of this.batches) batch.dispose();
    this.container.clear();
    this.batches.length = 0;
    this.sources.length = 0;
    this.signature = '';
  }
}
