import {DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, Texture} from 'three';

const subjects = new Set(['amitabha','shakyamuni','bhaisajyaguru']);
export function hasTextureFirstQuery(search) {
  const p = new URLSearchParams(search);
  return p.getAll('triad').length === 1 && p.get('triad') === 'texture-first';
}

// Browser entry defaults to the selected manual-trial artwork. An explicit
// triad=legacy (or an unknown/ambiguous selector) keeps the old presentation.
export function usesTextureFirstTriad(search) {
  return !new URLSearchParams(search).has('triad') || hasTextureFirstQuery(search);
}

// Restores the finite front-facing artwork of the manual trial, not a 360° statue.
export function makeTextureFirstCard(subjectId, texture) {
  if (!subjects.has(subjectId) || !texture?.isTexture) throw Error('Allowlisted subject and texture required');
  const geo = new PlaneGeometry(1.25, 2.25, 24, 32), p = geo.attributes.position;
  for (let i=0; i<p.count; i++) {
    const x=p.getX(i), y=p.getY(i);
    p.setXYZ(i,x,y+1.125,.025+.025*Math.cos(x/1.25*Math.PI)*Math.cos(y/2.25*Math.PI));
  }
  p.needsUpdate=true; geo.computeVertexNormals();
  texture.colorSpace=SRGBColorSpace; texture.flipY=true; texture.needsUpdate=true;
  const mat=new MeshBasicMaterial({map:texture,alphaTest:.2,side:DoubleSide,toneMapped:false});
  const mesh=new Mesh(geo,mat); mesh.name='texture-first-'+subjectId;
  const meta={originalAsset:{subjectId},historicalPhoto:false,complete:false,method:'TEXTURE_FIRST_FIXED_SHALLOW_CARD',
    back:'NOT_SCULPTED',textureAspect:'full original mapped to shared bounded 1.25 by 2.25 presentation',defaultProductReplacement:false};
  let disposed=false;
  return {mesh,meta,dispose(){
    if(disposed)return; disposed=true; const errors=[];
    for(const r of [geo,mat,texture])try{r.dispose();}catch(e){errors.push(e);}
    if(errors.length)throw new AggregateError(errors,'Texture-first cleanup failed');
  }};
}
function checkAbort(signal) {
  if(signal?.aborted)throw Object.assign(new Error('Texture-first cancelled'),{name:'AbortError'});
}
async function decodeOriginal(blob) {
  const url=URL.createObjectURL(blob);
  try {
    const image=new Image(); image.src=url; await image.decode();
    if(image.width!==1024 || image.height!==1536)throw Error('Unexpected original painting dimensions');
    return new Texture(image);
  } finally {URL.revokeObjectURL(url);}
}
export async function loadTextureFirst({subjectId,signal,fetchFn=globalThis.fetch,decode=decodeOriginal,baseURL}={}) {
  if(!subjects.has(subjectId))throw Error('Allowlisted texture-first subject required');
  checkAbort(signal);
  const root=baseURL??new URL(import.meta.env?.BASE_URL??'./',document.baseURI).href;
  const url=new URL('textures/dafotang-original/'+subjectId+'-refined-v2.png',root);
  const response=await fetchFn(url.href,{signal,credentials:'same-origin',mode:'same-origin',redirect:'error'});
  if(!response.ok)throw Error('Texture-first HTTP '+response.status);
  const blob=await response.blob(); checkAbort(signal);
  let texture;
  try {texture=await decode(blob);checkAbort(signal);return makeTextureFirstCard(subjectId,texture);}
  catch(error){texture?.dispose();throw error;}
}
