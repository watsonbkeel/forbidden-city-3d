import test from 'node:test';
import assert from 'node:assert/strict';
import {setupMap} from '../lib/map-fixture.mjs';
import {localeStore} from '../../src/i18n/LocaleStore.js';
import {translateText,missingTranslations} from '../../src/i18n/Messages.js';
import {localizeDom} from '../../src/i18n/DomLocalization.js';

// Fixed user-facing expectations, not generated from the translation registry.
const bridges=[
 ['FC-D156902D78','内金水桥','Inner Jinshui Bridges'],
 ['FC-B9097C61D8','武英门前三座石桥','Three stone bridges in front of Wuying Gate'],
 ['FC-74F8C30390','半壁桥','Banbi Bridge'],
 ['FC-17AFD38428','三座门外三座石桥','Three stone bridges outside Sanzuo Gate'],
];
for(const[id,zh,en]of bridges)test(`complete map-only announcement and directory label translate without missing keys: ${id}`,()=>{
 const notice=`已选择${zh}，仅定位地图，人物未移动`,label=`了解${zh}并定位地图，不移动人物`;
 assert.equal(translateText(notice,'zh-CN'),notice);
 assert.equal(translateText(label,'en'),`Read about ${en} and locate it on the map without moving your character`);
 assert.equal(translateText(notice,'en'),`Selected ${en}; map centered only, character not moved`);
 assert.deepEqual([...missingTranslations],[],'do not clear or filter the shared missing-translation history');
});

// The lightweight DOM fixture stores text in _text. Expose its real live
// region through a text-node view so the production localizer can traverse it.
// No layout, browser MutationObserver scheduling or screen-reader is emulated.
function localizeAnnouncement(node){
 const text={nodeType:3,parentNode:node,get nodeValue(){return node._text;},set nodeValue(value){node._text=value;}};
 node.nodeType=1;Object.defineProperty(node,'childNodes',{get:()=>[text]});
 const contains=node.contains.bind(node);node.contains=n=>n===text||contains(n);
 return localizeDom(node,{store:localeStore,translate:translateText,MutationObserver:null});
}
for(const[id,zh,en]of bridges)test(`real bridge selection survives repeated language changes with map-only live status: ${id}`,async t=>{
 localeStore.setLocale('zh-CN');const s=await setupMap(t);t.after(()=>localeStore.setLocale('zh-CN'));
 s.map.hasTeleportTarget=()=>true;s.map.toggle();const camera=s.logical().toArray();
 const live=s.map.placeAnnouncement,local=localizeAnnouncement(live);t.after(()=>local.dispose());
 assert.equal(live.getAttribute('aria-live'),'polite');assert.equal(live.getAttribute('aria-atomic'),'true');
 const entry=s.map.directoryEntries.find(e=>e.facility?.id===id);assert.ok(entry);const button=entry.button;
 for(const start of ['zh-CN','en']){
  localeStore.setLocale(start);await Promise.resolve();button.click();local.refresh();
  const selection={...s.map.selection},view={...s.map.view};assert.equal(selection.facilityId,id);assert.equal(selection.name,zh);
  for(const lang of [start, start==='en'?'zh-CN':'en',start,'zh-CN','en']){
   localeStore.setLocale(lang);await Promise.resolve();local.refresh();
   assert.equal(live.textContent,lang==='en'?`Selected ${en}; map centered only, character not moved`:`已选择${zh}，仅定位地图，人物未移动`);
   assert.equal(button.textContent,lang==='en'?en:zh);
   assert.equal(button.getAttribute('aria-label'),lang==='en'?`Read about ${en} and locate it on the map without moving your character`:`了解${zh}并定位地图，不移动人物`);
   assert.deepEqual(s.map.selection,selection);assert.deepEqual(s.map.view,view);assert.deepEqual(s.logical().toArray(),camera);assert.deepEqual(s.teleports,[]);
   assert.equal(s.map.placePanel.element.querySelector('#place-travel'),null);assert.equal(s.map.placePanel.element.querySelector('#place-actions'),null);
   assert.deepEqual([...missingTranslations],[]);
  }
  s.map.backToMap();
 }
});

test('ordinary place selection and genuine missing bridge names retain strict fallback reporting',()=>{
 assert.equal(translateText('已选择太和殿','en'),'Selected Hall of Supreme Harmony');
 assert.deepEqual([...missingTranslations],[]);
 assert.equal(translateText('已选择未核未知桥，仅定位地图，人物未移动','en'),'Selected English text unavailable.; map centered only, character not moved');
 assert.deepEqual([...missingTranslations],['未核未知桥'],'unknown name is still reported, never filtered or disguised');
});

test('only the exact bridge and exterior-view templates get a historical dictionary view',async()=>{
 const fs=await import('node:fs'),{createHash}=await import('node:crypto');
 const {readXiangxuHistoricalSource,stripXiangxuDelta}=await import('../r166-xiangxu-gate/source-boundary.mjs');
 const {createRuntimeReader}=await import('./source-boundary-io.mjs');
 const {restoreDafotangSource}=await import('../r167-dafotang-principal/source-boundary.mjs');
 const path='data/i18n/ui-en.json',actual=fs.readFileSync(path),prior=readXiangxuHistoricalSource(path),sha=b=>createHash('sha256').update(b).digest('hex');
 assert.equal(sha(prior),'63711a8a41ff3ecd719dec199a6c7b0b5cbd5011f6c2cdac217b3e5945d82e5c');
 const expected=JSON.parse(prior);expected.messages['已选择${0}，仅定位地图，人物未移动']='Selected ${0}; map centered only, character not moved';
 expected.messages['前往${0}外观观览点']='Go to the exterior viewing point for ${0}';
 assert.deepEqual(JSON.parse(restoreDafotangSource(path,actual)),expected);
 assert.notDeepEqual(actual,prior);
 for(const bad of [Buffer.concat([actual,Buffer.from('\n')]),Buffer.from(actual.toString().replace('Selected ${0}; map centered only, character not moved','Selected ${0}; character moved')),Buffer.from(actual.toString().replace('Go to the exterior viewing point for ${0}','Go inside ${0}'))])assert.throws(()=>stripXiangxuDelta(path,bad));
 const reader=createRuntimeReader(process.cwd()),digest=createHash('sha256');
 for(const p of reader.listCurrent()){const raw=reader.readCurrent(p).bytes,restored=restoreDafotangSource(p,raw);if(restored===null)continue;const bytes=p===path?prior:restored;digest.update(`${p.length}:${p}:${bytes.length}:`);digest.update(bytes);}
 assert.equal(digest.digest('hex'),'1390a781c623fae89e9f6161457373524712bfccfb5b4ad7b908e7dcd835e23f','only the two approved dictionary additions recover the public656a runtime projection');
 assert.deepEqual(fs.readFileSync(path),actual,'source comparison never rewrites physical runtime');
});
