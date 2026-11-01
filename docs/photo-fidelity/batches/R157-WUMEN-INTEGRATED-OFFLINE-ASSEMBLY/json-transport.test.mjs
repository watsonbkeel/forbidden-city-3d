import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {pin,root,readEvidence,outsideOutput} from './json-transport.mjs';
test('original or logical evidence exact full identity',()=>assert.equal(readEvidence().length,3383279));
test('missing original reconstructs exact; missing/reordered/tampered blocks and corrupt existing original fail closed',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'assembly-json-')),file=path.join(dir,'assembly-contract.json'),chunks=file+'.transport.gz.chunks';
 try{const expected=readEvidence();fs.cpSync(path.join(root,pin.originalPath)+'.transport.gz.chunks',chunks,{recursive:true});assert.deepEqual(readEvidence(file),expected);
 const a=path.join(chunks,'000000.b64'),b=path.join(chunks,'000001.b64'),first=fs.readFileSync(a),second=fs.readFileSync(b);
 fs.unlinkSync(a);assert.throws(()=>readEvidence(file));fs.writeFileSync(a,first);
 fs.writeFileSync(a,second);fs.writeFileSync(b,first);assert.throws(()=>readEvidence(file));fs.writeFileSync(a,first);fs.writeFileSync(b,second);
 const bad=Buffer.from(first);bad[0]=bad[0]===65?66:65;fs.writeFileSync(a,bad);assert.throws(()=>readEvidence(file));fs.writeFileSync(a,first);
 fs.writeFileSync(file,'corrupt');assert.throws(()=>readEvidence(file));fs.unlinkSync(file);
 fs.writeFileSync(file,expected);fs.unlinkSync(a);assert.deepEqual(readEvidence(file),expected);fs.unlinkSync(file);fs.writeFileSync(a,first);
 const m=path.join(chunks,'manifest.json'),mb=fs.readFileSync(m);fs.writeFileSync(m,Buffer.concat([mb,Buffer.from(' ')]));assert.throws(()=>readEvidence(file));fs.writeFileSync(m,mb);
 fs.renameSync(a,a+'.saved');fs.symlinkSync(a+'.saved',a);assert.throws(()=>readEvidence(file));fs.unlinkSync(a);fs.renameSync(a+'.saved',a);
 fs.writeFileSync(file+'.real',expected);fs.symlinkSync(file+'.real',file);assert.throws(()=>readEvidence(file));
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('restore rejects inside repository, existing target and symlink-mediated destination',()=>{
 assert.throws(()=>outsideOutput(root));assert.throws(()=>outsideOutput(path.join(root,'not-created')));const d=fs.mkdtempSync(path.join(os.tmpdir(),'assembly-json-out-'));
 try{fs.symlinkSync(root,path.join(d,'repo'));assert.throws(()=>outsideOutput(path.join(d,'repo','not-created')));assert.throws(()=>outsideOutput(d));assert.equal(outsideOutput(path.join(d,'new')),path.join(fs.realpathSync(d),'new'));}finally{fs.rmSync(d,{recursive:true,force:true});}
});

test('exported original and nested gzip identity cannot be mutated',()=>{
 const before=JSON.stringify(pin);assert.equal(Object.isFrozen(pin),true);assert.equal(Object.isFrozen(pin.gzipPin),true);
 assert.throws(()=>{pin.originalBytes=30;},TypeError);assert.throws(()=>{pin.originalSHA256='bad';},TypeError);assert.throws(()=>{pin.originalGitBlobSHA1='bad';},TypeError);assert.throws(()=>{pin.gzipPin.uncompressedBytes=30;},TypeError);assert.throws(()=>{pin.gzipPin.manifestSHA256='bad';},TypeError);assert.throws(()=>{pin.gzipPin={};},TypeError);assert.equal(JSON.stringify(pin),before);assert.equal(readEvidence().length,3383279);
});
