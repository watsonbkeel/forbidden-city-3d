import * as THREE from 'three';
const RANK = { essential: 0, core: 1, ambient: 2, optional: 3 };
export function selectCharacterLOD({ distance, projectedHeight, inFrustum = true, previousLOD = 3 }) {
  if (!inFrustum || distance < 0.4 || !Number.isFinite(distance)) return 3;
  const minimumPixels = previousLOD === 3 ? 2.4 : 1.6;
  if (projectedHeight < minimumPixels) return 3;
  if (previousLOD === 0 && distance < 12 * 1.18) return 0;
  if (previousLOD === 1 && distance >= 12 * .82 && distance < 40 * 1.18) return 1;
  if (previousLOD === 2 && distance >= 40 * .82) return 2;
  return distance < 12 ? 0 : distance < 40 ? 1 : 2;
}
export function characterProjection(position, camera, viewportHeight = 1080) {
  if (!camera) return { distance: 0, projectedHeight: 0, inFrustum: false };
  const center = new THREE.Vector3(position[0], position[1] + .9, position[2]);
  const distance = center.distanceTo(camera.position);
  const bodyPoint = new THREE.Vector3(position[0], Math.max(position[1]+.15, Math.min(position[1]+1.8,camera.position.y)), position[2]);
  const nearBody = bodyPoint.distanceTo(camera.position) < .4;
  const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
  const inFrustum = frustum.intersectsSphere(new THREE.Sphere(center, 1.05));
  const viewCenter = center.clone().applyMatrix4(camera.matrixWorldInverse);
  const projectedHeight = camera.isOrthographicCamera
    ? 1.85 * viewportHeight / Math.max(.01, camera.top - camera.bottom) * camera.zoom
    : 1.85 * viewportHeight / (2 * Math.max(.01, -viewCenter.z) * Math.tan((camera.fov ?? 60) * Math.PI / 360));
  return { distance, projectedHeight, inFrustum: inFrustum && !nearBody };
}
const taihe = a => a.sceneId === 'taihe' || a.id.startsWith('taihe-');
function stableOrder(a, b) {
  return (RANK[a.priority] ?? 2) - (RANK[b.priority] ?? 2) ||
    (a.distance ?? 0) - (b.distance ?? 0) || a.id.localeCompare(b.id);
}
/** Low tier explicitly keeps 1+12+2+4 court roles. No per-frame random deletion. */
export function selectCharacterBudget(actors, quality = 'high', registeredActors = actors) {
  const sorted = [...actors].sort(stableOrder);
  if (quality !== 'low') return sorted.slice(0, 64);
  const court = [...registeredActors].filter(taihe).sort(stableOrder), rest = sorted.filter(a => !taihe(a));
  const fixed = [];
  for (const [template, limit] of [['emperor-ceremonial',1], ['ritual-attendant',2], ['guard-duty',4]])
    fixed.push(...court.filter(a => a.templateId === template).slice(0, limit));
  const officials = court.filter(a => a.templateId === 'official-ceremonial');
  for (const side of ['left', 'right']) fixed.push(...officials.filter(a => a.formation?.side === side)
    .sort((a,b)=>(a.formation.index??0)-(b.formation.index??0)||a.id.localeCompare(b.id)).slice(0,6));
  const allowedIds = new Set(fixed.map(a=>a.id));
  const visibleCourt = sorted.filter(a=>taihe(a)&&allowedIds.has(a.id));
  return [...visibleCourt, ...rest.slice(0, 32 - visibleCourt.length)];
}
