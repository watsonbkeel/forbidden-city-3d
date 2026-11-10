import assert from'node:assert/strict';import fs from'node:fs';import path from'node:path';import * as T from'three';import{createCanvas,loadImage,GlobalFonts}from'@napi-rs/canvas';import{TextureLibrary,TEXTURE_SPECS}from'../../../src/utils/TextureLibrary.js';import{sha}from'./helpers.mjs';import{observeNativeText}from'./native-evidence.mjs';
// Transport adapter only. Original production load/configure/material and full
// decoded image pixels run; no placeholder pixels or fallback success.
export async function nativeEnvironment(root,fonts){assert.equal(process.env.DISABLE_SYSTEM_FONTS_LOAD,'1');assert.ok(Array.isArray(fonts)&&fonts.length>0);const selected=[];assert.deepEqual(GlobalFonts.families,[],'fresh process must not contain undeclared native font registration');
 for(const font of fonts){assert.equal(sha(fs.readFileSync(font.path)),font.sha256);assert.ok(GlobalFonts.registerFromPath(font.path,font.family));assert.ok(GlobalFonts.has(font.family),'explicit font alias must be available');}
 const observer=observeNativeText(createCanvas,fonts,GlobalFonts.families);const saved={document:globalThis.document,window:globalThis.window,fetch:globalThis.fetch};const noop=()=>{};
 globalThis.document={createElement:type=>{assert.equal(type,'canvas');return createCanvas(1,1)},addEventListener:noop,removeEventListener:noop,exitPointerLock:noop};globalThis.window={location:{search:''},addEventListener:noop,removeEventListener:noop};
 const library=new TextureLibrary({quality:'hd',anisotropy:4,baseUrl:'/textures/hd/'});const failures=[];let closed=false;
 const read=url=>{assert.match(url,/^\/textures\/hd\/[A-Za-z0-9_.-]+$/);const relative='public'+url,b=fs.readFileSync(path.join(root,relative));selected.push({path:relative,bytes:b.length,sha256:sha(b)});return b;};
 globalThis.fetch=async url=>{assert.equal(url,'/textures/hd/manifest.json');return{ok:true,json:async()=>JSON.parse(read(url))}};
 library.loader.loadAsync=async url=>{try{const im=await loadImage(read(url)),canvas=createCanvas(im.width,im.height);canvas.getContext('2d').drawImage(im,0,0);return new T.Texture(canvas)}catch(e){failures.push(e);throw e}};
 const close=()=>{if(closed)return;closed=true;try{library.dispose()}finally{observer.restore();Object.assign(globalThis,saved)}};
 try{await library.load();if(failures.length)throw failures[0];assert.equal(library.loadedFromFile.size,Object.keys(TEXTURE_SPECS).length);assert.equal(library.colors.size,Object.keys(TEXTURE_SPECS).length);globalThis.fetch=saved.fetch;return{library,selected,observer,close};}catch(e){close();throw e}
}
