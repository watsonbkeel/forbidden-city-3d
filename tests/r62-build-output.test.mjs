import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { CHARACTER_REGISTRY } from '../data/characters/index.js';
import { verifyBuildSource } from '../scripts/build-identity.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const request = url => new Promise((resolve,reject)=>http.get(url,response=>{
  const chunks=[];response.on('data',x=>chunks.push(x));response.on('end',()=>resolve({status:response.statusCode,headers:response.headers,body:Buffer.concat(chunks).toString()}));
}).on('error',reject));

test('R62 extracted package server identifies its own release rather than the inherited R52 label',()=>{const text=fs.readFileSync('release/r62/start.mjs','utf8');assert.ok(text.includes('R62 production package'));assert.equal(text.includes('R52'),false);});
test('real root and subpath builds share identity across HTML, JS and manifest; local server keeps no-cache', async t => {
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'palace-compiled-identity-'));
  t.after(()=>fs.rmSync(temp,{recursive:true,force:true}));
  assert.equal(CHARACTER_REGISTRY.actors.length,108);
  const ids=[];
  for (const [name,base] of [['root','/'],['subpath','/forbidden-city-3d/']]) {
    const dist=path.join(temp,name,'dist');
    execFileSync(process.execPath,[path.join(root,'node_modules/vite/bin/vite.js'),'build','--base',base,'--outDir',dist,'--emptyOutDir'],{cwd:root,stdio:'pipe'});
    const info=verifyBuildSource({root,dist,expectedBase:base}),html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
    ids.push(info);
    assert.equal(info.release,'R62');assert.equal(info.base,base);
    assert.ok(html.includes(`name="palace-build-id" content="${info.buildId}"`));
    assert.ok(html.includes(`name="palace-source-fingerprint" content="${info.sourceFingerprint}"`));
    assert.ok(html.includes(`name="palace-build-base" content="${base}"`));
    assert.ok(html.includes(`R62 · 构建 ${info.buildId.split('-').at(-1)}`));
    const jsPath=html.match(/<script[^>]+src="([^"]+\.js)"/)[1];
    assert.ok(jsPath.startsWith(base+'assets/'));
    const js=fs.readFileSync(path.join(dist,jsPath.slice(base.length)),'utf8');
    for(const actor of CHARACTER_REGISTRY.actors) assert.ok(js.includes(JSON.stringify(actor.id)), 'Compiled current entry retains '+actor.id);
    assert.ok(js.includes(info.buildId));assert.ok(js.includes(info.sourceFingerprint));
    assert.equal(js.includes('DEV-unbuilt'),false);
    assert.ok(js.includes('release-check-btn'));assert.ok(js.includes('release-copy-btn'));
    for(const forbidden of ['characters-preview-toggle-btn','__forbiddenCityApp','serviceWorker.unregister','localStorage.clear','caches.delete'])assert.equal(js.includes(forbidden),false,forbidden);
  }
  assert.equal(ids[0].sourceFingerprint,ids[1].sourceFingerprint);
  assert.notEqual(ids[0].buildId,ids[1].buildId);
  const packageRoot=path.join(temp,'root');
  fs.copyFileSync(path.join(root,'release/r62/start.mjs'),path.join(packageRoot,'start.mjs'));
  const child=spawn(process.execPath,[path.join(packageRoot,'start.mjs')],{env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
  t.after(()=>child.kill());
  const address=await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error('Local package runner failed to start')),5000);
    child.stdout.on('data',data=>{const address=String(data).match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];if(address){clearTimeout(timeout);resolve(address)}});
    child.once('error',reject);child.once('exit',code=>{clearTimeout(timeout);reject(Error('Server exited '+code))});
  });
  const infoResponse=await request(address+'/build-info.json'),htmlResponse=await request(address+'/');
  assert.equal(infoResponse.status,200);assert.equal(infoResponse.headers['cache-control'],'no-cache');
  assert.equal(htmlResponse.status,200);assert.equal(htmlResponse.headers['cache-control'],'no-cache');
  assert.equal(JSON.parse(infoResponse.body).buildId,ids[0].buildId);
});
