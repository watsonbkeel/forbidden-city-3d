import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r27-jiaotai-source-delta.json' with {type:'json'};
import scene from '../fixtures/r27-jiaotai-scene-delta.json' with {type:'json'};
const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. Bind the complete R27 candidate before the two
 * exact import/install reversals. No runtime writes or tolerated source drift. */
export function restorePreR27Source(path,bytes){
  const d=source.files[path];
  if(!d||sha(bytes)===d.baselineSHA256)return bytes;
  assert.equal(sha(bytes),d.candidateSHA256,`exact R27 Jiaotai source: ${path}`);
  assert.equal(d.deltas.length,2);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.before.length>0&&h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R27 reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact combined R26 source restored: ${path}`);
  return Buffer.from(out);
}
export function assertR27AddedSource(path,bytes){
  assert.ok(Object.hasOwn(source.addedFiles,path),`registered R27 module: ${path}`);
  assert.equal(sha(bytes),source.addedFiles[path].candidateSHA256,`exact R27 module: ${path}`);
  return bytes;
}
export function assertR27RetainedSource(path,bytes){
  assert.ok(Object.hasOwn(source.retainedFiles,path),`registered R27 retained dependency: ${path}`);
  assert.equal(sha(bytes),source.retainedFiles[path],`exact retained R26 dependency: ${path}`);
  return bytes;
}
export function restorePreR27SceneRow(name,row){
  const d=scene.changes[name];
  if(!d||JSON.stringify(row)===JSON.stringify(d.before))return row;
  assert.deepEqual(row,d.after,`exact R27 scene group: ${name}`);
  return structuredClone(d.before);
}
export function restorePreR27SceneRows(rows){
  if(hash(rows)===scene.beforeSHA256)return rows;
  assert.equal(hash(rows),scene.afterSHA256,'exact R27 complete scene groups');
  const out=structuredClone(rows);
  for(const name of scene.names)out[name]=restorePreR27SceneRow(name,rows[name]);
  assert.equal(hash(out),scene.beforeSHA256,'exact combined R26 scene groups restored');
  return out;
}
function restoreRows(rows,d,label){
  if(hash(rows)===d.beforeSHA256)return rows;
  assert.equal(hash(rows),d.afterSHA256,`exact R27 ${label}`);
  assert.equal(rows.length,d.afterCount);
  const out=structuredClone(rows);
  for(const change of [...d.changes].reverse()){
    assert.deepEqual(out.slice(change.afterIndex,change.afterIndex+change.after.length),change.after,`exact R27 ${label} splice`);
    out.splice(change.afterIndex,change.after.length,...structuredClone(change.before));
  }
  assert.equal(out.length,d.beforeCount);
  assert.equal(hash(out),d.beforeSHA256,`exact combined R26 ${label} restored`);
  return out;
}
export function restorePreR27MeshRows(rows){return restoreRows(rows,scene.meshes,'complete resident meshes');}
export function restorePreR27GraphRows(rows){return restoreRows(rows,scene.graph,'complete hierarchy, world transforms and metadata');}
export function restorePreR27Materials(rows){return restoreRows(rows,scene.materials,'complete material values');}

/** Both complete arrays are bound before dropping exactly the two final solids.
 * Every preceding collider and all walkables keep their original order/values. */
export function restorePreR27Navigation(value){
  const d=scene.navigation;
  if(hash(value)===d.beforeSHA256)return value;
  assert.equal(hash(value),d.afterSHA256,'exact R27 complete navigation');
  assert.equal(value.colliders.length,d.afterColliders);
  assert.equal(value.walkables.length,d.walkables);
  // JSON identity is the established navigation contract; Box3/Vector3 live
  // instances and their serialized fixture rows contain the same exact values.
  const out=JSON.parse(JSON.stringify(value));
  assert.deepEqual(out.colliders.slice(d.beforeColliders),d.added,'exact two final Jiaotai artifact solids');
  out.colliders.splice(d.beforeColliders,2);
  assert.equal(hash(out),d.beforeSHA256,'exact combined R26 navigation restored');
  return out;
}
