import {restorePreR30Navigation} from './r30-qianqing-passage-retention.mjs';
import {restorePreR29Source,restorePreR29SceneRow,restorePreR29SceneRows,restorePreR29MeshRows,restorePreR29GraphRows,restorePreR29Materials,restorePreR29Capture} from './r29-qianqing-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const hash=x=>sha(JSON.stringify(x));
function fixture(name,digest){
  const bytes=fs.readFileSync(new URL('../fixtures/'+name,import.meta.url));
  assert.equal(sha(bytes),digest,'immutable R28 retention registry: '+name);
  return JSON.parse(bytes);
}
export const r28Source=fixture('r28-jiaotai-central-source-delta.json','f6f3ad1d79c7c46936da42bd7ea12bec4051e69ef03aa9cd6a84985be695612a');
export const r28Scene=fixture('r28-jiaotai-central-scene-delta.json','4ab7b74082268615e71e39443c294bb8e9e6407953c4dc71ad7ccc9afd0cc061');

/** Historical assertions only. Bind each full candidate before reversing the
 * exact registered integration hunks. Unknown bytes never receive a reversal. */
export function restorePreR28Source(path,bytes){
  const d=r28Source.files[path];
  if(!d)return restorePreR29Source(path,bytes);
  if(sha(bytes)===d.baselineSHA256)return bytes;
  bytes=restorePreR29Source(path,bytes);
  assert.equal(sha(bytes),d.candidateSHA256,'exact R28 central source: '+path);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.before.length&&h.after.length);
    assert.equal(out.split(h.after).length,2,'one exact R28 reverse hunk: '+path);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,'exact frozen R27 source restored: '+path);
  return Buffer.from(out);
}
export function assertR28AddedSource(path,bytes){
  assert.ok(Object.hasOwn(r28Source.addedFiles,path),'registered R28 module: '+path);
  assert.equal(sha(bytes),r28Source.addedFiles[path].candidateSHA256,'exact R28 module: '+path);
  return bytes;
}
export function assertR28RetainedSource(path,bytes){
  bytes=restorePreR29Source(path,bytes);
  assert.ok(Object.hasOwn(r28Source.retainedFiles,path),'registered R28 retained dependency: '+path);
  assert.equal(sha(bytes),r28Source.retainedFiles[path],'exact retained R27 dependency: '+path);
  return bytes;
}
export function restorePreR28SceneRow(name,row){
  const d=r28Scene.changes[name];
  if(!d)return restorePreR29SceneRow(name,row);
  if(hash(row)===hash(d.before))return row;
  row=restorePreR29SceneRow(name,row);
  assert.deepEqual(row,d.after,'exact R28 complete group: '+name);
  return structuredClone(d.before);
}
export function restorePreR28SceneRows(rows){
  if(hash(rows)===r28Scene.beforeSHA256)return rows;
  rows=restorePreR29SceneRows(rows);
  assert.equal(hash(rows),r28Scene.afterSHA256,'exact R28 complete scene groups');
  const out=structuredClone(rows);
  for(const name of r28Scene.names)out[name]=restorePreR28SceneRow(name,rows[name]);
  assert.equal(hash(out),r28Scene.beforeSHA256,'exact R27 complete scene groups restored');
  return out;
}
function restoreRows(rows,d,label){
  if(hash(rows)===d.beforeSHA256)return rows;
  assert.equal(hash(rows),d.afterSHA256,'exact R28 '+label);
  assert.equal(rows.length,d.afterCount);
  const out=structuredClone(rows);
  for(const change of [...d.changes].reverse()){
    assert.deepEqual(out.slice(change.afterIndex,change.afterIndex+change.after.length),change.after,'exact R28 '+label+' splice');
    out.splice(change.afterIndex,change.after.length,...structuredClone(change.before));
  }
  assert.equal(out.length,d.beforeCount);
  assert.equal(hash(out),d.beforeSHA256,'exact R27 '+label+' restored');
  return out;
}
export const restorePreR28MeshRows=rows=>restoreRows(hash(rows)===r28Scene.meshes.beforeSHA256?rows:restorePreR29MeshRows(rows),r28Scene.meshes,'all resident meshes');
export const restorePreR28GraphRows=rows=>restoreRows(hash(rows)===r28Scene.graph.beforeSHA256?rows:restorePreR29GraphRows(rows),r28Scene.graph,'all hierarchy, transforms and metadata');
export const restorePreR28Materials=rows=>restoreRows(hash(rows)===r28Scene.materials.beforeSHA256?rows:restorePreR29Materials(rows),r28Scene.materials,'all material values');
export function assertR28NavigationIdentity(value){
  value=restorePreR30Navigation(value);
  assert.equal(hash(value),r28Scene.navigation.sha256,'exact unchanged R27/R28 complete navigation');
  assert.equal(value.colliders.length,r28Scene.navigation.colliders);
  assert.equal(value.walkables.length,r28Scene.navigation.walkables);
  return value;
}
export function restorePreR28Capture(value){
  if(hash(value)===r28Scene.beforeCaptureSHA256)return value;
  value=restorePreR29Capture(value);
  assert.equal(hash(value),r28Scene.afterCaptureSHA256,'exact R28 complete capture');
  const out={...value,rows:restorePreR28SceneRows(value.rows),meshes:restorePreR28MeshRows(value.meshes),graph:restorePreR28GraphRows(value.graph),materials:restorePreR28Materials(value.materials),navigation:assertR28NavigationIdentity(value.navigation)};
  for(const key of ['geometryBytes','uniqueMaterials','uniqueTextures'])out[key]=r28Scene[key].before;
  assert.equal(hash(out),r28Scene.beforeCaptureSHA256,'exact R27 complete capture restored');
  return out;
}
