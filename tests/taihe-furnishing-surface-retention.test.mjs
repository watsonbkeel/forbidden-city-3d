import {restorePreR7Beams} from './lib/r7-taihe-beam-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import delta from './fixtures/taihe-furnishing-surface-source-delta.json' with {type:'json'};
import {restorePreFurnishingSurfaceSource as restore} from './lib/taihe-furnishing-surface-retention.mjs';
const sha=v=>createHash('sha256').update(v).digest('hex');
for(const[path,row]of Object.entries(delta.files))test(`${path}: exact finite surface delta preserves old source and rejects unscoped edits`,()=>{
 const current=restorePreR7Beams(path,fs.readFileSync(new URL('../'+path,import.meta.url)));assert.equal(sha(current),row.candidateSHA256);
 const previous=restore(path,current);assert.equal(sha(previous),row.baselineSHA256);assert.equal(restore(path,previous),previous);
 assert.throws(()=>restore(path,Buffer.concat([current,Buffer.from('\n')])));
 assert.throws(()=>restore(path,Buffer.concat([previous,Buffer.from('\n')])));
 for(const h of row.deltas)for(const text of [h.after+h.after,h.after+'// unintended\n'])assert.throws(()=>restore(path,Buffer.from(current.toString().replace(h.after,text))));
});
