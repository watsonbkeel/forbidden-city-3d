import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {spawn} from 'node:child_process';
const packagePath=process.env.R95_PACKAGE;assert.ok(packagePath,'set R95_PACKAGE to the new production package');
test('R95 launcher labels this release and serves readable discovery files',async t=>{
 const source=fs.readFileSync('release/r95/start.mjs','utf8');assert.match(source,/R95 production package/);assert.doesNotMatch(source,/R7[0-9]/);
 assert.equal(fs.readFileSync(packagePath+'/start.mjs','utf8'),source);
 const child=spawn(process.execPath,[packagePath+'/start.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 t.after(()=>{child.kill('SIGTERM');});
 const output=await new Promise((resolve,reject)=>{child.once('error',reject);child.stdout.once('data',b=>resolve(String(b)));});
 assert.match(output,/R95 production package/);const origin=output.match(/http:\/\/127\.0\.0\.1:\d+/)[0];
 for(const [name,mime]of[['about.html','text/html'],['contribute.html','text/html'],['llms.txt','text/plain'],['sitemap.xml','application/xml']]){const r=await fetch(origin+'/'+name);assert.equal(r.status,200);assert.ok(r.headers.get('content-type').startsWith(mime));}
});
import{createHash}from'node:crypto';import path from'node:path';
test('every packaged payload byte matches manifest and the frozen root build identity',()=>{const m=JSON.parse(fs.readFileSync(packagePath+'/SHA256SUMS.json','utf8'));assert.equal(m.release,'R95');assert.equal(m.build.base,'/');assert.equal(m.build.sourceDirty,false);assert.equal(m.build.sourceCommit,'4d9aa8562238bd121f8682b72696f835bc4d65d4');assert.equal(m.files.length,139);const paths=new Set();for(const f of m.files){assert.ok(!paths.has(f.path));paths.add(f.path);assert.ok(!f.path.includes('..'));const b=fs.readFileSync(path.join(packagePath,f.path));assert.equal(b.length,f.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256);}assert.deepEqual(JSON.parse(fs.readFileSync(packagePath+'/dist/build-info.json','utf8')),m.build);});
