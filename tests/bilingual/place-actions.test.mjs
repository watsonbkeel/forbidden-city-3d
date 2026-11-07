import test from 'node:test';import assert from 'node:assert/strict';import{setupMap}from'../lib/map-fixture.mjs';import{localeStore}from'../../src/i18n/LocaleStore.js';import baseline from './place-actions-baseline.json' with {type:'json'};
for(const lang of ['zh-CN','en'])test(`travel precedes long ${lang} text without losing any approved note or source`,async t=>{localeStore.setLocale(lang);const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.hasTeleportTarget=n=>n==='太和殿';s.map.toggle();s.map.showPlace('taihe');const panel=s.map.placePanel.element,bar=panel.querySelector('#place-actions'),button=panel.querySelector('#place-travel');assert.ok(bar,'real action bar');assert.equal(panel.children[0],bar,'actions precede all long prose');assert.ok(bar.contains(button));assert.equal(panel.querySelectorAll('#place-travel').length,1);assert.deepEqual(panel.querySelectorAll('p').map(n=>n.textContent),baseline.locales[lang].paragraphs);assert.deepEqual(panel.querySelectorAll('h2,h3').map(n=>n.textContent),baseline.locales[lang].headings);assert.deepEqual(panel.querySelectorAll('a').map(n=>({id:n.id,text:n.textContent,href:n.getAttribute('href')})),baseline.locales[lang].sources);button.click();assert.deepEqual(s.teleports,['太和殿']);});
test('source focus stays below the actual translated action height rather than behind the sticky bar',async t=>{localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));s.map.hasTeleportTarget=()=>true;const create=s.document.createElement;s.document.createElement=tag=>{const el=create(tag),renderedLocale=localeStore.locale;el.getBoundingClientRect=()=>{if(el.id==='place-actions')return{top:100,bottom:renderedLocale==='en'?204:152,height:renderedLocale==='en'?104:52};if(tag==='a'){const top=100+(renderedLocale==='en'?450:250)-s.map.placePanel.element.scrollTop;return{top,bottom:top+44,height:44};}return{top:0,bottom:0,height:0};};return el;};s.map.toggle();s.map.showPlace('taihe');const panel=s.map.placePanel.element;panel.getBoundingClientRect=()=>({top:100,bottom:400,height:300});panel.scrollTop=160;const link=panel.querySelectorAll('a')[0],id=link.id;link.focus();localeStore.setLocale('en');assert.equal(s.document.activeElement.id,id);const rect=s.document.activeElement.getBoundingClientRect();assert.ok(rect.top>=204,'full source lies below actual104px bar');assert.ok(rect.bottom<=400);assert.equal(rect.top,204,'clamp former190px anchor only to the new visible edge');assert.equal(panel.scrollTop,346);localeStore.setLocale('zh-CN');assert.equal(s.document.activeElement.id,id);assert.equal(s.document.activeElement.getBoundingClientRect().top,204);});
test('native source focus reveals the full link inside the card content viewport',async t=>{localeStore.setLocale('zh-CN');const s=await setupMap(t);s.map.hasTeleportTarget=()=>true;const create=s.document.createElement;s.document.createElement=tag=>{const e=create(tag);e.getBoundingClientRect=()=>e.id==='place-actions'?{top:100,bottom:176,height:76}:tag==='a'?{top:350-s.map.placePanel.element.scrollTop,bottom:394-s.map.placePanel.element.scrollTop,height:44}:{top:0,bottom:0,height:0};return e;};s.map.toggle();s.map.showPlace('taihe');const p=s.map.placePanel.element;p.getBoundingClientRect=()=>({top:100,bottom:400,height:300});p.scrollTop=210;const a=p.querySelectorAll('a')[0];a.focus();s.dispatch(a,'focusin');await Promise.resolve();assert.equal(s.document.activeElement,a);assert.equal(a.getBoundingClientRect().top,176);assert.equal(p.scrollTop,174);assert.equal(p.style.scrollPaddingTop,'76px');});
test('information-only cards and all four bridge facilities keep no travel action bar',async t=>{const s=await setupMap(t);s.map.hasTeleportTarget=()=>true;s.map.toggle();const info=s.map.placeCatalog.allPlaces.find(p=>p.modelExperience.navigationMode==='information-only');assert.ok(info);s.map.showPlace(info.id);assert.equal(s.map.placePanel.element.querySelector('#place-actions'),null);assert.equal(s.map.placePanel.element.querySelector('#place-travel'),null);assert.equal(s.map.bridgeMapData.facilities.length,4);for(const f of s.map.bridgeMapData.facilities){s.map.selectMapLabel({name:f.name,facilityId:f.id});assert.equal(s.map.placePanel.element.querySelector('#place-actions'),null);assert.equal(s.map.placePanel.element.querySelector('#place-travel'),null);}});

