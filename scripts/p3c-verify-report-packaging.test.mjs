import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import crypto from 'node:crypto';
const script=path.resolve('scripts/p3c-verify-report-packaging.mjs');
const run=(...args)=>spawnSync(process.execPath,[script,...args],{encoding:'utf8'});
test('published gzip archives verify original SHA256 and Git blob identity',()=>{
 const result=run('--verify');
 assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/"verifiedArchives": 6/);
});
test('restore is explicit, byte exact, and refuses to overwrite an existing directory',()=>{
 const parent=fs.mkdtempSync(path.join(os.tmpdir(),'r50-package-'));const out=path.join(parent,'restored');
 try{
  const result=run('--restore-dir',out);assert.equal(result.status,0,result.stderr);
  const m=JSON.parse(fs.readFileSync('reports/r50-followup/report-packaging-manifest.json'));
  for(const r of m.compressed){const restored=fs.readFileSync(path.join(out,r.path));assert.equal(crypto.createHash('sha256').update(restored).digest('hex'),r.originalSha256);assert.equal(restored.length,r.originalBytes);}
  assert.notEqual(run('--restore-dir',out).status,0);
 }finally{fs.rmSync(parent,{recursive:true,force:true});}
});

test('fixture reader fails closed on missing, reordered, or damaged parts',async()=>{
 const helper=path.resolve('tests/helpers/p3c-fixture-archive.mjs');assert.ok(fs.existsSync(helper),'integrity checked fixture reader must exist');
 const {readFixtureArchive}=await import(helper);
 const source='reports/r50-followup/kit-preparation-baseline.json.gz.index.json';const original=JSON.parse(fs.readFileSync(source));
 const parent=fs.mkdtempSync(path.join(os.tmpdir(),'r50-fixture-'));
 try{
  const target=path.join(parent,path.basename(source));
  for(const part of original.parts)fs.copyFileSync(path.join(path.dirname(source),part.path),path.join(parent,part.path));
  fs.writeFileSync(target,JSON.stringify(original));assert.equal(readFixtureArchive(target).length,original.originalBytes);
  const removed=path.join(parent,original.parts[0].path);const data=fs.readFileSync(removed);fs.unlinkSync(removed);assert.throws(()=>readFixtureArchive(target),/ENOENT/);fs.writeFileSync(removed,data);
  const swapped=structuredClone(original);[swapped.parts[0],swapped.parts[1]]=[swapped.parts[1],swapped.parts[0]];fs.writeFileSync(target,JSON.stringify(swapped));assert.throws(()=>readFixtureArchive(target),/part order/);
  fs.writeFileSync(target,JSON.stringify(original));const corrupt=Buffer.from(data);corrupt[20]^=1;fs.writeFileSync(removed,corrupt);assert.throws(()=>readFixtureArchive(target),/part SHA256/);fs.writeFileSync(removed,data);
  const altered=structuredClone(original);altered.originalSha256='0'.repeat(64);fs.writeFileSync(target,JSON.stringify(altered));assert.throws(()=>readFixtureArchive(target),/original SHA256/);
  const escaped=structuredClone(original);escaped.parts[0].path='../outside';fs.writeFileSync(target,JSON.stringify(escaped));assert.throws(()=>readFixtureArchive(target),/part path/);
 }finally{fs.rmSync(parent,{recursive:true,force:true});}
});


test('original local 314751 commit comparison is exact when that optional object is present',t=>{
 const commit='314751a381bdbf159a3dd5bdb3c92fcbe7240700';
 if(spawnSync('git',['cat-file','-e',`${commit}^{commit}`]).status!==0){t.skip('Historical local commit is not included in a tree-equivalent remote checkout; SHA256 and Git blob identity remain mandatory above.');return;}
 const result=run('--verify','--compare-source-commit');assert.equal(result.status,0,result.stderr);assert.match(result.stdout,new RegExp(commit));
});

test('one-time baseline capture rejects indexed existing oracle rather than regenerating it',()=>{
 const result=spawnSync(process.execPath,['scripts/p3c-capture-female-refinement-baseline.mjs'],{encoding:'utf8'});
 assert.notEqual(result.status,0);assert.match(result.stderr,/baseline already exists/);
 assert.equal(fs.existsSync('reports/r50-followup/female-refinement-baseline.json'),false);
});

test('a standalone checkout verifies without git and rejects manifest/index disagreement',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'r50-standalone-'));
 try{
  const copy=relative=>{const dest=path.join(root,relative);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(relative,dest);};
  copy('scripts/p3c-verify-report-packaging.mjs');copy('tests/helpers/p3c-fixture-archive.mjs');
  const manifest=JSON.parse(fs.readFileSync('reports/r50-followup/report-packaging-manifest.json'));manifest.compressed=manifest.compressed.slice(0,1);
  const record=manifest.compressed[0];copy(record.gzipPartsIndex);const index=JSON.parse(fs.readFileSync(record.gzipPartsIndex));
  for(const part of index.parts)copy(path.join(path.dirname(record.gzipPartsIndex),part.path));
  const manifestFile=path.join(root,'reports/r50-followup/report-packaging-manifest.json');
  fs.writeFileSync(manifestFile,JSON.stringify(manifest));
  const execute=()=>spawnSync(process.execPath,[path.join(root,'scripts/p3c-verify-report-packaging.mjs'),'--verify'],{cwd:root,encoding:'utf8'});
  const valid=execute();assert.equal(valid.status,0,valid.stderr);
  for(const [key,value]of [['gzipSha256','0'.repeat(64)],['gzipBytes',record.gzipBytes+1],['parts',record.parts+1]]){
   const bad=structuredClone(manifest);bad.compressed[0][key]=value;fs.writeFileSync(manifestFile,JSON.stringify(bad));const invalid=execute();assert.notEqual(invalid.status,0,`must reject divergent ${key}`);
  }
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
