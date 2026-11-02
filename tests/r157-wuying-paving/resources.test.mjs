import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createRequire} from 'node:module';import * as T from 'three';
import {TextureLibrary,TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
import {fixture} from './fixture.mjs';
const {loadImage,createCanvas}=createRequire(import.meta.url)('@napi-rs/canvas');
for(const quality of['hd','sd'])test(`actual ${quality} ground brick color/normal assets decode through unchanged TextureLibrary loader and reach paving`,async t=>{
 const dir=new URL(`../../public/textures/${quality}/`,import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',dir))),entry=manifest.textures.ground_brick;
 const lib=new TextureLibrary({quality,baseUrl:dir.href});
 for(const key of Object.keys(TEXTURE_SPECS))if(key!=='ground_brick')lib.colors.set(key,new T.Texture({width:64,height:64}));
 t.mock.method(globalThis,'fetch',async url=>{assert.equal(url,new URL('manifest.json',dir).href);return{ok:true,json:async()=>({textures:{ground_brick:entry}})};});
 t.mock.method(lib.loader,'loadAsync',async url=>new T.Texture(await loadImage(fs.readFileSync(new URL(url)))));
 await lib.load();assert.ok(lib.loadedFromFile.has('ground_brick'));
 const tex=lib.colors.get('ground_brick'),normal=lib.normals.get('ground_brick');assert.equal(tex.image.width,quality==='hd'?1024:512);assert.equal(normal.image.width,quality==='hd'?512:256);assert.equal(tex.wrapS,T.RepeatWrapping);assert.equal(tex.wrapT,T.RepeatWrapping);assert.equal(tex.colorSpace,T.SRGBColorSpace);assert.deepEqual(tex.repeat.toArray(),[1,1]);
 const c=createCanvas(tex.image.width,tex.image.height),ctx=c.getContext('2d');ctx.drawImage(tex.image,0,0);const pixels=ctx.getImageData(0,0,c.width,c.height).data;let lo=255,hi=0;for(let i=0;i<pixels.length;i+=4){lo=Math.min(lo,pixels[i]);hi=Math.max(hi,pixels[i]);}assert.ok(hi-lo>60,'real joints and stone grain, not flat fallback');
 const{z}=fixture(lib);try{let count=0;z.kit.root.traverse(m=>{if(m.isMesh&&m.material===lib.material('ground_brick',{roughness:.88,metalness:0})){count++;assert.equal(m.material.map,tex);assert.equal(m.material.normalMap,normal);}});assert.equal(count,3);}finally{z.kit.dispose(z.kit.root);lib.dispose();}
});
