import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p)),hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const fixed=read('tests/fixtures/r55-cumulative-sources.json'),current=read('data/characters/world-source-freeze.json'),prior=read('data/characters/world-source-freeze-r54.json');
test('R55 source freeze explicitly preserves the exact R54 manifest and 189 of its190 world inputs',()=>{
 assert.equal(current.schemaVersion,8);assert.equal(hash('data/characters/world-source-freeze-r54.json'),fixed.r54WorldManifestSHA256);
 assert.equal(current.provenance.previousManifestSha256,fixed.r54WorldManifestSHA256);assert.equal(current.provenance.previousBaselineCommit,fixed.baseline);
 assert.equal(current.provenance.previousRemoteCommit,'a370cf34381c0e3a513165fe25070df625272d05');assert.equal(prior.files.length,190);assert.equal(current.files.length,195);
 const map=new Map(current.files.map(f=>[f.path,f.sha256]));assert.equal(map.size,195);
 const changed=prior.files.filter(f=>map.get(f.path)!==f.sha256).map(f=>f.path);assert.deepEqual(changed,['src/scene/palace/special/SquareHalls.js']);assert.equal(current.provenance.inheritedByteExactCount,189);
 assert.deepEqual(current.provenance.retainedSourceRuntimeExceptions,prior.provenance.retainedSourceRuntimeExceptions,'Do not erase the R54 three-screen lower-edge exception');
 for(const f of current.files)assert.equal(hash(f.path),f.sha256,f.path);
});
test('R55 does not change main, controls, global collision, Loader, character machinery or confirmed Kit',()=>{
 for(const [path,expected]of Object.entries(fixed.retainedRuntimeSources))assert.equal(hash(path),expected,path);
});
test('the actual optional Kunning model, retained rollback model and generator are covered by the new world manifest',()=>{
 const config=read('data/interiors/kunning.json'),paths=new Set(current.files.map(f=>f.path));
 for(const path of ['data/interiors/kunning.json','assets-src/interiors/kunning.py','public'+config.model,'public/models/interiors/kunning-v6-0c83b4364eef.glb'])assert.ok(paths.has(path),path);
 assert.equal(config.model,'/models/interiors/kunning-v6-5adbf53a3114.glb');assert.equal(hash('public'+config.model),'5adbf53a311452221a3184198875958eb55436bd261253a75486516bfdc87553');
 assert.deepEqual(current.provenance.changedProductionPaths,[ 'assets-src/interiors/kunning.py','data/interiors/kunning.json','public/models/interiors/kunning-v6-5adbf53a3114.glb','src/scene/palace/special/SquareHalls.js','src/scene/palace/special/ZhongheDisplaySetting.js']);
});
