import * as THREE from 'three';
import { buildRoof } from '../../RoofBuilder.js';
import { applyPlanarUV } from '../../../utils/GeometryUV.js';
import {buildJiaotaiCeiling} from './JiaotaiCentralInterior.js';
import {buildJiaotaiDisplaySetting} from './JiaotaiDisplaySetting.js';
import {buildZhongheDisplaySetting} from './ZhongheDisplaySetting.js';

/**
 * Evidence-led enclosure topologies, not a claim of survey-grade dimensions.
 * Bay/portal arrangement: Palace Museum building descriptions and photographs.
 * Widths retain the project footprint; veranda depth/column height/roof rise are
 * provisional visual proportions, independently recorded in the building cards.
 */
export const SQUARE_HALLS = {
  中和殿: {
    id: 'zhonghedian', storeys: 1, eaveCount: 1, bodyH: 6.6, roofH: 7.8,
    veranda: { depth: 3, outerBays: 5 },
    facades: {
      south: ['closed-door', 'door', 'closed-door'], north: ['window', 'door', 'window'],
      east: ['window', 'door', 'window'], west: ['window', 'door', 'window'],
    },
    innerPlaque: '允执厥中',
  },
  交泰殿: {
    id: 'jiaotaidian', storeys: 1, eaveCount: 1, bodyH: 6.2, roofH: 5.2,
    veranda: null,
    facades: {
      south: ['window', 'door', 'window'], north: ['wall', 'door', 'wall'],
      east: ['wall', 'door', 'wall'], west: ['wall', 'door', 'wall'],
    },
    innerPlaque: '无为',
  },
};

