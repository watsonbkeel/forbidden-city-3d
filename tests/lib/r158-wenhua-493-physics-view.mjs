import {readWenhua493Gzip} from './r158-wenhua-world-fixture.mjs';
// QA compatibility view only. All live physics tests continue to use raw W.cm.
// Exactly three new real owners are removed from a NEW comparison array and
// six hash-pinned historical ramp rows are reinserted at recorded493 indices.
import fs from 'node:fs';import {gunzipSync} from 'node:zlib';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),hash=x=>sha(JSON.stringify(x));
const bytes=gunzipSync(readWenhua493Gzip());
assert.equal(sha(bytes),'d23fc4371477397c49378352fdb66194f8368ce5e33e616b8c8020588fccd8f5');const baseline=JSON.parse(bytes);
const ids=['wenhua-gate-approach-north','wenhua-gate-approach-south'];
export function wenhua493PhysicsView(W,raw){
 assert.equal(W.cm.colliders.length,30876);assert.equal(raw.rows.length,30876);assert.equal(raw.walkables.length,1365);
 const tagged=W.cm.colliders.flatMap((c,i)=>c.mesh?.wenhuaGateApproach?[{c,i}]:[]);assert.equal(tagged.length,3,'exactly three source owners, never region exemptions');
 const surfaces=tagged.filter(({c})=>c.xiqingRoofSurface),posts=tagged.filter(({c})=>c.mesh.wenhuaGateApproach.kind==='REAL_PLAIN_POST');assert.equal(surfaces.length,2);assert.equal(posts.length,1);assert.deepEqual(surfaces.map(({c})=>c.xiqingRoofSurface.id).sort(),ids);
 for(const {c}of surfaces)assert.equal(c.mesh.wenhuaGateApproach.id,c.xiqingRoofSurface.id);
 const post=posts[0].c,scope=post.furnitureMotionScope;assert.deepEqual(post.box.min.toArray(),[-187.85,0,-257.2].map(Math.fround));assert.deepEqual(post.box.max.toArray(),[-187.55,.94,-256.9].map(Math.fround));assert.equal(scope?.kind,'wenhua-gate-approaches');assert.equal(scope?.id,'wenhua-gate-approaches');assert.equal(scope?.groundY,0);for(const[k,v]of Object.entries({minX:-203.7,maxX:-168.9,minZ:-259,maxZ:-226.8}))assert.ok(Math.abs(scope[k]-v)<1e-10);
 assert.equal(hash(raw.walkables),hash(baseline.retainedSupports),'raw all1365 retained supports exact before projection');assert.equal(hash(raw.rivers),hash(baseline.rivers));
 const excluded=new Set(tagged.map(({i})=>i)),rows=raw.rows.filter((_,i)=>!excluded.has(i));assert.equal(hash(rows.map(hash).sort()),hash(baseline.colliderHashes),'raw all30873 prior collider records exact with duplicates');
 // Existing C/ascent source indices are static-builder prefix indices. Enforce
 // that no removed owner can shift that prefix in inherited comparators.
 const staticEnd=W.palaceBuilder.getColliders().length;assert.ok(tagged.every(({i})=>i>=staticEnd));
 const walkables=[...raw.walkables];assert.equal(baseline.removedSupportIndices.length,6);for(let j=0;j<6;j++)walkables.splice(baseline.removedSupportIndices[j],0,structuredClone(baseline.removedSupports[j]));assert.equal(hash(walkables),hash(baseline.walkables));assert.notEqual(rows,raw.rows);assert.notEqual(walkables,raw.walkables);
 return{rows,walkables,rivers:raw.rivers};
}
