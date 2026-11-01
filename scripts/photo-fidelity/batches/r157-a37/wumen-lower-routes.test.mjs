import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildR52World} from '../../../../tests/lib/r52-world.mjs';
import {replayKunning} from '../../../../tests/lib/kunning-walk.mjs';
import {wumenAscentGeometry} from '../../../../src/scene/palace/special/WumenAscentProfile.js';

test('Wumen actual world traverses three straight and two bent portals, and retains both folded ascents',async t=>{
 const w=await buildR52World(),rows=[];
 try{
  const Z=-419.6,routes=[...[-14.5,0,14.5].map(x=>({id:'central/'+x,points:[[x,-16],[x,21]]})),...[-1,1].map(s=>({id:'lateral/'+s,points:[[s*38.6,-16.5],[s*48,-16.5],[s*48,21]]}))];
  for(const fps of[10,60])for(const sprint of[false,true])for(const route of routes){
   const out=route.points.map(([x,z])=>[x,z+Z]),points=[...out,...out.slice(0,-1).reverse()],r=replayKunning(t,w,points,{fps,sprint,startFeet:0,recordFrames:true});
   rows.push({id:route.id,fps,sprint,...r});
  }
  for(const fps of[10,60])for(const sprint of[false,true])for(const side of wumenAscentGeometry().sides){
   const out=side.route.map(([x,z])=>[x,z+Z]),r=replayKunning(t,w,[...out,...out.slice(0,-1).reverse()],{fps,sprint,startFeet:0,recordFrames:true});rows.push({id:'ascent/'+side.name,fps,sprint,...r});
  }
  fs.writeFileSync(process.env.EVIDENCE_OUT??'../audit-wumen-completion-20261031/lower-routes.json',JSON.stringify(rows));
  for(const r of rows){assert.ok(r.arrived,JSON.stringify({...r,frames:undefined}));if(r.id.startsWith('ascent'))assert.ok(r.maxFeet>12.29&&r.maxFeet<12.31);else assert.ok(r.minFeet>=-.001&&r.maxFeet<.05,JSON.stringify({...r,frames:undefined}));}
 }finally{w.dispose();}
});
