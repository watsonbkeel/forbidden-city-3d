import * as T from 'three';
import fs from 'node:fs';
import {TextureLibrary,TEXTURE_SPECS} from '../../src/utils/TextureLibrary.js';
// Existing r58-court-facade-fixture pattern: REAL material/cache/ownership APIs,
// manifest-sized inert image handles only; no decoded pixels or file-load claim.
export function library(){
 const lib=new TextureLibrary();lib.manifest=JSON.parse(fs.readFileSync(new URL('../../public/textures/hd/manifest.json',import.meta.url)));
 for(const name of Object.keys(TEXTURE_SPECS)){
  const entry=lib.manifest.textures[name],size=entry?.hd;
  if(!size||!Number.isFinite(size.width)||!Number.isFinite(size.height)||size.width<=0||size.height<=0)throw Error('Missing real manifest dimensions: '+name);
  lib.colors.set(name,lib.configure(new T.Texture({...size}),name,'color'));
  if(entry.normal)lib.normals.set(name,lib.configure(new T.Texture({...size}),name,'normal'));
 }
 return lib;
}
