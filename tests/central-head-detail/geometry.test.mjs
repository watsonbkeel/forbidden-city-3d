import test from 'node:test';import assert from 'node:assert/strict';
const target=new URL('../../src/scene/palace/special/CentralBuddhaVolumeStudy.js',import.meta.url);
test('central study provides real closed body volumes rather than alpha-extruded sheet',async()=>{
 const mod=await import(target).catch(()=>null);assert.ok(mod?.createCentralBuddhaVolumeStudy,'volume factory not implemented');
 const input={columns:129,rows:193,imageWidth:1024,imageHeight:1536,alpha:new Uint8Array(129*193).fill(255)};
 const r=mod.createCentralBuddhaVolumeStudy(input),p=r.mesh.geometry.attributes.position,uv=r.mesh.geometry.attributes.uv;
 assert.equal(r.meta.defaultProductReplacement,false);assert.equal(r.meta.historicalShapeVerified,false);
 for(const name of ['head','torso','lap','right-hand','left-hand']){const part=r.meta.parts.find(x=>x.name===name);assert.ok(part);assert.ok(part.depth>=.075);}
 for(const n of p.array)assert.ok(Number.isFinite(n));for(const n of uv.array)assert.ok(Number.isFinite(n)&&n>=0&&n<=1);
 assert.ok(r.meta.parts.find(x=>x.name==='head').depth>=.30);assert.ok(r.meta.parts.find(x=>x.name==='lap').depth>=.60);
 assert.ok(r.mesh.geometry.boundingBox.max.y<=2.4);assert.equal(r.collisionProxy.activeInProduct,false);r.dispose();r.dispose();
});
test('sample batches shared materials into at most six shared draw groups',async()=>{
 const {createCentralBuddhaVolumeStudy}=await import(target);const r=createCentralBuddhaVolumeStudy({columns:129,rows:193,imageWidth:1024,imageHeight:1536,alpha:new Uint8Array(129*193).fill(255)});
 assert.ok(r.mesh.geometry.groups.length<=6,`excess draw groups: ${r.mesh.geometry.groups.length}`);r.dispose();
});
test('normal and throwing disposal release materials and owned texture once',async()=>{
 const {createCentralBuddhaVolumeStudy}=await import(target);let textures=0;const r=createCentralBuddhaVolumeStudy({columns:129,rows:193,imageWidth:1024,imageHeight:1536,alpha:new Uint8Array(129*193).fill(255)},{texture:{dispose(){textures++;}},ownsTexture:true});
 const seen=[];r.mesh.geometry.addEventListener('dispose',()=>{seen.push('g');throw Error('listener');});r.mesh.material.forEach((m,i)=>m.addEventListener('dispose',()=>seen.push(i)));
 assert.throws(()=>r.dispose(),AggregateError);assert.deepEqual(seen,['g',0,1,2,3,4,5]);assert.equal(textures,1);r.dispose();assert.equal(textures,1);
});
import fs from 'node:fs';
test('every textured triangle has a conservatively opaque entire mask footprint',async()=>{
 const {createCentralBuddhaVolumeStudy}=await import(target);const input=JSON.parse(fs.readFileSync(new URL('../../public/textures/dafotang-original/shakyamuni-refined-alpha-grid-v2.json',import.meta.url)));input.alpha=Uint8Array.from(input.alpha);const r=createCentralBuddhaVolumeStudy(input),g=r.mesh.geometry,uv=g.attributes.uv;
 for(const group of g.groups.filter(x=>x.materialIndex===0))for(let j=group.start;j<group.start+group.count;j+=3){const ids=[g.index.getX(j),g.index.getX(j+1),g.index.getX(j+2)],xs=ids.map(i=>uv.getX(i)*128),ys=ids.map(i=>(1-uv.getY(i))*192);
 for(let y=Math.max(0,Math.floor(Math.min(...ys)-.5));y<=Math.min(192,Math.ceil(Math.max(...ys)+.5));y++)for(let x=Math.max(0,Math.floor(Math.min(...xs)-.5));x<=Math.min(128,Math.ceil(Math.max(...xs)+.5));x++)assert.ok(input.alpha[y*129+x]>=128,'textured triangle footprint includes background');
 }r.dispose();
});
import * as T from 'three';
test('construction failure retains original and cleanup errors without stealing texture',async()=>{
 const {createCentralBuddhaVolumeStudy}=await import(target),original=T.BufferGeometry.prototype.computeBoundingBox,dispose=T.BufferGeometry.prototype.dispose;let textures=0;
 T.BufferGeometry.prototype.computeBoundingBox=function(){throw Error('construction sentinel');};T.BufferGeometry.prototype.dispose=function(){throw Error('cleanup sentinel');};
 try{assert.throws(()=>createCentralBuddhaVolumeStudy({columns:129,rows:193,imageWidth:1024,imageHeight:1536,alpha:new Uint8Array(129*193).fill(255)},{texture:{dispose(){textures++;}},ownsTexture:true}),e=>e instanceof AggregateError&&e.errors.some(x=>x.message==='construction sentinel')&&JSON.stringify(e.errors.map(x=>x.message)).includes('cleanup'));
 assert.equal(textures,0);}finally{T.BufferGeometry.prototype.computeBoundingBox=original;T.BufferGeometry.prototype.dispose=dispose;}
});
test('head and hands carry independent artwork regions, not derived geometry boxes',async()=>{
 const {createCentralBuddhaVolumeStudy}=await import(target);const r=createCentralBuddhaVolumeStudy({columns:129,rows:193,imageWidth:1024,imageHeight:1536,alpha:new Uint8Array(129*193).fill(255)});
 const hand=r.meta.parts.find(p=>p.name==='right-hand');assert.deepEqual(hand.sourceRegionXY,[-.450,-.315,.913,1.207]);assert.equal(hand.regionBasis,'INDEPENDENT_FRONT_ART_FIT_NOT_HISTORICAL_MEASURE');r.dispose();
});
