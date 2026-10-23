import test from 'node:test';import assert from 'node:assert/strict';
import {library,gate,sceneFor,binding,hash,triangles} from './lib/r59-donghua-door-fixture.mjs';
import {applyDonghuaCentralDoorFront} from '../src/scene/palace/special/DonghuaCentralDoorFront.js';
import {assertDonghuaCentralDoorFrontInWorld} from './lib/r59-donghua-world-check.mjs';
for(const quality of ['hd','sd'])test(`${quality}: read-only world consumer validates supplied merged component without rebuilding it`,async()=>{
 const lib=await library(quality),c=gate(lib);applyDonghuaCentralDoorFront(c.kit,c.frame,binding);const W=sceneFor(c,{finish:true});W.library=lib;
 const before=hash(triangles(W.scene)),children=W.scene.children.slice(),result=assertDonghuaCentralDoorFrontInWorld(W);
 assert.equal(result.rowsPerLeaf,9);assert.equal(result.leaves.length,2);assert.equal(hash(triangles(W.scene)),before);assert.deepEqual(W.scene.children,children);c.kit.dispose(W.root);lib.dispose();
});
test('world consumer refuses uncorrected production gate rather than passing metadata-free geometry',async()=>{
 const lib=await library(),c=gate(lib),W=sceneFor(c,{finish:true});W.library=lib;assert.throws(()=>assertDonghuaCentralDoorFrontInWorld(W),/Exactly one dispatched root record/);c.kit.dispose(W.root);lib.dispose();
});
