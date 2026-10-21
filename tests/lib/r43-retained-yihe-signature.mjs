import {hash} from './inner-palace-fixture.mjs';
export function retainedYiheSignature(f,kit){
 f.updateMatrixWorld(true);const categories={roof:[],platform:[],frontStair:[]};
 f.traverse(o=>{if(!o.isMesh)return;const material=o.material?.name;let key;if(o.parent!==f)key='roof';else if(['sumeru_band','stone_slab'].includes(material))key='platform';else if(material==='marble')key='frontStair';if(!key)return;categories[key].push({matrix:o.matrixWorld.toArray(),material,attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),index:o.geometry.index?[...o.geometry.index.array]:null});});
 return{...Object.fromEntries(Object.entries(categories).map(([k,v])=>[k,{count:v.length,hash:hash(v)}])),walkables:hash(kit.walkables)};
}
