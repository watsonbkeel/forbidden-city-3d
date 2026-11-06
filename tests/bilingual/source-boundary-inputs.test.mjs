import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';
import manifest from './source-delta.json' with {type:'json'};import adapters from './source-guard-adapters.json' with {type:'json'};import proof from './read-compatible-disjoint.json' with {type:'json'};
import {verifyRuntimeBoundary,stripBilingualDelta} from './source-boundary.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex'),base='e1287435158ee5aa98e0a1a370cae97021a5c385',git=p=>execFileSync('git',['show',base+':'+p],{maxBuffer:64*1024*1024});
test('every current build input is exact e128 plus only five reviewed modifications and seventeen explicit additions',()=>{
 assert.equal(manifest.baseCommit,base);assert.deepEqual(verifyRuntimeBoundary(),{files:993,changed:22,added:17});assert.deepEqual(manifest.files.filter(r=>r.before!==null&&r.before!==r.after).map(r=>r.path),['main.js','src/ui/Minimap.js','src/ui/PlaceInfoPanel.js','src/ui/SettingsMenu.js','style.css']);
});
test('24 source-only adapters recover original assertions and expected arrays byte for byte',()=>{
 assert.equal(adapters.length,24);assert.equal(adapters.flatMap(r=>r.edits).filter(e=>e.kind==='source-comparison-read').length,27);assert.equal(adapters.flatMap(r=>r.edits).filter(e=>e.kind==='source-comparison-enumeration').length,12);
 for(const row of adapters){let text=fs.readFileSync(row.path,'utf8');assert.equal(sha(text),row.afterSha256,row.path);assert.ok(text.startsWith(row.prefix));text=text.slice(row.prefix.length);for(const edit of [...row.edits].sort((a,b)=>a.start-b.start)){assert.equal(text.slice(edit.start,edit.start+edit.after.length),edit.after);text=text.slice(0,edit.start)+edit.before+text.slice(edit.start+edit.after.length);}assert.equal(sha(text),row.beforeSha256);assert.equal(text,git(row.path).toString(),row.path+' original assertions unchanged');}
});
test('readCompatibleSource wrappers commute only for a mechanically disjoint changed-path set and immutable helper closure',()=>{
 assert.equal(proof.entries.length,6);assert.equal(proof.modules.length,8);const paths=new Set();for(const row of proof.modules){const module=fs.readFileSync(row.path),registry=fs.readFileSync(row.registry);assert.equal(sha(module),row.sha256);assert.equal(sha(registry),row.registrySha256);assert.deepEqual(module,git(row.path));assert.deepEqual(registry,git(row.registry));row.processedPaths.forEach(p=>paths.add(p));}
 const changed=manifest.files.filter(r=>r.before!==null&&r.before!==r.after).map(r=>r.path);assert.deepEqual(changed,proof.modifiedPaths);assert.deepEqual([...paths].sort(),proof.processedPaths);assert.deepEqual(changed.filter(p=>paths.has(p)),[]);
});
test('candidate imports and physical UI bytes remain new while only explicit comparison bytes are inverted',async()=>{
 const read=fs.readFileSync,path='src/ui/Minimap.js',now=read(path);assert.match(now.toString(),/new TourPlaceCatalog\(/);assert.doesNotMatch(stripBilingualDelta(path,now).toString(),/new TourPlaceCatalog\(/);assert.deepEqual(read(path),now);assert.equal(fs.readFileSync,read);const {TourPlaceCatalog}=await import('../../src/ui/TourPlaceCatalog.js');assert.equal(new TourPlaceCatalog().allPlaces.length,286);
});
