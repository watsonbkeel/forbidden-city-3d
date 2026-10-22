import * as THREE from 'three';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { ZoneBase } from '../../src/scene/zones/ZoneBase.js';
import { library, serial } from './inner-palace-fixture.mjs';
import { CollisionManager } from '../../src/utils/Collision.js';
export const sha = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
export const data = JSON.parse(readFileSync(new URL('../../data/zones/outer-west.json', import.meta.url)));
export const item = data.items.find(x => x.name === '寿康宫' && x.kind === 'hall');
export function fixture() {
  const b = new ZoneBase(library(), data), { f } = b.buildHall(item);
  b.kit.root.updateMatrixWorld(true);
  const cm = new CollisionManager(); cm.rivers = []; cm.addColliders(b.kit.colliders); cm.addWalkables(b.kit.walkables);
  return { b, f, cm, added: f.getObjectByName('shoukang-east-north-framework'), dispose: () => b.kit.dispose(b.kit.root) };
}
export function capture({ b, f }, omitAddition = false) {
  const added = f.getObjectByName('shoukang-east-north-framework'), excluded = new Set();
  if (omitAddition) added?.traverse(o => excluded.add(o));
  const meshes = [];
  f.traverse(o => { if (!o.isMesh || excluded.has(o)) return;
    meshes.push({ name: o.name, role: o.userData.role ?? null, matrix: o.matrixWorld.toArray(),
      geometry: sha({ attributes: Object.fromEntries(Object.entries(o.geometry.attributes).map(([k, a]) => [k, { itemSize: a.itemSize, normalized: a.normalized, array: [...a.array] }])), index: o.geometry.index ? [...o.geometry.index.array] : null }),
      material: o.material ? { name: o.material.name, color: o.material.color.getHex(), roughness: o.material.roughness, metalness: o.material.metalness, side: o.material.side, opacity: o.material.opacity, transparent: o.material.transparent } : null });
  });
  const range = omitAddition ? added?.userData.colliderRange : null;
  return JSON.parse(JSON.stringify({ meshes, navigation: { colliders: b.kit.colliders.filter((_, i) => !range || i < range.start || i >= range.end).map(serial), walkables: b.kit.walkables, rooms: b.kit.rooms, regions: b.kit.regions, map: b.kit.mapItems }, structure: f.userData.structure }));
}
export function localBounds(o, f) {
  f.updateMatrixWorld(true); const inverse = f.matrixWorld.clone().invert(), result = new THREE.Box3(), point = new THREE.Vector3();
  o.traverse(m => { if (!m.isMesh) return; const p = m.geometry.attributes.position; for (let i = 0; i < p.count; i++) result.expandByPoint(point.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld).applyMatrix4(inverse)); });
  return result;
}
