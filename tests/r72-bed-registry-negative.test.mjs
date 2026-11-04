import test from 'node:test';
import assert from 'node:assert/strict';
import {NIGHT_BEDS,SHARED_REST_AREAS} from '../src/scene/characters/NightBeds.js';
import {SHARED_REST_IDS} from '../src/scene/characters/SharedRestSlots.js';
import registry from '../data/characters/index.js';
import {assertBedCoverage} from './lib/bed-registry-contract.mjs';
for(const mode of ['missing-shared-consort','duplicate-ordinary','ordinary-male','ordinary-unknown','changed-canopy-id','extra-shared-adult','ordinary-shared-consort','changed-shared-ids'])test('bed coverage rejects '+mode,()=>{
 const beds=structuredClone(NIGHT_BEDS),areas=structuredClone(SHARED_REST_AREAS),ids=[...SHARED_REST_IDS],assigned=beds.filter(b=>b.actorId);
 if(mode==='missing-shared-consort')areas[0].actorIds.pop();
 if(mode==='duplicate-ordinary')assigned[1].actorId=assigned[0].actorId;
 if(mode==='ordinary-male')assigned[0].actorId='taihe-emperor-01';
 if(mode==='ordinary-unknown')assigned[0].actorId='unknown-actor';
 if(mode==='changed-canopy-id')areas[0].id='different-canopy';
 if(mode==='extra-shared-adult')areas[0].actorIds.push(assigned[0].actorId);
 if(mode==='ordinary-shared-consort')assigned[0].actorId='chuxiu-consort-01';
 if(mode==='changed-shared-ids')ids[1]='unknown-actor';
 assert.throws(()=>assertBedCoverage(beds,areas,ids,registry.actors));
});
