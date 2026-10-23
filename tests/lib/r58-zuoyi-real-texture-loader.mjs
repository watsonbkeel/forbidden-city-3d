import * as THREE from 'three';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {TextureLibrary} from '../../src/utils/TextureLibrary.js';
const {createCanvas,loadImage}=createRequire(import.meta.url)('@napi-rs/canvas');

/** Offline transport adapter only: the real load() selects jobs, configure()
 * configures every returned texture, and load() sets loadedFromFile itself.
 * scope='all' gives a completely real component asset library. scope='door'
 * loads the real door dependencies only; other entries are ordinary fallbacks
 * and MUST NOT be described as real-image evidence for other world materials.
 */
export async function loadLocalTextureLibrary({quality='hd',scope='all',failFiles=[]}={}){
 const baseURL=new URL(`../../public/textures/${quality}/`,import.meta.url),
  lib=new TextureLibrary({quality,baseUrl:baseURL.href});
 const nativeFetch=globalThis.fetch,nativeDocument=globalThis.document;
 const reads=[];
 globalThis.fetch=async input=>{
  if(String(input)!==new URL('manifest.json',baseURL).href)return nativeFetch(input);
  const manifest=JSON.parse(await readFile(new URL('manifest.json',baseURL),'utf8'));
  return{ok:true,json:async()=>scope==='door'?{...manifest,textures:{door_studded:manifest.textures.door_studded}}:manifest};
 };
 lib.loader.loadAsync=async url=>{
  const file=fileURLToPath(url);reads.push(file);
  if(failFiles.some(name=>file.endsWith('/'+name)))throw Error(`Injected local file read failure: ${file}`);
  const bytes=await readFile(file),image=await loadImage(bytes),canvas=createCanvas(image.width,image.height);
  canvas.getContext('2d').drawImage(image,0,0);return new THREE.CanvasTexture(canvas);
 };
 // Fallbacks require the ordinary Canvas DOM boundary, not a material stub.
 globalThis.document={createElement:()=>createCanvas(1,1),createElementNS:()=>({addEventListener(){},removeEventListener(){}})};
 try{await lib.load();}finally{
  globalThis.fetch=nativeFetch;
  if(nativeDocument===undefined)delete globalThis.document;else globalThis.document=nativeDocument;
 }
 return{library:lib,reads,boundary:scope==='all'?'ALL_MANIFEST_FILES_REAL_LOCAL_LOAD':'DOOR_FILES_REAL_LOCAL_LOAD_OTHER_ENTRIES_PROCEDURAL_FALLBACK'};
}

/** Only door_studded uses the real library. Every other call keeps the provided
 * CPU world library unchanged. Caller owns/disposes realLibrary exactly once.
 */
export function bindRealDoorTextures(cpuLibrary,realLibrary){
 const mixed=Object.create(cpuLibrary);
 for(const name of ['colors','normals','materials','loadedFromFile','quality'])mixed[name]=realLibrary[name];
 for(const method of ['material','tileSize','aspect','color','normal','has'])mixed[method]=(name,...args)=>
  name==='door_studded'?realLibrary[method](name,...args):cpuLibrary[method]?.(name,...args);
 mixed.owns=resource=>realLibrary.owns(resource)||(cpuLibrary.owns?.(resource)??false);
 mixed.allTextures=()=>[...new Set([...(cpuLibrary.allTextures?.()??[]),...realLibrary.allTextures()])];
 return mixed;
}
