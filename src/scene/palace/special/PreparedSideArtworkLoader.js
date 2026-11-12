import * as T from 'three';
import {createRefinedSideRelief} from './RefinedSideBuddha.js';
export const PREPARED_SIDE_ARTWORK=Object.freeze(Object.fromEntries(Object.entries({"amitabha":{"subjectId":"amitabha","class":"ORIGINAL_GENERATED_ART_NOT_PHOTO_OR_SCAN","imageWidth":1024,"imageHeight":1536,"sourceUpperLastRow":116,"lastSourcePixelY":927,"png":{"path":"textures/dafotang-original/amitabha-refined-v2.png","bytes":2835028,"sha256":"a08421ad1f713b4bddcb2b8680e7b6d65ad8ad0ac6fb59aa513f93c68ce6101f"},"grid":{"path":"textures/dafotang-original/amitabha-refined-alpha-grid-v2.json","bytes":79556,"sha256":"d6eb22a9d902b91ce642e688af4eafe712e43a4649cbdf05cbd66cf11a403e28"}},"bhaisajyaguru":{"subjectId":"bhaisajyaguru","class":"ORIGINAL_GENERATED_ART_NOT_PHOTO_OR_SCAN","imageWidth":1024,"imageHeight":1536,"sourceUpperLastRow":108,"lastSourcePixelY":863,"png":{"path":"textures/dafotang-original/bhaisajyaguru-refined-v2.png","bytes":2794358,"sha256":"63682ce571b58b79d24bf4bcc1c238bdb9c6f34668ef8a0f5fb9bbe15c3ef50b"},"grid":{"path":"textures/dafotang-original/bhaisajyaguru-refined-alpha-grid-v2.json","bytes":78609,"sha256":"9471cd93e70545a0cef0517a0eb78058e300f4ebfdd6577305b65db5ac8db4bf"}}}).map(([id,s])=>[id,Object.freeze({...s,png:Object.freeze(s.png),grid:Object.freeze(s.grid)})])));
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
async function readExact(response,expected,signal){
 const reject=async message=>{try{await response?.body?.cancel?.();}catch{}throw Error(message);};
 if(!response?.ok)await reject('Original artwork HTTP failure');
 const length=response.headers?.get('content-length');if(length!==null&&length!==undefined&&(!/^\d+$/.test(length)||Number(length)!==expected))await reject('Original artwork byte identity mismatch');
 require(expected>0&&expected<=4*1024*1024,'Bounded original artwork bytes required');
 if(!response.body?.getReader){const bytes=new Uint8Array(await response.arrayBuffer());abort(signal);require(bytes.length===expected,'Original artwork byte identity mismatch');return bytes;}
 const reader=response.body.getReader(),bytes=new Uint8Array(expected);let offset=0,ended=false;
 try{for(;;){abort(signal);const next=await readUnlessAborted(reader,signal);abort(signal);if(next.done){ended=true;break;}require(next.value instanceof Uint8Array&&offset+next.value.length<=expected,'Original artwork exceeds frozen size');bytes.set(next.value,offset);offset+=next.value.length;}require(offset===expected,'Original artwork truncated');return bytes;}
 finally{if(!ended)await reader.cancel().catch(()=>{});reader.releaseLock();}
}
async function decodeTexture(bytes){const url=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));try{const image=new Image();image.src=url;await image.decode();const t=new T.Texture(image);t.needsUpdate=true;return t;}finally{URL.revokeObjectURL(url);}}
/** Only our immutable original assets, same origin and full byte/hash identity before
 * any image decode. Original images never enter the approved-photograph registry.
 */
export async function loadPreparedSideArtwork(subjectId,{baseURL=new URL(import.meta.env?.BASE_URL??'/',globalThis.location?.href??'https://unconfigured.invalid/').href,fetchFn=globalThis.fetch,decodeTexture:decode=decodeTexture,signal,preparationOnly=false}={}){
 require(preparationOnly===true,'Explicit private preparation required; not product enabled');
 const spec=typeof subjectId==='string'&&Object.hasOwn(PREPARED_SIDE_ARTWORK,subjectId)?PREPARED_SIDE_ARTWORK[subjectId]:null;require(spec,'Allowlisted side subject required');
 const base=new URL(baseURL);require(['http:','https:'].includes(base.protocol)&&!base.username&&!base.password,'Same-origin HTTP asset base required');
 if(globalThis.location?.href)require(base.origin===new URL(globalThis.location.href).origin,'Same-origin page asset base required');
 let texture,output;
 try{
  abort(signal);const files=[];
  for(const entry of [spec.png,spec.grid]){const url=new URL(entry.path,base);require(url.origin===base.origin,'Same-origin asset required');const response=await fetchFn(url.href,{signal,credentials:'omit',redirect:'error',mode:'same-origin'});if(signal?.aborted){try{await response?.body?.cancel?.();}catch{}abort(signal);}if(response?.redirected===true||(response?.url&&response.url!==url.href)){try{await response?.body?.cancel?.();}catch{}throw Error('Original artwork response origin/path changed');}const bytes=await readExact(response,entry.bytes,signal);require(await hash(bytes)===entry.sha256,'Original artwork SHA256 mismatch');abort(signal);files.push(bytes);}
  const grid=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(files[1]));require(grid.columns===129&&grid.rows===193&&grid.imageWidth===1024&&grid.imageHeight===1536&&grid.sourceSHA256===spec.png.sha256&&Array.isArray(grid.alpha)&&grid.alpha.length===129*193&&grid.alpha.every(n=>Number.isInteger(n)&&n>=0&&n<=255),'Frozen original alpha grid required');
  texture=await decode(files[0]);require(texture?.isTexture&&texture.image?.width===1024&&texture.image?.height===1536,'Exact decoded original image required');abort(signal);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=1;
  output=createRefinedSideRelief(subjectId,{...grid,alpha:Uint8Array.from(grid.alpha)},{texture,height:2.25,ownsTexture:true});texture=null;abort(signal);
  output.meta.originalAsset={subjectId:spec.subjectId,class:spec.class,pngSHA256:spec.png.sha256,gridSHA256:spec.grid.sha256};
  Object.assign(output.meta,{candidateStatus:'PRIVATE_PREPARATION_WAITING_CENTRAL_USER_CONFIRMATION',placementAssigned:false,runtimeVerification:'NOT_RENDERED_NOT_HALL_TESTED'});

  return output;
 }catch(error){output?.dispose();texture?.dispose?.();throw error;}
}

