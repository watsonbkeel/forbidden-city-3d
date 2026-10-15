import test from 'node:test';import assert from 'node:assert/strict';
import {buildWorld,walkStraight} from '../lib/world.mjs';
import {LAYOUT} from '../../src/config/constants.js';
const world=await buildWorld();const Z=LAYOUT.WUMEN_Z,Y=12.3;
function route(points){let cur=[points[0][0],points[0][1]+Z],feet=Y;for(const p of points.slice(1)){const target=[p[0],p[1]+Z],r=walkStraight(world,cur,target,{feet0:feet,step:.05});assert.ok(Math.hypot(r.end[0]-target[0],r.end[1]-target[1])<.08,JSON.stringify({from:cur,to:target,result:r}));assert.equal(r.feet,Y);cur=r.end;feet=r.feet;}}
test('Wumen fixed-width body completes both recessed verandas and four corners',()=>route([[35,11.2],[35,-11.2],[-35,-11.2],[-35,11.2],[35,11.2]]));
test('Wumen central south and north architectural openings form a real supported through route',()=>route([[0,-11.2],[0,0],[0,11.2],[0,0],[0,-11.2]]));
test('Wumen south outer strip stays blocked at actual eave columns',()=>{const r=walkStraight(world,[0,Z-12.3],[6.67,Z-12.3],{feet0:Y,step:.05});assert.ok(r.reached<3);});
