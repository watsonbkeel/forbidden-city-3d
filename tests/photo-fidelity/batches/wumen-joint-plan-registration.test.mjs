import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const url=new URL('../../../src/scene/palace/special/WumenPlanRegistration.js',import.meta.url);
const source=JSON.parse(fs.readFileSync(new URL('../../../docs/photo-fidelity/batches/R157-A37/wumen-integration-evidence/WUMEN-JOINT-PLAN-REGISTRATION-20261031.json',import.meta.url)));
const module=async()=>{assert.equal(fs.existsSync(url),true,'Source-only joint plan registration module must exist, without activating geometry');return import(url);};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,JSON.stringify({actual:a,expected:b}));
test('One common own-plan transform maps both pages and the independent main25m axis span',async()=>{
 const {wumenPlanPoint,WUMEN_PLAN_REGISTRATION:p}=await module();assert.equal(p.sourcePDFsha256,source.sourcePDFsha256);assert.deepEqual(p.worldAnchor,[0,0,-419.6]);assert.equal(p.worldAnchorStatus,'RETAINED_RUNTIME_WHOLE_U_BBOX_NOT_VERIFIED_MAIN_COLUMN_ORIGIN');
 assert.deepEqual(wumenPlanPoint(152,667,1121),[-30.025,12.5]);assert.deepEqual(wumenPlanPoint(153,2060,1498.5),[30.025,-12.5]);
 close(p.metersPerPixel,25/377.5);for(const q of source.pavilions){const got=p.pavilions.find(x=>x.id===q.id);assert.ok(got);got.centerLocalXZ.forEach((x,i)=>close(x,q.nominalLocalCenterXZ[i]));got.axisDimensionsXZ.forEach((x,i)=>close(x,q.axisDimensionsXZ[i]));assert.deepEqual(got.pixelU,q.outerColumnPixelU);assert.deepEqual(got.pixelV,q.outerColumnPixelV);}
});
test('Both registered13-bay wings reference four pavilion-owned endpoint columns and own only24 interior columns',async()=>{
 const {WUMEN_PLAN_REGISTRATION:p}=await module();assert.equal(p.wings.length,2);for(const wing of p.wings){const src=source.wings.find(w=>w.id===wing.id);assert.ok(src);assert.equal(wing.axesZ.length,14);assert.equal(wing.bays.length,13);assert.equal(wing.columns.length,28);assert.equal(new Set(wing.columns.map(c=>c.id)).size,28);assert.equal(wing.columns.filter(c=>c.ownerId===wing.id).length,24);for(const c of wing.columns.filter(c=>c.ownerId!==wing.id)){const owner=p.pavilions.find(o=>o.id===c.ownerId);assert.ok(owner);assert.ok(owner.cornerColumns.some(q=>q.id===c.id&&q.localXZ.every((v,i)=>v===c.localXZ[i])));}
 wing.axesZ.forEach((z,i)=>close(z,src.longitudinalColumnLocalZ[i]));wing.bays.forEach((b,i)=>close(b.length,src.thirteenBayLengths[i]));assert.ok(wing.bays[0].length>5.3&&wing.bays[12].length>5.3,'source end bays are not13 identical subdivisions');}
});
test('Registration rejects foreign pages and nonfinite/out-of-sheet pixels rather than silently clamping or mirroring',async()=>{
 const {wumenPlanPoint}=await module();for(const args of[[151,667,1121],[154,667,1121],[152,NaN,1121],[153,2060,Infinity],[152,-1,0],[153,2305,0],[152,1,3001]])assert.throws(()=>wumenPlanPoint(...args),/page|pixel|finite/i);
});
test('Registration is deeply frozen, retains evidence limits, and is not dispatched into the playable current world',async()=>{
 const {WUMEN_PLAN_REGISTRATION:p}=await module();const check=o=>{if(o&&typeof o==='object'){assert.equal(Object.isFrozen(o),true);Object.values(o).forEach(check);}};check(p);assert.equal(p.runtimeEnabled,false);assert.equal(p.lowerEnvelopeStatus,'ENGINEERING_SEARCH_NOT_MEASURED_OR_ENABLED');assert.equal(p.queGateStatus,'INDEPENDENT_GROUND_BUILDINGS_ANCHOR_PROVENANCE_UNRESOLVED');assert.equal(p.currentSouthBoundary,-500);assert.equal(p.sourceIsLowerTunnelPlan,false);
 const builder=fs.readFileSync(new URL('../../../src/scene/PalaceBuilder.js',import.meta.url),'utf8');assert.equal(builder.includes('WumenPlanRegistration'),false);assert.ok(p.pendingInterfaces.includes('que-gate-metre-registration'));assert.ok(p.pendingInterfaces.includes('joint-lower-camera-and-envelope'));
});
