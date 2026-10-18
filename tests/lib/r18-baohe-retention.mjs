import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r18-baohe-source-delta.json' with {type:'json'};
import nav from '../fixtures/r18-baohe-navigation-delta.json' with {type:'json'};
import scene from '../fixtures/r18-baohe-scene-delta.json' with {type:'json'};
import routes from '../fixtures/r18-baohe-routes-delta.json' with {type:'json'};

const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. The live application never consumes this data.
 * Accept only exact frozen R18 or R17 identity; no tolerances, filtering,
 * regenerated historical hashes, or arbitrary rule/module changes.
 */
export function restorePreR18Source(path,bytes){
  const d=source.files[path];
  if(!d||sha(bytes)===d.baselineSHA256)return bytes;
  assert.equal(sha(bytes),d.candidateSHA256,`exact R18 column-only source: ${path}`);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R18 reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact R17 source restored: ${path}`);
  return Buffer.from(out);
}

/** Added modules have no historical byte replacement. Independently bind them. */
export function assertR18AddedSource(path,bytes){
  assert.ok(Object.hasOwn(source.addedFiles,path),`registered R18 added module: ${path}`);
  assert.equal(sha(bytes),source.addedFiles[path].candidateSHA256,`exact R18 added module: ${path}`);
  return bytes;
}

export function restorePreR18Navigation(value){
  const digest=hash(value);
  if(digest===nav.beforeSHA256)return value;
  assert.equal(digest,nav.afterSHA256,'exact R18 complete registered navigation');
  const out=JSON.parse(JSON.stringify(value));
  for(const[key,d]of Object.entries(nav.collections)){
    assert.equal(out[key].length,d.afterCount);
    assert.equal(hash(out[key]),d.afterSHA256,`exact R18 ${key}`);
    for(const c of [...d.changes].reverse()){
      assert.deepEqual(out[key].slice(c.afterIndex,c.afterIndex+c.after.length),c.after);
      out[key].splice(c.afterIndex,c.after.length,...structuredClone(c.before));
    }
    assert.equal(out[key].length,d.beforeCount);
    for(const c of d.changes)assert.deepEqual(out[key].slice(c.beforeIndex,c.beforeIndex+c.before.length),c.before);
    assert.equal(hash(out[key]),d.beforeSHA256,`exact R17 ${key} restored`);
  }
  assert.equal(hash(out),nav.beforeSHA256,'exact R17 navigation restored');
  return out;
}

export function restorePreR18SceneRow(name,row){
  if(name!==scene.name||JSON.stringify(row)===JSON.stringify(scene.before))return row;
  assert.deepEqual(row,scene.after,'exact R18 complete three-hall geometry/material identity');
  return structuredClone(scene.before);
}

export function restorePreR18SceneRows(rows){
  const digest=hash(rows);
  if(digest===scene.beforeSHA256)return rows;
  assert.equal(digest,scene.afterSHA256,'exact R18 complete scene groups');
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(rows[name],row,`unchanged R17 scene group: ${name}`);
  const out={...structuredClone(rows),[scene.name]:restorePreR18SceneRow(scene.name,rows[scene.name])};
  assert.equal(hash(out),scene.beforeSHA256,'exact R17 scene groups restored');
  return out;
}

/** R18 changes no route. This validates; it never rewrites a route. */
export function assertR18RouteIdentity(kind,rows){
  assert.ok(['fixed','auto'].includes(kind),`registered R18 route collection: ${kind}`);
  const d=routes[kind];
  assert.equal(d.beforeSHA256,d.afterSHA256,'R18 routes must remain unchanged');
  assert.equal(rows.length,d.count);
  assert.equal(hash(rows),d.afterSHA256,`exact R17/R18 complete ${kind} routes`);
  return rows;
}
