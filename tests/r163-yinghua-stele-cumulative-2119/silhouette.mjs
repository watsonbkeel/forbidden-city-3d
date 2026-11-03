import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const expected=JSON.parse(fs.readFileSync(new URL('../../docs/photo-fidelity/batches/R163-RESUMPTION-2114/SILHOUETTE-EXPECTED-NEW-ROOF.json',import.meta.url)));
const hash=a=>crypto.createHash('sha256').update(Buffer.from(a.buffer,a.byteOffset,a.byteLength)).digest('hex');
/** Verify, never skip, the one derived old proxy changed by adding a new roof. */
export function verifyOldSilhouetteAndTail(W){
 const proxy=W.zoneManager.silhouettes.get('outer-west'),position=proxy.geometry.attributes.position.array,index=proxy.geometry.index.array;
 assert.equal(position.length,expected.oldPositionScalars+expected.newPositionScalars);assert.equal(index.length,expected.oldIndices+expected.newIndices);
 assert.equal(hash(position.subarray(0,expected.oldPositionScalars)),expected.oldPositionPrefixSHA256);assert.equal(hash(index.subarray(0,expected.oldIndices)),expected.oldIndexPrefixSHA256);
 const expanded=[];for(const i of index.subarray(expected.oldIndices))expanded.push(...position.subarray(i*3,i*3+3));
 assert.equal(hash(new Float32Array(expanded)),expected.newRoofExpandedFloat32SHA256,'only independently verified new real roof may be appended');
 return{oldPositionPrefixExact:true,oldIndexPrefixExact:true,addedIndices:expected.newIndices,addedUniqueVertices:expected.newPositionScalars/3,newRoofExpandedTailExact:true};
}
