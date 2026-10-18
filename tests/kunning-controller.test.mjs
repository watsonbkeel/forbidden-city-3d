import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildWorld } from './lib/world.mjs';
import { KUNNING_PROFILE, kunningNavigationPoint } from '../src/scene/palace/special/KunningProfile.js';
import { PALACE_LAYOUT } from '../src/scene/Layout.js';
import { replayKunning } from './lib/kunning-walk.mjs';
import { PLAYER } from '../src/config/constants.js';
const W=await buildWorld(),data=PALACE_LAYOUT.find(x=>x.name==='坤宁宫');
const pts=key=>KUNNING_PROFILE.navigation.routes[key].map(id=>{const [x,,z]=kunningNavigationPoint(id,data);return[x,z];});
const entry=pts('entry');
const loops={entry:[...entry,...entry.slice(0,-1).reverse()]};
for(const side of ['east','west']){
 const bypass=pts(side+'Bypass');
 loops[side]=[...entry,...bypass.slice(1),...bypass.slice(0,-1).reverse(),...entry.slice(0,-1).reverse()];
}
for(const [route,points] of Object.entries(loops))for(const fps of [60,10])for(const sprint of [false,true])for(const backward of [false,true]){
 test(`real FirstPerson Kunning ${route} roundtrip ${fps}Hz sprint=${sprint} backward=${backward}, no rescue`,t=>{
  const saved=W.cm.walkables;W.cm.walkables=saved.map(w=>w.type==='box'?{...w,rescue:false}:w);
  try{
   const result=replayKunning(t,W,points,{startFeet:2,fps,sprint,backward,recordFrames:true});
   if(process.env.KUNNING_EVIDENCE_DIR){fs.mkdirSync(process.env.KUNNING_EVIDENCE_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.KUNNING_EVIDENCE_DIR,`${route}-${fps}-${sprint?'fast':'walk'}-${backward?'backward':'forward'}.json`),JSON.stringify(result,null,2));}
   assert.equal(result.startFeet,2);assert.equal(result.arrived,true,JSON.stringify({...result,frames:undefined}));
   // Momentum at the north turn may briefly enter the preserved next stair
   // below2m. Check real support, not an incorrect constant-height floor.
   assert.ok(result.frames.every(f=>f.ground>0 && f.feet>0),'unsupported drop to ground');
   // Camera feet intentionally ease toward logical ground (FirstPerson.updateGround).
   // Body collision uses max(feet,ground), so record lag rather than claiming
   // per-frame grounded camera feet. Keep it inside the inherited step range.
   assert.ok(result.frames.every(f=>f.feet>=f.ground-PLAYER.STEP_UP),'camera lag exceeded inherited step range');
   assert.ok(result.maxFeet>=2.15,`did not ascend the actual plinth ${result.maxFeet}`);
   assert.ok(result.maxFeet<=2.28,`unexpected lift ${result.maxFeet}`);
   assert.ok(Math.abs(result.end[2]-2)<.02,`not settled on lower support ${result.end}`);
   assert.equal(result.driver.crossings.length,points.length-1);
   assert.ok(result.driver.crossings.every(c=>c.lateralDistance<.6));
  }finally{W.cm.walkables=saved;}
 });
}
