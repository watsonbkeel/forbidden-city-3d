import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash}from'node:crypto';
import source from './fixtures/r10-column-source-delta.json' with {type:'json'};
import {restorePreR11FloorSource} from './lib/r11-floor-retention.mjs';
import meshes from './fixtures/r10-column-mesh-delta.json' with {type:'json'};
import{restorePreR10Columns,restorePreR10MeshRows}from'./lib/r10-column-retention.mjs';
import{captureTaiheControl,hash,serialMesh}from'./lib/taihe-core-fixture.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(const[path,d]of Object.entries(source.files))test('exact source restoration rejects unrelated edits: '+path,()=>{
 const b=fs.readFileSync(new URL('../'+path,import.meta.url));assert.equal(sha(restorePreR11FloorSource(path,b)),d.candidateSHA256);const old=restorePreR10Columns(path,b);assert.equal(sha(old),d.baselineSHA256);assert.deepEqual(restorePreR10Columns(path,old),old);
 for(const suffix of ['\n','//unreviewed'])assert.throws(()=>restorePreR10Columns(path,Buffer.concat([b,Buffer.from(suffix)])));
 for(const h of d.deltas)assert.throws(()=>restorePreR10Columns(path,Buffer.from(b.toString().replace(h.after,h.after+'\n'))));
});
test('mesh restoration is exact and rejects changed, missing and reordered objects',()=>{
 const{builder,group}=captureTaiheControl('太和殿');const rows=group.children.filter(o=>o.isMesh).map(o=>serialMesh(o));assert.equal(hash(restorePreR10MeshRows(rows)),meshes.beforeSHA256);
 for(const i of [0,64,rows.length-1]){const changed=structuredClone(rows);changed[i].matrix[12]+=.01;assert.throws(()=>restorePreR10MeshRows(changed));}
 assert.throws(()=>restorePreR10MeshRows(rows.slice(1)));assert.throws(()=>restorePreR10MeshRows([...rows].reverse()));builder.dispose();
});
