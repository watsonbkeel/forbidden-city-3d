import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {restoreR54Reports} from '../scripts/r54-restore-report-archives.mjs';
const index=JSON.parse(fs.readFileSync('reports/r54-transport/ARCHIVES.json'));
test('R54 report containers restore every original frozen byte and Git blob identity',()=>{const r=restoreR54Reports();assert.equal(r.length,index.archives.length);assert.ok(r.length>0);assert.equal(index.archives.some(e=>e.path.startsWith('tests/')||e.path.startsWith('src/')||e.path.startsWith('data/')),false);});
test('missing report part fails closed',()=>{assert.throws(()=>restoreR54Reports({read:()=>{throw Error('missing part');}}),/missing part/);});
test('wrong order fails closed',()=>{const bad=structuredClone(index),entry=bad.archives.find(e=>e.parts.length>1);assert.ok(entry);entry.parts.reverse();assert.throws(()=>restoreR54Reports({index:bad}),/order/);});
test('damaged report part fails closed',()=>{let changed=false;assert.throws(()=>restoreR54Reports({read:p=>{const b=fs.readFileSync(p);if(!changed){b[0]^=1;changed=true;}return b;}}),/corrupt/);});
