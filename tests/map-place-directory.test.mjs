import test from 'node:test';
import assert from 'node:assert/strict';
import {setupMap} from './lib/map-fixture.mjs';
// Removing the actual input listener or hiding only visual text must fail these UI-state assertions.
for(const mobile of [false,true])test(`searchable place directory preserves ${mobile?'touch':'keyboard'} card/back state`,async t=>{
 const s=await setupMap(t,{mobile});s.map.toggle();
 const input=s.map.container.querySelector('#place-search'),count=s.map.container.querySelector('#place-search-count');
 assert.ok(input);assert.equal(input.getAttribute('aria-label'),'搜索地点名称');
 input.value=' 太和 ';s.dispatch(input,'input');
 const buttons=s.map.placeList.querySelectorAll('button');
 assert.deepEqual(buttons.filter(b=>!b.hidden).map(b=>b.textContent),['太和门','太和殿']);
 assert.match(count.textContent,/2/);assert.ok(buttons.filter(b=>b.hidden).every(b=>b.inert));
 buttons.find(b=>b.textContent==='太和殿').click();assert.equal(s.map.selectedPlaceId,'taihe');
 s.map.backToMap();assert.equal(input.value,' 太和 ');assert.equal(buttons.filter(b=>!b.hidden).length,2);
 input.value='不存在的地点';s.dispatch(input,'input');assert.ok(buttons.every(b=>b.hidden));assert.match(count.textContent,/未找到/);
 input.value='';s.dispatch(input,'input');assert.equal(buttons.filter(b=>!b.hidden).length,s.map.placeCatalog.places.length);
 input.focus();s.dispatch(input,'keydown',{code:'KeyW',key:'w',repeat:false});assert.equal(s.c.keyPressTimes.has('KeyW'),false);assert.equal(s.c.moveForward,false);
 assert.deepEqual(s.teleports,[]);
});
test('official name aliases and evidence limits appear as safe text in card',async t=>{
 const s=await setupMap(t);s.map.toggle();const p=s.map.placeCatalog.get('taihe');
 p.canonicalName='资料正式名称';p.evidenceNote={text:'仅核实所属院落，未核实单间居住人物。',sourceIds:p.summary.sourceIds};
 s.map.showPlace('taihe');const panel=s.map.container.querySelector('#place-info');
 assert.match(panel.textContent,/资料所用名称：资料正式名称/);assert.match(panel.textContent,/仅核实所属院落/);
});
