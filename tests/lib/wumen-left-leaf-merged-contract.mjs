// Signature of actual canonical merged target, not external photographic gold.
import assert from 'node:assert/strict';import {meshFingerprint} from './gate-tower-fixture.mjs';import {renderStateHash} from './r157-wumen-main-signature.mjs';
export function mergedLeftSignature(root){
 root.updateMatrixWorld(true);const targets=[];root.traverse(o=>{if(o.material?.name==='wumen_left_yemen_stud_gold_fit')targets.push(o);});assert.equal(targets.length,1);const m=targets[0];assert.equal(m.parent,root);assert.equal(m.isMesh,true);assert.equal(m.type,'Mesh');assert.equal(m.children.length,0);
 for(let o=m;o;o=o.parent){assert.equal(o.visible,true);assert.equal(o.matrixAutoUpdate,true);assert.equal(o.matrixWorldAutoUpdate,true);const local=o.matrix.clone().compose(o.position,o.quaternion,o.scale),world=o.parent?o.parent.matrixWorld.clone().multiply(local):local;assert.deepEqual(o.matrix.elements,local.elements);assert.deepEqual(o.matrixWorld.elements,world.elements);}
 assert.equal(m.material.visible,true);assert.ok(!m.material.transparent||m.material.opacity>0);assert.equal(m.geometry.attributes.position.count,8448*3);
 return{geometry:meshFingerprint(m),render:renderStateHash(m),vertices:m.geometry.attributes.position.count};
}
