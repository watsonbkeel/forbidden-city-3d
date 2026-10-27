import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
export const sha256=data=>createHash('sha256').update(data).digest('hex');
export function distribution(values){
 if(!Array.isArray(values)||!values.length||values.some(v=>!Number.isFinite(v)))throw new TypeError('finite nonempty samples required');
 const a=[...values].sort((a,b)=>a-b),q=p=>a[Math.ceil(p*a.length)-1];
 return{count:a.length,p50:q(.5),p95:q(.95),p99:q(.99),max:a.at(-1),min:a[0]};
}
export function bindRoot(root){
 if(!path.isAbsolute(root)||!fs.existsSync(path.join(root,'main.js')))throw new Error('explicit existing absolute product root required');
 const git=(...args)=>execFileSync('git',['-C',root,...args],{encoding:'utf8'}).trim();
 const dirty=git('status','--porcelain','--untracked-files=no');if(dirty)throw new Error(`tracked source is dirty: ${dirty}`);
 const files=git('ls-files','src','data','main.js').split('\n').filter(Boolean);
 const untracked=git('ls-files','--others','--exclude-standard','src','data','main.js');if(untracked)throw new Error('untracked runtime input');
 return{root:fs.realpathSync(root),commit:git('rev-parse','HEAD'),tree:git('rev-parse','HEAD^{tree}'),runtimeFiles:files.map(file=>{const bytes=fs.readFileSync(path.join(root,file));return{path:file,bytes:bytes.length,sha256:sha256(bytes)};})};
}
// Retained JS backing allocations and estimated texture upload bytes are separate.
// This traverses all explicit ownership roots, including source build graphs and
// owned materials, not only meshes currently attached to the visible scene.
export function resourceInventory(roots){
 const seen=new Set(),buffers=new Set(),textures=new Set(),unknownTextures=[];
 let arrayBufferBytes=0,knownTextureEstimatedBytes=0;
 const stack=[...roots];
 while(stack.length){const o=stack.pop();if(!o||typeof o!=='object'||seen.has(o))continue;seen.add(o);
  if(ArrayBuffer.isView(o)){stack.push(o.buffer);continue;}
  if(o instanceof ArrayBuffer||o instanceof SharedArrayBuffer){if(!buffers.has(o)){buffers.add(o);arrayBufferBytes+=o.byteLength;}continue;}
  if(o.isTexture){textures.add(o);const i=o.image,w=i?.width,h=i?.height;
   if(Number.isInteger(w)&&w>0&&Number.isInteger(h)&&h>0&&(o.type===1009||o.type===undefined)&&(!i.data||i.data instanceof Uint8Array||i.data instanceof Uint8ClampedArray)&&(!o.mipmaps||o.mipmaps.length===0))knownTextureEstimatedBytes+=Math.ceil(w*h*4*(o.generateMipmaps?4/3:1));
   else unknownTextures.push({name:o.name??'',reason:'unknown dimensions/type/mipmap representation'});
  }
  if(o instanceof Map){for(const [k,v]of o){stack.push(k,v);}continue;}
  if(o instanceof Set){for(const v of o)stack.push(v);continue;}
  for(const d of Object.values(Object.getOwnPropertyDescriptors(o)))if('value'in d&&d.value&&typeof d.value==='object')stack.push(d.value);
 }
 return{arrayBufferBytes,arrayBufferCount:buffers.size,textureCount:textures.size,knownTextureEstimatedBytes,unknownTextures,objectCount:seen.size,meaning:'CPU ArrayBuffer retention plus separate RGBA8+mip upload estimate; native images, JS overhead and GPU allocations are not measured'};
}
export const nowNs=()=>process.hrtime.bigint();
export function measure(fn){const start=nowNs();const value=fn();return{value,ms:Number(nowNs()-start)/1e6};}
