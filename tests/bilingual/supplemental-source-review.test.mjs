import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {setupMap} from '../lib/map-fixture.mjs';
import {localeStore} from '../../src/i18n/LocaleStore.js';

const SOURCE_HASH='c825bad5d6f59c44086984a6f45014a8ca7530e7302a145f2b2677e9dc0bc9b5';
const LOCAL_SOURCES=[
 ['supp-fc-59f7bb24cb',['e49-named-annex-plan','e49-regional-plan','e49-circular-opening-photo']],
 ['supp-fc-f5d7ed5f35',['h39-official-courtyard','h39-own-photo']],
 ['supp-fc-634f1ba680',['h42-official-ears']],
 ['supp-fc-8a90e1618a',['h5-official-description','h5-own-plan','h5-hard-gable-topology']],
 ['supp-fc-8e4e75bf02',['f47-named-plan','f47-opposed-interiors']],
 ['supp-fc-9cb03d7316',['h17-official-description','h17-named-plan','h17-official-history']],
];
const localIds=new Set(LOCAL_SOURCES.map(([id])=>id));
const LOCAL_ZH='本地核对官方来源页面或图像：2026-11-08；不代表完整原文复核。';
const LOCAL_EN='Official source pages or images reviewed locally on 2026-11-08; not a full-document review.';
const INHERITED_ZH='继承官方来源记录；本轮未重新访问。';
const INHERITED_EN='Inherited official-source record; not revisited for this update.';
const UNKNOWN_ZH='来源核对日期未记录；不代表完整原文复核。';
const UNKNOWN_EN='The source-check date was not recorded; this does not indicate a full-document review.';
const isReused=source=>source.reviewType==='reused-official-source-attribution';

function sourceRow(panel,source,language) {
 const anchor=panel.querySelector(`#place-source-${source.id}`);
 assert.ok(anchor,source.id);
 assert.equal(anchor.parentNode.tagName,'LI',source.id);
 assert.equal(anchor.getAttribute('href'),source.url,source.id);
 assert.equal(anchor.getAttribute('target'),'_blank',source.id);
 assert.equal(anchor.getAttribute('rel'),'noopener noreferrer',source.id);
 const publisher=language==='en'?{'故宫博物院':'The Palace Museum','北京市文物局':'Beijing Municipal Cultural Heritage Bureau'}[source.publisher]:source.publisher;
 assert.ok(publisher,source.id);
 assert.equal(anchor.textContent,`${publisher} · ${language==='en'?source.titleEn:source.title}`,source.id);
 const notes=anchor.parentNode.querySelectorAll('p');
 assert.equal(notes.length,1,source.id+' has one source-check note');
 return notes[0].textContent;
}

// A field-choice regression, a fabricated date or a lost limitation must fail this real DOM test.
test('source notes preserve 33 recorded review dates across 22 bilingual cards without changing source facts',async t=>{
 const raw=fs.readFileSync('data/places/supplemental.json','utf8');
 assert.equal(createHash('sha256').update(raw).digest('hex'),SOURCE_HASH);
 const records=JSON.parse(raw).records;
 const checked=records.filter(row=>row.sources.some(source=>!isReused(source)));
 const dated=checked.flatMap(row=>row.sources.filter(source=>!isReused(source)).map(source=>({placeId:row.id,source})));
 assert.equal(checked.length,22);assert.equal(dated.length,33);
 assert.equal(records.flatMap(row=>row.sources).filter(isReused).length,295);
 const local=dated.filter(({source})=>source.reviewedAt===null);
 assert.deepEqual(local.map(({placeId,source})=>[placeId,source.id]),LOCAL_SOURCES.flatMap(([id,sources])=>sources.map(sourceId=>[id,sourceId])));
 for(const {source} of local)assert.equal(source.localPageReviewDate,'2026-11-08',source.id);
 const existing=dated.filter(({source})=>source.reviewedAt!==null);
 assert.equal(existing.length,19);
 assert.deepEqual(existing.reduce((counts,{source})=>({...counts,[source.reviewedAt]:(counts[source.reviewedAt]??0)+1}),{}),{'2026-11-06':12,'2026-11-08':1,'2026-11-09':6});
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));
 s.map.toggle();s.map.hasTeleportTarget=()=>true;
 const before=new Map(checked.map(row=>[row.id,structuredClone(s.map.placeCatalog.sourcesFor(s.map.placeCatalog.get(row.id)))]));
 let notesChecked=0;
 for(const language of ['zh-CN','en']){
  localeStore.setLocale(language);
  for(const row of checked){
   assert.equal(s.map.showPlace(row.id),true,row.id);
   const panel=s.map.placePanel.element;
   for(const source of row.sources.filter(source=>!isReused(source))){
    const note=sourceRow(panel,source,language);
    const expected=source.reviewedAt===null?(language==='en'?LOCAL_EN:LOCAL_ZH):language==='en'?`Official page or indexed excerpt checked for this update: ${source.reviewedAt}; not a full-document review.`:`本轮核对官方页面或索引摘要：${source.reviewedAt}；不代表完整原文复核。`;
    assert.equal(note,expected,row.id+'/'+source.id+'/'+language);
    assert.doesNotMatch(note,/undefined|null|\$\{/u,source.id);
    if(language==='en')assert.doesNotMatch(note,/[\u3400-\u9fff]|English text unavailable/u,source.id);
    notesChecked++;
   }
   for(const source of row.sources.filter(isReused))assert.equal(sourceRow(panel,source,language),language==='en'?INHERITED_EN:INHERITED_ZH,source.id);
   if(localIds.has(row.id))assert.equal(panel.querySelector('#place-travel'),null,row.id);
  }
 }
 assert.equal(notesChecked,66);assert.deepEqual(s.teleports,[]);
 for(const row of checked)assert.deepEqual(s.map.placeCatalog.sourcesFor(s.map.placeCatalog.get(row.id)),before.get(row.id),row.id+' source metadata unchanged');
 assert.equal(fs.readFileSync('data/places/supplemental.json','utf8'),raw);
});

