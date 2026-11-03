import assert from 'node:assert/strict';
import {replayKunning} from '../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../lib/bounded-qa-clock.mjs';
export function runDiagonals(t,W) {
 const plans=[
  {name:'south-diagonal-stair-ledge-sideways-turn-return',pts:[[105.7,495.6],[102.35,496.1],[102.35,495.3],[102.35,496.5],[105.7,497.4]]},
  {name:'north-diagonal-stair-ledge-sideways-turn-return',pts:[[105.7,497.4],[102.35,496.9],[102.35,497.7],[102.35,496.5],[105.7,495.6]]}
 ],rows=[];
 for(const p of plans)for(const fps of[30,60])for(const sprint of[false,true]) {
  const q=withBoundedQaMocks(t,m=>replayKunning(m,W,p.pts,{fps,sprint,startFeet:0,recordFrames:true}));
  const row={name:p.name,fps,sprint,arrived:q.arrived,stuckAt:q.stuckAt,end:q.end,minFeet:Math.min(...q.frames.map(f=>f.feet)),maxFeet:q.maxFeet,maxGround:Math.max(...q.frames.map(f=>f.ground)),maxAdjacentFeetDelta:Math.max(...q.frames.slice(1).map((f,i)=>Math.abs(f.feet-q.frames[i].feet))),contactFrames:q.frames.filter(f=>W.cm.checkCollision(new W.THREE.Vector3(f.x,f.feet+1.7,f.z),.5)).length};rows.push(row);
  assert.equal(row.arrived,true,JSON.stringify(row));assert.ok(row.minFeet>=-.02,JSON.stringify(row));assert.ok(row.maxFeet>=.4&&row.maxFeet<=.46,JSON.stringify(row));assert.ok(Math.abs(row.maxGround-.45)<1e-5,JSON.stringify(row));assert.ok(row.maxAdjacentFeetDelta<=.31,JSON.stringify(row));
 }
 return rows;
}
