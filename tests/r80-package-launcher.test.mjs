import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {spawn} from 'node:child_process';
const packagePath='/workspace/scratch/02a8023d1a85/r80-cumulative-production-20261024';
test('R80 launcher labels this release and serves readable discovery files',async t=>{
 const source=fs.readFileSync('release/r80/start.mjs','utf8');assert.match(source,/R80 production package/);assert.doesNotMatch(source,/R7[0-9]/);
 assert.equal(fs.readFileSync(packagePath+'/start.mjs','utf8'),source);
 const child=spawn(process.execPath,[packagePath+'/start.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 t.after(()=>{child.kill('SIGTERM');});
 const output=await new Promise((resolve,reject)=>{child.once('error',reject);child.stdout.once('data',b=>resolve(String(b)));});
 assert.match(output,/R80 production package/);const origin=output.match(/http:\/\/127\.0\.0\.1:\d+/)[0];
 for(const [name,mime]of[['about.html','text/html'],['contribute.html','text/html'],['llms.txt','text/plain'],['sitemap.xml','application/xml']]){const r=await fetch(origin+'/'+name);assert.equal(r.status,200);assert.ok(r.headers.get('content-type').startsWith(mime));}
});
