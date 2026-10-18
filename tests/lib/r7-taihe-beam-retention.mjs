import {restorePreTaiheDaisSource} from './r7-taihe-dais-retention.mjs';
import {restorePreR9Architecture} from './r9-architecture-retention.mjs';
import {restorePreTaiheFrontSource} from './r7-taihe-front-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/r7-taihe-beam-source-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
// Exact two additive hunks only; historical fixture hashes remain unchanged.
export function restorePreR7Beams(path,bytes) {
 bytes=restorePreR9Architecture(path,bytes);
 bytes=restorePreTaiheDaisSource(path,bytes);
 bytes=restorePreTaiheFrontSource(path,bytes);
 if(path!==delta.path)return bytes;
 const s=bytes.toString();if(!s.includes("import { buildTaiheBeamFrame }"))return bytes;
 assert.equal(sha(bytes),delta.candidateSHA256,'exact R7 beam candidate source');let out=s;
 for(const h of delta.deltas){assert.equal(out.split(h.after).length,2);out=out.replace(h.after,h.before);}
 assert.equal(sha(out),delta.baselineSHA256);return Buffer.from(out);
}
