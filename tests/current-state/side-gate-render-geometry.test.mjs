import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as THREE from 'three';
import { CourtKit, FACE } from '../../src/scene/palace/kit.js';
import { buildSideGate } from '../../src/scene/palace/special/SideGate.js';
import { prunePavilionCoveredFaces } from '../../src/render/PavilionRenderGeometry.js';
import { mergeByMaterial } from '../../src/utils/MergeUtils.js';
import { TextureLibrary, TEXTURE_SPECS } from '../../src/utils/TextureLibrary.js';

const ctx = new Proxy({}, { get: () => () => ({ data: [] }), set: () => true });
globalThis.document ??= {
  createElement: () => ({ getContext: () => ctx, width: 0, height: 0 }),
  createElementNS: () => ({ addEventListener() {}, removeEventListener() {} }),
};
const axis = JSON.parse(readFileSync(new URL('../../data/zones/axis-courts.json', import.meta.url)));
const expected = {
  // Six own courtyard knees add 432 triangles / 6 meshes, no new material.
  xiehe: { source: 7530, removed: 988, boxes: 201, posts: 72, meshes: 337, buckets: 14 },
  xihe: { source: 7614, removed: 966, boxes: 203, posts: 71, meshes: 338, buckets: 14 },
  jingyun: { source: 4014, removed: 744, boxes: 160, posts: 0, meshes: 204, buckets: 13 },
  longzong: { source: 4014, removed: 476, boxes: 160, posts: 0, meshes: 204, buckets: 13 },
};
const evidence = [];
const nodes = root => { const result = []; root.traverse(node => result.push(node)); return result; };
const meshes = root => nodes(root).filter(node => node.isMesh);
const triangles = geometry => (geometry.index?.count ?? geometry.attributes.position.count) / 3;
const total = root => meshes(root).reduce((sum, mesh) => sum + triangles(mesh.geometry), 0);
const indices = geometry => Array.from(geometry.index?.array ?? Array.from({ length: geometry.attributes.position.count }, (_, i) => i));

