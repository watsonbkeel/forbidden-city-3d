import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{pavilionGeometry}from'../../src/scene/palace/special/PavilionProfiles.js';
import{buildR52World}from'../lib/r52-world.mjs';import{replayKunning}from'../lib/kunning-walk.mjs';import{withBoundedQaMocks}from'../lib/bounded-qa-clock.mjs';
test('own Zuoyi three real portals and Tiren original entrance in actual World',async t=>{
 const w=await buildR52World(),rows=[];
 try{
  for(const lane of[-2.85,0,2.85])for(const fps of[10,60])for(const sprint of[false,true])for(const reverse of[false,true]){
   const z=-53.1+lane;const points=reverse?[[-90,z],[-123,z],[-90,z]]:[[-123,z],[-90,z],[-123,z]];
   const r={lane,fps,sprint,reverse,...withBoundedQaMocks(t,c=>replayKunning(c,w,points,{fps,sprint,startFeet:0,recordFrames:true}))};rows.push(r);
  }
  for(const fps of[10,60])for(const sprint of[false,true]){
   const points=[[-104.47,-55.95],[-104.47,-50.25],[-104.47,-55.95]];
   rows.push({name:'shared-hall',fps,sprint,...withBoundedQaMocks(t,c=>replayKunning(c,w,points,{fps,sprint,startFeet:1.6,recordFrames:true}))});
   const item=w.zones.find(z=>z.json.id==='axis-courts').json.items.find(i=>i.name==='体仁阁');const g=pavilionGeometry(item),p=g.approaches.frontLeft.worldPoints.map(p=>[p.x,p.z]);
   rows.push({name:'retained-tiren-front',fps,sprint,...withBoundedQaMocks(t,c=>replayKunning(c,w,[...p,...p.slice(0,-1).reverse()],{fps,sprint,startFeet:g.approaches.frontLeft.worldPoints[0].y,recordFrames:true}))});
  }
  fs.writeFileSync(process.env.EVIDENCE_OUT??'/tmp/zuoyi-world.json',JSON.stringify({rows}));
  for(const r of rows)assert.equal(r.arrived,r.expectedArrived??true,JSON.stringify({name:r.name,lane:r.lane,fps:r.fps,sprint:r.sprint,reverse:r.reverse,end:r.end}));
  for(const dz of[-5.25,5.25])assert.equal(w.cm.checkCollision(new w.THREE.Vector3(-106.47,3.3,-53.1+dz),.5),true,'closed end room remains solid');
 }finally{w.dispose();}
});
