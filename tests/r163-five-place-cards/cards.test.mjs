import {restoreBeforeR163FiveCards} from '../lib/r163-five-cards-retention.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {setupMap} from '../lib/map-fixture.mjs';
import {CourtKit} from '../../src/scene/palace/kit.js';
import {realTextureLibrary} from '../lib/r48-real-texture-library.mjs';
import {buildTianyiGate} from '../../src/scene/palace/special/TianyiGate.js';
import {buildChengqianRearWing} from '../../src/scene/palace/special/ChengqianRearWings.js';
import {buildChuxiuRearWing} from '../../src/scene/palace/special/ChuxiuRearWings.js';
import {PlaceCatalog} from '../../src/ui/PlaceCatalog.js';
const read = p => JSON.parse(readFileSync(new URL(`../../${p}`, import.meta.url)));
const cases = [
  {zone:'garden',name:'天一门',query:'天一门',source:'236541',words:['御花园','钦安殿','南门'],build:buildTianyiGate},
  {zone:'east-six',name:'承乾宫后东配殿',query:'承乾宫后殿东配殿',source:'236438',words:['承乾宫','后院','东侧','三间'],build:buildChengqianRearWing},
  {zone:'east-six',name:'承乾宫后西配殿',query:'承乾宫后殿西配殿',source:'236438',words:['承乾宫','后院','西侧','三间'],build:buildChengqianRearWing},
  {zone:'west-six',name:'凤光室',query:'凤光室',source:'236554',words:['丽景轩','东配殿','三间'],build:buildChuxiuRearWing},
  {zone:'west-six',name:'猗兰室',query:'猗兰馆',source:'236554',words:['丽景轩','西配殿','三间'],build:buildChuxiuRearWing},
];
// Removing any card must fail its actual component's map binding and visible detail.
for (const c of cases) test(`${c.name}: real component map opens a sourced card and retains its travel key`, async t => {
  const s=await setupMap(t),zone=read(`data/zones/${c.zone}.json`),item=zone.items.find(i=>i.name===c.name);
  const kit=new CourtKit(realTextureLibrary(),c.zone);c.build(kit,item,zone);t.after(()=>kit.dispose(kit.root));
  const mapItem=kit.mapItems.find(i=>i.name===c.name);assert.ok(mapItem);
  const place=s.map.placeCatalog.forMapItem(mapItem,kit.mapItems);assert.ok(place,`${c.name} lacks its actual map binding`);
  assert.equal(place.sceneBinding.name,c.name);assert.equal(place.modelExperience.teleportTargetName,c.name);
  assert.deepEqual(place.people,[]);assert.deepEqual(place.timeline,[]);assert.deepEqual(place.functions,[]);
  assert.equal(place.siteAccess.status,'not-verified');assert.equal(place.siteAccess.checkedAt,null);
  for(const word of c.words)assert.ok(place.summary.text.includes(word));
  const sources=s.map.placeCatalog.sourcesFor(place);assert.ok(sources.some(x=>x.url===`https://www.dpm.org.cn/explore/building/${c.source}.html`));
  s.map.items=kit.mapItems;s.map.hasTeleportTarget=name=>name===c.name;s.map.toggle();
  s.map.labels=[];s.map.labelPaintRecords=[];s.map.drawSideItems();
  const label=s.map.labels.find(l=>l.name===c.name);assert.equal(label?.placeId,place.id);
  s.map.selectMapLabel(label);
  assert.equal(s.map.container.querySelector('#place-title').textContent,c.name);
  const panel=s.map.placePanel.element;assert.ok(panel.textContent.includes(place.summary.text));assert.doesNotMatch(panel.textContent,/详细介绍尚未收录/);
  assert.ok(panel.querySelectorAll('a').some(a=>a.getAttribute('href')===`https://www.dpm.org.cn/explore/building/${c.source}.html`));
  s.map.container.querySelector('#place-travel').click();assert.deepEqual(s.teleports,[c.name]);
});
// Removing canonical-name search, directory listeners or per-card target keys fails these UI cases.
for (const mobile of [false,true]) for(const c of cases) test(`${c.name}: ${mobile?'touch':'keyboard'} directory finds both names and opens the right detail`, async t=>{
  const s=await setupMap(t,{mobile});s.map.hasTeleportTarget=name=>cases.some(c=>c.name===name);s.map.toggle();
  const input=s.map.container.querySelector('#place-search');
  for(const query of new Set([c.name,c.query])){
    input.value=query;s.dispatch(input,'input');
    const visible=s.map.placeList.querySelectorAll('button').filter(b=>!b.hidden);
    assert.deepEqual(visible.map(b=>b.textContent),[c.name],`search ${query}`);
    visible[0].click();assert.equal(s.map.container.querySelector('#place-title').textContent,c.name);
    assert.doesNotMatch(s.map.placePanel.element.textContent,/详细介绍尚未收录/);
    if(c.query!==c.name)assert.ok(s.map.placePanel.element.textContent.includes(`资料所用名称：${c.query}`));
    s.map.backToMap();assert.equal(input.value,query);
  }
});
test('five independent cards are appended without altering the 159 existing cards or their aliases',()=>{
  const data=read('data/places/zh-CN.json'),catalog=new PlaceCatalog();
  assert.equal(catalog.places.length,164);
  const hash=createHash('sha256').update(JSON.stringify(data.places.slice(0,159))).digest('hex');
  assert.equal(hash,'dfb9dc8d3c4f2df106a4808a93d36db608f64ee8a6d1b9cfd1deecab509400b2');
  assert.deepEqual(new Set(data.places.slice(159).map(p=>p.name)),new Set(cases.map(c=>c.name)));
  assert.equal(new Set(data.places.slice(159).map(p=>p.modelExperience.teleportTargetName)).size,5);
});

test('exact additive inverse retains the old catalog and rejects changes to old facts or new claims',()=>{
  const data=read('data/places/zh-CN.json'),raw=JSON.stringify(data,null,2)+'\n';
  const restored=JSON.parse(restoreBeforeR163FiveCards(raw));
  assert.equal(restored.places.length,159);assert.equal(restored.sources.length,129);
  for(const change of [d=>d.places[0].summary.text+='changed',d=>d.places.at(-1).summary.text+='changed',d=>d.sources.at(-1).url='https://www.dpm.org.cn/wrong.html',d=>d.places.pop()]){
    const changed=structuredClone(data);change(changed);
    assert.throws(()=>restoreBeforeR163FiveCards(JSON.stringify(changed,null,2)+'\n'),/AssertionError/);
  }
});
