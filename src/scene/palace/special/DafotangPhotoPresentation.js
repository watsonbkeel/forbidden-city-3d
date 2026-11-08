import * as T from 'three';
import {DAFOTANG_APPROVED_PHOTOS,buildDafotangPhotoTriptych} from './DafotangPhotoTriptych.js';

const PLACE='place-outer-west-6cae88b6a2';
const SUBJECTS={west:'amitabha',center:'shakyamuni',east:'bhaisajyaguru'};
const SLOTS=Object.keys(SUBJECTS), MAX_BYTES=8*1024*1024;
const SOURCES=['https://img.dpm.org.cn/Uploads/File/2020/02/26/u5e56176b64d88.pdf','https://img.dpm.org.cn/Uploads/File/2018/06/04/u5b153792a88ab.pdf'];
// The publications establish order and three equal lower shrine openings, not
// surveyed game coordinates. Fit stays null until actual crops/host are reviewed.
export const DAFOTANG_PHOTO_LAYOUT=Object.freeze({placeId:PLACE,sourceUrls:Object.freeze(SOURCES),
 historicalPeriod:'BEFORE_1973_REMOVAL',wholeHallInventory:'UNKNOWN',complete:false,
 arrangement:'THREE_EQUAL_LOWER_SHRINE_OPENINGS__NORTH_SIDE_FACING_SOUTH',
 coordinateContract:'LOCAL_POSITIVE_X_WEST__NEGATIVE_X_EAST__NEGATIVE_Z_SOUTH',
 figureAndLotusHeight:2.25,squareDaisIncluded:false,
 slots:Object.freeze(SLOTS.map((slot,i)=>Object.freeze({slot,subjectId:SUBJECTS[slot],orderFromSouthViewerLeft:i,assetId:null,fit:null})))});
