import assert from 'node:assert/strict';import crypto from 'node:crypto';import {wuying55PhysicsView} from '../../../lib/r158-wuying-55-physics-view.mjs';
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const fingerprint=p=>hash([p.rows.map(hash),hash(p.walkables),hash(p.rivers)]);
export function assertWuying55PhysicsProof(raw){
 const before=fingerprint(raw),rowsIdentity=raw.rows,supportsIdentity=raw.walkables,riversIdentity=raw.rivers,view=wuying55PhysicsView(raw);assert.equal(view.rows.length,30876);assert.equal(view.walkables.length,1365);
 const target=raw.rows.findIndex(r=>r.triangleSupport?.id.startsWith('wuying-bridge-rails:')),other=raw.rows.findIndex(r=>!r.triangleSupport?.id?.startsWith('wuying-bridge-rails:'));
 const replace=(i,r)=>({...raw,rows:raw.rows.map((v,j)=>j===i?r:v)});
 assert.throws(()=>wuying55PhysicsView(replace(other,{...raw.rows[other],min:[raw.rows[other].min[0]+.001,...raw.rows[other].min.slice(1)]})),/non-target/);
 assert.throws(()=>wuying55PhysicsView({...raw,rows:raw.rows.slice(1)}),/collider count/);
 assert.throws(()=>wuying55PhysicsView({...raw,walkables:raw.walkables.map((w,i)=>i===0?{...w,rescue:!w.rescue}:w)}),/supports exact/);
 assert.throws(()=>wuying55PhysicsView({...raw,rivers:[]}),/water exact/);
 assert.throws(()=>wuying55PhysicsView(replace(target,{...raw.rows[target],triangleSupport:{...raw.rows[target].triangleSupport,id:'forged-wuying-owner'}})),/exact126/);
 assert.throws(()=>wuying55PhysicsView(replace(target,{...raw.rows[target],min:[raw.rows[target].min[0]+.001,...raw.rows[target].min.slice(1)]})),/target record drift/);
 const second=raw.rows.findIndex((r,i)=>i!==target&&r.triangleSupport?.id.startsWith('wuying-bridge-rails:'));assert.throws(()=>wuying55PhysicsView(replace(second,raw.rows[target])),/unique source/);
 assert.equal(fingerprint(raw),before);assert.equal(raw.rows,rowsIdentity);assert.equal(raw.walkables,supportsIdentity);assert.equal(raw.rivers,riversIdentity);assert.equal(view.walkables,supportsIdentity);assert.equal(view.rivers,riversIdentity);
 return {rawColliders:30876,reviewedTargets:126,retainedNonTargets:30750,rawSupports:1365,mutationNegatives:7,rawUnmodified:true,projectedColliders:30876};
}
