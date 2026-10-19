import {restorePreR27Source,restorePreR27SceneRow,restorePreR27SceneRows,restorePreR27MeshRows} from './r27-jiaotai-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r26-qianqing-frieze-source-delta.json' with {type:'json'};
import scene from '../fixtures/r26-qianqing-frieze-scene-delta.json' with {type:'json'};
const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. Bind the full combined candidate before exactly
 * two unique import/call reversals, then bind the full windows-only builder. */
export function restorePreR26FriezeSource(path,bytes){
  const d=source.files[path];
  if(!d)return restorePreR27Source(path,bytes);
  if(sha(bytes)===d.baselineSHA256)return bytes;
  bytes=restorePreR27Source(path,bytes);
  assert.equal(sha(bytes),d.candidateSHA256,`exact R26 frieze source: ${path}`);
  assert.equal(d.deltas.length,2);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.before.length>0&&h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R26 frieze reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact windows-only R26 source restored: ${path}`);
  return Buffer.from(out);
}
export function assertR26FriezeAddedSource(path,bytes){
  assert.ok(Object.hasOwn(source.addedFiles,path),`registered R26 frieze module: ${path}`);
  assert.equal(sha(bytes),source.addedFiles[path].candidateSHA256,`exact R26 frieze module: ${path}`);
  return bytes;
}
export function assertR26FriezeRetainedSource(path,bytes){
  assert.ok(Object.hasOwn(source.retainedFiles,path),`registered R26 frieze dependency: ${path}`);
  assert.equal(sha(bytes),source.retainedFiles[path],`exact retained windows-only R26 dependency: ${path}`);
  return bytes;
}
export function restorePreR26FriezeSceneRow(name,row){
  const d=scene.changes[name];
  if(!d)return restorePreR27SceneRow(name,row);
  if(JSON.stringify(row)===JSON.stringify(d.before))return row;
  row=restorePreR27SceneRow(name,row);
  assert.deepEqual(row,d.after,`exact combined R26 scene group: ${name}`);
  return structuredClone(d.before);
}
export function restorePreR26FriezeSceneRows(rows){
  if(hash(rows)===scene.beforeSHA256)return rows;
  rows=restorePreR27SceneRows(rows);
  assert.equal(hash(rows),scene.afterSHA256,'exact combined R26 complete scene groups');
  const out=structuredClone(rows);
  for(const name of scene.names)out[name]=restorePreR26FriezeSceneRow(name,rows[name]);
  assert.equal(hash(out),scene.beforeSHA256,'exact windows-only R26 scene groups restored');
  return out;
}
function restoreRows(rows,d,label){
  if(hash(rows)===d.beforeSHA256)return rows;
  assert.equal(hash(rows),d.afterSHA256,`exact combined R26 ${label}`);
  assert.equal(rows.length,d.afterMeshCount);
  const out=structuredClone(rows);
  for(const change of [...d.changes].reverse()){
    assert.deepEqual(out.slice(change.afterIndex,change.afterIndex+change.after.length),change.after,`exact frieze ${label} splice`);
    out.splice(change.afterIndex,change.after.length,...structuredClone(change.before));
  }
  assert.equal(hash(out),d.beforeSHA256,`exact windows-only R26 ${label} restored`);
  return out;
}
export function restorePreR26FriezeMeshRows(rows){
  if(hash(rows)!==scene.meshes.beforeSHA256)rows=restorePreR27MeshRows(rows);
  return restoreRows(rows,scene.meshes,'complete merged meshes');
}
export function restorePreR26FriezeQianqingRows(rows){return restoreRows(rows,scene.qianqing,'complete unmerged Qianqing');}
