import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {restorePreEnamelCranesSource as restore} from './lib/taihe-enamel-cranes-retention.mjs';
const name='src/scene/interior/TaiheCoreContract.js',read=p=>fs.readFileSync(new URL('../'+p,import.meta.url));
const sha=b=>createHash('sha256').update(b).digest('hex');
const row=JSON.parse(read('tests/fixtures/taihe-enamel-cranes-source-delta.json')).files[name],current=read(name);
test('crane restoration binds exact current and prior contract bytes',()=>{
 assert.equal(sha(current),row.candidateSHA256);assert.equal(row.baselineSHA256,'1380025664a4cc15b789d366a44b5a36dbe8678f0cc68ff31baa1a214987b96e');assert.equal(row.deltas.length,1);
 const restored=restore(name,current);assert.equal(sha(restored),row.baselineSHA256);assert.equal(restore(name,restored),restored);
});
test('crane restoration rejects unrelated changes and missing/doubled hunk',()=>{
 assert.throws(()=>restore(name,Buffer.concat([current,Buffer.from('\n// changed\n')])));
 const s=current.toString(),h=row.deltas[0];assert.throws(()=>restore(name,Buffer.from(s.replace(h.after,h.after+h.after))));
 assert.throws(()=>restore(name,Buffer.from(s.replace(h.after,h.before)+'\n')));
});
test('unrelated files are never substituted',()=>{const b=Buffer.from('fixture');assert.equal(restore('other.js',b),b);});
test('nested adapters accept only exact declared historical stages',()=>{
 let previous=restore(name,current).toString();
 for(const fixture of ['taihe-screen-crowns-source-delta.json','taihe-furniture-source-delta.json','taihe-shell-source-delta.json']){
  const old=JSON.parse(read('tests/fixtures/'+fixture)).files[name];
  for(const h of old.deltas){assert.equal(previous.split(h.after).length,2);previous=previous.replace(h.after,h.before);}
  const bytes=Buffer.from(previous);assert.equal(sha(bytes),old.baselineSHA256);assert.equal(restore(name,bytes),bytes);
  assert.throws(()=>restore(name,Buffer.from(previous+'\n')));
 }
});
