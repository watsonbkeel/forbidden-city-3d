import {restoreR16SourceIfPresent,restorePreR16SceneRow}from './r16-baohe-retention.mjs';
import assert from 'node:assert/strict';import{createHash}from'node:crypto';
import source from'../fixtures/r13-plaque-source-delta.json'with{type:'json'};
import mesh from'../fixtures/r13-plaque-mesh-delta.json'with{type:'json'};
import baseline from'../fixtures/r13-plaque-baseline.json'with{type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex'),hash=x=>sha(JSON.stringify(x));
export function restorePreR13PlaqueSource(path,bytes){bytes=restoreR16SourceIfPresent(path,bytes);const d=source.files[path];if(!d||sha(bytes)===d.beforeSHA256)return bytes;const s=bytes.toString();if(!s.includes('TaihePlaqueFrame'))return bytes;assert.equal(sha(bytes),d.afterSHA256,'exact R13 plaque source delta');let out=s;for(const h of d.deltas){assert.equal(out.split(h.after).length,2);out=out.replace(h.after,h.before);}assert.equal(sha(out),d.beforeSHA256);return Buffer.from(out);}
export function restorePreR13PlaqueRows(rows){const marker=mesh.pairs.find(p=>p.before.material.name==='taihe_glyph_atlas').afterSHA256;if(!rows.some(r=>hash(r)===marker))return rows;assert.equal(rows.length,mesh.meshCount);assert.equal(hash(rows),mesh.afterSHA256,'exact R13 fallback plaque rows');const out=structuredClone(rows);for(const p of mesh.pairs){assert.equal(hash(out[p.index]),p.afterSHA256);out[p.index]=structuredClone(p.before);}assert.equal(hash(out),mesh.beforeSHA256);return out;}
export function restorePreR13SceneRow(name,row){
 if(name!=='三台'||JSON.stringify(row)===JSON.stringify(baseline.sceneBefore))return row;
 // Later private materials can split batches. Historical dispatch is based on
 // exact registered identities through the reverse chain, never mesh count.
 row=restorePreR16SceneRow(name,row);
 assert.deepEqual(row,baseline.sceneAfter,'exact R13 plaque-only full scene row');
 return structuredClone(baseline.sceneBefore);
}
