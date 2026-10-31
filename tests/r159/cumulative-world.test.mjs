import {r159JiaotaiPriorComparison} from '../lib/r159-jiaotai-prior-comparison.mjs';
import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{buildR52World}from'../lib/r52-world.mjs';import{taiheWorldPhysics}from'../lib/r157-taihe-world-retention.mjs';import{wuying55PhysicsView}from'../lib/r158-wuying-55-physics-view.mjs';
import{assertJiaotaiDisplayInWorld,replayJiaotaiDisplayRoute}from'../lib/r54-jiaotai-world-check.mjs';
const golden=JSON.parse(fs.readFileSync(new URL('../fixtures/r159-jiaotai-integration/independent-candidate.json',import.meta.url)));
test('actual cumulative R159 World registers exactly six reviewed Jiaotai solids, preserves all prior physics and carries Qianqing roof records',async t=>{
 const W=await buildR52World();try{global.gc?.();
 const owned=W.cm.colliders.flatMap((c,i)=>c.mesh.r159JiaotaiFrontVessel?[{c,i}]:[]);
 assert.equal(owned.length,6);assert.equal(new Set(owned.map(({c})=>c.mesh.r159JiaotaiFrontVessel)).size,6);
 assert.deepEqual(owned.map(({c})=>({owner:c.mesh.r159JiaotaiFrontVessel,min:c.box.min.toArray(),max:c.box.max.toArray()})),golden.rows);
 const raw=taiheWorldPhysics(W),indices=new Set(owned.map(r=>r.i));assert.equal(raw.rows.length,30882);assert.equal(raw.walkables.length,1365);
 const comparison=r159JiaotaiPriorComparison(W,raw),rows=comparison.physics.rows;
 assert.equal(comparison.world.cm.checkCollision,undefined);assert.equal(comparison.world.cm.walkables,W.cm.walkables);assert.notEqual(rows,raw.rows);
 // Restricted new comparison array only. Actual W.cm and route queries remain raw.
 const prior=wuying55PhysicsView({...raw,rows});assert.equal(prior.rows.length,30876);assert.equal(W.cm.colliders.length,30882);
 const compose=(world,p)=>wuying55PhysicsView(r159JiaotaiPriorComparison(world,p).physics),first=owned[0].i;
 for(const patch of[{tag:'forged'},{triangleSupport:{}},{overhead:{}},{xiqingRoofSurface:{}},{duixiuTerrain:true},{furnitureMotionScope:{}},{min:[raw.rows[first].min[0]+.01,...raw.rows[first].min.slice(1)]}])assert.throws(()=>compose(W,{...raw,rows:raw.rows.map((r,i)=>i===first?{...r,...patch}:r)}));
 const cloneOwner=id=>({...W,cm:{...W.cm,colliders:W.cm.colliders.map((c,i)=>i===first?{...c,mesh:{...c.mesh,r159JiaotaiFrontVessel:id}}:c)}});
 for(const id of[undefined,'foreign-owner',owned[1].c.mesh.r159JiaotaiFrontVessel])assert.throws(()=>compose(cloneOwner(id),raw));
 const other=raw.rows.findIndex((_,i)=>!indices.has(i));assert.throws(()=>compose(W,{...raw,rows:raw.rows.map((r,i)=>i===other?{...r,min:[r.min[0]+.01,...r.min.slice(1)]}:r)}),/non-target/);
 const q=[];W.scene.traverse(o=>{for(const r of o.userData.hallWalkingBeasts??[])if(r.entityId==='FC-38B23747E9')q.push(r);});assert.equal(q.length,1);assert.equal(q[0].animalTotal,72);assert.equal(q[0].riderTotal,8);
 const structural=assertJiaotaiDisplayInWorld(W),routes=[];
 for(const fps of[10,30,60])for(const backward of[false,true]){try{routes.push(replayJiaotaiDisplayRoute(t,W,{fps,sprint:false,backward}));}finally{t.mock.restoreAll();}}
 const result={scope:'ACTUAL_CUMULATIVE_WORLD_NO_INSTALLER_INJECTION',colliders:raw.rows.length,oldExactColliders:rows.length,newReviewedSolids:6,supports:raw.walkables.length,priorWuying126Exact:true,allOtherPriorPhysicsExact:true,qianqing:{animals:72,riders:8},structural,routes};
 if(process.env.R159_WORLD_OUT)fs.writeFileSync(process.env.R159_WORLD_OUT,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
 }finally{W.dispose();}
});
