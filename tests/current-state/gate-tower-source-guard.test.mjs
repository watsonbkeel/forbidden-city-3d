import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {readHistoricalSource} from '../lib/historical-sources.mjs';
import {SHENWU_CONSTANTS_DELTA,expectedGateConstantsBytes,assertGateConstantsBytes} from '../lib/v9-gate-constants-delta.mjs';
const historical=readHistoricalSource('35914d6c2bc16dbb9fd7245d6384195ece5e125d','src/config/constants.js');
const current=fs.readFileSync(new URL('../../src/config/constants.js',import.meta.url));
test('only the finite approved Shenwu nominal boundary/provenance replacement is accepted',()=>{assertGateConstantsBytes(historical,current);assert.deepEqual(current,expectedGateConstantsBytes(historical));});
for(const mutation of ['missing-anchor','duplicate-anchor','historical-extra-byte'])test(`constants guard rejects ${mutation}`,()=>{
 let source=historical.toString();if(mutation==='missing-anchor')source=source.replace(SHENWU_CONSTANTS_DELTA.before,'');if(mutation==='duplicate-anchor')source+=SHENWU_CONSTANTS_DELTA.before;if(mutation==='historical-extra-byte')source+='\n';
 assert.throws(()=>expectedGateConstantsBytes(Buffer.from(source)),mutation==='historical-extra-byte'?/historical/:/exactly once/);
});
for(const [label,edit] of [
 ['no migration',s=>historical.toString()],['width only omitted',s=>s.replace('width: 50.18,','width: 50,')],['depth only omitted',s=>s.replace('depth: 26.46,','depth: 20,')],
 ['provenance missing',s=>s.replace(SHENWU_CONSTANTS_DELTA.after.split('\n')[0],'  // 神武门')],['anchor changed',s=>s.replace('SHENWU_Z: 542','SHENWU_Z: 531')],
 ['physics changed',s=>s.replace('HEIGHT: 1.7','HEIGHT: 1.6')],['arbitrary extra bytes',s=>s+'\n'],['another historical constant changed',s=>s.replace('WUMEN_Z: -419.6','WUMEN_Z: -419.7')],
])test(`constants guard rejects candidate ${label}`,()=>{const mutated=edit(current.toString());assert.notEqual(mutated,current.toString(),'mutation fixture must actually mutate');assert.throws(()=>assertGateConstantsBytes(historical,Buffer.from(mutated)));});
