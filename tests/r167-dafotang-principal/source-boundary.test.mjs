import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const added=['data/architecture/dafotang-main-buddha.json','src/scene/palace/special/DafotangMainBuddha.js'];
const modified=['data/architecture/building-fidelity.json','data/i18n/ui-en.json','src/scene/palace/special/RemainingOuterHalls.js','src/ui/PlaceInfoPanel.js'];
const boundary=()=>import('./source-boundary.mjs');
test('the six-path extension is exact, and source-only recovery preserves the physical R166 994 predecessor and original fingerprint',async()=>{
 const {delta,restoreDafotangSource,priorRuntimeFingerprint}=await boundary();assert.deepEqual(delta.files.filter(r=>r.before===null).map(r=>r.path),added);assert.deepEqual(delta.files.filter(r=>r.before!==null).map(r=>r.path),modified);assert.equal(delta.baseCommit,'6462e58485f18aad1506e92318f8258db788e918');
 const before=new Map();for(const r of delta.files){const bytes=fs.readFileSync(r.path);before.set(r.path,bytes);assert.equal(sha(bytes),r.after);const old=restoreDafotangSource(r.path,bytes);if(r.before===null)assert.equal(old,null);else assert.equal(sha(old),r.before);}
 assert.deepEqual(priorRuntimeFingerprint(),{files:994,fingerprint:'92e19fd924f9c66b9782f70be7a20d6045e9e2e66020cab05b60f939834c5987',release:'R166',buildId:'R166-ca2853a67a0f'});
 for(const [p,b]of before)assert.deepEqual(fs.readFileSync(p),b);assert.equal(fs.readFileSync('release.json','utf8'),'{\n  "release": "R166"\n}\n');
});
test('old/wrong/truncated/repeated edits cannot enter the new exact source inverse',async()=>{
 const {delta,restoreDafotangSource,priorOuterManifest}=await boundary();for(const r of delta.files){const bytes=fs.readFileSync(r.path);for(const bad of [bytes.subarray(1),Buffer.concat([bytes,Buffer.from('\n')]),Buffer.concat([bytes,bytes])])assert.throws(()=>restoreDafotangSource(r.path,bad));if(r.before!==null){const old=restoreDafotangSource(r.path,bytes);assert.throws(()=>restoreDafotangSource(r.path,old));}}
 const unknown=Buffer.from('other source');assert.equal(restoreDafotangSource('src/unrelated.js',unknown),unknown);
});
test('physical extended source set is 994 plus exactly two principal inputs, while old bilingual comparison remains 993',async()=>{
 const {verifyXiangxuRuntimeBoundary,stripXiangxuDelta}=await import('../r166-xiangxu-gate/source-boundary.mjs');assert.deepEqual(verifyXiangxuRuntimeBoundary(),{files:996,modified:8,added:3});const {delta,restoreDafotangSource,priorOuterManifest}=await boundary();
 const prior=priorOuterManifest();for(const p of modified){const raw=fs.readFileSync(p),old=restoreDafotangSource(p,raw);let expected=old.toString();for(const edit of prior.inverseEdits[p]??[]){assert.equal(expected.split(edit.after).length,2);expected=expected.replace(edit.after,edit.before);}assert.equal(sha(expected),prior.files.find(r=>r.path===p).before);assert.deepEqual(stripXiangxuDelta(p,raw),Buffer.from(expected),p+' principal then inherited UI/E46 inverse before old normalizers');assert.deepEqual(fs.readFileSync(p),raw);}
 const {verifyRuntimeBoundary}=await import('../bilingual/source-boundary.mjs');assert.deepEqual(verifyRuntimeBoundary(),{files:993,changed:22,added:17});
 assert.equal(delta.files.length,6);
});
test('real runtime imports retain the new component and card feature; comparison recovery never replaces executable source',async()=>{
 const fsRead=fs.readFileSync,{restoreDafotangSource}=await boundary(),path='src/scene/palace/special/RemainingOuterHalls.js',raw=fsRead(path);assert.match(raw.toString(),/buildDafotangMainBuddha\(c\)/);assert.doesNotMatch(restoreDafotangSource(path,raw).toString(),/DafotangMainBuddha/);assert.equal(fs.readFileSync,fsRead);assert.deepEqual(fsRead(path),raw);const module=await import('../../src/scene/palace/special/DafotangMainBuddha.js');assert.equal(typeof module.buildDafotangMainBuddha,'function');
});
