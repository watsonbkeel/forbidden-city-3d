// Actual worktree entry checks, not historical-count retention.
// Uses its real World/FirstPerson controller without provider injection.
// The caller records whether the worktree is integrated or a patch candidate.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildR52World} from '../../lib/r52-world.mjs';
import {replayKunning} from '../../lib/kunning-walk.mjs';
import {withBoundedQaMocks} from '../../lib/bounded-qa-clock.mjs';
test('current B main entrances: both Taihemen stairs/hall plus Baohe paired wall doors and linked front walks',async t=>{
 const W=await buildR52World(),rows=[],out=process.env.EVIDENCE_OUT??'/tmp/r157-b-current-entry.json';fs.writeFileSync(out+'.ndjson','');
 const run=(points,options)=>withBoundedQaMocks(t,context=>replayKunning(context,W,points,{...options,recordFrames:true}));
 function record(profile,options,r){const row={profile,...options,...r};fs.appendFileSync(out+'.ndjson',JSON.stringify(row)+'\n');const {frames,...summary}=row;rows.push({...summary,frameCount:frames.length,maxFootGroundDifference:Math.max(0,...frames.map(f=>Math.abs(f.feet-f.ground)))});console.log(JSON.stringify({completed:rows.length,profile,arrived:r.arrived,fps:options.fps,sprint:options.sprint}));}
 try{
  const root=W.scene.getObjectByName('太和门'),p=root.userData.taihemenSouth;
  for(const side of[-1,1])for(const fps of[10,60])for(const sprint of[false,true]){
   const f=p.flights.find(f=>Math.sign(f.centerX)===side),go=[[0,-270],[f.centerX,p.zToe-2.5],[f.centerX,p.zToe],[f.centerX,p.zEdge],[f.centerX,p.zEdge+1],[0,p.zEdge+1],[0,-194.2]],points=[...go,...go.slice(0,-1).reverse()];
   record(side<0?'taihemen-east-entry':'taihemen-west-entry',{fps,sprint},run(points,{fps,sprint,startFeet:0}));
  }
  for(const[profile,x,south,north,feet]of[['baohe-west-door',39,119,127,8],['baohe-east-door',-37,119,127,8],['baohe-east-front',-102.37,0,115,.45],['baohe-west-front',106.6,0,115,.45]])for(const fps of[10,60])for(const sprint of[false,true])record(profile,{fps,sprint},run([[x,south],[x,north],[x,south]],{fps,sprint,startFeet:feet}));
  const central=run([[0,p.centralGroup.zToe-2],[0,p.zEdge+1]],{fps:10,sprint:true,startFeet:0});
  const negatives=[{name:'photographed-central-barrier',blocked:!central.arrived&&central.maxFeet<.1}];
  for(const[x,z,feet,label]of[[34,123,8,'west-wall-inner-flank'],[44,123,8,'west-wall-outer-flank']])negatives.push({name:label,blocked:W.cm.checkCollision(new W.THREE.Vector3(x,feet+1.7,z),.5)});
  const headProbes=[];for(const[x,z,y,label]of[[0,-214.2,3.44,'taihemen-through-hall'],[39,123,8,'baohe-west-door'],[-37,123,8,'baohe-east-door'],[-102.37,55,.45,'baohe-east-veranda'],[106.6,55,.45,'baohe-west-veranda']]){
   const origin=new W.THREE.Vector3(x,y+1.7,z),hits=new W.THREE.Raycaster(origin,new W.THREE.Vector3(0,1,0),0,.20).intersectObject(W.scene,true);headProbes.push({name:label,bodyClear:!W.cm.checkCollision(origin,.5),nearHeadTriangles:hits.length});
  }
  const result={runtimeScope:process.env.EVIDENCE_SCOPE??'REAL_WORKTREE_CPU_WORLD_NO_PROVIDER_INJECTION_NOT_GPU',rows,negatives,headProbes,central:{arrived:central.arrived,maxFeet:central.maxFeet}};fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
  assert.equal(rows.length,24);assert.deepEqual(rows.filter(r=>!r.arrived),[],'keep every failed raw route, do not waive entry blockage');
  assert.deepEqual(rows.filter(r=>r.maxFootGroundDifference>.3),[],'visible floating/sinking beyond user0.3m rule');assert.ok(negatives.every(x=>x.blocked));assert.ok(headProbes.every(x=>x.bodyClear&&x.nearHeadTriangles===0));
 }finally{W.dispose();}
});
