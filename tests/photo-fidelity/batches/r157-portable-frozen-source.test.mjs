import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {createR157FrozenSourceReader} from '../../lib/r157-frozen-source-reader.mjs';
import {R157_FROZEN_SOURCE_PINS} from '../../lib/r157-frozen-source-pins.mjs';
// Dedicated test worker: isolate temporary Git roots from caller-specific Git routing.
const routing=['GIT_DIR','GIT_WORK_TREE','GIT_COMMON_DIR','GIT_ALTERNATE_OBJECT_DIRECTORIES','GIT_OBJECT_DIRECTORY','GIT_INDEX_FILE'];
const inherited=Object.fromEntries(routing.map(k=>[k,process.env[k]]));
for(const k of routing)delete process.env[k];
test.after(()=>{for(const k of routing){if(inherited[k]===undefined)delete process.env[k];else process.env[k]=inherited[k];}});
const source=path.resolve('tests/fixtures/r157-frozen-sources');
const git=(root,...args)=>execFileSync('git',args,{cwd:root,stdio:['pipe','pipe','pipe']});
const commit='ebd5d0494bc2eedcd8983dcb7669d4c7e8f121d2',file='src/scene/PalaceBuilder.js';
function isolated(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'r157-frozen-reader-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));git(root,'init','-q');
 const base=path.join(root,'tests/fixtures/r157-frozen-sources');fs.mkdirSync(path.join(base,'blobs'),{recursive:true});
 const raw=fs.readFileSync(path.join(source,commit+'.json')),m=JSON.parse(raw),blob=m.files[file].gitBlobSha;
 fs.writeFileSync(path.join(base,commit+'.json'),raw);fs.copyFileSync(path.join(source,'blobs',blob+'.txt'),path.join(base,'blobs',blob+'.txt'));
 return {root,base,m,blob,bytes:fs.readFileSync(path.join(base,'blobs',blob+'.txt'))};
}
function original(h,withBlob=true){
 const write=(type,b)=>execFileSync('git',['hash-object','-t',type,'-w','--stdin'],{cwd:h.root,input:b,stdio:['pipe','pipe','pipe']}).toString().trim();
 assert.equal(write('commit',Buffer.from(h.m.originalCommitObjectBase64,'base64')),commit);
 for(const [sha,b] of Object.entries(h.m.treesBase64))assert.equal(write('tree',Buffer.from(b,'base64')),sha);
 if(withBlob)assert.equal(write('blob',h.bytes),h.blob);
}
test('Absent original commit reads byte-exact frozen source and reports its original identity',t=>{const h=isolated(t),r=createR157FrozenSourceReader(h.root,commit);assert.equal(r.mode,'verified-snapshot');assert.equal(r.originalCommit,commit);assert.equal(r.read(file),h.bytes.toString());});
test('Available original Git object takes precedence over corrupt fallback blob',t=>{const h=isolated(t);original(h);fs.writeFileSync(path.join(h.base,'blobs',h.blob+'.txt'),'corrupt');const r=createR157FrozenSourceReader(h.root,commit);assert.equal(r.mode,'original-git-object');assert.equal(r.read(file),h.bytes.toString());});
test('Present original commit with missing source blob fails rather than falling back',t=>{const h=isolated(t);original(h,false);const r=createR157FrozenSourceReader(h.root,commit);assert.equal(r.mode,'original-git-object');assert.throws(()=>r.read(file));});
test('Unknown commit, path traversal, missing mapped path and non-repository root reject',t=>{const h=isolated(t);assert.throws(()=>createR157FrozenSourceReader(h.root,'0'.repeat(40)),/unknown/);const r=createR157FrozenSourceReader(h.root,commit);for(const p of ['src/../data/zones/axis-courts.json','../src/scene/PalaceBuilder.js','src/not-recorded.js','tests/fixture.js','src//scene/PalaceBuilder.js'])assert.throws(()=>r.read(p),/outside/);assert.throws(()=>createR157FrozenSourceReader(os.tmpdir(),commit));});
test('Changed manifest fails before any source is read',t=>{const h=isolated(t);h.m.files[file].sha256='0'.repeat(64);fs.writeFileSync(path.join(h.base,commit+'.json'),JSON.stringify(h.m));assert.throws(()=>createR157FrozenSourceReader(h.root,commit),/manifest checksum/);});
for(const kind of ['corrupt','missing','symlink'])test(`Fallback ${kind} blob fails closed`,t=>{const h=isolated(t),p=path.join(h.base,'blobs',h.blob+'.txt');if(kind==='corrupt')fs.writeFileSync(p,Buffer.concat([h.bytes,Buffer.from('x')]));else{fs.unlinkSync(p);if(kind==='symlink')fs.symlinkSync(path.join(source,'blobs',h.blob+'.txt'),p);}const r=createR157FrozenSourceReader(h.root,commit);assert.throws(()=>r.read(file));});
test('Every retained source in all pinned identity manifests is readable in an isolated no-original-object repository',t=>{const h=isolated(t);fs.cpSync(source,h.base,{recursive:true});let files=0;for(const c of Object.keys(R157_FROZEN_SOURCE_PINS)){const r=createR157FrozenSourceReader(h.root,c);assert.equal(r.mode,'verified-snapshot');for(const p of r.paths){assert.equal(typeof r.read(p),'string');files++;}}assert.ok(files>1600);});
