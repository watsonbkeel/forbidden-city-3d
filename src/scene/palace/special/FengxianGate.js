import * as THREE from 'three';
import { buildWallCap } from '../../RoofBuilder.js';
import { applyBoxUV } from '../../../utils/GeometryUV.js';

const NAME = '奉先门';
const PROFILE = 'fengxian-three-arch';
const SOURCE = 'https://img.dpm.org.cn/Uploads/File/2023/02/15/u63ec3cb1a5b6d.pdf#page=5';
const STUDY = 'https://doi.org/10.19819/j.cnki.ISSN0529-1399.202302007';
const WALL_HEIGHT = 6.5; // Same finished wall profile as the existing adjoining wall.
const ARCHES = [
  { x: -5.5, width: 3.12, springY: 1.95, rise: 1.03 },
  { x: 0, width: 4.45, springY: 2.25, rise: 1.23 },
  { x: 5.5, width: 3.12, springY: 1.95, rise: 1.03 },
];
const FOREPARTS = [
  [-8.45, -3.45, 3.68], [-3.45, -2.65, 3.51], [-2.65, 2.65, 4.12],
  [2.65, 3.45, 3.51], [3.45, 8.45, 3.68],
];

const mark = (object, part, data) => {
  object.userData.fengxianPart = part;
  Object.assign(object.userData, data);
  return object;
};

function archPoints({x, width, springY, rise}) {
  return Array.from({length: 25}, (_, i) => {
    const a = Math.PI * (1 - i / 24);
    return [x + Math.cos(a) * width / 2, springY + Math.sin(a) * rise];
  });
}

function outline(points) {
  const shape = new THREE.Shape();
  shape.moveTo(...points[0]);
  for (const p of points.slice(1)) shape.lineTo(...p);
  shape.closePath();
  return shape;
}

