import {restorePreR26FriezeSource,restorePreR26FriezeSceneRow,restorePreR26FriezeSceneRows,restorePreR26FriezeMeshRows,restorePreR26FriezeQianqingRows} from './r26-qianqing-frieze-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r26-qianqing-source-delta.json' with {type:'json'};
import scene from '../fixtures/r26-qianqing-scene-delta.json' with {type:'json'};

const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. Bind the complete candidate before reversing
 * three unique source hunks. Unregistered paths remain with older adapters. */
export function restorePreR26Source(path,bytes){
  const d=source.files[path];
  if(!d)return restorePreR26FriezeSource(path,bytes);
  if(sha(bytes)===d.baselineSHA256)return bytes;
  bytes=restorePreR26FriezeSource(path,bytes);
  assert.equal(sha(bytes),d.candidateSHA256,`exact R26 Qianqing source: ${path}`);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.before.length>0&&h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R26 reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact R25 source restored: ${path}`);
  return Buffer.from(out);
}
export function assertR26AddedSource(path,bytes){
  assert.ok(Object.hasOwn(source.addedFiles,path),`registered R26 added module: ${path}`);
  assert.equal(sha(bytes),source.addedFiles[path].candidateSHA256,`exact R26 added module: ${path}`);
  return bytes;
}
export function assertR26RetainedSource(path,bytes){
  assert.ok(Object.hasOwn(source.retainedFiles,path),`registered R26 retained dependency: ${path}`);
  assert.equal(sha(bytes),source.retainedFiles[path],`exact retained R25 dependency: ${path}`);
  return bytes;
}
export function restorePreR26SceneRow(name,row){
  const d=scene.changes[name];
  if(!d)return restorePreR26FriezeSceneRow(name,row);
  if(JSON.stringify(row)===JSON.stringify(d.before))return row;
  row=restorePreR26FriezeSceneRow(name,row);
  assert.deepEqual(row,d.after,`exact R26 complete geometry/material identity: ${name}`);
  return structuredClone(d.before);
}
export function restorePreR26SceneRows(rows){
  if(hash(rows)===scene.beforeSHA256)return rows;
  rows=restorePreR26FriezeSceneRows(rows);
  assert.equal(hash(rows),scene.afterSHA256,'exact R26 complete scene groups');
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(rows[name],row,`unchanged R25 scene group: ${name}`);
  const out=structuredClone(rows);
  for(const name of scene.names)out[name]=restorePreR26SceneRow(name,rows[name]);
  assert.equal(hash(out),scene.beforeSHA256,'exact R25 scene groups restored');
  return out;
}

/** Complete arrays are SHA-bound before any replacement. Exact splices keep
 * every unaffected mesh, order, attribute, material, transform and metadata. */
export function restorePreR26MeshRows(rows){
  if(hash(rows)===scene.beforeMeshesSHA256)return rows;
  rows=restorePreR26FriezeMeshRows(rows);
  assert.equal(hash(rows),scene.afterMeshesSHA256,'exact R26 complete mesh identities');
  assert.equal(rows.length,scene.afterMeshCount);
  const out=structuredClone(rows);
  for(const d of [...scene.meshChanges].reverse()){
    assert.deepEqual(out.slice(d.afterIndex,d.afterIndex+d.after.length),d.after,'exact R26 mesh splice');
    out.splice(d.afterIndex,d.after.length,...structuredClone(d.before));
  }
  assert.equal(hash(out),scene.beforeMeshesSHA256,'exact R25 complete mesh identities restored');
  return out;
}
export function assertR26NavigationIdentity(value){
  assert.equal(hash(value),scene.navigationSHA256,'exact unchanged R25/R26 complete navigation');
  assert.equal(value.colliders.length,scene.colliders);
  assert.equal(value.walkables.length,scene.walkables);
  return value;
}

export function restorePreR26QianqingRows(rows){
  const d=scene.qianqing;
  if(hash(rows)===d.beforeSHA256)return rows;
  rows=restorePreR26FriezeQianqingRows(rows);
  assert.equal(hash(rows),d.afterSHA256,'exact R26 complete unmerged Qianqing hall');
  assert.equal(rows.length,d.afterMeshCount);
  const out=structuredClone(rows);
  for(const change of [...d.changes].reverse()){
    assert.deepEqual(out.slice(change.afterIndex,change.afterIndex+change.after.length),change.after,'exact R26 seven-bay replacement');
    out.splice(change.afterIndex,change.after.length,...structuredClone(change.before));
  }
  assert.equal(hash(out),d.beforeSHA256,'exact complete R25 Qianqing hall restored');
  return out;
}
