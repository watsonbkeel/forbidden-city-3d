import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {PALACE_LAYOUT} from '../src/scene/Layout.js';
import {modelFidelityFor} from '../src/ui/ModelFidelity.js';
import {setupMap} from './lib/map-fixture.mjs';
const url=new URL('../data/architecture/building-fidelity.json',import.meta.url);
const read=()=>{assert.ok(existsSync(url),'full named-building registry is absent');return JSON.parse(readFileSync(url));};
const catalog=JSON.parse(readFileSync(new URL('../data/places/zh-CN.json',import.meta.url)));
function enumerated(){
 const records=[];
 for(const file of readdirSync(new URL('../data/zones/',import.meta.url)).filter(f=>f.endsWith('.json'))){const zone=JSON.parse(readFileSync(new URL('../data/zones/'+file,import.meta.url)));for(const item of zone.items??[])if(item.kind==='hall'&&(item.name||item.auxiliaryIdentity))records.push({zone:zone.id,name:item.name??item.auxiliaryIdentity});}
 for(const p of PALACE_LAYOUT.filter(p=>p.type==='palace'))records.push({zone:'layout',name:p.name});
 // These five names have actual, separate makePavilion calls in GardenBuilder:
 // two pond specs, two anchor-driven pair instances and one hilltop instance.
 const garden=readFileSync(new URL('../src/scene/GardenBuilder.js',import.meta.url),'utf8');
 const names=[...garden.matchAll(/\{ name: '([^']+亭)'/g)].map(m=>m[1]);
 for(const m of garden.matchAll(/const (?:wanchun|qianqiu) = anchors\['([^']+)'\]/g))if(!names.includes(m[1]))names.push(m[1]);
 assert.match(garden,/山顶御景亭[\s\S]*?this\.makePavilion/);names.push('御景亭');
 assert.equal(names.length,5);for(const name of names)records.push({zone:'garden-procedural',name});
 return records;
}
test('R39 registry covers exactly the actual named runtime building identities, separate from gates and anonymous wings',()=>{
 const data=read(),actual=enumerated(),keys=rows=>rows.map(r=>r.zone+'/'+r.name).sort();
 assert.equal(actual.length,89);assert.equal(data.buildings.length,89);assert.deepEqual(keys(data.buildings),keys(actual));
 assert.equal(new Set(data.buildings.map(r=>r.id)).size,89);
 const bound=data.buildings.filter(b=>b.catalogId);assert.equal(bound.length,83);
 for(const b of bound){const p=catalog.places.find(p=>p.id===b.catalogId);assert.ok(p);assert.equal(p.sceneBinding.name,b.name);}
 assert.equal(catalog.places.length,159);
});
test('R39 registry separates actual changes, source claims, fitted dimensions and unaccepted interior/exterior states',()=>{
 const data=read();
 for(const b of data.buildings){
  for(const part of ['interior','exterior']){const p=b[part];assert.ok(['generic-placeholder','dedicated-partial','withheld','shared-pavilion'].includes(p.implementation));assert.equal(p.accepted,false);assert.equal(p.dimensions,'includes-model-fits');assert.ok(p.unresolved.length);}
  for(const c of b.claims){assert.ok(['interior','exterior'].includes(c.scope));assert.ok(c.text&&c.targetState);assert.match(c.source,/^https:\/\/(?:[a-z-]+\.)?dpm\.org\.cn\//);assert.equal(typeof c.implemented,'boolean');}
  assert.equal(b.validation.visual,'not-verified');
 }
 const wenhua=data.buildings.find(b=>b.name==='文华殿');assert.ok(wenhua.claims.some(c=>c.implemented&&c.targetState.includes('2026-09')));
 const fengxian=data.buildings.find(b=>b.name==='奉先殿');assert.equal(fengxian.interior.implementation,'withheld');assert.match(fengxian.interior.unresolved.join(' '),/祭祀/);
 const jingren=data.buildings.find(b=>b.name==='景仁宫');assert.equal(jingren.interior.implementation,'generic-placeholder');assert.ok(jingren.auxiliaryProfiles.includes('jingren-rear'));
});
test('R39 existing fidelity lookup now describes unknown generic interiors and preserves specific caveats',()=>{
 read();const value=modelFidelityFor('梵华楼');assert.ok(value);assert.match(value.detail,/外观/);assert.match(value.detail,/内饰/);assert.match(value.detail,/待核/);
 assert.match(modelFidelityFor('乾清宫').detail,/AI 辅助原创近似/);
 assert.equal(modelFidelityFor('不存在的地点'),null);
});
test('R39 generic and corrected building status reaches the real place-card UI without new places or travel actions',async t=>{
 read();const s=await setupMap(t);s.map.toggle();
 for(const name of ['梵华楼','文华殿','奉先殿']){const p=s.map.placeCatalog.places.find(p=>p.name===name);s.map.showPlace(p.id);const panel=s.map.container.querySelector('#place-info');assert.match(panel.textContent,/本版模型说明/);assert.match(panel.textContent,/内饰/);s.map.backToMap();}
 assert.equal(s.map.placeCatalog.places.length,159);assert.deepEqual(s.teleports,[]);
});
test('R39 registry validation rejects duplicate identities, fake official hosts and implied acceptance',async()=>{
 const {validateBuildingFidelity}=await import('../src/ui/BuildingFidelity.js');
 for(const mutate of [j=>j.buildings.push(structuredClone(j.buildings[0])),j=>j.buildings[0].interior.accepted=true,j=>j.buildings.find(b=>b.claims.length).claims[0].source='https://dpm.org.cn.evil.example/photo',j=>j.buildings[0].exterior.unresolved=[]]){const j=read();mutate(j);assert.throws(()=>validateBuildingFidelity(j));}
});
