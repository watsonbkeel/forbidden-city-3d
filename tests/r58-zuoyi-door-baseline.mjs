import {writeFileSync} from 'node:fs';
import {library,gate,goldRuns,triangles,hash,textureHash,binding} from './lib/r58-zuoyi-door-fixture.mjs';
const report={target:'FC-BC06FBAC15',binding,scope:'CPU_TEXTURE_AND_ACTUAL_MESH_UV_ONLY_NOT_BROWSER_ACCEPTANCE',loadingBoundary:'REAL_TEXTURELIBRARY_LOAD_ALL_MANIFEST_FILES_LOCAL_TRANSPORT',qualities:[]};
for(const quality of ['hd','sd']){
 const lib=await library(quality),{kit,frame,leaves}=gate(lib),map=lib.color('door_studded');
 const fronts=leaves.map(m=>triangles(m,{world:false}).filter(t=>t.n.every(v=>v[2]===-1)));
 report.qualities.push({quality,textureSize:[map.image.width,map.image.height],textureSHA256:textureHash(map),rowRuns:goldRuns(map.image),rowCount:goldRuns(map.image).length,materialRoute:leaves.map(m=>m.material.name),repeat:map.repeat.toArray(),wrap:[map.wrapS,map.wrapT],flipY:map.flipY,leaves:leaves.map(m=>({position:m.position.toArray(),rotation:m.rotation.toArray(),geometry:m.geometry.parameters})),frontTriangles:fronts,geometrySHA256:hash(triangles(frame,{material:false})),collidersSHA256:hash(kit.colliders),walkablesSHA256:hash(kit.walkables)});
 kit.dispose(kit.root);lib.dispose();
}
writeFileSync('reports/r58-zuoyi-door/baseline.json',JSON.stringify(report,null,2)+'\n');
console.log(report.qualities.map(q=>({quality:q.quality,rows:q.rowCount,frontTriangles:q.frontTriangles.map(x=>x.length),repeat:q.repeat,materials:q.materialRoute})));