function library() {
  const lib = new TextureLibrary();
  lib.manifest = JSON.parse(readFileSync(new URL('../../public/textures/hd/manifest.json', import.meta.url)));
  // Use actual material/spec/HD-UV factories. Image bytes alone are placeholders;
  // these tests make no GPU, normal-map, alpha-pixel or shadow-raster claim.
  for (const name of Object.keys(TEXTURE_SPECS)) {
    const entry = lib.manifest.textures[name], size = entry?.hd ?? { width: 1, height: 1 };
    lib.colors.set(name, lib.configure(new THREE.Texture(size), name, 'color'));
    if (entry?.normal) lib.normals.set(name, lib.configure(new THREE.Texture(size), name, 'normal'));
  }
  return lib;
}
function physicalState(kit) {
  return JSON.stringify({ colliders: kit.colliders, walkables: kit.walkables, rooms: kit.rooms, mapItems: kit.mapItems, regions: kit.regions });
}
function nodeState(root) {
  return nodes(root).map(node => ({
    object: node, parent: node.parent, name: node.name, material: node.material,
    // The constructor assigns structure just after mapRect; everything else
    // already exists at the pre-pruning snapshot point.
    userData: JSON.stringify(Object.fromEntries(Object.entries(node.userData).filter(([key]) => key !== 'structure'))),
    position: node.position.toArray(), quaternion: node.quaternion.toArray(), scale: node.scale.toArray(),
    castShadow: node.castShadow, receiveShadow: node.receiveShadow, visible: node.visible,
    layers: node.layers.mask, renderOrder: node.renderOrder, frustumCulled: node.frustumCulled,
  }));
}
function snapshot(kit, frame, boxes) {
  frame.updateMatrixWorld(true);
  const state = nodeState(frame), physics = physicalState(kit), all = meshes(frame), baseline = frame.clone(true);
  const original = all.map(mesh => ({ mesh, geometry: mesh.geometry, copy: mesh.geometry.clone() }));
  const baselineMeshes = meshes(baseline);
  original.forEach(({ copy }, i) => { baselineMeshes[i].geometry = copy; });
  const disposals = new Map(), materialDisposals = new Map();
  for (const { geometry, mesh } of original) {
    if (!disposals.has(geometry)) {
      disposals.set(geometry, 0);
      geometry.addEventListener('dispose', () => disposals.set(geometry, disposals.get(geometry) + 1));
    }
    if (mesh.material && !Array.isArray(mesh.material) && !materialDisposals.has(mesh.material)) {
      materialDisposals.set(mesh.material, 0);
      mesh.material.addEventListener('dispose', () => materialDisposals.set(mesh.material, materialDisposals.get(mesh.material) + 1));
    }
  }
  return { state, physics, original, baseline, disposals, materialDisposals, boxOrdinals: boxes.map(box => all.indexOf(box)) };
}
function fixture(profile, overrides = {}, setup = () => {}) {
  const lib = library(), kit = new CourtKit(lib), boxes = [];
  // Test-local observation only; production never monkey-patches CourtKit.
  const box = kit.box.bind(kit), mapRect = kit.mapRect.bind(kit);
  kit.box = (...args) => { const mesh = box(...args); boxes.push(mesh); return mesh; };
  let before;
  kit.mapRect = (...args) => { const result = mapRect(...args); before = snapshot(kit, args[0], boxes); return result; };
  const options = { ...axis.items.find(item => item.gateProfile === profile), ...overrides };
  setup(kit);
  buildSideGate(kit, options);
  const frame = kit.root.children.find(child => child.userData.structure?.profile === profile);
  before.baseline.userData.structure = structuredClone(frame.userData.structure);
  before.baseline.updateMatrixWorld(true);
  return { kit, lib, boxes, frame, before, options };
}
function exactInvariance(f) {
  const { kit, frame, before } = f;
  assert.deepEqual(nodeState(frame), before.state, 'same node identities, member counts, transforms, materials, flags and metadata');
  assert.equal(physicalState(kit), before.physics, 'collision/walk/room/map/region records are byte-identical');
  const live = new Set(meshes(frame).map(mesh => mesh.geometry));
  for (const [geometry, disposals] of before.disposals) assert.equal(disposals, live.has(geometry) ? 0 : 1, 'dispose replaced source once only after final internal reference');
  for (const disposals of before.materialDisposals.values()) assert.equal(disposals, 0, 'never dispose caller materials');
  for (const { mesh, copy } of before.original) {
    assert.deepEqual(Object.keys(mesh.geometry.attributes), Object.keys(copy.attributes));
    for (const [name, attribute] of Object.entries(copy.attributes)) {
      const actual = mesh.geometry.attributes[name];
      assert.deepEqual(actual.array, attribute.array, `${name}: complete source attribute array, including unused vertices`);
      assert.equal(actual.itemSize, attribute.itemSize); assert.equal(actual.normalized, attribute.normalized);
    }
    mesh.geometry.computeBoundingBox(); copy.computeBoundingBox();
    assert.ok(mesh.geometry.boundingBox.equals(copy.boundingBox), 'original primitive bounds are exact');
    const beforeIndices = indices(copy), afterIndices = indices(mesh.geometry);
    let cursor = 0;
    for (let i = 0; i < afterIndices.length; i += 3) {
      while (cursor < beforeIndices.length && !afterIndices.slice(i, i + 3).every((v, j) => v === beforeIndices[cursor + j])) cursor += 3;
      assert.ok(cursor < beforeIndices.length, 'retained triangle is an ordered original index triplet'); cursor += 3;
    }
  }
  // Independently run the unchanged helper against all and only actual kit.box
  // outputs. The source-integrated result must match every resulting index.
  const reference = before.baseline.clone(true), referenceMeshes = meshes(reference);
  referenceMeshes.forEach(mesh => { mesh.geometry = mesh.geometry.clone(); });
  const report = prunePavilionCoveredFaces(reference, before.boxOrdinals.map(i => referenceMeshes[i]));
  referenceMeshes.forEach((mesh, i) => assert.deepEqual(indices(mesh.geometry), indices(before.original[i].mesh.geometry), 'exact closed-box registration effect'));
  assert.equal(report.degenerateTriangles, 0);
  return report;
}

