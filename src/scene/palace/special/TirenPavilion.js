import * as THREE from 'three';

const SOURCE = 'https://www.dpm.org.cn/explore/building/236453.html';
const FACE = { south: 0, north: Math.PI, east: Math.PI / 2, west: -Math.PI / 2 };
const tag = (object, role, data = {}) => {
  object.name = `tiren_${role}`;
  Object.assign(object.userData, { role, ...data });
  return object;
};
function part(parent, role, data) {
  const group = tag(new THREE.Group(), role, data);
  parent.add(group);
  return group;
}

/**
 * A dedicated two-storey pavilion, not a hall with a double-eave roof.
 * Local front is -Z. Placement/footprint follow ordinary CourtKit hall options.
 * Floor heights and proportions remain provisional; bay counts follow SOURCE.
 * Explicit enter:true opens only the central lower double plank door.
 */
export function buildTirenPavilion(kit, opts = {}) {
  const { x = -98.4, z = -109.3, w = 44.1, d = 12, ph = 3.2, pad = 1,
    name = '体仁阁', plaque = false, map = 'hall', enter = false } = opts;
  const rot = typeof opts.rot === 'string' ? FACE[opts.rot] ?? FACE.west : opts.rot ?? FACE.west;
  const lowerH = opts.lowerStoreyH ?? 6.3;
  const upperH = opts.upperStoreyH ?? 5.7;
  const balconyY = ph + lowerH + 2.2;
  const lowerBay = w / 9;
  const upperW = w * 7 / 9;
  const upperD = d * 0.6;
  const upperBay = upperW / 7;
  const balconyW = w - 0.3;
  const balconyD = d + 0.5;
  const PW = w + 2 * pad, PD = d + 2 * pad;
  const frame = kit.frame(x, z, rot);
  frame.name = name;
  const box = (parent, role, material, width, height, depth, px, py, pz, data = {}) =>
    tag(kit.box(parent, material, width, height, depth, px, py, pz), role, data);
  const solid = (parent, role, material, width, height, depth, px, py, pz, data) => {
    const mesh = box(parent, role, material, width, height, depth, px, py, pz, data);
    kit.col(frame, px - width / 2, py - height / 2, pz - depth / 2,
      px + width / 2, py + height / 2, pz + depth / 2);
    return mesh;
  };
  const walk = (x0, z0, x1, z1, y, elevated = false) => {
    kit.walkBox(frame, x0, z0, x1, z1, y);
    if (elevated) kit.walkables[kit.walkables.length - 1].rescue = false;
  };

  // Raised, grey masonry platform: footprint stays on the existing anchor.
  solid(frame, 'plinth', 'wall_brick', PW, ph, PD, 0, ph / 2, 0);
  box(frame, 'plinth-coping', 'stone_slab', PW + 0.16, 0.18, PD + 0.16, 0, ph - 0.09, 0);
  walk(-PW / 2, -PD / 2, PW / 2, PD / 2, ph);
  box(frame, 'storey-floor', 'stone_slab', w, 0.12, d, 0, ph - 0.06, 0, { level: 1 });
  const stairW = Math.min(lowerBay * 1.3, 6.4);
  if (ph > 0.55) kit.steps(frame, { zEdge: -PD / 2, dir: -1, y: ph, width: stairW });

  // Columns define nine lower bays and three depth bays. End walls are solids.
  const column = (px, pz, floorY, height, level, radius = 0.25) => {
    const mesh = tag(kit.mesh(frame, new THREE.CylinderGeometry(radius, radius * 1.04, height, 10),
      kit.lib.material('wood_column'), px, floorY + height / 2, pz), 'storey-column', { level });
    kit.col(frame, px - radius, floorY, pz - radius, px + radius, floorY + height, pz + radius);
    return mesh;
  };
  for (let i = 0; i <= 9; i++) {
    for (const side of [-1, 1]) column(-w / 2 + i * lowerBay, side * d / 2, ph, lowerH, 1, 0.3);
  }
  for (const side of [-1, 1]) for (const depth of [-d / 6, d / 6]) column(side * w / 2, depth, ph, lowerH, 1, 0.3);
  for (const side of [-1, 1]) solid(frame, 'lower-brick-side', 'wall_red', 0.65, lowerH, d,
    side * w / 2, ph + lowerH / 2, 0);
  solid(frame, 'lower-brick-rear', 'wall_red', w, lowerH, 0.65, 0, ph + lowerH / 2, d / 2);
  // Grey wall footing separates window sill from the raised platform.
  for (const side of [-1, 1]) box(frame, 'lower-wall-footing', 'wall_brick', 0.7, 0.75, d,
    side * w / 2, ph + 0.375, 0);
  box(frame, 'lower-wall-footing', 'wall_brick', w, 0.75, 0.7, 0, ph + 0.375, d / 2);

  const facadeH = lowerH - 0.75;
  const doorH = facadeH - 0.2;
  const front = -d / 2;
  for (let bay = 0; bay < 9; bay++) {
    const cx = -w / 2 + (bay + 0.5) * lowerBay;
    const kind = bay === 4 ? 'door' : bay === 0 || bay === 8 ? 'brick' : 'window';
    const g = part(frame, 'lower-front-bay', { bay, kind });
    const clearW = lowerBay - 0.6;
    if (kind === 'brick') {
      solid(g, 'lower-blocked-bay', 'wall_red', lowerBay, facadeH, 0.65, cx, ph + facadeH / 2, front, { bay });
      box(g, 'lower-wall-footing', 'wall_brick', lowerBay, 0.75, 0.7, cx, ph + 0.375, front);
    } else if (kind === 'window') {
      const sill = 0.85, windowH = facadeH - sill - 0.22;
      solid(g, 'lower-window-sill', 'wall_brick', lowerBay, sill, 0.65, cx, ph + sill / 2, front);
      const window = part(g, 'lower-window', { bay });
      for (const sign of [-1, 1]) box(window, 'lower-window-frame', 'wood_column', 0.14, windowH, 0.22,
        cx + sign * clearW / 2, ph + sill + windowH / 2, front);
      for (const y of [ph + sill, ph + sill + windowH]) box(window, 'lower-window-frame', 'wood_column', clearW, 0.15, 0.22, cx, y, front);
      for (let j = 1; j < 14; j++) box(window, 'lower-window-bar', 'wood_column', 0.045, windowH, 0.085,
        cx - clearW / 2 + j * clearW / 14, ph + sill + windowH / 2, front - 0.045);
      // 一码三箭: three small crossbars near both ends of the vertical lattice.
      for (const end of [-1, 1]) for (let j = 0; j < 3; j++) box(window, 'lower-window-bar', 'wood_column', clearW, 0.045, 0.09,
        cx, ph + sill + windowH / 2 + end * (windowH * 0.32 + j * 0.1), front - 0.05);
      kit.col(frame, cx - lowerBay / 2, ph, front - 0.3, cx + lowerBay / 2, ph + facadeH, front + 0.3);
    } else {
      // Real plank leaves, with visible seams and rings. No generic lattice door.
      const leafW = clearW / 2 - 0.035;
      for (const sign of [-1, 1]) {
        const leaf = part(g, 'lower-door-leaf', { open: enter });
        leaf.position.set(enter ? sign * (clearW / 2 - 0.08) : sign * (leafW / 2 + 0.035),
          ph + doorH / 2, enter ? front + leafW / 2 : front);
        if (enter) leaf.rotation.y = Math.PI / 2;
        box(leaf, 'lower-door-plank', 'wood_column', leafW, doorH, 0.18, 0, 0, 0);
        for (let j = 1; j < 6; j++) box(leaf, 'lower-door-seam', 'wall_red', 0.025, doorH - 0.08, 0.025,
          -leafW / 2 + j * leafW / 6, 0, -0.105);
        for (const y of [-doorH * 0.28, doorH * 0.28]) box(leaf, 'lower-door-rail', 'wood_column', leafW - 0.08, 0.16, 0.1, 0, y, -0.12);
        tag(kit.mesh(leaf, new THREE.TorusGeometry(0.14, 0.025, 6, 12), kit.gold,
          -sign * leafW * 0.27, -doorH * 0.05, -0.15), 'lower-door-ring');
        if (enter) kit.col(frame, sign * (clearW / 2 - 0.08) - 0.1, ph, front,
          sign * (clearW / 2 - 0.08) + 0.1, ph + doorH, front + leafW);
      }
      if (!enter) kit.col(frame, -clearW / 2, ph, front - 0.1, clearW / 2, ph + doorH, front + 0.1);
      box(g, 'door-threshold', 'wood_column', clearW, 0.16, 0.28, cx, ph + 0.08, front);
      box(g, 'lower-door-lintel', 'wood_column', clearW, facadeH - doorH, 0.3,
        cx, ph + doorH + (facadeH - doorH) / 2, front);
    }
  }

  const beamRing = (width, depth, y, height) => {
    for (const side of [-1, 1]) {
      box(frame, 'painted-beam', 'caihua_beam', width + 0.3, height, 0.48, 0, y, side * depth / 2);
      box(frame, 'painted-beam', 'caihua_beam', 0.48, height, depth + 0.3, side * width / 2, y, 0);
    }
  };
  beamRing(w, d, ph + lowerH - 0.375, 0.75);
  beamRing(w + 0.25, d + 0.25, ph + lowerH + 0.24, 0.48);
  buildSkirt(kit, frame, {
    innerW: balconyW - 0.25, innerD: balconyD - 0.25,
    outerW: w + 4.8, outerD: d + 4.8,
    innerY: balconyY - 0.32, outerY: ph + lowerH + 0.35,
  });

  // The independent upper core is recessed behind a true, open four-sided gallery.
  solid(frame, 'storey-floor', 'wood_column', upperW, 0.26, upperD, 0, balconyY - 0.13, 0, { level: 2 });
  walk(-upperW / 2, -upperD / 2, upperW / 2, upperD / 2, balconyY, true);
  const decks = [
    [-balconyW / 2, -balconyD / 2, balconyW / 2, -upperD / 2],
    [-balconyW / 2, upperD / 2, balconyW / 2, balconyD / 2],
    [-balconyW / 2, -upperD / 2, -upperW / 2, upperD / 2],
    [upperW / 2, -upperD / 2, balconyW / 2, upperD / 2],
  ];
  decks.forEach(([x0, z0, x1, z1], side) => {
    solid(frame, 'balcony-deck', 'wood_column', x1 - x0, 0.28, z1 - z0,
      (x0 + x1) / 2, balconyY - 0.14, (z0 + z1) / 2, { side });
    walk(x0, z0, x1, z1, balconyY, true);
  });
  for (let i = 0; i <= 7; i++) for (const side of [-1, 1]) column(-upperW / 2 + i * upperBay, side * upperD / 2, balconyY, upperH, 2, 0.22);
  for (const side of [-1, 1]) solid(frame, 'upper-wood-side', 'wood_column', 0.28, upperH, upperD,
    side * upperW / 2, balconyY + upperH / 2, 0);
  solid(frame, 'upper-wood-rear', 'wood_column', upperW, upperH, 0.28, 0, balconyY + upperH / 2, upperD / 2);
  for (let bay = 0; bay < 7; bay++) {
    const g = part(frame, 'upper-front-bay', { bay });
    const bayX = -upperW / 2 + (bay + 0.5) * upperBay;
    for (let j = 0; j < 4; j++) {
      const leafW = (upperBay - 0.4) / 4;
      const cx = bayX + (j - 1.5) * leafW;
      const leaf = part(g, 'upper-lattice-leaf', { bay, leaf: j });
      const leafH = upperH - 0.6;
      const zf = -upperD / 2;
      box(leaf, 'upper-lattice-lower-panel', 'wood_column', leafW - 0.045, 1.1, 0.12, cx, balconyY + 0.55, zf);
      for (const sign of [-1, 1]) box(leaf, 'upper-lattice-frame', 'wood_column', 0.075, leafH, 0.15,
        cx + sign * (leafW - 0.075) / 2, balconyY + leafH / 2, zf);
      for (const y of [balconyY + 1.1, balconyY + leafH]) box(leaf, 'upper-lattice-frame', 'wood_column', leafW, 0.1, 0.15, cx, y, zf);
      // Repeated physical diagonal diamonds, with no uncut opaque wall behind them.
      const cellH = 0.62, latticeW = leafW - 0.15;
      for (let y = balconyY + 1.16; y + cellH < balconyY + leafH; y += cellH) {
        for (const sign of [-1, 1]) {
          const bar = box(leaf, 'upper-lattice-bar', 'wood_column', 0.038, Math.hypot(latticeW, cellH), 0.06,
            cx, y + cellH / 2, zf - 0.035);
          bar.rotation.z = sign * Math.atan2(latticeW, cellH);
        }
      }
    }
    kit.col(frame, bayX - upperBay / 2, balconyY, -upperD / 2 - 0.1,
      bayX + upperBay / 2, balconyY + upperH, -upperD / 2 + 0.1);
  }
  beamRing(upperW, upperD, balconyY + upperH - 0.3, 0.6);

  // 10 front + 10 rear + 2 intermediate columns on each side = 24, no duplicates.
  const supportW = balconyW - 0.26, supportD = balconyD - 0.26;
  const supports = [];
  for (let i = 0; i <= 9; i++) for (const side of [-1, 1]) supports.push([-supportW / 2 + i * supportW / 9, side * supportD / 2]);
  for (const side of [-1, 1]) for (const t of [-1 / 6, 1 / 6]) supports.push([side * supportW / 2, t * supportD]);
  supports.forEach(([px, pz], index) => solid(frame, 'balcony-eave-support', 'wood_column', 0.25, upperH, 0.25,
    px, balconyY + upperH / 2, pz, { index, section: 'square' }));
  beamRing(supportW, supportD, balconyY + upperH - 0.25, 0.5);
  for (const [side, alongX, fixed] of [['front', true, -supportD / 2], ['rear', true, supportD / 2],
    ['left', false, -supportW / 2], ['right', false, supportW / 2]]) {
    const rail = part(frame, 'balcony-railing', { side });
    const length = alongX ? supportW : supportD;
    for (const y of [balconyY + 0.14, balconyY + 0.52, balconyY + 1.1]) box(rail, 'balcony-rail', 'wood_column',
      alongX ? length : 0.11, 0.12, alongX ? 0.11 : length, alongX ? 0 : fixed, y, alongX ? fixed : 0);
    const count = Math.ceil(length / 0.65);
    for (let i = 0; i <= count; i++) {
      const along = -length / 2 + i * length / count;
      box(rail, 'balcony-baluster', 'wood_column', 0.085, 0.96, 0.085,
        alongX ? along : fixed, balconyY + 0.6, alongX ? fixed : along);
    }
    kit.col(frame, alongX ? -length / 2 : fixed - 0.08, balconyY, alongX ? fixed - 0.08 : -length / 2,
      alongX ? length / 2 : fixed + 0.08, balconyY + 1.18, alongX ? fixed + 0.08 : length / 2);
  }
  const roof = tag(kit.roof(frame, {
    type: 'wudian', width: supportW + 0.2, depth: supportD + 0.2,
    baseY: balconyY + upperH, height: opts.roofH ?? 6.45,
    overhang: 1.75, brackets: true, layers: 1,
  }), 'upper-hip-roof', { roofType: 'wudian', layers: 1 });

  // Retain the normal hall navigation/location contract only for playable space.
  // The upper gallery has no evidenced public stair and is not a playable room.
  if (enter) kit.registerRoom(frame, {
    name, kind: 'hall', x0: -w / 2 + 0.35, x1: w / 2 - 0.35,
    z0: -d / 2 + 0.35, z1: d / 2 - 0.35, y: ph, h: facadeH,
    doors: [{ x: 0, z: front }],
  });
  if (name && plaque) kit.plaque(frame, name, 0, ph + lowerH - 0.5, front - 0.35, 1.1, 1.5);
  if (map) kit.mapRect(frame, map, name, PW, PD);
  const facing = Object.keys(FACE).find(key => Math.abs(Math.sin(rot - FACE[key])) < 1e-8 && Math.cos(rot - FACE[key]) > 0) ?? 'custom';
  frame.userData.pavilion = {
    id: 'axis-courts/tirenge', name, source: SOURCE, facing,
    storeys: [
      { level: 1, bays: 9, depthBays: 3, width: w, depth: d, floorY: ph, height: lowerH },
      { level: 2, bays: 7, width: upperW, depth: upperD, floorY: balconyY, height: upperH },
    ],
    balcony: { width: balconyW, depth: balconyD, floorY: balconyY, supports: 24, sides: 4, access: 'no-verified-stair' },
    openings: { lowerDoorLeaves: 2, lowerWindowBays: 6, lowerBlockedEndBays: [0, 8], upperFrontLeaves: 28,
      lowerDoor: enter ? 'open-for-playable-route' : 'closed-reference-state' },
    dimensions: { status: 'provisional', officialOverallHeight: 25, generatedTopY: roof.userData.topY,
      note: 'Existing footprint retained; room heights, plinth, balcony and roof proportions are unsurveyed.' },
  };
  return { f: frame, group: frame, PW, PD, top: ph };
}

