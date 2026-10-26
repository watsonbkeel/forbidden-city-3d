import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {baoheFirewallWorld} from './r92-joint/fixture.mjs';
import {CollisionManager} from '../src/utils/Collision.js';
const W=baoheFirewallWorld(), cm=new CollisionManager();cm.rivers=[];cm.addColliders(W.builder.colliders);cm.addWalkables(W.builder.walkables);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-5,`${a} != ${b}`);
test('R92 actual asymmetric Baohe east tiers provide source-registered support rather than generic margin4',()=>{
 for(const [x,y]of[[-50,8],[-56,16/3],[-62,8/3],[-65.5,0]])for(const z of[110,120,126,150])near(cm.getGroundHeight(x,z,8,.6),y);
});
test('R92 retains actual west supports, north approach identities, and all old rect anchors',()=>{
 const baseline=JSON.parse(fs.readFileSync(new URL('../reports/r92-joint/baseline-retention.json',import.meta.url)));
 assert.deepEqual(W.builder.baoheNorthTiers,baseline.north);assert.deepEqual(W.builderData.rects,baseline.rects);
 assert.deepEqual(JSON.parse(JSON.stringify(W.builder.colliders.filter(c=>c.min.x>0))),baseline.westColliders);
 for(const p of baseline.westGround)near(cm.getGroundHeight(p.x,p.z,8,.6),p.y);
});
test('R92 wall17 is shortened outside new lower edge without moving gate or gallery',()=>{
 const a=W.axis.items;near(a[17].from[0],-64.97666666666667);assert.deepEqual(a[17].to,[-106.47,123]);assert.deepEqual(a[17].gaps,[{at:-76.4,gate:'后左门'}]);assert.equal(a[16].x,-76.4);assert.equal(a[31].from[0],-103.37);assert.equal(a[19].from[0],40.5);
});
test('R92 east extension has no retained vertical rail at the old east edge',()=>{
 for(const tier of[0,1,2]){
  const y=(tier+1)*8/3,old=-28.85-(2-tier)*5.466666666666667;
  const blocking=W.builder.colliders.filter(c=>c.min.x<old+.1&&c.max.x>old-.1&&c.min.z<110&&c.max.z>110&&c.max.y>y+.2&&c.min.y<y+1.5);
  assert.equal(blocking.length,0,`tier${tier+1} interior rail`);
 }
});
