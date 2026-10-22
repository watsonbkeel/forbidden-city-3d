import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CHARACTER_REGISTRY as original} from '../data/characters/index.js';
import {validateCharacterRegistry} from '../src/scene/characters/CharacterSchema.js';
import {withCourtLifeFragment,assertOriginal38} from './lib/r52-court-registry.mjs';
const fragment=JSON.parse(fs.readFileSync(new URL('../reports/r52-gate-patrol/registry-fragment.json',import.meta.url)));
const combined=withCourtLifeFragment(original,fragment);
test('additive gate candidate preserves original38 and every other integrated actor without duplicate additions',()=>{
 assert.equal(validateCharacterRegistry(combined).valid,true);
 assert.equal(combined.actors.length,original.actors.length+fragment.actors.filter(a=>!original.actors.some(b=>b.id===a.id)).length);
 assertOriginal38(combined);
 for(const actor of original.actors)assert.deepEqual(combined.actors.find(a=>a.id===actor.id),actor);
 assert.equal(combined.scope,original.scope);
 for(const key of ['anchors','surfaces','paths'])assert.deepEqual(combined[key].slice(0,original[key].length),original[key]);
 assert.equal(fragment.actors.length,9);
 for(const a of fragment.actors){assert.equal(a.required,true);assert.equal(a.templateId,'guard-duty');assert.equal(a.schedule,'guard-duty');}
});
test('east patrol shares exactly the approved west timing and bounded formation contract',()=>{
 const west=original.actors.find(a=>a.id==='west-lane-guard-01'),east=fragment.actors.filter(a=>a.id.startsWith('east-lane'));
 assert.deepEqual(east.map(a=>a.behavior.followerIndex),[0,1,2]);
 for(const a of east){for(const key of ['speedMetersPerSecond','pauseSeconds','followerSpacingMeters'])assert.equal(a.behavior[key],west.behavior[key]);assert.equal(a.behavior.patrolGroup,'east-lane-group');assert.equal(a.placement.pathRef,'east-second-lane-patrol');}
 const p=fragment.paths[0];assert.equal(p.crossZone,false);assert.equal(p.zoneRef,'east-six');assert.equal(p.radiusMeters,.38);assert.equal(p.safetyMarginMeters,.12);assert.equal(p.turningRadiusMeters,.55);assert.equal(p.validationSpacingMeters,.25);assert.equal(p.formationSize,3);assert.deepEqual(p.allowedDoorRefs,[]);
});
test('all additions use named real zone-item or zone-region frames, never fabricated Layout/world transforms',()=>{
 for(const a of fragment.anchors){const z=JSON.parse(fs.readFileSync(new URL('../'+a.source,import.meta.url))),item=z.items.find(i=>i.name===a.building&&(a.resolver==='zone-region'?i.kind==='region':['gate','cityGate'].includes(i.kind)));assert.ok(item);assert.ok(['zone-item','zone-region'].includes(a.resolver));assert.equal(z.id,a.zoneRef);if(a.id==='donghua-gate')assert.equal(item.rot,'east');if(['xihua-gate','longzong-gate'].includes(a.id))assert.equal(item.rot,'west');}
});
