import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync('tests/r57-unified-world.test.mjs','utf8');
function consortCamera(text){return JSON.parse(text.match(/\['chuxiu-consort-01',(\[\[.*?\]\])\]/)[1]);}
test('R57 keeps the frozen R56 legal Chuxiu observer, not a numeric population substitution',()=>{
 const expected=[[101.5,2.3,435],[100.22,1.6,438.16]];
 assert.deepEqual(consortCamera(fs.readFileSync('tests/r56-unified-world.test.mjs','utf8')),expected);
 assert.deepEqual(consortCamera(source),expected);
});
