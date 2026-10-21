import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{ZoneBase}from'../src/scene/zones/ZoneBase.js';import{library}from'./lib/inner-palace-fixture.mjs';
const ledger=JSON.parse(readFileSync(new URL('../data/architecture/building-fidelity.json',import.meta.url)));
test('R48 source-state tail retains NingShou removed-kang and unlocated-stove boundaries after real architectural updates',()=>{
 const b=ledger.buildings.find(b=>b.id==='place-ningshou-e66dfe768f');assert.equal(b.interior.implementation,'dedicated-partial');
 const inherited=b.claims.find(c=>!c.release&&/万字炕.*拆除/.test(c.text));assert.ok(inherited);assert.equal(inherited.implemented,false);assert.match(inherited.targetState,/非2026/);
 assert.ok(b.interior.unresolved.some(s=>s.includes('坐标')&&s.includes('暂不加入')));
 assert.match(b.publicNote,/不复建已拆/);assert.match(b.publicNote,/未核实/);assert.equal(b.interior.accepted,false);assert.equal(b.validation.visual,'not-verified');
 const data=JSON.parse(readFileSync(new URL('../data/zones/ningshou.json',import.meta.url))),item=data.items.find(i=>i.name==='宁寿宫'),z=new ZoneBase(library(),data);try{const{f}=z.buildHall(item);const invented=[];f.traverse(o=>{if(o.isMesh&&/kang|stove|bed|throne/i.test(o.userData.role??o.name))invented.push(o.name||o.userData.role);});assert.deepEqual(invented,[],'no removed historical kang, unlocated stove or invented royal furniture');}finally{z.kit.dispose(z.kit.root);}
});
