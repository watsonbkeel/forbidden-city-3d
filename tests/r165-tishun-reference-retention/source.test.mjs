import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {record,normalizeTishunRetentionSource as norm,isTishunRetentionSourceVersion as known} from './source-boundary.mjs';
import {normalizeTishunSource as historicalNorm,isTishunSourceVersion as historicalKnown} from '../r165-tishun-south-beam/source-boundary.mjs';
import {normalizeDailouSource} from '../r165-dailou-waiting-house/source-boundary.mjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('exact new ownership delta keeps immutable public2544 helper and all historical pins instead of refreshing them',()=>{
  const old=fs.readFileSync(new URL('./frozen/TishunSouthBeam.2544.js',import.meta.url)),live=fs.readFileSync(record.path);
  assert.equal(record.base,'2544bab117846a7fd16175a0279e97190d28f549');
  assert.equal(record.tree,'c46f52079a60965f548d7b38086741f1d48a4b13');
  assert.equal(record.before,'b03b5fa50c0cf5e4e6c198d0658fb746f7521b98a333b0785c822c6b949c5f99');
  assert.deepEqual(old,execFileSync('git',['show',record.base+':'+record.path]));
  let expected=old.toString();
  for(const [before,after] of [
    [' const frame=base(kit,zone),prior=done.get(kit);\n if(prior){const m=prior.mesh,'," const frame=base(kit,zone),committed=done.get(kit);\n if(committed){const prior=committed.get(frame.children[14]);need(prior,'idempotent applied target drift');const m=prior.mesh,"],
    [' done.set(kit,record);old.dispose();return record;',' // A live kit remembers the commit, but only the original mesh keeps its record\n // alive. After construction release, the record must not root the old frame.\n done.set(kit,new WeakMap([[mesh,record]]));old.dispose();return record;'],
  ]){assert.equal(expected.split(before).length,2);expected=expected.replace(before,after)}
  assert.equal(live.toString(),expected,'only the exact private-cache delta is allowed');
  assert.equal(sha(live),record.after);
  for(const bytes of [old,live]){assert.ok(known(record.path,bytes));assert.deepEqual(norm(record.path,bytes),old);assert.deepEqual(normalizeDailouSource(record.path,bytes),old);assert.ok(historicalKnown(record.path,bytes));assert.equal(historicalNorm(record.path,bytes),null)}
  for(const path of ['tests/r165-dailou-waiting-house/source-boundary.json','tests/r165-tishun-south-beam/source-boundary.json','tests/r165-tishun-south-beam/baseline-8386.json','tests/r165-tishun-south-beam/candidate.json','tests/r165-tishun-south-beam/frozen/stepped-prototype-1324.mjs','tests/r165-tishun-south-beam/frozen/ZoneBase.8386.js'])assert.deepEqual(fs.readFileSync(path),execFileSync('git',['show',record.base+':'+path]),path+' stays immutable');
});

test('new and inherited source guards reject tampered old or new helper bytes without hiding unrelated source drift',()=>{
  const old=fs.readFileSync(new URL('./frozen/TishunSouthBeam.2544.js',import.meta.url)),live=fs.readFileSync(record.path);
  for(const bytes of [old,live])for(const wrong of [bytes.subarray(1),Buffer.concat([bytes,Buffer.from('// arbitrary drift')]),Buffer.from(bytes.toString().replace("idempotent applied target drift","relaxed identity"))]){
    assert.equal(known(record.path,wrong),false);assert.throws(()=>norm(record.path,wrong),/exact declared/);
    assert.equal(historicalKnown(record.path,wrong),false);assert.throws(()=>historicalNorm(record.path,wrong),/exact declared/);
    assert.throws(()=>normalizeDailouSource(record.path,wrong),/exact declared/);
  }
  for(const path of ['src/scene/zones/ZoneBase.js','src/scene/palace/ConstructionSources.js','src/scene/palace/kit.js','data/zones/west-six.json']){
    const actual=fs.readFileSync(path),wrong=Buffer.concat([actual,Buffer.from(' ')]);
    assert.equal(known(path,wrong),false);assert.equal(norm(path,wrong),wrong,'unrelated delta must not disappear');
  }
});
