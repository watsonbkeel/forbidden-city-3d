// Explicit cumulative scope: remove only the actual tagged C source products
// and the exact frozen old source products. No range-box/global exemption.
import assert from 'node:assert/strict';import crypto from 'node:crypto';
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
function subtract(rows,removed){const counts=new Map();for(const v of removed)counts.set(v,(counts.get(v)??0)+1);const kept=[];for(const v of rows){if(counts.get(v)>0)counts.set(v,counts.get(v)-1);else kept.push(v);}assert.ok([...counts.values()].every(n=>n===0),'every exact old source occurrence must exist');return kept;}
export function compareInstrumentsWithObservedApproach(W,actual,instrumentsBaseline,approachBaseline){
 const tag='axis/taihemen-observed-approach',newIndices=new Set(W.cm.colliders.flatMap((c,i)=>c.mesh.taihemenObservedSource===tag?[i]:[]));
 const raw=W.palaceBuilder.getWalkables(),probe=new W.cm.constructor();probe.addWalkables(raw,'static');assert.equal(hash(probe.walkables),hash(W.cm.walkables.slice(0,raw.length)),'source support registration order');const supportIndices=new Set(raw.flatMap((w,i)=>w.taihemenObservedSource===tag?[i]:[]));
 assert.equal(newIndices.size,77);assert.equal(supportIndices.size,3);assert.equal(approachBaseline.removedSourceColliderRecords.length,68);assert.equal(approachBaseline.removedSourceSupports.length,2);
 const target=actual.rows.filter(c=>c.triangleSupport?.id.startsWith('taihe-terrace-instrument:'));
 const retained=actual.rows.filter((c,i)=>!newIndices.has(i)&&!target.includes(c)).map(hash).sort(),expected=subtract(instrumentsBaseline.retained,approachBaseline.removedSourceColliderRecords.map(hash)).sort();
 const supports=actual.walkables.filter((_,i)=>!supportIndices.has(i)).map(hash),expectedSupports=subtract(instrumentsBaseline.walkables.map(hash),approachBaseline.removedSourceSupports.map(hash));
 return{targetCount:target.length,total:actual.rows.length,retainedCount:retained.length,retainedExact:hash(retained)===hash(expected),walkablesExact:hash(supports)===hash(expectedSupports),riversExact:hash(actual.rivers)===hash(instrumentsBaseline.rivers),observedSourceColliders:newIndices.size,observedSourceSupports:supportIndices.size};
}
