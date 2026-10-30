import test from 'node:test';import assert from 'node:assert/strict';
import {clipEastWellBedRectangle,EAST_WELL_GROUND_CUT} from '../../../src/scene/garden/EastWellGroundFit.js';
const area=r=>(r[1]-r[0])*(r[3]-r[2]);
test('east-well ground keeps nonlocal rectangle identity and all four surviving fragments',()=>{const r=[0,1,0,1];assert.equal(clipEastWellBedRectangle(r)[0],r);const c=EAST_WELL_GROUND_CUT,outer=[c[0]-1,c[1]+1,c[2]-1,c[3]+1],pieces=clipEastWellBedRectangle(outer);assert.equal(pieces.length,4);assert.equal(pieces.reduce((s,p)=>s+area(p),0),area(outer)-area(c));assert.deepEqual(clipEastWellBedRectangle([...c]),[]);});
test('east-well ground rejects inverted/nonfinite rectangles',()=>{for(const r of[[0,0,0,1],[1,0,0,1],[0,1,NaN,1],[]])assert.throws(()=>clipEastWellBedRectangle(r));});