// Independent literal expectations catch reversed precedence, missing-date claims and inherited-source promotion.
test('source note priority and unknown-date boundaries remain truthful in nine bilingual cases',async t=>{
 const raw=fs.readFileSync('data/places/supplemental.json','utf8');
 assert.equal(createHash('sha256').update(raw).digest('hex'),SOURCE_HASH);
 const row=JSON.parse(raw).records.find(place=>place.id==='supp-fc-59f7bb24cb');
 const cases=[
  {name:'both recorded dates keep reviewedAt',dates:{reviewedAt:'2026-11-06',localPageReviewDate:'2026-11-08'},zh:'本轮核对官方页面或索引摘要：2026-11-06；不代表完整原文复核。',en:'Official page or indexed excerpt checked for this update: 2026-11-06; not a full-document review.'},
  {name:'null reviewedAt uses local date',dates:{reviewedAt:null,localPageReviewDate:'2026-11-08'},zh:LOCAL_ZH,en:LOCAL_EN},
  {name:'absent reviewedAt uses local date',dates:{localPageReviewDate:'2026-11-08'},zh:LOCAL_ZH,en:LOCAL_EN},
  {name:'empty reviewedAt uses local date',dates:{reviewedAt:'',localPageReviewDate:'2026-11-08'},zh:LOCAL_ZH,en:LOCAL_EN},
  {name:'blank reviewedAt uses local date',dates:{reviewedAt:' \t ',localPageReviewDate:'2026-11-08'},zh:LOCAL_ZH,en:LOCAL_EN},
  {name:'both dates null stay unknown',dates:{reviewedAt:null,localPageReviewDate:null},zh:UNKNOWN_ZH,en:UNKNOWN_EN},
  {name:'both dates absent stay unknown',dates:{},zh:UNKNOWN_ZH,en:UNKNOWN_EN},
  {name:'empty and blank dates stay unknown',dates:{reviewedAt:'',localPageReviewDate:' \t '},zh:UNKNOWN_ZH,en:UNKNOWN_EN},
  {name:'inherited attribution wins over both dates',dates:{reviewedAt:'2026-11-06',localPageReviewDate:'2026-11-08',reviewType:'reused-official-source-attribution'},zh:INHERITED_ZH,en:INHERITED_EN},
 ];
 assert.equal(cases.length,9);
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));
 const place=s.map.placeCatalog.get(row.id);let checked=0;
 for(const fixture of cases){
  const source=structuredClone(row.sources[0]);delete source.reviewedAt;delete source.localPageReviewDate;Object.assign(source,fixture.dates);
  const before=structuredClone(source);
  for(const language of ['zh-CN','en']){
   localeStore.setLocale(language);
   s.map.placePanel.render({place,name:place.name,sources:[source],canTravel:false});
   const panel=s.map.placePanel.element,note=sourceRow(panel,source,language);
   assert.equal(note,fixture[language==='en'?'en':'zh'],fixture.name+'/'+language);
   assert.doesNotMatch(note,/undefined|null|\$\{/u,fixture.name);
   if(language==='en')assert.doesNotMatch(note,/[\u3400-\u9fff]|English text unavailable/u,fixture.name);
   assert.equal(panel.querySelector('#place-travel'),null,fixture.name);
   assert.deepEqual(source,before,fixture.name+' may not write a selected date back');checked++;
  }
 }
 assert.equal(checked,18);assert.deepEqual(s.teleports,[]);
 assert.equal(fs.readFileSync('data/places/supplemental.json','utf8'),raw);
});
