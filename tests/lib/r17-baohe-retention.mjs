import {restorePreR18Source,restorePreR18Navigation,restorePreR18SceneRow,restorePreR18SceneRows} from './r18-baohe-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from '../fixtures/r17-baohe-source-delta.json' with {type:'json'};
import nav from '../fixtures/r17-baohe-navigation-delta.json' with {type:'json'};
import route from '../fixtures/r17-baohe-route-delta.json' with {type:'json'};
import scene from '../fixtures/r17-baohe-scene-delta.json' with {type:'json'};

const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical assertions only. The application never consumes restored data.
 * Accept exactly the reviewed R17 candidate or the exact R16 baseline; no
 * coordinate tolerance, record filtering, regenerated baseline or broad ignore.
 */
export function restorePreR17Source(path,bytes){
  const d=source.files[path];
  if(!d||sha(bytes)===d.baselineSHA256)return bytes;
  bytes=restorePreR18Source(path,bytes);
  assert.equal(sha(bytes),d.candidateSHA256,`exact R17 Baohe plinth/column source: ${path}`);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R17 reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact R16 source restored: ${path}`);
  return Buffer.from(out);
}

export function restorePreR17Navigation(value){
  const digest=hash(value);
  if(digest===nav.beforeSHA256)return value;
  value=restorePreR18Navigation(value);
  assert.equal(hash(value),nav.afterSHA256,'exact R17 complete registered navigation');
  const out=JSON.parse(JSON.stringify(value));
  for(const[key,d]of Object.entries(nav.collections)){
    assert.equal(out[key].length,d.afterCount);
    for(const c of [...d.changes].reverse()){
      assert.deepEqual(out[key].slice(c.afterIndex,c.afterIndex+c.after.length),c.after);
      out[key].splice(c.afterIndex,c.after.length,...structuredClone(c.before));
    }
    assert.equal(out[key].length,d.beforeCount);
    for(const c of d.changes)assert.deepEqual(out[key].slice(c.beforeIndex,c.beforeIndex+c.before.length),c.before);
  }
  assert.equal(hash(out),nav.beforeSHA256,'exact R16 navigation restored');
  return out;
}

export function restorePreR17SceneRow(name,row){
  if(name!==scene.name||JSON.stringify(row)===JSON.stringify(scene.before))return row;
  row=restorePreR18SceneRow(name,row);
  assert.deepEqual(row,scene.after,'exact R17 complete three-hall geometry');
  return structuredClone(scene.before);
}

export function restorePreR17SceneRows(rows){
  const digest=hash(rows);
  if(digest===scene.beforeSHA256)return rows;
  rows=restorePreR18SceneRows(rows);
  assert.equal(hash(rows),scene.afterSHA256,'exact R17 complete scene groups');
  for(const[name,row]of Object.entries(scene.unchanged))assert.deepEqual(rows[name],row,`unchanged R16 scene group: ${name}`);
  const out={...structuredClone(rows),[scene.name]:restorePreR17SceneRow(scene.name,rows[scene.name])};
  assert.equal(hash(out),scene.beforeSHA256,'exact R16 scene groups restored');
  return out;
}

export function restorePreR17BaoheNorthRoute(row){
  if(JSON.stringify(row)===JSON.stringify(route.before))return row;
  assert.deepEqual(row,route.after,'exact R17 individual-plinth stone-side descent');
  return structuredClone(route.before);
}

export function restorePreR17FixedRoutes(rows){
  const digest=hash(rows);
  if(digest===route.beforeSHA256)return rows;
  assert.equal(digest,route.afterSHA256,'exact R17 full fixed route collection');
  assert.equal(rows.length,route.count);
  const out=structuredClone(rows);
  out[route.index]=restorePreR17BaoheNorthRoute(out[route.index]);
  assert.equal(hash(out),route.beforeSHA256,'exact R16 fixed route collection restored');
  return out;
}

/** Upgrade only the registered R16 descent to the live R17 physical route. */
export function currentBaoheHallPlinthRoute(row){
  assert.deepEqual(row,route.before,'only the registered R16 descent is upgraded');
  return structuredClone(route.after);
}
