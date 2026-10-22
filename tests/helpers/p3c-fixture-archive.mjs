/** Test-only transport reader. Never generates or changes an oracle. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
const hash=(data,algorithm='sha256')=>crypto.createHash(algorithm).update(data).digest('hex');
export function readFixtureArchive(indexPath){
 const filename=indexPath instanceof URL?fileURLToPath(indexPath):path.resolve(indexPath);
 const index=JSON.parse(fs.readFileSync(filename));
 assert.equal(index.format,1,'fixture index format');
 assert.equal(index.partSize,120000,'fixture part size');
 assert.equal(index.gzipName,path.basename(filename).replace(/\.index\.json$/,''),'fixture gzip name');
 assert.ok(Number.isSafeInteger(index.gzipBytes)&&index.gzipBytes>0,'fixture gzip bytes');
 assert.ok(Number.isSafeInteger(index.originalBytes)&&index.originalBytes>0&&index.originalBytes<=10*1024*1024,'fixture expanded size bound');
 assert.equal(index.parts.length,Math.ceil(index.gzipBytes/index.partSize),'fixture part count');
 const pieces=index.parts.map((part,i)=>{
  assert.equal(part.index,i,'fixture part order');
  assert.equal(part.path,`${index.gzipName}.part-${String(i).padStart(4,'0')}`,'fixture part path');
  assert.equal(path.basename(part.path),part.path,'fixture part path');
  const bytes=fs.readFileSync(path.join(path.dirname(filename),part.path));
  assert.equal(bytes.length,Math.min(index.partSize,index.gzipBytes-i*index.partSize),'fixture part length');
  assert.equal(bytes.length,part.bytes,'fixture declared part length');
  assert.equal(hash(bytes),part.sha256,'fixture part SHA256');return bytes;
 });
 const gzip=Buffer.concat(pieces);assert.equal(gzip.length,index.gzipBytes,'fixture gzip length');
 assert.equal(hash(gzip),index.gzipSha256,'fixture complete gzip SHA256');
 const original=gunzipSync(gzip,{maxOutputLength:index.originalBytes});
 assert.equal(original.length,index.originalBytes,'fixture original byte length');
 assert.equal(hash(original),index.originalSha256,'fixture original SHA256');
 assert.equal(hash(Buffer.concat([Buffer.from(`blob ${original.length}\0`),original]),'sha1'),index.originalGitBlobSha,'fixture original Git blob');
 return original;
}
