import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {buildR52World} from '../../../tests/lib/r52-world.mjs';import {replayKunning} from '../../../tests/lib/kunning-walk.mjs';
test('Jingren stone low-contact and outer-corner route preflight',async t=>{const W=await buildR52World(),rows=[];try{for(const fps of[10,30,60])for(const sprint of[false,true])for(const side of[-1,1]){
 const x=-92.4+side*2.5;
 for(const[name,pts,startFeet]of[['inner',[[-92.4+side*.8,299],[-92.4+side*.8,307],[-92.4+side*.8,299]],0],['front',[ [x,300.9],[x+side*1.5,300.9],[x+side*1.5,301.7],[x+side*1.5,300.9],[x,300.9]],0],['outer',[[x,301.15],[x,299.5]],0]]){
 const r=replayKunning(t,W,pts,{startFeet,fps,sprint,recordFrames:true});rows.push({name,side,fps,sprint,...r});
 }}fs.writeFileSync(process.env.EVIDENCE_OUT??'../jingren-gate-20261030-evidence/contacts-candidate.json',JSON.stringify(rows));for(const r of rows)assert.ok(r.arrived,JSON.stringify({...r,frames:undefined}));}finally{W.dispose();}});
