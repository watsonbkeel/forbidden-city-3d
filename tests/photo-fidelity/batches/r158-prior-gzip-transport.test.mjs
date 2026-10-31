import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {readVerifiedChunkedGzip} from '../../lib/r157-verified-chunked-gzip.mjs';
const cases=[['C','r157-taihemen-world-fixture.mjs','TAIHEMEN_WORLD_FIXTURE_PIN','readTaihemenWorldFixture','r157-taihemen-integration'],['Wenhua','r158-wenhua-world-fixture.mjs','WENHUA_493_GZIP_PIN','readWenhua493Gzip','r158-wenhua-gate-integration']];
for(const [label,module,pinName,readerName,dir] of cases)test(`${label} real pinned fixture: original, blocks, and fail-closed mutations`,async()=>{
 const m=await import(new URL('../../lib/'+module,import.meta.url)),pin=m[pinName],original=m[readerName]();
 assert.equal(crypto.createHash('sha256').update(original).digest('hex'),pin.compressedSHA256);
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'r158-prior-gzip-'));try{
  const file=path.join(root,pin.filename),chunks=file+'.chunks';
  fs.cpSync(new URL('../../fixtures/'+dir+'/'+pin.filename+'.chunks',import.meta.url),chunks,{recursive:true});
  assert.deepEqual(readVerifiedChunkedGzip(file,pin),original,'blocks reproduce exact bytes');
  const first=path.join(chunks,'000000.b64'),saved=fs.readFileSync(first);fs.unlinkSync(first);
  assert.throws(()=>readVerifiedChunkedGzip(file,pin),'missing block fatal');
  fs.writeFileSync(file,original);assert.deepEqual(readVerifiedChunkedGzip(file,pin),original,'valid original preferred even if block absent');
  fs.writeFileSync(file,Buffer.from('corrupt'));assert.throws(()=>readVerifiedChunkedGzip(file,pin),'corrupt original cannot fallback');fs.unlinkSync(file);
  fs.writeFileSync(first,saved);const second=path.join(chunks,'000001.b64'),saved2=fs.readFileSync(second);fs.writeFileSync(first,saved2);fs.writeFileSync(second,saved);assert.throws(()=>readVerifiedChunkedGzip(file,pin),'swapped blocks fatal');fs.writeFileSync(first,saved);fs.writeFileSync(second,saved2);
  const manifest=path.join(chunks,'manifest.json'),raw=fs.readFileSync(manifest);fs.appendFileSync(manifest,' ');assert.throws(()=>readVerifiedChunkedGzip(file,pin),'manifest tamper fatal');fs.writeFileSync(manifest,raw);
  const altered=Buffer.from(saved);altered[10]=altered[10]===65?66:65;fs.writeFileSync(first,altered);assert.throws(()=>readVerifiedChunkedGzip(file,pin),'chunk tamper fatal');
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
