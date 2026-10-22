import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const script = new URL('../scripts/p3c-verify-motion-transport.mjs', import.meta.url).pathname;
const sha = b => createHash('sha256').update(b).digest('hex');
const blob = b => createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex');
function fixture(t) {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'p3c-motion-transport-'));
 t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const data=Buffer.from('exact binary\0\xff transport payload','latin1');
 fs.mkdirSync(path.join(dir,'parts'));
 const parts=[data.subarray(0,12),data.subarray(12)].map((bytes,i)=>{
  const p=`parts/sample.part-${String(i).padStart(5,'0')}.bin`;
  fs.writeFileSync(path.join(dir,p),bytes);
  return {index:i,offset:i?12:0,path:p,bytes:bytes.length,sha256:sha(bytes)};
 });
 const index={format:'p3c-motion-binary-transport-v1',maxPartBytes:120000,sourceCommit:'6570c6451dcffdcc6ddc4dedbccf4866f8588422',files:[{id:'sample',sourceCommit:'6570c6451dcffdcc6ddc4dedbccf4866f8588422',sourcePath:'reports/sample.gif',bytes:data.length,sha256:sha(data),gitBlobSha:blob(data),parts}]};
 const indexPath=path.join(dir,'index.json');
 const save=()=>fs.writeFileSync(indexPath,JSON.stringify(index)); save();
 const run=(...args)=>spawnSync(process.execPath,[script,'--index',indexPath,...args],{encoding:'utf8'});
 return {dir,data,index,indexPath,save,run};
}
test('default verifier validates real package without restoring anything',()=>{
 const r=spawnSync(process.execPath,[script],{encoding:'utf8'}); assert.equal(r.status,0,r.stderr); assert.equal(JSON.parse(r.stdout).restored,false);
});
test('exact binary restore only into a new directory',t=>{
 const f=fixture(t),out=path.join(f.dir,'restored'); const r=f.run('--restore-dir',out);
 assert.equal(r.status,0,r.stderr); assert.deepEqual(fs.readFileSync(path.join(out,'reports/sample.gif')),f.data);
 assert.notEqual(f.run('--restore-dir',out).status,0);
});
for(const damage of ['missing','reordered','corrupt','wrong-total','wrong-blob','unsafe-source','unsafe-part','symlink-part','bad-offset','duplicate-output','wrong-source-commit','oversize'])test(`${damage} fails closed before creating restore directory`,t=>{
 const f=fixture(t),entry=f.index.files[0],part=entry.parts[0],out=path.join(f.dir,'never-created');
 if(damage==='missing')fs.unlinkSync(path.join(f.dir,part.path));
 if(damage==='reordered')entry.parts.reverse();
 if(damage==='corrupt')fs.writeFileSync(path.join(f.dir,part.path),Buffer.alloc(part.bytes));
 if(damage==='wrong-total')entry.bytes++;
 if(damage==='wrong-blob')entry.gitBlobSha='0'.repeat(40);
 if(damage==='unsafe-source')entry.sourcePath='../escape.gif';
 if(damage==='unsafe-part')part.path='../escape.bin';
 if(damage==='symlink-part'){fs.renameSync(path.join(f.dir,part.path),path.join(f.dir,'other'));fs.symlinkSync(path.join(f.dir,'other'),path.join(f.dir,part.path));}
 if(damage==='bad-offset')part.offset++;
 if(damage==='duplicate-output')f.index.files.push(structuredClone(entry));
 if(damage==='wrong-source-commit')entry.sourceCommit='0'.repeat(40);
 if(damage==='oversize')part.bytes=120001;
 f.save(); const r=f.run('--restore-dir',out); assert.notEqual(r.status,0,r.stdout); assert.equal(fs.existsSync(out),false);
});
test('restore rejects symlink ancestors',t=>{
 const f=fixture(t);fs.mkdirSync(path.join(f.dir,'real'));fs.symlinkSync(path.join(f.dir,'real'),path.join(f.dir,'link'));
 assert.notEqual(f.run('--restore-dir',path.join(f.dir,'link','new')).status,0);
 assert.equal(fs.existsSync(path.join(f.dir,'real','new')),false);
});
test('unknown CLI flags fail closed',t=>{assert.notEqual(fixture(t).run('--unknown').status,0);});