for (const [profile, counts] of Object.entries(expected)) {
  test(`${profile}: real production materials achieve only the exact bounded covered-face reduction`, () => {
    const f = fixture(profile);
    assert.equal(total(f.before.baseline), counts.source);
    assert.equal(total(f.before.baseline) - total(f.frame), counts.removed, 'source-integrated hidden-face savings');
    assert.equal(f.boxes.length, counts.boxes);
    assert.equal(f.boxes.filter(mesh => mesh.userData.role === 'gate-railing-post').length, counts.posts);
    assert.equal(meshes(f.frame).length, counts.meshes);
    assert.ok(f.boxes.every(mesh => mesh.material.map && mesh.material.normalMap && !mesh.material.transparent && mesh.material.opacity === 1 && mesh.material.alphaTest === 0));
    const report = exactInvariance(f);
    assert.equal(report.coveredTriangles, counts.removed);
    assert.equal(meshes(f.frame).filter(mesh => mesh.userData.role === 'gate-window-bar').length, 72);
    assert.equal(nodes(f.frame).filter(node => node.userData.role === 'gate-door-leaf').length, 6);
    assert.equal(nodes(f.frame).filter(node => node.userData.role === 'gate-railing-cap').length, counts.posts);
    assert.equal(f.frame.userData.structure.portalCount, 3);
    assert.equal(f.frame.userData.structure.ramps.length, 2);
    const removedByMaterial = {};
    for (const { mesh, copy } of f.before.original) {
      const removed = triangles(copy) - triangles(mesh.geometry);
      if (removed) removedByMaterial[mesh.material.name] = (removedByMaterial[mesh.material.name] ?? 0) + removed;
    }
    evidence.push({ profile, ...report, registeredBoxes: f.boxes.length, registeredBoxRoles: Object.fromEntries([...new Set(f.boxes.map(mesh => mesh.userData.role))].map(role => [role, f.boxes.filter(mesh => mesh.userData.role === role).length])), removedByMaterial, sourceMeshes: meshes(f.frame).length, invariance: true });
  });
}

after(() => {
  if (!process.env.SIDE_GATE_EVIDENCE_DIR) return;
  mkdirSync(process.env.SIDE_GATE_EVIDENCE_DIR, { recursive: true });
  writeFileSync(`${process.env.SIDE_GATE_EVIDENCE_DIR}/integrated-proof.json`, `${JSON.stringify({ scope: 'Source-integrated real-material geometry and resource proof; no browser/GPU acceptance.', results: evidence }, null, 2)}\n`);
});

for (const profile of Object.keys(expected)) {
  test(`${profile}: all cardinal rotations, open/closed leaves and plaque modes keep exact premerge state`, () => {
    for (const rot of Object.values(FACE)) for (const open of [true, false]) for (const plaque of [true, false]) {
      const f = fixture(profile, { x: 37.25, z: -62.75, rot, open, plaque });
      const report = exactInvariance(f);
      assert.ok(report.coveredTriangles > 0);
      assert.equal(total(f.before.baseline), expected[profile].source - (plaque ? 0 : 14));
      assert.equal(f.kit.plaques.length, plaque ? 1 : 0);
      assert.equal(f.frame.userData.structure.openState, open ? 'playable-open' : 'closed');
      const leaves = nodes(f.frame).filter(node => node.userData.role === 'gate-door-leaf');
      assert.equal(leaves.length, 6);
      assert.ok(leaves.every(leaf => leaf.userData.open === open));
    }
  });
}

