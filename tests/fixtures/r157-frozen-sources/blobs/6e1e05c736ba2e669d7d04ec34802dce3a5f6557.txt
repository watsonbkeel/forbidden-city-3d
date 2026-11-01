import * as THREE from 'three';
import { INNER_JINSHUI } from './InnerJinshui.js';

const SIDE_BRIDGES = Object.freeze([1, 2, 4, 5].map(n => `inner-jinshui:bridge-${n}`));
const SOURCES = Object.freeze([
  Object.freeze({
    url: 'https://img.dpm.org.cn/Uploads/Picture/2019/12/31/s5e0ad0346e8b3.jpg',
    sha256: '97c9ab5be71193f94226fc9fdaefc4c52d332c03ed5a10c0c14bf1ad0105fae7',
    use: 'Actually viewed: pointed bulb heads and collar silhouettes on the side-bridge/river balustrades. Photography date unknown.',
  }),
  Object.freeze({
    url: 'https://www.dpm.org.cn/Uploads/File/pdf/67/ae/92/67ae92f4b593b10e8175cef2bdfabfde.pdf',
    sha256: 'ff15559b2f203d722574ddd305aaa905d1062e260670a4b84b588cc57422e29f',
    page: 24,
    use: 'Actually viewed 2010/4 journal page: side bridges have torch heads; central imperial bridge has a different dragon/phoenix form. Fine carving is not reproduced.',
  }),
]);

function deckY(bridge, z) {
  for (let i = 1; i < bridge.deck.length; i++) {
    const a = bridge.deck[i - 1], b = bridge.deck[i];
    if (z <= b.z) return a.y + (b.y - a.y) * (z - a.z) / (b.z - a.z);
  }
  throw new Error('Inner Jinshui cap must sit on an existing sampled post');
}

/** Read-only consumer of the five-bridge profile; decorates only the existing
 * four side bridges' post tops. No new bridge, shaft, water, physics, furniture,
 * or central-bridge ornament is generated. Existing eleven-post rows are NOT
 * certified as historical counts. This small collar/bulb silhouette is a fit,
 * not the documented twenty-four incised grooves or a scanned carving.
 *
 * The resulting local group uses the profile origin exactly once. Its one
 * InstancedMesh owns one geometry; marble remains library-owned. Add it as a
 * separate PalaceBuilder object, NOT under the already-translated river group.
 * The owner patch uses the ordinary object ownership and disposal path.
 */
export function buildInnerJinshuiSideFinials(library, profile) {
  if (profile?.id !== 'inner-jinshui:first-entry' || profile.bridges?.length !== 5 ||
      !Number.isFinite(profile.origin?.x) || !Number.isFinite(profile.origin?.z) ||
      ![1, 2, 3, 4, 5].every(n => profile.bridges.filter(b => b.id === `inner-jinshui:bridge-${n}`).length === 1)) {
    throw new Error('Inner Jinshui finials require the existing five-bridge profile');
  }
  const placements = [];
  for (const id of SIDE_BRIDGES) {
    const b = profile.bridges.find(item => item.id === id);
    const start = b.minZ + INNER_JINSHUI.bridgeRailEndInset;
    const end = b.maxZ - INNER_JINSHUI.bridgeRailEndInset;
    for (const side of [-1, 1]) for (let i = 0; i <= 10; i++) {
      const z = start + (end - start) * i / 10;
      placements.push({ bridgeId: id, side, postIndex: i, x: b.x + side * b.railX, y: deckY(b, z) + 1.17, z });
    }
  }
  // All dimensions below are deliberately bounded silhouette fits. The radius
  // fits INSIDE the retained .26 m square shaft; the cap is .22 m high.
  const outline = [[.105, 0], [.125, .02], [.125, .04], [.095, .055],
    [.102, .074], [.121, .108], [.111, .15], [.077, .188], [0, .22]];
  const geometry = new THREE.LatheGeometry(outline.map(([r, y]) => new THREE.Vector2(r, y)), 8);
  geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  const heads = new THREE.InstancedMesh(geometry, library.material('marble'), placements.length);
  // PalaceBuilder owns and disposes geometries. Forward that one teardown to
  // the InstancedMesh so WebGL can also release its per-instance attributes.
  const releaseInstances = () => {
    geometry.removeEventListener('dispose', releaseInstances);
    heads.dispose();
  };
  geometry.addEventListener('dispose', releaseInstances);
  heads.name = 'inner-jinshui-side-torch-silhouettes';
  heads.castShadow = heads.receiveShadow = true;
  const matrix = new THREE.Matrix4();
  placements.forEach((p, i) => {
    matrix.makeTranslation(p.x - profile.origin.x, p.y, p.z - profile.origin.z);
    heads.setMatrixAt(i, matrix);
  });
  heads.instanceMatrix.needsUpdate = true;
  heads.computeBoundingBox(); heads.computeBoundingSphere();
  const group = new THREE.Group();
  group.name = 'inner-jinshui-side-finials';
  group.position.set(profile.origin.x, 0, profile.origin.z);
  group.add(heads);
  group.userData.innerJinshuiSideFinials = {
    status: 'SOURCE_SUPPORTED_SILHOUETTE_MODEL_FIT_NOT_SURVEYED',
    bridgeIds: [...SIDE_BRIDGES], placements, sources: SOURCES,
    addedBridgeCount: 0, addedColliderCount: 0, addedWalkableCount: 0,
    historicalPostCountVerified: false, carvedGroovesVerified: false,
    carving: 'OMITTED_UNVERIFIED_MICRODETAIL',
    limitations: [
      'Central imperial dragon/phoenix post heads are deliberately unchanged.',
      'Twenty-four incised spiral grooves are documented but omitted; no generic twisted ornament substitutes for them.',
      'The inherited eleven-post row layout, bridge dimensions, railing panels and bank caps remain outside this patch.',
      'No browser/WebGL or current-state visual acceptance is implied.',
    ],
  };
  return group;
}
