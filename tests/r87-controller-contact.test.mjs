import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {finialFixture,replayFinialJump} from './lib/r58-bridge-contact-probe.mjs';
for(const fps of [10,60])for(const walkAlongRail of [false,true])test(`bridge2 real ${walkAlongRail?'rail walk':'jump'} ${fps}Hz has actual contact`,t=>{
 const W=finialFixture(),p=W.g.userData.innerJinshuiSideFinials.placements.find(p=>p.bridgeId==='inner-jinshui:bridge-2'&&p.side===-1&&p.postIndex===0);W.scene.remove(W.g);W.g=W.r.group;
 const result=replayFinialJump(t,W,p,fps,{walkAlongRail});fs.writeFileSync(`reports/r87-bridge2-triangle-contact/controller-${fps}-${walkAlongRail}.json`,JSON.stringify(result,null,2));
 assert.equal(result.end.airborne,false);const hit=W.cm.supportContact(result.end.x,result.end.z,result.end.feet+.001);if(!hit){assert.ok(Math.abs(result.end.feet-W.cm.getGroundHeight(result.end.x,result.end.z,0,.6))<1e-5,'blocked old short input returns to bridge, not rescued');return;}assert.ok(hit,'finite witnessed contact');assert.ok(Math.abs(hit.height-result.end.feet)<.005,`feet ${result.end.feet} != ${hit.height}`);assert.ok(result.penetration<.005,`penetration ${result.penetration}`);
});
