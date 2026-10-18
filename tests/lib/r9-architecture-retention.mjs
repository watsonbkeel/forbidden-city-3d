import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/r9-architecture-source-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
// Exact bounded R9 integration only; retained historical hashes stay unchanged.
// Live geometry, collision and merge checks are in the focused R9 tests.
export function restorePreR9Architecture(path,bytes){
 const d=delta.files[path];if(!d)return bytes;
 const s=bytes.toString();
 if(!s.includes('buildTaiheRearEnclosure')&&!s.includes('buildTaiheCofferFrame'))return bytes;
 assert.equal(sha(bytes),d.candidateSHA256,'exact R9 architecture integration');let out=s;
 for(const h of d.deltas){assert.equal(out.split(h.after).length,2);out=out.replace(h.after,h.before);}
 assert.equal(sha(out),d.baselineSHA256);return Buffer.from(out);
}
