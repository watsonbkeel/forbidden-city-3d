import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {CHARACTER_REGISTRY as base} from '../data/characters/index.js';
import {validateCharacterRegistry} from '../src/scene/characters/CharacterSchema.js';
import {characterGeometryOptionsFor} from '../src/scene/characters/CharacterGeometryOptions.js';
const file=new URL('../data/characters/fragments/r53-household-life.json',import.meta.url);
const expected=['xianfu-eunuch-01','xianfu-maid-01','taiji-maid-01','taiji-eunuch-01','jingyang-eunuch-01','jingyang-eunuch-02'];
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
test('R53 candidate fragment adds exactly six anonymous required household roles without changing frozen71 coverage',async()=>{
 assert.ok(fs.existsSync(file),'Required six-actor candidate fragment has not been authored');
 const f=JSON.parse(fs.readFileSync(file));const {withR53LifeCandidates}=await import('./lib/r53-life-candidates.mjs');
 assert.deepEqual(f.actors.map(a=>a.id),expected);assert.ok([71,77].includes(base.actors.length));assert.equal(hash(base.actors.slice(0,71)),'bc42abd8b0fcd448d95eb72b95577c97992acd93f95845301229d960c7013098');const before=hash(base),registry=withR53LifeCandidates(base,f);
 assert.equal(registry.actors.length,77);assert.deepEqual(registry.actors.slice(0,71),base.actors.slice(0,71));assert.equal(hash(base),before);
 assert.deepEqual(registry.scope,base.scope);assert.deepEqual(validateCharacterRegistry(registry).errors,[]);assert.equal(validateCharacterRegistry(registry).counts.required,77);
 assert.equal(f.anchors.length,3);assert.equal(f.surfaces.length,6);assert.equal(f.paths.length,3);assert.equal(f.seats.length,0);assert.equal(f.evidence.length,3);
 assert.equal(new Set(registry.actors.map(a=>a.behavior.seed)).size,77);
 for(const a of f.actors){assert.equal(a.required,true);assert.equal(a.schedule,'daily-daylight');assert.equal(a.history.presentation,'interpretive');assert.equal(a.history.namedIdentity,false);assert.ok(['eunuch-daily','maid-daily'].includes(a.templateId));assert.ok(!a.placement.positionOffset);assert.ok(!a.placement.seatRef);}
 for(const p of f.paths){assert.equal(p.radiusMeters,.5);assert.ok(p.safetyMarginMeters>=.15);assert.ok(p.validationSpacingMeters<=.25);assert.equal(p.crossZone,false);assert.equal(p.formationSize,1);assert.deepEqual(p.allowedDoorRefs,[]);assert.ok(p.turningRadiusMeters>=p.radiusMeters+p.safetyMarginMeters);}
 for(const a of f.actors.filter(a=>a.templateId==='maid-daily'))assert.equal(characterGeometryOptionsFor(a).femalePose,a.placement.mode==='path'?'walking':undefined);
 assert.throws(()=>withR53LifeCandidates(base,{...f,actors:[{...f.actors[0],id:base.actors[0].id}]}),/Conflicting/);
});

test('candidate composition accepts strict frozen71 or already integrated77 and is idempotent',async()=>{
 const f=JSON.parse(fs.readFileSync(file)),{withR53LifeCandidates}=await import('./lib/r53-life-candidates.mjs');
 const candidate={...base};for(const key of ['actors','anchors','surfaces','paths','seats','evidence'])candidate[key]=base[key].filter(row=>!f[key].some(a=>a.id===row.id));
 assert.equal(candidate.actors.length,71);const integrated=withR53LifeCandidates(candidate,f),twice=withR53LifeCandidates(integrated,f);assert.equal(twice.actors.length,77);assert.deepEqual(twice,integrated);assert.deepEqual(twice.actors.slice(0,71),candidate.actors);
 const changed=structuredClone(candidate);changed.actors[0].required=false;assert.throws(()=>withR53LifeCandidates(changed,f),/frozen71/);
 const conflict=structuredClone(integrated);conflict.actors[76].behavior.seed++;assert.throws(()=>withR53LifeCandidates(conflict,f),/Conflicting/);
 assert.throws(()=>withR53LifeCandidates({...candidate,actors:candidate.actors.slice(0,70)},f),/71 or 77/);
});
