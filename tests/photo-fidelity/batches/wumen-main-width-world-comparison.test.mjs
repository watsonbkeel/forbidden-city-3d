import test from 'node:test';import assert from 'node:assert/strict';
import {captureGate} from '../../lib/gate-tower-fixture.mjs';import {CollisionManager} from '../../../src/utils/Collision.js';
import {taiheWorldPhysics} from '../../lib/r157-taihe-world-retention.mjs';import {digest} from '../../lib/wumen-right-leaf-fixture.mjs';
import {wumenMainWidthPriorComparison,wumenWidthWorldTargets} from '../../lib/wumen-main-width-world-comparison.mjs';
function synthetic(){const c=captureGate(),cm=new CollisionManager();cm.addColliders(c.builder.colliders,'static');for(let i=cm.colliders.length;i<30882;i++)cm.addCollider(new c.THREE.Box3(new c.THREE.Vector3(10000+i,0,0),new c.THREE.Vector3(10000+i+.1,1,1)),'static');cm.walkables=Array.from({length:1365},()=>({synthetic:true}));return{c,W:{THREE:c.THREE,cm,palaceBuilder:c.builder,scene:{traverse:fn=>fn({userData:{architecture:[c.tower.userData.structure]}})}},raw:taiheWorldPhysics({cm})};}
test('synthetic world-array wrapper authenticates actual component 88 complete rows and preserves comparison index/constructor/nonmutation contracts',()=>{
 const {c,W,raw}=synthetic();try{const hash=digest(raw),originalColliders=W.cm.colliders,view=wumenMainWidthPriorComparison(W,raw);assert.equal(view.restoredIndices.length,88);assert.equal(new Set(view.restoredIndices).size,88);assert.equal(view.world.cm.constructor,CollisionManager);assert.equal(view.world.cm.checkCollision,undefined);assert.equal(view.world.cm.getGroundHeight,undefined);assert.equal(view.world.cm.walkables,W.cm.walkables);assert.equal(view.world.cm.rivers,W.cm.rivers);assert.notEqual(view.physics.rows,raw.rows);assert.notEqual(view.world.cm.colliders,W.cm.colliders);
 const seen=new Set(view.restoredIndices);for(let i=0;i<30882;i++){if(!seen.has(i)){assert.equal(view.physics.rows[i],raw.rows[i]);assert.equal(view.world.cm.colliders[i],W.cm.colliders[i]);}else{const r=wumenWidthWorldTargets.find(t=>digest(t.after)===digest(raw.rows[i]));assert(r);assert.deepEqual(view.physics.rows[i],r.before);assert.deepEqual(view.world.cm.colliders[i].box.min.toArray(),r.before.min);assert.deepEqual(view.world.cm.colliders[i].box.max.toArray(),r.before.max);assert.notEqual(view.world.cm.colliders[i],W.cm.colliders[i]);}}
 assert.equal(digest(raw),hash);assert.equal(W.cm.colliders,originalColliders);const probe=new view.world.cm.constructor();probe.addWalkables([{type:'box',rescue:false,box:new c.THREE.Box3(new c.THREE.Vector3(0,0,0),new c.THREE.Vector3(1,1,1))}]);assert.equal(probe.walkables.length,1);assert.equal(W.cm.walkables.length,1365);
 for(const r of wumenWidthWorldTargets){assert.deepEqual(r.before.min.slice(1),r.after.min.slice(1));assert.deepEqual(r.before.max.slice(1),r.after.max.slice(1));const a={...r.before,min:[],max:[]},b={...r.after,min:[],max:[]};assert.deepEqual(a,b);}
 }finally{c.builder.dispose();}
});
test('synthetic wrapper rejects missing/duplicate/forged provider, actual bounds and every physical metadata drift',()=>{
 const{c,W,raw}=synthetic();try{const good=wumenMainWidthPriorComparison(W,raw),i=good.restoredIndices[0];
 const rawPatch=p=>({...raw,rows:raw.rows.map((r,j)=>j===i?{...r,...p}:r)});
 for(const patch of[{tag:'other'},{triangleSupport:{}},{overhead:{}},{xiqingRoofSurface:{}},{duixiuTerrain:true},{furnitureMotionScope:{}},{min:[raw.rows[i].min[0]+.01,...raw.rows[i].min.slice(1)]},{extra:true}])assert.throws(()=>wumenMainWidthPriorComparison(W,rawPatch(patch)));
 assert.throws(()=>wumenMainWidthPriorComparison(W,{...raw,rows:raw.rows.slice(1)}));
 assert.throws(()=>wumenMainWidthPriorComparison(W,{...raw,rows:raw.rows.map((r,j)=>j===30881?raw.rows[i]:r)}));
 const changed=patch=>({...W,cm:{...W.cm,colliders:W.cm.colliders.map((r,j)=>j===i?{...r,...patch}:r)}});
 assert.throws(()=>wumenMainWidthPriorComparison(changed({mesh:W.cm.colliders[i].mesh.clone()}),raw));
 assert.throws(()=>wumenMainWidthPriorComparison(changed({box:W.cm.colliders[i].box.clone().translate(new c.THREE.Vector3(.01,0,0))}),raw));
 for(const patch of[{tag:'other'},{triangleSupport:{}},{overhead:{}},{xiqingRoofSurface:{}},{duixiuTerrain:true},{furnitureMotionScope:{}}])assert.throws(()=>wumenMainWidthPriorComparison(changed(patch),raw));
 assert.throws(()=>wumenMainWidthPriorComparison({...W,scene:{traverse:fn=>{const o={userData:{architecture:[c.tower.userData.structure]}};fn(o);fn(o);}}},raw));
 }finally{c.builder.dispose();}
});
