import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync,spawnSync} from 'node:child_process';

const source=fileURLToPath(new URL('../../',import.meta.url));
const fixture=JSON.parse(fs.readFileSync(new URL('./frozen-offline.fixture.json',import.meta.url)));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const cleanEnv=Object.fromEntries(Object.entries(process.env).filter(([key])=>!key.startsWith('GIT_')));
const realGit=execFileSync('sh',['-c','command -v git'],{encoding:'utf8'}).trim();
const fileBytes=root=>{let total=0;for(const row of fs.readdirSync(root,{withFileTypes:true})){const p=path.join(root,row.name);if(row.isFile())total+=fs.statSync(p).size;else if(row.isDirectory())total+=fileBytes(p)}return total};
function makeSynthetic({includeBlob=true,unsupportedFlag=false}={}){
 const parent=process.env.XIANAN_OFFLINE_TEMP_ROOT??path.join(source,'.tmp/xianan-offline');fs.mkdirSync(parent,{recursive:true});
 const temp=fs.mkdtempSync(path.join(parent,'synthetic-')),root=path.join(temp,'repo'),bin=path.join(temp,'bin');fs.mkdirSync(root);fs.mkdirSync(bin);
 const fetchLog=path.join(temp,'fetch.log'),gitLog=path.join(temp,'git-shim.log');
 const env={...cleanEnv,GIT_CONFIG_NOSYSTEM:'1',GIT_CONFIG_GLOBAL:'/dev/null',GIT_CONFIG_SYSTEM:'/dev/null',GIT_ALLOW_PROTOCOL:'xiananfixture',GIT_CEILING_DIRECTORIES:temp,PATH:bin+path.delimiter+process.env.PATH,XIANAN_FETCH_LOG:fetchLog,XIANAN_GIT_SHIM_LOG:gitLog};
 const git=(args,input)=>execFileSync(realGit,['--no-lazy-fetch','-C',root,...args],{env,input,encoding:input===undefined?'utf8':undefined,maxBuffer:128*1024,timeout:10000,stdio:['pipe','pipe','pipe']});
 try{
  git(['-c','init.defaultBranch=offline','init','--template=','-q']);
  assert.equal(fixture.commit,'5d30c8366c8430f27cb9664b2b64f30e64e87cca');assert.equal(fixture.tree,'0f75720e7b5e36235105e691fda8e51930c7fa8f');assert.equal(fixture.objects.length,4);
  for(const object of fixture.objects){const bytes=Buffer.from(object.base64,'base64');assert.equal(bytes.length,object.bytes);assert.equal(sha(bytes),object.sha256);assert.equal(git(['hash-object','-t',object.type,'-w','--stdin'],bytes).toString().trim(),object.oid)}
  const data=fs.readFileSync(path.join(source,fixture.target));assert.equal(sha(data),fixture.targetSha256);
  if(includeBlob)assert.equal(git(['hash-object','-t','blob','-w','--stdin'],data).toString().trim(),fixture.targetBlob);
  fs.mkdirSync(path.dirname(path.join(root,fixture.target)),{recursive:true});fs.writeFileSync(path.join(root,fixture.target),data);
  fs.mkdirSync(path.join(root,'tests/xianan-contact'),{recursive:true});fs.copyFileSync(path.join(source,'tests/xianan-contact/frozen-flow-loader.mjs'),path.join(root,'tests/xianan-contact/frozen-flow-loader.mjs'));fs.copyFileSync(path.join(source,'package.json'),path.join(root,'package.json'));
  for(const [key,value] of [['core.repositoryformatversion','1'],['extensions.partialClone','fixture'],['remote.fixture.url','xiananfixture::offline-only'],['remote.fixture.promisor','true'],['remote.fixture.partialclonefilter','blob:none'],['protocol.xiananfixture.allow','always']])git(['config','--local',key,value]);
  fs.writeFileSync(path.join(bin,'git-remote-xiananfixture'),'#!/bin/sh\nprintf "called\n" >> "$XIANAN_FETCH_LOG"\nexit 1\n',{mode:0o700});
  if(unsupportedFlag)fs.writeFileSync(path.join(bin,'git'),'#!/bin/sh\nprintf "%s\n" "$*" >> "$XIANAN_GIT_SHIM_LOG"\nif [ "$1" = "--no-lazy-fetch" ]; then exit 129; fi\nexec '+JSON.stringify(realGit)+' "$@"\n',{mode:0o700});
  assert.ok(fileBytes(temp)<256*1024,'small synthetic fixture cap');
  return {root,temp,env,fetchLog,gitLog,dispose(){fs.rmSync(temp,{recursive:true,force:true})}};
 }catch(error){fs.rmSync(temp,{recursive:true,force:true});throw error}
}
function probe(f){
 const loader=pathToFileURL(path.join(f.root,'tests/xianan-contact/frozen-flow-loader.mjs')).href;
 const code='try{const m=await import('+JSON.stringify(loader)+');const data=m.verifyFrozenData('+JSON.stringify(fixture.target)+');process.stdout.write(JSON.stringify({ok:true,id:data.id}));}catch(e){process.stdout.write(JSON.stringify({ok:false,error:{code:e.code??null,message:e.message}}));}';
 const result=spawnSync(process.execPath,['--max-old-space-size=256','--max-semi-space-size=16','--input-type=module','-e',code],{cwd:f.root,env:f.env,encoding:'utf8',maxBuffer:128*1024,timeout:10000});
 assert.equal(result.error?.message??null,null,'bounded synthetic probe completed');assert.equal(result.status,0);assert.ok(fileBytes(f.temp)<256*1024,'post-probe fixture cap');return JSON.parse(result.stdout);
}
const calls=file=>fs.existsSync(file)?fs.readFileSync(file,'utf8').trim().split('\n').filter(Boolean):[];

test('frozen offline control: exact local commit/path trees/blob verify without fetching',()=>{
 const f=makeSynthetic();try{const r=probe(f);assert.deepEqual(r,{ok:true,id:'outer-west'});assert.equal(calls(f.fetchLog).length,0)}finally{f.dispose()}
});
test('frozen offline: missing promisor blob fails without invoking local fetch helper',()=>{
 const f=makeSynthetic({includeBlob:false});try{const r=probe(f);assert.equal(r.ok,false);assert.equal(r.error.code,'XIANAN_FROZEN_BASELINE_UNAVAILABLE');assert.equal(calls(f.fetchLog).length,0,'no implicit fetch attempt is allowed, even to this network-free local helper')}finally{f.dispose()}
});
test('frozen offline: unsupported no-lazy-fetch flag fails once without unflagged fallback',()=>{
 const f=makeSynthetic({unsupportedFlag:true});try{const r=probe(f);assert.equal(r.ok,false,'unsupported required flag must reject rather than use an unguarded Git read');assert.equal(r.error.code,'XIANAN_FROZEN_BASELINE_UNAVAILABLE');const log=calls(f.gitLog);assert.equal(log.length,1);assert.ok(log[0].startsWith('--no-lazy-fetch '));assert.equal(calls(f.fetchLog).length,0)}finally{f.dispose()}
});
