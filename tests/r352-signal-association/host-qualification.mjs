import assert from 'node:assert/strict';
// Called only by the private new signal arms; preserves the original ledger,
// strict health and generation deadline before activity-window qualification.
export async function finishQualifiedGeneration({generation,ready,settle,finish,health,qualify,bounded}){
 assert.ok(generation===2||generation===3);assert.equal(ready.length,generation);assert.ok(ready[generation-1].slots.length===3&&ready[generation-1].slots.every(s=>s.status==='READY'));
 await settle();finish();await health();const receipt=await bounded(Promise.resolve().then(()=>qualify()));
 assert.equal(receipt.generation,generation);assert.equal(receipt.qualified,true);assert.equal(receipt.active,false);assert.equal(receipt.abortDuringActive,false);assert.equal(receipt.signalAborted,false);assert.equal(receipt.cleanupStarted,false);assert.equal(receipt.closed,false);return receipt;
}
export function requireFinalActivity(generations){
 assert.equal(generations.length,3);
 for(const [i,g]of generations.entries()){
  const a=g.activity;assert.equal(g.index,i+1);assert.equal(g.disposed,true);assert.equal(a.generation,i+1);assert.equal(a.closed,true);assert.equal(a.active,false);assert.equal(a.cleanupStarted,true);assert.equal(a.signalAborted,true);assert.equal(a.abortDuringActive,false);
  if(i===0){assert.equal(a.intentionalFirstAbort,true);assert.equal(a.qualified,false);assert.equal(a.cleanupAbort,false);}else{assert.equal(a.qualified,true);assert.equal(a.intentionalFirstAbort,false);assert.equal(a.cleanupAbort,true);}
 }
}
