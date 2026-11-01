import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const sha=b=>createHash('sha256').update(b).digest('hex');
const fail=message=>{throw Error('Frozen gzip fixture: '+message);};
function regularBytes(file){
 const s=fs.lstatSync(file);if(!s.isFile()||s.isSymbolicLink()||fs.realpathSync(file)!==file)fail('nonregular or symlink fixture');return fs.readFileSync(file);
}
export function readVerifiedChunkedGzip(original,pin){
 const file=path.resolve(original instanceof URL?fileURLToPath(original):original);
 if(path.basename(file)!==pin.filename||!Number.isSafeInteger(pin.compressedBytes)||pin.compressedBytes<=0||pin.compressedBytes>64*1024*1024)fail('invalid pinned identity');
 let bytes,exists;
 try{fs.lstatSync(file);exists=true;}catch(e){if(e.code!=='ENOENT')throw e;exists=false;}
 if(exists)bytes=regularBytes(file); // A damaged existing original is never rescued by a fallback.
 else{
  const dir=file+'.chunks',raw=regularBytes(path.join(dir,'manifest.json'));
  if(sha(raw)!==pin.manifestSHA256)fail('manifest digest mismatch');
  const m=JSON.parse(raw);
  for(const k of ['format','filename','originalGitBlobSHA1','compressedBytes','compressedSHA256','uncompressedBytes','uncompressedSHA256','chunkBytes'])if(m[k]!==pin[k])fail('manifest identity mismatch');
  if(!Number.isSafeInteger(m.chunkBytes)||m.chunkBytes<=0||m.chunkBytes>49152||!Array.isArray(m.chunks)||m.chunks.length!==pin.chunkCount||m.chunks.length!==Math.ceil(pin.compressedBytes/m.chunkBytes))fail('invalid chunk layout');
  const blocks=[];
  for(let i=0;i<m.chunks.length;i++){
   const c=m.chunks[i],filename=String(i).padStart(6,'0')+'.b64',expected=Math.min(m.chunkBytes,pin.compressedBytes-i*m.chunkBytes);
   if(c.index!==i||c.filename!==filename||c.bytes!==expected)fail('chunk sequence mismatch');
   const text=regularBytes(path.join(dir,filename));if(sha(text)!==c.textSHA256)fail('chunk text digest mismatch');
   const encoded=text.toString('ascii');if(!encoded.endsWith('\n')||!/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?\n$/.test(encoded))fail('invalid base64 chunk');
   const b=Buffer.from(encoded.slice(0,-1),'base64');if(b.toString('base64')+'\n'!==encoded||b.length!==expected||sha(b)!==c.sha256)fail('chunk byte digest mismatch');blocks.push(b);
  }
  bytes=Buffer.concat(blocks);
 }
 if(bytes.length!==pin.compressedBytes||sha(bytes)!==pin.compressedSHA256)fail('complete compressed identity mismatch');
 const blob=createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');if(blob!==pin.originalGitBlobSHA1)fail('original Git blob identity mismatch');
 const plain=gunzipSync(bytes,{maxOutputLength:pin.uncompressedBytes+1});if(plain.length!==pin.uncompressedBytes||sha(plain)!==pin.uncompressedSHA256)fail('complete uncompressed identity mismatch');
 return bytes;
}
