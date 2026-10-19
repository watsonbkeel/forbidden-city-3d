import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import delta from '../fixtures/r22-baohe-routes-delta.json' with {type:'json'};

const sha=value=>createHash('sha256').update(value).digest('hex');
const hash=value=>sha(JSON.stringify(value));

/** Historical tests-only source reversal. Runtime source has separate frozen
 * provenance. No application code or current route execution uses this data. */
export function restorePreR22RouteSource(path,bytes){
  const d=delta.testFiles[path];
  if(!d||sha(bytes)===d.baselineSHA256)return bytes;
  assert.equal(sha(bytes),d.candidateSHA256,`exact R22 tests-only front-crossing source: ${path}`);
  let out=bytes.toString();
  for(const h of [...d.deltas].reverse()){
    assert.ok(h.before.length>0&&h.after.length>0);
    assert.equal(out.split(h.after).length,2,`one exact R22 tests-only reverse hunk: ${path}`);
    out=out.replace(h.after,h.before);
  }
  assert.equal(sha(out),d.baselineSHA256,`exact pre-correction route source restored: ${path}`);
  return Buffer.from(out);
}

export function assertR22RouteAddedSource(path,bytes){
  assert.ok(Object.hasOwn(delta.addedFiles,path),`registered R22 route helper: ${path}`);
  assert.equal(sha(bytes),delta.addedFiles[path].candidateSHA256,`exact R22 route helper: ${path}`);
  return bytes;
}

/** Direct current descriptor identity, never historical normalization. */
export function assertR22RouteIdentity(kind,rows){
  assert.ok(['fixed','auto'].includes(kind),`registered R22 route collection: ${kind}`);
  const d=delta[kind];
  assert.equal(rows.length,d.count);
  assert.equal(hash(rows),d.afterSHA256,`exact current R22 complete ${kind} routes`);
  return rows;
}

/** Historical descriptor only. The unchanged drivers always receive live
 * route tuples; only historical comparisons reverse the two exact waypoints. */
export function restorePreR22BaoheTraversalRoute(row){
  const d=delta.fixed;
  if(row.name!==d.after.name||JSON.stringify(row)===JSON.stringify(d.before))return row;
  assert.deepEqual(row,d.after,'exact R22 front-crossing tuple before historical reversal');
  return structuredClone(d.before);
}

export function restorePreR22FixedRoutes(rows){
  const d=delta.fixed;
  if(hash(rows)===d.beforeSHA256)return rows;
  assertR22RouteIdentity('fixed',rows);
  const out=structuredClone(rows);
  out[d.index]=restorePreR22BaoheTraversalRoute(out[d.index]);
  assert.equal(hash(out),d.beforeSHA256,'exact historical R19/R21 fixed routes restored');
  return out;
}
