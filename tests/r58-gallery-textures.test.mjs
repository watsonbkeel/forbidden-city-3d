import test from 'node:test';import assert from 'node:assert/strict';
import {createRequire} from 'node:module';const {createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
import {TextureLibrary,TEXTURE_SPECS} from '../src/utils/TextureLibrary.js';
import {assemble,targets,hash} from './lib/r58-gallery-fixture.mjs';
// Real production material()/fallback texture APIs. main.js loads all texture
// specs BEFORE palace/zone construction; no async network or fake texture pixels.
test('same sequential seed preserves real production material responses and preloaded fallback texture pixels',()=>{
 const saved=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1)};
 try{const factory=()=>{const lib=new TextureLibrary();for(const name of Object.keys(TEXTURE_SPECS))lib.colors.set(name,lib.createFallback(name));return lib;};
 const before=assemble({candidate:false,libraryFactory:factory}),after=assemble({libraryFactory:factory});
 const pixels=b=>b.z.library.allTextures().map(t=>({name:t.name,width:t.image.width,height:t.image.height,pixels:hash(Buffer.from(t.image.getContext('2d').getImageData(0,0,t.image.width,t.image.height).data))}));
 assert.deepEqual(pixels(after),pixels(before));assert.equal(pixels(after).length,22);
 for(const b of before.rows){const a=after.rows.find(r=>r.index===b.index);assert.equal(hash(a.allMeshes),hash(targets[b.index]?b.retainedMeshes:b.allMeshes));}
 for(let i=0;i<before.controls.length;i++)assert.equal(hash(after.controls[i].allMeshes),hash(before.controls[i].allMeshes));
 }finally{globalThis.document=saved;}
});
