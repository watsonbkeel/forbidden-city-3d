import test from 'node:test';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {hasTextureFirstQuery,loadTextureFirst,makeTextureFirstCard} from '../../src/scene/palace/special/TriadTextureFirst.js';

test('only one exact triad selector admits the private painting mode',()=>{
 for(const s of ['', '?triad','?triad=','?triad=Texture-First','?triad=texture-first&triad=x','?triad=texture-first&triad=texture-first'])assert.equal(hasTextureFirstQuery(s),false);
 for(const s of ['?triad=texture-first','?lang=en&triad=texture-first'])assert.equal(hasTextureFirstQuery(s),true);
});
test('historical shallow-card mesh and original-asset lifecycle',()=>{
 const tex=new THREE.Texture();const out=makeTextureFirstCard('shakyamuni',tex), m=out.mesh, geo=m.geometry;
 assert.deepEqual(geo.parameters,{width:1.25,height:2.25,widthSegments:24,heightSegments:32});geo.computeBoundingBox();
 assert.equal(geo.boundingBox.max.y,2.25);assert.equal(geo.boundingBox.min.y,0);
 assert.ok(Math.abs(geo.boundingBox.max.z-.05)<1e-6);assert.ok(Math.abs(geo.boundingBox.min.z-.025)<1e-6);
 assert.equal(m.material.isMeshBasicMaterial,true);assert.equal(m.material.alphaTest,.2);assert.equal(m.material.side,THREE.DoubleSide);assert.equal(m.material.toneMapped,false);assert.equal(tex.colorSpace,THREE.SRGBColorSpace);
 // SHA256 of actual typed arrays produced by the isolated original manual-trial card factory.
 const digest=a=>createHash('sha256').update(Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength)).digest('hex');
 assert.deepEqual([geo.attributes.position,geo.attributes.normal,geo.attributes.uv,geo.index].map(digest),[
  '36612bd9d51afcc8392c1e39bea37cd056cf9bf4c1bf325ebe80fed09f818a3c',
  '627b98fa8dbb563d94c5951f907ddea1273a06354751cd1ed993988128a653a0',
  'be58c7c6803fe69d1b200a0416adb4cbb893875f990d690e3ee7c20c15dd881a',
  'dfafd053b9fb034e3753f217567fe6dd388d81cc9a6d70b528372e15ce545f76'
 ]);
 let n=0;for(const r of [tex,m.material,geo])r.addEventListener('dispose',()=>n++);out.dispose();out.dispose();assert.equal(n,3);
});
test('uses same-origin refined PNG under both local and Pages prefixes; never fetches unknown subjects',async()=>{
 for(const base of ['https://example.test/','https://example.test/forbidden-city-3d/']){
 let req; const out=await loadTextureFirst({subjectId:'amitabha',baseURL:base,fetchFn:async(url,opt)=>{req={url,opt};return new Response(new Blob(['fixture']));},decode:async()=>new THREE.Texture()});
 assert.equal(req.url,base+'textures/dafotang-original/amitabha-refined-v2.png');assert.equal(req.opt.credentials,'same-origin');out.dispose();}
 await assert.rejects(loadTextureFirst({subjectId:'../wrong',fetchFn:()=>assert.fail('unexpected fetch')}),/subject/i);
});
test('abort during decode disposes unpublished texture and surfaces AbortError', async()=>{
 const c=new AbortController(), tex=new THREE.Texture();let n=0;tex.addEventListener('dispose',()=>n++);
 await assert.rejects(loadTextureFirst({subjectId:'amitabha',signal:c.signal,baseURL:'https://example.test/',fetchFn:async()=>new Response('x'),decode:async()=>{c.abort();return tex;}}),{name:'AbortError'});assert.equal(n,1);
});
