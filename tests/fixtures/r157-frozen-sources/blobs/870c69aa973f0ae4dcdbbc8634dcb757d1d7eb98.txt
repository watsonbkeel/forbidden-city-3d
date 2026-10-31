import * as THREE from 'three';
import { applyBoxUV } from '../../../utils/GeometryUV.js';

const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

/** The plan envelope is inherited registration, not a modern measured survey.
 * Five-pavilion topology is supported by the museum's 2013 conservation paper;
 * all member sizes/levels below are deliberately labelled photo-fit. See the
 * source ledger in docs/current-state/R32-YANXI-RUIN.md. */
export const YANXI_RUIN_PROFILE = freeze({
  id: 'east-six/yanxi-ruin', profileId: 'yanxi-lingzhao-current-r32', profile: 'lingzhao-current',
  anchor: { x: -148.2, z: 324.9, rot: 0 },
  core: { w: 16.3, d: 11.7, status: 'inherited-registration-not-column-grid' },
  dimensionStatus: 'registered-envelope-photo-fit-not-survey',
  body: { w: 12.6, d: 8, frontZ: -4, windowX: 3.7, floorY: .65, wallTop: 4.65, thickness: .42 },
  pool: { w: 22.7, d: 18.1, bottomY: -2.1, bankTopY: .18, bankThickness: .34,
    guardW: 23.1, guardD: 18.5, guardTopY: 1.18, waterState: 'dry-unfilled-preview',
    status: 'photo-fit-boundary-and-depth-not-survey' },
  cornerPavilions: [
    { id: 'southeast', x: -6.3, z: -4, sides: 6, radius: 1.85, upperBaseY: 4.65, upperTopY: 7.9, remnant: 'open-frame-with-partial-crown' },
    { id: 'southwest', x: 6.3, z: -4, sides: 6, radius: 1.85, upperBaseY: 4.65, upperTopY: 7.9, remnant: 'open-frame-with-partial-crown' },
    { id: 'northeast', x: -6.3, z: 4, sides: 8, radius: 1.85, upperBaseY: 4.65, upperTopY: 5.85, remnant: 'low-open-frame-only' },
    { id: 'northwest', x: 6.3, z: 4, sides: 8, radius: 1.85, upperBaseY: 4.65, upperTopY: 5.85, remnant: 'low-open-frame-only' },
  ],
  centralPavilion: { sides: 8, tiers: 2, lowerRadius: 1.65, upperRadius: 1.24,
    baseY: 4.65, lowerTopY: 7.35, upperBaseY: 7.72, upperTopY: 9.25, capTopY: 10.05 },
  sources: {
    S1: 'https://www.dpm.org.cn/explore/building/236535.html',
    S2: 'https://www.dpm.org.cn/subject_600/buildingdetails/253798.html',
    S3: 'https://img.dpm.org.cn/Uploads/File/2018/06/05/u5b1657f3946eb.pdf',
    S4: 'https://www.dpm.org.cn/ydyl/personnel_training_w/detail/260045.html',
  },
  evidence: { actualMetalAndStone: 'official-text-and-photos', southernSixNorthernEightCentralEight: 'S3 printed-p125',
    exteriorIronColumnCount: 'S3 printed-p126: 18; positions photo-fit', innerIronColumnCount: 'S1: 4; positions photo-fit',
    unfinishedUpperEnvelope: 'official-photos', intactCompleteCrystalPalace: 'not-modelled',
    currentConditionAccepted: false, note: 'Recognizable evidence-bounded present-state prototype, not an as-built or conservation-condition survey.' },
});

/** Environment.setupGround must cut this rectangle from its y=0 plane.
 * The same values build the dry basin, so a second guessed hole is unnecessary. */
