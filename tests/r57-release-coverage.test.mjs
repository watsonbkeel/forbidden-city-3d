import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {CHARACTER_REGISTRY as r} from '../data/characters/index.js';
import {validateCharacterRegistry} from '../src/scene/characters/CharacterSchema.js';
import {REGISTERED_CHARACTER_LIMIT} from '../src/scene/characters/CharacterLimits.js';
const sha=value=>createHash('sha256').update(value).digest('hex');
const fixture=fs.readFileSync(new URL('./fixtures/r57-r56-provenance.json',import.meta.url));
assert.equal(sha(fixture),'1fb73cc56a79739763958a7b60d778993f3fe1365685371f8ac002f703152b91');
const base=JSON.parse(fixture);
const added=['yangxing-eunuch-01','yangxing-eunuch-02','leshou-maid-01','leshou-eunuch-01','jingfu-eunuch-01','chonghua-maid-01','chonghua-eunuch-01'];
test('R57 retains the exact101 R56 actors, all old bindings, approved Kit and prior required coverage',()=>{
 assert.equal(base.baselineCommit,'171e819520c0e868acb0fd3fc135875f1e2b734a');assert.equal(base.records.actors.length,101);
 assert.deepEqual(r.actors.slice(0,101).map(a=>a.id),base.records.actors.map(a=>a.id));
 for(const [key,rows]of Object.entries(base.records))for(const old of rows){const now=r[key].find(x=>x.id===old.id);assert.ok(now,key+'/'+old.id);assert.equal(sha(JSON.stringify(now)),old.sha256,key+'/'+old.id);}
 assert.equal(sha(fs.readFileSync(new URL('../src/scene/characters/CharacterKit.js',import.meta.url))),base.kitSha256);
 for(const [key,value]of Object.entries(base.scope))if(key!=='releaseCoverage')assert.deepEqual(r.scope[key],value,key);
 for(const [key,value]of Object.entries(base.scope.releaseCoverage))assert.deepEqual(r.scope.releaseCoverage[key],value,key);
});
test('R57 registers exactly108 required roles with seven bounded existing-template courtyard additions',()=>{
 assert.equal(r.actors.length,108);assert.equal(r.actors.filter(a=>a.required).length,108);assert.equal(new Set(r.actors.map(a=>a.id)).size,108);assert.equal(new Set(r.actors.map(a=>a.behavior.seed)).size,108);
 assert.deepEqual(r.actors.slice(101).map(a=>a.id),added);assert.equal(r.templates.length,7);assert.equal(REGISTERED_CHARACTER_LIMIT,128);assert.equal(validateCharacterRegistry(r).valid,true);
 assert.equal(r.actors.filter(a=>a.schedule==='guard-duty').length,18);
 for(const a of r.actors.slice(101)){assert.ok(['maid-daily','eunuch-daily'].includes(a.templateId));assert.equal(a.schedule,'daily-daylight');assert.equal(a.history.namedIdentity,false);assert.equal(a.history.presentation,'interpretive');assert.ok(['path','surface'].includes(a.placement.mode));assert.ok(['yangxing','leshou','jingfu','chonghua'].includes(a.sceneRef));assert.equal(a.behavior.basePose,'standing');}
 for(const scene of ['yangxing','leshou','jingfu','chonghua'])assert.equal(r.actors.filter(a=>a.sceneRef===scene).length,scene==='jingfu'?1:2);
 assert.equal(r.actors.slice(101).filter(a=>a.placement.mode==='path').length,3);
});
test('R57 cannot hide a missing candidate through demotion, count padding or altered required coverage',()=>{
 const c=r.scope.releaseCoverage.R57;assert.ok(c);assert.equal(c.minimumRegistered,108);assert.deepEqual(c.additionalRequiredActorIds,added);
 for(const id of added){const copy=structuredClone(r);copy.actors.find(a=>a.id===id).required=false;assert.equal(validateCharacterRegistry(copy).valid,false,id+' demotion');copy.actors=copy.actors.filter(a=>a.id!==id);copy.actors.push({...structuredClone(copy.actors[0]),id:'padding-'+id});assert.equal(validateCharacterRegistry(copy).valid,false,id+' padded');}
 for(const mutate of [x=>delete x.scope.releaseCoverage.R57,x=>x.scope.releaseCoverage.R57.minimumRegistered=101,x=>x.scope.releaseCoverage.R57.additionalRequiredActorIds.pop()]){const copy=structuredClone(r);mutate(copy);assert.equal(validateCharacterRegistry(copy).valid,false);}
});
test('new ground bindings are named real halls and never map-only Zaigong or interior exhibits',()=>{
 for(const a of r.actors.slice(101)){
  const surface=r.surfaces.find(s=>s.id===a.placement.surfaceRef),anchor=r.anchors.find(x=>x.id===surface?.anchorRef);assert.ok(surface&&anchor);
  assert.equal(surface.kind,'ground');assert.equal(surface.expectedHeightMeters,0);assert.equal(surface.heightToleranceMeters,.001);assert.equal(anchor.resolver,'zone-item');
  assert.equal(anchor.id,a.sceneRef+'-r57-hall');assert.ok(['养性殿','乐寿堂','景福宫','重华宫'].includes(anchor.building));
  assert.equal(a.zoneRef,a.sceneRef==='chonghua'?'west-six':'ningshou');assert.equal(surface.zoneRef,a.zoneRef);
  if(a.placement.mode==='path'){const p=r.paths.find(p=>p.id===a.placement.pathRef);assert.equal(p.surfaceRef,surface.id);assert.equal(p.formationSize,1);assert.equal(p.crossZone,false);assert.equal(p.validationSpacingMeters,.25);assert.equal(p.pointsLocalMeters.length,2);assert.equal(Math.hypot(...p.pointsLocalMeters[1].map((v,i)=>v-p.pointsLocalMeters[0][i])),3.5);}
 }
 assert.equal(r.actors.slice(101).filter(a=>a.templateId==='maid-daily').length,2);assert.equal(r.actors.slice(101).filter(a=>a.templateId==='eunuch-daily').length,5);
 assert.equal(r.actors.some(a=>a.sceneRef==='zaigong'),false);
 assert.ok(fs.existsSync('data/characters/fragments/r57-front-space-presence.json'),'new bounded fragment exists');
 const fragment=JSON.parse(fs.readFileSync('data/characters/fragments/r57-front-space-presence.json'));
 assert.equal(fragment.contexts.filter(c=>c.placementClaim==='existing-hall-front-space-not-complete-court').length,3);
 for(const [path,digest]of Object.entries(base.runtimeHashes))assert.equal(sha(fs.readFileSync('src/scene/characters/'+path)),digest,path);
 assert.equal(sha(fs.readFileSync('data/characters/world-source-freeze.json')),base.worldManifestSha256);
});
