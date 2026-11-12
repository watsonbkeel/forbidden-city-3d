import * as T from 'three';
import {createOriginalRelief} from './OriginalBuddhaRelief.js';
import {createRefinedCentralRelief} from './RefinedCentralBuddha.js';
export const REFINED_CENTRAL_ORIGINAL_ARTWORK=Object.freeze({subjectId:'shakyamuni',class:'ORIGINAL_GENERATED_ART_NOT_PHOTO_OR_SCAN',imageWidth:1024,imageHeight:1536,png:Object.freeze({path:'textures/dafotang-original/shakyamuni-refined-v2.png',bytes:2624019,sha256:'b6e856029b1cc55d3222c866fe8448eddd91db5c6a9eeca7a1b97773ac077b5d'}),grid:Object.freeze({path:'textures/dafotang-original/shakyamuni-refined-alpha-grid-v2.json',bytes:77202,sha256:'7dcc6a376c62e5a2c638fd7fabbfb4735955fdd8e4f4c5e6b28e4ed74dd82ec3'})});
// Active spec only. The retired center V1 experiment remains in preserved history, not distribution.
export const CENTRAL_ORIGINAL_ARTWORK=REFINED_CENTRAL_ORIGINAL_ARTWORK;
const sideUnknown=Object.freeze(['exact face and curls','hand gesture','medicine bowl and forehead bead if present','robe folds and decoration','eight lotus tiers','high pedestal proportion','side and back appearance']);
export const ORIGINAL_BUDDHA_ARTWORK=Object.freeze({
 shakyamuni:CENTRAL_ORIGINAL_ARTWORK,
 amitabha:Object.freeze({subjectId:'amitabha',hallSide:'west',displayName:'阿弥陀佛',class:'ORIGINAL_GENERATED_ART_NOT_PHOTO_OR_SCAN',imageWidth:1024,imageHeight:1536,unknown:sideUnknown,png:Object.freeze({path:'textures/dafotang-original/amitabha-v1.png',bytes:2824389,sha256:'24b05c7dbedb48d9bb6364244f5db7d063394194259219ef07f395a2497598c2'}),grid:Object.freeze({path:'textures/dafotang-original/amitabha-alpha-grid-v1.json',bytes:77705,sha256:'ea7120501fdd106281450a053f68ad6ea05b2e711161d93d1fa7733854f7d42e'})}),
 bhaisajyaguru:Object.freeze({subjectId:'bhaisajyaguru',hallSide:'east',displayName:'药师佛',class:'ORIGINAL_GENERATED_ART_NOT_PHOTO_OR_SCAN',imageWidth:1024,imageHeight:1536,unknown:sideUnknown,png:Object.freeze({path:'textures/dafotang-original/bhaisajyaguru-v1.png',bytes:2844354,sha256:'a94306512c70cf4a01c9fdfe187d4e8c7e5a481fb983c9ebb177d35401106d51'}),grid:Object.freeze({path:'textures/dafotang-original/bhaisajyaguru-alpha-grid-v1.json',bytes:78116,sha256:'01d43666609f3e8167dbd83cd50e1d030b80b0654ed0ee295c3ad330f6423024'})}),
});
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
export async function loadOriginalBuddhaArtwork(subjectId,{baseURL=new URL(import.meta.env?.BASE_URL??'/',globalThis.location?.href??'https://unconfigured.invalid/').href,fetchFn=globalThis.fetch,decodeTexture:decode=decodeTexture,signal,centralRevision}={}){
 require(centralRevision===undefined||centralRevision==='refined-eight-tier-v2','Allowlisted central revision required');
 require(subjectId!=='shakyamuni'||centralRevision==='refined-eight-tier-v2','Explicit refined center revision required; legacy center V1 is retired');
 const refined=subjectId==='shakyamuni'&&centralRevision==='refined-eight-tier-v2';
 const spec=refined?REFINED_CENTRAL_ORIGINAL_ARTWORK:typeof subjectId==='string'&&Object.hasOwn(ORIGINAL_BUDDHA_ARTWORK,subjectId)?ORIGINAL_BUDDHA_ARTWORK[subjectId]:null;require(spec,'Allowlisted original Buddha subject required');
 const base=new URL(baseURL);require(['http:','https:'].includes(base.protocol)&&!base.username&&!base.password,'Same-origin HTTP asset base required');
 if(globalThis.location?.href)require(base.origin===new URL(globalThis.location.href).origin,'Same-origin page asset base required');
 let texture,output;
 try{
  abort(signal);const files=[];
  for(const entry of [spec.png,spec.grid]){const url=new URL(entry.path,base);require(url.origin===base.origin,'Same-origin asset required');const response=await fetchFn(url.href,{signal,credentials:'omit',redirect:'error',mode:'same-origin'});if(signal?.aborted){try{await response?.body?.cancel?.();}catch{}abort(signal);}if(response?.redirected===true||(response?.url&&response.url!==url.href)){try{await response?.body?.cancel?.();}catch{}throw Error('Original artwork response origin/path changed');}const bytes=await readExact(response,entry.bytes,signal);require(await hash(bytes)===entry.sha256,'Original artwork SHA256 mismatch');abort(signal);files.push(bytes);}
  const grid=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(files[1]));require(grid.columns===129&&grid.rows===193&&grid.imageWidth===1024&&grid.imageHeight===1536&&grid.sourceSHA256===spec.png.sha256&&Array.isArray(grid.alpha)&&grid.alpha.length===129*193&&grid.alpha.every(n=>Number.isInteger(n)&&n>=0&&n<=255),'Frozen original alpha grid required');
  texture=await decode(files[0]);require(texture?.isTexture&&texture.image?.width===1024&&texture.image?.height===1536,'Exact decoded original image required');abort(signal);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=1;
  output=(refined?createRefinedCentralRelief:createOriginalRelief)({...grid,alpha:Uint8Array.from(grid.alpha)},{texture,height:2.25,ownsTexture:true});texture=null;abort(signal);
  output.meta.originalAsset={subjectId:spec.subjectId,class:spec.class,pngSHA256:spec.png.sha256,gridSHA256:spec.grid.sha256};
  if(spec.hallSide){Object.assign(output.meta,{subjectId:spec.subjectId,hallSide:spec.hallSide,displayName:spec.displayName,candidateStatus:'PRIVATE_PREPARATION_WAITING_CENTRAL_USER_CONFIRMATION',coordinateContract:'POSITIVE_X_WEST__NEGATIVE_X_EAST__NEGATIVE_Z_SOUTH',placementAssigned:false,unknown:[...spec.unknown],runtimeVerification:'NOT_RENDERED_NOT_HALL_TESTED'});output.mesh.name=`original-${spec.subjectId}-shallow-relief-research`;}
  return output;
 }catch(error){output?.dispose();texture?.dispose?.();throw error;}
}

// Explicit center-only V2 opt-in: callers must supply centralRevision. Importing this module does not
// load any asset, register photographs, place a mesh or activate side figures.
export function loadOriginalCentralArtwork(options={}){return loadOriginalBuddhaArtwork('shakyamuni',options);}
