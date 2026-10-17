import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/taihe-furniture-source-delta.json' with {type:'json'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
// Reverse one declared identity-check insertion before historical source guards.
// Current source and the live furniture asset are independently checked by the
// furniture integration test; this adapter never substitutes live geometry.
export function restorePreFurnitureSource(path,bytes) {
 const row=delta.files[path];if(!row)return bytes;
 let source=bytes.toString();
 if(!row.deltas.some(h=>source.includes(h.after)))return bytes;
 for(const h of row.deltas){assert.equal(source.split(h.after).length,2,'one exact furniture identity hunk');source=source.replace(h.after,h.before);}
 assert.equal(sha(source),row.baselineSHA256,'all unrelated pre-furniture source bytes retained');
 return Buffer.from(source);
}
