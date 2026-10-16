import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import {WUMEN_SOURCE_DELTA,restorePreWumenVerticalSource} from '../lib/wumen-vertical-source-delta.mjs';
for(const [path,record]of Object.entries(WUMEN_SOURCE_DELTA.sources)){
 const current=fs.readFileSync(new URL('../../'+path,import.meta.url));
 test(`${path}: only the finite reviewed Wumen profile replacements restore exact V14 source`,()=>{assert.notDeepEqual(restorePreWumenVerticalSource(path,current),current);assert.equal(createHash('sha256').update(current).digest('hex'),record.candidateSha256);});
 for(const [i,delta]of record.deltas.entries())for(const kind of ['missing','duplicated','modified'])test(`${path}: rejects ${kind} approved profile delta ${i}`,()=>{
  const replacement=kind==='missing'?'':kind==='duplicated'?delta.after+delta.after:delta.after+'// unreviewed edit\n';
  assert.throws(()=>restorePreWumenVerticalSource(path,Buffer.from(current.toString().replace(delta.after,replacement))));
 });
 test(`${path}: rejects unrelated retained bytes`,()=>assert.throws(()=>restorePreWumenVerticalSource(path,Buffer.concat([current,Buffer.from('\n')]))));
}
for(const [path,sha]of Object.entries(WUMEN_SOURCE_DELTA.added))test(`${path}: added profile card remains exact frozen bytes`,()=>assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../../'+path,import.meta.url))).digest('hex'),sha));
