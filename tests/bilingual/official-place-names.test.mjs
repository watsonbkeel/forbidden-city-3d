import {readXiangxuHistoricalSource} from '../r166-xiangxu-gate/source-boundary.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import expected from './official-name-expectations.json' with {type:'json'};
import {TourPlaceCatalog} from '../../src/ui/TourPlaceCatalog.js';import {localizedPlace,localizedPlaceName,bilingualSearchTerms} from '../../src/i18n/PlaceLocale.js';import {translateText} from '../../src/i18n/Messages.js';import {localeStore} from '../../src/i18n/LocaleStore.js';import {setupMap} from '../lib/map-fixture.mjs';
const catalog=new TourPlaceCatalog(),byId=new Map(expected.map(row=>[row.id,row]));
const names=await import('../../src/i18n/OfficialPlaceNames.js').catch(()=>({}));
const normalized=text=>text.normalize('NFKC').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
test('73 directly evidenced official displays and ten qualified project displays follow the independent ID-keyed expectations',()=>{
 assert.equal(expected.length,83);assert.equal(expected.filter(r=>r.status==='official-display').length,73);
 for(const row of expected){const p=catalog.get(row.id);assert.ok(p,row.id);assert.equal(localizedPlace(p,'en').displayName,row.displayName,row.id);assert.equal(localizedPlaceName(p.name,p.id,'en'),row.displayName,row.id);assert.equal(localizedPlaceName(p.name,p.id,'zh-CN'),p.displayName??p.name,row.id);assert.equal(localizedPlace(p,'en').name,p.name);assert.deepEqual(localizedPlace(p,'en').sceneBinding,p.sceneBinding);assert.equal(localizedPlace(p,'en').modelExperience.teleportTargetName,p.modelExperience.teleportTargetName);}
});
test('all original project names and all 97 official evidence variants remain searchable without promoting related labels to aliases',()=>{
 assert.equal(typeof names.englishNameInfo,'function');assert.equal(expected.reduce((n,r)=>n+r.sources.length,0),97);
 for(const row of expected){const p=catalog.get(row.id),terms=bilingualSearchTerms(p);for(const term of [row.projectName,...row.searchNames,...row.sources.map(s=>s.quote)])assert.ok(terms.includes(normalized(term)),row.id+': '+term);const info=names.englishNameInfo(row.id);assert.equal(info.status,row.status);assert.equal(info.evidence.length,row.sources.length);if(row.status!=='official-display'){assert.equal(info.officialDisplayName,null);assert.equal(info.sameObjectAliases.length,0);}}
});
test('203 unchecked cards and four facilities are not assigned an official name or a borrowed parent name',()=>{
 assert.equal(typeof names.englishNameInfo,'function');const untouched=catalog.allPlaces.filter(p=>!byId.has(p.id)&&p.id!=='supp-fc-4d8561ae5d');assert.equal(untouched.length,203);for(const p of untouched){const info=names.englishNameInfo(p.id);assert.equal(info.status,'project-unverified');assert.equal(info.evidence.length,0);assert.equal(info.officialDisplayName,null);}
 for(const id of ['FC-D156902D78','FC-B9097C61D8','FC-74F8C30390','FC-17AFD38428'])assert.equal(names.englishNameInfo(id).status,'project-unverified');
});
test('original 164 and supplemental 122 facts, sources, dates and binding data remain byte-identical to the previous feature freeze',()=>{
 for(const [file,hash]of [['zh-CN.json','2db32caa6c546e61ab7117c4559625ca2d1867fda2774561188834f4996e0bcf'],['en.json','5f85f7d0912ca01a6d38299379a97c25c1c86b37dea0fae419eaf5a8256121ff'],['supplemental.json','2bf1f9940598182c23abd26459346e6f18b5b8872118681f10192c824a8b99e4']])assert.equal(createHash('sha256').update(readXiangxuHistoricalSource(new URL('../../data/places/'+file,import.meta.url))).digest('hex'),hash,file);
 assert.equal(catalog.places.length,164);assert.equal(catalog.supplementalPlaces.filter(p=>p.id!=='supp-fc-4d8561ae5d').length,122);assert.equal(catalog.supplementalPlaces.filter(p=>p.id!=='supp-fc-4d8561ae5d'&&p.modelExperience.navigationMode==='information-only').length,94);
});
test('canonical names in normal interface compositions use official displays, not stale dictionary names',()=>{
 assert.equal(translateText('太和殿','en'),'Hall of Supreme Harmony');assert.equal(translateText('已选择太和殿','en'),'Selected Hall of Supreme Harmony');assert.equal(translateText('中和殿','en'),'Hall of Central Harmony');assert.equal(translateText('武英殿','en'),'Hall of Martial Valour');assert.equal(translateText('景仁宫','en'),'Palace of Great Benevolence');
});
test('both language panels expose separate name provenance and every exact official source, while all descriptions remain project translations',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();
 for(const locale of ['zh-CN','en']){localeStore.setLocale(locale);for(const p of catalog.allPlaces){s.map.showPlace(p.id);const section=s.map.placePanel.element.querySelector('#place-name-provenance');assert.ok(section,p.id);const row=byId.get(p.id);assert.equal(section.getAttribute('data-name-status'),row?.status??'project-unverified');assert.match(section.textContent,locale==='en'?/descriptions remain project translations/:/英文介绍仍为项目译文/);if(locale==='en')assert.doesNotMatch(section.textContent,/[\u3400-\u9fff]|unavailable/u);for(const source of row?.sources??[]){assert.ok(section.textContent.includes(source.quote));const a=section.querySelector('#place-name-source-'+p.id+'-'+source.id);assert.equal(a?.getAttribute('href'),source.url);assert.equal(a.getAttribute('target'),'_blank');assert.equal(a.getAttribute('rel'),'noopener noreferrer');}if(!row)assert.match(section.textContent,locale==='en'?/does not mean no official name exists/:/不表示不存在官方英文名/);}}
});
test('related names visibly retain main-hall, site, spelling and abbreviated-wording limits in both languages',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();
 for(const [id,zh,en]of [['place-west-six-62bf56b1f3','仅指主殿','main hall only'],['place-ningshou-b607aa467b','仅指主殿','main hall only'],['place-ningshou-e66dfe768f','仅指主殿','main hall only'],['place-ningshou-e32471b7c3','仅指主殿','main hall only'],['place-ningshou-d653a5843e','仅指主殿','main hall only'],['place-east-six-1400b5fc62','水晶宫遗址','Crystal Palace site'],['place-east-six-921cb4ce37','Benvolence','Benvolence'],['place-ningshou-f4d12b27e6','未写建筑类型','omits a building type']]){for(const locale of ['zh-CN','en']){localeStore.setLocale(locale);s.map.showPlace(id);const section=s.map.placePanel.element.querySelector('#place-name-provenance');assert.ok(section?.textContent.includes(locale==='en'?en:zh),id);assert.equal(s.map.placePanel.element.querySelector('#place-title').textContent,locale==='en'?byId.get(id).projectName:catalog.get(id).name);}}
});
test('native directory selection uses stable IDs, all reviewed variants filter correctly, and travel retains the Chinese key',async t=>{
 localeStore.setLocale('en');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();const input=s.map.container.querySelector('#place-search');
 for(const row of expected){const button=s.map.container.querySelector('button[data-place-id="'+row.id+'"]');assert.ok(button,row.id);assert.equal(button.textContent,row.displayName);for(const term of [row.projectName,...row.searchNames]){input.value=term;s.dispatch(input,'input');assert.equal(button.hidden,false,row.id+': '+term);}}
 input.value='';s.dispatch(input,'input');s.map.hasTeleportTarget=()=>true;s.map.showPlace('taihe');s.map.placePanel.element.querySelector('#place-travel').click();assert.equal(s.teleports.at(-1),'太和殿');
});
test('name-source focus is not confused with an existing history link to the same URL',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();const id='supp-fc-dd68a90cc7';s.map.showPlace(id);const panel=s.map.placePanel.element;const anchor=panel.querySelector('#place-name-source-'+id+'-directory-04');assert.ok(anchor,'name-source anchor');const href=anchor.getAttribute('href');assert.ok(panel.querySelectorAll('a').filter(a=>a.getAttribute('href')===href).length>=2,'same URL in name and history sections');anchor.focus();panel.scrollTop=123;
 for(const locale of ['en','zh-CN']){localeStore.setLocale(locale);assert.equal(s.document.activeElement.id,anchor.id);assert.equal(s.document.activeElement.getAttribute('href'),href);assert.ok(panel.contains(s.document.activeElement));assert.equal(panel.scrollTop,123);}
});
test('long official map labels wrap complete words and retain identity and complete visible wording',async t=>{
 localeStore.setLocale('en');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.labelQueue=null;s.map.labels=[];s.map.labelPaintRecords=[];s.map.drawLabel('大佛堂',100,100,true,12,'大佛堂',undefined,'place-outer-west-6cae88b6a2');const label=s.map.labelPaintRecords.at(-1);assert.equal(label.text.replaceAll('\n',' '),'Back hall of Palace of Compassion and Tranquility');assert.ok(label.text.includes('\n'));assert.ok(label.text.split('\n').every(line=>line.length<=24));assert.equal(label.name,'大佛堂');assert.equal(label.placeId,'place-outer-west-6cae88b6a2');
});

