import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {entries,root,verifyAll,outsideOutput} from './cpu-transport.mjs';
import {readVerifiedChunkedGzip as read} from '../../../../tests/lib/r157-verified-chunked-gzip.mjs';
test('all8 real original or logical fallback identities verify',()=>assert.equal(verifyAll().length,8));
for(const e of entries)test(e.pin.filename+' exact fallback and fail-closed guards',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'a32-cpu-guard-')),file=path.join(dir,e.pin.filename),chunks=file+'.chunks';
 try{
  const expected=read(path.join(root,e.path),e.pin);
  fs.cpSync(path.join(root,e.path)+'.chunks',chunks,{recursive:true});
  assert.deepEqual(read(file,e.pin),expected);
  const a=path.join(chunks,'000000.b64'),b=path.join(chunks,'000001.b64'),original=fs.readFileSync(a),second=fs.readFileSync(b);
  fs.unlinkSync(a);assert.throws(()=>read(file,e.pin));fs.writeFileSync(a,original);
  fs.writeFileSync(a,second);fs.writeFileSync(b,original);assert.throws(()=>read(file,e.pin));fs.writeFileSync(a,original);fs.writeFileSync(b,second);
  const bad=Buffer.from(original);bad[0]=bad[0]===65?66:65;fs.writeFileSync(a,bad);assert.throws(()=>read(file,e.pin));fs.writeFileSync(a,original);
  fs.writeFileSync(file,Buffer.from('corrupt original'));assert.throws(()=>read(file,e.pin));fs.unlinkSync(file);
  fs.writeFileSync(file,expected);fs.unlinkSync(a);assert.deepEqual(read(file,e.pin),expected);fs.unlinkSync(file);fs.writeFileSync(a,original);
  const manifest=path.join(chunks,'manifest.json'),mb=fs.readFileSync(manifest);fs.writeFileSync(manifest,Buffer.concat([mb,Buffer.from(' ')]));assert.throws(()=>read(file,e.pin));fs.writeFileSync(manifest,mb);
  fs.renameSync(a,a+'.saved');fs.symlinkSync(a+'.saved',a);assert.throws(()=>read(file,e.pin));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('restore refuses repository or symlink-mediated destination and existing paths',()=>{
 assert.throws(()=>outsideOutput(root));assert.throws(()=>outsideOutput(path.join(root,'must-not-create')));
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'a32-restore-boundary-'));
 try{fs.symlinkSync(root,path.join(d,'repo'));assert.throws(()=>outsideOutput(path.join(d,'repo','must-not-create')));assert.throws(()=>outsideOutput(d));assert.equal(outsideOutput(path.join(d,'new')),path.join(fs.realpathSync(d),'new'));}finally{fs.rmSync(d,{recursive:true,force:true});}
});
