import test from 'node:test';import assert from 'node:assert/strict';
import {buildR52World} from '../../../../tests/lib/r52-world.mjs';
import {CharacterWorldAdapter} from '../../../../src/scene/characters/CharacterWorldAdapter.js';
test('Actual character adapter follows five real Wumen routes and rejects solid/diagonal shortcuts',async()=>{
 const w=await buildR52World(),a=new CharacterWorldAdapter({scene:w.scene,collisionManager:w.cm});let supportCount=0,clearCount=0,negativeCount=0;
 try{
  const Z=-419.6,routes=[...[-14.5,0,14.5].map(x=>[[x,-16],[x,21]]),...[-1,1].map(s=>[[s*38.6,-16.5],[s*48,-16.5],[s*48,21]])];
  for(const route of routes)for(let i=1;i<route.length;i++){
   const p=route[i-1],q=route[i],steps=Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/.5);let previous;
   for(let k=0;k<=steps;k++){const point=[p[0]+(q[0]-p[0])*k/steps,0,Z+p[1]+(q[1]-p[1])*k/steps];const support=a.supportAt(point,0,.04,{renderedOnly:true});assert.equal(support.status,'ready',JSON.stringify({point,support}));supportCount++;if(previous){assert.equal(a._blockedSegment(previous,point,.3,1.7),null,JSON.stringify({previous,point}));clearCount++;}previous=point;}
  }
  for(const s of[-1,1]){assert.ok(a._blockedSegment([s*38.6,0,Z-16.5],[s*48,0,Z+21],.3,1.7),'no diagonal shortcut through L-wall');negativeCount++;assert.ok(a._blockedSegment([s*38.6,0,Z-25],[s*48,0,Z-25],.3,1.7),'inner wing wall outside side mouth');negativeCount++;}
  for(const x of[-30,-8,8,30]){assert.ok(a._blockedSegment([x,0,Z-15],[x,0,Z+20],.3,1.7),'solid main base between passages');negativeCount++;}
  console.log(JSON.stringify({supportCount,clearCount,negativeCount,scope:'Actual rendered-ground adapter probes, not live crowd/GPU acceptance'}));
 }finally{a.dispose();w.dispose();}
});
