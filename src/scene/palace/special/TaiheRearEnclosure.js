import * as THREE from 'three';
import { applyBoxUV } from '../../../utils/GeometryUV.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Museum northern-elevation scan (2011, p150, fig12) and the museum green
// guide establish three central door bays with solid flanks. Inner pale finish
// and lower green-grey band are visible in museum photograph dc/14498.jpg.
// Existing wall line/opening are retained; thickness, band height and colours
// below are model estimates, not measurements or a dated conservation record.
export const TAIHE_REAR_FINISH = Object.freeze({ thickness: .5, dadoHeight: 1,
  plaster: '#d8d3c3', dado: '#536d5a' });

export function buildTaiheRearEnclosure(builder, group, { x0, zf, y, w, openHalf, openLeft = -openHalf, openRight = openHalf, height }) {
  const q = TAIHE_REAR_FINISH;
  const red = builder.library.material('wall_red');
  const inner = builder.ownMat('taihe-rear-plaster', {
    color: 0xffffff, vertexColors: true, roughness: .96, metalness: 0,
  });
  const linings = [];
  for (const side of [-1, 1]) {
    const left = side < 0 ? -w / 2 : openRight;
    const right = side < 0 ? openLeft : w / 2;
    const width = right - left, xc = x0 + (left + right) / 2;
    const geo = applyBoxUV(new THREE.BoxGeometry(width, height, q.thickness), builder.library.tileSize('wall_red'));
    const normal = geo.attributes.normal, indices = [];
    for (let i = 0; i < (geo.index?.count ?? normal.count); i += 3) {
      const id = k => geo.index ? geo.index.getX(k) : k;
      if (normal.getZ(id(i)) < -.99) continue; // replaced, never overlaid
      for (let j = 0; j < 3; j++) indices.push(id(i + j));
    }
    geo.setIndex(indices); geo.clearGroups();
    const outer = new THREE.Mesh(geo, red);
    outer.position.set(xc, y + height / 2, zf);
    outer.castShadow = true; outer.receiveShadow = true;
    outer.userData.taiheRearEnclosure = 'solid-red-exterior'; group.add(outer);

    const positions = [], normals = [], colors = [], uvs = [];
    for (const [bottom, top, hex] of [[0, q.dadoHeight, q.dado], [q.dadoHeight, height, q.plaster]]) {
      const c = new THREE.Color(hex);
      // Viewed from inside the hall (-Z): outward normal -Z, non-overlapping faces.
      for (const [x, h] of [[-width/2,bottom],[-width/2,top],[width/2,top],
        [-width/2,bottom],[width/2,top],[width/2,bottom]]) {
        positions.push(x,h,-q.thickness/2); normals.push(0,0,-1);
        colors.push(c.r,c.g,c.b); uvs.push((x+width/2)/width,h/height);
      }
    }
    const face = new THREE.BufferGeometry();
    face.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    face.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
    face.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    face.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    face.translate(xc,y,zf); linings.push(face);
  }
  // The generic hall batcher intentionally strips colour attributes. Keep one
  // already-combined, eight-triangle lining mesh so this local finish survives
  // batching without changing the global merger or adding two draw calls.
  const lining = new THREE.Mesh(mergeGeometries(linings,false),inner);
  linings.forEach(g=>g.dispose());
  lining.castShadow = true; lining.receiveShadow = true;
  lining.userData.taiheRearEnclosure = 'pale-interior';
  lining.userData.noMerge = true; group.add(lining);
}
