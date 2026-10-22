// Historical R49D provenance checks use the immutable versioned manifest. New active R51 checks are in p3c-r51-world-freeze.test.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const baseline='95db2af664ff9cb6ea405d0ba389ef428dfd7d6c',patch='ad64a922a8e2885fb42e1a6c64806ba8646a3b8c',changed='src/scene/palace/special/SourceGuidedNameboardMounts.js';
const sha=b=>createHash('sha256').update(b).digest('hex'),git=(...args)=>execFileSync('git',args);
const manifest=JSON.parse(fs.readFileSync('data/characters/world-source-freeze-r49d.json'));
const previousBytes=fs.readFileSync('data/characters/world-source-freeze-r49b.json'),previous=JSON.parse(previousBytes);
test('joint source chain preserves original R49 and R49B manifests byte for byte',()=>{
 const bytes=fs.readFileSync('data/characters/world-source-freeze-r49.json'),old=JSON.parse(bytes);
 assert.equal(sha(bytes),'4f5c2b3d8dd318cbaeee72abd8fb6fa4fd96ba32c43761843e13397e127284d3');assert.equal(manifest.provenance.originalR49ManifestSha256,sha(bytes));assert.equal(old.baselineCommit,'92cf31ec1779d0d6266a2caa6ad1708c379d1500');assert.equal(old.files.length,182);
 assert.equal(sha(previousBytes),'d0b69e747a557b0ea57068357c26cdb59d9803c7a3fbe2daaaa957ae7e2390d0');assert.equal(manifest.provenance.previousManifestSha256,sha(previousBytes));assert.equal(previous.baselineCommit,baseline);assert.equal(previous.files.length,185);
 const additions=git('diff-tree','--no-commit-id','--name-status','-r',baseline).toString().trim().split('\n').filter(s=>/^A\t(?:src|data)\//.test(s)).map(s=>s.split('\t')[1]);
 assert.equal(additions.length,3);assert.deepEqual(previous.provenance.addedProductionPaths,additions);assert.deepEqual(previous.files.map(f=>f.path),[...new Set([...old.files.map(f=>f.path),...additions])].sort());assert.deepEqual(manifest.files.map(f=>f.path),previous.files.map(f=>f.path));
});
test('all 185 historical R49D expectations remain exact ad64 Git blobs through one strict R49B delta',()=>{
 assert.equal(manifest.baselineCommit,patch);assert.equal(manifest.files.length,185);assert.equal(git('rev-parse',patch+'^').toString().trim(),baseline);assert.deepEqual(git('diff','--name-only',baseline,patch,'--','src','data').toString().trim().split('\n'),[changed]);
 const differing=[];for(const [i,item]of manifest.files.entries()){assert.equal(item.sha256,sha(git('show',`${patch}:${item.path}`)),`frozen patch Git source ${item.path}`);assert.equal(previous.files[i].sha256,sha(git('show',`${baseline}:${item.path}`)),`original R49B Git source ${item.path}`);if(item.sha256!==previous.files[i].sha256)differing.push(item.path);}
 assert.deepEqual(differing,[changed]);assert.deepEqual(manifest.provenance.changedProductionPaths,[changed]);assert.equal(manifest.provenance.changedSource.gitDiffSha256,sha(git('diff',baseline,patch,'--',changed)));
});
test('all 114 historical R49B paths remain preserved with explicit R49D and R49E successor files',()=>{
 const paths=git('diff-tree','--no-commit-id','--name-only','-r',baseline).toString().trim().split('\n');assert.equal(paths.length,114);
 for(const path of paths)assert.equal(git('hash-object',path).toString().trim(),git('rev-parse',`${path===changed?'db20828f1a6411603a3d9388eebe3ba2a5d11e61':baseline}:${path}`).toString().trim(),path);
 const patchPaths=git('diff-tree','--no-commit-id','--name-only','-r',patch).toString().trim().split('\n');assert.equal(patchPaths.length,4);for(const path of patchPaths)assert.equal(git('hash-object',path).toString().trim(),git('rev-parse',`${[changed,'tests/r49d-benren-depth.test.mjs'].includes(path)?'db20828f1a6411603a3d9388eebe3ba2a5d11e61':patch}:${path}`).toString().trim(),path);
});
