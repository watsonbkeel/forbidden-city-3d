import test from 'node:test';import assert from 'node:assert/strict';
import {assertBedCoverage} from './lib/bed-registry-contract.mjs';
import {SHARED_REST_IDS} from '../src/scene/characters/SharedRestSlots.js';
import {NIGHT_BEDS,SHARED_REST_AREAS} from '../src/scene/characters/NightBeds.js';import registry from '../data/characters/index.js';
test('30 beds retain twelve compounds, with 27 ordinary women plus the exact shared consort covering all 28',()=>{
 assertBedCoverage(NIGHT_BEDS,SHARED_REST_AREAS,SHARED_REST_IDS,registry.actors);
 for(const name of ['储秀宫','翊坤宫','永寿宫','长春宫','承乾宫','钟粹宫','景仁宫','永和宫','咸福宫','太极殿','延禧宫','景阳宫'])assert.ok(NIGHT_BEDS.some(b=>b.palace===name),name);
 for(const b of NIGHT_BEDS){assert.ok(['west-six','east-six','ningshou','outer-west'].includes(b.zoneRef),b.id);assert.equal(b.status,'GAMEPLAY_FIT_NOT_HISTORICAL_FURNITURE');assert.ok([b.x,b.z,b.floorY].every(Number.isFinite));}
});
