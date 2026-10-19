import {restorePreR25Source,restorePreR25SceneRow,restorePreR25SceneRows} from './r25-nameboard-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r24-baohe-source-delta.json' with {type:'json'};
import scene from '../fixtures/r24-baohe-scene-delta.json' with {type:'json'};

const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. Reverse two unique R24 hunks in the complete
 * frozen builder. Unregistered paths belong to older retention adapters.
 * Never imported by runtime or used as current feature/route acceptance. */
export function restorePreR24Source(path,bytes){
  const d=source.files[path];
  if(!d)return restorePreR25Source(path,bytes);
  if(sha(bytes)===d.baselineSHA256)return bytes;
  bytes=restorePreR25Source(path,bytes);
  assert.equal(sha(bytes),d.candidateSHA256,`exact R24 rear-enclosure source: ${path}`);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.before.length>0&&h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R24 reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact R23 source restored: ${path}`);
  return Buffer.from(out);
}

export function assertR24AddedSource(path,bytes){
  assert.ok(Object.hasOwn(source.addedFiles,path),`registered R24 added module: ${path}`);
  assert.equal(sha(bytes),source.addedFiles[path].candidateSHA256,`exact R24 added module: ${path}`);
  return bytes;
}

export function assertR24RetainedSource(path,bytes){
  assert.ok(Object.hasOwn(source.retainedFiles,path),`registered R24 retained dependency: ${path}`);
  assert.equal(sha(bytes),source.retainedFiles[path],`exact retained R23 dependency: ${path}`);
  return bytes;
}

export function restorePreR24SceneRow(name,row){
  if(name!==scene.name)return restorePreR25SceneRow(name,row);
  if(JSON.stringify(row)===JSON.stringify(scene.before))return row;
  row=restorePreR25SceneRow(name,row);
  assert.deepEqual(row,scene.after,'exact R24 complete three-hall geometry/material identity');
  return structuredClone(scene.before);
}

export function restorePreR24SceneRows(rows){
  if(hash(rows)===scene.beforeSHA256)return rows;
  rows=restorePreR25SceneRows(rows);
  assert.equal(hash(rows),scene.afterSHA256,'exact R24 complete scene groups');
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(rows[name],row,`unchanged R23 scene group: ${name}`);
  const out={...structuredClone(rows),[scene.name]:restorePreR24SceneRow(scene.name,rows[scene.name])};
  assert.equal(hash(out),scene.beforeSHA256,'exact R23 scene groups restored');
  return out;
}

/** No navigation reversal: bind every collider/walkable, including ordering. */
export function assertR24NavigationIdentity(value){
  assert.equal(hash(value),scene.navigationSHA256,'exact unchanged R23/R24 complete navigation');
  assert.equal(value.colliders.length,scene.colliders);
  assert.equal(value.walkables.length,scene.walkables);
  return value;
}
