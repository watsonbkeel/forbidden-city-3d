import test from 'node:test';import assert from 'node:assert/strict';import {buildR52World} from './lib/r52-world.mjs';import {NIGHT_BEDS,BED_TOP} from '../src/scene/characters/NightBeds.js';
test('thirty beds remain unique across three actual zone unload/rebuild cycles and release owned resources',async()=>{
 const W=await buildR52World({loadAll:true});try{for(const zone of[...new Set(NIGHT_BEDS.map(b=>b.zoneRef))])for(let cycle=0;cycle<3;cycle++){
  const beds=NIGHT_BEDS.filter(b=>b.zoneRef===zone),loaded=W.zoneManager.loaded.get(zone);assert.ok(loaded);
  for(const b of beds){const matches=W.cm.colliders.filter(c=>c.tag===zone&&Math.abs(c.box.min.x-(b.x-b.width/2))<1e-6&&Math.abs(c.box.max.x-(b.x+b.width/2))<1e-6&&Math.abs(c.box.min.z-(b.z-b.depth/2))<1e-6&&Math.abs(c.box.max.y-b.floorY-BED_TOP)<1e-6);assert.equal(matches.length,1,b.id);}
  const materials=loaded.builder.kit.owned.filter(m=>m.name?.startsWith('r72-gameplay-bed-'));assert.equal(materials.length,3);const counts=new Map(materials.map(m=>[m,0]));for(const m of materials)m.addEventListener('dispose',()=>counts.set(m,counts.get(m)+1));
  W.zoneManager.unloadZone(zone);assert.ok([...counts.values()].every(v=>v===1));assert.ok(!W.cm.colliders.some(c=>c.tag===zone));assert.ok(!W.cm.walkables.some(c=>c.tag===zone));W.zoneManager.loadZone(zone);
 }}finally{W.dispose();}
});
