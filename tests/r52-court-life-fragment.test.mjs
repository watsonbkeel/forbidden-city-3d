import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {CHARACTER_REGISTRY as base} from '../data/characters/index.js';
import {withCourtLifeFragment,assertOriginal38} from './lib/r52-court-registry.mjs';
import {validateCharacterRegistry} from '../src/scene/characters/CharacterSchema.js';
const expected=['changchun-consort-01','changchun-maid-01','chengqian-consort-01','chengqian-maid-01','zhongcui-consort-01','zhongcui-maid-01','jingren-maid-01','jingren-eunuch-01','yonghe-maid-01','yonghe-eunuch-01'];
test('R52 adds only the ten approved anonymous daily-life actors and preserves the original 38',()=>{
 const file=new URL('../data/characters/fragments/r52-court-life.json',import.meta.url);
 assert.ok(fs.existsSync(file),'Approved ten-actor additive fragment has not been authored');
 const f=JSON.parse(fs.readFileSync(file));
 assert.deepEqual(f.actors.map(a=>a.id),expected);
 const registry=withCourtLifeFragment(base,f);
 const v=validateCharacterRegistry(registry);assert.deepEqual(v.errors,[]);assert.equal(v.counts.registered,base.actors.length+expected.filter(id=>!base.actors.some(a=>a.id===id)).length);assert.ok(v.counts.registered>=48);
 assertOriginal38(registry);assert.equal(registry.templates.length,7);assert.equal(f.seats.length,0);
 assert.equal(new Set(registry.actors.map(a=>a.behavior.seed)).size,registry.actors.length);
 for(const a of f.actors){assert.equal(a.required,true);assert.equal(a.schedule,'daily-daylight');assert.equal(a.history.namedIdentity,false);assert.equal(a.history.presentation,'interpretive');assert.ok(!a.placement.seatRef);}
 assert.equal(new Set(f.actors.map(a=>a.sceneRef)).size,5);assert.ok(f.paths.length>=2);
 for(const anchor of f.anchors){const z=JSON.parse(fs.readFileSync(new URL('../'+anchor.source,import.meta.url)));assert.equal(z.id,anchor.zoneRef);assert.ok(z.items.some(i=>i.kind==='hall'&&i.name===anchor.building));}
 for(const p of f.paths){assert.ok(p.validationSpacingMeters<=.25);assert.equal(p.crossZone,false);assert.ok(p.turningRadiusMeters>=p.radiusMeters+p.safetyMarginMeters);}
});

test('single-world scenarios resolve real hall frames without hiding other production actors',async()=>{
 const {courtLifeScenarios}=await import('./lib/r52-court-life-scenarios.mjs');
 const {CharacterWorldAdapter}=await import('../src/scene/characters/CharacterWorldAdapter.js');
 const fragment=JSON.parse(fs.readFileSync(new URL('../data/characters/fragments/r52-court-life.json',import.meta.url)));
 const registry=withCourtLifeFragment(base,fragment),zones=['west-six','east-six'].map(z=>JSON.parse(fs.readFileSync(new URL('../data/zones/'+z+'.json',import.meta.url))));
 const adapter=new CharacterWorldAdapter({registry,zones});
 const before=registry.actors.map(a=>a.id),scenarios=courtLifeScenarios({registry,adapter});
 assert.equal(scenarios.length,5);assert.deepEqual(scenarios.flatMap(s=>s.actorIds),expected);assert.deepEqual(registry.actors.map(a=>a.id),before);
 assert.equal(scenarios.reduce((n,s)=>n+s.routes.length,0),2);
 assert.deepEqual(scenarios.map(s=>s.zoneRef),['west-six','east-six','east-six','east-six','east-six']);
 for(const scenario of scenarios){assert.ok(scenario.camera.every(Number.isFinite));assert.ok(scenario.lookAt.every(Number.isFinite));assert.equal(scenario.camera[1],1.7);assert.equal(scenario.lookAt[1],1);}
 adapter.dispose();
});
