import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {restoreR39FidelitySourceIfPresent as inverse} from './lib/r39-fidelity-source-retention.mjs';
import {modelFidelityFor} from '../src/ui/ModelFidelity.js';
const sha=b=>createHash('sha256').update(b).digest('hex');
const r=JSON.parse(readFileSync(new URL('./fixtures/r39-model-fidelity-inverse.json',import.meta.url)));
for(const [path,row]of Object.entries(r.files))test(`R39 historical UI inverse is exact and rejects unreviewed mutation: ${path}`,()=>{
 const live=readFileSync(new URL('../'+path,import.meta.url));assert.equal(sha(live),row.candidateSHA256);assert.equal(sha(inverse(path,live)),row.baselineSHA256);
 for(const changed of [Buffer.concat([live,Buffer.from('\n// unrelated edit')]),Buffer.from(live.toString().replace('modelFidelityFor','unexpectedFunction'))])assert.equal(inverse(path,changed),changed);
 assert.equal(inverse('unregistered.js',live),live);const old=Buffer.from(row.baselineSource);assert.equal(inverse(path,old),old);
});
test('R39 inverse is test-only: live UI still exposes distinct household fit and whole-program uncertainty',()=>{
 assert.match(modelFidelityFor('长春宫').detail,/帘罩/);assert.match(modelFidelityFor('翊坤宫').detail,/通用示意/);assert.match(modelFidelityFor('景仁宫').detail,/待核|未核|未完成/);
});
