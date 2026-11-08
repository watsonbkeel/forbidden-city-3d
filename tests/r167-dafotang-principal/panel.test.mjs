import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import oracle from './evidence-oracle.json' with {type:'json'};
import {setupMap} from '../lib/map-fixture.mjs';import {localeStore} from '../../src/i18n/LocaleStore.js';import {TourPlaceCatalog} from '../../src/ui/TourPlaceCatalog.js';import {assertCompleteSourceLinks} from '../bilingual/name-source-assertions.mjs';
const sectionId='place-historical-principal';
for(const locale of ['zh-CN','en'])test('historical-only principal disclosure and exact two publication links are visible in '+locale,async t=>{
 localeStore.setLocale(locale);const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();s.map.showPlace(oracle.placeId);const panel=s.map.placePanel.element,section=panel.querySelector('#'+sectionId);assert.ok(section);
 for(const expected of Object.values(oracle.text[locale]))assert.ok(section.textContent.includes(expected),expected);
 if(locale==='en')assert.doesNotMatch(section.textContent,/[\u3400-\u9fff]|unavailable/);
 const links=section.querySelectorAll('a');assert.equal(links.length,2);for(const source of oracle.sources){const a=links.find(a=>a.id==='place-reconstruction-source-'+oracle.placeId+'-'+source.id);assert.ok(a);assert.equal(a.getAttribute('href'),source.url);assert.equal(a.getAttribute('target'),'_blank');assert.equal(a.getAttribute('rel'),'noopener noreferrer');}
 assertCompleteSourceLinks(panel.querySelectorAll('a'),oracle.placeId,s.map.placeCatalog.sourcesFor(s.map.placeCatalog.get(oracle.placeId)));
});
test('principal section is keyed only to the unchanged Dafotang card; catalog and travel identity do not expand',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);s.map.toggle();const catalog=new TourPlaceCatalog();assert.equal(catalog.allPlaces.length,287);for(const id of ['taihe','place-outer-west-6cae88b6a2']){s.map.showPlace(id);assert.equal(!!s.map.placePanel.element.querySelector('#'+sectionId),id===oracle.placeId);}
 const p=catalog.get(oracle.placeId);assert.equal(p.name,'大佛堂');assert.equal(p.modelExperience.teleportTargetName,'大佛堂');assert.equal(catalog.places.length,164);
});
test('new source focus survives both language changes without confusing identical-URL historical/name links',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();s.map.showPlace(oracle.placeId);const panel=s.map.placePanel.element,id='place-reconstruction-source-'+oracle.placeId+'-'+oracle.sources[0].id;const source=panel.querySelector('#'+id);assert.ok(source);source.focus();panel.scrollTop=123;const generation=s.map.selectionGeneration;
 for(const locale of ['en','zh-CN']){localeStore.setLocale(locale);assert.equal(s.document.activeElement.id,id);assert.equal(s.document.activeElement.getAttribute('href'),oracle.sources[0].url);assert.ok(panel.contains(s.document.activeElement));assert.equal(panel.scrollTop,123);assert.equal(s.map.selectedPlaceId,oracle.placeId);assert.equal(s.map.selectionGeneration,generation);}
});
test('current Dafotang note corrects only the obsolete furniture claim in both languages, not historical R48 records',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();s.map.showPlace(oracle.placeId);const panel=s.map.placePanel.element;assert.doesNotMatch(panel.textContent,/旧通用案椅柜凳保留并标未核/);assert.match(panel.textContent,/未核通用家具不生成/);localeStore.setLocale('en');assert.doesNotMatch(panel.textContent,/Old generic tables, chairs, cabinets, and stools are retained as unverified/);assert.match(panel.textContent,/Unverified generic furniture is not generated/);
 const bytes=fs.readFileSync(new URL('../../data/architecture/building-fidelity.json',import.meta.url),'utf8');assert.equal(bytes.split('旧通用案椅柜凳保留并标未核。').length-1,3,'Three historical R48 records stay unchanged');
});
test('source oracle rejects fabricated reconstruction IDs, substituted URLs, wrong cards and unexpected/missing links',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);s.map.toggle();s.map.showPlace(oracle.placeId);const panel=s.map.placePanel.element,historical=s.map.placeCatalog.sourcesFor(s.map.placeCatalog.get(oracle.placeId));const get=()=>panel.querySelectorAll('a'),id='place-reconstruction-source-'+oracle.placeId+'-'+oracle.sources[0].id;const original=panel.querySelector('#'+id);assert.ok(original);
 for(const mutate of [a=>a.id+='-fake',a=>a.setAttribute('href',oracle.sources[1].url),a=>a.id=a.id.replace(oracle.placeId,'taihe')]){const oldId=original.id,oldHref=original.getAttribute('href');mutate(original);assert.throws(()=>assertCompleteSourceLinks(get(),oracle.placeId,historical));original.id=oldId;original.setAttribute('href',oldHref);}
 assert.throws(()=>assertCompleteSourceLinks(get().slice(1),oracle.placeId,historical));assert.throws(()=>assertCompleteSourceLinks([...get(),original],oracle.placeId,historical));assert.throws(()=>assertCompleteSourceLinks(get(),'taihe',historical));
});

test('principal disclosure coexists with the unique first sticky action in both languages',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();const catalog=new TourPlaceCatalog(),place=catalog.get(oracle.placeId),panel=s.map.placePanel;let traveled=0;
 panel.render({place,name:place.name,sources:catalog.sourcesFor(place),canTravel:true,onTravel:()=>traveled++});
 for(const locale of ['zh-CN','en','zh-CN']){localeStore.setLocale(locale);const element=panel.element,action=element.querySelector('#place-actions');assert.ok(action);assert.equal(element.children[0],action);assert.equal(action.querySelectorAll('button').length,1);assert.ok(element.querySelector('#place-historical-principal'));for(const expected of Object.values(oracle.text[locale]))assert.ok(element.textContent.includes(expected));assert.equal(element.querySelectorAll('#place-travel').length,1);}
 assert.equal(traveled,0,'locale refresh is not a travel command');
});
test('the two exact current selection/accessibility templates remain alongside the principal translation',async()=>{
 const {translateText}=await import('../../src/i18n/Messages.js');
 assert.equal(translateText('已选择内金水桥，仅定位地图，人物未移动','en'),'Selected Inner Jinshui Bridges; map centered only, character not moved');
 assert.equal(translateText('前往太和殿外观观览点','en'),'Go to the exterior viewing point for Hall of Supreme Harmony');
});
