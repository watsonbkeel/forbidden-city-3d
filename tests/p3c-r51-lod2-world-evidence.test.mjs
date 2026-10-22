import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {verifyR51Lod2Source,proveR51Lod2Inheritance} from '../scripts/p3c-r51-lod2-source-proof.mjs';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root)),sha=b=>createHash('sha256').update(b).digest('hex');
const json=p=>JSON.parse(p.endsWith('.gz')?gunzipSync(read(p)):read(p)),dir='reports/r51-unified/';
const proof=json(dir+'world-lod2-inheritance.json'),fresh=json(dir+'world-bindings-after-lod2-38-148.json.gz'),old=json(dir+'world-bindings-38-148.json.gz');
test('LOD2 successor permits only the exact frozen Kit07 shoe-ring expression and rechecks every roster geometry byte',async()=>{
 assert.deepEqual(verifyR51Lod2Source(),proof.sourceProof);assert.equal(proof.sourceProof.afterSha256,'7696c28eaa608bcd726a724746a88a4770064d6b3da677445cad3dcc53a863ab');const current=await proveR51Lod2Inheritance();assert.deepEqual(current,proof);assert.equal(proof.geometryCases,114);assert.equal(proof.lod01ByteIdenticalCases,76);assert.equal(proof.requiredActors,38);assert.equal(proof.allLodMetadataAndTopologyUnchanged,true);
});
test('all cc1cf52 world reports and logs remain exact Git blobs; historical LOD0 sightlines and player body results are inherited, not rerun',()=>{
 for(const [p,h]of Object.entries(proof.preservedArtifacts)){assert.equal(sha(read(p)),h,p);assert.equal(sha(execFileSync('git',['show','cc1cf52:'+p])),h,'frozen '+p);}assert.equal(proof.activeWorldManifestSha256,sha(read('data/characters/world-source-freeze.json')));assert.equal(proof.worldSourceFiles,185);assert.match(proof.kind,/NOT a fresh 57-body or 684-sightline run/);assert.match(proof.kind,/NOT GPU/);
});
test('new after-lod2 binding capture is fresh 38/148/796 evidence tied to exact current sources and unchanged world',()=>{
 assert.equal(fresh.ok,true);assert.equal(fresh.requiredActors,38);assert.equal(fresh.actorBindings.length,38);assert.equal(fresh.routeSamples,148);assert.equal(fresh.independentFullRayOwnerAudits,796);assert.deepEqual(fresh.ready,{frozen:38,synchronous:38,incremental:38});assert.equal(fresh.sourcesUnchangedDuringRun,true);assert.deepEqual(fresh.sourceInput,fresh.sourceOutput);for(const [n,h]of Object.entries(fresh.sourceInput))assert.equal(h,sha(read('src/scene/characters/'+n+'.js')),n);assert.equal(fresh.sourceInput.CharacterKit,proof.sourceProof.afterSha256);assert.equal(fresh.activeFreezeSha256,proof.activeWorldManifestSha256);assert.equal(fresh.architectureBaselineCommit,old.architectureBaselineCommit);
 assert.deepEqual(fresh.bindings,old.bindings);assert.deepEqual(fresh.audits,old.audits);assert.deepEqual(fresh.actorBindings,old.actorBindings);assert.deepEqual(fresh.bindingSupportProbeCounts,old.bindingSupportProbeCounts);for(const value of Object.values(fresh.unchanged))assert.equal(value,true);
 const summary=json(dir+'world-bindings-after-lod2-summary.json');assert.equal(summary.compressedReportSha256,sha(read(dir+'world-bindings-after-lod2-38-148.json.gz')));assert.equal(summary.rawReportSha256,sha(gunzipSync(read(dir+'world-bindings-after-lod2-38-148.json.gz'))));assert.equal(read(dir+'world-bindings-after-lod2.exit').toString().trim(),'0');
});