/** A four-slope annular waist roof: the centre is empty, never a second room box. */
function buildSkirt(kit, frame, { innerW, innerD, outerW, outerD, innerY, outerY }) {
  const group = part(frame, 'lower-eave-skirt');
  const corners = (w, d) => [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]];
  const inner = corners(innerW, innerD), outer = corners(outerW, outerD);
  const point = (side, u, t, inset = 0) => {
    const next = (side + 1) % 4;
    const ix = THREE.MathUtils.lerp(inner[side][0], inner[next][0], u);
    const iz = THREE.MathUtils.lerp(inner[side][1], inner[next][1], u);
    const ox = THREE.MathUtils.lerp(outer[side][0], outer[next][0], u);
    const oz = THREE.MathUtils.lerp(outer[side][1], outer[next][1], u);
    const y = THREE.MathUtils.lerp(innerY, outerY, 0.6 * t + 0.4 * t * t)
      + 0.3 * Math.pow(Math.abs(2 * u - 1), 8) * t * t - inset;
    return [THREE.MathUtils.lerp(ix, ox, t), y, THREE.MathUtils.lerp(iz, oz, t)];
  };
  for (let side = 0; side < 4; side++) {
    for (const [material, underside] of [['roof_tile', false], ['rafters', true]]) {
      const positions = [], uv = [], indices = [], cols = 24, rows = 6;
      for (let row = 0; row <= rows; row++) for (let col = 0; col <= cols; col++) {
        const p = point(side, col / cols, row / rows, underside ? 0.18 : 0);
        positions.push(...p);
        uv.push(col / cols * (side % 2 ? outerD : outerW) / kit.lib.tileSize(material), row / rows * 3);
      }
      for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
        const a = row * (cols + 1) + col, b = a + 1, c = a + cols + 1, d = c + 1;
        indices.push(...(underside ? [a, c, b, b, c, d] : [a, b, c, b, d, c]));
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();
      tag(kit.mesh(group, geometry, kit.lib.material(material), 0, 0, 0), underside ? 'skirt-soffit' : 'skirt-slope', { side });
    }
    const ridgePoints = Array.from({ length: 9 }, (_, i) => new THREE.Vector3(...point(side, 0, i / 8)));
    kit.mesh(group, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ridgePoints), 12, 0.1, 5, false), kit.ridge, 0, 0.07, 0);
    const p0 = point(side, 0, 1), p1 = point(side, 1, 1);
    const length = Math.hypot(p1[0] - p0[0], p1[2] - p0[2]);
    const fascia = kit.box(group, 'roof_tile', length, 0.2, 0.18,
      (p0[0] + p1[0]) / 2, outerY - 0.07, (p0[2] + p1[2]) / 2);
    if (side % 2) fascia.rotation.y = Math.PI / 2;
  }
  return group;
}
