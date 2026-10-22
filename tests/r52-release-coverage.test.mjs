import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {CHARACTER_REGISTRY as registry} from '../data/characters/index.js';
import {validateCharacterRegistry} from '../src/scene/characters/CharacterSchema.js';
import {assertOriginal38} from './lib/r52-court-registry.mjs';
const baseline='fac791cf956d852e32cc9594ce537b22bca82308';
const frozen=JSON.parse(fs.readFileSync(new URL('./fixtures/r52-r51-character-baseline.json',import.meta.url)));
const fromGit=p=>{const f=frozen.files.find(f=>f.path===p);assert.ok(f);assert.equal(Buffer.byteLength(f.originalText),f.originalBytes);assert.equal(createHash('sha256').update(f.originalText).digest('hex'),f.originalSha256);return JSON.parse(f.originalText);};
const additions=registry.scope.releaseCoverage.R52.additionalRequiredActorIds;
test('R52 ships71 required logical identities, preserving canonical original38 and seven approved templates',()=>{
 assert.equal(registry.actors.length,71);assert.equal(registry.actors.filter(a=>a.required).length,71);assert.equal(registry.templates.length,7);assertOriginal38(registry);
 assert.equal(new Set(registry.actors.map(a=>a.behavior.seed)).size,71);assert.equal(additions.length,33);assert.equal(new Set(additions).size,33);
 assert.deepEqual(registry.scope.requiredActorIds,fromGit('data/characters/scope.json').requiredActorIds);assert.deepEqual(registry.scope.requiredScenes,fromGit('data/characters/scope.json').requiredScenes);
 assert.deepEqual(validateCharacterRegistry(registry).counts.scenes,{taihe:37,gates:12,lane:6,chuxiu:2,yikun:2,yongshou:2,changchun:2,chengqian:2,zhongcui:2,jingren:2,yonghe:2});
 assert.equal(registry.actors.filter(a=>a.schedule==='guard-duty').length,18);
});
test('every new required identity fails closed if removed or demoted, even when count is padded',()=>{
 for(const id of additions){const r=structuredClone(registry);r.actors.find(a=>a.id===id).required=false;assert.equal(validateCharacterRegistry(r).valid,false,id+' cannot be demoted');r.actors=r.actors.filter(a=>a.id!==id);r.actors.push({...structuredClone(r.actors[0]),id:'padding-does-not-replace-'+id});assert.equal(validateCharacterRegistry(r).valid,false,id+' cannot be padded away');}
 for(const mutate of [r=>delete r.scope.releaseCoverage,r=>r.scope.releaseCoverage.R52.additionalRequiredActorIds.pop(),r=>r.scope.releaseCoverage.R52.minimumRegistered=38]){const r=structuredClone(registry);mutate(r);assert.equal(validateCharacterRegistry(r).valid,false);}
});
test('only the old Taihe support semantic changes; Kit and all original actor records/anchors/routes stay unchanged',()=>{
 for(const key of ['anchors','paths'])for(const old of fromGit('data/characters/'+key+'.json'))assert.deepEqual(registry[key].find(a=>a.id===old.id),old);
 for(const old of fromGit('data/characters/surfaces.json'))if(old.id!=='taihe-hall-floor')assert.deepEqual(registry.surfaces.find(a=>a.id===old.id),old);
 const floor=registry.surfaces.find(s=>s.id==='taihe-hall-floor');assert.equal(floor.kind,'ground');assert.equal(floor.expectedHeightMeters,9.9675);assert.equal(floor.heightToleranceMeters,.03);assert.match(floor.verification,/rendered floor/);
 assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../src/scene/characters/CharacterKit.js',import.meta.url))).digest('hex'),'7696c28eaa608bcd726a724746a88a4770064d6b3da677445cad3dcc53a863ab');
 assert.deepEqual(registry.templates,fromGit('data/characters/templates.json'));
});
