import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {CollisionManager} from '../src/utils/Collision.js';
import fs from'node:fs';const u=new URL('../src/scene/garden/DuixiuOuterRock.js',import.meta.url),api=fs.existsSync(u)?await import(u):{};const buildDuixiuMountain=o=>{assert.equal(typeof api.buildDuixiuOuterRock,'function');return api.buildDuixiuOuterRock(o);};
import {replayTerrace} from './lib/terrace-walk.mjs';
for(const fps of [10,30,60])for(const side of ['east','west'])test(`R91 scoped terrain ${side} physical ascent and return ${fps}Hz`,t=>{
 const r=buildDuixiuMountain({center:new THREE.Vector3()}); const cm=new CollisionManager();cm.rivers=[];cm.addColliders(r.colliders);cm.addWalkables(r.walkables);
 t.after(()=>r.geometries.forEach(g=>g.dispose()));
 const route=r.profile.routes.find(r=>r.id===side);const p=route.points.map(([x,y,z])=>[x,z]);p.unshift([p[0][0],-9.5]);const points=[...p,...p.slice(0,-1).reverse()];
 const result=replayTerrace(t,{THREE,cm},points,{fps,sprint:true,recordFrames:true});assert.ok(result.arrived,JSON.stringify({...result,frames:undefined}));assert.ok(result.maxFeet>=10.4);assert.ok(result.end[2]<.1);
});
