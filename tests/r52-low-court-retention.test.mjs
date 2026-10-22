import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CHARACTER_REGISTRY} from '../data/characters/index.js';
import {selectCharacterBudget} from '../src/scene/characters/CharacterLOD.js';
const added=JSON.parse(fs.readFileSync(new URL('../reports/r52-population/candidates/taihe-14.json',import.meta.url))).actors;
const actors=structuredClone(CHARACTER_REGISTRY.actors);for(const actor of added)if(!actors.some(a=>a.id===actor.id))actors.push(actor);
const originalIds=new Set(CHARACTER_REGISTRY.scope.requiredActorIds),original=actors.filter(a=>originalIds.has(a.id));
const candidates=actors.map(a=>({...a,lod:1,distance:100})),oldCandidates=original.map(a=>({...a,lod:1,distance:100}));
test('R52 expansion preserves the exact low-tier original1 emperor+12 officials+2 attendants+4 guards; other required actors remain registered',()=>{
 const expected=selectCharacterBudget(oldCandidates,'low',original).filter(a=>a.id.startsWith('taihe-')).map(a=>a.id).sort();
 const selected=selectCharacterBudget(candidates,'low',actors).filter(a=>a.id.startsWith('taihe-')).map(a=>a.id).sort();
 assert.equal(expected.length,19);assert.deepEqual(selected,expected);assert.ok(added.every(a=>a.required));
});
test('R52 high tier retains all37 Taihe actors under the same budget; near geometry remains bounded',()=>{
 const court=candidates.filter(a=>a.id.startsWith('taihe-')).map(a=>({...a,lod:0,distance:5}));const selected=selectCharacterBudget(court,'high',actors);assert.equal(selected.length,37);assert.equal(selected.filter(a=>a.lod===0).length,2);
});