for (const condition of ['transparent', 'alpha-tested', 'partial-opacity', 'wireframe', 'no-depth-write', 'displacement', 'back-side', 'non-casting', 'hidden-parent', 'layer-mismatch', 'incomplete-box', 'partial-draw-range', 'multi-material']) {
  test(`integrated gate rejects ${condition} before replacing or disposing any source`, () => {
    const kit = new CourtKit(library()), mapRect = kit.mapRect.bind(kit);
    let before;
    kit.mapRect = (...args) => {
      mapRect(...args);
      const frame = args[0], all = meshes(frame), box = all.find(mesh => mesh.userData.role === 'gate-platform');
      if (condition === 'transparent') box.material.transparent = true;
      if (condition === 'alpha-tested') box.material.alphaTest = .1;
      if (condition === 'partial-opacity') box.material.opacity = .9;
      if (condition === 'wireframe') box.material.wireframe = true;
      if (condition === 'no-depth-write') box.material.depthWrite = false;
      if (condition === 'displacement') box.material.displacementMap = new THREE.Texture();
      if (condition === 'back-side') box.material.side = THREE.BackSide;
      if (condition === 'non-casting') box.castShadow = false;
      if (condition === 'hidden-parent') frame.visible = false;
      if (condition === 'layer-mismatch') all.at(-1).layers.set(1);
      if (condition === 'incomplete-box') box.geometry.setIndex(indices(box.geometry).slice(0, -3));
      if (condition === 'partial-draw-range') box.geometry.setDrawRange(0, 3);
      if (condition === 'multi-material') box.material = [box.material];
      before = snapshot(kit, frame, []);
    };
    assert.throws(() => buildSideGate(kit, { gateProfile: 'xiehe', x: 0, z: 0, plaque: false }), /unsupported|opaque|solid|box/i);
    for (const { mesh, geometry, copy } of before.original) {
      assert.equal(mesh.geometry, geometry);
      assert.deepEqual(indices(mesh.geometry), indices(copy));
    }
    for (const count of before.disposals.values()) assert.equal(count, 0);
  });
}

test('the gate never touches sibling assemblies or patches shared CourtKit methods', () => {
  const method = CourtKit.prototype.box;
  let unrelated, geometry, material, disposed = 0;
  const f = fixture('xiehe', {}, kit => {
    unrelated = new THREE.Mesh(new THREE.BoxGeometry(200, 100, 200), new THREE.MeshStandardMaterial());
    unrelated.castShadow = true; geometry = unrelated.geometry; material = unrelated.material;
    geometry.addEventListener('dispose', () => disposed++);
    kit.root.add(unrelated);
  });
  assert.equal(CourtKit.prototype.box, method);
  assert.equal(unrelated.geometry, geometry); assert.equal(unrelated.material, material);
  assert.equal(triangles(geometry), 12); assert.equal(disposed, 0);
  assert.equal(total(f.frame), expected.xiehe.source - expected.xiehe.removed);
  exactInvariance(f);
});

test('fresh gates own disjoint geometry; merging and unloading never dispose shared library materials', () => {
  const a = fixture('xiehe'), b = fixture('xiehe');
  const ownedA = new Set(meshes(a.frame).map(mesh => mesh.geometry));
  assert.ok(meshes(b.frame).every(mesh => !ownedA.has(mesh.geometry)));
  exactInvariance(a); exactInvariance(b);
  const resources = new Map([...ownedA].map(geometry => [geometry, 0]));
  for (const geometry of resources.keys()) geometry.addEventListener('dispose', () => resources.set(geometry, resources.get(geometry) + 1));
  let sharedMaterialDisposals = 0;
  for (const material of a.lib.materials.values()) material.addEventListener('dispose', () => sharedMaterialDisposals++);
  const merged = a.kit.finish();
  for (const count of resources.values()) assert.equal(count, 1, 'source merger frees each unique live geometry once');
  for (const [geometry, count] of a.before.disposals) assert.equal(count, 1, 'pre-prune source is freed once overall, never twice');
  const mergedDisposals = new Map(meshes(merged).map(mesh => [mesh.geometry, 0]));
  for (const geometry of mergedDisposals.keys()) geometry.addEventListener('dispose', () => mergedDisposals.set(geometry, mergedDisposals.get(geometry) + 1));
  a.kit.dispose(merged);
  for (const count of mergedDisposals.values()) assert.equal(count, 1);
  assert.equal(sharedMaterialDisposals, 0);
  assert.equal(total(b.frame), expected.xiehe.source - expected.xiehe.removed, 'other live assembly is still intact');
  exactInvariance(b);
});

