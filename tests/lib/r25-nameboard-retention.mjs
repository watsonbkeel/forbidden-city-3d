import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r25-nameboard-source-delta.json' with {type:'json'};
import scene from '../fixtures/r25-nameboard-scene-delta.json' with {type:'json'};

const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. The complete R25 builder is bound before its
 * three unique hunks are reversed. Unregistered paths remain with older
 * adapters. Neither application code nor live feature acceptance uses this. */
export function restorePreR25Source(path,bytes){
  const d=source.files[path];
  if(!d||sha(bytes)===d.baselineSHA256)return bytes;
  assert.equal(sha(bytes),d.candidateSHA256,`exact R25 nameboard source: ${path}`);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.before.length>0&&h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R25 reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact R24 source restored: ${path}`);
  return Buffer.from(out);
}

export function assertR25AddedSource(path,bytes){
  assert.ok(Object.hasOwn(source.addedFiles,path),`registered R25 added module: ${path}`);
  assert.equal(sha(bytes),source.addedFiles[path].candidateSHA256,`exact R25 added module: ${path}`);
  return bytes;
}

export function assertR25RetainedSource(path,bytes){
  assert.ok(Object.hasOwn(source.retainedFiles,path),`registered R25 retained dependency: ${path}`);
  assert.equal(sha(bytes),source.retainedFiles[path],`exact retained R24 dependency: ${path}`);
  return bytes;
}

export function restorePreR25SceneRow(name,row){
  const d=scene.changes[name];
  if(!d||JSON.stringify(row)===JSON.stringify(d.before))return row;
  assert.deepEqual(row,d.after,`exact R25 complete geometry/material identity: ${name}`);
  return structuredClone(d.before);
}

export function restorePreR25SceneRows(rows){
  if(hash(rows)===scene.beforeSHA256)return rows;
  assert.equal(hash(rows),scene.afterSHA256,'exact R25 complete scene groups');
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(rows[name],row,`unchanged R24 scene group: ${name}`);
  const out=structuredClone(rows);
  for(const name of scene.names)out[name]=restorePreR25SceneRow(name,rows[name]);
  assert.equal(hash(out),scene.beforeSHA256,'exact R24 scene groups restored');
  return out;
}

/** Every mesh is retained in order; only three exact matrices/userData records
 * may reverse. No geometry, material, placement or unrelated row is filtered. */
export function restorePreR25MeshRows(rows){
  if(hash(rows)===scene.beforeMeshesSHA256)return rows;
  assert.equal(hash(rows),scene.afterMeshesSHA256,'exact R25 complete mesh identities');
  assert.equal(rows.length,scene.meshCount);
  const out=structuredClone(rows);
  for(const d of scene.meshChanges){
    assert.deepEqual(out[d.index],d.after,'exact R25 named board identity');
    out[d.index]=structuredClone(d.before);
  }
  assert.equal(hash(out),scene.beforeMeshesSHA256,'exact R24 complete mesh identities restored');
  return out;
}

/** R25 has no navigation delta; bind all registrations including order. */
export function assertR25NavigationIdentity(value){
  assert.equal(hash(value),scene.navigationSHA256,'exact unchanged R24/R25 complete navigation');
  assert.equal(value.colliders.length,scene.colliders);
  assert.equal(value.walkables.length,scene.walkables);
  return value;
}
