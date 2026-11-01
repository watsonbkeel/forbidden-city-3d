// QA ONLY: remove six authenticated new solids from NEW comparison arrays.
// This is not movement state, a physics override or historical source closure.
// The caller must apply the existing strict prior-state hash contract to physics.
import assert from'node:assert/strict';import fs from'node:fs';import{createHash}from'node:crypto';
const hash=b=>createHash('sha256').update(typeof b==='string'||Buffer.isBuffer(b)?b:JSON.stringify(b)).digest('hex');
const bytes=fs.readFileSync(new URL('../fixtures/r159-jiaotai-integration/independent-candidate.json',import.meta.url));
assert.equal(hash(bytes),'cfb75ff65dcd54802fd8e637b41960d01b88ecde4ae4ae65c689037c7ce132bf');
const targets=new Map(JSON.parse(bytes).rows.map(r=>[r.owner,{min:r.min,max:r.max,tag:'static',triangleSupport:null,overhead:null,xiqingRoofSurface:null,duixiuTerrain:false,furnitureMotionScope:null}]));assert.equal(targets.size,6);
export function r159JiaotaiPriorComparison(W,raw){
 assert.equal(W.cm.colliders.length,30882,'raw R159 colliders');assert.equal(raw.rows.length,30882,'raw R159 rows');assert.equal(raw.walkables.length,1365,'raw R159 supports');
 const owned=W.cm.colliders.flatMap((c,i)=>c.mesh?.r159JiaotaiFrontVessel?[{c,i,id:c.mesh.r159JiaotaiFrontVessel}]:[]);
 assert.equal(owned.length,6,'exactly six actual owners');assert.equal(new Set(owned.map(r=>r.id)).size,6,'six unique owner IDs');assert.deepEqual(owned.map(r=>r.id).sort(),[...targets.keys()].sort(),'exact reviewed owner set');
 for(const{c,i,id}of owned){const expected=targets.get(id);assert.deepEqual(c.box.min.toArray(),expected.min,'actual bound min');assert.deepEqual(c.box.max.toArray(),expected.max,'actual bound max');assert.equal(hash(raw.rows[i]),hash(expected),'complete ordinary-solid row including physical metadata');}
 const omitted=new Set(owned.map(r=>r.i)),colliders=W.cm.colliders.filter((_,i)=>!omitted.has(i)),rows=raw.rows.filter((_,i)=>!omitted.has(i));
 assert.equal(rows.length,30876);assert.equal(colliders.length,rows.length);
 // Plain comparison-only object has no collision/query/movement methods.
 const world={...W,cm:{constructor:W.cm.constructor,colliders,walkables:W.cm.walkables,rivers:W.cm.rivers}};
 return{world,physics:{...raw,rows},removedIndices:[...omitted]};
}
