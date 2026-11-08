import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import delta from './source-delta.json' with {type:'json'};
import outer from '../r166-xiangxu-gate/source-delta.json' with {type:'json'};
import {verifyXiangxuRuntimeBoundary} from '../r166-xiangxu-gate/source-boundary.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex'),rows=new Map(delta.files.map(r=>[r.path,r]));
assert.equal(rows.size,delta.files.length);
export {delta};
/** Comparison-only recovery to the exact public R166 predecessor. This is
 * never applied to runtime imports, registered collision objects or physical IO. */
export function restoreDafotangSource(path,bytes){
 const row=rows.get(path);if(!row)return bytes;
 assert.equal(sha(bytes),row.after,path+' exact principal after bytes');
 if(row.before===null)return null;
 let text=bytes.toString();for(const edit of delta.inverseEdits[path]){assert.equal(text.split(edit.after).length,2,path+' unique principal inverse');text=text.replace(edit.after,edit.before);}
 assert.equal(sha(text),row.before,path+' exact public predecessor bytes');return typeof bytes==='string'?text:Buffer.from(text);
}
/** Compute the prior fingerprint directly from a verified in-memory byte view.
 * No old working tree, global hook, private commit or write is required. */
export function priorRuntimeFingerprint(){
 verifyXiangxuRuntimeBoundary();const digest=createHash('sha256');let files=0;
 for(const prefix of delta.scope)for(const row of outer.files.filter(r=>r.path===prefix||r.path.startsWith(prefix+'/')).sort((a,b)=>a.path<b.path?-1:1)){
  const bytes=restoreDafotangSource(row.path,fs.readFileSync(new URL('../../'+row.path,import.meta.url)));if(bytes===null)continue;
  files++;digest.update(`${row.path.length}:${row.path}:${bytes.length}:`);digest.update(bytes);
 }
 const fingerprint=digest.digest('hex'),release='R166',base='/forbidden-city-3d/';
 return {files,fingerprint,release,buildId:`${release}-${sha(JSON.stringify([release,fingerprint,base])).slice(0,12)}`};
}
/** Reconstruct the exact prior outer registration, not a new baseline digest. */
export function priorOuterManifest(){
 const prior=structuredClone(outer),added=new Set(delta.files.filter(r=>r.before===null).map(r=>r.path));
 prior.files=prior.files.filter(r=>!added.has(r.path));prior.additionalPaths=prior.additionalPaths.filter(p=>!added.has(p));
 for(const row of prior.files)if(rows.has(row.path)){row.after=rows.get(row.path).before;const addedEdits=delta.inverseEdits[row.path],current=prior.inverseEdits[row.path];assert.deepEqual(current.slice(0,addedEdits.length),addedEdits,row.path+' exact principal inverse prefix');const retained=current.slice(addedEdits.length);if(retained.length)prior.inverseEdits[row.path]=retained;else delete prior.inverseEdits[row.path];}
 assert.equal(sha(JSON.stringify(prior,null,2)+'\n'),delta.baselineOuterManifestSha256,'Exact prior outer registry bytes');return prior;
}
