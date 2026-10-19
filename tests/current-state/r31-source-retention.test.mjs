import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import{createHash}from'node:crypto';
import{r31Source,restorePreR31Source}from'../lib/r31-flight-operations-retention.mjs';
import{restoreR32SourceIfPresent}from'../lib/r32-source-retention.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
// Historical R31 interaction bytes only. Exact R32 source dispatch precedes
// this older contract; current R32 help and input behavior are tested directly.
for(const[path,d]of Object.entries(r31Source.files))test(`${path}: exact interaction delta restores R30 and rejects unregistered edits`,()=>{
 const b=restoreR32SourceIfPresent(path,fs.readFileSync(new URL('../../'+path,import.meta.url)));assert.equal(sha(b),d.candidateSHA256);const old=restorePreR31Source(path,b);assert.equal(sha(old),d.baselineSHA256);assert.deepEqual(restorePreR31Source(path,old),old);
 assert.throws(()=>restorePreR31Source(path,Buffer.concat([b,Buffer.from('\n// unregistered')])));for(const h of d.deltas){assert.throws(()=>restorePreR31Source(path,Buffer.from(b.toString().replace(h.after,h.after+'// unregistered hunk\n'))));}
});
