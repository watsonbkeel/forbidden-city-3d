import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PlaceCatalog} from '../src/ui/PlaceCatalog.js';
import {PlaceInfoPanel} from '../src/ui/PlaceInfoPanel.js';
import {createDOM} from './lib/ui-dom.mjs';
const read=path=>JSON.parse(readFileSync(new URL(`../${path}`,import.meta.url)));
const zones=['garden','outer-east','outer-west','axis-courts','east-six','west-six','ningshou'];
test('all 159 displayed place names resolve once, with 145 new source-backed cards',()=>{
 const c=new PlaceCatalog();assert.equal(c.places.length,159);assert.equal(new Set(c.places.map(p=>p.id)).size,159);
 for(const zoneId of zones) for(const item of read(`data/zones/${zoneId}.json`).items.filter(i=>i.name && ['hall','gate','cityGate','nineDragonWall'].includes(i.kind))){
  const p=c.forBinding({kind:'zone',zoneId,name:item.name});assert.ok(p,`${zoneId}/${item.name}`);assert.equal(p.name,item.name);
 }
 for(const p of c.places){assert.ok(p.summary.sourceIds.length || p.evidenceStatus==='identity-unresolved');assert.equal(p.modelExperience.teleportTargetName,p.name);for(const s of c.sourcesFor(p))assert.match(new URL(s.url).hostname,/^(?:[a-z0-9-]+\.)?dpm\.org\.cn$/);}
});
test('Nine Dragon Wall map footprint binds to the wall, without borrowing a neighbouring hall',()=>{
 const c=new PlaceCatalog(),item={kind:'hall',name:'九龙壁',x:-295,z:123,w:29.4,d:1.6};assert.equal(c.forMapItem(item,[item])?.name,'九龙壁');assert.equal(c.forMapItem({...item,x:-294},[{...item,x:-294}]),null);
});
test('unresolved identity, conditional names and historic demolished gates remain explicit',()=>{
 const c=new PlaceCatalog(),byName=n=>c.places.find(p=>p.name===n);
 assert.equal(byName('南薰门').evidenceStatus,'identity-unresolved');assert.equal(byName('南薰门').functions.length,0);assert.equal(byName('南薰门').people.length,0);
 assert.equal(byName('太极门').evidenceStatus,'identity-inferred');
 for(const name of ['储秀门','长春门']){const p=byName(name);assert.equal(p.evidenceStatus,'historical-site');assert.match(p.summary.text,/拆除/);}
 for(const name of ['长康左门','长康右门'])assert.equal(byName(name).evidenceStatus,'partial-history');
 for(const name of ['南三所西所后殿','南三所中所后殿撷芳殿','南三所东所后殿']){assert.equal(byName(name).evidenceStatus,'partial-identity');assert.equal(byName(name).people.length,0);}
 assert.equal(byName('翊坤宫后殿').canonicalName,'体和殿');assert.equal(byName('太极殿后殿').canonicalName,'体元殿');
});
test('facts with no documented independent function or dates do not require filler',()=>{
 const d=read('data/places/zh-CN.json');d.places[0].functions=[];d.places[0].timeline=[];assert.doesNotThrow(()=>new PlaceCatalog(d));
});
test('non-residential activities and intended use are never coerced into residence',()=>{
 const c=new PlaceCatalog(),byName=n=>c.places.find(p=>p.name===n);
 assert.ok(byName('宁寿宫').people.some(p=>p.relation==='intended-user'));
 assert.ok(byName('景祺阁').people.some(p=>p.relation==='confined-nearby'));
 assert.ok(byName('储秀宫后殿').people.some(p=>p.relation==='birthplace'));
 assert.ok(byName('养性殿').people.some(p=>p.relation==='dining-user'));
 for(const p of c.places)for(const person of p.people.filter(x=>['resident','temporary-resident'].includes(x.relation)))assert.ok(p.residenceNote?.sourceIds.length,`${p.name}/${person.name}`);
});
test('partial evidence labels and all 159 cards render as plain nonmodal text',t=>{
 const dom=createDOM(),saved=globalThis.document;globalThis.document=dom.document;t.after(()=>{globalThis.document=saved});
 const c=new PlaceCatalog(),panel=new PlaceInfoPanel();
 for(const p of c.places){panel.render({place:p,name:p.name,sources:c.sourcesFor(p),canTravel:true,onTravel(){}});assert.ok(panel.element.textContent.includes(p.summary.text));assert.equal(panel.element.querySelectorAll('#place-travel').length,1);assert.equal(panel.element.querySelectorAll('iframe,script,img').length,0);}
 const p=c.places.find(p=>p.name==='南薰门');panel.render({place:p,name:p.name,sources:c.sourcesFor(p),canTravel:false});assert.match(panel.element.textContent,/名称对应待核/);panel.dispose();
});
test('evidence status cannot silently claim measurement or live opening',()=>{
 for(const status of ['survey-verified','open-now','<script>']){const d=read('data/places/zh-CN.json');d.places[0].evidenceStatus=status;assert.throws(()=>new PlaceCatalog(d),/Place catalog/);}
});
