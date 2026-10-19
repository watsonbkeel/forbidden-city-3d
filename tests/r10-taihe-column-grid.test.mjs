import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {taiheColumnGrid} from '../src/scene/palace/special/TaiheColumnGrid.js';
import {TAIHE_CORE as P} from '../src/scene/palace/special/TaiheCoreProfile.js';
const S=JSON.parse(fs.readFileSync(new URL('../data/architecture/taihe-column-grid.json',import.meta.url)));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
test('published nonuniform means retain orientation and column-grid spans',()=>{
 assert.deepEqual(S.frontageWestToEast,[3593.2,5557.3,5552.3,5555,5560.7,8466,5546.2,5557.2,5547,5560.7,3602]);
 assert.deepEqual(S.depthSouthToNorth,[3603.4,7477.8,11188.7,7462.8,3603.3]);
 const g=taiheColumnGrid(63,37);near(g.measuredX.at(-1)-g.measuredX[0],60.0976);near(g.measuredZ.at(-1)-g.measuredZ[0],33.336);
 const widths=g.measuredX.slice(1).map((x,i)=>x-g.measuredX[i]);widths.forEach((v,i)=>near(v,S.frontageWestToEast.at(-1-i)/1000));
});
test('inner stations exactly agree with retained gold and companion grid',()=>{
 const g=taiheColumnGrid(63,37);near(g.x[5],P.columns.x[0]);near(g.x[6],P.columns.x[1]);
 [P.columns.redCompanionZ,...P.columns.goldZ].forEach((v,i)=>near(g.z[i+1],v));
 near(g.openLeft,-9.7792);near(g.openRight,9.7937);near(g.openRight-g.openLeft,19.5729);
});
test('perimeter remains explicit model constraint and all72 stations are unique',()=>{
 const g=taiheColumnGrid(63,37);assert.equal(g.perimeterStatus,'retained-model-envelope-not-surveyed');
 assert.deepEqual([g.x[0],g.x.at(-1),g.z[0],g.z.at(-1)],[-31.5,31.5,-18.5,18.5]);
 assert.equal(new Set(g.x.flatMap(x=>g.z.map(z=>`${x}/${z}`))).size,72);
 assert.ok(g.x.every((v,i)=>i===0||v>g.x[i-1]));assert.ok(g.z.every((v,i)=>i===0||v>g.z[i-1]));
});
test('invalid envelopes cannot silently squeeze the measured interior',()=>{
 for(const args of [[60,37],[63,33],[NaN,37],[63,Infinity]])assert.throws(()=>taiheColumnGrid(...args));
});
