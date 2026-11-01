// Lightweight synchronous integrity fingerprint for this one fixed optional
// asset. Full file SHA256 is independently bound by the build/resource tests.
// This catches equal-count geometry/UV/transform drift; it is not a signature
// for untrusted downloadable models or a general cryptographic authenticator.
function bytesHash(array){if(!ArrayBuffer.isView(array))throw Error('Qianqing requires typed geometry attributes');const b=new Uint8Array(array.buffer,array.byteOffset,array.byteLength);let h=2166136261;for(const n of b)h=Math.imul(h^n,16777619);return(h>>>0).toString(16).padStart(8,'0');}
export function qianqingVisibleSignatures(root){
 root.updateMatrixWorld(true);const rows=[],names=new Set();
 root.traverse(o=>{if(!o.isMesh||/^(COL_|WALK_)/.test(o.name))return;if(names.has(o.name))throw Error('Duplicate Qianqing visible batch');names.add(o.name);const g=o.geometry,m=o.material;if(Array.isArray(m))throw Error('Qianqing expects one material per batch');
  rows.push({name:o.name,matrix:o.matrixWorld.toArray(),attributes:Object.fromEntries(Object.entries(g.attributes).sort(([a],[b])=>a.localeCompare(b)).map(([k,a])=>[k,{type:a.array.constructor.name,count:a.count,itemSize:a.itemSize,normalized:a.normalized,hash:bytesHash(a.array)}])),index:g.index?{type:g.index.array.constructor.name,count:g.index.count,hash:bytesHash(g.index.array)}:null,material:{name:m.name,color:m.color.toArray(),roughness:m.roughness,metalness:m.metalness}});
 });return rows.sort((a,b)=>a.name.localeCompare(b.name));
}
