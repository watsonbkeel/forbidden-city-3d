import test from 'node:test';
import assert from 'node:assert/strict';
import{readFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{BUILDING_FIDELITY,buildingFidelityFor,buildingFidelityText,validateBuildingFidelity}from'../src/ui/BuildingFidelity.js';
import{modelFidelityFor}from'../src/ui/ModelFidelity.js';
const target=new Set(['景仁宫','钟粹宫','永和宫']);
const sort=v=>Array.isArray(v)?v.map(sort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])):v;
test('R40 only three named-building records change; all86 other source/status records retain R39 bytes canonically',()=>{
 const old=JSON.parse(readFileSync(new URL('./fixtures/r40-building-ledger-baseline.json',import.meta.url)));assert.equal(BUILDING_FIDELITY.buildings.length,89);let count=0;
 for(const b of BUILDING_FIDELITY.buildings){assert.ok(old[b.id]);if(target.has(b.name))continue;const sha=createHash('sha256').update(JSON.stringify(sort(b))).digest('hex');assert.equal(sha,old[b.id],b.name);count++;}assert.equal(count,86);
});
for(const name of target)test(`R40 ${name} live model note distinguishes partial exterior, interior and fitted access`,()=>{
 const record=buildingFidelityFor(name),text=buildingFidelityText(record).detail;assert.match(text,/外观：局部依据官方资料调整/);assert.match(text,/拟合/);assert.equal(record.exterior.accepted,false);assert.equal(record.interior.accepted,false);assert.equal(record.validation.visual,'not-verified');assert.ok(modelFidelityFor(name).detail.includes(record.publicNote));
 if(name==='永和宫'){assert.match(text,/内饰：局部依据官方资料调整/);assert.match(text,/仅用于正殿室内/);assert.match(text,/不做封闭附室/);}else assert.match(text,/内饰：通用示意，布局待核实/);
 if(name==='景仁宫')assert.match(text,/不是|不照搬/);if(name==='钟粹宫')assert.match(text,/不是实测廊深/);
});
test('R40 public-note validation rejects non-text or implied complete-acceptance changes',()=>{
 const data=JSON.parse(JSON.stringify(BUILDING_FIDELITY));data.buildings[0].publicNote={invented:true};assert.throws(()=>validateBuildingFidelity(data),/public note/);delete data.buildings[0].publicNote;data.buildings[0].exterior.accepted=true;assert.throws(()=>validateBuildingFidelity(data),/incomplete/);
});
