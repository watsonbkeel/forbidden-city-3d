import test from 'node:test';
import assert from 'node:assert/strict';
import {compoundFixture} from '../lib/r63-west-rear-compound-fixture.mjs';
import {replayWestRearSouthDoorInWorld} from '../lib/r63-west-rear-windows-world-check.mjs';
import {assertCurrentChuxiuNorthWall,replayLijingPublicEntry} from '../lib/lijing-current-entry-check.mjs';

test('Current Chuxiu north wall blocks the supported interior exit, not the former R63 route',t=>{
  const W=compoundFixture();
  try {assertCurrentChuxiuNorthWall(t,W,W.builder.zoneJson);} finally {W.dispose();}
});
for(const fps of [10,60])for(const backward of [false,true])for(const sprint of [false,true]){
  const mode=`${fps}Hz ${backward?'S':'W'} ${sprint?'sprint':'walk'}`;
  test(`Current Lijing public map entry and return ${mode}`,t=>{
    const W=compoundFixture();
    try {replayLijingPublicEntry(t,W,W.builder.zoneJson,W.built.mapItems,{fps,backward,sprint});} finally {W.dispose();}
  });
  test(`Current Tongdao compound ${mode}`,t=>{
    const W=compoundFixture(),index=47;
    try {
      const r=replayWestRearSouthDoorInWorld(t,W,{index,fps,backward,sprint,compoundApproach:true});
      assert.equal(r.arrived,true);assert.equal(r.compoundApproach,true);assert.equal(r.startFeet,0);assert.ok(Math.abs(r.end[2])<1e-6);assert.ok(r.headClearance.samples>10);
      t.diagnostic(JSON.stringify({index,fps,backward,sprint,frames:r.frames.length,end:r.end,maxFeet:r.maxFeet,headClearance:r.headClearance}));
    } finally {W.dispose();}
  });
}