/** Build an independently configured square hall at its existing terrace level. */
export function buildSquareHall(builder, parent, data, y) {
  const spec = SQUARE_HALLS[data.name];
  if (!spec) throw new Error(`Unknown square hall: ${data.name}`);
  const { width: w, depth: d } = data.dimensions;
  const x0 = data.position.x, z0 = data.position.z;
  const vd = spec.veranda?.depth ?? 0;
  const iw = w - 2 * vd, id = d - 2 * vd;
  const H = spec.bodyH, beamH = 0.62, wallH = H - beamH;
  const doorH = wallH * 0.85, r = 0.34;
  const shell = new THREE.Group();
  shell.name = `${data.name}·现状结构`;
  parent.add(shell);
  const record = {
    id: spec.id, storeys: spec.storeys, eaveCount: spec.eaveCount,
    bayWidths: Array(3).fill(iw / 3), depthBayWidths: Array(3).fill(id / 3),
    facades: structuredClone(spec.facades), veranda: spec.veranda ? { ...spec.veranda } : null,
    portals: [], floorY: y, bodyH: H, roofH: spec.roofH,
    dimensionStatus: 'provisional', topologyStatus: 'source-compared',
  };
  if (data.name === '中和殿') record.ceilingEvidence = {source:'https://www.dpm.org.cn/explore/building/236464.html', image:'https://img.dpm.org.cn/Uploads/Picture/dc/1569.jpg', form:'continuous-panelled-flat-ceiling', removed:'generic-suspended-caisson-and-mirror', imageCaptureDate:'unknown', paintedDetail:'existing-approximation', accepted:false};
  shell.userData.structure = record;
  const colMat = builder.library.material('wood_column');
  const columnGeometry = new THREE.CylinderGeometry(r, r * 1.05, H, 14);
  const columns = new Set();
  const column = (x, z, label) => {
    const key = `${x.toFixed(4)},${z.toFixed(4)}`;
    if (columns.has(key)) return;
    columns.add(key);
    const m = new THREE.Mesh(columnGeometry, colMat);
    m.name = label;
    m.position.set(x0 + x, y + H / 2, z0 + z);
    m.castShadow = true;
    shell.add(m);
    builder.col(x0 + x - r, y, z0 + z - r, x0 + x + r, y + 3, z0 + z + r);
    builder.libBox(shell, 'marble', r * 2.3, 0.18, r * 2.3, x0 + x, y + 0.09, z0 + z);
  };
  // Three-bay inner enclosure and five-bay outer column ring are separate.
  for (let k = 0; k <= 3; k++) {
    for (const s of [-1, 1]) {
      column(-iw / 2 + k * iw / 3, s * id / 2, '内殿柱');
      column(s * iw / 2, -id / 2 + k * id / 3, '内殿柱');
    }
  }
  if (spec.veranda) {
    // Outer intervals align with the inner three bays, with a narrow gallery bay
    // at each end. They are not five equal bays inferred from total width.
    const xs = [-w / 2, -iw / 2, -iw / 6, iw / 6, iw / 2, w / 2];
    const zs = [-d / 2, -id / 2, -id / 6, id / 6, id / 2, d / 2];
    for (const x of xs) for (const s of [-1, 1]) column(x, s * d / 2, '外廊檐柱');
    for (const z of zs) for (const s of [-1, 1]) column(s * w / 2, z, '外廊檐柱');
  }

  function facade(side, types) {
    const alongX = side === 'south' || side === 'north';
    const length = alongX ? iw : id;
    const bay = length / 3;
    const normal = side === 'south' || side === 'east' ? -1 : 1;
    const point = (u, offset = 0) => alongX
      ? [x0 + u, z0 + normal * (id / 2 + offset)]
      : [x0 + normal * (iw / 2 + offset), z0 + u];
    const panel = (material, width, height, thickness, u, cy, offset = 0, mode = 'band') => {
      const [x, z] = point(u, offset);
      const mesh = builder.libBox(shell, material,
        alongX ? width : thickness, height, alongX ? thickness : width, x, cy, z, mode);
      mesh.name = `${side}·${material}`;
      return mesh;
    };
    const block = (u, width) => {
      const [x, z] = point(u);
      builder.col(x - (alongX ? width / 2 : 0.28), y, z - (alongX ? 0.28 : width / 2),
        x + (alongX ? width / 2 : 0.28), y + 3, z + (alongX ? 0.28 : width / 2));
    };
    types.forEach((type, k) => {
      const u = (k - 1) * bay, clear = bay - r * 2;
      if (type === 'door') {
        const [px, pz] = point(u);
        record.portals.push({ side, center: [px, pz], width: clear, leafCount: 4, state: 'open-for-playable-route', floorY: y });
        // Four leaves, two folded at each jamb. Open leaves sit inside and beside
        // the aperture rather than replacing an entire three-bay facade.
        for (const s of [-1, 1]) for (let leaf = 0; leaf < 2; leaf++) {
          const leafW = clear / 4;
          const [x, z] = point(u + s * (clear / 2 - 0.05 - leaf * 0.12), -leafW / 2 - 0.05);
          const m = builder.libBox(shell, 'lattice_doors', alongX ? 0.1 : leafW,
            doorH, alongX ? leafW : 0.1, x, y + doorH / 2, z, 'band');
          m.name = `${side}·门扇${leaf + 1}`;
          m.userData = { role: 'door-leaf', side, state: 'open' };
          builder.col(x - (alongX ? 0.05 : leafW / 2), y, z - (alongX ? leafW / 2 : 0.05),
            x + (alongX ? 0.05 : leafW / 2), y + doorH, z + (alongX ? leafW / 2 : 0.05));
        }
        panel('wood_column', clear, 0.2, 0.3, u, y + 0.1, 0, 'box');
      } else if (type === 'closed-door') {
        const [px, pz] = point(u);
        record.portals.push({ side, center: [px, pz], width: clear, leafCount: 4, state: 'closed', floorY: y });
        for (let leaf = 0; leaf < 4; leaf++) {
          const m = panel('lattice_doors', clear / 4 - 0.025, doorH, 0.18,
            u - clear / 2 + (leaf + 0.5) * clear / 4, y + doorH / 2);
          m.name = `${side}·关闭隔扇${leaf + 1}`;
          m.userData = { role: 'door-leaf', side, state: 'closed' };
        }
        block(u, bay);
      } else if (type === 'window') {
        const sillH = 1.2;
        panel('wall_brick', clear, sillH, 0.5, u, y + sillH / 2, 0, 'box');
        panel('lattice_doors', clear, doorH - sillH, 0.18, u, y + sillH + (doorH - sillH) / 2);
        block(u, bay);
      } else if (type === 'wall') {
        panel('wall_red', clear, doorH, 0.5, u, y + doorH / 2, 0, 'box');
        panel('wall_brick', clear + 0.04, 1.0, 0.56, u, y + 0.5, 0, 'box');
        block(u, bay);
      } else throw new Error(`Unsupported facade ${side}: ${type}`);
    });
    panel('wall_red', length, wallH - doorH, 0.35, 0, y + doorH + (wallH - doorH) / 2, 0, 'box');
    panel('caihua_beam', length + 0.3, beamH, 0.5, 0, y + H - beamH / 2);
  }
  for (const [side, types] of Object.entries(spec.facades)) facade(side, types);

  if (spec.veranda) for (const s of [-1, 1]) {
    builder.libBox(shell, 'caihua_beam', w + 0.4, beamH, 0.5, x0, y + H - beamH / 2, z0 + s * d / 2, 'band');
    builder.libBox(shell, 'caihua_beam', 0.5, beamH, d + 0.4, x0 + s * w / 2, y + H - beamH / 2, z0, 'band');
  }

  const floorGeo = new THREE.PlaneGeometry(w, d);
  floorGeo.rotateX(-Math.PI / 2);
  applyPlanarUV(floorGeo, 'y', 1.4);
  const floor = new THREE.Mesh(floorGeo, builder.library.material('stone_slab', { color: 0x55524e, roughness: 0.8 }));
  floor.position.set(x0, y + 0.03, z0);
  floor.receiveShadow = true;
  shell.add(floor);
  const centralFrame = data.name === '交泰殿' ? buildJiaotaiCeiling(builder,shell,{x0,z0,y,w,d,H}) : null;
  if (!centralFrame) {
  const ceilingGeo = new THREE.PlaneGeometry(w, d);
  ceilingGeo.rotateX(Math.PI / 2);
  applyPlanarUV(ceilingGeo, 'y', 1.6);
  const ceiling = new THREE.Mesh(ceilingGeo, builder.ceilingMaterial());
  ceiling.position.set(x0, y + H - 0.03, z0);
  shell.add(ceiling);
  }

  // Retain a simplified ceremonial interior while keeping a rear circulation
  // strip, so four doors describe physical openings instead of decorative paint.
  // Leave enough space behind the simplified throne for a full player diameter
  // and the inward-folded door leaves. The interior furniture is provisional.
  // Zhonghe: DPM building 236464 and its matched interior photograph 1569.jpg
  // show continuous panelled ceiling, not this shared suspended caisson/mirror.
  // This corrects only the incompatible default; painted detail remains approximate.
  const ztb1 = z0 + id / 2 - 3.1;
  const ztb0 = ztb1 - Math.min(5.2, id * 0.28);
  if (data.name === '交泰殿') buildJiaotaiDisplaySetting(builder,shell,{x0,y,H,ztb0,ztb1,thW:Math.min(5.0,iw*.24),bayW:iw/3});
  else buildZhongheDisplaySetting(builder,shell,{x0,z0,y,H,ztb0,ztb1,thW:Math.min(5.0,iw*.24),bayW:iw/3});
  const plaqueH = 1.75;
  const plaque = builder.plaqueMesh(data.name, plaqueH * 0.62, plaqueH, true);
  plaque.position.set(x0, y + H - plaqueH * 0.25, z0 - d / 2 - 0.45);
  plaque.rotation.y = Math.PI;
  shell.add(plaque);
  const roof = buildRoof(builder.library, {
    type: 'pavilion', width: w + 0.4, depth: d + 0.4,
    baseY: y + H, layers: spec.eaveCount, brackets: true, sides: 4,
    height: spec.roofH, overhang: spec.veranda ? 2.2 : 2.5,
    ...(centralFrame ? {jiaotaiCeilingOpening:centralFrame} : {}),
  });
  roof.name = `${data.name}·单檐攒尖顶`;
  roof.position.set(x0, 0, z0);
  shell.add(roof);
  builder.ownedMaterials.push(...(roof.userData.ownedMaterials ?? []));
  return shell;
}
