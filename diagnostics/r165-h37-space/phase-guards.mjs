import assert from 'node:assert/strict';
export function createLedger(expected){
 assert.equal(new Set(expected).size,expected.length,'fixed ledger identities must be unique');const done=[];
 return {done,complete(id){assert.equal(id,expected[done.length],'exact next completed assertion identity');done.push(id);},assertComplete(){assert.deepEqual(done,expected,'all fixed assertions completed in order');}};
}
export function createFixedCollector({labels,ready,roots,snapshot,collect}){
 assert.equal(typeof collect,'function','explicit collection unavailable');let index=0;const receipts=[];
 return {receipts,after(label){assert.equal(label,labels[index],'fixed completed-group collection schedule');assert.equal(ready(label),true,'all caller assertions/hash/mock release must have returned');const held=roots(),before=snapshot();collect();const after=snapshot(),heldAfter=roots();assert.equal(held.length,heldAfter.length,'strong root count');for(let i=0;i<held.length;i++)assert.equal(held[i],heldAfter[i],'strong root identity '+i);assert.deepEqual(after,before,'collection cannot alter state/capture/identity witness');receipts.push({label,completed:true,collectionCalls:1});index++;},assertComplete(){assert.equal(index,labels.length,'all fixed completed-consumer collections reached');}};
}
