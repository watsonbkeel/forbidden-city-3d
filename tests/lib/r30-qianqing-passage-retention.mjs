import {restoreR33SourceIfPresent} from './r33-source-retention.mjs';
import {restoreR31SurfaceRowsIfPresent,restoreR31SurfaceRowIfPresent,restoreR31SurfaceCaptureIfPresent,restoreR31SurfaceNavigationIfPresent} from './r31-qianqing-surface-retention.mjs';
import {restoreR31SourceIfPresent} from './r31-flight-operations-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const hash=x=>sha(JSON.stringify(x));
function fixture(name,digest){
  const bytes=fs.readFileSync(new URL('../fixtures/'+name,import.meta.url));
  assert.equal(sha(bytes),digest,'immutable R30 retention registry: '+name);
  return JSON.parse(bytes);
}
export const r30Source=fixture('r30-qianqing-passage-source-delta.json','4bb57ea4366288139450d1197dcaf2f17b4481ca42273b5b46afa62363a60e0c');
export const r30Scene=fixture('r30-qianqing-passage-scene-delta.json','7a3d32a783ff7735ee6873d6f8ed9d6cb522d40e7a37e98cc0108117862c5353');

/** Historical assertions only. Bind each full candidate before reversing the
 * exact registered integration hunks. Unknown bytes never receive a reversal. */
export function restorePreR30Source(path,bytes){
  bytes=restoreR31SourceIfPresent(path,bytes);
  const d=r30Source.files[path];
  if(!d||sha(bytes)===d.baselineSHA256)return bytes;
  assert.equal(sha(bytes),d.candidateSHA256,'exact R30 passage source: '+path);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.before.length&&h.after.length);
    assert.equal(out.split(h.after).length,2,'one exact R30 reverse hunk: '+path);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,'exact frozen R29 source restored: '+path);
  return Buffer.from(out);
}
export function assertR30AddedSource(path,bytes){
  assert.ok(Object.hasOwn(r30Source.addedFiles,path),'registered R30 module: '+path);
  assert.equal(sha(restoreR33SourceIfPresent(path,bytes)),r30Source.addedFiles[path].candidateSHA256,'exact R30 module: '+path);
  return bytes;
}
export function assertR30RetainedSource(path,bytes){
  bytes=restoreR31SourceIfPresent(path,bytes);
  assert.ok(Object.hasOwn(r30Source.retainedFiles,path),'registered R30 retained dependency: '+path);
  assert.equal(sha(bytes),r30Source.retainedFiles[path],'exact retained R29 dependency: '+path);
  return bytes;
}
export function restorePreR30SceneRow(name,row){
  row=restoreR31SurfaceRowIfPresent(name,row);
  const d=r30Scene.changes[name];
  if(!d||hash(row)===hash(d.before))return row;
  assert.deepEqual(row,d.after,'exact R30 complete group: '+name);
  return structuredClone(d.before);
}
export function restorePreR30SceneRows(rows){
  rows=restoreR31SurfaceRowsIfPresent('rows',rows);
  if(hash(rows)===r30Scene.beforeSHA256)return rows;
  assert.equal(hash(rows),r30Scene.afterSHA256,'exact R30 complete scene groups');
  const out=structuredClone(rows);
  for(const name of r30Scene.names)out[name]=restorePreR30SceneRow(name,rows[name]);
  assert.equal(hash(out),r30Scene.beforeSHA256,'exact R29 complete scene groups restored');
  return out;
}
function restoreRows(rows,d,label){
  if(hash(rows)===d.beforeSHA256)return rows;
  assert.equal(hash(rows),d.afterSHA256,'exact R30 '+label);
  assert.equal(rows.length,d.afterCount);
  const out=structuredClone(rows);
  for(const change of [...d.changes].reverse()){
    assert.deepEqual(out.slice(change.afterIndex,change.afterIndex+change.after.length),change.after,'exact R30 '+label+' splice');
    out.splice(change.afterIndex,change.after.length,...structuredClone(change.before));
  }
  assert.equal(out.length,d.beforeCount);
  assert.equal(hash(out),d.beforeSHA256,'exact R29 '+label+' restored');
  return out;
}
export const restorePreR30MeshRows=rows=>restoreRows(restoreR31SurfaceRowsIfPresent('meshes',rows),r30Scene.meshes,'all resident meshes');
export const restorePreR30GraphRows=rows=>restoreRows(restoreR31SurfaceRowsIfPresent('graph',rows),r30Scene.graph,'all hierarchy, transforms and metadata');
export const restorePreR30Materials=rows=>restoreRows(restoreR31SurfaceRowsIfPresent('materials',rows),r30Scene.materials,'all material values');
/** The full ordered candidate is bound before restoring four facade spans and
 * removing exactly the 14 registered solids. Walkables never change. */
export function restorePreR30Navigation(value){
  value=restoreR31SurfaceNavigationIfPresent(value);
  const d=r30Scene.navigation;
  if(hash(value)===d.beforeSHA256)return value;
  assert.equal(hash(value),d.afterSHA256,'exact R30 complete ordered navigation');
  const out={colliders:restoreRows(value.colliders,d.colliders,'ordered colliders'),walkables:restoreRows(value.walkables,d.walkables,'ordered walkables')};
  assert.equal(hash(out),d.beforeSHA256,'exact frozen R29 navigation restored');
  return out;
}
export function restorePreR30Capture(value){
  value=restoreR31SurfaceCaptureIfPresent(value);
  if(hash(value)===r30Scene.beforeCaptureSHA256)return value;
  assert.equal(hash(value),r30Scene.afterCaptureSHA256,'exact R30 complete capture');
  const out={...value,rows:restorePreR30SceneRows(value.rows),meshes:restorePreR30MeshRows(value.meshes),graph:restorePreR30GraphRows(value.graph),materials:restorePreR30Materials(value.materials),navigation:restorePreR30Navigation(value.navigation)};
  for(const key of ['geometryBytes','uniqueMaterials','uniqueTextures'])out[key]=r30Scene[key].before;
  assert.equal(hash(out),r30Scene.beforeCaptureSHA256,'exact R29 complete capture restored');
  return out;
}
