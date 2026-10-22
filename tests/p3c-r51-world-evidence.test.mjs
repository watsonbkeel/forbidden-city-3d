import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
const dir=new URL('../reports/r51-unified/',import.meta.url),root=new URL('../',import.meta.url);
const bytes=p=>fs.readFileSync(new URL(p,dir)),sha=b=>createHash('sha256').update(b).digest('hex'),read=p=>JSON.parse(p.endsWith('.gz')?gunzipSync(bytes(p)):bytes(p));
const bindings=read('world-bindings-38-148.json.gz'),summary=read('world-joint-summary.json');
test('historical R51 Kit07 38-ready and 148-route evidence matches its exact cc1cf52 source hashes and unchanged R49E world',()=>{
 assert.equal(bindings.ok,true);assert.equal(bindings.requiredActors,38);assert.equal(bindings.actorBindings.length,38);assert.equal(bindings.routeSamples,148);assert.equal(bindings.independentFullRayOwnerAudits,796);assert.deepEqual(bindings.ready,{frozen:38,synchronous:38,incremental:38});
 assert.equal(bindings.architectureBaselineCommit,'db20828f1a6411603a3d9388eebe3ba2a5d11e61');assert.equal(bindings.activeFreezeSha256,sha(fs.readFileSync(new URL('data/characters/world-source-freeze.json',root))));assert.equal(bindings.sourcesUnchangedDuringRun,true);assert.deepEqual(bindings.sourceInput,bindings.sourceOutput);
 for(const [name,h]of Object.entries(bindings.sourceInput))assert.equal(h,sha(execFileSync('git',['show','cc1cf52:src/scene/characters/'+name+'.js'])),name);
 for(const r of bindings.actorBindings){assert.equal(r.required,true);assert.equal(r.binding.status,'ready');assert.equal(r.positionUnchanged,true);assert.ok(r.maxDeltaMeters<1e-10);}assert.equal(bindings.priorCacheComparison.all38SemanticBindingsUnchanged,true);assert.equal(bindings.priorCacheComparison.all148RouteSamplesUnchanged,true);for(const value of Object.values(bindings.unchanged))assert.equal(value,true);
});
test('historical R51 Kit07 LOD0 actual-triangle visibility preserves all 684 ray records and explicitly discloses seven blocked sampled cameras',()=>{
 const sight=read('world-sightlines-r49e.json.gz'),prior=JSON.parse(gunzipSync(fs.readFileSync(new URL('../reports/r50-joint/world-sightlines-r49b.json.gz',import.meta.url))));assert.equal(sight.architectureFreezeBaseline,bindings.architectureBaselineCommit);assert.equal(sight.architectureSourcesVerified,185);assert.equal(sight.characterKitSha256,bindings.sourceInput.CharacterKit);assert.equal(sight.totalRays,684);assert.equal(sight.rows.length,76);assert.deepEqual(sight.rows,prior.rows);assert.equal(summary.sightlines.visibleTargetCount,621);assert.equal(summary.sightlines.blockedCameras,7);assert.equal(summary.sightlines.newObstructions,0);for(const row of sight.rows)for(const h of row.hits){assert.ok(Number.isInteger(h.triangleIndex));assert.equal(h.own.actorId,row.actorId);assert.ok(Number.isInteger(h.own.triangleIndex));}
});
test('historical R51 57 original body assertions and 2 canopy tests pass with zero route rescue and unchanged step limit',()=>{
 const body=read('world-body-57.json.gz');assert.equal(body.rows.length,56);for(const r of body.rows){assert.equal(r.arrived,true);assert.equal(r.rescue,0);assert.ok(r.maxGroundRise<=.600001);assert.ok(r.maxAcceptedRise<=.600001);}for(const [p,n]of [['world-body-57.tap',57],['world-canopy-player-2.tap',2]]){const s=bytes(p).toString();assert.match(s,new RegExp('tests '+n+'\\b'));assert.match(s,new RegExp('pass '+n+'\\b'));assert.match(s,/fail 0\b/);assert.equal(bytes(p.replace('.tap','.exit')).toString().trim(),'0');}
});
test('R51 summary binds every fresh artifact and makes no GPU or rollout-state claim',()=>{
 assert.equal(summary.ok,true);assert.equal(summary.architecture.sourceFiles,185);assert.equal(summary.architecture.preservedR49ePaths,65);assert.match(summary.boundary,/NOT WebGL\/GPU/);assert.match(summary.boundary,/rollout/);for(const [p,h]of Object.entries(summary.artifacts))assert.equal(sha(bytes(p)),h,p);
});
