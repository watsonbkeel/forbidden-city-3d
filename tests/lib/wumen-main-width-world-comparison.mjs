// QA ONLY. Authenticate exactly 88 complete ordinary-solid records, then return
// new comparison arrays with only those records mapped to their pinned old X.
// Actual collision/query state is never altered. No semantic owner IDs were
// added to production: ownership is exact Box3 identity in PalaceBuilder.
import * as THREE from 'three';import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {expectedWidthRows} from './wumen-main-width-contract.mjs';
import {r159JiaotaiPriorComparison} from './r159-jiaotai-prior-comparison.mjs';
const sha=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
const bytes=fs.readFileSync(new URL('../fixtures/r157-wumen-main-width/before-411214.json',import.meta.url));assert.equal(sha(bytes),'2138d5b37119c2d4f34e1d2afb325ee843020a3fa1887011cbf7bfba289d5c28');
const before=JSON.parse(bytes).snapshot,offset=new THREE.Vector3(before.pose.anchor.x,before.pose.position[1],before.pose.anchor.z),solid=new Set(['gable-wall','facade-wall','closed-lattice-panel','open-lattice-leaf','outer-column','interior-column']);
const toBox=r=>new THREE.Box3(new THREE.Vector3().fromArray(r.min),new THREE.Vector3().fromArray(r.max));
const row=b=>({min:b.min.toArray(),max:b.max.toArray(),tag:'static',triangleSupport:null,overhead:null,xiqingRoofSurface:null,duixiuTerrain:false,furnitureMotionScope:null});
const after=expectedWidthRows(before).filter(r=>solid.has(r.part)).map(r=>{
 const p=r.geometry.attributes.position.array,b=new THREE.Box3();for(let i=0;i<p.length;i+=3)b.expandByPoint(new THREE.Vector3(p[i],p[i+1],p[i+2]));
 b.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3().fromArray(r.position),new THREE.Quaternion().fromArray(r.quaternion),new THREE.Vector3().fromArray(r.scale)));b.min.y=Math.max(0,b.min.y);b.max.y=Math.min(3,b.max.y);return b;
});assert.equal(after.length,98);
export const wumenWidthWorldTargets=after.flatMap((b,i)=>{const old=toBox(before.localColliders[i]);return b.equals(old)?[]:[{localIndex:i,before:row(old.translate(offset)),after:row(b.clone().translate(offset))}];});assert.equal(wumenWidthWorldTargets.length,88);
const expected=new Map(wumenWidthWorldTargets.map(r=>[sha(r.after),r]));assert.equal(expected.size,88);
export function wumenMainWidthPriorComparison(W,raw){
 assert.equal(raw.rows.length,30882);assert.equal(W.cm.colliders.length,30882);assert.equal(raw.walkables.length,1365);assert.equal(W.cm.walkables.length,1365);
 const records=[];W.scene.traverse(o=>{for(const r of o.userData.architecture??[])if(r.id==='axis/wumen-upper-tower')records.push(r);});assert.equal(records.length,1);assert.equal(records[0].horizontalGrid.widthRegistration.centreToSide,1.43);assert.equal(records[0].horizontalGrid.widthRegistration.columnAxisTotalSurveyed,false);
 const provider=new Set(W.palaceBuilder.getColliders()),seen=new Set(),matches=[];
 raw.rows.forEach((r,i)=>{const key=sha(r),target=expected.get(key);if(!target)return;assert.ok(!seen.has(key),'duplicate real Wumen target');seen.add(key);const c=W.cm.colliders[i];assert.ok(provider.has(c.mesh),'target owner must be original PalaceBuilder Box3 identity');assert.deepEqual(Object.keys(c.mesh).sort(),['isBox3','max','min']);assert.equal(c.mesh.isBox3,true);assert.deepEqual(c.mesh.min.toArray(),target.after.min);assert.deepEqual(c.mesh.max.toArray(),target.after.max);assert.deepEqual(c.box.min.toArray(),target.after.min);assert.deepEqual(c.box.max.toArray(),target.after.max);
  assert.equal(sha({min:c.box.min.toArray(),max:c.box.max.toArray(),tag:c.tag,triangleSupport:c.triangleSupport??null,overhead:c.overhead??null,xiqingRoofSurface:c.xiqingRoofSurface??null,duixiuTerrain:c.duixiuTerrain??false,furnitureMotionScope:c.furnitureMotionScope??null}),key,'complete actual ordinary-solid physical fields');matches.push({i,target});
 });assert.equal(matches.length,88,'exactly 88 complete reviewed target rows; missing/metadata drift rejected');
 const rows=[...raw.rows],colliders=[...W.cm.colliders];for(const{i,target}of matches){rows[i]=structuredClone(target.before);const box=toBox(target.before);colliders[i]={...colliders[i],mesh:box.clone(),box};}
 const world={...W,cm:{constructor:W.cm.constructor,colliders,walkables:W.cm.walkables,rivers:W.cm.rivers}};
 return {world,physics:{...raw,rows},restoredIndices:matches.map(r=>r.i)};
}
export function wumenWidthThenJiaotaiPriorComparison(W,raw){const width=wumenMainWidthPriorComparison(W,raw);return r159JiaotaiPriorComparison(width.world,width.physics);}
