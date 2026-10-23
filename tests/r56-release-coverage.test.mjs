import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {CHARACTER_REGISTRY as r} from '../data/characters/index.js';
import {validateCharacterRegistry} from '../src/scene/characters/CharacterSchema.js';
import {REGISTERED_CHARACTER_LIMIT} from '../src/scene/characters/CharacterLimits.js';
const sha=value=>createHash('sha256').update(value).digest('hex');
const fixture=fs.readFileSync(new URL('./fixtures/r56-r55-provenance.json',import.meta.url));
assert.equal(sha(fixture),'fdc07050fdff608ad2f6eabf927b5385a123bd35b59be67eac6811c7b43e090c');
const base=JSON.parse(fixture);
const added=['shoukang-maid-01','shoukang-eunuch-01','cining-maid-01','cining-eunuch-01','shouan-maid-01','shouan-eunuch-01','yangxin-eunuch-01','yangxin-eunuch-02'];
test('R56 retains the exact93 R55 actors, all old bindings, approved Kit and prior required coverage',()=>{
 assert.equal(base.baselineCommit,'cff14981446151d2fce9dd37295000a6cb284465');assert.equal(base.records.actors.length,93);
 assert.deepEqual(r.actors.slice(0,93).map(a=>a.id),base.records.actors.map(a=>a.id));
 for(const [key,rows]of Object.entries(base.records))for(const old of rows){const now=r[key].find(x=>x.id===old.id);assert.ok(now,key+'/'+old.id);assert.equal(sha(JSON.stringify(now)),old.sha256,key+'/'+old.id);}
 assert.equal(sha(fs.readFileSync(new URL('../src/scene/characters/CharacterKit.js',import.meta.url))),base.kitSha256);
 for(const [key,value]of Object.entries(base.scope))if(key!=='releaseCoverage')assert.deepEqual(r.scope[key],value,key);
 for(const [key,value]of Object.entries(base.scope.releaseCoverage))assert.deepEqual(r.scope.releaseCoverage[key],value,key);
});
test('R56 registers exactly101 required roles with eight bounded existing-template courtyard additions',()=>{
 assert.equal(r.actors.length,101);assert.equal(r.actors.filter(a=>a.required).length,101);assert.equal(new Set(r.actors.map(a=>a.id)).size,101);assert.equal(new Set(r.actors.map(a=>a.behavior.seed)).size,101);
 assert.deepEqual(r.actors.slice(93).map(a=>a.id),added);assert.equal(r.templates.length,7);assert.equal(REGISTERED_CHARACTER_LIMIT,128);assert.equal(validateCharacterRegistry(r).valid,true);
 assert.equal(r.actors.filter(a=>a.schedule==='guard-duty').length,18);
 for(const a of r.actors.slice(93)){assert.ok(['maid-daily','eunuch-daily'].includes(a.templateId));assert.equal(a.schedule,'daily-daylight');assert.equal(a.history.namedIdentity,false);assert.equal(a.history.presentation,'interpretive');assert.ok(['path','surface'].includes(a.placement.mode));assert.ok(['shoukang','cining','shouan','yangxin'].includes(a.sceneRef));assert.equal(a.behavior.basePose,'standing');}
 for(const scene of ['shoukang','cining','shouan','yangxin'])assert.equal(r.actors.filter(a=>a.sceneRef===scene).length,2);
 assert.equal(r.actors.slice(93).filter(a=>a.placement.mode==='path').length,4);
});
test('R56 cannot hide a missing candidate through demotion, count padding or altered required coverage',()=>{
 const c=r.scope.releaseCoverage.R56;assert.ok(c);assert.equal(c.minimumRegistered,101);assert.deepEqual(c.additionalRequiredActorIds,added);
 for(const id of added){const copy=structuredClone(r);copy.actors.find(a=>a.id===id).required=false;assert.equal(validateCharacterRegistry(copy).valid,false,id+' demotion');copy.actors=copy.actors.filter(a=>a.id!==id);copy.actors.push({...structuredClone(copy.actors[0]),id:'padding-'+id});assert.equal(validateCharacterRegistry(copy).valid,false,id+' padded');}
 for(const mutate of [x=>delete x.scope.releaseCoverage.R56,x=>x.scope.releaseCoverage.R56.minimumRegistered=93,x=>x.scope.releaseCoverage.R56.additionalRequiredActorIds.pop()]){const copy=structuredClone(r);mutate(copy);assert.equal(validateCharacterRegistry(copy).valid,false);}
});
test('new ground bindings are named real halls and never map-only Zaigong or interior exhibits',()=>{
 for(const a of r.actors.slice(93)){
  const surface=r.surfaces.find(s=>s.id===a.placement.surfaceRef),anchor=r.anchors.find(x=>x.id===surface?.anchorRef);assert.ok(surface&&anchor);
  assert.equal(surface.kind,'ground');assert.equal(surface.expectedHeightMeters,0);assert.equal(surface.heightToleranceMeters,.001);assert.equal(anchor.resolver,'zone-item');
  assert.equal(anchor.id,a.sceneRef+'-r56-hall');assert.ok(['寿康宫','慈宁宫','寿安宫','养心殿'].includes(anchor.building));
  assert.equal(a.zoneRef,a.sceneRef==='yangxin'?'west-six':'outer-west');assert.equal(surface.zoneRef,a.zoneRef);
  if(a.placement.mode==='path'){const p=r.paths.find(p=>p.id===a.placement.pathRef);assert.equal(p.surfaceRef,surface.id);assert.equal(p.formationSize,1);assert.equal(p.crossZone,false);assert.equal(p.validationSpacingMeters,.25);assert.equal(p.pointsLocalMeters.length,2);assert.equal(Math.hypot(...p.pointsLocalMeters[1].map((v,i)=>v-p.pointsLocalMeters[0][i])),3.5);}
 }
 assert.equal(r.actors.slice(93).filter(a=>a.templateId==='maid-daily').length,3);assert.equal(r.actors.slice(93).filter(a=>a.templateId==='eunuch-daily').length,5);
 assert.equal(r.actors.some(a=>a.sceneRef==='zaigong'),false);
 const fragment=JSON.parse(fs.readFileSync('data/characters/fragments/r56-courtyard-presence.json'));
 assert.equal(fragment.contexts.find(c=>c.sceneRef==='yangxin').placementClaim,'general-inner-courtyard-interpretation-not-outer-gate-duty');
 assert.equal(sha(fs.readFileSync('data/characters/world-source-freeze.json')),base.worldManifestSha256);
});
