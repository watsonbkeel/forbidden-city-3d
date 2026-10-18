import {restorePreR22Source,restorePreR22SceneRow,restorePreR22SceneRows} from './r22-baohe-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r21-baohe-source-delta.json' with {type:'json'};
import scene from '../fixtures/r21-baohe-scene-delta.json' with {type:'json'};

const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. Reverse exact R22 first, then accept exact frozen R21 or R20 bytes.
 * Reverse every registered hunk before older retention adapters run. This is
 * never imported by the application or used as current R22 acceptance. */
export function restorePreR21Source(path,bytes){
  const d=source.files[path];
  if(!d)return restorePreR22Source(path,bytes);
  if(sha(bytes)===d.baselineSHA256)return bytes;
  bytes=restorePreR22Source(path,bytes);
  assert.equal(sha(bytes),d.candidateSHA256,`exact R21 screen/chair/plaque source: ${path}`);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R21 reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact R20 source restored: ${path}`);
  return Buffer.from(out);
}

/** The added module has no historical replacement; bind all its bytes. */
export function assertR21AddedSource(path,bytes){
  assert.ok(Object.hasOwn(source.addedFiles,path),`registered R21 added module: ${path}`);
  assert.equal(sha(bytes),source.addedFiles[path].candidateSHA256,`exact R21 added module: ${path}`);
  return bytes;
}

export function restorePreR21SceneRow(name,row){
  if(name!==scene.name||JSON.stringify(row)===JSON.stringify(scene.before))return row;
  row=restorePreR22SceneRow(name,row);
  assert.deepEqual(row,scene.after,'exact R21 complete three-hall geometry/material identity');
  return structuredClone(scene.before);
}

export function restorePreR21SceneRows(rows){
  if(hash(rows)===scene.beforeSHA256)return rows;
  rows=restorePreR22SceneRows(rows);
  assert.equal(hash(rows),scene.afterSHA256,'exact R21 complete scene groups');
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(rows[name],row,`unchanged R20 scene group: ${name}`);
  const out={...structuredClone(rows),[scene.name]:restorePreR21SceneRow(scene.name,rows[scene.name])};
  assert.equal(hash(out),scene.beforeSHA256,'exact R20 scene groups restored');
  return out;
}
