// Final 27 layer: two new identities plus exactly two existing Zhujing proxies.
// Every previous checkpoint and ledger remains immutable.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import * as liveApi from '../src/scene/palace/special/RemainingOuterHalls.js';
import {loadOuterApi,first21Signature} from './r48-outer-first21-helper.mjs';
import {PRIOR_25_SHA,FIRST25_FIELDS,hashSource,hashValue,first25Signature,withFirst25Hall,applySourceEdits,revertFinalPairExtension} from './r48-outer-final-pair-retention-helper.mjs';
const dir=new URL('../docs/current-state/r48-remaining/',import.meta.url);
const source=readFileSync(new URL('../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url),'utf8');
const stage=JSON.parse(readFileSync(new URL('outer-final-pair-source-delta.json',dir)));
const checkpointBytes=readFileSync(new URL('outer-first25-pre-paired-signatures.json',dir)),checkpoint=JSON.parse(checkpointBytes);
const rows=JSON.parse(readFileSync(new URL('outer-scope.json',dir)));
const priorSource=revertFinalPairExtension(source,stage),priorApi=await loadOuterApi(priorSource);
const proxyChange=stage.sourceChanges.find(c=>c.id==='zhujing-circular-display-proxies');
const pairChanges=stage.sourceChanges.filter(c=>c!==proxyChange);
const review=stage.records[0],rowById=id=>rows.find(r=>r.id===id);
const finalExpected=record=>{
  const value={...record.signature},changes=stage.records.find(r=>r.id===record.id)?.changes??{};
  assert.deepEqual(Object.keys(changes),record.key==='zhujing'?['colliders','builtMetadata']:[]);
  for(const[field,change]of Object.entries(changes)){
    assert.equal(change.before,record.signature[field]);assert.notEqual(change.before,change.after);
    assert.equal(change.beforeValueSha256,hashValue(change.before));assert.equal(change.afterValueSha256,hashValue(change.after));
    assert.deepEqual(change.reasons,['zhujing-circular-display-proxies']);value[field]=change.after;
  }
  return value;
};
test('R48 final layer fixes b7 provenance and preserves all prior ledger and checkpoint bytes',()=>{
  assert.equal(hashSource(checkpointBytes),'bbec61cc7b06879de419cb6015a66d0c361ee4fc3b0f998f3a1041843d3a8fe3');
  assert.equal(stage.checkpoint.sha256,hashSource(checkpointBytes));assert.equal(checkpoint.moduleSha256,PRIOR_25_SHA);
  assert.equal(stage.fromModuleSha256,PRIOR_25_SHA);assert.equal(hashSource(priorSource),PRIOR_25_SHA);
  assert.equal(stage.toModuleSha256,'a150b7de4351b9543ed03e91c1027c88f625f9b1adcf7ecff0640c2c04452ad0');
  for(const[file,expected,binding]of[
    ['outer-final-four-source-delta.json','6af080706fc3dac3ff5a4b64755f51677c021d5f587415e591b17f967de27c2c','finalFourSourceDeltaSha256'],
    ['outer-safety-retention-delta.json','77e7d240b8061bfa4b7b33b8e83a7873c794e466d371da39486989f5ca3b808d','safetyDeltaSha256'],
    ['outer-first21-post-entry-signatures.json','07b4c81b04fa819af873286c2dd907b9fc3ddc6b5af1f5b7b3be8666c24d0029','first21CheckpointSha256'],
  ]){assert.equal(hashSource(readFileSync(new URL(file,dir))),expected);assert.equal(stage.priorLedgerBindings[binding],expected);}
  assert.equal(hashSource(readFileSync(new URL('outer-first18-retained-signatures.json',dir))),'6b20b5dcec05ee4151a3234dfa2b30ecdf724f7ba602683b30c23848f235ac47');
  assert.equal(checkpoint.records.length,25);assert.equal(new Set(checkpoint.records.map(r=>r.id)).size,25);
  assert.deepEqual(checkpoint.signatureFields,FIRST25_FIELDS);assert.equal(stage.records.length,1);assert.equal(review.key,'zhujing');
  for(const record of checkpoint.records)assert.deepEqual(Object.keys(record.signature),FIRST25_FIELDS);
});
for(const record of checkpoint.records)test('R48 final-pair fixed first25 retention, narrow two-proxy exception only: '+record.name,()=>{
  const row=rowById(record.id);assert.equal(priorApi.resolveRemainingProfile(row.zone,row.baselineItem).key,record.key);
  assert.deepEqual(first25Signature(row,priorApi),record.signature,'fixed historical b7, not a current recapture');
  const actual=first25Signature(row,liveApi);assert.deepEqual(actual,finalExpected(record));
  assert.deepEqual(FIRST25_FIELDS.filter(f=>actual[f]!==record.signature[f]),record.key==='zhujing'?['colliders','builtMetadata']:[]);
});
test('R48 broader first25 helper reproduces the original first21 algorithm exactly',()=>{
  const checkpoint21=JSON.parse(readFileSync(new URL('outer-first21-post-entry-signatures.json',dir)));
  for(const record of checkpoint21.records){const row=rowById(record.id);assert.deepEqual(first25Signature(row,priorApi),record.signature);assert.deepEqual(first21Signature(row,priorApi),record.signature);}
});
test('R48 final pair adds only two exact ready identities; all prior 25 profiles remain equal',()=>{
  assert.equal(priorApi.READY_OUTER_KEYS.length,25);assert.equal(liveApi.READY_OUTER_KEYS.length,27);
  assert.deepEqual(liveApi.READY_OUTER_KEYS.filter(k=>!priorApi.READY_OUTER_KEYS.includes(k)),['ningdao','huanzhang']);
  assert.deepEqual(priorApi.READY_OUTER_KEYS.filter(k=>!liveApi.READY_OUTER_KEYS.includes(k)),[]);
  for(const record of checkpoint.records){const row=rowById(record.id);assert.deepEqual(liveApi.resolveRemainingProfile(row.zone,row.baselineItem),priorApi.resolveRemainingProfile(row.zone,row.baselineItem));}
  assert.deepEqual(stage.newIdentities.map(r=>r.key),['ningdao','huanzhang']);
  for(const record of stage.newIdentities){const row=rowById(record.id);assert.equal(row.name,record.name);assert.equal(priorApi.resolveRemainingProfile(row.zone,row.baselineItem),null);assert.equal(liveApi.resolveRemainingProfile(row.zone,row.baselineItem).key,record.key);}
});
test('R48 final-layer seven exact edits forward replay into the reviewed full source',()=>{
  assert.deepEqual(stage.sourceChanges.map(c=>c.edits.length),[2,1,1,1,2]);
  assert.equal(applySourceEdits(priorSource,stage.sourceChanges),source);
});
test('R48 paired-only source cause has zero effects on all prior25 fields',async()=>{
  const pairOnly=await loadOuterApi(applySourceEdits(priorSource,pairChanges));
  for(const record of checkpoint.records)assert.deepEqual(first25Signature(rowById(record.id),pairOnly),record.signature,record.name);
});
test('R48 Zhujing proxy-only cause accounts for exactly its two frozen changed fields',async()=>{
  const proxyOnly=await loadOuterApi(applySourceEdits(priorSource,[proxyChange]));
  for(const record of checkpoint.records)assert.deepEqual(first25Signature(rowById(record.id),proxyOnly),finalExpected(record),record.name);
});
function captureZhujing(api){return withFirst25Hall(api,rowById(review.id),({kit,built})=>{
  const group=built.f.children.find(n=>n.userData.role==='wenhua-rear-circular-display');assert.ok(group,'actual dedicated SouthCourtHall base, not a generic hall substitute');
  const rim=group.children.find(n=>n.isMesh&&n.geometry.type==='TorusGeometry'),light=built.f.children.find(n=>n.userData.role==='wenhua-rear-display-light');assert.ok(rim&&light);
  const components=[rim,light].map((mesh,index)=>({role:index?'retained-display-light':'retained-circular-rim',worldBox:JSON.parse(JSON.stringify(new THREE.Box3().setFromObject(mesh))),proxy:structuredClone(mesh.userData.actualComponentProxy??null)}));
  return{colliders:JSON.parse(JSON.stringify(kit.colliders)),metadata:JSON.parse(JSON.stringify(built.g)),components};
});}
test('R48 Zhujing adds exactly two thin component bounds and preserves all 46 old colliders in order',()=>{
  const before=captureZhujing(priorApi),after=captureZhujing(liveApi),fixed=review.componentEvidence;
  assert.equal(before.colliders.length,46);assert.equal(after.colliders.length,48);assert.deepEqual(fixed.colliderCount,{before:46,after:48});
  assert.equal(fixed.newColliderInsertionIndex,30);const retained=[...after.colliders],added=retained.splice(30,2);
  assert.deepEqual(added,fixed.newColliders);assert.deepEqual(retained,before.colliders);assert.equal(hashValue(retained),fixed.retainedColliderSequenceSha256);
  assert.deepEqual(after.components,fixed.components);
  for(let i=0;i<2;i++){
    assert.equal(before.components[i].proxy,null);assert.equal(after.components[i].proxy.lowerHeadMargin,0);
    assert.equal(after.components[i].proxy.status,'VISIBLE_COMPONENT_BOUNDING_BOX_NOT_INVISIBLE_ROOM_FILL');
    assert.deepEqual(after.components[i].worldBox,before.components[i].worldBox);
    for(const end of ['min','max'])for(const axis of ['x','y','z'])assert.ok(Math.abs(added[i][end][axis]-after.components[i].worldBox[end][axis])<1e-7,'proxy follows this real mesh bounds without a blanket fill');
  }
});
test('R48 Zhujing full built metadata differs only by circularDisplayProxies',()=>{
  const before=captureZhujing(priorApi),after=captureZhujing(liveApi),{circularDisplayProxies,...retained}=after.metadata;
  assert.deepEqual(circularDisplayProxies,{count:2,geometry:'RETAINED_UNMODIFIED',status:'ACTUAL_VISIBLE_COMPONENT_THIN_BOUNDS',inheritedFrontProjection:{rim:.08,light:.085}});
  assert.deepEqual(review.componentEvidence.onlyAddedMetadata,{field:'circularDisplayProxies',value:circularDisplayProxies});
  assert.deepEqual(retained,before.metadata);assert.equal(hashValue(retained),review.componentEvidence.unchangedFullMetadataWithoutAdditionSha256);
});
test('R48 final-layer rejection: even a refreshed live hash cannot conceal an unrelated edit',()=>{
  const mutant=source+'\n// unapproved shared tail\n';
  assert.throws(()=>revertFinalPairExtension(mutant,stage),/reviewed final-layer source SHA/);
  assert.throws(()=>revertFinalPairExtension(mutant,{...stage,toModuleSha256:hashSource(mutant)}),/complete approved b7 source/);
});
test('R48 final-layer rejection: a profile-evidence allowance cannot move a building',()=>{
  const altered=structuredClone(stage),edit=altered.sourceChanges[0].edits[0];edit.after=edit.after.replace('"x": 192.2','"x": 192.3');edit.afterSourceSha256=hashSource(edit.after);
  assert.throws(()=>revertFinalPairExtension(source,altered),/profile coordinates and identity/);
});
test('R48 final-layer rejection: widening one approved thin proxy changes its fixed hash',async()=>{
  const from='visibleComponentProxy(kit,f,rim);visibleComponentProxy(kit,f,displayLight);';
  assert.equal(source.split(from).length-1,1);
  const mutant=await loadOuterApi(source.replace(from,'visibleComponentProxy(kit,f,rim,{headMargin:.05});visibleComponentProxy(kit,f,displayLight);'));
  const record=checkpoint.records.find(r=>r.key==='zhujing'),actual=first25Signature(rowById(record.id),mutant),expected=finalExpected(record);
  assert.notEqual(actual.colliders,expected.colliders);
  for(const field of FIRST25_FIELDS.filter(f=>f!=='colliders'))assert.equal(actual[field],expected[field]);
});
