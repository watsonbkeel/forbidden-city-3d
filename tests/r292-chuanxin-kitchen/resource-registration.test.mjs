import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
const path='../../src/scene/palace/special/ChuanxinKitchen.js';
const source=fs.readFileSync(new URL(path,import.meta.url),'utf8');
for(const failure of ['second-material','shape','box-translate','roof-translate'])test('constructor/transform failure cleans prior resources: '+failure,async()=>{
 const resources=[];let mats=0;
 const wrap=(Base,kind)=>class extends Base{constructor(...args){if(kind==='material'&&++mats===2&&failure==='second-material')throw Error('injected');if(kind==='shape'&&failure==='shape')throw Error('injected');super(...args);if(['material','box','roof'].includes(kind)){const row={kind,n:0};resources.push(row);this.addEventListener('dispose',()=>row.n++);}}translate(...args){if((kind==='box'&&failure==='box-translate')||(kind==='roof'&&failure==='roof-translate'))throw Error('injected');return super.translate(...args);}};
 globalThis.__northDutyT={...T,MeshStandardMaterial:wrap(T.MeshStandardMaterial,'material'),BoxGeometry:wrap(T.BoxGeometry,'box'),ExtrudeGeometry:wrap(T.ExtrudeGeometry,'roof'),Shape:wrap(T.Shape,'shape')};
 const m=await import('data:text/javascript,'+encodeURIComponent(source.replace("import * as T from 'three';","const T=globalThis.__northDutyT;"))+'#'+failure);
 assert.throws(()=>m.createChuanxinKitchen(),/injected/);assert.ok(resources.length>0);assert.ok(resources.every(r=>r.n===1),JSON.stringify(resources));delete globalThis.__northDutyT;
});
