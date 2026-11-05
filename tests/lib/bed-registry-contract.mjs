import assert from 'node:assert/strict';
export function assertBedCoverage(beds,areas,sharedIds,actors){
 assert.equal(beds.length,30);const ordinary=beds.map(b=>b.actorId).filter(Boolean),women=actors.filter(a=>['consort-daily','maid-daily'].includes(a.templateId)).map(a=>a.id);
 assert.equal(women.length,28);assert.equal(new Set(women).size,28);assert.equal(ordinary.length,27);assert.equal(new Set(ordinary).size,27);
 for(const id of ordinary)assert.ok(women.includes(id),'ordinary bed must belong to a known woman: '+id);
 const canopyBeds=beds.filter(b=>b.id==='chuxiu-bed-1');assert.equal(canopyBeds.length,1);assert.equal(canopyBeds[0].actorId,null);
 assert.equal(areas.length,1);assert.equal(areas[0].id,'chuxiu-northwest-canopy');assert.deepEqual(areas[0].actorIds,['taihe-emperor-01','chuxiu-consort-01']);assert.deepEqual(sharedIds,['taihe-emperor-01','chuxiu-consort-01']);assert.deepEqual(areas[0].actorIds,sharedIds);
 for(const id of sharedIds)assert.ok(!ordinary.includes(id),'shared adults cannot occupy ordinary beds');
 const sharedWomen=areas[0].actorIds.filter(id=>women.includes(id));assert.deepEqual(sharedWomen,['chuxiu-consort-01']);assert.ok(sharedWomen.every(id=>!ordinary.includes(id)));assert.deepEqual(new Set([...ordinary,...sharedWomen]),new Set(women));
}
