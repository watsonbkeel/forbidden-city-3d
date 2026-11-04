// Bounded synchronous drift guard for the version-controlled optional asset.
// Not authentication for untrusted models; the full GLB SHA is checked in tests.
function hash(a) { let h=2166136261; for(const v of new Uint8Array(a.buffer,a.byteOffset,a.byteLength)) h=Math.imul(h^v,16777619); return(h>>>0).toString(16); }
export function yangxinPartitionSignature(m) {
 const g=m.geometry,a=m.material;
 return {matrix:m.matrix.toArray(),attributes:Object.fromEntries(Object.entries(g.attributes).sort(([a],[b])=>a.localeCompare(b)).map(([k,a])=>[k,{type:a.array.constructor.name,itemSize:a.itemSize,normalized:a.normalized,count:a.count,hash:hash(a.array)}])),index:{type:g.index.array.constructor.name,normalized:g.index.normalized,count:g.index.count,hash:hash(g.index.array)},material:{name:a.name,color:a.color.toArray(),roughness:a.roughness,metalness:a.metalness,side:a.side,transparent:a.transparent,opacity:a.opacity,depthWrite:a.depthWrite}};
}
