// CPU physical retention audit, real TextureLibrary; excludes semantic metadata.
import {readFileSync,readdirSync,writeFileSync}from'node:fs';import {pathToFileURL}from'node:url';import path from'node:path';import {createHash}from'node:crypto';
const root=process.argv[2]??process.cwd(),out=process.argv[3];if(!out)throw Error('root and output path required');
const imp=p=>import(pathToFileURL(path.join(root,p)));
await imp('tests/lib/inner-palace-fixture.mjs');const {realTextureLibrary}=await imp('tests/lib/r48-real-texture-library.mjs'),{ZoneBase}=await imp('src/scene/zones/ZoneBase.js');
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex'),result={};
for(const file of readdirSync(path.join(root,'data/zones')).filter(f=>f.endsWith('.json'))){const d=JSON.parse(readFileSync(path.join(root,'data/zones',file)));for(const[idx,item]of d.items.entries())if(item.kind==='hall'){
 const lib=realTextureLibrary(),b=new ZoneBase(lib,d);try{b.buildHall(item);b.kit.buildPlaqueAtlas();b.kit.root.updateMatrixWorld(true);const rows=[];b.kit.root.traverse(m=>{if(m.isMesh)rows.push({matrix:m.matrixWorld.toArray(),material:m.material?.name,scale:m.scale.toArray(),attributes:Object.fromEntries(Object.entries(m.geometry.attributes).map(([k,a])=>[k,[a.itemSize,...a.array]])),index:m.geometry.index?[...m.geometry.index.array]:null});});
 result[d.id+'/'+idx]={name:item.name??null,geometry:hash(rows),navigation:hash({colliders:b.kit.colliders,walkables:b.kit.walkables,rooms:b.kit.rooms})};
 }finally{b.kit.dispose(b.kit.root);lib.dispose();}
}}
writeFileSync(out,JSON.stringify(result,null,2)+'\n');console.log(Object.keys(result).length,'hall signatures');
