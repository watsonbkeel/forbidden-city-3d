/** Verify exact original bytes; restore only into an explicitly new directory. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readFixtureArchive} from '../tests/helpers/p3c-fixture-archive.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const hash=(bytes,algorithm='sha256')=>crypto.createHash(algorithm).update(bytes).digest('hex');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'reports/r50-followup/report-packaging-manifest.json')));
function relative(p){assert.ok(typeof p==='string'&&p.startsWith('reports/r50-followup/')&&!p.split('/').some(x=>x==='..'||x==='.'),'report path must remain in evidence directory');return p;}
const args=process.argv.slice(2);let output=null,compareGit=false;
for(let i=0;i<args.length;i++){
 if(args[i]==='--verify')continue;
 if(args[i]==='--compare-source-commit'){compareGit=true;continue;}
 if(args[i]==='--restore-dir'){assert.ok(args[i+1],'restore destination required');output=path.resolve(args[++i]);continue;}
 throw new Error(`Unknown argument: ${args[i]}`);
}
const restored=manifest.compressed.map(record=>{
 let bytes;
 if(record.gzipPartsIndex){
  const filename=path.join(root,relative(record.gzipPartsIndex)),index=JSON.parse(fs.readFileSync(filename));
  for(const key of ['originalBytes','originalSha256','originalGitBlobSha','gzipBytes','gzipSha256'])assert.equal(index[key],record[key],`index/manifest ${key}`);
  assert.equal(index.parts.length,record.parts,'index/manifest parts');assert.equal(index.sourceCommit,manifest.sourceCommit,'index/manifest source commit');assert.equal(index.sourcePath,record.path,'index/manifest source path');
  bytes=readFixtureArchive(filename);
 }
 else{
  const gzip=fs.readFileSync(path.join(root,relative(record.gzipPath)));
  assert.equal(gzip.length,record.gzipBytes,'archive byte length');assert.equal(hash(gzip),record.gzipSha256,'archive SHA256');
  bytes=gunzipSync(gzip,{maxOutputLength:record.originalBytes});
 }
 relative(record.path);assert.equal(bytes.length,record.originalBytes,'original byte length');assert.equal(hash(bytes),record.originalSha256,'original SHA256');
 assert.equal(hash(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes]),'sha1'),record.originalGitBlobSha,'original Git blob identity');
 if(compareGit){const source=execFileSync('git',['show',`${manifest.sourceCommit}:${record.path}`],{cwd:root,maxBuffer:10*1024*1024});assert.ok(bytes.equals(source),`exact original commit bytes: ${record.path}`);}
 return{record,bytes};
});
// Verify every archive before writing anything, and never overwrite a directory.
if(output){fs.mkdirSync(output);for(const {record,bytes}of restored){const target=path.join(output,record.path);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx'});}}
console.log(JSON.stringify({verifiedArchives:restored.length,exactSourceCommitCompared:compareGit?manifest.sourceCommit:null,originalBytes:restored.reduce((n,r)=>n+r.bytes.length,0),restoredTo:output,omittedRegenerable:manifest.omittedRegenerable.map(r=>r.path)},null,2));