export const YANXI_RUIN_GROUND_CUTOUT = freeze({
  id: YANXI_RUIN_PROFILE.id, x: YANXI_RUIN_PROFILE.anchor.x, z: YANXI_RUIN_PROFILE.anchor.z,
  w: YANXI_RUIN_PROFILE.pool.w, d: YANXI_RUIN_PROFILE.pool.d,
});
export const YANXI_RUIN_NAVIGATION = freeze({
  mode: 'exterior-view', accessStatus: 'ground-only-preview', viewpointId: 'yanxi-south-ground',
  position: { x: -148.2, z: 312.45, feetY: 0 }, lookAt: { x: -148.2, y: 4.7, z: 324.9 },
  supportId: 'world-ground', interiorRouteAccepted: false, terraceRouteAccepted: false,
  validationStatus: 'LOCAL_CPU_ONLY_REQUIRES_INTEGRATED_WORLD_CHECK',
  visitorPolicy: 'Model viewing point only; current site access is not asserted.',
});

export function yanxiRuinGeometry(item) {
  const p = YANXI_RUIN_PROFILE;
  if (!item || item.structure !== 'yanxi-ruin' || item.ruinProfile !== p.profile) throw new Error('Yanxi requires explicit yanxi-ruin / lingzhao-current profile');
  if (item.x !== p.anchor.x || item.z !== p.anchor.z || (item.rot !== undefined && item.rot !== 0 && item.rot !== 'south')) throw new Error('Yanxi anchor/rotation drift is not supported');
  for (const key of ['w', 'd']) if (item[key] !== undefined && item[key] !== p.core[key]) throw new Error(`Yanxi registered ${key} dimension drift`);
  for (const key of ['roof', 'roofH', 'colH', 'layers', 'eaveCount', 'storeys', 'pad', 'ph', 'bays', 'enter', 'throne', 'backDoor', 'open', 'interior']) {
    if (item[key] !== undefined) throw new Error(`Yanxi generic palace override is not supported: ${key}`);
  }
  return { ...structuredClone(p), x: p.anchor.x, z: p.anchor.z, rot: 0,
    navigation: structuredClone(YANXI_RUIN_NAVIGATION), groundCutout: structuredClone(YANXI_RUIN_GROUND_CUTOUT) };
}

const tag = (object, role, extra = {}) => {
  object.name = role; Object.assign(object.userData, { role, ...extra }); return object;
};
const polygon = (n, r) => Array.from({ length: n }, (_, i) => {
  const a = i * Math.PI * 2 / n; return [r * Math.cos(a), r * Math.sin(a)];
});

/** Zone-owned, exterior-only assembly. It never calls the generic hall/roof,
 * furniture, room registration or walkable-rescue helpers. */
