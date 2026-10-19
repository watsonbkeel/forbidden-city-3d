import {restorePreR30Source,restorePreR30SceneRow,restorePreR30SceneRows,restorePreR30MeshRows,restorePreR30GraphRows,restorePreR30Materials,restorePreR30Navigation,restorePreR30Capture} from './r30-qianqing-passage-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const hash=x=>sha(JSON.stringify(x));
function fixture(name,digest){
  const bytes=fs.readFileSync(new URL('../fixtures/'+name,import.meta.url));
  assert.equal(sha(bytes),digest,'immutable R29 retention registry: '+name);
  return JSON.parse(bytes);
}
export const r29Source=fixture('r29-qianqing-source-delta.json','39fdd532623cba0c05b095bea96bb82b3d011b7119f378c8265123c3f654a909');
export const r29Scene=fixture('r29-qianqing-scene-delta.json','a758968648d767698341f71f0fbb7bbde4dfbe87e752f48811dcad588d0e371e');

/** Historical assertions only. Bind each full candidate before reversing the
 * exact registered integration hunks. Unknown bytes never receive a reversal. */
export function restorePreR29Source(path,bytes){
  const d=r29Source.files[path];
  if(!d)return restorePreR30Source(path,bytes);
  if(sha(bytes)===d.baselineSHA256)return bytes;
  bytes=restorePreR30Source(path,bytes);
  assert.equal(sha(bytes),d.candidateSHA256,'exact R29 central source: '+path);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.before.length&&h.after.length);
    assert.equal(out.split(h.after).length,2,'one exact R29 reverse hunk: '+path);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,'exact frozen R28 source restored: '+path);
  return Buffer.from(out);
}
export function assertR29AddedSource(path,bytes){
  assert.ok(Object.hasOwn(r29Source.addedFiles,path),'registered R29 module: '+path);
  assert.equal(sha(bytes),r29Source.addedFiles[path].candidateSHA256,'exact R29 module: '+path);
  return bytes;
}
export function assertR29RetainedSource(path,bytes){
  bytes=restorePreR30Source(path,bytes);
  assert.ok(Object.hasOwn(r29Source.retainedFiles,path),'registered R29 retained dependency: '+path);
  assert.equal(sha(bytes),r29Source.retainedFiles[path],'exact retained R28 dependency: '+path);
  return bytes;
}
export function restorePreR29SceneRow(name,row){
  const d=r29Scene.changes[name];
  if(!d)return restorePreR30SceneRow(name,row);
  if(hash(row)===hash(d.before))return row;
  row=restorePreR30SceneRow(name,row);
  assert.deepEqual(row,d.after,'exact R29 complete group: '+name);
  return structuredClone(d.before);
}
export function restorePreR29SceneRows(rows){
  if(hash(rows)===r29Scene.beforeSHA256)return rows;
  rows=restorePreR30SceneRows(rows);
  assert.equal(hash(rows),r29Scene.afterSHA256,'exact R29 complete scene groups');
  const out=structuredClone(rows);
  for(const name of r29Scene.names)out[name]=restorePreR29SceneRow(name,rows[name]);
  assert.equal(hash(out),r29Scene.beforeSHA256,'exact R28 complete scene groups restored');
  return out;
}
function restoreRows(rows,d,label){
  if(hash(rows)===d.beforeSHA256)return rows;
  assert.equal(hash(rows),d.afterSHA256,'exact R29 '+label);
  assert.equal(rows.length,d.afterCount);
  const out=structuredClone(rows);
  for(const change of [...d.changes].reverse()){
    assert.deepEqual(out.slice(change.afterIndex,change.afterIndex+change.after.length),change.after,'exact R29 '+label+' splice');
    out.splice(change.afterIndex,change.after.length,...structuredClone(change.before));
  }
  assert.equal(out.length,d.beforeCount);
  assert.equal(hash(out),d.beforeSHA256,'exact R28 '+label+' restored');
  return out;
}
export const restorePreR29MeshRows=rows=>restoreRows(hash(rows)===r29Scene.meshes.beforeSHA256?rows:restorePreR30MeshRows(rows),r29Scene.meshes,'all resident meshes');
export const restorePreR29GraphRows=rows=>restoreRows(hash(rows)===r29Scene.graph.beforeSHA256?rows:restorePreR30GraphRows(rows),r29Scene.graph,'all hierarchy, transforms and metadata');
export const restorePreR29Materials=rows=>restoreRows(hash(rows)===r29Scene.materials.beforeSHA256?rows:restorePreR30Materials(rows),r29Scene.materials,'all material values');
export function assertR29NavigationIdentity(value){
  value=restorePreR30Navigation(value);
  assert.equal(hash(value),r29Scene.navigation.sha256,'exact unchanged R28/R29 complete navigation');
  assert.equal(value.colliders.length,r29Scene.navigation.colliders);
  assert.equal(value.walkables.length,r29Scene.navigation.walkables);
  return value;
}
export function restorePreR29Capture(value){
  if(hash(value)===r29Scene.beforeCaptureSHA256)return value;
  value=restorePreR30Capture(value);
  assert.equal(hash(value),r29Scene.afterCaptureSHA256,'exact R29 complete capture');
  const out={...value,rows:restorePreR29SceneRows(value.rows),meshes:restorePreR29MeshRows(value.meshes),graph:restorePreR29GraphRows(value.graph),materials:restorePreR29Materials(value.materials),navigation:assertR29NavigationIdentity(value.navigation)};
  for(const key of ['geometryBytes','uniqueMaterials','uniqueTextures'])out[key]=r29Scene[key].before;
  assert.equal(hash(out),r29Scene.beforeCaptureSHA256,'exact R28 complete capture restored');
  return out;
}
