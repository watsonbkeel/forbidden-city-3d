import * as THREE from 'three';
import { TAIHE_CORE as P } from './TaiheCoreProfile.js';
import { taiheCeilingMaterial } from './TaiheCeilingMaterial.js';

// The museum's throne and caisson photographs establish recessed panels and
// physical frame sides. Width/depth below are visual estimates, not a survey.
// Keep the existing 1.6 m artwork cadence, central column stations and opening.
export const TAIHE_COFFER_TRIAL = Object.freeze({ cadence: 1.6, width: .12, drop: .18 });

export function taiheCofferBars() {
  const q = TAIHE_COFFER_TRIAL, half = q.width / 2;
  const x0 = P.columns.x[0], x1 = P.columns.x[1];
  const z0 = P.columns.redCompanionZ, z1 = P.columns.goldZ.at(-1);
  const hole = { x0: -P.caisson.nominalSpan / 2, x1: P.caisson.nominalSpan / 2,
    z0: P.caisson.z - P.caisson.nominalSpan / 2, z1: P.caisson.z + P.caisson.nominalSpan / 2 };
  const bars = [];
  const add = (axis, station, a, b) => { if (b - a > .00001) bars.push({ axis, station, a, b }); };
  for (let k = Math.ceil(x0 / q.cadence); k <= Math.floor(x1 / q.cadence); k++) {
    const x = k * q.cadence;
    if (x + half > hole.x0 && x - half < hole.x1) {
      add('z', x, z0, hole.z0); add('z', x, hole.z1, z1);
    } else add('z', x, z0, z1);
  }
  for (let k = Math.ceil(z0 / q.cadence); k <= Math.floor(z1 / q.cadence); k++) {
    const z = k * q.cadence;
    if (z + half > hole.z0 && z - half < hole.z1) {
      add('x', z, x0, hole.x0); add('x', z, hole.x1, x1);
    } else add('x', z, x0, x1);
  }
  return bars;
}

export function taiheCofferBarGeometry(bar) {
  const q = TAIHE_COFFER_TRIAL, longitudinal = bar.axis === 'z';
  const w = longitudinal ? q.width : bar.b - bar.a;
  const d = longitudinal ? bar.b - bar.a : q.width;
  const x = longitudinal ? bar.station : (bar.a + bar.b) / 2;
  const z = longitudinal ? (bar.a + bar.b) / 2 : bar.station;
  const g = new THREE.BoxGeometry(w, q.drop, d), indices = [];
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < g.index.count; i += 3) {
    if (n.getY(g.index.getX(i)) > .99) continue; // hidden against retained panel plane
    for (let j = 0; j < 3; j++) indices.push(g.index.getX(i + j));
  }
  for (let i = 0; i < p.count; i++) {
    const X = x + p.getX(i), Z = z + p.getZ(i);
    // Both crossing undersides use one global mapping. Their shared surface
    // therefore has exactly the same normal/artwork, never competing patterns.
    if (Math.abs(n.getY(i)) > .99) uv.setXY(i, X / q.cadence, Z / q.cadence);
    else {
      const border = .025 + .05 * (p.getY(i) / q.drop + .5);
      uv.setXY(i, longitudinal ? border : X / q.cadence, longitudinal ? Z / q.cadence : border);
    }
  }
  g.setIndex(indices); g.clearGroups();
  g.translate(x, P.ceilingY - q.drop / 2, z);
  return g;
}

export function buildTaiheCofferFrame(builder, parent, { x0, z0, y }) {
  const material = taiheCeilingMaterial(builder);
  for (const bar of taiheCofferBars()) {
    const mesh = new THREE.Mesh(taiheCofferBarGeometry(bar), material);
    mesh.position.set(x0, y, z0);
    mesh.name = 'taihe-central-coffer-frame';
    mesh.userData.taihePermanent = 'coffer-frame';
    mesh.userData.taiheCofferBar = { ...bar };
    mesh.castShadow = true; mesh.receiveShadow = true;
    parent.add(mesh);
  }
}
