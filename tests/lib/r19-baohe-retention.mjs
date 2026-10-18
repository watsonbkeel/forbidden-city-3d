import {restorePreR20Source,restorePreR20SceneRow,restorePreR20SceneRows} from './r20-baohe-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r19-baohe-source-delta.json' with {type:'json'};
import nav from '../fixtures/r19-baohe-navigation-delta.json' with {type:'json'};
import scene from '../fixtures/r19-baohe-scene-delta.json' with {type:'json'};
import routes from '../fixtures/r19-baohe-routes-delta.json' with {type:'json'};

const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. The live application never consumes this data.
 * Accept only exact frozen R19 or R18 identity; no tolerances, filtering,
 * regenerated historical hashes, or arbitrary rule/module changes.
 */
export function restorePreR19Source(path,bytes){
  const d=source.files[path]??source.testFiles?.[path];
  if(!d)return restorePreR20Source(path,bytes);
  if(sha(bytes)===d.baselineSHA256)return bytes;
  bytes=restorePreR20Source(path,bytes);
  assert.equal(sha(bytes),d.candidateSHA256,`exact R19 depth/door/ceiling source: ${path}`);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R19 reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact R18 source restored: ${path}`);
  return Buffer.from(out);
}

/** Added modules have no historical byte replacement. Independently bind them. */
export function assertR19AddedSource(path,bytes){
  assert.ok(Object.hasOwn(source.addedFiles,path),`registered R19 added module: ${path}`);
  assert.equal(sha(bytes),source.addedFiles[path].candidateSHA256,`exact R19 added module: ${path}`);
  return bytes;
}

export function restorePreR19Navigation(value){
  const digest=hash(value);
  if(digest===nav.beforeSHA256)return value;
  assert.equal(digest,nav.afterSHA256,'exact R19 complete registered navigation');
  const out=JSON.parse(JSON.stringify(value));
  for(const[key,d]of Object.entries(nav.collections)){
    assert.equal(out[key].length,d.afterCount);
    assert.equal(hash(out[key]),d.afterSHA256,`exact R19 ${key}`);
    for(const c of [...d.changes].reverse()){
      assert.deepEqual(out[key].slice(c.afterIndex,c.afterIndex+c.after.length),c.after);
      out[key].splice(c.afterIndex,c.after.length,...structuredClone(c.before));
    }
    assert.equal(out[key].length,d.beforeCount);
    for(const c of d.changes)assert.deepEqual(out[key].slice(c.beforeIndex,c.beforeIndex+c.before.length),c.before);
    assert.equal(hash(out[key]),d.beforeSHA256,`exact R18 ${key} restored`);
  }
  assert.equal(hash(out),nav.beforeSHA256,'exact R18 navigation restored');
  return out;
}

export function restorePreR19SceneRow(name,row){
  if(name!==scene.name||JSON.stringify(row)===JSON.stringify(scene.before))return row;
  row=restorePreR20SceneRow(name,row);
  assert.deepEqual(row,scene.after,'exact R19 complete three-hall geometry/material identity');
  return structuredClone(scene.before);
}

export function restorePreR19SceneRows(rows){
  const digest=hash(rows);
  if(digest===scene.beforeSHA256)return rows;
  rows=restorePreR20SceneRows(rows);
  assert.equal(hash(rows),scene.afterSHA256,'exact R19 complete scene groups');
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(rows[name],row,`unchanged R18 scene group: ${name}`);
  const out={...structuredClone(rows),[scene.name]:restorePreR19SceneRow(scene.name,rows[scene.name])};
  assert.equal(hash(out),scene.beforeSHA256,'exact R18 scene groups restored');
  return out;
}

/** Bind current routes, including only the registered north-porch correction. */
export function assertR19RouteIdentity(kind,rows){
  assert.ok(['fixed','auto'].includes(kind),`registered R19 route collection: ${kind}`);
  const d=routes[kind];
  if(kind==='auto')assert.equal(d.beforeSHA256,d.afterSHA256,'R19 automatic routes remain unchanged');
  assert.equal(rows.length,d.count);
  assert.equal(hash(rows),d.afterSHA256,`exact current R19 complete ${kind} routes`);
  return rows;
}

/** Historical descriptor only. A current route is never used as acceptance
 * evidence after restoration; current physics is separately replayed. */
export function restorePreR19BaoheTraversalRoute(row){
  const d=routes.fixed;
  if(row.name!==d.after.name||JSON.stringify(row)===JSON.stringify(d.before))return row;
  assert.deepEqual(row,d.after,'exact R19 north-porch crossing tuple');
  return structuredClone(d.before);
}
export function restorePreR19FixedRoutes(rows){
  const d=routes.fixed,digest=hash(rows);
  if(digest===d.beforeSHA256)return rows;
  assert.equal(digest,d.afterSHA256,'exact complete current R19 fixed routes');
  assert.equal(rows.length,d.count);
  const out=structuredClone(rows);
  out[d.index]=restorePreR19BaoheTraversalRoute(out[d.index]);
  assert.equal(hash(out),d.beforeSHA256,'exact complete historical R18 fixed routes restored');
  return out;
}
