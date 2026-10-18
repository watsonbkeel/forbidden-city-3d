import assert from 'node:assert/strict';
import {restorePreR9Architecture} from './r9-architecture-retention.mjs';
import {createHash} from 'node:crypto';
import source from '../fixtures/r8-zhonghe-source-delta.json' with {type:'json'};
import routes from '../fixtures/r8-zhonghe-route-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
/** Finite version normalization only. Current geometry/routes are tested live. */
export function restorePreZhongheApproaches(path,bytes){
 bytes=restorePreR9Architecture(path,bytes);
 if(path!==source.path||!bytes.toString().includes('buildZhongheImperialApproach'))return bytes;
 assert.equal(sha(bytes),source.candidateSHA256,'exact R8 Zhonghe-only integration');let text=bytes.toString();
 for(const h of source.deltas){assert.equal(text.split(h.after).length,2);text=text.replace(h.after,h.before);}
 assert.equal(sha(text),source.baselineSHA256);return Buffer.from(text);
}
export function withLegacyZhongheApproaches(rows){return rows.map(r=>{
 const d=routes.delta.find(d=>d.after.name===r.name);if(!d)return r;
 if(JSON.stringify(r)===JSON.stringify(d.before))return r;
 assert.deepEqual(r,d.after,'exact R8 side-stair descriptors');return structuredClone(d.before);
});}
