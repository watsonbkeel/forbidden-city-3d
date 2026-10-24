import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {inventory,verify} from '../scripts/r72-source-inventory.mjs';
const expected=JSON.parse(fs.readFileSync('reports/r72-nightlife-safety/source-inventory.json'));
test('R72 exact complete runtime inventory matches frozen generation',()=>assert.equal(verify(inventory(process.cwd()),expected.files),true));
test('R72 exact guard rejects mutation, deletion and unlisted additions without normalizing',()=>{
 for(const p of ['src/scene/palace/QianqingCentralSetting.js','src/scene/palace/special/TaiheCore.js','src/scene/characters/DailyRoutine.js']){const a=structuredClone(expected.files);a.find(x=>x.path===p).sha256='mutated';assert.throws(()=>verify(a,expected.files));}
 assert.throws(()=>verify(expected.files.slice(1),expected.files));assert.throws(()=>verify([...expected.files,{path:'src/unlisted.js',sha256:'new'}],expected.files));
});
