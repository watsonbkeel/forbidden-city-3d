import{createActualLibrary}from'./library.mjs';
import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{buildR52World}from'../lib/r52-world.mjs';import{replayKunning}from'../lib/kunning-walk.mjs';import{withBoundedQaMocks}from'../lib/bounded-qa-clock.mjs';
// Six-bay retained hall: x=-186.5 is a visible column, not a doorway.
// Preserve the original four straight-to-column failures as historical observations.
test('Wenyuan bridge reaches its actual adjacent open hall bay and returns, while visible column/closed bay stay solid',async t=>{
 const w=await buildR52World({createLibrary:createActualLibrary}),rows=[];
  const records=[],materials=new Set();w.scene.traverse(o=>{for(const r of [o.userData.structure,...(o.userData.architecture??[])])if(r)records.push(r);if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m.name);});
  assert.ok(records.some(r=>r.arrowSouthHeadBands),'ordinary ZoneBase must install Arrow finalizer without fallback');
  for(const n of ['arrow_south_head_grey_blue_fit','arrow_south_head_deep_blue_fit'])assert.ok(materials.has(n),n);
  assert.ok(records.some(r=>r.id==='wenyuan-pavilion'&&r.southVeranda?.setback===1.8));
  assert.ok(records.some(r=>r.id==='south-gate:wenhua'&&r.wenhuaSouthWindow?.majorDivisions.fineGridModeled));
  assert.equal(w.cm.colliders.filter(c=>c.triangleSupport?.id.startsWith('wenyuan-south-veranda:')).length,18);
 try{
  const item=w.zones.find(z=>z.json.id==='outer-east').json.items.find(i=>i.structure==='wenyuan-pavilion');assert.equal(item.bays,6);assert.equal(item.x,-186.5);
  const entryX=item.x-item.w/item.bays/2;assert.equal(entryX,-189.875);
  for(const fps of[10,60])for(const sprint of[false,true]){
   const points=[[-186.5,-157.6],[-186.5,-142.8],[entryX,-142.8],[entryX,-139],[entryX,-142.8],[-186.5,-142.8],[-186.5,-157.6]];
   const row={fps,sprint,...withBoundedQaMocks(t,c=>replayKunning(c,w,points,{fps,sprint,startFeet:0,recordFrames:true}))};rows.push(row);assert.equal(row.arrived,true,'actual visible open bay must be reachable');
  }
  const probe=(x,z)=>{const pos=new w.THREE.Vector3(x,1.72,z);return{waterAllowed:w.cm.checkRiverCrossing(pos,.5,null,.02),body:w.cm.checkCollision(pos,.5)}};
  assert.deepEqual(probe(-186.5,-142.8),{waterAllowed:true,body:false});
  assert.equal(probe(-186.5,-142.5).body,true,'central actual post is not a missing opening');
  assert.equal(probe(-183.125,-142.5).body,false,'old thick proxy location is now actual clear porch');
  assert.equal(probe(-183.125,-141.75).body,true,'actual thin visible rail remains body blocking');
  const out=process.env.EVIDENCE_OUT??'/tmp/r157-wenyuan-real-entry.json';fs.writeFileSync(out,JSON.stringify({scope:'CUMULATIVE_ORDINARY_WORLD_REAL_MATERIAL_API_INERT_PIXELS_NO_FALLBACK_NOT_GPU',rows,negativeChecks:2,clearanceChecks:1}));
 }finally{w.dispose();}
});
