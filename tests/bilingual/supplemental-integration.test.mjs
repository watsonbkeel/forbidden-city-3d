import fs from 'node:fs';import {createHash} from 'node:crypto';
// Count only the frozen 122-card cohort; all appended cards remain in the live catalog.
const appendedSupplementalIdentities=[
 ['supp-fc-4d8561ae5d','FC-4D8561AE5D'], // 祥旭门
 ['supp-fc-59f7bb24cb','FC-59F7BB24CB'], // 味余书室
 ['supp-fc-f5d7ed5f35','FC-F5D7ED5F35'], // 英华殿山门
 ['supp-fc-634f1ba680','FC-634F1BA680'], // 英华殿东耳殿
 ['supp-fc-8a90e1618a','FC-8A90E1618A'], // 翠云馆
 ['supp-fc-8e4e75bf02','FC-8E4E75BF02'], // 随安室
 ['supp-fc-e8cc6a03c1','FC-E8CC6A03C1'], // 前星门
 ['supp-fc-4110bd4cbe','FC-4110BD4CBE'], // 南书房
 ['supp-fc-4a84b24027','FC-4A84B24027'], // 内阁满本堂
 ['supp-fc-15e0b02776','FC-15E0B02776'], // 内阁祝版房
 ['supp-fc-9cb03d7316','FC-9CB03D7316'], // 慧曜楼
 ['supp-fc-6555093daa','FC-6555093DAA'], // 内阁满票签档子房
 ['supp-fc-da0f70a4c4','FC-DA0F70A4C4'], // 内阁典籍厅
];
const appendedSupplementalIds=new Set(appendedSupplementalIdentities.map(([id])=>id));
const isHistoricalPlaceId=id=>!appendedSupplementalIds.has(id);
const supplementalAppendBoundary=',\n    {\n      "id": "supp-fc-4d8561ae5d",';
function verifySupplementalCohort(raw,livePlaces){
 const source=JSON.parse(raw),records=source.records;
 assert.equal(new Set(records.map(p=>p.id)).size,records.length,'unique source IDs');
 assert.deepEqual(records.slice(122).map(p=>p.id),[...appendedSupplementalIds],'exact appended IDs');
 assert.deepEqual([source.originalCardCount,source.supplementalMapCardCount,source.supplementalDirectoryCardCount,source.candidateCardDenominator],[164,28,107,299],'current source counts');
 assert.equal(raw.split(supplementalAppendBoundary).length,2,'unique historical byte boundary');
 const historical=(raw.slice(0,raw.indexOf(supplementalAppendBoundary))+'\n  ]\n}\n')
  .replace('"supplementalDirectoryCardCount": 107','"supplementalDirectoryCardCount": 94')
  .replace('"candidateCardDenominator": 299','"candidateCardDenominator": 286');
 assert.equal(createHash('sha256').update(historical).digest('hex'),'2bf1f9940598182c23abd26459346e6f18b5b8872118681f10192c824a8b99e4','frozen historical bytes');
 for(const [index,[id,sourceObjectId]]of appendedSupplementalIdentities.entries()){
  const row=records[122+index];
  assert.equal(row.sourceObjectId,sourceObjectId,'appended source identity: '+id);
  assert.equal(row.classification,'supplemental-directory-only','appended directory classification: '+id);
  assert.equal(row.mapBinding,null,'appended map binding: '+id);
  assert.equal(row.travel,'none','appended travel: '+id);
 }
 assert.deepEqual(livePlaces.map(p=>p.supplementalText),records,'independent raw and live supplemental records');
 assert.deepEqual(livePlaces.map(p=>p.id),records.map(p=>p.id),'live supplemental IDs');
 for(const [index,[id,sourceObjectId]]of appendedSupplementalIdentities.entries()){
  const place=livePlaces[122+index];
  assert.equal(place.sourceObjectId,sourceObjectId,'live source identity: '+id);
  assert.equal(place.modelExperience.navigationMode,'information-only','live appended navigation: '+id);
  assert.equal(place.modelExperience.teleportTargetName,null,'live appended target: '+id);
 }
 return livePlaces.filter(p=>isHistoricalPlaceId(p.id));
}
import test from 'node:test';import assert from 'node:assert/strict';
import {setupMap} from '../lib/map-fixture.mjs';import {localeStore} from '../../src/i18n/LocaleStore.js';
const module=await import('../../src/ui/TourPlaceCatalog.js').catch(()=>({}));
test('combined text catalog retains original164 contract and declares each supplemental identity separately',()=>{
 assert.equal(typeof module.TourPlaceCatalog,'function');const c=new module.TourPlaceCatalog();assert.equal(c.places.length,164);assert.equal(c.supplementalPlaces.filter(p=>isHistoricalPlaceId(p.id)).length,122);assert.equal(c.allPlaces.filter(p=>isHistoricalPlaceId(p.id)).length,286);assert.equal(new Set(c.allPlaces.filter(p=>isHistoricalPlaceId(p.id)).map(p=>p.id)).size,286);
 assert.equal(c.supplementalPlaces.filter(p=>isHistoricalPlaceId(p.id)&&p.modelExperience.navigationMode==='information-only').length,94);
});
test('all supplemental cards render both local languages, source titles and limitations without unavailable copy',async t=>{
 assert.equal(typeof module.TourPlaceCatalog,'function');localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();s.map.hasTeleportTarget=()=>true;
 for(const language of ['zh-CN','en']){localeStore.setLocale(language);for(const p of s.map.placeCatalog.supplementalPlaces){assert.equal(s.map.showPlace(p.id),true);const text=s.map.placePanel.element.textContent;assert.ok(text.length>120,p.id);if(language==='en')assert.doesNotMatch(text,/[\u3400-\u9fff]|English text unavailable\.|undefined|null/u,p.id);if(p.modelExperience.navigationMode==='information-only')assert.equal(s.map.placePanel.element.querySelector('#place-travel'),null,p.id);}}
});
test('supplemental search supports Chinese, English and spaced/compact pinyin; unknown map projection does not gain travel',async t=>{
 assert.equal(typeof module.TourPlaceCatalog,'function');localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();s.map.hasTeleportTarget=()=>true;
 const row=s.map.placeCatalog.supplementalPlaces.find(p=>p.name==='内阁大堂'),input=s.map.container.querySelector('#place-search');
 for(const term of ['内阁大堂','Neige Main Hall','neige datang','neigedatang']){input.value=term;s.dispatch(input,'input');const found=s.map.supplementalPlaceList.querySelectorAll('button').filter(b=>!b.hidden);assert.ok(found.some(b=>b.textContent==='内阁大堂'),term);}
 s.map.showPlace(row.id);assert.equal(s.map.placePanel.element.querySelector('#place-travel'),null,'no actual exact map projection, no supplemental travel');
 assert.equal(s.map.supplementalPlaceList.querySelectorAll('button').filter(b=>isHistoricalPlaceId(b.getAttribute('data-place-id'))).length,122);assert.deepEqual(s.teleports,[]);
});
test('cross-section search clears cleanly and same displayed Neige store names keep distinct selection and target keys',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();
 const input=s.map.container.querySelector('#place-search'),all=[...s.map.placeList.querySelectorAll('button'),...s.map.supplementalPlaceList.querySelectorAll('button')];
 for(const term of ['zz-no-such-place','']){input.value=term;s.dispatch(input,'input');assert.equal(all.filter(b=>!b.hidden&&isHistoricalPlaceId(b.getAttribute('data-place-id'))).length,term?0:286);}
 const stores=s.map.placeCatalog.supplementalPlaces.filter(p=>['内阁大库','内阁大库第二体'].includes(p.name));assert.equal(stores.length,2);
 s.map.items=stores.map(p=>({...p.supplementalText.mapBinding}));s.map.hasTeleportTarget=()=>true;
 for(const p of stores){s.map.showPlace(p.id);assert.equal(s.map.selectedPlaceId,p.id);assert.equal(s.map.placePanel.element.querySelector('#place-title').textContent,'内阁大库');assert.equal(s.map.placeCatalog.forMapItem(p.supplementalText.mapBinding,s.map.items).id,p.id);const button=s.map.placePanel.element.querySelector('#place-travel');assert.ok(button);button.click();assert.equal(s.teleports.at(-1),p.name);s.map.toggle();}
});

