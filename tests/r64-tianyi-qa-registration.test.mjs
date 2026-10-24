import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {gateGeom} from './lib/world.mjs';
import {tianyiProfile} from '../src/scene/palace/special/TianyiGate.js';
const zone=JSON.parse(fs.readFileSync(new URL('../data/zones/garden.json',import.meta.url)));
test('dedicated Tianyi QA contract follows actual authored platform and both stair toes',()=>{
 const item=zone.items.find(i=>i.name==='天一门'),p=tianyiProfile(item),g=gateGeom(item);
 assert.equal(g.platformY,p.floor);assert.equal(g.front,p.platformDepth/2+p.stairRun);assert.equal(g.rear,g.front);
 assert.deepEqual(g.dir,[0,1]);assert.deepEqual(g.profile.portalCenters,[0]);
 assert.deepEqual(g.profile.toWorld(0,0),[p.x,p.z]);
 assert.deepEqual(g.profile.ramps,[{side:'front',zToe:-g.front,zTop:-p.platformDepth/2},{side:'rear',zToe:g.rear,zTop:p.platformDepth/2}]);
 assert.throws(()=>gateGeom({...item,x:item.x+1}),/exact named/);
});
test('dedicated new profile leaves established generic wall and Kunning contracts intact',()=>{
 assert.deepEqual(gateGeom({kind:'gate',style:'wall',x:2,z:3,w:4,t:1,rot:'east'}),{x:2,z:3,rot:Math.PI/2,dir:[1,Math.cos(Math.PI/2)],half:1.5,front:1.5,rear:1.5});
 assert.deepEqual(gateGeom({kind:'gate',name:'坤宁门',gateProfile:'kunning',gateKind:'three-bay',rot:'north',x:0,z:1}),{x:0,z:1,rot:0,dir:[0,1],half:7.2,front:7.2,rear:7.2,platformY:1.2});
});
