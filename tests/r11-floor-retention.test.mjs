import {restorePreR12InnerSource} from './lib/r12-inner-source-retention.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash}from'node:crypto';
import source from './fixtures/r11-floor-source-delta.json' with{type:'json'};
import meshes from './fixtures/r11-floor-mesh-delta.json' with{type:'json'};
import{restorePreR11FloorSource,restorePreR11FloorRows}from'./lib/r11-floor-retention.mjs';
import{captureTaiheControl,serialMesh,hash}from'./lib/taihe-core-fixture.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
test('R11 restores only the exact floor source delta and rejects unrelated edits',()=>{
 const b=restorePreR12InnerSource(source.path,fs.readFileSync(new URL('../'+source.path,import.meta.url)));assert.equal(sha(b),source.afterSHA256);
 const old=restorePreR11FloorSource(source.path,b);assert.equal(sha(old),source.beforeSHA256);assert.deepEqual(restorePreR11FloorSource(source.path,old),old);
 assert.throws(()=>restorePreR11FloorSource(source.path,Buffer.concat([b,Buffer.from('\n')])));
 for(const d of source.deltas)assert.throws(()=>restorePreR11FloorSource(source.path,Buffer.from(b.toString().replace(d.after,d.after+'\n'))));
});
test('R11 restores one floor mesh only and rejects navigation-unrelated geometry drift too',()=>{
 const{builder,group}=captureTaiheControl('太和殿');const rows=group.children.filter(o=>o.isMesh).map(o=>serialMesh(o));
 const restored=restorePreR11FloorRows(rows);assert.equal(hash(restored),meshes.beforeSHA256);assert.deepEqual(restorePreR11FloorRows(restored),restored);
 for(const i of [0,meshes.floorIndex,rows.length-1]){const changed=structuredClone(rows);changed[i].matrix[12]+=.01;assert.throws(()=>restorePreR11FloorRows(changed));}
 for(const field of ['roughness','metalness']){const changed=structuredClone(rows);changed[meshes.floorIndex].material[field]+=.01;assert.throws(()=>restorePreR11FloorRows(changed));}
 assert.throws(()=>restorePreR11FloorRows(rows.slice(1)));assert.throws(()=>restorePreR11FloorRows([...rows].reverse()));builder.dispose();
});
