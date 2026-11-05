import{actualFixture}from'./actual-fixture.mjs';
import{replaceGuhuaRoof}from'../../src/scene/palace/special/GuhuaRolledRoof.js';
import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{CourtKit}from'../../src/scene/palace/kit.js';import{createActualLibrary}from'../r158-cumulative-1600/library.mjs';import{buildGuhuaPavilion}from'../../src/scene/palace/special/GuhuaPavilion.js';import{item,beforeAPI,roof,capture,hash,meshes,sig}from'./fixture.mjs';
const base=JSON.parse(fs.readFileSync(new URL('./baseline-actual.json',import.meta.url)));
test('real TextureLibrary roof naming/UV/ownership path preserves every old non-target and physical record exactly',()=>{const a=actualFixture(true),b=actualFixture();try{assert.equal(capture(a).nonTargetHash,base.capture.nonTargetHash);assert.equal(capture(b).nonTargetHash,base.capture.nonTargetHash);assert.deepEqual(capture(b).records,base.capture.records);for(let i=0;i<2;i++){const m=roof(b.f).children.find(m=>m.name===base.geometry[i].name);assert.ok(m);assert.equal(hash(sig(m)),hash(base.capture.roof[i]))}for(const m of meshes(roof(b.f)).filter(m=>m.material?.name.includes('roof_tile_')))assert.ok(m.material.map,'borrow actual texture without mutating or disposing it')}finally{a.dispose();b.dispose()}});

const {loadProfile}=await import('./load-profiles.mjs');
const uvProfiles=JSON.parse(fs.readFileSync(new URL('./baseline-uv-profiles.json',import.meta.url)));
test('real TextureLibrary.load HD/SD and manifest/image/normal fallback preserve exact public-base geometry, borrowed maps and ownership',async()=>{
 for(const mode of['hd','sd','manifest-fallback','hd-band-fallback','sd-band-fallback','all-fallback','sd-no-normal']){
  const lib=await loadProfile(mode),a=new CourtKit(lib,'ningshou'),b=new CourtKit(lib,'ningshou'),released=new Map();
  try{const x=beforeAPI.buildGuhuaPavilion(a,item),y=buildGuhuaPavilion(b,item);a.root.updateMatrixWorld(true);b.root.updateMatrixWorld(true);const old=roof(x.f),next=roof(y.f),profile=uvProfiles.profiles.find(p=>p.mode===mode);
   assert.equal(hash(old.children.map(sig)),profile.roofSignature,mode+' frozen complete UV/position/normal/topology');
   assert.equal(capture({kit:b,...y}).nonTargetHash,capture({kit:a,...x}).nonTargetHash,mode);assert.deepEqual(capture({kit:b,...y}).records,profile.physical,mode);
   for(const kept of old.children.slice(0,2)){const m=next.children.find(m=>m.name===kept.name);assert.equal(hash(sig(m)),hash(sig(kept)),mode)}
   const borrowed=lib.material('roof_tile');for(const m of meshes(next).filter(m=>m.material?.name.includes('roof_tile_'))){assert.equal(m.material.map,borrowed.map);assert.equal(m.material.normalMap,borrowed.normalMap)}
   assert.equal(Boolean(borrowed.normalMap),!['manifest-fallback','all-fallback','sd-no-normal'].includes(mode),mode+' real missing normals');
   for(const o of [...lib.materials.values(),...lib.colors.values(),...lib.normals.values()]){released.set(o,0);o.addEventListener('dispose',()=>released.set(o,released.get(o)+1))}
   assert.ok(next.userData.guhuaRolledRoof);
  }finally{a.dispose(a.root);b.dispose(b.root);assert.ok([...released.values()].every(n=>n===0),'old and new kit disposal never owns shared texture/material');lib.dispose();assert.ok([...released.values()].every(n=>n===1),'library alone owns shared resources once')}
 }
});
test('production UV families reject single UV/normal/position drift, HD-under-SD and live-parameter mismatch before changing the old target',async()=>{
 for(const kind of['uv','normal','position','wrong-profile','wrong-input']){const lib=await loadProfile('sd'),kit=new CourtKit(lib,'ningshou');let hd;
  try{const b=beforeAPI.buildGuhuaPavilion(kit,item),r=roof(b.f),owned=kit.owned.length;if(['uv','normal','position'].includes(kind)){const a=r.children[0].geometry.attributes[kind];a.setX(0,a.getX(0)+.001)}else if(kind==='wrong-input'){const tile=lib.tileSize.bind(lib);lib.tileSize=k=>k==='roof_tile'?3.01:tile(k)}else{hd=new CourtKit(await loadProfile('hd'),'ningshou');const a=beforeAPI.buildGuhuaPavilion(hd,item),old=r.children[0].geometry;r.children[0].geometry=roof(a.f).children[0].geometry.clone();old.dispose()}
   assert.throws(()=>replaceGuhuaRoof(kit,b.f,item),/Guhua/);assert.equal(roof(b.f),r);assert.equal(kit.owned.length,owned);
  }finally{kit.dispose(kit.root);lib.dispose();if(hd){hd.dispose(hd.root);hd.lib.dispose()}}
 }
});
