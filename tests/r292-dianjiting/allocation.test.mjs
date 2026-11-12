import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
const source=fs.readFileSync(new URL('../../src/scene/palace/special/DianjitingTopology.js',import.meta.url),'utf8');
for(const stage of ['box','translate','material','mesh'])for(const index of [1,2,3])test(`allocation failure ${stage} ${index} releases every completed allocation once`,async()=>{
 const rows=[],counts={box:0,translate:0,material:0,mesh:0};
 const hit=k=>{counts[k]++;if(stage===k&&counts[k]===index)throw Error('injected '+stage+' '+index)};
 const wrap=(Base,kind)=>class extends Base{constructor(...args){hit(kind);super(...args);if(kind!=='mesh'){const row={kind,n:0};rows.push(row);this.addEventListener('dispose',()=>row.n++);}}translate(...args){hit('translate');return super.translate(...args);}};
 globalThis.__dianjiT={...T,BoxGeometry:wrap(T.BoxGeometry,'box'),MeshStandardMaterial:wrap(T.MeshStandardMaterial,'material'),Mesh:wrap(T.Mesh,'mesh')};
 try{const m=await import('data:text/javascript,'+encodeURIComponent(source.replace("import * as T from 'three';","const T=globalThis.__dianjiT;"))+'#'+stage+index);assert.throws(()=>m.createDianjitingTopology(),/injected/);assert.ok(rows.every(r=>r.n===1),JSON.stringify(rows));assert.equal(counts[stage],index);}finally{delete globalThis.__dianjiT;}
});
