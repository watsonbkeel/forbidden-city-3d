import {currentBaoheNorthRoute}from './lib/r16-baohe-retention.mjs';
import test from 'node:test';import assert from 'node:assert/strict';
import {buildWorld} from './lib/world.mjs';
import * as T from 'three';
import delta from './fixtures/r12-qianqing-route-delta.json' with {type:'json'};
import {withLegacyQianqingApproach} from './lib/r12-qianqing-route-retention.mjs';
const W=await buildWorld();
test('exact one descriptor version restoration rejects modified points and retains route coverage',()=>{
 assert.equal(delta.delta.length,1);const d=delta.delta[0];assert.deepEqual(withLegacyQianqingApproach([d.after]),[d.before]);
 for(const pts of [d.after.pts.slice(1),d.after.pts.toReversed(),d.after.pts.map((p,i)=>i===2?[p[0]+.1,p[1]]:p)])assert.throws(()=>withLegacyQianqingApproach([{...d.after,pts}]));
 assert.deepEqual(d.after.pts[0],d.before.pts[0]);assert.deepEqual(d.after.pts.at(-1),d.before.pts.at(-1));
});
for(const fps of [60,10])for(const speed of [5,12])for(const reverse of [false,true])test(`whole-world outer-stair route ${fps}/${speed}/${reverse}`,()=>{
 const current=currentBaoheNorthRoute(delta.delta[0].after);const points=reverse?current.pts.toReversed():current.pts;
 let feet=W.cm.getGroundHeight(...points[0],0,999),p=new T.Vector3(points[0][0],feet+1.7,points[0][1]);
 for(const [x,z]of points.slice(1)){let n=0,max=Math.ceil(Math.hypot(x-p.x,z-p.z)/(speed/fps))+10;
  while(Math.hypot(x-p.x,z-p.z)>1e-5&&n++<max){const d=Math.hypot(x-p.x,z-p.z),step=Math.min(speed/fps,d);p=W.cm.getValidPosition(p,new T.Vector3(p.x+(x-p.x)*step/d,p.y,p.z+(z-p.z)*step/d),.5,p.y-1.7);assert.equal(W.cm.checkCollision(p,.5),false);}
  assert.ok(Math.hypot(x-p.x,z-p.z)<1e-5,JSON.stringify({goal:[x,z],at:p.toArray()}));
 }
});
