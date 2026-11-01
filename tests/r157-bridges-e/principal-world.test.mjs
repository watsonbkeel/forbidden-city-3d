import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildR52World} from '../lib/r52-world.mjs';
import {replayKunning} from '../lib/kunning-walk.mjs';

test('current full World crosses the widened imperial bridge and all four unchanged side bridges without injected physical providers',async t=>{
 const w=await buildR52World(),rows=[];try{
  const river=w.scene.getObjectByName('金水河'),p=river?.userData.innerJinshui;assert.ok(p);assert.equal(p.bridges.length,5);
  for(const fps of[10,60])for(const sprint of[false,true])for(const x of[-3.15,0,3.15,-30,-13,13,30]){
   const r=replayKunning(t,w,[[x,-326],[x,-296],[x,-326]],{startFeet:0,fps,sprint,recordFrames:true});
   rows.push({x,fps,sprint,...r});assert.equal(r.arrived,true,JSON.stringify({x,fps,sprint,...r,frames:undefined}));
   assert.ok(r.maxFeet>(Math.abs(x)<4?1:.85)&&r.maxFeet<(Math.abs(x)<4?1.2:1));assert.ok(r.minFeet>=-.001);
  }
  if(process.env.EVIDENCE_OUT)fs.writeFileSync(process.env.EVIDENCE_OUT,JSON.stringify({scope:'UNINJECTED_CURRENT_FULL_WORLD_28_ROUNDTRIPS_NOT_BROWSER_OR_NPC',rows}));
 }finally{w.dispose();}
});
