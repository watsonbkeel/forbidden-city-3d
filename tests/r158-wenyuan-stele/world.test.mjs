import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';import{buildR52World}from'../lib/r52-world.mjs';import{createActualLibrary}from'../r158-cumulative-1600/library.mjs';import{replayKunning}from'../lib/kunning-walk.mjs';import{withBoundedQaMocks}from'../lib/bounded-qa-clock.mjs';
test('installed stele pavilion reachable from real bridge and eastern court; existing hall entry and water stay intact',async t=>{
 const w=await buildR52World({loadAll:false,initialPosition:{x:-212.5,z:-132.8},createLibrary:createActualLibrary}),report={scope:'NORMAL_WORLD_OUTER_EAST_LOADED_NOT_GPU',rows:[]};
 try{
 const zone=w.zoneManager.loaded.get('outer-east').data,meta=zone.group.userData.architecture.filter(x=>x.id==='wenyuan-stele-pavilion');assert.equal(meta.length,1);assert.equal(meta[0].objectId,'FC-F23B7824D4');
 const routes=[{id:'bridge-to-stele',pts:[[-186.5,-157.6],[-186.5,-142.8],[-212.5,-142.8],[-212.5,-139],[-212.5,-134.2],[-212.5,-139],[-212.5,-142.8],[-186.5,-142.8],[-186.5,-157.6]]},{id:'east-court-to-stele',pts:[[-208,-125],[-217,-125],[-217,-139],[-212.5,-139],[-212.5,-134.2],[-212.5,-139],[-217,-139],[-217,-125],[-208,-125]]},{id:'retained-wenyuan-entry',pts:[[-186.5,-157.6],[-186.5,-142.8],[-189.875,-142.8],[-189.875,-139],[-189.875,-142.8],[-186.5,-142.8],[-186.5,-157.6]]}];
 for(const route of routes)for(const fps of[10,60])for(const sprint of[false,true]){const r={route:route.id,fps,sprint,...withBoundedQaMocks(t,c=>replayKunning(c,w,route.pts,{fps,sprint,startFeet:0,recordFrames:true}))};report.rows.push(r);assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.ok(r.frames.every(f=>Math.abs(f.feet-f.ground)<=.3),route.id+' visible foot gap');}
 const probe=(x,z,y=1.97)=>w.cm.checkCollision(new w.THREE.Vector3(x,y,z),.5);
 assert.equal(probe(-212.5,-134.2),false,'door viewing area');for(const [x,z]of[[-212.5,-132.4],[-215.4,-132.8],[-212.5,-129.95],[-218.9,-132]])assert.equal(probe(x,z),true,'stele/wall/original courtyard wall remains solid');
 for(const [x,z]of[[-212.5,-145],[-189.875,-145]])assert.equal(w.cm.checkRiverCrossing(new w.THREE.Vector3(x,1.72,z),.5,null,.02),false,'no new water shortcut');
 report.summary={arrived:report.rows.filter(r=>r.arrived).length,total:report.rows.length,negativeChecks:6};
 }finally{fs.writeFileSync(process.env.EVIDENCE_OUT??'/tmp/r158-stele-world.json',JSON.stringify(report));w.dispose();}
});
