// QA-only finite view. Authenticate all64 new caps, then remove their sole
// appended owner from a clone. Runtime queries always use the actual world.
import assert from 'node:assert/strict';
import {leftStudGroups,verifyLeftStudFace,recordedGateSignature} from './wumen-left-leaf-fixture.mjs';
import {digest} from './wumen-right-leaf-fixture.mjs';
import {verifyPortalFaces} from './wumen-side-portal-fixture.mjs';
import {portalPriorComparison as priorPortal,verifyWidthContract as priorWidthContract,priorWidthComparison as priorWidth} from './wumen-side-portal-prior-comparison.mjs';
export {expectedWidthAxes} from './wumen-main-width-contract.mjs';
export function leftPriorComparison(c){
 verifyLeftStudFace(c);const rawGroup=c.group,rawTower=c.tower,colliders=c.builder.colliders,walkables=c.builder.walkables,colliderRefs=[...colliders],supportRefs=[...walkables],before=digest(recordedGateSignature(c)),rawStud=leftStudGroups(c)[0],capRefs=[...rawStud.children];
 const towers=c.group.children.filter(o=>o.userData.structure?.id==='axis/wumen-upper-tower');assert.equal(towers.length,1);const towerIndex=c.group.children.indexOf(towers[0]);
 const group=c.group.clone(true),tower=group.children[towerIndex];assert.equal(tower.userData.structure.id,'axis/wumen-upper-tower');tower.userData.colliders=towers[0].userData.colliders;
 const groups=leftStudGroups({...c,group});assert.equal(groups.length,1);assert.equal(groups[0].parent.children.at(-1),groups[0],'only appended left owner removed');groups[0].removeFromParent();group.updateMatrixWorld(true);
 const view={...c,group,tower,builder:{colliders:[...colliders],walkables:[...walkables]}};
 const assertUnchanged=()=>{assert.equal(c.group,rawGroup);assert.equal(c.tower,rawTower);assert.equal(c.builder.colliders,colliders);assert.equal(c.builder.walkables,walkables);assert.equal(colliders.length,colliderRefs.length);assert.equal(walkables.length,supportRefs.length);colliders.forEach((x,i)=>assert.equal(x,colliderRefs[i]));walkables.forEach((x,i)=>assert.equal(x,supportRefs[i]));assert.equal(leftStudGroups(c)[0],rawStud);assert.equal(rawStud.children.length,capRefs.length);rawStud.children.forEach((x,i)=>assert.equal(x,capRefs[i]));assert.equal(digest(recordedGateSignature(c)),before);verifyLeftStudFace(c);};
 assertUnchanged();return{view,assertUnchanged};
}
export function portalPriorComparison(c){verifyPortalFaces(c);const p=leftPriorComparison(c);try{const q=priorPortal(p.view);return{view:q.view,assertUnchanged:()=>{q.assertUnchanged();p.assertUnchanged();verifyPortalFaces(c);}};}finally{p.assertUnchanged();verifyPortalFaces(c);}}
export function verifyWidthContract(c,before){verifyPortalFaces(c);const p=leftPriorComparison(c);try{return priorWidthContract(p.view,before);}finally{p.assertUnchanged();verifyPortalFaces(c);}}
export function priorWidthComparison(c,before){verifyPortalFaces(c);const p=leftPriorComparison(c);try{return priorWidth(p.view,before);}finally{p.assertUnchanged();verifyPortalFaces(c);}}
