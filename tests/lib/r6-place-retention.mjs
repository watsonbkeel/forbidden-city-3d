import {restoreR31CombinedSourceIfPresent} from './r31-combined-source-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import baseline from '../fixtures/r6-complete-place-cards.json' with {type:'json'};
export {baseline};
const sha=v=>createHash('sha256').update(v).digest('hex');
export function restoreR6PlaceCatalog(raw){
 raw=restoreR31CombinedSourceIfPresent('data/places/zh-CN.json',Buffer.from(raw)).toString();
 const data=JSON.parse(raw),b=baseline.catalog;
 assert.equal(raw,JSON.stringify(data,null,2)+'\n','canonical R6 catalog');
 assert.equal(data.places.length,b.basePlaceCount+b.addedPlaceCount,'exact 145-card addition');
 assert.equal(data.sources.length,b.baseSourceCount+b.addedSourceCount,'exact R6 source addition');
 assert.equal(sha(JSON.stringify(data.places.slice(b.basePlaceCount))),b.addedPlacesSHA256,'exact reviewed added cards');
 assert.equal(sha(JSON.stringify(data.sources.slice(b.baseSourceCount))),b.addedSourcesSHA256,'exact reviewed added sources');
 for(const [key,delta]of Object.entries(b.metadata)){assert.deepEqual(data[key],delta.after,'exact R6 catalog metadata');data[key]=delta.before;}
 data.places.length=b.basePlaceCount;data.sources.length=b.baseSourceCount;
 const restored=JSON.stringify(data,null,2)+'\n';assert.equal(sha(restored),b.baseSHA256,'original fourteen cards and sources retained');return restored;
}
export function restoreR6PlaceSource(path,raw){
 raw=restoreR31CombinedSourceIfPresent(path,Buffer.from(raw)).toString();
 if(!baseline.sourceDeltas[path])return raw;
 let restored=raw;
 for(const d of baseline.sourceDeltas[path]){assert.equal(restored.split(d.after).length-1,1,'R6 hunk must occur exactly once');restored=restored.replace(d.after,d.before);}
 assert.equal(sha(restored),baseline.baseFiles[path],'only exact R6 place UI changes allowed');return restored;
}
