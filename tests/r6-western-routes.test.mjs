import test from 'node:test';import assert from 'node:assert/strict';
import {buildWorld,loadZoneJsons,walkStraight} from './lib/world.mjs';
import {buildAutoRoutes} from './lib/auto-routes.mjs';
import {withLegacyWesternCourtsForVersionComparison} from './lib/r6-western-route-compat.mjs';
import {createHash} from 'node:crypto';
import sourceDelta from './fixtures/west-six-current-passages.json' with {type:'json'};
import delta from './fixtures/r6-western-route-delta.json' with {type:'json'};
test('historical restoration accepts only the two exact changed descriptors',()=>{
 const other={name:'unrelated',pts:[[1,2],[3,4]]};
 assert.equal(delta.delta.length,2);
 assert.deepEqual(withLegacyWesternCourtsForVersionComparison([...delta.delta.map(d=>d.after),other]),[...delta.delta.map(d=>d.before),other]);
 for(const d of delta.delta)for(const changed of [{...d.after,pts:[]},{...d.after,gate:d.before.gate},{...d.after,plan:['changed']}])assert.throws(()=>withLegacyWesternCourtsForVersionComparison([changed]));
 assert.deepEqual(withLegacyWesternCourtsForVersionComparison([other]),[other]);
});
test('exactly two generated routes change and current routes walk continuously in both directions',async()=>{
 const W=await buildWorld(),routes=buildAutoRoutes(W,W.zones.map(z=>z.json));
 const prior=structuredClone(W.zones.find(z=>z.json.id==='west-six').json);
 assert.deepEqual(prior.items.filter(i=>i.repairRole==='connected-court-perimeter'),sourceDelta.addedPerimeterWalls);
 prior.items=prior.items.filter(i=>i.repairRole!=='connected-court-perimeter');
 for(const d of sourceDelta.changes){assert.deepEqual(prior.items[d.index],d.after);prior.items[d.index]=structuredClone(d.before);}
 assert.equal(createHash('sha256').update(JSON.stringify(prior)).digest('hex'),sourceDelta.baselineJSONSHA256);
 const oldW=await buildWorld({zones:loadZoneJsons().map(z=>z.json.id==='west-six'?{...z,json:prior}:z)});
 const oldRoutes=buildAutoRoutes(oldW,oldW.zones.map(z=>z.json));
 assert.equal(routes.length,59);assert.equal(oldRoutes.length,59);
 assert.deepEqual(withLegacyWesternCourtsForVersionComparison(routes),oldRoutes);
 for(const d of delta.delta){
  const route=routes.find(r=>r.name===d.after.name);assert.deepEqual(route,d.after);
  assert.ok(!routes.some(r=>r.name===d.before.name),'demolished gate is not a physical route entrance');
  let feet=0;for(let i=1;i<route.pts.length;i++){
   const r=walkStraight(W,route.pts[i-1],route.pts[i],{feet0:feet});
   assert.ok(r.reached>=r.total-.1,`${route.name} leg ${i}: ${JSON.stringify(r)}`);feet=r.feet;
  }
  // These automatic approach descriptors start on the connected rear hall's
  // 0.45 m apron. Full front/rear through-hall routes are tested separately.
  assert.equal(feet,.45);
 }
});