const clone=x=>JSON.parse(JSON.stringify(x));
const failure=(code,status='BLOCKED')=>({status,reasons:[{code}],group:null,meshes:[],metadata:{...clone(DAFOTANG_PHOTO_LAYOUT),status,complete:false}});
const abort=signal=>{if(signal?.aborted)throw Object.assign(Error('CANCELLED'),{name:'AbortError'});};
const fail=code=>{throw Error(code);};
const hash=async b=>[...new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256',b))].map(n=>n.toString(16).padStart(2,'0')).join('');
function requests(manifest,approvedAssets,baseURL){
 if(!Array.isArray(manifest)||manifest.length!==3||SLOTS.some(s=>manifest.filter(m=>m.slot===s).length!==1))fail('THREE_AUTHORIZED_PHOTOS_REQUIRED');
 const base=new URL(baseURL),out=[];
 if(!['https:','http:'].includes(base.protocol))fail('SAME_ORIGIN_ASSET_REQUIRED');
 for(const slot of SLOTS){
  const m=manifest.find(m=>m.slot===slot),a=Object.hasOwn(approvedAssets,m.assetId)?approvedAssets[m.assetId]:null;
  if(!a)fail('HOST_APPROVED_ASSET_REQUIRED');
  if(a.assetId!==m.assetId||a.subjectId!==SUBJECTS[slot]||a.subjectConfirmed!==true||a.publicRedistribution!==true||a.unmirrored!==true||a.transparentBackground!==true||
   !['rightsHolder','license','permissionEvidence','sourceUrl'].every(k=>typeof a[k]==='string'&&a[k].trim())||!/^https:\/\//.test(a.sourceUrl)||!/^([a-f0-9]{64})$/.test(a.sourceSha256))fail('PHOTO_NOT_APPROVED');
  if(!/^textures\/dafotang\/[A-Za-z0-9_-]+\.(png|webp)$/.test(a.localPath))fail('LOCAL_ASSET_PATH_REQUIRED');
  if(m.fit?.status!=='MODEL_FIT_NOT_SURVEY'||!Array.isArray(m.fit.figureBase)||m.fit.figureBase.length!==3||!m.fit.figureBase.every(Number.isFinite))fail('MODEL_FIT_REQUIRED');
  const d=a.pixelDimensions,b=a.figureAndLotusBounds;
  if(!Array.isArray(d)||d.length!==2||!d.every(n=>Number.isInteger(n)&&n>0&&n<=8192)||d[0]*d[1]>16*1024*1024||!Array.isArray(b)||b.length!==4||!b.every(n=>Number.isFinite(n)&&n>=0&&n<=1)||b[0]>=b[2]||b[1]>=b[3])fail('CROP_INVALID');
  const url=new URL(a.localPath,base);if(url.origin!==base.origin)fail('SAME_ORIGIN_ASSET_REQUIRED');out.push({m,a,url:url.href});
 }
 if(new Set(out.map(r=>r.m.assetId)).size!==3||!(out[0].m.fit.figureBase[0]>out[1].m.fit.figureBase[0]&&out[1].m.fit.figureBase[0]>out[2].m.fit.figureBase[0]))fail('WEST_EAST_ORDER_INVALID');
 return out;
}
async function readBytes(response,signal){
 const rejectUnread=async code=>{try{await response?.body?.cancel?.();}catch{/* Keep the original rejection. */}fail(code);};
 if(!response?.ok)await rejectUnread('ASSET_HTTP_ERROR');
 const length=response.headers?.get('content-length');if(length!==null&&length!==undefined&&(!/^\d+$/.test(length)||Number(length)>MAX_BYTES))await rejectUnread('ASSET_BYTE_LIMIT');
 if(!response.body?.getReader){const b=new Uint8Array(await response.arrayBuffer());abort(signal);if(b.length>MAX_BYTES)fail('ASSET_BYTE_LIMIT');return b;}
 const reader=response.body.getReader(),chunks=[];let size=0,finished=false;
 try{while(true){abort(signal);const {done,value}=await reader.read();abort(signal);if(done){finished=true;break;}size+=value.byteLength;if(size>MAX_BYTES)fail('ASSET_BYTE_LIMIT');chunks.push(value);}const all=new Uint8Array(size);let p=0;for(const c of chunks){all.set(c,p);p+=c.length;}return all;}
 finally{if(!finished)await reader.cancel().catch(()=>{});reader.releaseLock();}
}
async function decodeImage(bytes,record){
 const url=URL.createObjectURL(new Blob([bytes],{type:record.localPath.endsWith('.png')?'image/png':'image/webp'}));
 try{const image=new Image();image.src=url;await image.decode();const texture=new T.Texture(image);texture.needsUpdate=true;return texture;}
 finally{URL.revokeObjectURL(url);}
}
/** Staged loader. It never contacts sourceUrl or accepts manifest self-approval.
 * All THREE source files are hashed before ANY decoding. Success is not visual
 * acceptance; actual photos, crop quality and host physics still require review. */
export async function loadDafotangPhotos({manifest=DAFOTANG_PHOTO_LAYOUT.slots,approvedAssets=DAFOTANG_APPROVED_PHOTOS,
 baseURL=new URL(import.meta.env?.BASE_URL??'/',globalThis.location?.href??'https://unconfigured.invalid/').href,
 fetchFn=globalThis.fetch,decodeTexture=decodeImage,signal}={}){
 const textures={};let output;
 try{
  abort(signal);const rows=requests(manifest,approvedAssets,baseURL),files=[];
  for(const row of rows){abort(signal);const response=await fetchFn(row.url,{signal,credentials:'omit',redirect:'error',mode:'same-origin'});abort(signal);const bytes=await readBytes(response,signal);if(await hash(bytes)!==row.a.sourceSha256)fail('SOURCE_HASH_MISMATCH');abort(signal);files.push(bytes);}
  for(let i=0;i<rows.length;i++){abort(signal);const row=rows[i],texture=await decodeTexture(files[i],row.a);if(texture?.isTexture)textures[row.m.assetId]=texture;else fail('DECODED_TEXTURE_REQUIRED');abort(signal);texture.userData.sourceSha256=row.a.sourceSha256;}
  output=buildDafotangPhotoTriptych({manifest,textures,approvedAssets});abort(signal);return output;
 }catch(error){output?.dispose?.();return failure(error.name==='AbortError'?'CANCELLED':String(error.message),error.name==='AbortError'?'CANCELLED':'BLOCKED');}
 finally{for(const texture of Object.values(textures))texture.dispose();}
}
/** Adds only serialized literature/status to the real unchanged single hall. */
export function registerDafotangPhotoSlots({p,g}){
 if(p?.id!==PLACE||p.key!=='dafotang'||g?.id!==PLACE||g.inventory?.status!=='UNKNOWN'||g.historicalPrincipal?.id!=='dafotang-shakyamuni-historical-fit')throw Error('Dafotang retained historical host required');
 if(g.photoPresentation)throw Error('Duplicate Dafotang photo registration');
 g.photoPresentation={...clone(DAFOTANG_PHOTO_LAYOUT),status:'BLOCKED',reason:'THREE_CORRECT_AUTHORIZED_PHOTOS_AND_PLACEMENTS_REQUIRED',existingVisual:g.triadFit?.id==='dafotang-three-design-figures-v1'?'THREE_DISTINCT_DESIGN_MODELS_NOT_PHOTOS':'ONE_HISTORICAL_CENTRAL_MODEL_NOT_THREE_PHOTOS'};
 return g.photoPresentation;
}

// Exact construction roles after material batching. Square dais courses are
// permanent architecture, not part of the photographic figure and lotus.
const FIGURE_AND_LOTUS_MATERIALS=[
 'dafotang_principal_worn_gold',
 'dafotang_principal_red_lacquer',
 'dafotang_principal_dark_curls',
];
const PERMANENT_DAIS_MATERIAL='dafotang_principal_fitted_support';
/** Final merged-group lifecycle, never the discarded construction frame.
 * Existing collision/support records are untouched. Preserving that central
 * model collision is NOT acceptance of three photographic silhouettes/routes. */
export function createDafotangPhotoSession(group,options={}){
 const records=group?.userData?.architecture?.filter(r=>r.id===PLACE)??[];
 if(!group?.isGroup||group.name!=='outer-west'||group.position.lengthSq()||!group.quaternion.equals(new T.Quaternion())||!group.scale.equals(new T.Vector3(1,1,1))||records.length!==1||records[0].historicalPrincipal?.id!=='dafotang-shakyamuni-historical-fit'||records[0].inventory?.status!=='UNKNOWN')throw Error('Exact finished Dafotang architecture required');
 const exactBucket=name=>{const found=group.children.filter(m=>m.isMesh&&!Array.isArray(m.material)&&m.material.name===name);if(found.length!==1)throw Error('Exact unique merged principal material required');return found[0];};
 const old=FIGURE_AND_LOTUS_MATERIALS.map(exactBucket);
 // Validate the retained support owner without changing its visibility or resources.
 exactBucket(PERMANENT_DAIS_MATERIAL);
 const previous=old.map(m=>m.visible),controller=new AbortController();let disposed=false,output=null;
 const state=records[0].photoPresentation??(records[0].photoPresentation=clone(DAFOTANG_PHOTO_LAYOUT));
 // Empty/invalid registry has no asynchronous work: retain the existing cache
 // behavior even if a zone is unloaded in this same synchronous turn.
 let rejected;
 try{requests(options.manifest??DAFOTANG_PHOTO_LAYOUT.slots,options.approvedAssets??DAFOTANG_APPROVED_PHOTOS,options.baseURL??new URL(import.meta.env?.BASE_URL??'/',globalThis.location?.href??'https://unconfigured.invalid/').href);}
 catch(error){rejected=failure(String(error.message));}
 const session={status:rejected?'BLOCKED':'LOADING',presentation:null,ready:null,dispose(){if(disposed)return;disposed=true;controller.abort();output?.group?.removeFromParent();output?.dispose?.();output=null;old.forEach((m,i)=>m.visible=previous[i]);session.presentation=null;session.status=state.status='DISPOSED';}};
 state.status=session.status;
 session.ready=(rejected?Promise.resolve(rejected):loadDafotangPhotos({...options,signal:controller.signal})).then(result=>{
  if(disposed){result.dispose?.();return session;}
  session.status=state.status=result.status;state.complete=false;
  if(result.status!=='READY_FOR_HOST_QA'){state.reasons=clone(result.reasons);return session;}
  try{result.group.position.set(221.9,0,241.1);group.add(result.group);if(disposed)throw Error('Disposed during publish');old.forEach(m=>m.visible=false);output=result;session.presentation=result.group;state.display='THREE_PHOTO_PLANES_PENDING_VISUAL_AND_HOST_ACCEPTANCE';}
  catch(error){result.group.removeFromParent();result.dispose();old.forEach((m,i)=>m.visible=previous[i]);session.status=state.status=disposed?'DISPOSED':'BLOCKED';state.reasons=[{code:disposed?'CANCELLED':'HOST_PUBLISH_FAILED'}];}
  return session;
 });
 return session;
}