// The backing remains the same wall thickness/height at both joins. The
// projecting glazed assembly and each portal are entirely owned by E56.
export function buildFengxianGate(kit, item, zone) {
  const {x, z, w} = item;
  const walls = zone.items.filter(row => row.kind === 'courtWalls' && row.gates?.some(g => g.gate === NAME));
  if (zone.id !== 'east-six' || item.name !== NAME || item.kind !== 'gate' || item.gateProfile !== PROFILE ||
      item.rot !== undefined || w !== 19.5 || walls.length !== 1 || walls[0].z0 !== z ||
      walls[0].gates.length !== 1 || walls[0].gates[0].side !== 's' || walls[0].gates[0].at !== x ||
      walls[0].x0 >= x - w / 2 || walls[0].x1 <= x + w / 2 ||
      walls[0].h !== undefined || walls[0].t !== undefined) {
    throw new Error('Invalid E56 gate or south wall attachment');
  }

  const f = kit.frame(x, z);
  f.name = NAME;
  f.userData.structure = {
    id: 'FC-EF18B2CEC2', name: NAME, gateProfile: PROFILE, portalCount: 3, localRoofCount: 5,
    dimensionStatus: 'PHOTO_FIT_NOT_SURVEY', siteAccessVerified: false,
    gameplay: 'RETAINED_CENTER_PASSAGE_SIDE_LEAVES_CLOSED',
    sources: [SOURCE, STUDY],
  };
  const wall = kit.lib.material('wall_red');
  const glaze = (name, color) => {
    const m = new THREE.MeshStandardMaterial({name: `fengxian_${name}`, color, roughness: .62});
    kit.owned.push(m);
    return m;
  };
  const green = glaze('glaze_green', 0x36554c);
  const yellow = glaze('glaze_ochre', 0xb58736);
  const red = glaze('door_lacquer', 0x7c2925);
  const box = (part, mat, left, right, bottom, top, front, rear) => {
    const w = right - left, h = top - bottom, d = rear - front;
    const x = (left + right) / 2, y = (bottom + top) / 2, z = (front + rear) / 2;
    return mark(typeof mat === 'string'
      ? kit.box(f, mat, w, h, d, x, y, z)
      : kit.mesh(f, applyBoxUV(new THREE.BoxGeometry(w, h, d)), mat, x, y, z), part);
  };
  const extrusion = (part, mat, points, front, rear, data) => {
    const geo = new THREE.ExtrudeGeometry(outline(points), {depth: rear - front, bevelEnabled: false, steps: 1});
    return mark(kit.mesh(f, applyBoxUV(geo), mat, 0, 0, front), part, data);
  };
  const pier = (left, right, top, front, rear, base) => {
    box('stone-foot', 'stone_slab', left, right, 0, base, front, rear);
    box('masonry-pier', 'wall_red', left, right, base, top, front, rear);
    kit.col(f, left, 0, front, right, top, rear);
  };
  const span = (p, top, front, rear, part) => {
    const arc = archPoints(p);
    extrusion(part, wall, [[arc[0][0], top], [arc.at(-1)[0], top], ...arc.toReversed()], front, rear,
      {aperture: {...p, crownY: p.springY + p.rise}});
    for (let i = 1; i < arc.length; i++) {
      const [left, right] = [arc[i - 1], arc[i]];
      kit.col(f, left[0], Math.max(left[1], right[1]), front, right[0], top, rear);
    }
  };

  let start = -w / 2;
  for (const p of ARCHES) {
    const left = p.x - p.width / 2, right = p.x + p.width / 2;
    pier(start, left, WALL_HEIGHT, -.5, .5, 1);
    span(p, WALL_HEIGHT, -.5, .5, 'arch-vault');
    start = right;
    if (p.x !== 0) {
      const leafArc = archPoints({...p, width: p.width - .04, springY: p.springY - .025, rise: p.rise - .02});
      const y = .025;
      extrusion('closed-side-door', red, [[leafArc[0][0], y], [leafArc.at(-1)[0], y], ...leafArc.toReversed()], .12, .26);
      box('door-joint', 'wood_column', p.x - .025, p.x + .025, y, p.springY + p.rise - .05, .092, .12);
      kit.col(f, left, 0, .12, right, p.springY + p.rise, .26);
    } else {
      for (const side of [-1, 1]) {
        const hinge = side * (p.width / 2 - .10);
        box('retained-open-leaf', red, hinge - .06, hinge + .06, 0, 2.08, .08, 1.48);
        kit.col(f, hinge - .06, 0, .08, hinge + .06, 2.08, 1.48);
      }
    }
  }
  pier(start, w / 2, WALL_HEIGHT, -.5, .5, 1);
  const cap = kit.adopt(buildWallCap(kit.lib, {length: w, thickness: 1}));
  cap.position.y = WALL_HEIGHT;
  f.add(mark(cap, 'retained-height-wall-cap'));

  for (const [left, right, top] of FOREPARTS) {
    const mid = (left + right) / 2, front = -1.62, rear = -.499;
    const p = ARCHES.find(a => a.x > left && a.x < right);
    if (p) {
      pier(left, p.x - p.width / 2, top, front, rear, .48);
      span(p, top, front, rear, 'projecting-arch');
      pier(p.x + p.width / 2, right, top, front, rear, .48);
    } else {
      pier(left, right, top, front, rear, .48);
      const profile = [[0, -.55], [.074, -.53], [.103, -.47], [.061, -.40], [.06, 0]]
        .map(([x, y]) => new THREE.Vector2(x, y));
      mark(kit.mesh(f, new THREE.LatheGeometry(profile, 10), yellow, mid, top, front - .07), 'hanging-post');
    }
    const trim = p ? .16 : .075;
    box('glazed-edge', yellow, left - trim, right + trim, top, top + .10, -1.81, -.49);
    box('glazed-architrave', green, left - trim, right + trim, top + .10, top + .32, -1.83, -.49);
    mark(kit.roof(f, {type: 'wudian', width: right - left + .29, depth: 1.95,
      baseY: top + .32, height: p ? .49 : .25, brackets: false}, mid, -1.30), 'local-roof');
  }

  kit.mapRect(f, 'gate', NAME, w, 2.7);
  return w; // Whole masonry replacement, not the clear width of an opening.
}
