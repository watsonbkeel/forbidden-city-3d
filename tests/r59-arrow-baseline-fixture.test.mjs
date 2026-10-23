import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CourtKit} from '../src/scene/palace/kit.js';
import {library} from './lib/inner-palace-fixture.mjs';
import {arrowBaselineSource,arrowLegacyProduction} from './lib/r59-arrow-baseline.mjs';
import {arrowKneeSnapshot} from './lib/r59-arrow-knees-qa.mjs';
test('exact SHA-checked repository baseline reproduces the frozen old 310 meshes without a historical Git object',async()=>{
 const location=new URL('../src/scene/palace/special/EnclosedPavilions.js',import.meta.url),source=arrowBaselineSource().replace(/from\s+(['"])([^'"]+)\1/g,(_,q,id)=>`from ${q}${id==='three'?import.meta.resolve('three'):new URL(id,location).href}${q}`);
 const {buildEnclosedPavilion}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const item=JSON.parse(fs.readFileSync(new URL('../data/zones/outer-east.json',import.meta.url))).items.find(i=>i.name==='箭亭'),kit=new CourtKit(library());
 try{const {f:frame}=buildEnclosedPavilion(kit,item),frozen=JSON.parse(fs.readFileSync(new URL('./fixtures/r59-arrow-knees-baseline.json',import.meta.url)));assert.deepEqual(arrowKneeSnapshot({kit,frame}),frozen.snapshot);}finally{kit.dispose(kit.root);}
});
test('frozen production inventory is SHA-checked, complete, and uniquely names the 430 old files',()=>{
 const manifest=arrowLegacyProduction();assert.equal(manifest.baseline,'2b983ae82e50e23fd55bbe0845942a0a3855f8dd');assert.equal(manifest.files.length,430);assert.equal(new Set(manifest.files.map(f=>f.path)).size,430);assert.ok(manifest.files.every(f=>/^[a-f0-9]{40}$/.test(f.blob)&&/^[a-f0-9]{64}$/.test(f.sha256)));
});
