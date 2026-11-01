import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{pavilionGeometry}from'../../src/scene/palace/special/PavilionProfiles.js';
import{buildR52World}from'../lib/r52-world.mjs';import{replayKunning}from'../lib/kunning-walk.mjs';import{withBoundedQaMocks}from'../lib/bounded-qa-clock.mjs';
test('fresh Youyi three real portals cross east-west both ways in the unchanged neighbouring World',async t=>{
 const w=await buildR52World(),rows=[];
 try{
  for(const lane of[-2.52,0,2.52])for(const fps of[10,60])for(const sprint of[false,true])for(const reverse of[false,true]){
   const z=-52.8+lane;const points=reverse?[[119.2,z],[102.2,z],[119.2,z]]:[[102.2,z],[119.2,z],[102.2,z]];
   const r={lane,fps,sprint,reverse,...withBoundedQaMocks(t,c=>replayKunning(c,w,points,{fps,sprint,startFeet:0,recordFrames:true}))};rows.push(r);
  }
  for(const fps of[10,60])for(const sprint of[false,true]){
   const points=[[109,-55.32],[109,-50.28],[109,-55.32]];
   rows.push({name:'shared-hall',fps,sprint,...withBoundedQaMocks(t,c=>replayKunning(c,w,points,{fps,sprint,startFeet:.45,recordFrames:true}))});
   const item=w.zones.find(z=>z.json.id==='axis-courts').json.items.find(i=>i.name==='弘义阁');const g=pavilionGeometry(item),p=g.approaches.frontRight.worldPoints.map(p=>[p.x,p.z]);
   rows.push({name:'retained-hongyi-front',fps,sprint,...withBoundedQaMocks(t,c=>replayKunning(c,w,[...p,...p.slice(0,-1).reverse()],{fps,sprint,startFeet:g.approaches.frontRight.worldPoints[0].y,recordFrames:true}))});
  }
  const out=process.env.EVIDENCE_OUT??'/tmp/youyi-world.json';fs.writeFileSync(out,JSON.stringify({source:'fresh b7 implementation',rows}));
  for(const r of rows)assert.equal(r.arrived,true,JSON.stringify({name:r.name,lane:r.lane,fps:r.fps,sprint:r.sprint,reverse:r.reverse,end:r.end}));
  for(const dz of[-5.04,5.04])assert.equal(w.cm.checkCollision(new w.THREE.Vector3(110.7,2.15,-52.8+dz),.5),true,'closed end room remains solid');
 }finally{w.dispose();}
});
