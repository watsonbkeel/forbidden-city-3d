import * as T from 'three';
import {createOriginalRelief} from './OriginalBuddhaRelief.js';
export const CENTRAL_ORIGINAL_ARTWORK=Object.freeze({subjectId:'shakyamuni',class:'ORIGINAL_GENERATED_ART_NOT_PHOTO_OR_SCAN',imageWidth:1024,imageHeight:1536,png:Object.freeze({path:'textures/dafotang-original/shakyamuni-v1.png',bytes:2800488,sha256:'a20db98c8d0002eab16a89e693d01b87cd2aaf3c09a743ec14bab34258f8ada2'}),grid:Object.freeze({path:'textures/dafotang-original/shakyamuni-alpha-grid-v1.json',bytes:77529,sha256:'a38e000c41944ebe3a459f78876dee58f568bac5e50d279d45504e7e626a94b1'})});
const require=(v,m)=>{if(!v)throw Error(m);};
const abort=signal=>{if(signal?.aborted)throw Object.assign(Error('Original artwork load cancelled'),{name:'AbortError'});};
const hash=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),n=>n.toString(16).padStart(2,'0')).join('');
async function readExact(response,expected,signal){
 const reject=async message=>{try{await response?.body?.cancel?.();}catch{}throw Error(message);};
 if(!response?.ok)await reject('Original artwork HTTP failure');
 const length=response.headers?.get('content-length');if(length!==null&&length!==undefined&&(!/^\d+$/.test(length)||Number(length)!==expected))await reject('Original artwork byte identity mismatch');
 require(expected>0&&expected<=4*1024*1024,'Bounded original artwork bytes required');
 if(!response.body?.getReader){const bytes=new Uint8Array(await response.arrayBuffer());abort(signal);require(bytes.length===expected,'Original artwork byte identity mismatch');return bytes;}
 const reader=response.body.getReader(),bytes=new Uint8Array(expected);let offset=0,ended=false;
 try{for(;;){abort(signal);const next=await reader.read();abort(signal);if(next.done){ended=true;break;}require(next.value instanceof Uint8Array&&offset+next.value.length<=expected,'Original artwork exceeds frozen size');bytes.set(next.value,offset);offset+=next.value.length;}require(offset===expected,'Original artwork truncated');return bytes;}
 finally{if(!ended)await reader.cancel().catch(()=>{});reader.releaseLock();}
}
async function decodeTexture(bytes){const url=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));try{const image=new Image();image.src=url;await image.decode();const t=new T.Texture(image);t.needsUpdate=true;return t;}finally{URL.revokeObjectURL(url);}}
/** Only our immutable original assets, same origin and full byte/hash identity before
 * any image decode. Original images never enter the approved-photograph registry.
 */
export async function loadOriginalCentralArtwork({baseURL=new URL(import.meta.env?.BASE_URL??'/',globalThis.location?.href??'https://unconfigured.invalid/').href,fetchFn=globalThis.fetch,decodeTexture:decode=decodeTexture,signal}={}){
 const spec=CENTRAL_ORIGINAL_ARTWORK,base=new URL(baseURL);require(['http:','https:'].includes(base.protocol),'Same-origin HTTP asset base required');
 let texture,output;
 try{
  abort(signal);const files=[];
  for(const entry of [spec.png,spec.grid]){const url=new URL(entry.path,base);require(url.origin===base.origin,'Same-origin asset required');const response=await fetchFn(url.href,{signal,credentials:'omit',redirect:'error',mode:'same-origin'});abort(signal);const bytes=await readExact(response,entry.bytes,signal);require(await hash(bytes)===entry.sha256,'Original artwork SHA256 mismatch');abort(signal);files.push(bytes);}
  const grid=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(files[1]));require(grid.columns===129&&grid.rows===193&&grid.imageWidth===1024&&grid.imageHeight===1536&&grid.sourceSHA256===spec.png.sha256&&Array.isArray(grid.alpha)&&grid.alpha.length===129*193&&grid.alpha.every(n=>Number.isInteger(n)&&n>=0&&n<=255),'Frozen original alpha grid required');
  texture=await decode(files[0]);require(texture?.isTexture&&texture.image?.width===1024&&texture.image?.height===1536,'Exact decoded original image required');abort(signal);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=1;
  output=createOriginalRelief({...grid,alpha:Uint8Array.from(grid.alpha)},{texture,height:2.25,ownsTexture:true});texture=null;abort(signal);
  output.meta.originalAsset={subjectId:spec.subjectId,class:spec.class,pngSHA256:spec.png.sha256,gridSHA256:spec.grid.sha256};return output;
 }catch(error){output?.dispose();texture?.dispose?.();throw error;}
}
