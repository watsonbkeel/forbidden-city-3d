import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {CHARACTER_REGISTRY as r} from '../data/characters/index.js';
import {validateCharacterRegistry} from '../src/scene/characters/CharacterSchema.js';
import {REGISTERED_CHARACTER_LIMIT} from '../src/scene/characters/CharacterLimits.js';
const sha=value=>createHash('sha256').update(value).digest('hex');
const baselineBytes=fs.readFileSync(new URL('./fixtures/r53-r52-character-provenance.json',import.meta.url));
assert.equal(sha(baselineBytes),'17486eb79f03be995dc1671caf76fc7a71d0ac56883412cd9fec3883b09f0b7e','Exact R52 record-hash fixture is not a regenerated current oracle');
const baseline=JSON.parse(baselineBytes);
const contactFix=JSON.parse(fs.readFileSync(new URL('./fixtures/r53-chuxiu-contact-scope.json',import.meta.url)));
const added=['xianfu-eunuch-01','xianfu-maid-01','taiji-maid-01','taiji-eunuch-01','jingyang-eunuch-01','jingyang-eunuch-02'];
test('R53 preserves all71 actor records and explicitly limits the Chuxiu floor/low-kang contact exception',()=>{
 assert.equal(baseline.records.actors.length,71);assert.deepEqual(r.actors.slice(0,71).map(a=>a.id),baseline.records.actors.map(a=>a.id));
 for(const [key,records]of Object.entries(baseline.records))for(const old of records){const now=r[key].find(value=>value.id===old.id);assert.ok(now,`${key}.${old.id}`);if(key==='surfaces'&&old.id==='chuxiu-floor'){assert.equal(sha(JSON.stringify(contactFix.oldSurface)),old.sha256);assert.deepEqual(now,contactFix.newSurface);}else if(key==='seats'&&old.id==='chuxiu-west-north-kang'){assert.equal(sha(JSON.stringify(contactFix.oldSeat)),old.sha256);assert.deepEqual(now,contactFix.newSeat);assert.deepEqual({...contactFix.oldSeat,footSupport:now.footSupport},now,'Only independent shoe probes change, never seat/pelvis');}else assert.equal(sha(JSON.stringify(now)),old.sha256,`${key}.${old.id} changed`);}
 for(const [key,value]of Object.entries(baseline.scope))if(key!=='releaseCoverage')assert.deepEqual(r.scope[key],value,key);
 for(const [key,value]of Object.entries(baseline.scope.releaseCoverage))assert.deepEqual(r.scope.releaseCoverage[key],value,key);
 assert.equal(r.templates.length,7);const priorKit=fs.readFileSync(new URL('./fixtures/r53-kit-before-kang.js.txt',import.meta.url));assert.equal(sha(priorKit),baseline.kitSha256);assert.equal(sha(priorKit),contactFix.beforeKitSha256);const nowKit=fs.readFileSync(new URL('../src/scene/characters/CharacterKit.js',import.meta.url));assert.equal(sha(nowKit),contactFix.afterKitSha256);assert.equal(nowKit.toString(),priorKit.toString().replace("seatVariant==='kang-low'?.04:0","seatVariant==='kang-low'?.06:0"),'Only the approved low-kang sole drop parameter changes; full byte comparison for all other source');
});
test('R53 ships77 required identities, not a count padded with failed or duplicated household candidates',()=>{
 assert.equal(r.actors.length,77);assert.equal(r.actors.filter(a=>a.required).length,77);assert.equal(new Set(r.actors.map(a=>a.id)).size,77);assert.equal(new Set(r.actors.map(a=>a.behavior.seed)).size,77);
 assert.deepEqual(r.actors.slice(71).map(a=>a.id).sort(),[...added].sort());assert.equal(validateCharacterRegistry(r).valid,true);
 for(const id of added){const actor=r.actors.find(a=>a.id===id);assert.ok(['eunuch-daily','maid-daily'].includes(actor.templateId));assert.equal(actor.schedule,'daily-daylight');assert.equal(actor.history.presentation,'interpretive');assert.equal(actor.history.namedIdentity,false);assert.ok(['surface','path'].includes(actor.placement.mode));}
 for(const scene of ['xianfu','taiji','jingyang'])assert.equal(r.actors.filter(a=>a.sceneRef===scene).length,2);
 assert.equal(r.actors.filter(a=>a.schedule==='guard-duty').length,18);assert.equal(REGISTERED_CHARACTER_LIMIT,128);
});
test('R53 minimum77 and all six required IDs cannot be removed, demoted or replaced by a padded count',()=>{
 const scope=r.scope.releaseCoverage.R53;assert.ok(scope);assert.equal(scope.minimumRegistered,77);assert.deepEqual([...scope.additionalRequiredActorIds].sort(),[...added].sort());
 for(const id of added){const copy=structuredClone(r);copy.actors.find(a=>a.id===id).required=false;assert.equal(validateCharacterRegistry(copy).valid,false,id+' demoted');copy.actors=copy.actors.filter(a=>a.id!==id);copy.actors.push({...structuredClone(copy.actors[0]),id:'padding-cannot-replace-'+id});assert.equal(validateCharacterRegistry(copy).valid,false,id+' padded');}
 for(const mutate of [x=>delete x.scope.releaseCoverage.R53,x=>x.scope.releaseCoverage.R53.minimumRegistered=71,x=>x.scope.releaseCoverage.R53.additionalRequiredActorIds.pop()]){const copy=structuredClone(r);mutate(copy);assert.equal(validateCharacterRegistry(copy).valid,false);}
});
test('the old R52 additional33 coverage remains mandatory after the R53 extension',()=>{
 assert.equal(r.scope.releaseCoverage.R52.additionalRequiredActorIds.length,33);
 for(const id of r.scope.releaseCoverage.R52.additionalRequiredActorIds){const copy=structuredClone(r);copy.actors.find(a=>a.id===id).required=false;assert.equal(validateCharacterRegistry(copy).valid,false,id);}
});
