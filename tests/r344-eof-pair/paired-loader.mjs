// Private transport discriminator: no Three, model, image decode, texture, renderer or product switch.
export const RAW_SPECS=Object.freeze(Object.fromEntries(Object.entries({"amitabha":{"subjectId":"amitabha","class":"ORIGINAL_GENERATED_ART_NOT_PHOTO_OR_SCAN","png":{"path":"textures/dafotang-original/amitabha-refined-v2.png","bytes":2835028,"sha256":"a08421ad1f713b4bddcb2b8680e7b6d65ad8ad0ac6fb59aa513f93c68ce6101f"},"grid":{"path":"textures/dafotang-original/amitabha-refined-alpha-grid-v2.json","bytes":79556,"sha256":"d6eb22a9d902b91ce642e688af4eafe712e43a4649cbdf05cbd66cf11a403e28"}},"shakyamuni":{"subjectId":"shakyamuni","class":"ORIGINAL_GENERATED_ART_NOT_PHOTO_OR_SCAN","png":{"path":"textures/dafotang-original/shakyamuni-refined-v2.png","bytes":2624019,"sha256":"b6e856029b1cc55d3222c866fe8448eddd91db5c6a9eeca7a1b97773ac077b5d"},"grid":{"path":"textures/dafotang-original/shakyamuni-refined-alpha-grid-v2.json","bytes":77202,"sha256":"7dcc6a376c62e5a2c638fd7fabbfb4735955fdd8e4f4c5e6b28e4ed74dd82ec3"}},"bhaisajyaguru":{"subjectId":"bhaisajyaguru","class":"ORIGINAL_GENERATED_ART_NOT_PHOTO_OR_SCAN","png":{"path":"textures/dafotang-original/bhaisajyaguru-refined-v2.png","bytes":2794358,"sha256":"63682ce571b58b79d24bf4bcc1c238bdb9c6f34668ef8a0f5fb9bbe15c3ef50b"},"grid":{"path":"textures/dafotang-original/bhaisajyaguru-refined-alpha-grid-v2.json","bytes":78609,"sha256":"9471cd93e70545a0cef0517a0eb78058e300f4ebfdd6577305b65db5ac8db4bf"}}}).map(([id,s])=>[id,Object.freeze({...s,png:Object.freeze(s.png),grid:Object.freeze(s.grid)})])));
const require=(v,m)=>{if(!v)throw Error(m);};
const abort=signal=>{if(signal?.aborted)throw Object.assign(Error('Original artwork load cancelled'),{name:'AbortError'});};
const hash=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),n=>n.toString(16).padStart(2,'0')).join('');
async function readUnlessAborted(reader,signal){
 abort(signal);if(!signal)return reader.read();
 let rejectAbort;const interrupted=new Promise((resolve,reject)=>{rejectAbort=reject;});
 const onAbort=()=>rejectAbort(Object.assign(Error('Original artwork load cancelled'),{name:'AbortError'}));
 signal.addEventListener('abort',onAbort,{once:true});
 try{return await Promise.race([reader.read(),interrupted]);}finally{signal.removeEventListener('abort',onAbort);}
}
async function readExact(response,expected,signal,onEOF){
 const reject=async message=>{try{await response?.body?.cancel?.();}catch{}throw Error(message);};
 if(!response?.ok)await reject('Original artwork HTTP failure');
 const length=response.headers?.get('content-length');if(length!==null&&length!==undefined&&(!/^\d+$/.test(length)||Number(length)!==expected))await reject('Original artwork byte identity mismatch');
 require(expected>0&&expected<=4*1024*1024,'Bounded original artwork bytes required');
 require(typeof response.body?.getReader==='function','Bounded streaming APIs required');
 const reader=response.body.getReader(),bytes=new Uint8Array(expected);let offset=0,ended=false;
 try{for(;;){abort(signal);const next=await readUnlessAborted(reader,signal);abort(signal);if(next.done){ended=true;break;}require(next.value instanceof Uint8Array&&offset+next.value.length<=expected,'Original artwork exceeds frozen size');bytes.set(next.value,offset);offset+=next.value.length;}require(offset===expected,'Original artwork truncated');if(onEOF){await onEOF();require(response.body.locked===true&&typeof reader.read==='function','Held EOF ownership changed');}return bytes;}
 finally{if(!ended)await reader.cancel().catch(()=>{});reader.releaseLock();}
}
// A helper scope returns only bytes after releasing its actual Response/reader.
async function fetchBytes(entry,{base,fetchFn,signal,onEOF}){
 const url=new URL(entry.path,base);require(url.origin===base.origin,'Same-origin asset required');const response=await fetchFn(url.href,{signal,credentials:'omit',redirect:'error',mode:'same-origin'});
 if(signal?.aborted){try{await response?.body?.cancel?.();}catch{}abort(signal);}
 if(response?.redirected===true||(response?.url&&response.url!==url.href)){try{await response?.body?.cancel?.();}catch{}throw Error('Original artwork response origin/path changed');}
 return await readExact(response,entry.bytes,signal,onEOF);
}
export async function readPairedAsset(entry,{base,fetchFn=globalThis.fetch,signal,generation,mode,bridge}){
 require(['release-before-terminal','release-after-terminal'].includes(mode)&&Number.isInteger(generation)&&generation>=1&&generation<=3&&typeof bridge==='function','Exact paired mode/generation/bridge required');
 const url=new URL(entry.path,base).href,message={kind:'eof',generation,url,bytes:entry.bytes,mode};
 if(mode==='release-before-terminal'){const bytes=await fetchBytes(entry,{base,fetchFn,signal});await bridge(message);return bytes;}
 const bytes=await fetchBytes(entry,{base,fetchFn,signal,onEOF:()=>bridge(message)});await bridge({kind:'release',generation,url,mode});return bytes;
}
export async function loadPairedArtwork(subjectId,{baseURL,fetchFn=globalThis.fetch,signal,generation,mode,bridge}={}) {
 const spec=typeof subjectId==='string'&&Object.hasOwn(RAW_SPECS,subjectId)?RAW_SPECS[subjectId]:null;
 require(spec,'Allowlisted raw subject required');
 const base=new URL(baseURL);require(['http:','https:'].includes(base.protocol)&&!base.username&&!base.password,'Same-origin HTTP asset base required');
 if(globalThis.location?.href)require(base.origin===new URL(globalThis.location.href).origin,'Same-origin page asset base required');
  abort(signal);const files=[];
  for(const entry of [spec.png,spec.grid]){const bytes=await readPairedAsset(entry,{base,fetchFn,signal,generation,mode,bridge});require(await hash(bytes)===entry.sha256,'Original artwork SHA256 mismatch');abort(signal);files.push(bytes);}
  const grid=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(files[1]));require(grid.columns===129&&grid.rows===193&&grid.imageWidth===1024&&grid.imageHeight===1536&&grid.sourceSHA256===spec.png.sha256&&Array.isArray(grid.alpha)&&grid.alpha.length===129*193&&grid.alpha.every(n=>Number.isInteger(n)&&n>=0&&n<=255),'Frozen original alpha grid required');
  // No post-download image decode or graphical allocations in this control.
  return {kind:'RAW_BYTES_NO_GRAPHICS',meta:{originalAsset:{subjectId:spec.subjectId,class:spec.class,pngSHA256:spec.png.sha256,gridSHA256:spec.grid.sha256}},dispose(){}};
}
