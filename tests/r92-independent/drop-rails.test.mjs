// Independent reviewer test; only imports/output paths made repository-portable.
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {buildWorld} from '../../tests/lib/world.mjs';
import {fixture} from '../../tests/lib/r72-player-fixture.mjs';
import {replayTerrace} from '../../tests/lib/terrace-walk.mjs';
const W=await buildWorld();const out=[];
for(const fps of[10,30,60])for(const [x,z,y]of[[-50,145,8],[-56,145,16/3],[-62,145,8/3],[-37,123,8],[-50,163,8]])test(`vertical landing ${x},${z} ${fps}`,t=>{const f=fixture(t,{position:[x,0,z]});f.controls.collisionManager=W.cm;f.controls.feetY=y+1;f.controls.groundY=y;f.controls.airborne=true;f.camera.position.set(x,y+2.7,z);for(let i=0;i<fps*3;i++)f.step(1/fps);const p=f.player();out.push({type:'drop',fps,x,z,expected:y,actual:p.position});assert.ok(Math.abs(p.position[1]-y)<1e-6,JSON.stringify(p));});
for(const fps of[10,30,60])for(const sprint of[false,true])for(const [name,a,b,y]of[['east',[-51,145],[-55,145],8],['north',[-50,164],[-50,170],8],['south',[-50,85],[-50,80],8],['middleEast',[-56,145],[-61,145],16/3],['lowerEast',[-62,145],[-67,145],8/3]])test(`rail stops runoff ${name} ${fps} ${sprint}`,t=>{const r=replayTerrace(t,W,[a,b],{fps,sprint,recordFrames:true});out.push({type:'rail',name,fps,sprint,arrived:r.arrived,end:r.end,minFeet:Math.min(...r.frames.map(f=>f.feet))});assert.equal(r.arrived,false);assert.ok(Math.min(...r.frames.map(f=>f.feet))>=y-1e-6);});
test.after(()=>fs.writeFileSync(new URL('../../reports/r92-joint/independent/drop-rails-results.json',import.meta.url),JSON.stringify(out,null,2)));
