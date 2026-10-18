import {restorePreR10Columns} from './lib/r10-column-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import delta from './fixtures/r9-architecture-source-delta.json' with {type:'json'};
import {restorePreR9Architecture} from './lib/r9-architecture-retention.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const [path,d] of Object.entries(delta.files))test(`exact R9 restoration rejects unscoped changes: ${path}`,()=>{
 const b=restorePreR10Columns(path,fs.readFileSync(new URL('../'+path,import.meta.url)));
 assert.equal(sha(b),d.candidateSHA256);
 assert.equal(sha(restorePreR9Architecture(path,b)),d.baselineSHA256);
 assert.throws(()=>restorePreR9Architecture(path,Buffer.concat([b,Buffer.from('\n')])));
 assert.throws(()=>restorePreR9Architecture(path,Buffer.from(b.toString().replace('import','// changed import'))));
});
