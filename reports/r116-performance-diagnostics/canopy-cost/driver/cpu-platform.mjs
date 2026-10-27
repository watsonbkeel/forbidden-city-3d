import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
// Real local image/Canvas2D pixels. This replaces transport and DOM only, not
// TextureLibrary/TextureLoader/material generators. WebGL and IBL are NOT_RUN.
export async function installCpuPlatform(root){
 const require=createRequire(path.join(root,'package.json'));
 const {createCanvas,Image}=require('@napi-rs/canvas');
 const {createDOM}=await import(pathToFileURL(path.join(root,'tests/lib/ui-dom.mjs')));
 const dom=createDOM(),create=dom.document.createElement;
 Object.defineProperty(Object.getPrototypeOf(dom.document.body),'dataset',{get(){return Object.fromEntries([...this.attributes].filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase()),v]));}});
 dom.document.createElement=type=>type==='canvas'?createCanvas(1,1):create(type);
 dom.document.createElementNS=(_ns,type)=>{
  if(type!=='img')return dom.document.createElement(type);
  const i=new Image(),listeners=new Map();
  i.addEventListener=(event,fn)=>{listeners.set(event,fn);i['on'+event]=e=>listeners.get(event)?.call(i,e);};
  i.removeEventListener=(event,fn)=>{if(listeners.get(event)===fn)listeners.delete(event);};return i;
 };
 dom.document.head=dom.document.createElement('head');dom.document.hidden=false;dom.document.body.ownerDocument=dom.document;
 Object.assign(dom.window,{location:{search:''},innerWidth:1280,innerHeight:720});
 Object.assign(globalThis,{document:dom.document,window:dom.window});
 Object.defineProperty(globalThis,'navigator',{value:{userAgent:'R116 CPU local image transport',maxTouchPoints:0},configurable:true});
 globalThis.fetch=async url=>{const p=String(url);if(!path.isAbsolute(p)||!p.startsWith(path.join(root,'public')+path.sep))throw new Error('CPU transport rejects non-product local asset');return new Response(fs.readFileSync(p),{status:200});};
 // Seed only the diagnostic process to make unchanged procedural textures and
 // geometry comparable. Production RNG is not modified by these tools.
 let state=0x116120;Math.random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 return{dom,createCanvas,require,seed:'0x116120',transport:'local public file read + native Canvas2D decode; excludes network/browser/WebGL'};
}
