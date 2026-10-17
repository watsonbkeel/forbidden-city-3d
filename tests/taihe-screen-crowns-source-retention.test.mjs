import test from 'node:test';
import {restorePreEnamelCranesSource} from './lib/taihe-enamel-cranes-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {restorePreScreenCrownsSource} from './lib/taihe-screen-crowns-retention.mjs';
const name='src/scene/interior/TaiheCoreContract.js',read=p=>fs.readFileSync(new URL('../'+p,import.meta.url));
const sha=b=>createHash('sha256').update(b).digest('hex');
const row=JSON.parse(read('tests/fixtures/taihe-screen-crowns-source-delta.json')).files[name],current=restorePreEnamelCranesSource(name,read(name));
test('crown restoration binds exact current and historical contract hashes',()=>{
 assert.equal(sha(current),row.candidateSHA256);assert.equal(row.baselineSHA256,'f916e7365ee2a79f72e2c2a25536f181d792843977e22c219d6b8578ea1fa70e');assert.equal(row.deltas.length,1);
 const restored=restorePreScreenCrownsSource(name,current);assert.equal(sha(restored),row.baselineSHA256);assert.equal(restorePreScreenCrownsSource(name,restored),restored);
});
test('crown restoration rejects unrelated changes, missing or doubled hunk',()=>{
 assert.throws(()=>restorePreScreenCrownsSource(name,Buffer.concat([current,Buffer.from('\n// changed\n')])));
 const s=current.toString(),h=row.deltas[0];assert.throws(()=>restorePreScreenCrownsSource(name,Buffer.from(s.replace(h.after,h.after+h.after))));
 assert.throws(()=>restorePreScreenCrownsSource(name,Buffer.from(s.replace(h.after,h.before)+'\n')));
});
test('crown source adapter never substitutes unrelated files',()=>{const b=Buffer.from('unchanged fixture');assert.equal(restorePreScreenCrownsSource('other.js',b),b);});

test('nested historical adapters accept only the exact previously restored stages',()=>{
 let previous=restorePreScreenCrownsSource(name,current).toString();
 for(const fixture of ['taihe-furniture-source-delta.json','taihe-shell-source-delta.json']){
  const old=JSON.parse(read('tests/fixtures/'+fixture)).files[name];
  for(const h of old.deltas){assert.equal(previous.split(h.after).length,2);previous=previous.replace(h.after,h.before);}
  const bytes=Buffer.from(previous);assert.equal(sha(bytes),old.baselineSHA256);assert.equal(restorePreScreenCrownsSource(name,bytes),bytes);
  assert.throws(()=>restorePreScreenCrownsSource(name,Buffer.from(previous+'\n')));
 }
});
