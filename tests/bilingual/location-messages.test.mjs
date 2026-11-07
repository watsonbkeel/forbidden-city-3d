import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,readdirSync} from 'node:fs';
import {translateText} from '../../src/i18n/Messages.js';
const zones=readdirSync(new URL('../../data/zones/',import.meta.url)).filter(f=>f.endsWith('.json')).map(file=>JSON.parse(readFileSync(new URL(`../../data/zones/${file}`,import.meta.url))));
const collision=readFileSync(new URL('../../src/utils/Collision.js',import.meta.url),'utf8');
const fallbacks=[...collision.slice(collision.indexOf('  getCurrentLocation(position)')).matchAll(/'([^']+)'/gu)].map(m=>m[1]).filter(s=>/[\u3400-\u9fff]/u.test(s));
test('all actual zone names and collision fallback labels translate in the main location and flight compositions',()=>{
 assert.equal(zones.length,7);assert.ok(fallbacks.length>=20);
 for(const zone of [...zones.map(z=>z.name),'宫城']){
  assert.doesNotMatch(translateText(`虚拟飞行 · 25m · ${zone}`,'en'),/unavailable|[\u3400-\u9fff]/u,zone);
  for(const label of fallbacks)assert.doesNotMatch(translateText(`${zone} › ${label}`,'en'),/unavailable|[\u3400-\u9fff]/u,`${zone} > ${label}`);
 }
});
