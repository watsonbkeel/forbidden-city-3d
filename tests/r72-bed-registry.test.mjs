import test from 'node:test';import assert from 'node:assert/strict';
import {NIGHT_BEDS} from '../src/scene/characters/NightBeds.js';import registry from '../data/characters/index.js';
test('30 beds cover twelve palace compounds and all 28 distinct women without assigning men',()=>{
 assert.equal(NIGHT_BEDS.length,30);const ids=NIGHT_BEDS.map(b=>b.actorId).filter(Boolean);assert.equal(ids.length,28);assert.equal(new Set(ids).size,28);
 for(const actor of registry.actors.filter(a=>['consort-daily','maid-daily'].includes(a.templateId)))assert.ok(ids.includes(actor.id),actor.id);
 for(const name of ['储秀宫','翊坤宫','永寿宫','长春宫','承乾宫','钟粹宫','景仁宫','永和宫','咸福宫','太极殿','延禧宫','景阳宫'])assert.ok(NIGHT_BEDS.some(b=>b.palace===name),name);
 for(const b of NIGHT_BEDS){assert.ok(['west-six','east-six','ningshou','outer-west'].includes(b.zoneRef),b.id);assert.equal(b.status,'GAMEPLAY_FIT_NOT_HISTORICAL_FURNITURE');assert.ok([b.x,b.z,b.floorY].every(Number.isFinite));}
});
