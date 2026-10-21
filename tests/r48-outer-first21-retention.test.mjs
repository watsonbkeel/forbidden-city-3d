// Existing a3baa snapshot is immutable. Both the reconstructed historical API
// and current API must independently match it; current-versus-current is invalid.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as liveApi from '../src/scene/palace/special/RemainingOuterHalls.js';
import * as helper from './r48-outer-first21-helper.mjs';
import {revertFinalPairExtension} from './r48-outer-final-pair-retention-helper.mjs';
const dir=new URL('../docs/current-state/r48-remaining/',import.meta.url);
const sourceURL=new URL('../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url);
const productionSource=readFileSync(sourceURL,'utf8');
const pairStage=JSON.parse(readFileSync(new URL('outer-final-pair-source-delta.json',dir)));
const source=revertFinalPairExtension(productionSource,pairStage);
const rows=JSON.parse(readFileSync(new URL('outer-scope.json',dir)));
const baselineBytes=readFileSync(new URL('outer-first21-post-entry-signatures.json',dir));
const baseline=JSON.parse(baselineBytes);
const sha=value=>createHash('sha256').update(value).digest('hex');
const FIELDS=['geometry','meshes','triangles','colliders','walkables','rooms','regions','map','profileNavigation','builtNavigation','builtMetadata'];
const EXPECTED_BASELINE_SHA='07b4c81b04fa819af873286c2dd907b9fc3ddc6b5af1f5b7b3be8666c24d0029';
const POST_ENTRY_SHA='a3baa8766f7e2df13f98fb53802a5d3332082983d652b540c1599d44fe792f91';
const NEW_KEYS=['zhujing','benren','jiyi','hengshou'];
let stage,historicalSource,historicalApi,reviewed25Api;
test.before(async()=>{
  assert.equal(typeof helper.revertFinalFourExtension,'function','explicit source-extension inverse is required, not a replaced historical after hash');
  stage=JSON.parse(readFileSync(new URL('outer-final-four-source-delta.json',dir)));
  historicalSource=helper.revertFinalFourExtension(source,stage);
  historicalApi=await helper.loadOuterApi(historicalSource);
  reviewed25Api=await helper.loadOuterApi(source);
});
test('R48 first21 checkpoint keeps exact a3baa bytes, identity count and signature field contract',()=>{
  assert.equal(sha(baselineBytes),EXPECTED_BASELINE_SHA);
  const signatureHelper=readFileSync(new URL('./r48-outer-first21-helper.mjs',import.meta.url),'utf8').split('// Source-only extension gate.')[0].trimEnd()+'\n';
  assert.equal(sha(signatureHelper),'770eee7830c4d8ffea8e389eb7aae399cece48d026bbee70ac18c52eb0779b07','original first21 signature implementation remains unchanged');
  assert.equal(baseline.moduleSha256,POST_ENTRY_SHA);
  assert.equal(baseline.records.length,21);assert.equal(new Set(baseline.records.map(r=>r.id)).size,21);
  assert.equal(stage.checkpoint.sha256,EXPECTED_BASELINE_SHA);
  assert.equal(stage.checkpoint.moduleSha256,POST_ENTRY_SHA);
  assert.equal(stage.toModuleSha256,'b7d318a374e8249b272ddada2dcf5feb6ce9b59772f1dc1c9ab2e7d34e6e4be4','reviewed 25 stage is fixed; a later identity layer must not replace this after hash');
  assert.equal(stage.checkpoint.signatureImplementationSha256,'770eee7830c4d8ffea8e389eb7aae399cece48d026bbee70ac18c52eb0779b07');
  for(const record of baseline.records)assert.deepEqual(Object.keys(record.signature),FIELDS);
  const ledgerBytes=readFileSync(new URL('outer-safety-retention-delta.json',dir));
  assert.equal(sha(ledgerBytes),'77e7d240b8061bfa4b7b33b8e83a7873c794e466d371da39486989f5ca3b808d');
  assert.equal(stage.priorSafetyLedger.sha256,sha(ledgerBytes));
  assert.equal(sha(historicalSource),POST_ENTRY_SHA);
});
for(const record of baseline.records)test('R48 source extension preserves historical and live first21 exactly: '+record.name,()=>{
  const row=rows.find(row=>row.id===record.id);assert.ok(row);
  assert.deepEqual(helper.first21Signature(row,historicalApi),record.signature,'reconstructed a3baa independently establishes snapshot provenance');
  assert.deepEqual(helper.first21Signature(row,liveApi),record.signature,'current production must equal fixed accepted geometry, collider, support, route and metadata hashes');
});
test('R48 final-four extension changes only four ready identities and keeps all old profiles',()=>{
  assert.deepEqual(reviewed25Api.READY_OUTER_KEYS.filter(key=>!historicalApi.READY_OUTER_KEYS.includes(key)),NEW_KEYS);
  assert.deepEqual(historicalApi.READY_OUTER_KEYS.filter(key=>!reviewed25Api.READY_OUTER_KEYS.includes(key)),[]);
  assert.equal(historicalApi.READY_OUTER_KEYS.length,21);assert.equal(reviewed25Api.READY_OUTER_KEYS.length,25);
  assert.deepEqual(stage.newIdentities.map(r=>r.key),NEW_KEYS);
  for(const record of baseline.records){const row=rows.find(r=>r.id===record.id);assert.deepEqual(reviewed25Api.resolveRemainingProfile(row.zone,row.baselineItem),historicalApi.resolveRemainingProfile(row.zone,row.baselineItem));}
  for(const record of stage.newIdentities){const row=rows.find(r=>r.id===record.id);assert.equal(row.name,record.name);assert.equal(reviewed25Api.resolveRemainingProfile(row.zone,row.baselineItem).key,record.key);assert.equal(historicalApi.resolveRemainingProfile(row.zone,row.baselineItem),null);}
});
test('R48 source extension forward replay restores exactly the reviewed live source',()=>{
  let forward=historicalSource;
  for(const change of stage.sourceChanges)for(const edit of change.edits){assert.equal(forward.split(edit.before).length-1,1,change.id);forward=forward.replace(edit.before,edit.after);}
  assert.equal(forward,source);assert.equal(sha(forward),stage.toModuleSha256);
});
test('R48 source extension rejects an unapproved shared edit even with refreshed live SHA',()=>{
  const mutant=source+'\n// unreviewed shared tail\n';
  assert.throws(()=>helper.revertFinalFourExtension(mutant,stage),/reviewed live source/);
  assert.throws(()=>helper.revertFinalFourExtension(mutant,{...stage,toModuleSha256:sha(mutant)}),/complete approved a3baa source/);
});
test('R48 source extension rejects a shifted or missing exact insertion anchor',()=>{
  const mutated=structuredClone(stage);mutated.sourceChanges.find(c=>c.id==='final-four-local-builders').edits[0].after+=' ';
  assert.throws(()=>helper.revertFinalFourExtension(source,mutated),/exact insertion anchor/);
});
test('R48 first21 frozen signatures reject old geometry mutation outside the new four',async()=>{
  // Mutate a visibly used old-identity material rather than a no-op comment.
  const from='wall:0x9f5240',to='wall:0x9f5241';
  assert.equal(historicalSource.split(from).length-1,1);
  const mutant=await helper.loadOuterApi(historicalSource.replace(from,to));
  const record=baseline.records.find(r=>r.name==='慈荫楼'),row=rows.find(r=>r.id===record.id);
  assert.notEqual(helper.first21Signature(row,mutant).geometry,record.signature.geometry);
});
