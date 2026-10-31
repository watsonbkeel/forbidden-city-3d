import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {captureRightLeaf,retainedSignature,digest} from '../../lib/wumen-right-leaf-fixture.mjs';
import {portalPriorComparison} from '../../lib/wumen-side-portal-prior-comparison.mjs';import {portalFaceGroups} from '../../lib/wumen-side-portal-fixture.mjs';
const before=JSON.parse(fs.readFileSync(new URL('../../fixtures/r157-wumen-side-portal/before-db1.json',import.meta.url)));
test('two authenticated front owners alone are removed from a read-only comparison clone in both leaf states',()=>{
 for(const open of [true,false]){const c=captureRightLeaf(open);c.tower=c.group.children.find(o=>o.userData.structure?.id==='axis/wumen-upper-tower');try{const raw=digest(retainedSignature(c)),p=portalPriorComparison(c);
  assert.notEqual(p.view.group,c.group);assert.notEqual(p.view.tower,c.tower);assert.equal(p.view.tower.parent,p.view.group);assert.notEqual(p.view.builder.colliders,c.builder.colliders);assert.notEqual(p.view.builder.walkables,c.builder.walkables);assert.equal(p.view.builder.checkCollision,undefined);assert.equal(p.view.builder.getGroundHeight,undefined);
  assert.equal(portalFaceGroups(p.view).length,0);assert.equal(portalFaceGroups(c).length,2);assert.equal(digest(retainedSignature(p.view)),digest(before[open?'open':'closed']));p.assertUnchanged();assert.equal(digest(retainedSignature(c)),raw);
 }finally{c.builder.dispose();}}
});
test('missing duplicate unknown misplaced target owners cannot be removed as approved additions',()=>{
 for(const mutate of [c=>portalFaceGroups(c)[0].removeFromParent(),c=>{const g=portalFaceGroups(c)[0];g.parent.add(g.clone(true));},c=>{portalFaceGroups(c)[0].userData.wumenSidePortalFace.portalId='other';},c=>{portalFaceGroups(c)[0].position.z+=.01;}]){
  const c=captureRightLeaf();try{mutate(c);assert.throws(()=>portalPriorComparison(c));}finally{c.builder.dispose();}
 }
});
test('non-target scene or physics drift survives the view and fails the unchanged predecessor contract',()=>{
 for(const mutate of [c=>{c.tower.children[0].position.x+=.01;},c=>{c.builder.colliders[0].min.x+=.01;},c=>{c.builder.walkables.pop();}]){
  const c=captureRightLeaf();try{mutate(c);const p=portalPriorComparison(c);assert.notEqual(digest(retainedSignature(p.view)),digest(before.open));}finally{c.builder.dispose();}
 }
 const c=captureRightLeaf();try{const p=portalPriorComparison(c);c.builder.colliders[0].min.x+=.01;assert.throws(p.assertUnchanged);}finally{c.builder.dispose();}
});
test('stale explicit group or ancestor world matrices cannot be authenticated then hidden by cloning',()=>{
 for(const parent of [false,true]){const c=captureRightLeaf();try{c.group.updateMatrixWorld(true);const g=portalFaceGroups(c)[0],target=parent?g.parent:g;target.matrixWorldAutoUpdate=false;target.matrixWorld.elements[12]+=.2;assert.throws(()=>portalPriorComparison(c));}finally{c.builder.dispose();}}
});
for(const mode of ['nested-foreign-mesh','not-a-real-mesh'])test('finite target leaf closure rejects '+mode,()=>{
 const c=captureRightLeaf();try{const m=portalFaceGroups(c)[0].children[0];if(mode==='nested-foreign-mesh')m.add(new c.THREE.Mesh(m.geometry,m.material));else m.isMesh=false;assert.throws(()=>portalPriorComparison(c));}finally{c.builder.dispose();}
});
