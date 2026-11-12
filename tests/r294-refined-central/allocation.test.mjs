import {preparePetalUV,PETAL_SOURCES} from '../../src/scene/palace/special/OriginalLotusPetalUV.js';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createOriginalRelief} from '../../src/scene/palace/special/OriginalBuddhaRelief.js';
import {createEightTierLotus} from '../../src/scene/palace/special/EightTierLotus.js';
const source=fs.readFileSync(new URL('../../src/scene/palace/special/RefinedCentralBuddha.js',import.meta.url),'utf8');
const raw=JSON.parse(fs.readFileSync(new URL('../../public/textures/dafotang-original/shakyamuni-refined-alpha-grid-v2.json',import.meta.url)));
const grid={...raw,alpha:Uint8Array.from(raw.alpha)};let serial=0;
async function instrument(stage){
 const allocated=[];let materialCount=0;const failure=new Error('injected refined '+stage);
 const watch=(value,label)=>{const row={label,disposals:0};value.addEventListener('dispose',()=>row.disposals++);allocated.push(row);return value;};
 class Material extends T.MeshStandardMaterial{constructor(...args){materialCount++;if(stage==='material'+materialCount)throw failure;super(...args);watch(this,'new-lotus-material');}}
 globalThis.__r294FactoryEnv={preparePetalUV:stage==='uv'?()=>{throw failure;}:preparePetalUV,PETAL_SOURCES,T:{...T,MeshStandardMaterial:Material},createOriginalRelief:(...args)=>{const upper=createOriginalRelief(...args);watch(upper.mesh.geometry,'upper-geometry');upper.mesh.material.forEach(m=>watch(m,'upper-material'));if(stage==='copy')upper.mesh.geometry.copy=()=>{throw failure;};return upper;},createEightTierLotus:()=>{if(stage==='lotus')throw failure;return watch(createEightTierLotus(),'temporary-lotus');},mergeGeometries:(...args)=>{if(stage==='merge')throw failure;if(stage==='merge-null')return null;return watch(mergeGeometries(...args),'temporary-merged');}};
 const rewritten=source.replace("import {preparePetalUV,PETAL_SOURCES} from './OriginalLotusPetalUV.js';","const {preparePetalUV,PETAL_SOURCES}=globalThis.__r294FactoryEnv;").replace("import * as T from 'three';","const T=globalThis.__r294FactoryEnv.T;").replace("import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';","const mergeGeometries=globalThis.__r294FactoryEnv.mergeGeometries;").replace("import {createOriginalRelief} from './OriginalBuddhaRelief.js';","const createOriginalRelief=globalThis.__r294FactoryEnv.createOriginalRelief;").replace("import {createEightTierLotus} from './EightTierLotus.js';","const createEightTierLotus=globalThis.__r294FactoryEnv.createEightTierLotus;");
 const module=await import('data:text/javascript,'+encodeURIComponent(rewritten)+'#'+(++serial));delete globalThis.__r294FactoryEnv;return{module,allocated,failure};
}
for(const stage of ['lotus','merge','merge-null','material1','material2','material3','copy','uv'])test(stage+' failure releases every returned resource once and preserves caller texture ownership',async()=>{
 const {module,allocated,failure}=await instrument(stage);const texture=new T.Texture();let n=0;texture.addEventListener('dispose',()=>n++);
 assert.throws(()=>module.createRefinedCentralRelief(grid,{texture,ownsTexture:true}),error=>stage==='merge-null'?/merge failed/.test(error.message):error===failure);
 assert.ok(allocated.length>=4);assert.ok(allocated.every(row=>row.disposals===1),JSON.stringify(allocated));assert.equal(n,0);texture.dispose();
});
test('successful combined mesh has one output resource owner and temporary geometry already released',async()=>{
 const{module,allocated}=await instrument('success');const texture=new T.Texture();let n=0;texture.addEventListener('dispose',()=>n++);const result=module.createRefinedCentralRelief(grid,{texture,ownsTexture:true});
 assert.equal(allocated.length,9);assert.ok(allocated.filter(x=>x.label.startsWith('temporary-')).every(x=>x.disposals===1));assert.ok(allocated.filter(x=>!x.label.startsWith('temporary-')).every(x=>x.disposals===0));
 result.dispose();result.dispose();assert.equal(n,1);assert.ok(allocated.every(row=>row.disposals===1));
});
