// Independent reviewer test; only imports/output paths made repository-portable.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildWorld} from '../../tests/lib/world.mjs';
import {replayTerrace} from '../../tests/lib/terrace-walk.mjs';
import {captureBaoheNorthTiers,baoheNorthDescentPoints} from '../../tests/lib/baohe-north-route.mjs';
const W=await buildWorld();const results=[];
const north=baoheNorthDescentPoints(W.baoheNorthTiers,-1);
const routes={door:[[-37,119],[-37,127],[-37,119]],upperSeam:[[-27,145],[-50,145],[-27,145]],northSeam:[[-27,163],[-50,163],[-27,163]],northStairs:[...north.toReversed(),...north.slice(1)],gate:[[-76.4,113],[-76.4,133],[-76.4,113]],middle:[[-56,135],[-56,168],[-56,135]],lower:[[-62,135],[-62,172],[-62,135]]};
for(const fps of [10,30,60])for(const sprint of [false,true])for(const backward of [false,true])for(const [name,points] of Object.entries(routes))test(`${name} ${fps}Hz sprint=${sprint} reverse=${backward}`,t=>{const r=replayTerrace(t,W,points,{fps,sprint,backward,recordFrames:true});const heights=r.frames.map(f=>f.feet);results.push({name,fps,sprint,backward,...r,frames:undefined,minFeet:Math.min(...heights)});assert.equal(r.arrived,true,JSON.stringify(results.at(-1)));if(['door','upperSeam','northSeam'].includes(name))assert.ok(Math.min(...heights)>7.99);});
test('sampled tier floor supports match outside hall and firewall',()=>{for(const [x,y]of[[-50,8],[-56,16/3],[-62,8/3]])for(let z=84;z<=165;z+=.5){assert.ok(Math.abs(W.cm.getGroundHeight(x,z,8,.6)-y)<1e-6,`${x},${z}`);}});
test.after(()=>fs.writeFileSync(new URL('../../reports/r92-joint/independent/actual-world-results.json',import.meta.url),JSON.stringify({routes,north,results},null,2)));
