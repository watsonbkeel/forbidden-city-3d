import * as THREE from 'three';

const SIZES = Object.freeze({ position: 3, normal: 3, uv: 2 });
const TYPES = new Set([THREE.BufferAttribute, THREE.Float32BufferAttribute]);
function standardAttribute(attribute, size, count) {
  if (!attribute || !TYPES.has(attribute.constructor) || attribute.isInterleavedBufferAttribute ||
      attribute.array?.constructor !== Float32Array || attribute.itemSize !== size ||
      attribute.normalized !== false || attribute.usage !== THREE.StaticDrawUsage ||
      attribute.gpuType !== THREE.FloatType || attribute.count !== count ||
      attribute.array.length !== count * size ||
      ['getX','getY','getZ','getW','clone','copy'].some(name => attribute[name] !== THREE.BufferAttribute.prototype[name])) return false;
  for (const value of attribute.array) if (!Number.isFinite(value)) return false;
  return true;
}
function standardRecord(record) {
  if (!record || typeof record !== 'object') return 0;
  const { geometry: g, matrix } = record;
  if (!g?.isBufferGeometry || matrix?.constructor !== THREE.Matrix4 || !Array.isArray(matrix.elements) || matrix.elements.length !== 16 || !matrix.elements.every(Number.isFinite) ||
      g.constructor !== THREE[g.type] || g.copy !== THREE[g.type]?.prototype.copy ||
      g.applyMatrix4 !== THREE.BufferGeometry.prototype.applyMatrix4 ||
      !g.morphAttributes || g.morphTargetsRelative || Object.keys(g.morphAttributes).length ||
      g.drawRange.start !== 0 || g.drawRange.count !== Infinity ||
      g.clone !== THREE.BufferGeometry.prototype.clone ||
      g.toNonIndexed !== THREE.BufferGeometry.prototype.toNonIndexed ||
      Object.keys(g.attributes).length !== 3 ||
      !Object.keys(g.attributes).every(name => Object.hasOwn(SIZES, name) &&
        Object.hasOwn(Object.getOwnPropertyDescriptor(g.attributes, name), 'value'))) return 0;
  const count = g.attributes.position?.count;
  if (!Number.isSafeInteger(count) || count < 3 ||
      !Object.entries(SIZES).every(([name, size]) => standardAttribute(g.attributes[name], size, count))) return 0;
  const index = g.index;
  if (!index) return count % 3 === 0 ? count : 0;
  if (!(index.array?.constructor === Uint16Array || index.array?.constructor === Uint32Array) ||
      index.isInterleavedBufferAttribute || index.itemSize !== 1 || index.normalized !== false ||
      index.usage !== THREE.StaticDrawUsage || index.gpuType !== THREE.FloatType ||
      index.count !== index.array.length || !Number.isSafeInteger(index.count) ||
      !index.count || index.count % 3 !== 0) return 0;
  for (const value of index.array) if (value >= count) return 0;
  return index.count;
}

/** Try a whole-bucket direct equivalent of clone/toNonIndexed -> applyMatrix4
 * -> mirrored winding -> mergeGeometries(false). Unsupported data returns null
 * before allocating output or mutating/disposal of any source. Groups are not
 * copied, exactly as the existing merge(false) result; partial drawRange is
 * deliberately left to the original path. Ownership remains with the caller.
 */
export function tryMergeTransformedFloat32(records) {
  if (!Array.isArray(records) || !records.length) return null;
  const counts = records.map(standardRecord);
  if (counts.some(count => count === 0)) return null;
  const count = counts.reduce((sum, n) => sum + n, 0);
  if (!Number.isSafeInteger(count) || count * 3 > 0x7fffffff) return null;
  const position = new Float32Array(count * 3), normal = new Float32Array(count * 3), uv = new Float32Array(count * 2);
  const point = new THREE.Vector3(), direction = new THREE.Vector3(), normalMatrix = new THREE.Matrix3();
  let offset = 0;
  for (let r = 0; r < records.length; r++) {
    const { geometry, matrix } = records[r], a = geometry.attributes, index = geometry.index?.array;
    normalMatrix.getNormalMatrix(matrix);
    const mirrored = matrix.determinant() < 0;
    for (let out = 0; out < counts[r]; out++) {
      const lane = out % 3;
      const source = mirrored && lane !== 0 ? out + (lane === 1 ? 1 : -1) : out;
      const vertex = index ? index[source] : source;
      // Match Three's double arithmetic exactly; only the final typed-array
      // assignment rounds. No affine shortcut or alternative normalization.
      point.fromBufferAttribute(a.position, vertex).applyMatrix4(matrix);
      direction.fromBufferAttribute(a.normal, vertex).applyNormalMatrix(normalMatrix);
      const p = (offset + out) * 3, t = (offset + out) * 2;
      position[p] = point.x; position[p + 1] = point.y; position[p + 2] = point.z;
      normal[p] = direction.x; normal[p + 1] = direction.y; normal[p + 2] = direction.z;
      uv[t] = a.uv.getX(vertex); uv[t + 1] = a.uv.getY(vertex);
    }
    offset += counts[r];
  }
  const merged = new THREE.BufferGeometry();
  // Preserve original first-geometry attribute insertion order.
  const arrays = { position, normal, uv };
  for (const name of Object.keys(records[0].geometry.attributes)) merged.setAttribute(name, new THREE.BufferAttribute(arrays[name], SIZES[name], false));
  return merged;
}
