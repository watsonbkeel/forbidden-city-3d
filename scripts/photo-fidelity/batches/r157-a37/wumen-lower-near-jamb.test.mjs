import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {captureGate} from '../../../../tests/lib/gate-tower-fixture.mjs';
import {CollisionManager} from '../../../../src/utils/Collision.js';
import {replayKunning} from '../../../../tests/lib/kunning-walk.mjs';
test('Independent single-gate real controller: near-jamb channels and near-elbow two-way routes',t=>{
 const c=captureGate(),cm=new CollisionManager();cm.rivers=[];cm.addColliders(c.builder.colliders);cm.addWalkables(c.builder.walkables);const world={THREE:c.THREE,cm},Z=c.data.position.z,rows=[];
 const routes=[];for(const[x,w]of[[-14.5,4.7],[0,5.4],[14.5,4.7]])for(const sign of[-1,1]){const q=x+sign*(w/2-.9);routes.push({id:`central/${x}/${sign}`,points:[[q,-16],[q,21]]});}
 for(const s of[-1,1])for(const dx of[-1,1])for(const dz of[-1,1])routes.push({id:`elbow/${s}/${dx}/${dz}`,points:[[s*38.6,-16.5+dz],[s*48+dx,-16.5+dz],[s*48+dx,21]]});
 try{for(const fps of[10,60])for(const sprint of[false,true])for(const route of routes){const out=route.points.map(([x,z])=>[x,z+Z]);const r=replayKunning(t,world,[...out,...out.slice(0,-1).reverse()],{fps,sprint,startFeet:0,recordFrames:true});rows.push({id:route.id,fps,sprint,...r});}
 fs.writeFileSync(process.env.EVIDENCE_OUT??'../audit-wumen-completion-20261031/lower-near-jamb.json',JSON.stringify(rows));for(const r of rows){assert.equal(r.arrived,true,JSON.stringify({...r,frames:undefined}));assert.ok(r.minFeet>=-1e-4&&r.maxFeet<.01,JSON.stringify({...r,frames:undefined}));}
 let checkedFrames=0;for(const r of rows)for(const f of r.frames){assert.equal(cm.checkCollision(new c.THREE.Vector3(f.x,f.feet+1.7,f.z),.5),false,JSON.stringify({id:r.id,fps:r.fps,sprint:r.sprint,f}));checkedFrames++;}assert.equal(cm.checkCollision(new c.THREE.Vector3(8,1.7,Z),.5),true,'solid-wall negative must reject the same fixed body');
 console.log(JSON.stringify({cases:rows.length,frames:rows.reduce((a,r)=>a+r.frames.length,0),checkedFrames,penetratingFrames:0,solidNegative:true,scope:'Production gate+CollisionManager+FirstPerson; no full-world/GPU claim'}));
 }finally{c.builder.dispose();}
});
