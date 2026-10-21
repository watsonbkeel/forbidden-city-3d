// Independent old-19 regression. Baselines are immutable captures of actual old code,
// not a golden file generated from the current candidate. No external clone is needed.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const base=new URL('../docs/current-state/r48-remaining/independent-real-materials/',import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,base)));
const hash=b=>createHash('sha256').update(b).digest('hex');
const source=read('legacy-fixture-provenance.json');
assert.equal(hash(readFileSync(new URL('legacy-fixture-provenance.json',base))),'1eec7f95be98459b139611c89b65c4eed66248bfbbbf1b0147d5261cabc45233','Frozen independent provenance must not be regenerated from the candidate');
for(const [file,evidence] of Object.entries(source.artifacts)){
 assert.equal(hash(readFileSync(new URL(file,base))),evidence.sha256,file+' immutable capture');
 if(evidence.captureScript)assert.equal(hash(readFileSync(join(root,evidence.captureScript))),evidence.captureScriptSha256,evidence.captureScript+' original signature algorithm');
}
const r47=read('frozen-46c4c84/r48-capture-d37cf4d.json'),before=read('frozen-46c4c84/r48-capture-6f23d91.json');
const pairs=read('frozen-46c4c84/r48-pair-d37cf4d.json');
const rows=read('46c4c84-legacy17-hall-retention.json');
const removals=read('46c4c84-actual-legacy-shell-removal.json');
const baseline=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/remaining-70-baseline.json',import.meta.url)));
const ledger=JSON.parse(readFileSync(new URL('../data/architecture/building-fidelity.json',import.meta.url)));
const dir=mkdtempSync(join(tmpdir(),'r48-independent-old19-'));
let current,currentPairs;
try{
 for(const [script,file]of [['hall-materials','halls.json'],['garden-pair','pair.json']])execFileSync(process.execPath,[join(root,'tests/r48-audit-real-capture-'+script+'.mjs'),join(dir,file)],{cwd:root,stdio:'pipe',timeout:120000});
 current=JSON.parse(readFileSync(join(dir,'halls.json')));currentPairs=JSON.parse(readFileSync(join(dir,'pair.json')));
}finally{rmSync(dir,{recursive:true,force:true});}
test('AUDIT immutable 19 identity bindings and actual baseline coverage',()=>{
 assert.equal(rows.length,17);assert.equal(Object.keys(current.halls).length,122);
 assert.deepEqual([...rows.map(r=>r.id),'garden-procedural-万春亭','garden-procedural-千秋亭'].sort(),[...baseline.previouslyChanged].sort());
 for(const row of rows){const entry=ledger.buildings.find(b=>b.id===row.id);assert.ok(entry,row.id);assert.equal(entry.binding.dataRef,'data/zones/'+row.key.split('/')[0]+'.json#/items/'+row.key.split('/')[1]);}
 assert.deepEqual(removals.map(r=>r.key).sort(),['ningshou/15','outer-east/19','outer-west/14','outer-west/19','outer-west/43','outer-west/47'].sort());
});
for(const row of rows)test('AUDIT old hall raw stub retention and real shell semantics '+row.id+' '+row.name,()=>{
 const actual=current.halls[row.key],old=r47.halls[row.key],pre=before.halls[row.key];assert.ok(actual&&old&&pre,row.key);
 assert.deepEqual(actual.stub,old.stub,'Original R47 stub attributes/materials/navigation unchanged');
 assert.deepEqual(actual.stub,pre.stub,'Pre-material-fix stub unchanged');
 assert.equal(actual.real.physical,actual.stub.physical,'Real shell deletion reaches the unchanged stub physical semantics');
 assert.equal(actual.real.navigation,actual.stub.navigation,'Real collision/navigation matches stub');
 assert.equal(actual.real.meshCount,actual.stub.meshCount);
 const removal=removals.find(r=>r.key===row.key);
 if(removal){
  assert.equal(pre.real.meshCount,removal.beforeMeshes);assert.equal(actual.real.meshCount,removal.afterMeshes);
  assert.notEqual(actual.real.physical,pre.real.physical,'Real old shell must actually disappear');
  for(const [material,count]of Object.entries(removal.materialCountDelta)){assert.equal(pre.real.materials[material]??0,count.before);assert.equal(actual.real.materials[material]??0,count.after);}
 }else assert.deepEqual(actual.real,pre.real,'Untouched prior real hall output remains exact');
});
for(const name of ['cross_pavilion_万春亭','cross_pavilion_千秋亭'])test('AUDIT old garden pair real and stub retention '+name,()=>{
 for(const kind of ['real','stub'])assert.deepEqual(currentPairs[kind][name],pairs[kind][name],kind+' actual R47 pair geometry/material attributes');
 assert.equal(currentPairs.real[name].physical,currentPairs.stub[name].physical);
});
