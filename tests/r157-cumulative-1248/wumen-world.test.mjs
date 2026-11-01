import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{buildR52World}from'../lib/r52-world.mjs';import{replayKunning}from'../lib/kunning-walk.mjs';import{withBoundedQaMocks}from'../lib/bounded-qa-clock.mjs';
test('installed World permits the sixteen real Wumen south-deck routes, not courtyard or above-normal-jump escape',async t=>{const w=await buildR52World(),rows=[];try{
 for(const side of[-1,1])for(const fps of[10,60])for(const sprint of[false,true])for(const reverse of[false,true]){const p=[[side*62,-406.1],[side*62,-514.6],[side*42,-514.6]];rows.push({side,fps,sprint,reverse,...withBoundedQaMocks(t,c=>replayKunning(c,w,reverse?[...p].reverse():p,{fps,sprint,startFeet:12.3,recordFrames:true}))});}
 fs.writeFileSync(process.env.EVIDENCE_OUT??'/tmp/wumen-cumulative-world.json',JSON.stringify({scope:'ACTUAL_FULL_WORLD_NATIVE_CONTROLLER',rows}));for(const r of rows){assert.equal(r.arrived,true,JSON.stringify({side:r.side,fps:r.fps,sprint:r.sprint,reverse:r.reverse,end:r.end}));assert.ok(r.minFeet>=12.22);}
 for(const[x,z,feet]of[[62,-505,0],[62,-505,14.3],[0,-505,12.3],[64,-505,12.3],[62,-516,12.3]])assert.equal(w.cm.checkBoundary(new w.THREE.Vector3(x,feet+1.7,z),.5),false);
 assert.equal(w.cm.checkBoundary(new w.THREE.Vector3(62,13+1.7,-505),.5),true,'normal jump height over real live deck remains allowed');
 assert.equal(w.cm.checkCollision(new w.THREE.Vector3(51,14,-504),.5),true,'closed pavilion not opened');
 }finally{w.dispose();}});