function mergedPair(f) {
  // Make the original and candidate use the same actual plaque atlas/material,
  // copying the atlas UV remap onto the original full source geometry.
  const after = f.kit.finish();
  const beforeMeshes = meshes(f.before.baseline), afterMeshes = meshes(f.frame);
  afterMeshes.forEach((mesh, i) => {
    if (beforeMeshes[i].material === null) {
      beforeMeshes[i].material = mesh.material;
      beforeMeshes[i].geometry.setAttribute('uv', mesh.geometry.attributes.uv.clone());
    }
  });
  const baselineRoot = new THREE.Group(); baselineRoot.name = f.kit.root.name; baselineRoot.add(f.before.baseline);
  const before = mergeByMaterial(baselineRoot);
  before.traverse(node => { if (node.isMesh) node.receiveShadow = true; });
  before.updateMatrixWorld(true); after.updateMatrixWorld(true);
  return { before, after };
}
function materialStreams(root) {
  const streams = new Map();
  for (const mesh of meshes(root)) {
    const geometry = mesh.geometry, index = indices(geometry), values = [];
    for (let i = 0; i < index.length; i += 3) {
      const triangle = [];
      for (const name of ['position', 'normal', 'uv']) {
        const attribute = geometry.attributes[name];
        const bits = new Uint32Array(attribute.array.buffer, attribute.array.byteOffset, attribute.array.length);
        for (let j = 0; j < 3; j++) for (let k = 0; k < attribute.itemSize; k++) triangle.push(bits[index[i + j] * attribute.itemSize + k]);
      }
      values.push(triangle.join(','));
    }
    streams.set(mesh.material, { values, castShadow: mesh.castShadow, receiveShadow: mesh.receiveShadow });
  }
  return streams;
}
function exteriorRays(before, structure) {
  const bounds = new THREE.Box3().setFromObject(before), center = bounds.getCenter(new THREE.Vector3()), size = bounds.getSize(new THREE.Vector3()), rays = [];
  for (let axis = 0; axis < 3; axis++) for (const side of [-1, 1]) for (let i = 0; i < 31; i++) for (let j = 0; j < 19; j++) {
    const u = (axis + 1) % 3, v = (axis + 2) % 3, origin = center.toArray(), direction = [0, 0, 0];
    origin[axis] = (side < 0 ? bounds.min.getComponent(axis) : bounds.max.getComponent(axis)) + side * 10;
    origin[u] = bounds.min.getComponent(u) + size.getComponent(u) * (i + .371) / 31;
    origin[v] = bounds.min.getComponent(v) + size.getComponent(v) * (j + .613) / 19;
    direction[axis] = -side; rays.push({ kind: 'exterior-grid', origin, direction });
  }
  let seed = 0x445566;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 700; i++) {
    const target = new THREE.Vector3(bounds.min.x + size.x * random(), bounds.min.y + size.y * random(), bounds.min.z + size.z * random());
    const direction = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1).normalize();
    const origin = target.clone().addScaledVector(direction, size.length() + 10);
    rays.push({ kind: 'exterior-oblique', origin: origin.toArray(), direction: direction.negate().toArray() });
  }
  for (const portal of structure.portals) for (const point of [portal.front, portal.rear, portal.door]) for (let i = 0; i < 24; i++) {
    const angle = i * Math.PI / 12;
    rays.push({ kind: 'portal-eye', origin: [point.x, point.y + 1.7, point.z], direction: [Math.cos(angle), 0, Math.sin(angle)] });
  }
  return rays;
}
function detailRays(f) {
  const rays = [], roles = new Set(['gate-window-bar', 'gate-painted-beam', 'gate-railing-cap', 'gate-ramp-solid', 'gate-threshold', 'gate-door-leaf']);
  // Tight offsets target lattice gaps, beam/column contacts, post/cap seams,
  // wedge junctions and leaf/threshold corners; not just broad silhouette grids.
  for (const mesh of meshes(f.frame).filter(mesh => roles.has(mesh.userData.role))) {
    mesh.geometry.computeBoundingBox();
    const bounds = mesh.geometry.boundingBox, middle = bounds.getCenter(new THREE.Vector3());
    for (const axis of [0, 1, 2]) for (const side of [-1, 1]) for (const offset of [-.003, .003]) {
      const target = middle.clone();
      target.setComponent((axis + 1) % 3, bounds.max.getComponent((axis + 1) % 3) + offset);
      target.setComponent((axis + 2) % 3, bounds.min.getComponent((axis + 2) % 3) - offset);
      // Start outside the complete assembly. A probe started inside a solid
      // can see its buried back faces and does not model an exterior view.
      const origin = target.clone(); origin.setComponent(axis, (side < 0 ? bounds.min.getComponent(axis) : bounds.max.getComponent(axis)) + side * 100);
      target.applyMatrix4(mesh.matrixWorld); origin.applyMatrix4(mesh.matrixWorld);
      rays.push({ kind: `detail:${mesh.userData.role}`, origin: origin.toArray(), direction: target.sub(origin).normalize().toArray() });
    }
  }
  return rays;
}
function compareRays(before, after, rays) {
  const raycaster = new THREE.Raycaster(), counts = {}; let hits = 0, maxDistanceError = 0;
  for (const { kind, origin, direction } of rays) {
    counts[kind] = (counts[kind] ?? 0) + 1;
    raycaster.set(new THREE.Vector3(...origin), new THREE.Vector3(...direction));
    const first = raycaster.intersectObject(before, true)[0], second = raycaster.intersectObject(after, true)[0];
    assert.equal(!!second, !!first, `${kind}: hit presence at ${origin}`);
    if (first) {
      hits++;
      const error = Math.abs(first.distance - second.distance); maxDistanceError = Math.max(maxDistanceError, error);
      assert.ok(error < 1e-5, `${kind}: first surface distance at ${origin}: ${error}`);
      assert.equal(second.object.material, first.object.material, `${kind}: first material at ${origin}`);
    }
  }
  return { rays: rays.length, hits, counts, maxDistanceError, mismatches: 0 };
}
for (const [profile, counts] of Object.entries(expected)) {
  test(`${profile}: final material merging retains exact surviving triangle streams and first surfaces`, () => {
    const f = fixture(profile), details = detailRays(f), { before, after } = mergedPair(f);
    const original = materialStreams(before), candidate = materialStreams(after);
    assert.equal(original.size, counts.buckets); assert.equal(candidate.size, counts.buckets);
    assert.equal(meshes(before).length, meshes(after).length);
    for (const [material, stream] of candidate) {
      const source = original.get(material);
      assert.ok(source, 'original material identity survives merging');
      assert.equal(stream.castShadow, source.castShadow); assert.equal(stream.receiveShadow, source.receiveShadow);
      let cursor = 0;
      for (const triangle of stream.values) {
        while (cursor < source.values.length && source.values[cursor] !== triangle) cursor++;
        assert.ok(cursor < source.values.length, 'merged position/normal/UV triplets remain bit-exact ordered subsequences'); cursor++;
      }
    }
    assert.deepEqual(after.userData.architecture, [f.frame.userData.structure]);
    const rayAudit = compareRays(before, after, exteriorRays(before, f.frame.userData.structure));
    assert.equal(rayAudit.rays, 4450);
    const detailRayAudit = compareRays(before, after, details);
    assert.ok(detailRayAudit.rays > 900);
    Object.assign(evidence.find(result => result.profile === profile), { mergedMeshes: meshes(after).length, mergedTriangles: total(after), bitExactMergedMaterialStreams: true, rayAudit, detailRayAudit });
  });
}
