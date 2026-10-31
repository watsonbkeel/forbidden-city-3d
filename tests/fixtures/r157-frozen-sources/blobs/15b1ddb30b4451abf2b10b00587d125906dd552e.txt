import * as THREE from 'three';
import { applyBoxUV } from '../../../utils/GeometryUV.js';
import { buildStuddedDoor } from '../../HallKit.js';

const SOURCE = 'https://www.dpm.org.cn/explore/building/236451.html';
const DIMENSION_STATUS = 'MODEL_FIT_NOT_SURVEYED';
const tag = (object, role, properties = {}) => {
  object.name = role;
  Object.assign(object.userData, { role, ...properties });
  return object;
};

/** Official topology, not a metric survey. The inherited 23.7 m envelope is
 * retained so this bounded correction cannot silently move the court wall.
 * Main/secondary: hipped; interstitial: gabled; edge: outer hip/inner gable.
 */
export function huangjiGateGeometry(item) {
  const rot = item.rot === undefined || item.rot === 'south' ? 0 : item.rot;
  if (item.name !== '皇极门' || item.gateProfile !== 'huangji' || item.gateKind !== 'three-wallgate' ||
      (item.style !== undefined && item.style !== 'wall') || rot !== 0 || item.x !== -293.2 || item.z !== 154.1 ||
      (item.w !== undefined && item.w !== 23.7) || item.open === false) {
    throw new Error('Huangji profile requires its retained anchor, three-wallgate identity, south orientation, fitted width and playable-open state');
  }
  const width = 23.7, depth = 2.2;
  const portals = [
    { id: 'east', x: -7, width: 3, springY: 3.05, rise: 1.45 },
    { id: 'middle', x: 0, width: 3.6, springY: 3.3, rise: 1.65 },
    { id: 'west', x: 7, width: 3, springY: 3.05, rise: 1.45 },
  ].map(portal => ({ ...portal, left: portal.x - portal.width / 2, right: portal.x + portal.width / 2 }));
  const roofs = [
    { id: 'east-edge', tower: 'edge', x: -10.625, width: 2.45, wallWidth: 2.45, wallTop: 5, eaveY: 5.2, rise: .6, form: 'outer-hip-inner-gable', hipLeft: true, hipRight: false },
    { id: 'east-secondary', tower: 'secondary', x: -7, width: 5.2, wallWidth: 4.8, wallTop: 6.05, eaveY: 6.35, rise: 1.05, form: 'wudian', hipLeft: true, hipRight: true, portal: 'east' },
    { id: 'east-interstitial', tower: 'interstitial', x: -3.7, width: 2.05, wallWidth: 1.8, wallTop: 5.35, eaveY: 5.65, rise: .6, form: 'xuanshan', hipLeft: false, hipRight: false },
    { id: 'main', tower: 'main', x: 0, width: 6.05, wallWidth: 5.6, wallTop: 6.65, eaveY: 6.9, rise: 1.15, form: 'wudian', hipLeft: true, hipRight: true, portal: 'middle' },
    { id: 'west-interstitial', tower: 'interstitial', x: 3.7, width: 2.05, wallWidth: 1.8, wallTop: 5.35, eaveY: 5.65, rise: .6, form: 'xuanshan', hipLeft: false, hipRight: false },
    { id: 'west-secondary', tower: 'secondary', x: 7, width: 5.2, wallWidth: 4.8, wallTop: 6.05, eaveY: 6.35, rise: 1.05, form: 'wudian', hipLeft: true, hipRight: true, portal: 'west' },
    { id: 'west-edge', tower: 'edge', x: 10.625, width: 2.45, wallWidth: 2.45, wallTop: 5, eaveY: 5.2, rise: .6, form: 'outer-hip-inner-gable', hipLeft: false, hipRight: true },
  ].map(roof => ({ ...roof, depth: roof.tower === 'main' ? 3.2 : roof.tower === 'secondary' ? 3 : 2.65 }));
  return {
    profile: 'huangji', gateKind: 'three-wallgate', name: item.name, x: item.x, z: item.z, rot,
    width, depth, front: 1.8, rear: 2.4, platformY: 0, portals, roofs,
    wallGapWidth: width,
    wallReplacement: { at: item.x, width, min: item.x - width / 2, max: item.x + width / 2 },
    wallOpenings: portals.map(portal => ({ id: portal.id, at: item.x + portal.x, width: portal.width })),
    source: SOURCE, dimensionStatus: DIMENSION_STATUS,
    detailStatus: 'SIMPLIFIED_GLAZED_PARTITIONS_AND_MARBLE_MOULDINGS_NOT_TRACED_TILE_RELIEFS',
    surfaceStatus: 'SOURCE_SUPPORTED_MATERIAL_ZONES_FITTED_COLOURS_AND_SECTIONS',
    marbleBase: { height: .75, section: [[0, 1.28], [.1, 1.28], [.16, 1.24], [.22, 1.24], [.29, 1.16], [.35, 1.1], [.48, 1.1], [.55, 1.15], [.62, 1.23], [.68, 1.25], [.75, 1.25]] },
    evidence: 'Museum description and south oblique photograph establish form; metric dimensions, arch curvature and rear details are fitted.',
  };
}

