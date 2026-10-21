import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {BUILDING_FIDELITY,buildingFidelityFor,buildingFidelityText,validateBuildingFidelity} from '../src/ui/BuildingFidelity.js';
import {modelFidelityFor} from '../src/ui/ModelFidelity.js';
const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
test('R41 only Chuxiu implementation and NingShou deferred-evidence records change;87 others exact',()=>{
 const old=JSON.parse(readFileSync(new URL('./fixtures/r41-building-ledger-baseline.json',import.meta.url)));let count=0;assert.equal(BUILDING_FIDELITY.buildings.length,89);for(const b of BUILDING_FIDELITY.buildings){assert.ok(old[b.id]);if(['储秀宫','宁寿宫'].includes(b.name))continue;assert.equal(createHash('sha256').update(JSON.stringify(sort(b))).digest('hex'),old[b.id],b.name);count++;}assert.equal(count,87);validateBuildingFidelity(BUILDING_FIDELITY);
});
test('R41 public Chuxiu note distinguishes restored-display textual contours from current inventory',()=>{
 const b=buildingFidelityFor('储秀宫'),text=buildingFidelityText(b).detail;assert.match(text,/1982/);assert.match(text,/不代表2026/);assert.match(text,/拟合/);assert.match(text,/未添加梳妆器物或被褥/);assert.ok(modelFidelityFor('储秀宫').detail.includes(b.publicNote));assert.equal(b.interior.accepted,false);assert.equal(b.exterior.accepted,false);assert.equal(b.validation.visual,'not-verified');assert.equal(b.changes.filter(c=>c.profile==='chuxiu-west-kang-1982-text-fit-v1').length,1);assert.match(b.claims.at(-1).targetState,/不是图11/);
});
test('R41 NingShou removed kang and stove positions stay explicitly unimplemented',()=>{
 const b=buildingFidelityFor('宁寿宫');assert.equal(b.interior.implementation,'generic-placeholder');assert.equal(b.claims.at(-1).implemented,false);assert.match(b.claims.at(-1).text,/拆除/);assert.match(b.publicNote,/当前通用室内仍待核实/);assert.ok(b.interior.unresolved.some(s=>s.includes('坐标')&&s.includes('暂不加入')));assert.equal(b.changes.length,0);
});
