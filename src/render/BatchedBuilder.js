import * as THREE from 'three';

// 跨组材质批次仍保留每个源网格的矩阵与包围球；源对象保留供碰撞和释放。
export class BatchedBuilder {
  constructor(scene) {
    this.scene = scene;
    this.sources = [];
    this.batches = [];
    this.signature = '';
    this.container = new THREE.Group();
    this.container.name = 'render-batches';
    this.matrix = new THREE.Matrix4();
  }

  collect() {
    const meshes = [];
    this.scene.traverse(obj => {
      if (obj.isMesh && !obj.isInstancedMesh && !obj.isBatchedMesh &&
          !obj.userData.noMerge && !Array.isArray(obj.material) && !obj.material.transparent && !obj.material.isShaderMaterial &&
          obj.geometry.attributes.position && !Object.keys(obj.geometry.morphAttributes).length) meshes.push(obj);
    });
    return meshes;
  }

  rebuild(meshes) {
    this.dispose();
    const buckets = new Map();
    for (const mesh of meshes) {
      const attributes = Object.entries(mesh.geometry.attributes).map(([name, a]) => `${name}:${a.itemSize}:${a.normalized}`).sort().join(',');
      const key = `${mesh.material.uuid}:${attributes}:${!!mesh.geometry.index}:${mesh.receiveShadow}`;
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
    const meshes = this.collect();
    const signature = meshes.map(m => m.uuid).join(',');
    if (signature !== this.signature) {
      this.rebuild(meshes);
      this.signature = signature;
    }
    this.scene.updateMatrixWorld(true);
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