/** Returns the WHOLE masonry replacement width, never the centre hole width.
 * The profile supplies the solid piers between all three openings. One named
 * CourtKit.wall gap therefore removes the old wall from the entire assembly.
 */
export function buildHuangjiGate(kit, item) {
  const g = huangjiGateGeometry(item), frame = kit.frame(g.x, g.z, g.rot);
  frame.name = '皇极门'; frame.userData.gateGeometry = g;
  const yellow = new THREE.MeshStandardMaterial({ name: 'huangji_glaze_ochre_fit', color: 0xc59a32, roughness: .36, metalness: .02 });
  const green = new THREE.MeshStandardMaterial({ name: 'huangji_glaze_green_fit', color: 0x35695a, roughness: .38, metalness: .02 });
  const bluegreen = new THREE.MeshStandardMaterial({ name: 'huangji_glaze_bluegreen_fit', color: 0x315e65, roughness: .34, metalness: .02 });
  const marble = new THREE.MeshStandardMaterial({ name: 'huangji_white_marble_fit', color: 0xe6e2d8, roughness: .74, metalness: 0 });
  // The official photograph shows red backing between the portals. Keep that
  // evidence, but do not turn generic rough city-wall plaster into ceramic.
  const redBacking = new THREE.MeshStandardMaterial({ name: 'huangji_red_backing_fit', color: 0xb6533d, roughness: .83, metalness: 0 });
  kit.owned.push(yellow, green, bluegreen, marble, redBacking);
  const box = (role, material, width, height, depth, x, y, z, parent = frame) => {
    const mesh = typeof material === 'string'
      ? kit.box(parent, material, width, height, depth, x, y, z)
      : kit.mesh(parent, applyBoxUV(new THREE.BoxGeometry(width, height, depth)), material, x, y, z);
    return tag(mesh, role);
  };
  const pier = (left, right, top) => {
    const width = right - left, x = (left + right) / 2;
    // A continuous pale-marble section supplies the actual projecting foot,
    // recessed waist and spreading upper mouldings. All projection is along
    // Z: the inherited X portal widths and wall contacts remain untouched.
    const section = g.marbleBase.section, shape = new THREE.Shape();
    shape.moveTo(-section[0][1], section[0][0]);
    for (const [y, halfDepth] of section.slice(1)) shape.lineTo(-halfDepth, y);
    for (const [y, halfDepth] of [...section].reverse()) shape.lineTo(halfDepth, y);
    shape.closePath();
    const baseGeometry = new THREE.ExtrudeGeometry(shape, { depth: width, steps: 1, bevelEnabled: false, curveSegments: 1 });
    baseGeometry.rotateY(Math.PI / 2);
    tag(kit.mesh(frame, applyBoxUV(baseGeometry), marble, left, 0, 0), 'huangji-marble-base', { sectionStatus: 'FITTED_SUMERU_OUTLINE_NOT_CARVING_REPLICA' });
    box('huangji-masonry-pier', redBacking, width, top - .75, g.depth, x, (top + .75) / 2, 0);
    kit.col(frame, left, 0, -g.depth / 2, right, top, g.depth / 2);
  };

  for (const roof of g.roofs) {
    const left = roof.x - roof.wallWidth / 2, right = roof.x + roof.wallWidth / 2;
    const portal = g.portals.find(p => p.id === roof.portal);
    if (!portal) pier(left, right, roof.wallTop);
    else {
      pier(left, portal.left, roof.wallTop); pier(portal.right, right, roof.wallTop);
      const arc = [];
      for (let i = 0; i <= 16; i++) {
        const angle = Math.PI - Math.PI * i / 16;
        arc.push([portal.x + Math.cos(angle) * portal.width / 2, portal.springY + Math.sin(angle) * portal.rise]);
      }
      const shape = new THREE.Shape();
      shape.moveTo(portal.left, roof.wallTop); shape.lineTo(portal.right, roof.wallTop);
      for (let i = arc.length - 1; i >= 0; i--) shape.lineTo(...arc[i]);
      shape.closePath();
      const geometry = applyBoxUV(new THREE.ExtrudeGeometry(shape, { depth: g.depth, steps: 1, bevelEnabled: false, curveSegments: 1 }));
      tag(kit.mesh(frame, geometry, redBacking, 0, 0, -g.depth / 2), 'huangji-arched-wall', { portalId: portal.id });
      // Inscribed upper-body collision slices follow the real faceted vault.
      // They never put a flat lintel collider across a visible open arch.
      for (let i = 1; i < arc.length; i++) kit.col(frame, arc[i - 1][0], Math.max(arc[i - 1][1], arc[i][1]), -g.depth / 2, arc[i][0], roof.wallTop, g.depth / 2);
      for (const side of [-1, 1]) {
        const leafWidth = portal.width / 2 - .08;
        const leaf = tag(buildStuddedDoor(kit.lib, { width: leafWidth, height: portal.springY + .05 }), 'huangji-open-door', { portalId: portal.id, state: 'playable-open-fitted' });
        leaf.rotation.y = Math.PI / 2;
        leaf.position.set(portal.x + side * (portal.width / 2 + .15), 0, .35 + leafWidth / 2);
        frame.add(leaf);
        kit.col(frame, leaf.position.x - .125, 0, .35, leaf.position.x + .125, portal.springY + .05, .35 + leafWidth);
      }
    }

    const roofGroup = tag(new THREE.Group(), 'huangji-roof', { tower: roof.tower, roofForm: roof.form, roofId: roof.id, dimensionStatus: DIMENSION_STATUS });
    roofGroup.position.x = roof.x; frame.add(roofGroup);
    const { shell, ends, ridgeLeft, ridgeRight } = roofGeometry(roof);
    tag(kit.mesh(roofGroup, shell, kit.lib.material('roof_tile'), 0, 0, 0), 'huangji-roof-surface');
    tag(kit.mesh(roofGroup, ends, yellow, 0, 0, 0), 'huangji-roof-edges');
    box('huangji-ridge', yellow, ridgeRight - ridgeLeft, .16, .17, (ridgeLeft + ridgeRight) / 2, roof.eaveY + roof.rise + .06, 0, roofGroup);
    // Broad ceramic partitions match the source's substantial glazed header,
    // not a thin stripe above an otherwise generic plaster wall. Ochre moulded
    // boundaries separate green and blue-green fields; no relief motifs or
    // bracket counts are invented. The top cornice meets the roof underside.
    const corniceTop = roof.eaveY - .12, corniceBottom = roof.wallTop - .08;
    box('huangji-glazed-cornice', yellow, roof.wallWidth + .18, corniceTop - corniceBottom, g.depth + .34, roof.x, (corniceTop + corniceBottom) / 2, 0);
    for (const [upper, lower, material, projection] of [
      [.08, .43, green, .22], [.43, .5, yellow, .32], [.5, .82, bluegreen, .2],
      [.82, .89, yellow, .32], [.89, 1, green, .22], [1, 1.07, yellow, .34],
    ]) {
      box('huangji-glazed-partition', material, roof.wallWidth + .12, lower - upper, g.depth + projection, roof.x, roof.wallTop - (upper + lower) / 2, 0);
    }
    for (const side of [-1, 1]) for (const face of [-1, 1]) {
      const points = [[0, -1.1], [.09, -1.06], [.13, -.95], [.08, -.86], [.075, 0], [0, 0]].map(([x, y]) => new THREE.Vector2(x, y));
      const geometry = new THREE.LatheGeometry(points, 6);
      tag(kit.mesh(frame, geometry, yellow, roof.x + side * (roof.wallWidth / 2 - .16), roof.wallTop - .08, face * (g.depth / 2 + .19)), 'huangji-hanging-post', { detailStatus: 'SIMPLIFIED_NOT_CARVING_REPLICA' });
    }
  }
  kit.mapRect(frame, 'gate', g.name, g.width, 4.2, { gateProfile: g.profile, portalCount: 3, roofCount: 7, dimensionStatus: DIMENSION_STATUS });
  let triangles = 0, meshes = 0;
  frame.traverse(object => {
    if (!object.isMesh) return;
    meshes++; triangles += (object.geometry.index?.count ?? object.geometry.getAttribute('position').count) / 3;
  });
  frame.userData.structure = {
    id: 'ningshou/huangji-gate', ...g, portalCount: 3, roofCount: 7, storeys: 0,
    openState: 'playable-open', visitorPolicy: 'Playable geometry is not museum visitor access permission.',
    budget: { triangles, meshes, newTextureLoads: 0 },
  };
  return g.wallGapWidth;
}

