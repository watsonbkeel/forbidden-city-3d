import {createHash}from'node:crypto';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const replacer=(_,v)=>typeof v==='string'?v.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,'<uuid>'):v;
export const hash=v=>sha(JSON.stringify(v,replacer));
export function snapshot(kit,roots=kit.root.children,counts={colliders:kit.colliders.length,walkables:kit.walkables.length}){
 const rows=[];for(const root of roots){root.updateWorldMatrix(true,true);root.traverse(m=>{if(!m.isMesh)return;rows.push({name:m.name,matrix:m.matrixWorld.toArray(),attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,{itemSize:a.itemSize,normalized:a.normalized,type:a.array.constructor.name,count:a.count,sha256:sha(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength))}])),index:m.geometry.index?sha(Buffer.from(m.geometry.index.array.buffer,m.geometry.index.array.byteOffset,m.geometry.index.array.byteLength)):null,material:(Array.isArray(m.material)?m.material:[m.material]).map(m=>m?({name:m.name,color:m.color?.getHex(),side:m.side}):null)});});}
 return{meshes:rows,colliders:hash(kit.colliders.slice(0,counts.colliders)),walkables:hash(kit.walkables.slice(0,counts.walkables)),rooms:hash(kit.rooms),mapItems:hash(kit.mapItems),regions:hash(kit.regions),plaques:hash(kit.plaques.map(p=>Object.fromEntries(Object.entries(p).map(([k,v])=>[k,v?.isObject3D?{objectUUID:v.uuid,objectName:v.name}:v]))))};
}
