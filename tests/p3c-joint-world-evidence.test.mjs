// Historical R49B results remain unchanged; source verification is against their own recorded commit, never a later active character system.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
const dir=new URL('../reports/r50-joint/',import.meta.url),read=name=>JSON.parse(name.endsWith('.gz')?gunzipSync(fs.readFileSync(new URL(name,dir))):fs.readFileSync(new URL(name,dir)));
const joint=read('world-bindings-38-148.json.gz'),summary=read('world-joint-summary.json');
test('frozen R49B fresh-run evidence retains 38 required bindings, its original committed character source hashes and 148 route samples',()=>{
 assert.equal(joint.ok,true);assert.equal(joint.requiredActors,38);assert.equal(joint.actorBindings.length,38);assert.equal(joint.routeSamples,148);assert.equal(joint.independentFullRayOwnerAudits,796);
 for(const [name,expected]of Object.entries(joint.sourceInput))assert.equal(createHash('sha256').update(execFileSync('git',['show',joint.candidateCommit+':src/scene/characters/'+name+'.js'])).digest('hex'),expected,name);
 for(const r of joint.actorBindings){assert.equal(r.required,true);assert.equal(r.binding.status,'ready');assert.equal(r.positionUnchanged,true);assert.ok(r.maxDeltaMeters<1e-10);}
 assert.deepEqual(joint.ready,{frozen:38,synchronous:38,incremental:38});assert.ok(joint.priorCacheComparison.all38SemanticBindingsUnchanged);assert.ok(joint.priorCacheComparison.all148RouteSamplesUnchanged);assert.equal(joint.unchanged.playerPhysics,true);
});
test('separate R49/R49B actual triangle sightlines retain every ray result, including pre-existing blocked views',()=>{
 const before=read('world-sightlines-r49.json.gz'),after=read('world-sightlines-r49b.json.gz');assert.equal(before.architectureFreezeBaseline,'92cf31ec1779d0d6266a2caa6ad1708c379d1500');assert.equal(after.architectureFreezeBaseline,'95db2af664ff9cb6ea405d0ba389ef428dfd7d6c');
 assert.equal(before.characterKitSha256,after.characterKitSha256);assert.equal(before.totalRays,684);assert.equal(after.totalRays,684);assert.deepEqual(after.rows,before.rows);
 assert.equal(after.rows.length,76);assert.equal(summary.sightlines.partlyOrFullyBlockedCameras,7);assert.equal(summary.sightlines.newR49BObstructionCount,0);
 for(const row of after.rows){assert.equal(row.hits.length,9);for(const h of row.hits){assert.ok(Number.isInteger(h.triangleIndex));assert.equal(h.own.actorId,row.actorId);assert.ok(Number.isInteger(h.own.triangleIndex));}}
});
test('joint reports retain the original 57 body assertions plus 2 canopy tests, without claiming the full historical suite',()=>{
 const body=read('world-body-57.json.gz');assert.equal(body.rows.length,56);for(const row of body.rows){assert.equal(row.arrived,true);assert.equal(row.rescue,0);assert.ok(row.maxGroundRise<=.600001);assert.ok(row.maxAcceptedRise<=.600001);}
 for(const [name,count]of [['world-body-57.tap',57],['world-canopy-player-2.tap',2]]){const s=fs.readFileSync(new URL(name,dir),'utf8');assert.match(s,new RegExp('tests '+count+'\\b'));assert.match(s,new RegExp('pass '+count+'\\b'));assert.match(s,/fail 0\b/);}
 for(const [name,expected]of Object.entries(summary.artifacts))assert.equal(createHash('sha256').update(fs.readFileSync(new URL(name,dir))).digest('hex'),expected,name);
});
