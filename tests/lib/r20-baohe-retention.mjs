import {restorePreR21Source,restorePreR21SceneRow,restorePreR21SceneRows} from './r21-baohe-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r20-baohe-source-delta.json' with {type:'json'};
import scene from '../fixtures/r20-baohe-scene-delta.json' with {type:'json'};

const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. Reverse exact R21 first, then accept the exact
 * frozen R20 or R19 input. No filtering or alternate-hash allowlist. */
export function restorePreR20Source(path,bytes){
  const d=source.files[path];
  if(!d)return restorePreR21Source(path,bytes);
  if(sha(bytes)===d.baselineSHA256)return bytes;
  bytes=restorePreR21Source(path,bytes);
  assert.equal(sha(bytes),d.candidateSHA256,`exact R20 interior-height source: ${path}`);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R20 reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact R19 source restored: ${path}`);
  return Buffer.from(out);
}

export function assertR20AddedSource(path,bytes){
  assert.ok(Object.hasOwn(source.addedFiles,path),`registered R20 added module: ${path}`);
  assert.equal(sha(bytes),source.addedFiles[path].candidateSHA256,`exact R20 added module: ${path}`);
  return bytes;
}

export function restorePreR20SceneRow(name,row){
  if(name!==scene.name||JSON.stringify(row)===JSON.stringify(scene.before))return row;
  row=restorePreR21SceneRow(name,row);
  assert.deepEqual(row,scene.after,'exact R20 complete three-hall geometry/material identity');
  return structuredClone(scene.before);
}

export function restorePreR20SceneRows(rows){
  if(hash(rows)===scene.beforeSHA256)return rows;
  rows=restorePreR21SceneRows(rows);
  assert.equal(hash(rows),scene.afterSHA256,'exact R20 complete scene groups');
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(rows[name],row,`unchanged R19 scene group: ${name}`);
  const out={...structuredClone(rows),[scene.name]:restorePreR20SceneRow(scene.name,rows[scene.name])};
  assert.equal(hash(out),scene.beforeSHA256,'exact R19 scene groups restored');
  return out;
}
