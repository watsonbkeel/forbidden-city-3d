import * as THREE from 'three';

export const WUMEN_NORTHEAST_PAVILION_ID = 'INSTANCE-A-WUMEN-EAST-NORTH-PAVILION';
// Official eastern plan (2021, printed p152), crop x axes. These are pixel
// registrations, NOT surveyed metres. In that north-up plan east is to the
// right; this model uses -X east, so reverse the pixel direction. Retain the
// existing 11 m outer column boundary and 7.5 m body-height model fits.
export const WUMEN_NORTHEAST_NORTH_COLUMN_FIT = Object.freeze({
  revision: 'r58-north-six-source-registered',
  planAxes: Object.freeze([239, 277, 338, 427, 489, 526]),
  xs: Object.freeze([239, 277, 338, 427, 489, 526].map(p => 5.5 - (p - 239) * 11 / 287).reverse()),
  northZ: 5.5,
});
const near = (a, b) => Number.isFinite(a) && Math.abs(a - b) < 1e-7;

/**
 * Refine ONE existing, still-unmerged northeast pavilion body. No new roof,
 * enclosure, material, geometry allocation, runtime collider or walkable.
 * HallKit's shared cylinder geometry and library material remain owned by the
 * surviving columns; removing two meshes must NOT dispose those resources.
 * Local north-column proxies follow actual geometry (including its tapered
 * foot), clipped at local y=3. buildWumen's runtime whole-body AABB is retained.
 */
export function refineWumenPavilionNorthColumns(body, { instanceId } = {}) {
  if (instanceId !== WUMEN_NORTHEAST_PAVILION_ID) return false;
  if (body?.userData.structure?.northColumnFit === WUMEN_NORTHEAST_NORTH_COLUMN_FIT.revision) return false;
  const fit = WUMEN_NORTHEAST_NORTH_COLUMN_FIT;
  const columns = body?.children.filter(c => c.geometry?.type === 'CylinderGeometry' && near(c.position.z, fit.northZ)).sort((a, b) => a.position.x - b.position.x) ?? [];
  const oldXs = [-5.5, -11 / 6, 11 / 6, 5.5];
  const proxyRows = body?.userData.colliders?.filter(b => near((b.min.z + b.max.z) / 2, fit.northZ)) ?? [];
  const retained = body?.isGroup && near(body.userData.topY, 7.5)
    && near(body.position.x, -47.7) && near(body.position.y, 12.3) && near(body.position.z, -6)
    && body.quaternion.equals(new THREE.Quaternion()) && body.scale.equals(new THREE.Vector3(1, 1, 1))
    && columns.length === 4 && proxyRows.length === 4
    && columns.every((c, i) => near(c.position.x, oldXs[i]) && near(c.position.y, 3.3)
      && c.geometry === columns[0].geometry && c.material === columns[0].material
      && c.quaternion.equals(new THREE.Quaternion()) && c.scale.equals(new THREE.Vector3(1, 1, 1)))
    && oldXs.every(x => proxyRows.filter(b => near((b.min.x + b.max.x) / 2, x)
      && near(b.min.y, 0) && near(b.max.y, 3) && near(b.max.x - b.min.x, .5) && near(b.max.z - b.min.z, .5)).length === 1);
  if (!retained) throw new Error('Wumen north-column refinement requires the retained northeast pavilion body and four local proxies');

  // Keep both actual corner meshes. Replace only the old middle meshes, rather
  // than overlaying six new ones and leaving ghost columns behind.
  const replacements = fit.xs.slice(1, -1).map(x => {
    const mesh = columns[1].clone();
    mesh.position.x = x;
    return mesh;
  });
  const row = [columns[0], ...replacements, columns[3]];
  const geometry = columns[0].geometry;
  geometry.computeBoundingBox();
  const newProxies = row.map(column => {
    const bounds = geometry.boundingBox.clone().translate(column.position);
    bounds.min.y = Math.max(0, bounds.min.y);
    bounds.max.y = Math.min(3, bounds.max.y);
    return bounds;
  });
  let inserted = false;
  const colliders = body.userData.colliders.flatMap(b => {
    if (!proxyRows.includes(b)) return [b];
    if (inserted) return [];
    inserted = true;
    return newProxies;
  });
  body.remove(columns[1], columns[2]);
  body.add(...replacements);
  body.userData.colliders = colliders;
  body.userData.structure = {
    id: WUMEN_NORTHEAST_PAVILION_ID,
    parentId: 'FC-86C9330D65',
    kind: 'existing-pavilion-north-column-refinement',
    northColumnFit: fit.revision,
    northColumnXs: [...fit.xs],
    northColumnZ: fit.northZ,
    northColumnCount: 6,
    bodyHeightRetained: 7.5,
    dimensionBasis: 'source-pixel-registration-within-retained-model-boundary-not-survey',
    runtimeCollision: 'retained-whole-low-body-AABB-no-new-access',
  };
  return true;
}
