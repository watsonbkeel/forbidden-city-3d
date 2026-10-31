// QA-only view: authenticate the complete new decoration before removing exactly
// those two appended groups from a cloned hierarchy. No physical query interface.
import assert from 'node:assert/strict';
import {verifyPortalFaces,portalFaceGroups} from './wumen-side-portal-fixture.mjs';
import {snapshotWidth} from './wumen-main-width-snapshot.mjs';
import {retainedSignature,digest} from './wumen-right-leaf-fixture.mjs';
import {verifyWidthContract as originalWidthContract,priorWidthComparison as originalWidthComparison} from './wumen-main-width-contract.mjs';
export {expectedWidthAxes} from './wumen-main-width-contract.mjs';
const signature=c=>digest({width:snapshotWidth(c),retained:retainedSignature(c)});
export function portalPriorComparison(c){
 verifyPortalFaces(c);const before=signature(c),colliders=c.builder.colliders,walkables=c.builder.walkables,colliderRefs=[...colliders],supportRefs=[...walkables],rawGroup=c.group,rawTower=c.tower;
 const group=c.group.clone(true),index=c.group.children.indexOf(c.tower);assert.ok(index>=0);const tower=group.children[index];assert.equal(tower.userData.structure.id,'axis/wumen-upper-tower');tower.userData.colliders=c.tower.userData.colliders;
 const groups=portalFaceGroups({...c,group});assert.equal(groups.length,2);assert.equal(groups[0].parent,groups[1].parent);assert.deepEqual(groups[0].parent.children.slice(-2),groups,'only authenticated appended owners removed');for(const g of groups)g.removeFromParent();group.updateMatrixWorld(true);
 const view={...c,group,tower,builder:{colliders:[...colliders],walkables:[...walkables]}};
 const assertUnchanged=()=>{assert.equal(c.group,rawGroup);assert.equal(c.tower,rawTower);assert.equal(c.builder.colliders,colliders);assert.equal(c.builder.walkables,walkables);assert.equal(colliders.length,colliderRefs.length);assert.equal(walkables.length,supportRefs.length);colliders.forEach((r,i)=>assert.equal(r,colliderRefs[i]));walkables.forEach((r,i)=>assert.equal(r,supportRefs[i]));assert.equal(signature(c),before,'actual scene/physical recorded fields unchanged');verifyPortalFaces(c);};
 assertUnchanged();return {view,assertUnchanged};
}
export function verifyWidthContract(c,before){const p=portalPriorComparison(c);try{return originalWidthContract(p.view,before);}finally{p.assertUnchanged();}}
export function priorWidthComparison(c,before){const p=portalPriorComparison(c);try{return originalWidthComparison(p.view,before);}finally{p.assertUnchanged();}}
