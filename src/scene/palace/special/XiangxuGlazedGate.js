import * as T from 'three';
import {createTriangleTemplate, triangleInstance} from '../../../utils/TriangleSupport.js';

const ID = 'xiangxu-glazed-gate-fit';
const SOURCE_ID = 'FC-4D8561AE5D';
const done = new WeakSet();
const mutable = a => Array.isArray(a) && Object.isExtensible(a) && Object.getOwnPropertyDescriptor(a, 'length')?.writable;
export const XIANGXU_GATE_FIT = Object.freeze({
  x: -134.5, z: 207, rotation: 0,
  bounds: Object.freeze([-142, 0, 205, -127, 9, 209]),
});
function validate(kit, zone) {
  const root = kit?.root;
  let duplicate = false;
  root?.traverse(o => { if (o.userData.structure?.sourceObjectId === SOURCE_ID) duplicate = true; });
  if (done.has(kit) || duplicate) throw Error('Xiangxu source identity required once only; duplicate refused');
  if (!root || root.name !== 'east-six' || root.parent || !root.matrixAutoUpdate || !root.matrixWorldAutoUpdate ||
      root.position.lengthSq() || !root.quaternion.equals(new T.Quaternion()) || !root.scale.equals(new T.Vector3(1, 1, 1)) ||
      !root.matrix.equals(new T.Matrix4()) || !root.matrixWorld.equals(new T.Matrix4()) || !Object.isExtensible(root) ||
      !Object.isExtensible(kit) || !mutable(root.children) ||
      ['colliders', 'walkables', 'owned', 'rooms', 'mapItems', 'regions', 'plaques'].some(k => !mutable(kit[k])) ||
      JSON.stringify(zone.bounds) !== '{"x0":-221.5,"x1":-69.15,"z0":205,"z1":526.5}') {
    throw Error('Untransformed mutable east-six host and unchanged source bounds required');
  }
}

/** One independently photographed front, not the complete second courtyard.
 * Coordinates, dimensions, hidden rear and simplified ornament are game fits.
 * Closed leaves reflect the photograph, not verified present-day admission.
 * No existing wall, gate, room, map target or collision owner is repurposed. */
