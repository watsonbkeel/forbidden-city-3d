import {readTaihemenWorldFixture} from '../../lib/r157-taihemen-world-fixture.mjs';
import test from 'node:test';
import fs from'node:fs';import {gunzipSync} from 'node:zlib';import assert from'node:assert/strict';import crypto from'node:crypto';
import {buildR52World} from'../../lib/r52-world.mjs';
import {taiheWorldPhysics} from'../../lib/r157-taihe-world-retention.mjs';
import {assertTaihemenFacilitiesCInWorld} from'../../lib/r157-taihemen-facilities-c-check.mjs';
import {replayTerrace,traceTerraceGround} from'../../lib/terrace-walk.mjs';
const sha=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
test('actual production global retention and eight route consumers',async t=>{
const bytes=gunzipSync(readTaihemenWorldFixture());assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'dbda1e6e18635d7a80425b25e46337280a716f393c70b0b88dfaa9141f2904b4','immutable pre-hook full-world fixture');const baseline=JSON.parse(bytes),W=await buildR52World();try{
 console.log('STAGE world-built',process.memoryUsage());global.gc?.();
 const physical=taiheWorldPhysics(W),source='axis/taihemen-observed-approach',indices=new Set(W.cm.colliders.flatMap((c,i)=>c.mesh.taihemenObservedSource===source?[i]:[])),raw=W.palaceBuilder.getWalkables(),probe=new W.cm.constructor();probe.addWalkables(raw,'static');assert.equal(probe.walkables.length,raw.length);assert.equal(sha(probe.walkables),sha(W.cm.walkables.slice(0,raw.length)),'builder support registration prefix');console.log('STAGE physics-captured',process.memoryUsage());const supports=new Set(raw.flatMap((w,i)=>w.taihemenObservedSource===source?[i]:[]));
 assert.equal(indices.size,77);assert.equal(supports.size,3);assert.equal(physical.rows.length,30873);assert.equal(physical.walkables.length,1371);
 assert.equal(sha(physical.rows.filter((_,i)=>!indices.has(i)).map(sha).sort()),sha(baseline.retainedColliderHashes),'all 30796 non-target collider records exact multiset');assert.equal(sha(physical.walkables.filter((_,i)=>!supports.has(i))),sha(baseline.retainedSupports),'all 1368 non-target supports exact');assert.deepEqual(physical.rivers,baseline.rivers);
 console.log('STAGE retention-passed',process.memoryUsage());
 const consumer=assertTaihemenFacilitiesCInWorld(W,{production:true}),root=W.scene.getObjectByName('太和门'),p=root.userData.taihemenSouth,routes=[];
 console.log('STAGE consumer-passed',consumer);for(const side of[-1,1])for(const fps of[10,60])for(const sprint of[false,true]){const f=p.flights.find(f=>Math.sign(f.centerX)===side),go=[[0,-270],[f.centerX,p.zToe-2.5],[f.centerX,p.zToe],[f.centerX,p.zEdge],[f.centerX,p.zEdge+1],[0,p.zEdge+1],[0,-194.2]],trace=traceTerraceGround(W.cm,p);try{const r=replayTerrace(t,W,[...go,...go.slice(0,-1).reverse()],{fps,sprint,recordFrames:true});assert.equal(r.arrived,true,JSON.stringify({side,fps,sprint,r}));assert.equal(r.startFeet,0);assert.ok(Math.abs(r.end[2])<1e-6);assert.equal(trace.samples.some(s=>s.source==='rescue'),false);console.log('STAGE route',side,fps,sprint);routes.push({side,fps,sprint,arrived:r.arrived,startFeet:r.startFeet,end:r.end,frames:r.frames.length,rescue:false});}finally{trace.restore();}}
 const blocked=replayTerrace(t,W,[[0,p.centralGroup.zToe-2],[0,p.zEdge+1]],{fps:10,sprint:true});assert.equal(blocked.arrived,false);assert.ok(blocked.maxFeet<.1);
 const result={scope:'ACTUAL_UNINJECTED_PRODUCTION_WORLD',consumer,totalColliders:physical.rows.length,totalSupports:physical.walkables.length,newOwnedColliders:indices.size,newOwnedSupports:supports.size,retainedColliders:baseline.retainedColliderHashes.length,retainedSupports:baseline.retainedSupports.length,retainedExact:true,riversExact:true,routes,centralBlocked:true};if(process.env.R157_TAIHEMEN_C_WORLD_OUT)fs.writeFileSync(process.env.R157_TAIHEMEN_C_WORLD_OUT,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{W.dispose();}
});
