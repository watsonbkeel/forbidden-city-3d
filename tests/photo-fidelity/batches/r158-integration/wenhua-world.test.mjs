import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildR52World} from '../../../lib/r52-world.mjs';
import {replayTerrace,traceTerraceGround} from '../../../lib/terrace-walk.mjs';
import {FirstPersonControls} from '../../../../src/controls/FirstPerson.js';
// No injected helper/loader or direct finalizer: World -> ZoneManager -> ZoneBase.
test('Uninjected whole World admits Wenhua six-leaf side/centre entry and rear connector round trips at10/60Hz',async t=>{
 const W=await buildR52World(),rows=[];try{
  for(const fps of[10,60])for(const offset of[-1.05,0,1.05]){
   const x=-186.4,points=[[x,-213],[x,-209.6],[x+offset,-209.6],[x+offset,-205.5],[x,-205.5],[x+offset,-205.5],[x+offset,-209.6],[x,-209.6],[x,-213]].filter((p,i,a)=>!i||p.some((v,k)=>v!==a[i-1][k]));
   const trace=traceTerraceGround(W.cm,{flights:[]}),placed=t.mock.method(FirstPersonControls.prototype,'setPosition');try{const r=replayTerrace(t,W,points,{fps,sprint:true,recordFrames:true});assert.equal(placed.mock.callCount(),1);assert.ok(r.arrived,JSON.stringify({fps,offset,end:r.end,stuckAt:r.stuckAt}));assert.equal(trace.samples.some(p=>['rescue','unverified'].includes(p.source)),false);rows.push({fps,offset,route:'entry',...r});}finally{placed.mock.restore();trace.restore();}
  }
  for(const fps of[10,60]){
   const x=-186.4,go=[[x,-213],[x,-205.3],[x+11,-205.3],[x+11,-193.3],[x,-193.3],[x,-172],[x+2.3,-172],[x+2.3,-167.5],[x,-167.5]],points=[...go,...go.slice(0,-1).reverse()],trace=traceTerraceGround(W.cm,{flights:[]});try{const r=replayTerrace(t,W,points,{fps,sprint:true,recordFrames:true});assert.ok(r.arrived,JSON.stringify({fps,end:r.end,stuckAt:r.stuckAt}));assert.equal(trace.samples.some(p=>['rescue','unverified'].includes(p.source)),false);rows.push({fps,route:'connector-roundtrip',...r});}finally{trace.restore();}
  }
  if(process.env.R158_WENHUA_WORLD_OUT)fs.writeFileSync(process.env.R158_WENHUA_WORLD_OUT,JSON.stringify(rows));console.log(JSON.stringify({actualWorldRoutes:rows.length,arrivals:rows.filter(r=>r.arrived).length}));
 }finally{W.dispose();}
});
