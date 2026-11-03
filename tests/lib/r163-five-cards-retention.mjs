import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import baseline from '../fixtures/r163-five-place-cards.json' with {type:'json'};
const sha=value=>createHash('sha256').update(value).digest('hex');
// Strip only this exact additive delta before the older historical retention checks.
// Do not refresh or bypass their existing hashes.
export function restoreBeforeR163FiveCards(raw) {
  raw=raw.toString();const data=JSON.parse(raw);
  if(data.places.length===baseline.basePlaceCount)return raw;
  assert.equal(raw,JSON.stringify(data,null,2)+'\n','canonical R163 catalog');
  assert.equal(data.places.length,baseline.basePlaceCount+5,'exact five-card addition');
  assert.equal(data.sources.length,baseline.baseSourceCount+1,'exact one-source addition');
  assert.equal(sha(JSON.stringify(data.places.slice(baseline.basePlaceCount))),baseline.addedPlacesSHA256,'exact reviewed five cards');
  assert.equal(sha(JSON.stringify(data.sources.slice(baseline.baseSourceCount))),baseline.addedSourcesSHA256,'exact reviewed source');
  data.places.length=baseline.basePlaceCount;data.sources.length=baseline.baseSourceCount;
  const restored=JSON.stringify(data,null,2)+'\n';
  assert.equal(sha(restored),baseline.baseSHA256,'all 2110597f catalog bytes retained');
  return restored;
}
