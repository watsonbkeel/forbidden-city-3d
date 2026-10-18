import {restorePreR12InnerSource} from './r12-inner-source-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r11-floor-source-delta.json' with {type:'json'};
import mesh from '../fixtures/r11-floor-mesh-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex'),hash=v=>sha(JSON.stringify(v));
export function restorePreR11FloorSource(path,bytes){
 bytes=restorePreR12InnerSource(path,bytes);
 if(path!==source.path||!bytes.toString().includes('taiheFloorMaterial'))return bytes;
 assert.equal(sha(bytes),source.afterSHA256,'exact R11 floor integration');let out=bytes.toString();
 for(const d of source.deltas){assert.equal(out.split(d.after).length,2);out=out.replace(d.after,d.before);}
 assert.equal(sha(out),source.beforeSHA256);return Buffer.from(out);
}
export function restorePreR11FloorRows(rows){
 if(hash(rows)===mesh.beforeSHA256)return rows;
 assert.equal(rows.length,mesh.meshCount);assert.equal(hash(rows),mesh.afterSHA256,'exact R11 single floor change');
 assert.equal(hash(rows[mesh.floorIndex]),mesh.afterSHA256Row);const out=structuredClone(rows);out[mesh.floorIndex]=structuredClone(mesh.before);
 assert.equal(hash(out),mesh.beforeSHA256);return out;
}
