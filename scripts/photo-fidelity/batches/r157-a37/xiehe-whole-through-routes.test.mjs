import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {buildR52World} from '../../../../tests/lib/r52-world.mjs';import {replayKunning} from '../../../../tests/lib/kunning-walk.mjs';import {sideGateGeometry} from '../../../../src/scene/palace/special/SideGateProfiles.js';
test('Xiehe all three portals retain real east-to-west ramp roundtrips, centre and near jamb',async t=>{
 const W=await buildR52World(),g=sideGateGeometry(JSON.parse(fs.readFileSync('data/zones/axis-courts.json')).items.find(i=>i.gateProfile==='xiehe')),rows=[];
 try{
 for(const portal of g.portals)for(const lane of[-1,0,1])for(const fps of[10,60])for(const sprint of[false,true]){
  const x=portal.centerX+lane*(portal.clearWidth/2-.85),points=[-24.75,-5.7,-3,3,5.7,24.75,5.7,3,-3,-5.7,-24.75].map(z=>g.toWorld(x,z));
  const r=replayKunning(t,W,points,{fps,sprint,startFeet:0,recordFrames:true});rows.push({bay:portal.bay,lane,fps,sprint,...r});
 }
 fs.writeFileSync(process.env.EVIDENCE_OUT,JSON.stringify(rows));for(const row of rows)assert.ok(row.arrived,JSON.stringify({...row,frames:undefined}));
 }finally{W.dispose();}
});
