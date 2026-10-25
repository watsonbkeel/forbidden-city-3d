import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const b=readFileSync(new URL('../../public/models/interiors/yangxin.glb',import.meta.url)),g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
test('R88 replaces the old three-metre east ghost collider with stable fitted furniture',()=>{assert.ok(!g.nodes.some(n=>n.name==='COL_east_dais'),'old COL_east_dais still present');assert.ok(g.nodes.some(n=>n.name==='R88_YX_CHAIR'));});
