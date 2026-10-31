import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {assertTaihemenFacilitiesCInWorld} from '../../../lib/r157-taihemen-facilities-c-check.mjs';
import {buildR52World} from '../../../lib/r52-world.mjs';
import {assertTaihemenNameboardFrameInWorld} from '../../../lib/r157-taihemen-nameboard-world-check.mjs';
test('Uninjected cumulative World retains Wenhua/Donghua/Wenyuan hooks and explicitly partial Taihemen frame without ceiling hypothesis',async()=>{
 const W=await buildR52World();try{
  const report=assertTaihemenNameboardFrameInWorld(W);assert.equal(report.wholeFrameGroundVisible,false);assert.equal(report.groundFrameSightlines.filter(x=>x.visible).length,5);assert.match(report.status,/PARTIAL/);
  const records=[];W.scene.traverse(g=>records.push(...(g.userData.architecture??[])));
  const own=id=>{const a=records.filter(r=>r.id===id);assert.equal(a.length,1,id);return a[0];};
  assert.equal(own('outer-east/wenhua-front').wenhuaCentralDoors.leaves,6);assert.equal(own('city-gates/donghua').donghuaExteriorEnvelope.visibleWindowGroups,5);
  assert.equal(W.cm.colliders.filter(c=>c.triangleSupport?.id.startsWith('wenyuan-pond-rails:')).length,34);const instruments=W.cm.colliders.filter(c=>c.triangleSupport?.id.startsWith('taihe-terrace-instrument:'));assert.equal(instruments.length,29);const facilities=assertTaihemenFacilitiesCInWorld(W,{production:true}),observed=W.cm.colliders.filter(c=>c.mesh.taihemenObservedSource==='axis/taihemen-observed-approach');assert.equal(observed.length,77);assert.equal(facilities.accepted,false);assert.equal(W.cm.colliders.length-instruments.length+2-observed.length+68,30837,'original total after exact instrument 2->29 and observed approach 68->77 source-owned changes');assert.equal(W.cm.colliders.length,30873);
  assert.equal(records.filter(r=>r.id==='axis/taihemen-south-ceiling').length,0);const frame=own('axis/taihemen-nameboard-frame');assert.ok(frame);
  const summary={scope:'ACTUAL_WHOLE_WORLD_UNINJECTED_ALL_FOUR_INTEGRATIONS',colliders:W.cm.colliders.length,wenyuanOwners:34,taihemen:report,wholeObjectAccepted:false};if(process.env.R158_CUMULATIVE_WORLD_OUT)fs.writeFileSync(process.env.R158_CUMULATIVE_WORLD_OUT,JSON.stringify(summary,null,2));console.log(JSON.stringify(summary));
 }finally{W.dispose();}
});
