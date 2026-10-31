import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {assertTaihemenFacilitiesCInWorld} from '../../../lib/r157-taihemen-facilities-c-check.mjs';
import {buildR52World} from '../../../lib/r52-world.mjs';
import {assertArrowCentralNameboardRemovedInWorld} from '../../../lib/r158-arrow-nameboard-world-check.mjs';
import {assertTaihemenNameboardFrameInWorld} from '../../../lib/r157-taihemen-nameboard-world-check.mjs';
test('Uninjected cumulative World consumes actual Arrow lattice nameboard removal and retained knees with earlier four integrations',async()=>{
 const W=await buildR52World();try{
  // The one nameboard consumer also executes the real lattice and knee consumers;
  // do not rebuild W or count their nested probes as separate completed objects.
  const arrow=assertArrowCentralNameboardRemovedInWorld(W),taihemen=assertTaihemenNameboardFrameInWorld(W);
  assert.equal(arrow.rayChecks,9);assert.equal(arrow.retainedLatticeTriangles,1728);assert.equal(arrow.retainedInfillTriangles,96);assert.equal(arrow.retainedKneeTriangles,88);assert.equal(arrow.wholeObjectAccepted,false);
  assert.equal(taihemen.wholeFrameGroundVisible,false);assert.equal(taihemen.groundFrameSightlines.filter(x=>x.visible).length,5);assert.match(taihemen.status,/PARTIAL/);
  const records=[];W.scene.traverse(g=>records.push(...(g.userData.architecture??[])));const own=id=>{const a=records.filter(r=>r.id===id);assert.equal(a.length,1,id);return a[0];};
  assert.equal(own('outer-east/wenhua-front').wenhuaCentralDoors.leaves,6);assert.equal(own('city-gates/donghua').donghuaExteriorEnvelope.visibleWindowGroups,5);
  assert.equal(W.cm.colliders.filter(c=>c.triangleSupport?.id.startsWith('wenyuan-pond-rails:')).length,34);const instruments=W.cm.colliders.filter(c=>c.triangleSupport?.id.startsWith('taihe-terrace-instrument:'));assert.equal(instruments.length,29);const facilities=assertTaihemenFacilitiesCInWorld(W,{production:true}),observed=W.cm.colliders.filter(c=>c.mesh.taihemenObservedSource==='axis/taihemen-observed-approach');assert.equal(observed.length,77);assert.equal(facilities.accepted,false);assert.equal(W.cm.colliders.length-instruments.length+2-observed.length+68,30837,'original total after exact instrument 2->29 and observed approach 68->77 source-owned changes');assert.equal(W.cm.colliders.length,30873);
  assert.equal(records.filter(r=>r.id==='axis/taihemen-south-ceiling').length,0);assert.ok(own('axis/taihemen-nameboard-frame'));
  const summary={scope:'ONE_ACTUAL_WHOLE_WORLD_UNINJECTED_FIVE_INTEGRATIONS',colliders:W.cm.colliders.length,arrow,taihemen,wholeObjectAccepted:false};
  if(process.env.R158_ARROW_WORLD_OUT){assert.equal(fs.existsSync(process.env.R158_ARROW_WORLD_OUT),false,'No evidence overwrite');fs.writeFileSync(process.env.R158_ARROW_WORLD_OUT,JSON.stringify(summary,null,2)+'\n');}console.log(JSON.stringify(summary));
 }finally{W.dispose();}
});
