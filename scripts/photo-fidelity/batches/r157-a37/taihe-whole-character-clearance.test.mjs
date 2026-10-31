import test from 'node:test';
import assert from 'node:assert/strict';
import {buildR52World} from '../../../../tests/lib/r52-world.mjs';
import {CharacterWorldAdapter} from '../../../../src/scene/characters/CharacterWorldAdapter.js';
// Actual character-navigation clearance and rendered ground, not an invented
// NPC route/registry edit or a claim of live crowd simulation.
test('Character adapter keeps both Taihe passages supported and clear, rejecting real jambs and excessive body height',async()=>{
 const w=await buildR52World();const adapter=new CharacterWorldAdapter({scene:w.scene,collisionManager:w.cm});
 try{for(const side of['east','west']){
  let p;w.scene.traverse(g=>{p??=g.userData.architecture?.find(a=>a.id===`taihe-${side}-stepped-firewall`);});assert.ok(p);const d=p.passage;
  for(const lane of[-.55,0,.55]){const x=d.centerX+lane,a=[x,d.floorY,p.z-3],b=[x,d.floorY,p.z+3];assert.equal(adapter._blockedSegment(a,b,.4,1.7),null);for(let i=0;i<=24;i++){const point=[x,d.floorY,p.z-3+i*.25],support=adapter.supportAt(point,d.floorY,.01,{renderedOnly:true});assert.equal(support.status,'ready',`${side} lane${lane} station${i}: rendered ground`);}}
  for(const lane of[-.8,.8]){const x=d.centerX+lane;assert.ok(adapter._blockedSegment([x,d.floorY,p.z-3],[x,d.floorY,p.z+3],.4,1.7),'actual jamb blocks outlying character lane');}
  assert.ok(adapter._blockedSegment([d.centerX,d.floorY,p.z-3],[d.centerX,d.floorY,p.z+3],.4,2.5),'actual lintel blocks excessive body height');
 }}finally{adapter.dispose();w.dispose();}
});
