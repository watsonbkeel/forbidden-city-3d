import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import{createHash}from'node:crypto';
const read=name=>JSON.parse(fs.readFileSync(new URL('../docs/current-state/r34-resource-budgets/'+name+'.json',import.meta.url)));
const baseline=read('baseline'),candidate=read('candidate'),saved=1830624;
const untimed=value=>JSON.parse(JSON.stringify(value,(key,v)=>['ms','buildMs'].includes(key)?undefined:v));
test('independent R33 and silhouette-only CPU receipts differ in one exact product source',()=>{
 assert.deepEqual(Object.keys(baseline.sourceIdentities),Object.keys(candidate.sourceIdentities));
 assert.deepEqual(Object.keys(baseline.sourceIdentities).filter(p=>baseline.sourceIdentities[p]!==candidate.sourceIdentities[p]),['src/render/SilhouetteBuilder.js']);
 const bytes=fs.readFileSync(new URL('../src/render/SilhouetteBuilder.js',import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),candidate.sourceIdentities['src/render/SilhouetteBuilder.js']);
});
test('exact-index evidence retains all permanent, zone, optional and navigation inventories',()=>{
 for(const key of ['permanent','permanentTotal','supplementalResident','zones','lifecycle','optional','sharedTextureManifest','silhouetteDisposal'])assert.deepEqual(untimed(candidate[key]),untimed(baseline[key]),key);
 assert.equal(candidate.snapshots.length,baseline.snapshots.length);
 for(let i=0;i<candidate.snapshots.length;i++){
  const a=structuredClone(baseline.snapshots[i]),b=structuredClone(candidate.snapshots[i]);
  for(const key of ['scene','silhouettes','allRetainedGeometry']){assert.equal(a[key].geometryBytes-b[key].geometryBytes,saved,`${a.label}/${key}`);a[key].geometryBytes=b[key].geometryBytes;}
  assert.deepEqual(a,b,a.label);
 }
});
test('CPU lifecycle receipts include all zones, shared ownership, six optional reloads and final silhouette disposal',()=>{
 assert.equal(Object.keys(candidate.lifecycle).length,7);assert.equal(Object.keys(candidate.optional).length,6);
 for(const row of Object.values(candidate.lifecycle)){
  assert.equal(row.equalBeforeAfter,true);assert.equal(row.sharedDisposals,0);assert.equal(row.sharedTextureDisposals,0);assert.equal(row.geometryDisposalMin,1);assert.equal(row.geometryDisposalMax,1);assert.equal(row.remainingTags,0);assert.equal(row.geometryDisposals,row.uniqueGeometries);
  assert.equal(row.silhouetteVisibleUnloaded,true);assert.equal(row.silhouetteVisibleLoaded,false);
 }
 for(const row of Object.values(candidate.optional)){
  for(const key of ['loaded','navigationRestored','reloadSucceeded','reloadBudgetIdentical','reloadNavigationRestored'])assert.equal(row[key],true);
  assert.equal(row.disposal.events,row.disposal.uniqueGeometries);assert.equal(row.disposal.min,1);assert.equal(row.disposal.max,1);
 }
 for(const row of Object.values(candidate.silhouetteDisposal))assert.deepEqual(row,{geometry:1,material:1});
});