/** Small closed, curved roof shells. A hip is present only on the side
 * supported by the official topology; xuan-shan ends overhang their wall.
 * Curvature, overhang and ridge size are explicitly model-fit choices.
 */
function roofGeometry(roof) {
  const halfWidth = roof.width / 2, halfDepth = roof.depth / 2;
  const inset = Math.min(halfDepth * .76, roof.width * .32);
  const ridgeLeft = -halfWidth + (roof.hipLeft ? inset : 0);
  const ridgeRight = halfWidth - (roof.hipRight ? inset : 0);
  const base = roof.eaveY - .12, surface = [], edges = [];
  const point = (side, face, t) => [
    side < 0 ? ridgeLeft + (-halfWidth - ridgeLeft) * t : ridgeRight + (halfWidth - ridgeRight) * t,
    roof.eaveY + roof.rise * (1 - t) ** 2,
    face * halfDepth * t,
  ];
  const addFace = (target, points, normal) => {
    for (let i = 1; i < points.length - 1; i++) {
      let vertices = [points[0], points[i], points[i + 1]];
      const a = new THREE.Vector3(...vertices[0]), b = new THREE.Vector3(...vertices[1]), c = new THREE.Vector3(...vertices[2]);
      const n = b.sub(a).cross(c.sub(a));
      if (n.lengthSq() < 1e-12) continue;
      if (n.dot(new THREE.Vector3(...normal)) < 0) vertices = [vertices[0], vertices[2], vertices[1]];
      target.push(...vertices.flat());
    }
  };
  for (let i = 0; i < 6; i++) {
    const a = i / 6, b = (i + 1) / 6;
    for (const face of [-1, 1]) addFace(surface, [point(-1, face, a), point(1, face, a), point(1, face, b), point(-1, face, b)], [0, 1, 0]);
    for (const side of [-1, 1]) {
      if (side < 0 ? roof.hipLeft : roof.hipRight) {
        addFace(surface, [point(side, -1, a), point(side, 1, a), point(side, 1, b), point(side, -1, b)], [side, 1, 0]);
      } else {
        for (const face of [-1, 1]) {
          const A = point(side, face, a), B = point(side, face, b);
          addFace(edges, [A, B, [B[0], base, B[2]], [A[0], base, A[2]]], [side, 0, 0]);
        }
      }
    }
  }
  const perimeter = [point(-1, -1, 1), point(1, -1, 1), point(1, 1, 1), point(-1, 1, 1)];
  for (let i = 0; i < 4; i++) {
    const A = perimeter[i], B = perimeter[(i + 1) % 4];
    addFace(edges, [A, B, [B[0], base, B[2]], [A[0], base, A[2]]], [(A[0] + B[0]) / 2, 0, (A[2] + B[2]) / 2]);
  }
  addFace(edges, perimeter.map(([x, , z]) => [x, base, z]), [0, -1, 0]);
  const meshGeometry = positions => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return applyBoxUV(geometry);
  };
  return { shell: meshGeometry(surface), ends: meshGeometry(edges), ridgeLeft, ridgeRight };
}
