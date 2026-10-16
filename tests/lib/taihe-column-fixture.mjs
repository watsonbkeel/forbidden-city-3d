import {withoutColumnUV} from './taihe-column-material-retention.mjs';
import fs from 'node:fs';
export const read = path => fs.readFileSync(new URL('../../' + path, import.meta.url));
export const profile = JSON.parse(read('data/architecture/taihe-core.json'));
export const centres = profile.columns.x.flatMap(x => profile.columns.goldZ.map(z => [x, z]));
export function decode(bytes) {
  const length = bytes.readUInt32LE(12), gltf = JSON.parse(bytes.toString('utf8', 20, 20 + length));
  const binary = 28 + length;
  const types = {5126: ['readFloatLE', 4], 5125: ['readUInt32LE', 4], 5123: ['readUInt16LE', 2], 5121: ['readUInt8', 1]};
  function accessor(index) {
    const a = gltf.accessors[index], v = gltf.bufferViews[a.bufferView], [method, size] = types[a.componentType];
    const n = {SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4}[a.type];
    return Array.from({length: a.count}, (_, i) => Array.from({length: n}, (_, k) => bytes[method](binary + (v.byteOffset ?? 0) + (a.byteOffset ?? 0) + i * (v.byteStride ?? size * n) + k * size)));
  }
  const triangles = [];
  for (const mesh of gltf.meshes) for (const p of mesh.primitives) {
    const attributes = Object.fromEntries(Object.entries(p.attributes).map(([name, i]) => [name, accessor(i)]));
    const indices = accessor(p.indices).flat(), material = gltf.materials[p.material].name;
    for (let i = 0; i < indices.length; i += 3) triangles.push({material, vertices: indices.slice(i, i + 3).map(j => Object.fromEntries(Object.entries(attributes).map(([name, rows]) => [name, rows[j]])))});
  }
  const contract = gltf.nodes.find(n => n.name === 'TAIHE_CORE_CONTRACT').extras;
  return {gltf, triangles, contract, inventory: JSON.parse(contract.inventory)};
}
export const baseline = decode(read('public/models/interiors/taihe-v16-ba59e7321fda.glb'));
export const config = JSON.parse(read('data/interiors/taihe.json'));
export const candidate = decode(read('public' + config.model));
export const position = v => v.POSITION;
export const radial = (p, c) => Math.hypot(p[0] - c[0], p[2] - c[1]);
export const near = (a, b, eps = 1e-5) => Math.abs(a - b) < eps;
export const onShaftEnd = p => near(p[1], .2) || near(p[1], profile.columns.height);
export const columnIndex = t => ['taihe_gold', 'taihe_dark_gold'].includes(t.material) ? centres.findIndex(c => t.vertices.every(v => {const p=position(v); return p[1] >= .19999 && p[1] <= profile.columns.height + 1e-5 && radial(p,c) <= .52001;})) : -1;
export const isShaft = t => t.material === 'taihe_gold' && columnIndex(t) >= 0 && t.vertices.every(v => onShaftEnd(position(v)) && near(radial(position(v), centres[columnIndex(t)]), .5));
export function canonical(t, attributes = true) {
  const values = t.vertices.map(v => JSON.stringify(attributes ? (t.material==='taihe_gold'?withoutColumnUV(v):v) : position(v)));
  return t.material + ':' + [0,1,2].map(i => values.slice(i).concat(values.slice(0,i)).join(';')).sort()[0];
}
export const geometry = (ts, attributes = true) => ts.map(t => canonical(t, attributes)).sort();
export function triangleNormal(t) {
  const [a,b,c]=t.vertices.map(position), u=b.map((v,k)=>v-a[k]), v=c.map((q,k)=>q-a[k]);
  return [u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
}
