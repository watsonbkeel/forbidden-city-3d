import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import http from 'node:http';import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';
const root=path.resolve('.'),sha=b=>createHash('sha256').update(b).digest('hex');
function request(url,method='GET'){return new Promise((resolve,reject)=>{const req=http.request(url,{method},res=>{const chunks=[];res.on('data',x=>chunks.push(x));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));});req.on('error',reject);req.end();});}
test('standalone local runner serves exact production HTML and compiled module without npm or DEV',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'r51-static-package-'));fs.copyFileSync('release/r51/start.mjs',path.join(dir,'start.mjs'));fs.symlinkSync(path.join(root,'dist'),path.join(dir,'dist'),'dir');
 const port=41739,child=spawn(process.execPath,[path.join(dir,'start.mjs')],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});let stderr='';child.stderr.on('data',d=>stderr+=d);
 t.after(()=>{child.kill();fs.rmSync(dir,{recursive:true,force:true});});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Local runner did not start: '+stderr)),5000);child.stdout.on('data',d=>{if(String(d).includes('production package:')){clearTimeout(timer);resolve();}});child.on('exit',code=>{clearTimeout(timer);reject(Error('Local runner exited '+code+': '+stderr));});child.on('error',e=>{clearTimeout(timer);reject(e);});});
 const html=await request(`http://127.0.0.1:${port}/`);assert.equal(html.status,200);assert.equal(sha(html.body),sha(fs.readFileSync('dist/index.html')));assert.match(html.headers['content-type'],/^text\/html/);
 const asset=html.body.toString().match(/<script[^>]+src="([^"]+\.js)"/)[1];const module=await request(`http://127.0.0.1:${port}${asset}`);assert.equal(module.status,200);assert.match(module.headers['content-type'],/^text\/javascript/);assert.equal(sha(module.body),sha(fs.readFileSync(path.join('dist',asset))));
 for(const marker of ['characters-preview-toggle-btn','preview-unverified','__forbiddenCityApp','@napi-rs/canvas'])assert.equal(module.body.includes(marker),false,marker+' must not be in the production bundle');
 assert.ok(module.body.includes('candidate-visible'));assert.ok(module.body.includes('宫廷人物'));
 assert.equal((await request(`http://127.0.0.1:${port}/missing-r51-file`)).status,404);
 assert.equal((await request(`http://127.0.0.1:${port}/${asset.replace(/^\//,'')}`,'HEAD')).body.length,0);
});
