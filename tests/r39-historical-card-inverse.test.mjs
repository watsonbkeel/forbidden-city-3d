import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {restoreR6PlaceCatalog} from './lib/r6-place-retention.mjs';
import {FENGXIAN_CARD_ID,FENGXIAN_R39_DISCLAIMER} from './lib/r39-place-retention.mjs';
const raw=readFileSync(new URL('../data/places/zh-CN.json',import.meta.url),'utf8');
const encode=d=>JSON.stringify(d,null,2)+'\n';
test('R39 historical adapter reverses only the reviewed Fengxian wording while current card retains purpose disclosure',()=>{
 const current=JSON.parse(raw),f=current.places.find(p=>p.id===FENGXIAN_CARD_ID);assert.equal(f.modelExperience.disclaimer,FENGXIAN_R39_DISCLAIMER);
 const restored=JSON.parse(restoreR6PlaceCatalog(raw));assert.equal(restored.places.length,14);assert.equal(JSON.parse(raw).places.find(p=>p.id===FENGXIAN_CARD_ID).modelExperience.disclaimer,FENGXIAN_R39_DISCLAIMER);
});
for(const [label,mutate]of [
 ['unreviewed disclaimer',d=>d.places.find(p=>p.id===FENGXIAN_CARD_ID).modelExperience.disclaimer+=' invented'],
 ['changed identity',d=>d.places.find(p=>p.id===FENGXIAN_CARD_ID).name='changed'],
 ['changed Fengxian navigation',d=>d.places.find(p=>p.id===FENGXIAN_CARD_ID).modelExperience.teleportTargetName='changed'],
 ['changed unrelated card',d=>d.places.find(p=>p.id!==FENGXIAN_CARD_ID).name='changed'],
 ['changed metadata',d=>d.extra='changed'],
])test(`R39 historical adapter rejects ${label}`,()=>{const d=JSON.parse(raw);mutate(d);assert.throws(()=>restoreR6PlaceCatalog(encode(d)));});
