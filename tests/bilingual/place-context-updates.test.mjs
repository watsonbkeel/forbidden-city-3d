import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const module=await import('../../src/i18n/PlaceContextUpdates.js').catch(()=>({}));
const zh=JSON.parse(readFileSync(new URL('../../data/places/zh-CN.json',import.meta.url))),en=JSON.parse(readFileSync(new URL('../../data/places/en.json',import.meta.url)));
const ids=['place-outer-east-3f2ebd1b02','place-outer-east-4642f5088e'];
test('only the two precise stale model-label sentences are corrected in both languages',async()=>{
 assert.equal(typeof module.applyPlaceContextUpdate,'function');const {localizedPlace}=await import('../../src/i18n/PlaceLocale.js');
 for(const id of ids){const place=zh.places.find(p=>p.id===id),before=structuredClone(place);const a=localizedPlace(place,'zh-CN'),b=localizedPlace(place,'en');assert.doesNotMatch(a.evidenceNote.text,/模型仅标前后殿/);assert.match(a.evidenceNote.text,/实测.*对应尚待核定/);assert.doesNotMatch(b.evidenceNote.text,/labels only front and rear/);assert.match(b.evidenceNote.text,/remains to be checked/);assert.deepEqual(place,before);assert.equal(a.evidenceStatus,'partial-identity');assert.deepEqual(a.evidenceNote.sourceIds,before.evidenceNote.sourceIds);}
});
test('unmatched cards are unchanged and matched source-text drift is rejected',()=>{
 assert.equal(typeof module.applyPlaceContextUpdate,'function');const normal=zh.places.find(p=>!ids.includes(p.id));assert.equal(module.applyPlaceContextUpdate(normal,'zh-CN'),normal);
 for(const id of ids){const bad=structuredClone(zh.places.find(p=>p.id===id));bad.evidenceNote.text+='漂移';assert.throws(()=>module.applyPlaceContextUpdate(bad,'zh-CN'),/source text drift/);}
});
test('errata keep exact original text hashes and existing narrow source declarations',async()=>{
 const {createHash}=await import('node:crypto');const data=JSON.parse(readFileSync(new URL('../../data/places/context-updates.json',import.meta.url)));
 assert.deepEqual(data.updates.map(r=>r.id),ids);
 for(const row of data.updates){for(const locale of ['zh-CN','en'])assert.equal(createHash('sha256').update(row.before[locale]).digest('hex'),row.beforeSha256[locale]);for(const path of row.sourcePaths)assert.match(readFileSync(new URL(`../../${path}`,import.meta.url),'utf8'),/南三所/);const translated={id:row.id,evidenceNote:{text:row.before.en+' drift'}};assert.throws(()=>module.applyPlaceContextUpdate(translated,'en'),/source text drift/);}
});
