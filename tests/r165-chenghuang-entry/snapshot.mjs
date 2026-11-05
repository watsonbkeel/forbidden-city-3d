import {snapshot as inherited} from '../r165-yangxin-companions/compound-snapshot.mjs';import {hash} from '../r164-three-entry-navigation/snapshot.mjs';
// Additional declared material evidence. UUID/id identities are checked as
// reference prefixes by consumers; all enumerable scalar/object material values
// are retained, and textures retain their production sampling/source dimensions.
function value(v,seen=new WeakMap(),path='root'){
 if(v===null||typeof v!=='object')return v;
 if(ArrayBuffer.isView(v))return {type:v.constructor.name,values:Array.from(v)};
 if(v.isTexture)return {type:v.constructor.name,name:v.name,format:v.format,typeCode:v.type,colorSpace:v.colorSpace,channel:v.channel,wrapS:v.wrapS,wrapT:v.wrapT,repeat:v.repeat.toArray(),offset:v.offset.toArray(),center:v.center.toArray(),rotation:v.rotation,matrix:v.matrix.toArray(),matrixAutoUpdate:v.matrixAutoUpdate,flipY:v.flipY,premultiplyAlpha:v.premultiplyAlpha,unpackAlignment:v.unpackAlignment,generateMipmaps:v.generateMipmaps,anisotropy:v.anisotropy,minFilter:v.minFilter,magFilter:v.magFilter,compareFunction:v.compareFunction,sourceDimensions:[v.image?.width??null,v.image?.height??null],userData:v.userData};
 if(seen.has(v))return {reference:seen.get(v)};seen.set(v,path);
 if(Array.isArray(v))return v.map((q,i)=>value(q,seen,path+'/'+i));
 return Object.fromEntries(Object.keys(v).sort().filter(k=>!['id','uuid','_listeners'].includes(k)&&typeof v[k]!=='function').map(k=>[k,value(v[k],seen,path+'/'+k)]));
}
export function snapshot(kit,roots=kit.root.children,counts){const old=inherited(kit,roots,counts),rows=[];for(const r of roots)r.traverse(m=>{if(m.isMesh)rows.push({name:m.name,materials:(Array.isArray(m.material)?m.material:[m.material]).map(q=>value(q))})});return {...old,additionalMaterialProperties:hash(rows)}}