export function buildYanxiRuin(kit, item) {
  const g = yanxiRuinGeometry(item); // Validate before any resource/state mutation.
  const f = kit.frame(g.x, g.z, 0); f.name = item.name ?? '延禧宫';
  const makeMaterial = (name, color, roughness, metalness = 0) => {
    const mat = new THREE.MeshStandardMaterial({ name, color, roughness, metalness }); kit.owned.push(mat); return mat;
  };
  const mats = {
    stone: makeMaterial('yanxi_pale_stone', 0xc8c0ac, .94),
    aged: makeMaterial('yanxi_weathered_stone', 0x918a77, .98),
    iron: makeMaterial('yanxi_exposed_iron', 0x49433a, .84, .34),
    zinc: makeMaterial('yanxi_surviving_zinc', 0xaaa99e, .7, .48),
    basin: makeMaterial('yanxi_dry_basin', 0x696958, 1),
  };
  function mesh(parent, role, geometry, material, x = 0, y = 0, z = 0, extra = {}) {
    const m = tag(kit.mesh(parent, geometry, material, x, y, z), role, extra); return m;
  }
  function collider(m) { f.updateMatrixWorld(true); kit.colliders.push(new THREE.Box3().setFromObject(m)); }
  function box(parent, role, material, w, h, d, x, y, z, solid = false, extra = {}) {
    const m = mesh(parent, role, applyBoxUV(new THREE.BoxGeometry(w, h, d)), material, x, y, z, extra);
    if (solid) collider(m); return m;
  }
  function bar(parent, role, material, a, b, width = .11, depth = width, extra = {}) {
    const av = new THREE.Vector3(...a), bv = new THREE.Vector3(...b), delta = bv.clone().sub(av);
    const horizontal = Math.abs(delta.y) < 1e-9;
    const geo = horizontal ? new THREE.BoxGeometry(delta.length(), width, depth) : new THREE.BoxGeometry(width, delta.length(), depth);
    const m = mesh(parent, role, geo, material, ...av.clone().add(bv).multiplyScalar(.5).toArray(), extra);
    if (horizontal) m.rotation.y = -Math.atan2(delta.z, delta.x);
    else m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return m;
  }
  function ring(parent, role, radius, n, y, thickness, material, extra = {}) {
    const pts = polygon(n, radius);
    pts.forEach((p, i) => { const q = pts[(i + 1) % n]; bar(parent, role, material, [p[0], y, p[1]], [q[0], y, q[1]], thickness, thickness, extra); });
  }
  function column(parent, role, x, z, y0, y1, radius, extra = {}) {
    const m = mesh(parent, role, new THREE.CylinderGeometry(radius * .87, radius, y1 - y0, 8), mats.iron, x, (y0 + y1) / 2, z, extra);
    collider(m);
    for (const y of [y0 + .15, y1 - .15]) mesh(parent, 'yanxi-column-collar', new THREE.CylinderGeometry(radius * 1.5, radius * 1.5, .15, 8), mats.iron, x, y, z);
    box(parent, 'yanxi-column-foot', mats.aged, radius * 3, .18, radius * 3, x, y0 + .09, z);
  }
  function archPath(o) {
    const path = new THREE.Path();
    path.moveTo(o.x - o.rx, o.bottom); path.lineTo(o.x - o.rx, o.spring);
    path.absellipse(o.x, o.spring, o.rx, o.ry, Math.PI, 0, true, 0);
    path.lineTo(o.x + o.rx, o.bottom); path.closePath(); return path;
  }
  function wall(parent, id, width, y0, y1, t, openings, x, z, rot = 0) {
    const shape = new THREE.Shape(); shape.moveTo(-width / 2, y0); shape.lineTo(width / 2, y0);
    shape.lineTo(width / 2, y1); shape.lineTo(-width / 2, y1); shape.closePath();
    openings.forEach(o => shape.holes.push(archPath(o)));
    const geo = applyBoxUV(new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 8, steps: 1 }));
    geo.translate(0, 0, -t / 2);
    const m = mesh(parent, 'yanxi-masonry-arch-wall', geo, mats.stone, x, 0, z, { wallId: id, openings: structuredClone(openings) });
    m.rotation.y = rot; f.updateMatrixWorld(true);
    // Small prisms follow the actual arched material. Never register the whole
    // wall bounding box across the visibly hollow door/window apertures.
    const solid = (a, b, low, high) => {
      if (b - a <= 1e-7 || high - low <= 1e-7) return;
      kit.colliders.push(new THREE.Box3(new THREE.Vector3(a, low, -t / 2), new THREE.Vector3(b, high, t / 2)).applyMatrix4(m.matrixWorld));
    };
    let cursor = -width / 2;
    for (const o of [...openings].sort((a, b) => a.x - b.x)) {
      solid(cursor, o.x - o.rx, y0, y1); solid(o.x - o.rx, o.x + o.rx, y0, o.bottom);
      for (let i = 0; i < 12; i++) {
        const a = o.x - o.rx + o.rx * 2 * i / 12, b = o.x - o.rx + o.rx * 2 * (i + 1) / 12;
        const nearest = Math.max(-o.rx, Math.min(o.rx, Math.abs((a + b) / 2 - o.x) - (b - a) / 2));
        const high = o.spring + o.ry * Math.sqrt(Math.max(0, 1 - (nearest / o.rx) ** 2));
        solid(a, b, high, y1);
      }
      cursor = o.x + o.rx;
    }
    solid(cursor, width / 2, y0, y1); return m;
  }
  function moulding(parent, x0, z0, x1, z1, y, width = .13, material = mats.aged) {
    bar(parent, 'yanxi-stone-string-course', material, [x0, y, z0], [x1, y, z1], width, width);
  }

  const p = g.pool, b = g.body, hx = p.w / 2, hz = p.d / 2, bt = p.bankThickness;
  box(f, 'yanxi-dry-pool-floor', mats.basin, p.w, .18, p.d, 0, p.bottomY - .09, 0, false, { water: false });
  for (const sign of [-1, 1]) {
    const h = p.bankTopY - p.bottomY;
    box(f, 'yanxi-pool-retaining-wall', mats.aged, p.w, h, bt, 0, p.bottomY + h / 2, sign * (hz - bt / 2), true);
    box(f, 'yanxi-pool-retaining-wall', mats.aged, bt, h, p.d - bt * 2, sign * (hx - bt / 2), p.bottomY + h / 2, 0, true);
    box(f, 'yanxi-pool-stone-coping', mats.stone, p.w + .16, .12, bt + .16, 0, p.bankTopY + .06, sign * (hz - bt / 2));
    box(f, 'yanxi-pool-stone-coping', mats.stone, bt + .16, .12, p.d - bt * 2, sign * (hx - bt / 2), p.bankTopY + .06, 0);
  }
  // Current-style low metal boundary is deliberately continuous at the front
  // bridge, matching the official photograph's protected exterior viewpoint.
  const railEdges = [[-p.guardW / 2, -p.guardD / 2, p.guardW / 2, -p.guardD / 2],
    [p.guardW / 2, -p.guardD / 2, p.guardW / 2, p.guardD / 2],
    [p.guardW / 2, p.guardD / 2, -p.guardW / 2, p.guardD / 2],
    [-p.guardW / 2, p.guardD / 2, -p.guardW / 2, -p.guardD / 2]];
  for (const [x0, z0, x1, z1] of railEdges) {
    const group = tag(new THREE.Group(), 'yanxi-safety-boundary'); f.add(group);
    const length = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(length / 2);
    for (const y of [.36, .76, p.guardTopY]) bar(group, 'yanxi-safety-rail', mats.iron, [x0, y, z0], [x1, y, z1], .055);
    for (let i = 0; i < n; i++) {
      const x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n;
      box(group, 'yanxi-safety-post', mats.iron, .075, p.guardTopY + .03, .075, x, (p.guardTopY + .03) / 2, z);
    }
    // Conservative thin guard proxy owns only the visible perimeter, not the pool area.
    kit.col(f, Math.min(x0, x1) - .04, 0, Math.min(z0, z1) - .04, Math.max(x0, x1) + .04, p.guardTopY + .03, Math.max(z0, z1) + .04);
  }

  const basementOpenings = [-4.5, 0, 4.5].map(x => ({ x, rx: .62, ry: .48, bottom: -1.85, spring: -1.02 }));
  wall(f, 'basement-south', g.core.w, p.bottomY, .52, .45, basementOpenings, 0, -g.core.d / 2 + .18);
  wall(f, 'basement-north', g.core.w, p.bottomY, .52, .45, basementOpenings, 0, g.core.d / 2 - .18);
  for (const sign of [-1, 1]) wall(f, `basement-side-${sign}`, g.core.d - .8, p.bottomY, .52, .45,
    [-2.6, 0, 2.6].map(x => ({ x, rx: .6, ry: .45, bottom: -1.85, spring: -1.02 })), sign * (g.core.w / 2 - .18), 0, Math.PI / 2);
  box(f, 'yanxi-lower-platform', mats.aged, g.core.w, .23, g.core.d, 0, b.floorY - .115, 0, true);
  const openings = [
    { x: -b.windowX, rx: .72, ry: .67, bottom: 1.55, spring: 2.65 },
    { x: 0, rx: 1.28, ry: .62, bottom: b.floorY + .005, spring: 3.03 },
    { x: b.windowX, rx: .72, ry: .67, bottom: 1.55, spring: 2.65 },
  ];
  for (const sign of [-1, 1]) {
    // Stop the rectangle at the polygonal corner joins. A full rectangular
    // shell behind these windows would put a second wall through each tower.
    wall(f, sign < 0 ? 'main-south' : 'main-north', b.w - 3.7, b.floorY, b.wallTop, b.thickness, openings, 0, sign * b.d / 2);
    const sideSouth = -4 + 1.85 * Math.sin(Math.PI / 3), sideNorth = 4 - 1.85, sideCenter = (sideSouth + sideNorth) / 2;
    wall(f, `main-side-${sign}`, sideNorth - sideSouth, b.floorY, b.wallTop, b.thickness,
      [{ x: sideCenter, rx: 1.1, ry: .62, bottom: b.floorY + .005, spring: 3.03 }], sign * b.w / 2, sideCenter, Math.PI / 2);
    for (const y of [b.floorY + .16, 3.65, 4.38]) {
      moulding(f, -b.w / 2, sign * (b.d / 2 + .24), b.w / 2, sign * (b.d / 2 + .24), y);
      moulding(f, sign * (b.w / 2 + .24), -b.d / 2, sign * (b.w / 2 + .24), b.d / 2, y);
    }
    for (const x of [-5.72, -1.98, 1.98, 5.72]) column(f, 'yanxi-exterior-iron-column', x, sign * 4.52, b.floorY, b.wallTop, .16);
    for (const z of [-3.05, -1.525, 0, 1.525, 3.05]) column(f, 'yanxi-exterior-iron-column', sign * 7.3, z, b.floorY, b.wallTop, .145);
  }
  for (const x of [-1.95, 1.95]) for (const z of [-1.5, 1.5]) column(f, 'yanxi-interior-iron-column', x, z, b.floorY, b.wallTop, .17, { dragonRelief: 'not-resolved-not-invented' });
  // Remaining upper platform edge and load-bearing beam grid. No complete
  // decorative roof, glass enclosure, continuous fantasy upper floor or dome.
  for (const z of [-4.53, 0, 4.53]) bar(f, 'yanxi-exposed-beam', mats.iron, [-7.4, b.wallTop, z], [7.4, b.wallTop, z], .23, .19);
  for (const x of [-7.3, -1.95, 1.95, 7.3]) bar(f, 'yanxi-exposed-beam', mats.iron, [x, b.wallTop, -4.53], [x, b.wallTop, 4.53], .23, .19);
  bar(f, 'yanxi-exposed-beam', mats.iron, [-6.3, b.wallTop, -4], [6.3, b.wallTop, 4], .15);
  bar(f, 'yanxi-exposed-beam', mats.iron, [-6.3, b.wallTop, 4], [6.3, b.wallTop, -4], .15);

  // The front bridge/stair remains visible behind the closed viewing boundary.
  const front = -g.core.d / 2, toe = -p.d / 2 + .35, count = 5;
  for (let i = 0; i < count; i++) {
    const run = (front - toe) / count, top = b.floorY * (i + 1) / count;
    box(f, 'yanxi-protected-front-stair', mats.aged, 3.1, top - p.bottomY, run, 0, (top + p.bottomY) / 2, toe + run * (i + .5), true,
      { publicWalkable: false });
  }
  for (const sign of [-1, 1]) bar(f, 'yanxi-front-stair-cheek', mats.stone, [sign * 1.66, .23, toe], [sign * 1.66, b.floorY + .23, front], .24, .3);

  for (const q of g.cornerPavilions) {
    const group = tag(new THREE.Group(), 'yanxi-corner-pavilion', { pavilionId: q.id, sides: q.sides, remnant: q.remnant });
    group.position.set(q.x, 0, q.z); f.add(group);
    const pts = polygon(q.sides, q.radius);
    for (let i = 0; i < q.sides; i++) {
      const a = pts[i], c = pts[(i + 1) % q.sides], x = (a[0] + c[0]) / 2, z = (a[1] + c[1]) / 2;
      const rot = -Math.atan2(c[1] - a[1], c[0] - a[0]);
      // Clip each polygon edge against the rectangular core. This retains its
      // whole exposed three-quarter arc, clips the south hexagon's half-face
      // join, and omits the internal cross-walls instead of overlaying shells.
      const cuts = [0, 1], delta = [c[0] - a[0], c[1] - a[1]], origin = [q.x + a[0], q.z + a[1]];
      for (const [axis, half] of [[0, b.w / 2], [1, b.d / 2]]) for (const sign of [-1, 1]) {
        if (Math.abs(delta[axis]) < 1e-8) continue;
        const t = (sign * half - origin[axis]) / delta[axis]; if (t > 1e-8 && t < 1 - 1e-8) cuts.push(t);
      }
      cuts.sort((a, b) => a - b);
      for (let j = 0; j < cuts.length - 1; j++) {
        const t0 = cuts[j], t1 = cuts[j + 1], tm = (t0 + t1) / 2;
        if (Math.abs(origin[0] + delta[0] * tm) < b.w / 2 - 1e-7 && Math.abs(origin[1] + delta[1] * tm) < b.d / 2 - 1e-7) continue;
        const aa = [a[0] + delta[0] * t0, a[1] + delta[1] * t0], cc = [a[0] + delta[0] * t1, a[1] + delta[1] * t1];
        const length = Math.hypot(cc[0] - aa[0], cc[1] - aa[1]); if (length < 1e-7) continue;
        const apertures = length > 1.3 ? [{ x: 0, rx: Math.min(.57, length * .32), ry: .52, bottom: 1.55, spring: 2.65 }] : [];
        wall(group, `${q.id}-face-${i}-${j}`, length, b.floorY, b.wallTop, .35, apertures, (aa[0] + cc[0]) / 2, (aa[1] + cc[1]) / 2, rot);
        for (const y of [.84, 3.65, 4.38]) moulding(group, aa[0], aa[1], cc[0], cc[1], y);
      }
      box(group, 'yanxi-pavilion-frame-post', mats.iron, .13, q.upperTopY - q.upperBaseY, .13,
        a[0], (q.upperTopY + q.upperBaseY) / 2, a[1], false, { pavilionId: q.id, node: i });
      bar(group, 'yanxi-pavilion-lower-panel', mats.iron, [a[0], q.upperBaseY + .34, a[1]], [c[0], q.upperBaseY + .34, c[1]], .62, .075);
    }
    for (const [y, t] of [[q.upperBaseY, .2], [q.upperBaseY + .68, .11], [q.upperTopY - .36, .1], [q.upperTopY, .22]]) ring(group, 'yanxi-pavilion-ring', q.radius, q.sides, y, t, mats.iron);
    if (q.z < 0) {
      ring(group, 'yanxi-corner-crown-base', q.radius + .08, q.sides, q.upperTopY + .13, .15, mats.iron);
      // Sparse bent crown ribs and only two opposing sheet remnants are visible
      // in the south photo. The remaining sectors stay physically open.
      for (let i = 0; i < q.sides; i++) {
        const a = pts[i]; bar(group, 'yanxi-corner-crown-rib', mats.iron,
          [a[0] * .63, q.upperTopY + .15, a[1] * .63], [a[0] * .24, q.upperTopY + .76, a[1] * .24], .075);
      }
      for (const index of [0, 3]) {
        const a = pts[index], c = pts[(index + 1) % q.sides];
        const positions = [[a[0] * .63, q.upperTopY + .15, a[1] * .63], [c[0] * .63, q.upperTopY + .15, c[1] * .63],
          [c[0] * .24, q.upperTopY + .76, c[1] * .24], [a[0] * .24, q.upperTopY + .76, a[1] * .24]];
        const indexed = new THREE.BufferGeometry().setFromPoints(positions.map(p => new THREE.Vector3(...p)));
        indexed.setIndex([0, 1, 2, 0, 2, 3, 2, 1, 0, 3, 2, 0]);
        const geo = indexed.toNonIndexed(); indexed.dispose(); geo.computeVertexNormals();
        mesh(group, 'yanxi-corner-sheet-remnant', geo, mats.iron);
      }
    }
  }

  const c = g.centralPavilion, central = tag(new THREE.Group(), 'yanxi-central-pavilion', { sides: 8, tiers: 2 }); f.add(central);
  for (const [radius, y0, y1] of [[c.lowerRadius, c.baseY, c.lowerTopY], [c.upperRadius, c.upperBaseY, c.upperTopY]]) {
    const pts = polygon(8, radius);
    for (let i = 0; i < 8; i++) {
      const a = pts[i], next = pts[(i + 1) % 8];
      box(central, 'yanxi-central-iron-post', mats.iron, .14, y1 - y0, .14, a[0], (y1 + y0) / 2, a[1]);
      if (y0 === c.upperBaseY) bar(central, 'yanxi-central-drum-panel', mats.aged,
        [a[0], y0 + .28, a[1]], [next[0], y0 + .28, next[1]], .46, .07);
    }
    ring(central, 'yanxi-central-ring', radius, 8, y0, .17, mats.iron);
    ring(central, 'yanxi-central-ring', radius, 8, y1, .18, mats.iron);
    ring(central, 'yanxi-central-ring', radius, 8, y0 + .68, .09, mats.iron);
  }
  for (const y of [c.lowerTopY, c.lowerTopY + .18]) ring(central, 'yanxi-central-balcony-edge', 2.25, 8, y, .2, mats.iron);
  const balcony = polygon(8, 2.25);
  for (const [x, z] of balcony) bar(central, 'yanxi-central-balcony-post', mats.iron, [x, c.lowerTopY, z], [x, c.lowerTopY + .6, z], .06);
  ring(central, 'yanxi-central-balcony-rail', 2.25, 8, c.lowerTopY + .6, .065, mats.iron);
  for (const [x, z] of polygon(8, c.lowerRadius)) bar(central, 'yanxi-central-balcony-support', mats.iron,
    [x, c.lowerTopY - .43, z], [x * 2.25 / c.lowerRadius, c.lowerTopY, z * 2.25 / c.lowerRadius], .09);
  // The small surviving central cap is evidenced, unlike a completed broad roof.
  mesh(central, 'yanxi-central-surviving-cap', new THREE.CylinderGeometry(.42, 1.72, c.capTopY - c.upperTopY, 8, 1), mats.zinc,
    0, (c.capTopY + c.upperTopY) / 2, 0, { evidence: 'official-photo; simplified surviving zinc cap' });
  ring(central, 'yanxi-central-cap-edge', 1.72, 8, c.upperTopY + .04, .14, mats.zinc);
  for (const [x, z] of polygon(8, 1.72)) bar(central, 'yanxi-central-cap-corner', mats.zinc,
    [x * .88, c.upperTopY + .1, z * .88], [x * 1.03, c.upperTopY + .43, z * 1.03], .055);
  mesh(central, 'yanxi-central-cap-finial', new THREE.CylinderGeometry(.035, .075, .38, 6), mats.zinc, 0, c.capTopY + .19, 0);

  f.updateMatrixWorld(true);
  const roles = {}; let triangles = 0, meshes = 0;
  f.traverse(o => {
    if (!o.isMesh) return; const count = (o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3;
    const entry = roles[o.userData.role] ??= { meshInstances: 0, triangleInstances: 0 };
    entry.meshInstances++; entry.triangleInstances += count; triangles += count; meshes++;
  });
  const bounds = new THREE.Box3().setFromObject(f);
  f.userData.structure = { id: g.id, profileId: g.profileId, profile: g.profile, streamLayer: 'B',
    condition: 'unfinished-metal-and-stone-ruin', currentConditionAccepted: false,
    dimensionStatus: g.dimensionStatus, registeredCore: { ...g.core }, anchor: { ...g.anchor },
    pavilionSides: g.cornerPavilions.map(p => ({ id: p.id, sides: p.sides })), centralPavilionSides: 8,
    navigation: g.navigation, groundCutout: g.groundCutout, evidence: g.evidence,
    bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
    roleBudget: { roles, triangleInstances: triangles, meshInstances: meshes, triangleCap: 12000, premergeMeshCap: 650, materialBucketCap: 5,
      comparison: 'Local replacement budget; global performance is an integration check. Unloaded roof-only silhouettes are not additive savings.' } };
  kit.mapItems.push({ kind: 'hall', name: item.name ?? '延禧宫', x: g.x, z: g.z, w: g.core.w, d: g.core.d,
    structure: 'yanxi-ruin', ruinProfile: g.profile, profileId: g.profileId, dimensionStatus: g.dimensionStatus,
    navigation: g.navigation, footprints: [{ kind: 'ruin', x: g.x, z: g.z, w: g.core.w, d: g.core.d },
      { kind: 'protected-pool', x: g.x, z: g.z, w: g.pool.guardW, d: g.pool.guardD }] });
  return { f, g, PW: g.core.w, PD: g.core.d, top: b.floorY };
}
