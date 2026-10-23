import * as THREE from 'three';
const RANK = { essential: 0, core: 1, ambient: 2, optional: 3 };
const NEAR_LIMIT = 2, NEAR_HYSTERESIS_METERS = 1;
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
// Budget locality uses the already-hysteretic geometric LOD, not a fresh
// distance threshold. Far core crowds must not erase an eye-level local role.
// Keep geometric budgetLOD separate from low-tier render-only LOD demotion.
// Registered-only records have no LOD, so fixed low-tier identity selection is unchanged.
const locality = a => { const lod = a.budgetLOD ?? a.lod; return lod === 0 ? 0 : lod === 1 ? 1 : 2; };
function stableOrder(a, b) {
  return Number(b.priority === 'essential') - Number(a.priority === 'essential') ||
    locality(a) - locality(b) ||
    (RANK[a.priority] ?? 2) - (RANK[b.priority] ?? 2) ||
    (a.distance ?? 0) - (b.distance ?? 0) || a.id.localeCompare(b.id);
}
/** Render-only cap: demotion never changes geometric LOD history or hides roles.
 * Within a priority, a challenger must be more than 1m closer than an incumbent.
 * The discount is a stable sort key, not a pairwise non-transitive comparator. */
function applyNearBudget(actors, quality, previousNearIds) {
  const near = quality === 'low' ? [] : actors.filter(a => a.lod === 0).sort((a, b) => {
    const previousA = previousNearIds.has(a.id) ? 1 : 0, previousB = previousNearIds.has(b.id) ? 1 : 0;
    return (RANK[a.priority] ?? 2) - (RANK[b.priority] ?? 2) ||
      ((a.distance ?? 0) - previousA * NEAR_HYSTERESIS_METERS) - ((b.distance ?? 0) - previousB * NEAR_HYSTERESIS_METERS) ||
      previousB - previousA || a.id.localeCompare(b.id);
  }).slice(0, NEAR_LIMIT);
  const nearIds = new Set(near.map(a => a.id));
  return actors.map(a => a.lod === 0 && !nearIds.has(a.id) ? { ...a, lod: 1 } : a);
}
/** Low tier explicitly keeps 1+12+2+4 court roles. No per-frame random deletion.
 * previousNearIds contains only the prior frame's submitted LOD0 actor IDs. */
export function selectCharacterBudget(actors, quality = 'high', registeredActors = actors, previousNearIds = new Set()) {
  const sorted = [...actors].sort(stableOrder);
  if (quality !== 'low') return applyNearBudget(sorted.slice(0, 64), quality, previousNearIds);
  const allowedIds=characterQualityEligibleIds(registeredActors,quality),rest=sorted.filter(a=>!taihe(a));
  const visibleCourt = sorted.filter(a=>taihe(a)&&allowedIds.has(a.id));
  return applyNearBudget([...visibleCourt, ...rest.slice(0, 32 - visibleCourt.length)], quality, previousNearIds);
}
export function characterQualityEligibleIds(registeredActors,quality='high'){
  if(quality!=='low')return new Set(registeredActors.map(a=>a.id));
  const court = [...registeredActors].filter(taihe).sort(stableOrder);
  const fixed = [];
  for (const [template, limit] of [['emperor-ceremonial',1], ['ritual-attendant',2], ['guard-duty',4]])
    fixed.push(...court.filter(a => a.templateId === template).slice(0, limit));
  const officials = court.filter(a => a.templateId === 'official-ceremonial');
  for (const side of ['left', 'right']) fixed.push(...officials.filter(a => a.formation?.side === side)
    .sort((a,b)=>(a.formation.index??0)-(b.formation.index??0)||a.id.localeCompare(b.id)).slice(0,6));
  return new Set([...fixed,...registeredActors.filter(a=>!taihe(a))].map(a=>a.id));
}
