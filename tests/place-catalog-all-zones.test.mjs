import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PlaceCatalog} from '../src/ui/PlaceCatalog.js';
const data=()=>JSON.parse(readFileSync(new URL('../data/places/zh-CN.json',import.meta.url)));
// Removing any of the three new zone imports must fail its real scene-binding case.
for(const [zoneId,name] of [['east-six','景仁宫'],['west-six','永寿宫'],['ningshou','宁寿宫']]) test(`catalog binds evidence to actual ${zoneId} place`,()=>{
 const d=data(),p=structuredClone(d.places[0]);p.id='zone-fixture';p.name=name;p.sceneBinding={kind:'zone',zoneId,name};p.modelExperience.teleportTargetName=name;d.places=[p];
 const c=new PlaceCatalog(d);assert.equal(c.forBinding(p.sceneBinding)?.name,name);
});
test('catalog permits evidence-backed identity without invented chronology and displays explicit name/source boundaries',()=>{
 const d=data(),p=d.places[0];p.timeline=[];p.canonicalName='测试资料正式名称';p.evidenceNote={text:'来源仅支持所列用途；未据此推定单独建造年代。',sourceIds:p.summary.sourceIds};
 const c=new PlaceCatalog(d);assert.deepEqual(c.get(p.id).timeline,[]);assert.equal(c.get(p.id).canonicalName,p.canonicalName);
 assert.ok(c.sourcesFor(p).some(s=>s.id===p.evidenceNote.sourceIds[0]));
});
for(const [label,change] of [['HTML alias',p=>p.canonicalName='<b>错误</b>'],['unreferenced note',p=>p.evidenceNote={text:'没有证据',sourceIds:['missing']}],['HTML note',p=>p.evidenceNote={text:'<script>',sourceIds:p.summary.sourceIds}]])test(`catalog rejects ${label}`,()=>{
 const d=data();change(d.places[0]);assert.throws(()=>new PlaceCatalog(d),/Place catalog/);
});
