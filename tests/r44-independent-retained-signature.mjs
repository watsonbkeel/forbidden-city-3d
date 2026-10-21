import {hash} from './lib/inner-palace-fixture.mjs';
export function retainedSignature(f,kit){
 f.updateMatrixWorld(true);const categories={roof:[],platform:[],frontStair:[]};
 f.traverse(o=>{if(!o.isMesh)return;let key;const material=o.material?.name;let p=o.parent;while(p&&p!==f){if(p.name==='roof_xieshan')key='roof';p=p.parent;}if(o.parent===f){if(['wall_brick','stone_slab'].includes(material))key='platform';else if(material==='marble'&&o.position.z<0)key='frontStair';}if(!key)return;categories[key].push({matrix:o.matrixWorld.toArray(),material,attributes:Object.fromEntries(Object.entries(o.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),index:o.geometry.index?[...o.geometry.index.array]:null});});
 return{...Object.fromEntries(Object.entries(categories).map(([k,v])=>[k,{count:v.length,hash:hash(v)}])),originalSupports:hash(kit.walkables.filter(w=>w.type==='box'||w.maxZ<f.position.z))};
}
