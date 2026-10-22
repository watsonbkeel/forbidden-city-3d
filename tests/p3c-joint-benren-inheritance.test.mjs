import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex'),proof=JSON.parse(read('reports/r50-joint/world-benren-inheritance.json'));
const source='src/scene/palace/special/SourceGuidedNameboardMounts.js',base='95db2af664ff9cb6ea405d0ba389ef428dfd7d6c',patch='ad64a922a8e2885fb42e1a6c64806ba8646a3b8c';
test('Benren inheritance binds exact original reports to the exact active and previous frozen manifests',()=>{
 assert.equal(proof.ok,true);assert.equal(proof.previousBaselineCommit,base);assert.equal(proof.baselineCommit,patch);assert.equal(proof.patchParentCommit,base);assert.equal(proof.activeFreezeSha256,sha(read('data/characters/world-source-freeze.json')));assert.equal(proof.previousFreezeSha256,sha(read('data/characters/world-source-freeze-r49b.json')));
 assert.equal(proof.inheritedEvidenceCommit,'289006b');for(const [path,expected]of Object.entries(proof.inheritedArtifacts)){assert.equal(sha(read(path)),expected,path);assert.equal(sha(execFileSync('git',['show','289006b:'+path])),expected,'original committed evidence '+path);}
});
test('only the exact frozen Benren production patch is allowed and actual non-plaque geometry/physics stay identical',()=>{
 assert.deepEqual(proof.changedProductionPaths,[source]);assert.equal(proof.productionDiffSha256,sha(execFileSync('git',['diff',base,patch,'--',source])));assert.equal(proof.currentSourceSha256,sha(read(source)));assert.equal(proof.previousSourceSha256,sha(execFileSync('git',['show',base+':'+source])));
 const {before,after}=proof.localSnapshot;for(const k of ['meshes','nonPlaqueGeometryHash','colliders','walkables','rooms','regions','mapItems'])assert.deepEqual(after[k],before[k],k);
 for(const part of ['face','frame']){for(const k of ['geometry','scale','rotation'])assert.deepEqual(after[part][k],before[part][k]);assert.deepEqual(after[part].position.slice(0,2),before[part].position.slice(0,2));assert.ok(Math.abs(after[part].position[2]-before[part].position[2]+.05)<1e-10);}
});
test('1,628 existing character sight/support/route rays have no intersection with either actual moved-component state',()=>{
 const r=proof.rays;assert.equal(r.characterSightlineRays,684);assert.equal(r.actualSupportOwnerRays,796);assert.equal(r.routeSurfaceRays,148);assert.equal(r.rows.length,1628);assert.equal(r.beforeIntersections,0);assert.equal(r.afterIntersections,0);for(const row of r.rows){assert.equal(row.beforeHits,0);assert.equal(row.afterHits,0);assert.equal(row.origin.length,3);assert.equal(row.target.length,3);}
 const local=read('reports/r50-joint/world-benren-local-tests.tap').toString();assert.match(local,/tests 8\b/);assert.match(local,/pass 8\b/);assert.match(local,/fail 0\b/);
});
