import {restorePreCeilingSource} from './lib/taihe-ceiling-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import delta from './fixtures/taihe-shell-source-delta.json' with {type:'json'};
import {restorePreShellSource} from './lib/taihe-shell-retention.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const [file,row] of Object.entries(delta.files))test(`finite shell migration preserves all unrelated bytes: ${file}`,()=>{
 const bytes=restorePreCeilingSource(file,fs.readFileSync(new URL('../'+file,import.meta.url)));assert.equal(sha(bytes),row.candidateSHA256);assert.equal(sha(restorePreShellSource(file,bytes)),row.baselineSHA256);
 for(const h of row.deltas){assert.equal(bytes.toString().split(h.after).length,2);assert.throws(()=>restorePreShellSource(file,bytes.toString().replace(h.after,h.after+h.after)));}
 assert.throws(()=>restorePreShellSource(file,bytes+'\n'));
});
