import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
/** Explicit source-comparison boundary. Never installs a filesystem or loader hook. */
export function createBilingualBoundary(manifest,{readBaseline,readCurrent,listCurrent}){
 assert.equal(manifest.baseCommit,'e1287435158ee5aa98e0a1a370cae97021a5c385');
 const entries=new Map();for(const row of manifest.files){assert.match(row.path,/^(?:src\/|data\/|public\/|main\.js$|index\.html$|style\.css$|package(?:-lock)?\.json$|vite\.config\.js$|release\.json$|scripts\/build-identity\.mjs$)/);assert.match(row.path,/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/);assert.ok(!row.path.split('/').some(p=>p==='.'||p==='..'));assert.ok(['100644','100755'].includes(row.mode));assert.ok(!entries.has(row.path));assert.match(row.after,/^[0-9a-f]{64}$/);if(row.before!==null)assert.match(row.before,/^[0-9a-f]{64}$/);entries.set(row.path,row);}
 const changed=new Map([...entries].filter(([,row])=>row.before!==row.after));
 function stripBilingualDelta(path,bytes){
  const row=changed.get(path);if(!row)return bytes;
  assert.equal(sha(bytes),row.after,`Exact bilingual candidate source required: ${path}`);
  if(row.before===null)return null;
  const old=readBaseline(path);assert.ok(Buffer.isBuffer(old));assert.equal(sha(old),row.before,`Exact public e128 source required: ${path}`);
  return typeof bytes==='string'?old.toString('utf8'):old;
 }
 function verifyRuntimeBoundary(){
  const rawPaths=listCurrent();assert.equal(new Set(rawPaths).size,rawPaths.length,'Duplicate/aliased runtime input path');const paths=[...rawPaths].sort();assert.deepEqual(paths,[...entries.keys()].sort(),'Complete runtime input paths, no unknown additions or omissions');
  for(const row of entries.values()){const actual=readCurrent(row.path);assert.ok(Buffer.isBuffer(actual.bytes));assert.equal(actual.regular,true,row.path+' must be a regular file');assert.equal(actual.mode,row.mode,row.path+' exact mode');assert.equal(sha(actual.bytes),row.after,row.path+' exact candidate hash');if(row.before!==null){const baseline=readBaseline(row.path);assert.equal(sha(baseline),row.before,row.path+' exact public baseline hash');assert.equal(Buffer.compare(stripBilingualDelta(row.path,actual.bytes),baseline),0,row.path+' only declared delta');}}
  return {files:entries.size,changed:changed.size,added:[...changed.values()].filter(r=>r.before===null).length};
 }
 function historicalBilingualPaths(paths){
  verifyRuntimeBoundary();const original=[...new Set(paths)];for(const path of original)assert.ok(entries.has(path),'Unexpected historical enumeration input: '+path);
  return paths.filter(path=>entries.get(path).before!==null);
 }
 return {stripBilingualDelta,historicalBilingualPaths,verifyRuntimeBoundary};
}
