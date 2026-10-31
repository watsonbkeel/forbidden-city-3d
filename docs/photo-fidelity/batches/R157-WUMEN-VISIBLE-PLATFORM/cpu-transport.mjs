import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readVerifiedChunkedGzip} from '../../../../tests/lib/r157-verified-chunked-gzip.mjs';
export const root=fs.realpathSync(fileURLToPath(new URL('../../../../',import.meta.url)));
export function outsideOutput(value){
 const requested=path.resolve(value);
 const out=path.join(fs.realpathSync(path.dirname(requested)),path.basename(requested));
 if(out===root||out.startsWith(root+path.sep))throw Error('Output must be outside repository');
 try{fs.lstatSync(out);throw Error('Output already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
 return out;
}
const bytes=fs.readFileSync(new URL('./CPU-TRANSPORT-PINS.json',import.meta.url));
if(createHash('sha256').update(bytes).digest('hex')!=='f908d8bf5ac3084305b585b820d1f09e54f999432940868c631e1fb65b3ebb03')throw Error('CPU transport pins digest mismatch');
export const entries=JSON.parse(bytes).entries;
export function verifyAll(){return entries.map(e=>({path:e.path,bytes:readVerifiedChunkedGzip(path.join(root,e.path),e.pin)}));}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const rows=verifyAll();
 if(process.argv.length===2)console.log(JSON.stringify({verified:rows.length,scope:'8 logical CPU gzip; not full historical evidence mirror'}));
 else if(process.argv.length===4&&process.argv[2]==='--restore'){
  const out=outsideOutput(process.argv[3]);
  // Create-only separate export: never replace the repository's originals.
  fs.mkdirSync(out,{recursive:false});
  for(const row of rows){const target=path.join(out,row.path);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,row.bytes,{flag:'wx'});}
  console.log(JSON.stringify({restored:rows.length,out}));
 }else throw Error('Usage: node cpu-transport.mjs [--restore NEW_OUTSIDE_DIRECTORY]');
}
