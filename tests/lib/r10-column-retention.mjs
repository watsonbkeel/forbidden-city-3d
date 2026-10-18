import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/r10-column-source-delta.json' with {type:'json'};
import meshes from '../fixtures/r10-column-mesh-delta.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
const hash=v=>sha(JSON.stringify(v));
// Finite approved source substitutions; any unrelated edit is rejected.
export function restorePreR10Columns(path,bytes){
 const d=delta.files[path];if(!d)return bytes;
 if(sha(bytes)===d.baselineSHA256)return bytes;
 const marker=path.endsWith('/PalaceBuilder.js')?'taiheColumnGrid':'openLeft = -openHalf';
 if(!bytes.toString().includes(marker))return bytes;
 assert.equal(sha(bytes),d.candidateSHA256,'exact R10 column integration');let out=bytes.toString();
 for(const h of d.deltas){assert.equal(out.split(h.after).length,2);out=out.replace(h.after,h.before);}
 assert.equal(sha(out),d.baselineSHA256);return Buffer.from(out);
}
// Exact geometry-delta normalization, preserving every old non-target hash.
// Current live geometry/navigation is independently checked in R10 integration.
export function restorePreR10MeshRows(rows){
 assert.equal(rows.length,meshes.meshCount);assert.equal(hash(rows),meshes.afterSHA256);
 const out=structuredClone(rows);
 for(const p of meshes.pairs){assert.equal(hash(out[p.index]),p.afterSHA256);out[p.index]=structuredClone(p.before);}
 assert.equal(hash(out),meshes.beforeSHA256);return out;
}