test('historical count cohort rejects missing, duplicate, unknown, navigable or drifted additions without changing live records',()=>{
 const raw=fs.readFileSync(new URL('../../data/places/supplemental.json',import.meta.url),'utf8'),c=new module.TourPlaceCatalog();
 const live=c.supplementalPlaces,references=[...live],rowReferences=live.map(p=>p.supplementalText),snapshot=JSON.stringify(live);
 const historical=verifySupplementalCohort(raw,live);
 assert.equal(live.length,135);assert.equal(historical.length,122);
 historical.forEach((p,index)=>assert.equal(p,live[index],'historical view retains live object references'));
 const prefix=raw.slice(0,raw.indexOf(supplementalAppendBoundary));
 const withAppended=records=>prefix+',\n'+JSON.stringify(records,null,2).slice(2,-2).split('\n').map(line=>'  '+line).join('\n')+'\n  ]\n}\n';
 for(const [name,mutate,error]of [
  ['missing',rows=>rows.pop(),/exact appended IDs/],
  ['duplicate',rows=>rows.at(-1).id=rows.at(-2).id,/unique source IDs/],
  ['changed ID',rows=>rows.at(-1).id='supp-fc-changed',/exact appended IDs/],
  ['unknown addition',rows=>rows.push({...rows.at(-1),id:'supp-fc-unknown'}),/exact appended IDs/],
  ['changed source identity',rows=>rows.at(-1).sourceObjectId='FC-UNKNOWN',/appended source identity/],
  ['classification promotion',rows=>rows.at(-1).classification='supplemental-map-attraction',/appended directory classification/],
  ['new map binding',rows=>rows.at(-1).mapBinding={kind:'hall',name:'慧曜楼',x:0,z:0,w:1,d:1},/appended map binding/],
  ['new travel',rows=>rows.at(-1).travel='existing-target-only',/appended travel/],
 ]){
  const rows=JSON.parse(raw).records.slice(122);mutate(rows);
  assert.throws(()=>verifySupplementalCohort(withAppended(rows),live),error,name);
 }
 const drifted=raw.replace('"name": "内阁大堂"','"name": "内阁大堂（漂移）"');
 assert.notEqual(drifted,raw);assert.throws(()=>verifySupplementalCohort(drifted,live),/frozen historical bytes/,'historical content drift');
 assert.equal(c.supplementalPlaces,live);assert.equal(JSON.stringify(live),snapshot,'guard never mutates the live catalog');
 live.forEach((p,index)=>{assert.equal(p,references[index]);assert.equal(p.supplementalText,rowReferences[index]);assert.equal(c.get(p.id),p);});
});
