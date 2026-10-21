import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const url=new URL('../src/scene/palace/special/RemainingOuterHalls.js',import.meta.url);
const api=existsSync(url)?await import(url):{};
const scope=JSON.parse(readFileSync(new URL('../docs/current-state/r48-remaining/outer-scope.json',import.meta.url)));
test('R48 outer interface registers exactly 27 identities and resolves only implemented batch without mutation',()=>{
 assert.equal(typeof api.resolveRemainingProfile,'function','27-identity source-specific resolver must exist');
 assert.equal(api.REMAINING_OUTER_PROFILES.length,27);for(const row of scope){const before=JSON.stringify(row.baselineItem),record=api.REMAINING_OUTER_PROFILES.find(p=>p.id===row.id),p=api.resolveRemainingProfile(row.zone,row.baselineItem);assert.equal(p?.id??null,api.READY_OUTER_KEYS.includes(record.key)?row.id:null,row.name);assert.ok(['replace','augment'].includes(record.mode));assert.equal(JSON.stringify(row.baselineItem),before);assert.match(record.dimensionStatus,/FIT/);assert.equal(record.photographyDate,null);}
});
test('R48 outer resolver does not consume earlier changed buildings or transplanted identities',()=>{
 assert.equal(typeof api.resolveRemainingProfile,'function');
 for(const row of scope){for(const change of[{x:row.baselineItem.x+.01},{z:row.baselineItem.z+.01},{w:row.baselineItem.w+1},{kind:'gate'},{name:'not this building'}])assert.equal(api.resolveRemainingProfile(row.zone,{...row.baselineItem,...change}),null);assert.equal(api.resolveRemainingProfile('ningshou',row.baselineItem),null);}
 const old=JSON.parse(readFileSync(new URL('../data/zones/outer-west.json',import.meta.url))).items.find(i=>i.name==='英华殿');assert.equal(api.resolveRemainingProfile('outer-west',old),null);
});
test('R48 outer keeps special south models incremental and evidence conditions explicit',()=>{
 assert.equal(typeof api.resolveRemainingProfile,'function');
 for(const row of scope){const p=api.REMAINING_OUTER_PROFILES.find(p=>p.id===row.id);if(row.baselineItem.structure)assert.equal(p.mode,'augment',row.name);if(row.name.startsWith('南三所'))assert.match(p.unknown.join(' '),/三进|三進/);if(['本仁殿','集义殿','恒寿斋'].includes(row.name))assert.match(p.evidenceStatus,/CONDITIONAL|IDENTITY_ONLY/);if(['凝道殿','焕章殿'].includes(row.name)){assert.equal(p.evidenceStatus,'OWN_2021_PANORAMA_LAYOUT_WITH_FITTED_METRICS');assert.match(p.unknown.join(' '),/2021.*2026.*库存/);assert.equal(p.currentInventoryVerified,false);assert.equal(p.visitorAccessVerified,false);}}
});
test('R48 outer module maintains all three static integration exports',()=>{for(const name of ['resolveRemainingProfile','buildRemainingHall','augmentRemainingHall'])assert.equal(typeof api[name],'function',name)});

test('R48 exact front-house mapFootprint is the actual map rectangle, not the former source center',async()=>{
 const{CourtKit}=await import('../src/scene/palace/kit.js'),{library}=await import('./lib/inner-palace-fixture.mjs');
 for(const row of scope){const p=api.REMAINING_OUTER_PROFILES.find(p=>p.id===row.id);if(!['hanqing','yanshou'].includes(p.key)){assert.equal(p.mapFootprint,null);continue;}
  const kit=new CourtKit(library(),row.zone);try{api.buildRemainingHall(kit,row.baselineItem,p);const map=kit.mapItems.find(m=>m.name===row.name);assert.ok(map);assert.deepEqual(p.mapFootprint,Object.fromEntries(['x','z','w','d','kind'].map(k=>[k,map[k]])));assert.notEqual(map.z,row.baselineItem.z);assert.ok(Object.isFrozen(p.mapFootprint));assert.equal(api.resolveRemainingProfile(row.zone,{...row.baselineItem,z:map.z}),null,'actual rectangle cannot masquerade as old source identity');}finally{kit.dispose(kit.root)}
 }
});
