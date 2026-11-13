import assert from 'node:assert/strict';import fs from 'node:fs';import{buildWorld}from'../lib/world.mjs';
// Actual complete east-six+garden, production material/cache API with inert CPU textures.
// No image load/decode, normal-map, GPU, visual or full-gate acceptance.
const zones=['east-six','garden'].map(id=>({json:JSON.parse(fs.readFileSync(`data/zones/${id}.json`))}));
const W=await buildWorld({zones,statics:false,realMaterials:true});assert.deepEqual(W.zones.map(x=>x.json.id),['east-six','garden']);assert.ok(W.cm.colliders.length>2829);assert.ok(W.cm.walkables.length>=151);
const slab=W.cm.walkables.filter(x=>x.tag==='east-six'&&x.type==='box'&&Math.abs(x.box.min.x-(-145.29999995231628))<1e-8&&Math.abs(x.box.max.x-(-138.70000004768372))<1e-8&&Math.abs(x.box.min.z-464.35000002384186)<1e-8&&Math.abs(x.box.max.z-467.64999997615814)<1e-8&&Math.abs(x.box.max.y-.10000000074505806)<1e-8);assert.equal(slab.length,1);
console.log(JSON.stringify({status:'PASS',scope:'ACTUAL_COMPLETE_EAST_SIX_GARDEN_REAL_OFFLINE_MATERIALS_CPU_NO_RENDER',zones:W.zones.map(x=>x.json.id),colliders:W.cm.colliders.length,walkables:W.cm.walkables.length,slabCount:slab.length}));
