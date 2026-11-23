import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,symlinkSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync,inflateSync} from 'node:zlib';
import {dirname,join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
const expected = '65a6ef0605ba854c33a797933e395ea5726216bd7f875e9164e5cb1f87eae640';
const checksum=b=>createHash('sha256').update(b).digest('hex');
// Materialize the delivered R140 Enclosure import graph only. Never overlay
// historical modules on the live scene; unchanged working bytes require hashes.
export function stageNativeR140Enclosure(){
 const raw=readFileSync(join(root,'tests/fixtures/r140/native-enclosure.json'));assert.equal(checksum(raw),expected);
 const manifest=JSON.parse(raw),lock=JSON.parse(readFileSync(join(root,'package-lock.json')));
 assert.deepEqual(manifest.three,lock.packages['node_modules/three']);
 const installed=JSON.parse(readFileSync(join(root,'node_modules/three/package.json')));
 assert.equal(installed.version,manifest.three.version);
 const tmp=mkdtempSync(join(tmpdir(),'qa-r140-wall-'));
 const dispose=()=>rmSync(tmp,{recursive:true,force:true});
 try{
  for(const [p,v] of Object.entries(manifest.files)){
   const bytes=v.from?readFileSync(join(root,v.from)):v.fromGzip?gunzipSync(readFileSync(join(root,v.fromGzip))):inflateSync(Buffer.from(v.nativeDeflateBase64,'base64'));
   assert.equal(checksum(bytes),v.sha256,p);
   const f=resolve(tmp,p);mkdirSync(dirname(f),{recursive:true});writeFileSync(f,bytes);
  }
  writeFileSync(join(tmp,'package.json'),'{"type":"module"}');
  mkdirSync(join(tmp,'node_modules'));symlinkSync(join(root,'node_modules','three'),join(tmp,'node_modules','three'),'dir');
  const mod=p=>import(pathToFileURL(join(tmp,p)).href);
  return {dispose,async load(){
   const [{Enclosure},oldE,{library}]=await Promise.all([mod('src/scene/Enclosure.js'),mod('src/scene/EnclosureR139.js'),mod('tests/lib/inner-palace-fixture.mjs')]);
   return {Enclosure,oldE,library};
  }};
 }catch(e){dispose();throw e;}
}
