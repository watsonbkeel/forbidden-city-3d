import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r7-taihe-front-source-delta.json' with {type:'json'};
import route from '../fixtures/r7-taihe-front-route-delta.json' with {type:'json'};
import {restorePreZhongheApproaches,withLegacyZhongheApproaches} from './r8-zhonghe-retention.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
export function restorePreTaiheFrontSource(path,bytes) {
 bytes=restorePreZhongheApproaches(path,bytes);
 if(path!==source.path||!bytes.toString().includes('taiheSouthTier'))return bytes;
 assert.equal(sha(bytes),source.candidateSHA256,'exact R7 south-approach integration');let text=bytes.toString();
 for(const h of source.deltas){assert.equal(text.split(h.after).length,2);text=text.replace(h.after,h.before);}
 assert.equal(sha(text),source.baselineSHA256);return Buffer.from(text);
}
export function withLegacyTaiheFrontRoute(routes){
 routes=withLegacyZhongheApproaches(routes);
 return routes.map(r=>{if(r.name!==route.after.name)return r;if(JSON.stringify(r)===JSON.stringify(route.before))return r;
 assert.deepEqual(r,route.after,'only the exact source-derived south-approach route is version-normalized');return route.before;});
}
