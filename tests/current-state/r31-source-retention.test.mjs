import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import{createHash}from'node:crypto';
import{r31Source,restorePreR31Source}from'../lib/r31-flight-operations-retention.mjs';
import{restoreR32SourceIfPresent}from'../lib/r32-source-retention.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
import {gunzipSync} from 'node:zlib';
// Keep this historical dispatch independent of evolving live interaction code.
// Two GitHub-published blobs at ce8915ab8a37cf6a180c60195e7f39abcecf28cc (tree b9bc82618a44c8435d230642ceafbe1657f11247) supply the exact R32 input;
// the original registered transforms still prove the exact R31 and R30 results.
const archive=fs.readFileSync(new URL('../fixtures/r31-operations-published-r32-sources.json.gz',import.meta.url));
assert.equal(sha(archive),'159b5ad2d6772128801ec29702d78a3c3db2e861882170dd43e39d4746baa3e7','published R32 operation archive');
const native=JSON.parse(gunzipSync(archive,{maxOutputLength:75_000}));
assert.equal(native.originalCommit,'ce8915ab8a37cf6a180c60195e7f39abcecf28cc');
assert.equal(native.originalTree,'b9bc82618a44c8435d230642ceafbe1657f11247');
assert.deepEqual(Object.keys(native.orderedFiles),Object.keys(r31Source.files));
const pins={
  'main.js':['756b58c3db255edc75db281807406c2a32bf0b3f','775d963be19cbd1c8d160d3256db5672ffb8827036165515c835aee4b004c2d8',27323],
  'src/scene/flight/FlightTour.js':['a4686506324bfb9bf6f1de75ff02cd7ba4a29463','63e04c28e15f44c46d2d71d65165d52ee5a6738318c559e9a1c7361dafbe4e94',24756],
};
function publishedOperationsInput(path){
 const [git,s,n]=pins[path],input=Buffer.from(native.orderedFiles[path],'base64');
 assert.equal(input.length,n,path+' published byte count');
 assert.equal(sha(input),s,path+' published raw bytes');
 assert.equal(createHash('sha1').update(`blob ${input.length}\0`).update(input).digest('hex'),git,path+' published Git blob');
 return input;
}

// Historical R31 interaction bytes only. Exact R32 source dispatch precedes
// this older contract; current R32 help and input behavior are tested directly.
for(const[path,d]of Object.entries(r31Source.files))test(`${path}: exact interaction delta restores R30 and rejects unregistered edits`,()=>{
 const b=restoreR32SourceIfPresent(path,publishedOperationsInput(path));assert.equal(sha(b),d.candidateSHA256);const old=restorePreR31Source(path,b);assert.equal(sha(old),d.baselineSHA256);assert.deepEqual(restorePreR31Source(path,old),old);
 assert.throws(()=>restorePreR31Source(path,Buffer.concat([b,Buffer.from('\n// unregistered')])));for(const h of d.deltas){assert.throws(()=>restorePreR31Source(path,Buffer.from(b.toString().replace(h.after,h.after+'// unregistered hunk\n'))));}
});
