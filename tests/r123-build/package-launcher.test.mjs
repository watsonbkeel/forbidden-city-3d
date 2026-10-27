import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {spawn} from 'node:child_process';
const packagePath=process.env.R123_PACKAGE,expectedSource=process.env.R123_BUILD_SOURCE;assert.ok(packagePath,'set R123_PACKAGE to the new production package');assert.match(expectedSource??'',/^[a-f0-9]{40}$/,'set exact independently selected R123_BUILD_SOURCE');
test('R123 launcher labels this release and serves readable discovery files',async t=>{
 const source=fs.readFileSync('release/r123/start.mjs','utf8');assert.match(source,/R123 production package/);assert.doesNotMatch(source,/R11[589] production package/);
 assert.equal(fs.readFileSync(packagePath+'/start.mjs','utf8'),source);
 const child=spawn(process.execPath,[packagePath+'/start.mjs'],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 t.after(()=>{child.kill('SIGTERM');});
 const output=await new Promise((resolve,reject)=>{let log='';const timer=setTimeout(()=>reject(Error('launcher did not print ready URL: '+log)),5000);const finish=(fn,value)=>{clearTimeout(timer);fn(value);};child.once('error',e=>finish(reject,e));child.once('exit',code=>finish(reject,Error('launcher exited '+code+': '+log)));child.stderr.on('data',b=>{log+=b;});child.stdout.on('data',b=>{log+=b;if(/http:\/\/127\.0\.0\.1:\d+/.test(log))finish(resolve,log);});});
 assert.match(output,/R123 production package/);const origin=output.match(/http:\/\/127\.0\.0\.1:\d+/)[0];
 for(const [name,mime]of[['about.html','text/html'],['contribute.html','text/html'],['llms.txt','text/plain'],['sitemap.xml','application/xml']]){const r=await fetch(origin+'/'+name);assert.equal(r.status,200);assert.ok(r.headers.get('content-type').startsWith(mime));}
});
import{createHash}from'node:crypto';import path from'node:path';
test('every packaged payload byte matches manifest and the frozen root build identity',()=>{const m=JSON.parse(fs.readFileSync(packagePath+'/SHA256SUMS.json','utf8'));assert.equal(m.release,'R123');assert.equal(m.build.base,'/');assert.equal(m.build.sourceDirty,false);assert.equal(m.build.sourceCommit,expectedSource);assert.equal(m.files.length,139);const paths=new Set();for(const f of m.files){assert.ok(!paths.has(f.path));paths.add(f.path);assert.ok(!f.path.includes('..'));const b=fs.readFileSync(path.join(packagePath,f.path));assert.equal(b.length,f.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256);}assert.deepEqual(JSON.parse(fs.readFileSync(packagePath+'/dist/build-info.json','utf8')),m.build);});
