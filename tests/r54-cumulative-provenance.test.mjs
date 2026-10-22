import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex');
const changed=['ChangchunEastAlcove','JiaotaiDisplaySetting','SquareHalls','WestDomesticHalls'].map(n=>'src/scene/palace/special/'+n+'.js').sort();
test('R54 freezes190 actual world sources, retaining186 old files and the exact R53 manifest',()=>{
 const m=JSON.parse(fs.readFileSync('data/characters/world-source-freeze.json'));assert.equal(m.schemaVersion,7);assert.equal(m.files.length,190);const bytes=fs.readFileSync(m.provenance.previousManifestPath),old=JSON.parse(bytes);assert.equal(hash(bytes),'1edb222d9bb8d2e36313a1f56235cf429784d590ccf7c5013017d168a50606d1');assert.equal(hash(bytes),m.provenance.previousManifestSha256);assert.equal(old.files.length,188);assert.equal(m.provenance.previousBaselineCommit,'55623124b2f5fbab83673ddfc03b3c2d5da0f074');assert.equal(m.provenance.previousRemoteCommit,'beaddf4dd207ef497a18987a307a1b799e303cb7');
 const previous=new Map(old.files.map(f=>[f.path,f.sha256]));const actual=[];for(const f of m.files){assert.equal(hash(fs.readFileSync(f.path)),f.sha256,f.path);if(f.sha256!==previous.get(f.path))actual.push(f.path);}assert.deepEqual(actual.sort(),changed);assert.equal(m.provenance.inheritedByteExactCount,186);assert.deepEqual(m.provenance.changedProductionPaths,changed);
 for(const name of ['SourceGuidedNameboardMounts','SideGateProfiles','ChuxiuHall','WuyingRepresentativeDetails','WuyingMoonTerrace','JiaotaiCentralInterior','JiaotaiLandmarks','YangxinWestWarmRooms','ShoukangEastWarmRoom']){const p='src/scene/palace/special/'+name+'.js';assert.equal(hash(fs.readFileSync(p)),previous.get(p),p+' is retained, including cumulative R49E and no Jingyun experiment');}
 const exception=m.provenance.retainedSourceRuntimeExceptions;assert.equal(exception.length,1);assert.equal(exception[0].source,'src/scene/palace/special/JiaotaiCentralInterior.js');assert.deepEqual(exception[0].meshCounts,{'jiaotai-red-rear-screen':1,'jiaotai-screen-side-frame':2});assert.equal(exception[0].preservesEntireRuntimeGeometry,false);
});
