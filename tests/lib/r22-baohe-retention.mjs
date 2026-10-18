import {restorePreR22RouteSource} from './r22-baohe-route-retention.mjs';
import {restorePreR23Source,restorePreR23SceneRow,restorePreR23SceneRows} from './r23-baohe-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r22-baohe-source-delta.json' with {type:'json'};
import scene from '../fixtures/r22-baohe-scene-delta.json' with {type:'json'};
import nav from '../fixtures/r22-baohe-navigation-delta.json' with {type:'json'};

const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. Reverse exact R23 first, then the frozen R22 builder to R21.
 * Never imported by the application or used as current feature/route acceptance.
 * Unregistered paths are left for their owning older retention adapter. */
export function restorePreR22Source(path,bytes){
  const d=source.files[path];
  if(!d)return restorePreR22RouteSource(path,restorePreR23Source(path,bytes));
  if(sha(bytes)===d.baselineSHA256)return bytes;
  bytes=restorePreR23Source(path,bytes);
  assert.equal(sha(bytes),d.candidateSHA256,`exact R22 front-door/couplet source: ${path}`);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.before.length>0&&h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R22 reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact R21 source restored: ${path}`);
  return Buffer.from(out);
}

export function assertR22AddedSource(path,bytes){
  assert.ok(Object.hasOwn(source.addedFiles,path),`registered R22 added module: ${path}`);
  bytes=restorePreR23Source(path,bytes);
  assert.equal(sha(bytes),source.addedFiles[path].candidateSHA256,`exact R22 added module: ${path}`);
  return bytes;
}

export function assertR22RetainedSource(path,bytes){
  assert.ok(Object.hasOwn(source.retainedFiles,path),`registered R22 retained module: ${path}`);
  assert.equal(sha(bytes),source.retainedFiles[path],`exact retained R21 module: ${path}`);
  return bytes;
}

export function restorePreR22SceneRow(name,row){
  if(name!==scene.name||JSON.stringify(row)===JSON.stringify(scene.before))return row;
  row=restorePreR23SceneRow(name,row);
  assert.deepEqual(row,scene.after,'exact R22 complete three-hall geometry/material identity');
  return structuredClone(scene.before);
}

export function restorePreR22SceneRows(rows){
  if(hash(rows)===scene.beforeSHA256)return rows;
  rows=restorePreR23SceneRows(rows);
  assert.equal(hash(rows),scene.afterSHA256,'exact R22 complete scene groups');
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(rows[name],row,`unchanged R21 scene group: ${name}`);
  const out={...structuredClone(rows),[scene.name]:restorePreR22SceneRow(scene.name,rows[scene.name])};
  assert.equal(hash(out),scene.beforeSHA256,'exact R21 scene groups restored');
  return out;
}

/** Complete PalaceBuilder registration only. Remove the one exact twelve-leaf
 * insertion after binding all colliders and walkables. No spatial filtering,
 * tolerance, count-only gate, or historical world used by live route tests. */
export function restorePreR22Navigation(value){
  if(hash(value)===nav.beforeSHA256)return value;
  assert.equal(hash(value),nav.afterSHA256,'exact R22 complete registered navigation');
  const out=JSON.parse(JSON.stringify(value));
  for(const[key,d]of Object.entries(nav.collections)){
    assert.equal(out[key].length,d.afterCount);
    assert.equal(hash(out[key]),d.afterSHA256,`exact R22 ${key}`);
    for(const c of [...d.changes].reverse()){
      assert.equal(c.before.length,0,'R22 owns only newly inserted front-leaf colliders');
      assert.deepEqual(out[key].slice(c.afterIndex,c.afterIndex+c.after.length),c.after);
      out[key].splice(c.afterIndex,c.after.length,...structuredClone(c.before));
    }
    assert.equal(out[key].length,d.beforeCount);
    assert.equal(hash(out[key]),d.beforeSHA256,`exact R21 ${key} restored`);
  }
  assert.equal(hash(out),nav.beforeSHA256,'exact R21 navigation restored');
  return out;
}
