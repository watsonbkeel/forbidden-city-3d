import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildWorld} from './lib/world.mjs';import {replayTerrace,traceTerraceGround} from './lib/terrace-walk.mjs';
const W=await buildWorld(),p=W.terraceProfiles.find(p=>p.id==='three-hall-waist-stairs');
const proof={scope:'actual all-zone/static CPU controller, no GPU',routes:[]};
for(const fps of[10,60])for(const sprint of[false,true])for(const kind of['small-door','retained-houzuo','east-waist','west-waist'])test(`R92 all-world ${kind} ${fps}Hz sprint=${sprint}`,t=>{
 let pts;
 if(kind==='small-door'){const rows=W.baoheNorthTiers.map(t=>t.flights.find(f=>f.kind==='outer'&&f.side===-1)),x=(rows[0].minX+rows[0].maxX)/2;pts=[[x,rows[0].zToe+1.4],...rows.flatMap(f=>[[x,f.zToe],[x,f.zEdge],[x,f.zEdge-.65]]),[x,164],[-37,160],[-37,116]];}
 else if(kind==='retained-houzuo'){const g=W.gates.find(g=>g.item.name==='后左门');pts=[[-76.4,123-g.front-2],[-76.4,123+g.rear+2]];}
 else {const side=kind==='east-waist'?'east':'west';pts=p.approaches[side].points.map(p=>[p.x,p.z]);}
 const trace=traceTerraceGround(W.cm,{flights:p.flights});try {const r=replayTerrace(t,W,[...pts,...pts.slice(0,-1).reverse()],{fps,sprint});assert.equal(r.arrived,true,JSON.stringify(r));assert.equal(trace.samples.some(s=>s.source==='rescue'),false);proof.routes.push({kind,fps,sprint,arrived:r.arrived,noRescue:true});}finally{trace.restore();fs.writeFileSync('reports/r92-joint/full-world-proof.json',JSON.stringify(proof,null,2));}
});
test('R92 all-world map identities and gate structure keep their anchor instead of shifting to expanded terrace center',()=>{const item=W.mapItems.find(i=>i.name==='后左门');assert.ok(item);assert.equal(item.x,-76.4);assert.equal(item.z,123);for(const [x,z,y]of[[-37,120,8],[-37,126,8],[-56,120,16/3],[-62,126,8/3]])assert.ok(Math.abs(W.cm.getGroundHeight(x,z,8,.6)-y)<1e-6);});
