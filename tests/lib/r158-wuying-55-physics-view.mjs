// QA only: authenticate every actual new target record and every retained row,
// then provide NEW rows with exactly126 historical source owners substituted.
// No live collision manager, triangles, supports, rivers or motion are changed.
import {readWuying55Gzip} from './r158-wuying-world-fixture.mjs';
import fs from 'node:fs';import {gunzipSync} from 'node:zlib';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),hash=v=>sha(JSON.stringify(v));
const bytes=gunzipSync(readWuying55Gzip());assert.equal(sha(bytes),'f1c8ba0007a0540e51a9c50a9a9fcca40933e8e1e6e3eb3715df9c066290e031');const base=JSON.parse(bytes);
const targetBytes=fs.readFileSync(new URL('../fixtures/r158-wuying-integration/reviewed-56574-target.json',import.meta.url));assert.equal(sha(targetBytes),'0113f1f0de9db208d257a073eebbe8c519047ea7594d2eb1c653db7d1e67cae3');const target=JSON.parse(targetBytes),oldById=new Map(base.oldWuyingRows.map(r=>[r.triangleSupport.id,r])),newById=new Map(target.rows.map(r=>[r.triangleSupport.id,hash(r)]));assert.equal(oldById.size,126);assert.equal(newById.size,126);assert.deepEqual([...oldById.keys()].sort(),[...newById.keys()].sort());
export function wuying55PhysicsView(raw){
 assert.equal(raw.rows.length,30876,'raw collider count');assert.equal(raw.walkables.length,1365,'raw support count');
 const owned=raw.rows.filter(r=>newById.has(r.triangleSupport?.id));assert.equal(owned.length,126,'exact126 source owners');assert.equal(new Set(owned.map(r=>r.triangleSupport.id)).size,126,'unique source owners');
 for(const r of owned)assert.equal(hash(r),newById.get(r.triangleSupport.id),'reviewed target record drift');
 assert.equal(hash(raw.rows.filter(r=>!newById.has(r.triangleSupport?.id)).map(hash).sort()),hash(base.retainedNonWuyingColliderHashes),'all30750 non-target records exact');
 assert.equal(hash(raw.walkables),hash(base.walkables),'all1365 raw supports exact');assert.equal(hash(raw.rivers),hash(base.rivers),'raw water exact');
 const rows=raw.rows.map(r=>oldById.has(r.triangleSupport?.id)?structuredClone(oldById.get(r.triangleSupport.id)):r);assert.equal(hash(rows.map(hash).sort()),hash(base.allColliderHashes),'projected55 complete multiset');assert.notEqual(rows,raw.rows);
 return {rows,walkables:raw.walkables,rivers:raw.rivers};
}
