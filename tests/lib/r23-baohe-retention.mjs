import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r23-baohe-source-delta.json' with {type:'json'};
import scene from '../fixtures/r23-baohe-scene-delta.json' with {type:'json'};

const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. Reverse four exact R23 hunks in two complete
 * source files. Unregistered paths remain owned by older retention adapters.
 * No application code or current feature/route acceptance imports this helper. */
export function restorePreR23Source(path,bytes){
  const d=source.files[path];
  if(!d||sha(bytes)===d.baselineSHA256)return bytes;
  assert.equal(sha(bytes),d.candidateSHA256,`exact R23 front-enclosure source: ${path}`);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.before.length>0&&h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R23 reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact R22 source restored: ${path}`);
  return Buffer.from(out);
}

export function assertR23AddedSource(path,bytes){
  assert.ok(Object.hasOwn(source.addedFiles,path),`registered R23 added module: ${path}`);
  assert.equal(sha(bytes),source.addedFiles[path].candidateSHA256,`exact R23 added module: ${path}`);
  return bytes;
}

export function assertR23RetainedSource(path,bytes){
  assert.ok(Object.hasOwn(source.retainedFiles,path),`registered R23 retained dependency: ${path}`);
  assert.equal(sha(bytes),source.retainedFiles[path],`exact retained R22 dependency: ${path}`);
  return bytes;
}

export function restorePreR23SceneRow(name,row){
  if(name!==scene.name||JSON.stringify(row)===JSON.stringify(scene.before))return row;
  assert.deepEqual(row,scene.after,'exact R23 complete three-hall geometry/material identity');
  return structuredClone(scene.before);
}

export function restorePreR23SceneRows(rows){
  if(hash(rows)===scene.beforeSHA256)return rows;
  assert.equal(hash(rows),scene.afterSHA256,'exact R23 complete scene groups');
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(rows[name],row,`unchanged R22 scene group: ${name}`);
  const out={...structuredClone(rows),[scene.name]:restorePreR23SceneRow(scene.name,rows[scene.name])};
  assert.equal(hash(out),scene.beforeSHA256,'exact R22 scene groups restored');
  return out;
}

/** R23 has no navigation reversal: current and frozen R22 registrations must
 * have the same exact complete identity, including all rows and their order. */
export function assertR23NavigationIdentity(value){
  assert.equal(hash(value),scene.navigationSHA256,'exact unchanged R22/R23 complete navigation');
  assert.equal(value.colliders.length,scene.colliders);
  assert.equal(value.walkables.length,scene.walkables);
  return value;
}
