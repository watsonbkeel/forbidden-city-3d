import test from 'node:test';import assert from 'node:assert/strict';
import {setupMap} from '../lib/map-fixture.mjs';import {localeStore} from '../../src/i18n/LocaleStore.js';
const module=await import('../../src/ui/TourPlaceCatalog.js').catch(()=>({}));
test('combined text catalog retains original164 contract and declares each supplemental identity separately',()=>{
 assert.equal(typeof module.TourPlaceCatalog,'function');const c=new module.TourPlaceCatalog();assert.equal(c.places.length,164);assert.equal(c.supplementalPlaces.length,122);assert.equal(c.allPlaces.length,286);assert.equal(new Set(c.allPlaces.map(p=>p.id)).size,286);
 assert.equal(c.supplementalPlaces.filter(p=>p.modelExperience.navigationMode==='information-only').length,94);
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
 assert.equal(s.map.supplementalPlaceList.querySelectorAll('button').length,122);assert.deepEqual(s.teleports,[]);
});
test('cross-section search clears cleanly and same displayed Neige store names keep distinct selection and target keys',async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.toggle();
 const input=s.map.container.querySelector('#place-search'),all=[...s.map.placeList.querySelectorAll('button'),...s.map.supplementalPlaceList.querySelectorAll('button')];
 for(const term of ['zz-no-such-place','']){input.value=term;s.dispatch(input,'input');assert.equal(all.filter(b=>!b.hidden).length,term?0:286);}
 const stores=s.map.placeCatalog.supplementalPlaces.filter(p=>['内阁大库','内阁大库第二体'].includes(p.name));assert.equal(stores.length,2);
 s.map.items=stores.map(p=>({...p.supplementalText.mapBinding}));s.map.hasTeleportTarget=()=>true;
 for(const p of stores){s.map.showPlace(p.id);assert.equal(s.map.selectedPlaceId,p.id);assert.equal(s.map.placePanel.element.querySelector('#place-title').textContent,'内阁大库');assert.equal(s.map.placeCatalog.forMapItem(p.supplementalText.mapBinding,s.map.items).id,p.id);const button=s.map.placePanel.element.querySelector('#place-travel');assert.ok(button);button.click();assert.equal(s.teleports.at(-1),p.name);s.map.toggle();}
});
