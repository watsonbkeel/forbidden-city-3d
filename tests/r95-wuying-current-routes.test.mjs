import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildR52World} from './lib/r52-world.mjs';
import {runWuyingConsumerChecks} from './lib/r52-wuying-consumer-checks.mjs';
import {walkStraight,reachFrom} from './lib/world.mjs';
const report={source:'R95 unchanged-runtime successor, R94 c6a2a287 baseline actual full production world CPU',legacy:[],routes:[]};
let W;
test.before(async()=>{W=await buildR52World({loadAll:true});});
test.after(()=>{W.dispose();fs.writeFileSync(new URL('../reports/r95-acceptance/wuying/r95-current-routes.json',import.meta.url),JSON.stringify(report,null,2)+'\n');});
test('legacy lint zero-height resets recreate invalid starts inside real raised Wuying supports',()=>{
 const gate=W.gates.find(g=>g.item.name==='武英门'),hall=W.halls.find(h=>h.item.name==='武英殿'),g=hall.g;
 const gateStart=[gate.x+gate.dir[0]*(gate.half+.7),gate.z+gate.dir[1]*(gate.half+.7)];
 const hallStart=g.toW(g.doorX,-(g.PD/2+g.run+2)),hallEnd=g.toW(g.doorX,-(g.d/2-1));
 for(const[name,p]of[['gate-north-BFS',gateStart],['hall-front-centre',hallStart]]){
  const low=W.cm.getGroundHeight(...p,0,.6),actual=W.cm.getGroundHeight(...p,Infinity,.6),blocked=feet=>W.cm.checkCollision(new W.THREE.Vector3(p[0],feet+1.7,p[1]),.5);
  report.legacy.push({name,point:p,zeroResetFeet:low,actualSupport:actual,blockedAtZeroReset:blocked(low),blockedOnSupport:blocked(actual)});
  assert.equal(blocked(low),true);assert.equal(blocked(actual),false);assert.ok(actual>.6);
 }
 report.oldHallWalk=walkStraight(W,hallStart,hallEnd);assert.equal(report.oldHallWalk.reached,-1);
 report.hallWalkWithExistingSupport=walkStraight(W,hallStart,hallEnd,{feet0:1.2});assert.ok(report.hallWalkWithExistingSupport.reached>=report.hallWalkWithExistingSupport.total-.1);
 report.oldGateBFS=reachFrom(W,gateStart,[gate.x,gate.z],12+gate.half,(x,z)=>(x-gate.x)*gate.dir[0]+(z-gate.z)*gate.dir[1]<gate.half);assert.equal(report.oldGateBFS.blockedStart,true);
 // Real gate-centre northward continuation keeps the entered platform datum,
 // unlike lint's independent restart from zero at the same elevated point.
 report.gateContinuation=walkStraight(W,[gate.x,gate.z],gateStart,{feet0:gate.platformY});assert.ok(report.gateContinuation.reached>=report.gateContinuation.total-.1);
});
for(const fps of[10,60])for(const sprint of[false,true])for(const backward of[false,true])test(`actual ground-to-Wuying/Jingsi and return ${fps}Hz sprint=${sprint} backward=${backward}`,t=>{report.routes.push(...runWuyingConsumerChecks(t,W,{fps,sprint,backward}));});
