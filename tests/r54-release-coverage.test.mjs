import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {CHARACTER_REGISTRY as r} from '../data/characters/index.js';
import {validateCharacterRegistry} from '../src/scene/characters/CharacterSchema.js';
import {REGISTERED_CHARACTER_LIMIT} from '../src/scene/characters/CharacterLimits.js';
const sha=value=>createHash('sha256').update(value).digest('hex');
const fixture=fs.readFileSync(new URL('./fixtures/r54-r53-provenance.json',import.meta.url));
assert.equal(sha(fixture),'312f87305c043768a77606a96b4e58f9d9d339b5b6f3f8e692cf49702dbb4cb7');
const base=JSON.parse(fixture);
const added=['chuxiu-maid-02','chuxiu-eunuch-01','yikun-maid-01','yikun-eunuch-02','yongshou-maid-02','yongshou-eunuch-01','chengqian-maid-02','chengqian-eunuch-01'];
test('R54 retains the exact77 R53 actors, all old bindings, approved Kit and prior required coverage',()=>{
 assert.equal(base.baselineCommit,'55623124b2f5fbab83673ddfc03b3c2d5da0f074');assert.equal(base.records.actors.length,77);
 assert.deepEqual(r.actors.slice(0,77).map(a=>a.id),base.records.actors.map(a=>a.id));
 for(const [key,rows]of Object.entries(base.records))for(const old of rows){const now=r[key].find(x=>x.id===old.id);assert.ok(now,key+'/'+old.id);assert.equal(sha(JSON.stringify(now)),old.sha256,key+'/'+old.id);}
 assert.equal(sha(fs.readFileSync(new URL('../src/scene/characters/CharacterKit.js',import.meta.url))),base.kitSha256);
 for(const [key,value]of Object.entries(base.scope))if(key!=='releaseCoverage')assert.deepEqual(r.scope[key],value,key);
 for(const [key,value]of Object.entries(base.scope.releaseCoverage))assert.deepEqual(r.scope.releaseCoverage[key],value,key);
});
test('R54 registers exactly85 required roles with eight bounded existing-template courtyard additions',()=>{
 assert.equal(r.actors.length,85);assert.equal(r.actors.filter(a=>a.required).length,85);assert.equal(new Set(r.actors.map(a=>a.id)).size,85);assert.equal(new Set(r.actors.map(a=>a.behavior.seed)).size,85);
 assert.deepEqual(r.actors.slice(77).map(a=>a.id),added);assert.equal(r.templates.length,7);assert.equal(REGISTERED_CHARACTER_LIMIT,128);assert.equal(validateCharacterRegistry(r).valid,true);
 assert.equal(r.actors.filter(a=>a.schedule==='guard-duty').length,18);
 for(const a of r.actors.slice(77)){assert.ok(['maid-daily','eunuch-daily'].includes(a.templateId));assert.equal(a.schedule,'daily-daylight');assert.equal(a.history.namedIdentity,false);assert.equal(a.history.presentation,'interpretive');assert.ok(['path','surface'].includes(a.placement.mode));assert.ok(['chuxiu','yikun','yongshou','chengqian'].includes(a.sceneRef));assert.equal(a.behavior.basePose,'standing');}
 for(const scene of ['chuxiu','yikun','yongshou','chengqian'])assert.equal(r.actors.filter(a=>a.sceneRef===scene).length,4);
 assert.equal(r.actors.slice(77).filter(a=>a.placement.mode==='path').length,5);
});
test('R54 cannot hide a missing candidate through demotion, count padding or altered required coverage',()=>{
 const c=r.scope.releaseCoverage.R54;assert.ok(c);assert.equal(c.minimumRegistered,85);assert.deepEqual(c.additionalRequiredActorIds,added);
 for(const id of added){const copy=structuredClone(r);copy.actors.find(a=>a.id===id).required=false;assert.equal(validateCharacterRegistry(copy).valid,false,id+' demotion');copy.actors=copy.actors.filter(a=>a.id!==id);copy.actors.push({...structuredClone(copy.actors[0]),id:'padding-'+id});assert.equal(validateCharacterRegistry(copy).valid,false,id+' padded');}
 for(const mutate of [x=>delete x.scope.releaseCoverage.R54,x=>x.scope.releaseCoverage.R54.minimumRegistered=77,x=>x.scope.releaseCoverage.R54.additionalRequiredActorIds.pop()]){const copy=structuredClone(r);mutate(copy);assert.equal(validateCharacterRegistry(copy).valid,false);}
});
test('new Chuxiu courtyard support is not the raised interior floor or a hidden failed seat',()=>{
 const c=r.actors.slice(77).filter(a=>a.sceneRef==='chuxiu');assert.equal(c.length,2);
 for(const a of c){assert.equal(a.placement.surfaceRef,'chuxiu-r54-court-ground');assert.notEqual(a.placement.surfaceRef,'chuxiu-floor');}
 const s=r.surfaces.find(s=>s.id==='chuxiu-r54-court-ground');assert.equal(s.kind,'ground');assert.equal(s.expectedHeightMeters,0);assert.equal(s.anchorRef,'chuxiu-hall');
 assert.equal(r.surfaces.find(s=>s.id==='chuxiu-floor').expectedHeightMeters,.62);
});
