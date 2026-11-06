import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const m = await import('../../src/i18n/PlaceTranslations.js').catch(()=>({}));
const base=JSON.parse(readFileSync(new URL('../../data/places/zh-CN.json',import.meta.url)));
const load = () => JSON.parse(readFileSync(new URL('../../data/places/en.json',import.meta.url)));
test('all164 original place translations and130 source labels are complete',()=>{
 assert.equal(typeof m.validatePlaceTranslations,'function','translation validator is implemented');
 const en=load();assert.equal(Object.keys(en.places).length,164);assert.equal(Object.keys(en.sources).length,130);
 assert.equal(m.validatePlaceTranslations(base,en),en);
});
test('localized display preserves every binding, source reference, relation, date and original name',()=>{
 assert.equal(typeof m.localizePlace,'function','display overlay is implemented');
 const en=load(),before=JSON.stringify(base);
 for(const p of base.places){
  const local=m.localizePlace(p,'en',en);
  assert.equal(local.name,p.name);assert.deepEqual(local.sceneBinding,p.sceneBinding);
  assert.equal(local.modelExperience.teleportTargetName,p.modelExperience.teleportTargetName);
  assert.equal(local.displayName,en.places[p.id].name);assert.notEqual(local.summary.text,p.summary.text);
  const check=(a,b)=>{if(Array.isArray(a)){a.forEach((v,i)=>check(v,b[i]));return;}if(a&&typeof a==='object')for(const[k,v]of Object.entries(a)){if(['sourceIds','id','kind','relation','status','checkedAt','reviewedAt','reopensAt','noticePublishedAt','effectiveFrom'].includes(k))assert.deepEqual(b[k],v);else if(typeof v==='object')check(v,b[k]);}};
  check(p,local);assert.equal(m.localizePlace(p,'zh-CN',en),p);
 }
 assert.equal(JSON.stringify(base),before);
});
test('empty, missing, Han, placeholder, shape drift and injected binding translations fail closed',()=>{
 assert.equal(typeof m.validatePlaceTranslations,'function');
 const en=load(),id=base.places[0].id;
 const mutate=[d=>delete d.places[id],d=>d.places[id].summary='',d=>d.places[id].summary='待翻译',d=>d.places[id].summary='TODO',d=>d.places[id].functions.pop(),d=>d.places[id].sceneBinding={name:'Changed'},d=>d.sources[base.sources[0].id].title='',d=>delete d.places[id].pinyin,d=>d.places[id].people.push({name:'New person',period:'Unknown',text:'Invented'})];
 for(const change of mutate){const d=structuredClone(en);change(d);assert.throws(()=>m.validatePlaceTranslations(base,d));}
});
test('both languages, canonical aliases and pinyin stay searchable, with no prose converted to aliases',()=>{
 assert.equal(typeof m.placeSearchTerms,'function');const en=load(),p=base.places.find(p=>p.id==='taihe'), terms=m.placeSearchTerms(p,en);
 assert.ok(terms.includes('太和殿'));assert.ok(terms.includes('奉天殿'));
 assert.ok(terms.some(x=>x.includes('taihe')));assert.ok(terms.includes(en.places.taihe.name.toLowerCase()));
 assert.ok(!terms.some(x=>x.includes('国家典礼')));
});
