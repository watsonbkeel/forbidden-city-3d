import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {CHARACTER_REGISTRY as r} from '../data/characters/index.js';
import {validateCharacterRegistry} from '../src/scene/characters/CharacterSchema.js';
import {REGISTERED_CHARACTER_LIMIT} from '../src/scene/characters/CharacterLimits.js';
const sha=value=>createHash('sha256').update(value).digest('hex');
const fixture=fs.readFileSync(new URL('./fixtures/r55-r54-provenance.json',import.meta.url));
assert.equal(sha(fixture),'3d157c0188851e240c09c235ef2b654d6378e91fda1c46c852c6cc5b70ecacfb');
const base=JSON.parse(fixture);
const added=['changchun-maid-02','changchun-eunuch-01','zhongcui-maid-02','zhongcui-eunuch-01','jingren-maid-02','jingren-eunuch-02','yonghe-maid-02','yonghe-eunuch-02'];
test('R55 retains the exact85 R54 actors, all old bindings, approved Kit and prior required coverage',()=>{
 assert.equal(base.baselineCommit,'edd1d6de15ad1393a45d6da8712e37ac3d8dc388');assert.equal(base.records.actors.length,85);
 assert.deepEqual(r.actors.slice(0,85).map(a=>a.id),base.records.actors.map(a=>a.id));
 for(const [key,rows]of Object.entries(base.records))for(const old of rows){const now=r[key].find(x=>x.id===old.id);assert.ok(now,key+'/'+old.id);assert.equal(sha(JSON.stringify(now)),old.sha256,key+'/'+old.id);}
 assert.equal(sha(fs.readFileSync(new URL('../src/scene/characters/CharacterKit.js',import.meta.url))),base.kitSha256);
 for(const [key,value]of Object.entries(base.scope))if(key!=='releaseCoverage')assert.deepEqual(r.scope[key],value,key);
 for(const [key,value]of Object.entries(base.scope.releaseCoverage))assert.deepEqual(r.scope.releaseCoverage[key],value,key);
});
test('R55 registers exactly93 required roles with eight bounded existing-template courtyard additions',()=>{
 assert.equal(r.actors.length,93);assert.equal(r.actors.filter(a=>a.required).length,93);assert.equal(new Set(r.actors.map(a=>a.id)).size,93);assert.equal(new Set(r.actors.map(a=>a.behavior.seed)).size,93);
 assert.deepEqual(r.actors.slice(85).map(a=>a.id),added);assert.equal(r.templates.length,7);assert.equal(REGISTERED_CHARACTER_LIMIT,128);assert.equal(validateCharacterRegistry(r).valid,true);
 assert.equal(r.actors.filter(a=>a.schedule==='guard-duty').length,18);
 for(const a of r.actors.slice(85)){assert.ok(['maid-daily','eunuch-daily'].includes(a.templateId));assert.equal(a.schedule,'daily-daylight');assert.equal(a.history.namedIdentity,false);assert.equal(a.history.presentation,'interpretive');assert.ok(['path','surface'].includes(a.placement.mode));assert.ok(['changchun','zhongcui','jingren','yonghe'].includes(a.sceneRef));assert.equal(a.behavior.basePose,'standing');}
 for(const scene of ['changchun','zhongcui','jingren','yonghe'])assert.equal(r.actors.filter(a=>a.sceneRef===scene).length,4);
 assert.equal(r.actors.slice(85).filter(a=>a.placement.mode==='path').length,4);
});
test('R55 cannot hide a missing candidate through demotion, count padding or altered required coverage',()=>{
 const c=r.scope.releaseCoverage.R55;assert.ok(c);assert.equal(c.minimumRegistered,93);assert.deepEqual(c.additionalRequiredActorIds,added);
 for(const id of added){const copy=structuredClone(r);copy.actors.find(a=>a.id===id).required=false;assert.equal(validateCharacterRegistry(copy).valid,false,id+' demotion');copy.actors=copy.actors.filter(a=>a.id!==id);copy.actors.push({...structuredClone(copy.actors[0]),id:'padding-'+id});assert.equal(validateCharacterRegistry(copy).valid,false,id+' padded');}
 for(const mutate of [x=>delete x.scope.releaseCoverage.R55,x=>x.scope.releaseCoverage.R55.minimumRegistered=85,x=>x.scope.releaseCoverage.R55.additionalRequiredActorIds.pop()]){const copy=structuredClone(r);mutate(copy);assert.equal(validateCharacterRegistry(copy).valid,false);}
});
test('new roles reuse exact four courtyard ground surfaces, not new exhibit/interior supports',()=>{
 for(const a of r.actors.slice(85)){
  const surface=r.surfaces.find(s=>s.id===a.placement.surfaceRef);assert.ok(surface);assert.equal(surface.kind,'ground');assert.equal(surface.expectedHeightMeters,0);assert.equal(surface.anchorRef,a.sceneRef+'-r52-hall');
  assert.ok(base.records.surfaces.some(s=>s.id===surface.id&&s.sha256===sha(JSON.stringify(surface))));
  if(a.placement.mode==='path'){const p=r.paths.find(p=>p.id===a.placement.pathRef);assert.equal(p.surfaceRef,surface.id);assert.equal(p.formationSize,1);assert.equal(p.crossZone,false);assert.equal(p.validationSpacingMeters,.25);}
 }
 assert.equal(r.actors.find(a=>a.id==='zhongcui-eunuch-01').placement.mode,'path');
 assert.equal(r.actors.find(a=>a.id==='zhongcui-maid-02').placement.mode,'surface');
});
