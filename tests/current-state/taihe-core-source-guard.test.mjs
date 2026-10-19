import {restorePreR15Source}from '../lib/r15-flight-source-retention.mjs';
import {restorePreColumnMaterialSource} from '../lib/taihe-column-material-retention.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {TAIHE_SOURCE_DELTA,restorePreTaiheCoreSource} from '../lib/taihe-v16-source-delta.mjs';
for(const [path,record]of Object.entries(TAIHE_SOURCE_DELTA)){
 const current=restorePreColumnMaterialSource(path,restorePreR15Source(path,fs.readFileSync(new URL('../../'+path,import.meta.url))));
 test(`${path}: exact Taihe deltas restore V15 without changing historical hashes`,()=>{assert.equal(createHash('sha256').update(current).digest('hex'),record.candidateSHA256);assert.equal(createHash('sha256').update(restorePreTaiheCoreSource(path,current)).digest('hex'),record.historicalSHA256);});
 for(const [i,d]of record.deltas.entries())for(const kind of ['missing','duplicated','modified'])test(`${path}: rejects ${kind} V16 delta${i}`,()=>{const replacement=kind==='missing'?'':kind==='duplicated'?d.after+d.after:d.after+'// modified\n';assert.throws(()=>restorePreTaiheCoreSource(path,Buffer.from(current.toString().replace(d.after,replacement))));});
 test(`${path}: rejects unrelated byte changes`,()=>assert.throws(()=>restorePreTaiheCoreSource(path,Buffer.concat([current,Buffer.from('\n')]))));
}
