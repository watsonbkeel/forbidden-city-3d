import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createRefinedCentralRelief} from '../../src/scene/palace/special/RefinedCentralBuddha.js';
const source=fs.readFileSync(new URL('../../src/scene/palace/special/OriginalBuddhaRelief.js',import.meta.url),'utf8');
const loaderSource=fs.readFileSync(new URL('../../src/scene/palace/special/DafotangOriginalArtworkLoader.js',import.meta.url),'utf8');
const input={columns:2,rows:2,alpha:new Uint8Array(4).fill(255),imageWidth:2,imageHeight:2};
let serial=0;
async function instrument(stage){
 const allocated=[];let materials=0;
 const failure=new Error('injected '+stage);
 const watch=(resource,kind)=>{const row={kind,disposals:0};allocated.push(row);resource.addEventListener('dispose',()=>row.disposals++);};
 class Geometry extends T.BufferGeometry{constructor(...args){super(...args);watch(this,'geometry');}}
 for(const key of ['setAttribute','setIndex','computeVertexNormals','computeBoundingBox','computeBoundingSphere']){
  Geometry.prototype[key]=function(...args){if(stage===key)throw failure;return T.BufferGeometry.prototype[key].apply(this,args);};
 }
 class Material extends T.MeshStandardMaterial{constructor(...args){materials++;if(stage==='material'+materials)throw failure;super(...args);watch(this,'material');}}
 class Mesh extends T.Mesh{constructor(...args){if(stage==='mesh')throw failure;super(...args);}}
 globalThis.__r293Three={...T,BufferGeometry:Geometry,MeshStandardMaterial:Material,Mesh};
 const module=await import('data:text/javascript,'+encodeURIComponent(source.replace("import * as T from 'three';","const T=globalThis.__r293Three;"))+'#'+(++serial));
 delete globalThis.__r293Three;
 return {module,allocated,failure};
}
for(const stage of ['setAttribute','setIndex','computeVertexNormals','computeBoundingBox','computeBoundingSphere','material1','material2','material3','mesh'])test(stage+' failure releases each returned resource once and leaves texture with caller',async()=>{
 const {module,allocated,failure}=await instrument(stage);const texture=new T.Texture();let disposed=0;texture.addEventListener('dispose',()=>disposed++);
 assert.throws(()=>module.createOriginalRelief(input,{texture,ownsTexture:true}),error=>error===failure);
 assert.ok(allocated.length>0);assert.ok(allocated.every(row=>row.disposals===1),JSON.stringify(allocated));assert.equal(disposed,0);
 texture.dispose();assert.equal(disposed,1);
});
for(const ownsTexture of [false,true])test('successful return preserves texture ownership '+ownsTexture+' and idempotent disposal',async()=>{
 const {module,allocated}=await instrument('none');const texture=new T.Texture();let disposed=0;texture.addEventListener('dispose',()=>disposed++);
 const result=module.createOriginalRelief(input,{texture,ownsTexture});assert.equal(allocated.length,4);assert.ok(allocated.every(row=>row.disposals===0));
 assert.equal(result.mesh.material[0].map,texture);result.dispose();result.dispose();assert.ok(allocated.every(row=>row.disposals===1));assert.equal(disposed,ownsTexture?1:0);
 if(!ownsTexture)texture.dispose();
});
test('actual verified original side factory keeps failed-construction texture ownership and disposes it once',async()=>{
 const {module,allocated,failure}=await instrument('material2');
 globalThis.__r293LoaderThree=T;globalThis.__r293Factory=module.createOriginalRelief;globalThis.__r293RefinedFactory=createRefinedCentralRelief;
 const loader=await import('data:text/javascript,'+encodeURIComponent(loaderSource.replace("import * as T from 'three';","const T=globalThis.__r293LoaderThree;").replace("import {createOriginalRelief} from './OriginalBuddhaRelief.js';","const createOriginalRelief=globalThis.__r293Factory;").replace("import {createRefinedCentralRelief} from './RefinedCentralBuddha.js';","const createRefinedCentralRelief=globalThis.__r293RefinedFactory;"))+'#'+(++serial));
 delete globalThis.__r293LoaderThree;delete globalThis.__r293Factory;delete globalThis.__r293RefinedFactory;
 const baseURL='https://example.test/project/';const texture=new T.Texture({width:1024,height:1536});let disposals=0,decoded=0,fetches=0;
 texture.addEventListener('dispose',()=>disposals++);
 await assert.rejects(loader.loadOriginalBuddhaArtwork('amitabha',{baseURL,fetchFn:async url=>{
  fetches++;const spec=[loader.ORIGINAL_BUDDHA_ARTWORK.amitabha.png,loader.ORIGINAL_BUDDHA_ARTWORK.amitabha.grid].find(spec=>new URL(spec.path,baseURL).href===url);assert.ok(spec);
  return new Response(fs.readFileSync(new URL('../../public/'+spec.path,import.meta.url)));
 },decodeTexture:async()=>{decoded++;return texture;}}),error=>error===failure);
 assert.equal(fetches,2);assert.equal(decoded,1);assert.equal(disposals,1);assert.equal(allocated.length,2);assert.ok(allocated.every(row=>row.disposals===1));
});
for(const subject of ['shakyamuni','amitabha','bhaisajyaguru'])test(subject+' real alpha geometry, material parameters, proxy and metadata remain exactly R292',async()=>{
 const before=await import('../r275-buddha-original/baseline/OriginalBuddhaRelief.js');
 const after=await import('../../src/scene/palace/special/OriginalBuddhaRelief.js');
 const grid=JSON.parse(fs.readFileSync(new URL('../../public/textures/dafotang-original/'+subject+'-alpha-grid-v1.json',import.meta.url),'utf8'));
 const texture=new T.Texture(),options={height:2.25,texture,ownsTexture:false};
 const old=before.createOriginalRelief({...grid,alpha:Uint8Array.from(grid.alpha)},options);
 const current=after.createOriginalRelief({...grid,alpha:Uint8Array.from(grid.alpha)},options);
 try{
  assert.deepEqual(current.meta,old.meta);assert.deepEqual(current.collisionProxy,old.collisionProxy);
  for(const key of ['name','castShadow','receiveShadow'])assert.equal(current.mesh[key],old.mesh[key]);
  for(const name of ['position','normal','uv'])assert.deepEqual(current.mesh.geometry.attributes[name].array,old.mesh.geometry.attributes[name].array);
  assert.deepEqual(current.mesh.geometry.index.array,old.mesh.geometry.index.array);assert.deepEqual(current.mesh.geometry.groups,old.mesh.geometry.groups);
  assert.deepEqual(current.mesh.geometry.boundingBox,old.mesh.geometry.boundingBox);assert.deepEqual(current.mesh.geometry.boundingSphere,old.mesh.geometry.boundingSphere);
  for(let i=0;i<3;i++)for(const key of ['color','roughness','metalness','alphaTest','transparent','side','depthTest','depthWrite','map'])assert.deepEqual(current.mesh.material[i][key],old.mesh.material[i][key]);
 }finally{old.dispose();current.dispose();texture.dispose();}
});