export function buildXiangxuGlazedGate(kit, zone) {
  if (zone?.id !== 'east-six') return false;
  validate(kit, zone);
  const p = XIANGXU_GATE_FIT, frame = new T.Group();
  frame.name = ID;
  frame.position.set(p.x, 0, p.z);
  const geometries = new Set(), materials = new Set(), cache = new Map();
  const contacts = [], walkables = [];
  let published = false;
  const own = geometry => { geometries.add(geometry); return geometry; };
  const material = (name, color) => {
    const key = name + ':' + color;
    if (!cache.has(key)) {
      const m = new T.MeshStandardMaterial();
      materials.add(m);
      m.copy(kit.lib.material(name));
      m.name = 'xiangxu_' + key + '_project_fit';
      m.color.setHex(color);
      m.map = m.normalMap = null;
      cache.set(key, m);
    }
    return cache.get(key);
  };
  const mesh = (role, geometry, name, color, x = 0, y = 0, z = 0, walkable = false) => {
    own(geometry);
    const m = new T.Mesh(geometry, material(name, color));
    m.name = ID + '/' + role;
    m.position.set(x, y, z);
    m.userData = {xiangxuRole: role, xiangxuWalkable: walkable};
    m.castShadow = m.receiveShadow = true;
    frame.add(m);
    return m;
  };
  const box = (role, w, h, d, x, y, z, name, color, walkable = false) =>
    mesh(role, new T.BoxGeometry(w, h, d), name, color, x, y, z, walkable);
  // A closed, shaped roof volume. Upper tiles are coarse relief, not a count
  // of historical tiles, ridge animals or exact decorative patterns.
  const roof = (role, w, d, bottom, eave, rise, name, color) => {
    const nx = 16, nz = 10, vertices = [];
    const top = (x, z) => eave + rise * Math.max(0, Math.min(1 - Math.abs(z) / (d / 2), (w / 2 - Math.abs(x)) / (d / 2))) +
      .06 * (Math.abs(x) / (w / 2)) ** 6 * (Math.abs(z) / (d / 2)) ** 6;
    const point = (i, j, low = false) => {
      const x = -w / 2 + w * i / nx, z = -d / 2 + d * j / nz;
      return [x, low ? bottom : top(x, z), z];
    };
    const quad = (a, b, c, d, normal) => {
      for (const tri of [[a, b, c], [a, c, d]]) {
        const vs = tri.map(v => new T.Vector3(...v));
        if (new T.Triangle(...vs).getNormal(new T.Vector3()).dot(new T.Vector3(...normal)) < 0) [tri[1], tri[2]] = [tri[2], tri[1]];
        vertices.push(...tri.flat());
      }
    };
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      quad(point(i, j), point(i + 1, j), point(i + 1, j + 1), point(i, j + 1), [0, 1, 0]);
      quad(point(i, j, true), point(i + 1, j, true), point(i + 1, j + 1, true), point(i, j + 1, true), [0, -1, 0]);
    }
    for (let i = 0; i < nx; i++) {
      quad(point(i, 0, true), point(i + 1, 0, true), point(i + 1, 0), point(i, 0), [0, 0, -1]);
      quad(point(i, nz, true), point(i + 1, nz, true), point(i + 1, nz), point(i, nz), [0, 0, 1]);
    }
    for (let j = 0; j < nz; j++) {
      quad(point(0, j, true), point(0, j + 1, true), point(0, j + 1), point(0, j), [-1, 0, 0]);
      quad(point(nx, j, true), point(nx, j + 1, true), point(nx, j + 1), point(nx, j), [1, 0, 0]);
    }
    const g = own(new T.BufferGeometry());
    g.setAttribute('position', new T.Float32BufferAttribute(vertices, 3));
    g.computeVertexNormals();
    return mesh(role, g, name, color);
  };
  try {
    const stone = 0xc2b9a5, red = 0x9b4032, doorRed = 0x802e28, green = 0x41674a, yellow = 0xcba442, dark = 0x383329;
    // Independent short wings stop well before either existing courtyard wall.
    for (const side of [-1, 1]) {
      box('short-wing-stone-foot', 2.4, .35, .8, side * 4.30, .175, 0, 'stone_slab', stone);
      box('short-self-owned-wall', 2.4, 2.85, .7, side * 4.30, 1.775, 0, 'wall_red', red);
      const cap = roof('yellow-wing-cap', 2.5, 1.0, 3.18, 3.24, .25, 'roof_tile', yellow);
      cap.position.x = side * 4.35;
      box('pier-stone-foot', 1.65, .7, 1.8, side * 2.35, .35, 0, 'stone_slab', stone);
      box('pier-stone-upper-course', 1.75, .16, 1.9, side * 2.35, .78, 0, 'stone_slab', stone);
      box('red-pier-core', 1.5, 3.55, 1.3, side * 2.35, 2.635, 0, 'wall_red', red);
      box('ornamental-panel', 1.25, 2.65, .08, side * 2.35, 2.45, -.69, 'wall_red', red);
      box('green-jamb', .18, 3.57, .18, side * 1.55, 2.645, -.72, 'roof_tile', green);
      for (const dx of [-.63, .63]) box('yellow-panel-edge', .07, 2.75, .10, side * 2.35 + dx, 2.45, -.75, 'roof_tile', yellow);
      for (const y of [1.1, 3.8]) box('green-panel-band', 1.31, .19, .10, side * 2.35, y, -.75, 'roof_tile', green);
      const ornament = mesh('simplified-oval-ornament', new T.TorusGeometry(.40, .055, 6, 20), 'roof_tile', yellow, side * 2.35, 2.45, -.77);
      ornament.scale.y = 1.3;
      for (const y of [1.1, 2.45, 3.8]) mesh('simplified-panel-rosette', new T.OctahedronGeometry(.15), 'roof_tile', yellow, side * 2.35, y, -.80);
      // Two independent solid leaves meet at the centre. Their closed pose is
      // intentional; no old approach is redirected through this doorway.
      box('closed-leaf', 1.45, 3.35, .18, side * .725, 1.795, .10, 'wood_column', doorRed);
      for (let row = 0; row < 7; row++) for (let column = 0; column < 4; column++)
        mesh('coarse-door-stud', new T.OctahedronGeometry(.035), 'wood_column', dark, side * (.19 + column * .32), .45 + row * .45, -.01);
    }
    // The photographed upper doorway is solid. This simplified transom
    // closes only our own fitted front; its dimensions are not surveyed.
    box('solid-door-transom', 3.2, .87, 1.3, 0, 3.885, 0, 'wood_column', doorRed);
    box('threshold', 3.05, .12, 1.6, 0, .06, -.10, 'stone_slab', stone, true);
    box('low-front-tread', 2.5, .06, .65, 0, .03, -1.225, 'stone_slab', stone, true);
    box('green-header', 6.5, .35, 1.5, 0, 4.48, 0, 'roof_tile', green);
    box('green-upper-frieze', 6.6, .45, 1.55, 0, 4.88, 0, 'roof_tile', green);
    box('yellow-header-course', 6.65, .09, 1.65, 0, 4.28, 0, 'roof_tile', yellow);
    for (let i = 0; i < 11; i++) box('coarse-green-eave-block', .24, .16, 1.75, -3 + i * .6, 5.18, 0, 'roof_tile', green);
    roof('yellow-main-roof', 7.2, 2.9, 5.20, 5.30, .95, 'roof_tile', yellow);
    box('yellow-ridge', 4.25, .14, .18, 0, 6.31, 0, 'roof_tile', yellow);
    for (const side of [-1, 1]) box('simplified-ridge-end', .18, .30, .22, side * 2.20, 6.39, 0, 'roof_tile', yellow);
    frame.updateWorldMatrix(true, true);
    const reserve = new T.Box3(new T.Vector3(-142, -1e-6, 205), new T.Vector3(-127, 9, 209));
    frame.traverse(m => {
      if (!m.isMesh) return;
      const bounds = new T.Box3().setFromObject(m);
      if (!reserve.containsBox(bounds)) throw Error('Xiangxu solid escaped its bounded fit reserve');
      // The two actual axis-aligned low stone boxes use the established
      // step-clearance path, like Dunben's solid treads. Their bounds and top
      // are the visible stone itself, never a ramp or an enlarged proxy.
      if (m.userData.xiangxuWalkable) {
        const contact = bounds.clone(); contact.xiangxuMesh = m.uuid;
        contacts.push(contact);
        const top = bounds.clone(); top.min.y = top.max.y;
        walkables.push({type: 'box', box: top, rescue: false, xiangxuMesh: m.uuid});
        return;
      }
      // Other solids retain exact triangles. Keep coordinates local and apply
      // translation only once rather than quantising palace coordinates.
      const g = own(m.geometry.clone());
      g.applyMatrix4(m.matrix);
      const shape = triangleInstance(createTriangleTemplate(g), [p.x, 0, p.z], m.name + '/' + m.uuid);
      g.dispose(); geometries.delete(g);
      const contact = shape.box.clone();
      contact.triangleSupport = shape;
      contact.xiangxuMesh = m.uuid;
      contacts.push(contact);
    });
    const meta = {
      id: ID, sourceObjectId: SOURCE_ID, name: '祥旭门',
      scope: 'LIMITED_CLOSED_GATE_FRONT_AND_OWN_SHORT_WINGS', portalCount: 1, leafCount: 2,
      source: 'https://www.dpm.org.cn/Uploads/pdf/5067/T00112_00.pdf', sourcePage: 112,
      regionPlan: 'https://img.dpm.org.cn/Uploads/File/2021/09/15/u6141698d36e1d.pdf', regionPlanPage: 110,
      pose: 'CLOSED_PHOTOGRAPH_DATE_UNKNOWN', surveyed: false, wholeObjectAccepted: false,
      compoundComplete: false, currentAdmissionVerified: false, newMapItems: 0, newRooms: 0,
      sourceSupported: ['Captioned Xiangxu front: yellow glazed top, green frame, paired ornamental side panels, closed red leaves and pale stone feet', 'Named plan places Xiangxu before the Dunben courtyard; Qianxing is a separate gate'],
      fitted: ['All game coordinates, dimensions, hidden rear, roof profile and colors', 'Coarse oval panels, rosettes, studs, eave blocks and ridge ends, not a measured motif or inventory', 'Independent short wings only; no connection to old walls or reconstruction of the full second courtyard'],
      unknown: ['Photograph date, measured footprint, hidden elevations and exact ornament', 'Present-day door pose, public admission and full-world/browser appearance'],
      excluded: ['Qianxing Gate, full first/second courtyards and connecting walls', 'New interior, map marker, travel target or changed original routes'],
    };
    frame.userData.structure = meta;
    const saved = {c: kit.colliders.length, w: kit.walkables.length, o: kit.owned.length};
    try {
      kit.root.add(frame);
      kit.colliders.push(...contacts);
      kit.walkables.push(...walkables);
      kit.owned.push(...materials);
      done.add(kit); published = true;
      return {frame, meta};
    } catch (error) {
      if (frame.parent === kit.root) {
        const index = kit.root.children.indexOf(frame);
        if (index >= 0) kit.root.children.splice(index, 1);
        frame.parent = null;
      }
      kit.colliders.length = saved.c; kit.walkables.length = saved.w; kit.owned.length = saved.o;
      throw error;
    }
  } catch (error) {
    if (!published) {
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    }
    throw error;
  }
}