// These are declared geometry fixtures exercising production methods, not
// browser-layout evidence. The clipping edge is a float, never clientHeight.
async function sourceGeometry(t, row) {
 const {PlaceInfoPanel}=await import('../../src/ui/PlaceInfoPanel.js');
 const old=Object.getOwnPropertyDescriptor(globalThis,'getComputedStyle');
 Object.defineProperty(globalThis,'getComputedStyle',{configurable:true,value:()=>({borderTopWidth:`${row.borderTop??0}px`,borderBottomWidth:`${row.borderBottom??0}px`})});
 t.after(()=>{if(old)Object.defineProperty(globalThis,'getComputedStyle',old);else delete globalThis.getComputedStyle;});
 let scroll=0;
 const panel={style:{},clientTop:Math.round(row.borderTop??0),clientHeight:row.clientHeight,
  getBoundingClientRect:()=>({top:row.top,bottom:row.top+row.height,height:row.height}),
  querySelector:()=>row.actionHeight?{getBoundingClientRect:()=>({top:row.top+(row.borderTop??0),bottom:row.top+(row.borderTop??0)+row.actionHeight})}:null};
 Object.defineProperty(panel,'scrollTop',{get:()=>scroll,set:v=>{scroll=v;}});
 const source={getBoundingClientRect:()=>({top:row.sourceTop-scroll,bottom:row.sourceTop-scroll+row.sourceHeight,height:row.sourceHeight})};
 const self={element:panel,contentViewport:PlaceInfoPanel.prototype.contentViewport};
 PlaceInfoPanel.prototype.keepSourceVisible.call(self,source,row.preferredTop);
 return{bounds:self.contentViewport(),source:source.getBoundingClientRect(),scroll,padding:panel.style.scrollPaddingTop};
}
for(const row of [
 {name:'rounded up archived panel',top:407.375,height:343.625,clientHeight:344,actionHeight:56,sourceTop:900,sourceHeight:44},
 {name:'rounded down fractional panel',top:100.125,height:300.375,clientHeight:300,actionHeight:56.125,sourceTop:900,sourceHeight:44.25},
 {name:'fractional top and bottom borders',top:100.125,height:300.625,clientHeight:298,borderTop:1.25,borderBottom:1.5,actionHeight:56.375,sourceTop:120,sourceHeight:44.25},
 {name:'bottom border and old anchor below clip',top:407.375,height:343.625,clientHeight:342,borderTop:.75,borderBottom:1.25,actionHeight:56,sourceTop:900,sourceHeight:44,preferredTop:900},
 {name:'no action bar preserves fractional content top',top:100.25,height:300.5,clientHeight:299,borderTop:.625,borderBottom:.875,actionHeight:0,sourceTop:90,sourceHeight:44},
 {name:'integer geometry remains exact',top:100,height:300,clientHeight:300,actionHeight:56,sourceTop:900,sourceHeight:44},
])test(`source focus respects real clipping edges: ${row.name}`,async t=>{
 const q=await sourceGeometry(t,row),top=row.top+(row.borderTop??0)+row.actionHeight,bottom=row.top+row.height-(row.borderBottom??0);
 assert.deepEqual(q.bounds,{top,bottom});assert.ok(q.source.top>=top);assert.ok(q.source.bottom<=bottom);assert.equal(q.source.bottom-q.source.top,row.sourceHeight);
 assert.equal(q.padding,`${row.actionHeight}px`);
});
for(const row of [
 {name:'80px synthetic panel has only24px below56px bar',top:100,height:80,clientHeight:80,actionHeight:56,sourceTop:900,sourceHeight:44},
 {name:'wrapped source is taller than actual content space',top:100.125,height:150.5,clientHeight:151,borderTop:.5,borderBottom:.75,actionHeight:56.125,sourceTop:900,sourceHeight:120},
])test(`impossible full visibility is not claimed: ${row.name}`,async t=>{
 const q=await sourceGeometry(t,row);assert.ok(q.bounds.bottom-q.bounds.top<row.sourceHeight);
 assert.equal(q.source.top,q.bounds.top,'retain the minimum useful top alignment without enlarging the panel');
 assert.equal(q.source.top>=q.bounds.top&&q.source.bottom<=q.bounds.bottom,false,'insufficient space remains a declared boundary, not a false full-visibility result');
});
