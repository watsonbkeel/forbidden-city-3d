import test from 'node:test';import assert from 'node:assert/strict';import {readyScene} from '../../scripts/r123/ready-zone.mjs';import {resolveChuxiuSharedRest} from '../../src/scene/characters/SharedRestSlots.js';
test('real ready west-six builds bounded rear pair and rebinds both R118 slots to the shifted finished bed',async()=>{
 const h=await readyScene();try{
  assert.equal(h.data.colliders.filter(b=>b.furnitureMotionScope?.kind==='chuxiu-rear-access').length,2,'two actual slab-owned bounded entry scopes');assert.deepEqual(h.data.colliders.filter(b=>b.chuxiuRetainedPlatform).map(b=>b.max.y),[Math.fround(.6),Math.fround(.61)],'retained rendered platform F32 source');assert.equal(h.paint.requests,43);assert.deepEqual(h.paint.errors,[]);
  const rest=resolveChuxiuSharedRest(h.data.group);assert.equal(rest.status,'ready',rest.reason);assert.equal(rest.bounds.minZ,Math.fround(433.05));assert.equal(rest.bounds.maxZ,Math.fround(435.75));assert.deepEqual(rest.slots.map(s=>s.position),[[106.19,Math.fround(1.05),434.4],[105.09,Math.fround(1.05),434.4]]);
  const pair=h.frames.filter(f=>f.item.structure==='chuxiu-rear-wing');assert.equal(pair.length,2);
  for(const r of pair){const east=r.item.rearWing==='east',b=r.renderBounds;assert.equal(r.item.z,440.85);assert.equal(r.item.w,8.2);assert.ok(b[0]>=(east?74.15:109.7)&&b[3]<=(east?79.9:115.45),'full X envelope '+b);assert.ok(b[2]>=436.30&&b[5]<=445.40,'full Z envelope '+b);assert.equal(r.item.interior,'empty');assert.equal(r.item.plaque,false);assert.ok(r.colliders.some(c=>c.sourceId===`chuxiu-rear-${r.item.rearWing}-threshold`));assert.equal(r.meshes.filter(m=>m.role==='chuxiu-rear-sill-window').length,2);}
  const frame=h.data.group.userData.architecture.find(a=>a.id==='west-six/chuxiu-household');frame.z+=5;assert.equal(resolveChuxiuSharedRest(h.data.group).status,'error');frame.z-=5;assert.equal(resolveChuxiuSharedRest(h.data.group).status,'ready');
 }finally{h.dispose()}
});
