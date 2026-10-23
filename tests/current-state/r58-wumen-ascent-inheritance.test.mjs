import test from 'node:test';
import assert from 'node:assert/strict';
import {captureGate} from '../lib/gate-tower-fixture.mjs';
import {ascentObjectRows,ascentPhysicsRows,ascentRetention} from '../lib/wumen-ascent-retention.mjs';

// The old whole-Wumen restoration fixture intentionally remains unchanged.
// R58 adds one named south-canopy group and three marked north-head proxies.
// This successor preserves the ORIGINAL folded-ascent oracle, not a regenerated one.
const c=captureGate(),original=ascentRetention.current;
function exactAscent(){
 assert.deepEqual(ascentObjectRows(c.group.children[27],c.lib),original.objects);
 assert.deepEqual(ascentPhysicsRows(c.builder.colliders.slice(12,12+original.colliderCount),c.builder.walkables),original.physics);
}
test('R58 first-batch Wumen keeps every original folded-ascent object and physical record byte-exact',exactAscent);
test('R58 explicit additions explain old whole-gate child/collider totals without changing the ascent oracle',()=>{
 assert.equal(c.group.children.length,42);
 assert.equal(c.group.children.at(-1).name,'wumen-south-three-canopies');
 assert.equal(c.builder.colliders.length,12+original.colliderCount+52+3);
 assert.equal(c.builder.walkables.length,original.walkableCount);
 const tagged=c.builder.colliders.filter(x=>x.overhead);
 assert.equal(tagged.length,3);assert.deepEqual(tagged,c.builder.colliders.slice(-3));
 assert.deepEqual(tagged.map(x=>x.overhead.sourceId),[-17.5,0,17.5].map(x=>'axis/wumen-north-head/'+x));
 assert.ok(c.builder.colliders.slice(12,12+original.colliderCount).every(x=>!x.overhead));
});
test('original ascent oracle still fails closed on actual geometry or collider mutation',()=>{
 const group=c.group.children[27],y=group.position.y;group.position.y+=.001;
 assert.throws(exactAscent);group.position.y=y;exactAscent();
 const box=c.builder.colliders[12],x=box.min.x;box.min.x+=.001;
 assert.throws(exactAscent);box.min.x=x;exactAscent();
});
