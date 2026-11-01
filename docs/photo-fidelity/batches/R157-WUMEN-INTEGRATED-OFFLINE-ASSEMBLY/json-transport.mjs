import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {readVerifiedChunkedGzip} from '../../../../tests/lib/r157-verified-chunked-gzip.mjs';
export const root=fs.realpathSync(fileURLToPath(new URL('../../../../',import.meta.url)));
const digest=b=>createHash('sha256').update(b).digest('hex');
const pinBytes=fs.readFileSync(new URL('./JSON-TRANSPORT-PIN.json',import.meta.url));
if(digest(pinBytes)!=='81b4a782ca4af18d95fc396f38657ad9114625b7645e303137bd0f9ad1019fe1')throw Error('JSON transport pin mismatch');
const parsed=JSON.parse(pinBytes);
Object.freeze(parsed.gzipPin);
export const pin=Object.freeze(parsed);
export function readEvidence(file=path.join(root,pin.originalPath)){
 file=path.resolve(file);let exists;
 try{fs.lstatSync(file);exists=true;}catch(e){if(e.code!=='ENOENT')throw e;exists=false;}
 let raw;
 if(exists){const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||fs.realpathSync(file)!==file)throw Error('Nonregular JSON original');raw=fs.readFileSync(file);}
 else raw=gunzipSync(readVerifiedChunkedGzip(file+'.transport.gz',pin.gzipPin),{maxOutputLength:pin.originalBytes+1});
 if(raw.length!==pin.originalBytes||digest(raw)!==pin.originalSHA256)throw Error('Original JSON identity mismatch');
 if(createHash('sha1').update(Buffer.from(`blob ${raw.length}\0`)).update(raw).digest('hex')!==pin.originalGitBlobSHA1)throw Error('Original JSON Git identity mismatch');
 return raw;
}
export function outsideOutput(value){
 const requested=path.resolve(value),out=path.join(fs.realpathSync(path.dirname(requested)),path.basename(requested));
 if(out===root||out.startsWith(root+path.sep))throw Error('Output must be outside repository');
 try{fs.lstatSync(out);throw Error('Output already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
 return out;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const raw=readEvidence();
 if(process.argv.length===2)console.log(JSON.stringify({verified:true,bytes:raw.length,sha256:digest(raw),logicalOnly:true}));
 else if(process.argv.length===4&&process.argv[2]==='--restore'){
  const out=outsideOutput(process.argv[3]);fs.mkdirSync(out,{recursive:false});const target=path.join(out,pin.originalPath);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,raw,{flag:'wx'});console.log(JSON.stringify({restored:target,bytes:raw.length}));
 }else throw Error('Usage: node json-transport.mjs [--restore NEW_OUTSIDE_DIRECTORY]');
}
