import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {CHARACTER_REGISTRY as registry} from '../data/characters/index.js';
const sha=b=>createHash('sha256').update(b).digest('hex'),git=(...a)=>execFileSync('git',a),read=p=>fs.readFileSync(p);
const base='ad64a922a8e2885fb42e1a6c64806ba8646a3b8c',final='db20828f1a6411603a3d9388eebe3ba2a5d11e61',source='src/scene/palace/special/SourceGuidedNameboardMounts.js';
const bytes=read('data/characters/world-source-freeze.json'),manifest=JSON.parse(bytes),preserved=JSON.parse(read('reports/r51-unified/r49e-preserved-paths.json'));
test('R51 preserves the R49D active manifest byte for byte and the ordered R49E source chain',()=>{
 const old=read('data/characters/world-source-freeze-r49d.json');assert.equal(sha(old),'4999fb8aac4ee69839f22406683aa53a8e123ceb68ba5129196f494b40bf3aa3');assert.equal(manifest.provenance.previousManifestSha256,sha(old));assert.equal(JSON.parse(old).baselineCommit,base);
 const chain=manifest.provenance.orderedSourceCommits;assert.equal(chain.length,4);assert.equal(chain[0],base);assert.equal(chain.at(-1),final);for(let i=1;i<chain.length;i++)assert.equal(git('rev-parse',chain[i]+'^').toString().trim(),chain[i-1]);
 assert.equal(sha(read('data/characters/world-source-freeze-r49b.json')),'d0b69e747a557b0ea57068357c26cdb59d9803c7a3fbe2daaaa957ae7e2390d0');assert.equal(sha(read('data/characters/world-source-freeze-r49.json')),'4f5c2b3d8dd318cbaeee72abd8fb6fa4fd96ba32c43761843e13397e127284d3');
});
test('all active 185 world source hashes match delivered R49E Git blobs and actual current files',()=>{
 assert.equal(manifest.baselineCommit,final);assert.equal(manifest.files.length,185);const previous=JSON.parse(read('data/characters/world-source-freeze-r49d.json'));assert.deepEqual(manifest.files.map(f=>f.path),previous.files.map(f=>f.path));const changed=[];
 for(const [i,f]of manifest.files.entries()){assert.equal(f.sha256,sha(git('show',final+':'+f.path)),'Git '+f.path);assert.equal(f.sha256,sha(read(f.path)),'actual '+f.path);if(f.sha256!==previous.files[i].sha256)changed.push(f.path);}assert.deepEqual(changed,[source]);assert.deepEqual(git('diff','--name-only',base,final,'--','src','data').toString().trim().split('\n'),[source]);assert.equal(manifest.provenance.changedSource.gitDiffSha256,sha(git('diff',base,final,'--',source)));
});
test('all 65 cumulative R49E delivered paths retain original blobs, including unmodified historical reports',()=>{
 const paths=git('diff','--name-only',base,final).toString().trim().split('\n');assert.equal(paths.length,65);assert.equal(preserved.exactPaths,65);assert.deepEqual(preserved.paths.map(p=>p.path),paths);assert.equal(preserved.activeWorldSourceManifestSha256,sha(bytes));
 for(const p of preserved.paths){assert.equal(git('hash-object',p.path).toString().trim(),p.gitBlobSha1,p.path);assert.equal(git('rev-parse',final+':'+p.path).toString().trim(),p.gitBlobSha1,'frozen '+p.path);assert.equal(sha(read(p.path)),p.sha256);}
});
test('required 38, historical captures and old capture guards are not relaxed for R51',()=>{
 assert.equal(registry.actors.length,38);assert.equal(registry.actors.filter(a=>a.required).length,38);const old='c8ae19b';
 for(const p of ['scripts/p3c-joint-world-bindings.mjs','scripts/p3c-joint-character-sightlines.mjs','scripts/p3c-joint-benren-inheritance.mjs'])assert.deepEqual(read(p),git('show',old+':'+p),p);
 const paths=git('ls-tree','-r','--name-only',old,'reports/r50-joint').toString().trim().split('\n');for(const p of paths)assert.deepEqual(read(p),git('show',old+':'+p),'historical evidence '+p);
});
