import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{registerHooks}from'node:module';registerHooks({load(u,c,n){if(u.endsWith('.json'))return{format:'module',source:'export default '+fs.readFileSync(new URL(u),'utf8'),shortCircuit:true};return n(u,c)}});
const T=await import('three'),{Environment}=await import('../src/scene/Environment.js'),{PalaceBuilder}=await import('../src/scene/PalaceBuilder.js'),{PALACE_LAYOUT}=await import('../src/scene/Layout.js'),{ZoneBase}=await import('../src/scene/zones/ZoneBase.js'),{library}=await import('./lib/inner-palace-fixture.mjs');
const scene=new T.Scene(),lib=library(),env=new Environment(scene,null,lib);env.setupGround();const b=new PalaceBuilder(scene,lib);b.buildAll(PALACE_LAYOUT);const zone=new ZoneBase(lib,JSON.parse(fs.readFileSync(new URL('../data/zones/axis-courts.json',import.meta.url))));const data=zone.build();scene.add(data.group);scene.updateMatrixWorld(true);
const hits=(x,z)=>new T.Raycaster(new T.Vector3(x,4,z),new T.Vector3(0,-1,0)).intersectObject(scene,true).filter(h=>h.object.isMesh).map(h=>({y:h.point.y,material:h.object.material.name,name:h.object.name}));
test('actual environment and axis-courtyard geometry leave the river open down to its fitted bed',()=>{
 for(const[x,z]of[[19,-310.8],[6.5,-310.8],[-6.5,-310.8],[-21,-310.8],[44,-304],[65,-294]]){
  const h=hits(x,z);assert.ok(h.some(v=>Math.abs(v.y+1.1)<1e-5),'real water surface '+JSON.stringify({x,z,h}));assert.ok(h.some(v=>Math.abs(v.y+2.4)<1e-5&&v.material==='stone_slab'),'real fitted bed '+JSON.stringify({x,z,h}));assert.equal(h.some(v=>v.y> -1.09),false,'no main ground/road/courtyard seals the sampled channel '+JSON.stringify({x,z,h}));
 }
});
test('central road also opens below the bridge: actual sampled hits are bridge, water and lowered bed',()=>{
 const h=hits(0,-310.8);assert.ok(h.some(v=>v.y>.85&&v.material==='marble'));assert.ok(h.some(v=>Math.abs(v.y+1.1)<1e-5));assert.ok(h.some(v=>Math.abs(v.y+2.4)<1e-5));assert.equal(h.some(v=>Math.abs(v.y)<.02),false,'no y=0 ground or .01 road below deck');
});
