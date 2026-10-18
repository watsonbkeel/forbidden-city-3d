import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import crypto from 'node:crypto';import * as THREE from 'three';
import {buildWorld,walkStraight} from './lib/world.mjs';
import {buildAutoRoutes} from './lib/auto-routes.mjs';
import {withLegacyNingshouForVersionComparison} from './lib/r6-ningshou-route-compat.mjs';
import delta from './fixtures/r6-ningshou-route-delta.json' with {type:'json'};
test('only the exact one replaced compound descriptor can be restored for historical hash checks',()=>{
 const other={name:'unrelated',pts:[[1,2],[3,4]]};assert.deepEqual(withLegacyNingshouForVersionComparison([delta.after,other]),[delta.before,other]);
 for(const d of [{...delta.after,pts:[]},{...delta.after,plan:[]}])assert.throws(()=>withLegacyNingshouForVersionComparison([d]));
 assert.deepEqual(withLegacyNingshouForVersionComparison([other]),[other]);
});
test('current generated compound route uses the existing side portal and returns at ground level',async()=>{
 const W=await buildWorld(),routes=buildAutoRoutes(W,W.zones.map(z=>z.json)),r=routes.find(r=>r.name===delta.after.name);assert.deepEqual(r,delta.after);
 let feet=0;for(let i=1;i<r.pts.length;i++){const v=walkStraight(W,r.pts[i-1],r.pts[i],{feet0:feet});assert.ok(v.reached>=v.total-.1,`leg ${i}: ${JSON.stringify(v)}`);feet=v.feet;}
 assert.equal(feet,0);
 const old=walkStraight(W,delta.before.pts[1],delta.before.pts[2]);assert.ok(old.reached<old.total-1,'retired route crosses the now-present side boundary');
});
test('side-portal route passes with all actual Huangji S proxies; retired B-only interior line remains blocked',async()=>{
 const W=await buildWorld(),old=delta.failedBeforeSPreloadFix;
 const bOnly=walkStraight(W,old.pts[4],old.pts[5],{feet0:1.5});assert.ok(bOnly.reached>=bOnly.total-.1);
 const bytes=fs.readFileSync(new URL('../public/models/interiors/huangji.glb',import.meta.url));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),'53213f0c2247820ca15cd44c1b99e8104e309a93cf9ac962b9a24aaa59f1cf80');
 const j=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 const cfg=JSON.parse(fs.readFileSync(new URL('../data/interiors/huangji.json',import.meta.url)));
 const floor=W.cm.getGroundHeight(cfg.frame.x,cfg.frame.z,0,999);assert.equal(floor,1.5);assert.equal(cfg.frame.rot,0);
 let col=0,walk=0;
 for(const [index,n] of j.nodes.entries()){
  if(!/^(COL_|WALK_)/.test(n.name??''))continue;
  assert.ok(j.scenes[j.scene??0].nodes.includes(index));assert.equal(n.matrix,undefined);assert.equal(n.rotation,undefined);assert.equal(n.scale,undefined);
  const primitives=j.meshes[n.mesh].primitives;assert.equal(primitives.length,1);
  const a=j.accessors[primitives[0].attributes.POSITION],t=n.translation??[0,0,0],off=[cfg.frame.x+t[0],floor+t[1],cfg.frame.z+t[2]];
  const box=new THREE.Box3(new THREE.Vector3(...a.min.map((v,i)=>v+off[i])),new THREE.Vector3(...a.max.map((v,i)=>v+off[i])));
  if(n.name.startsWith('COL_')){W.cm.addCollider(box,'interior:huangji');col++;}else{W.cm.addWalkable({type:'box',box},'interior:huangji');walk++;}
 }
 assert.equal(col,5);assert.equal(walk,1);
 const blocked=walkStraight(W,old.pts[4],old.pts[5],{feet0:1.5,step:.05});assert.ok(blocked.reached<blocked.total-5);assert.ok(Math.abs(blocked.end[1]-293.98)<.15);
 let feet=0;for(let i=1;i<delta.after.pts.length;i++){const v=walkStraight(W,delta.after.pts[i-1],delta.after.pts[i],{feet0:feet});assert.ok(v.reached>=v.total-.1,`loaded S leg ${i}: ${JSON.stringify(v)}`);feet=v.feet;}
 assert.equal(feet,0);
});