test('name registry refuses wrong IDs, unproved display forms, scope promotions and invalid source URLs',()=>{
 assert.equal(typeof names.validateOfficialNames,'function');const data=JSON.parse(fs.readFileSync(new URL('../../data/places/official-names.json',import.meta.url)));assert.equal(names.validateOfficialNames(data).entries.length,83);
 for(const mutate of [d=>d.entries[0].id='not-a-card',d=>d.entries.push(structuredClone(d.entries[0])),d=>d.entries[0].officialDisplayName='Invented name',d=>d.entries.find(r=>r.status==='related-search-only').officialDisplayName='Whole Palace',d=>d.entries[0].evidence[0].url='https://example.com/name',d=>d.entries[0].projectName='Wrong key',d=>d.entries[0].evidence[0].scope.zh='']){const d=structuredClone(data);mutate(d);assert.throws(()=>names.validateOfficialNames(d));}
});

test('a visible naming source retains viewport position after translation, with an identical-URL historical source present',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));const create=s.document.createElement;
 s.document.createElement=tag=>{const el=create(tag);if(tag==='a'){const offset=localeStore.locale==='en'?450:250;el.getBoundingClientRect=()=>({top:100+offset-s.map.placePanel.element.scrollTop,bottom:120+offset-s.map.placePanel.element.scrollTop});}return el;};
 s.map.toggle();s.map.showPlace('supp-fc-dd68a90cc7');const panel=s.map.placePanel.element;panel.getBoundingClientRect=()=>({top:100,bottom:300});panel.scrollTop=83;const id='place-name-source-supp-fc-dd68a90cc7-directory-04';panel.querySelector('#'+id).focus();const originalTop=s.document.activeElement.getBoundingClientRect().top;
 for(const [locale,scroll]of [['en',283],['zh-CN',83]]){localeStore.setLocale(locale);assert.equal(s.document.activeElement.id,id);assert.equal(s.document.activeElement.getBoundingClientRect().top,originalTop);assert.equal(panel.scrollTop,scroll);}
});
