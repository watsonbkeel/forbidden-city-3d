import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

// No file writes, product imports, baseline regeneration or external calls.
export function verifyFrozenRows(rows,read) {
  assert.ok(Array.isArray(rows));
  const seen=new Set();let total=0;
  for(const row of rows) {
    assert.equal(typeof row.path,'string');
    assert.match(row.path,/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)*$/);
    assert.ok(!row.path.split('/').some(part=>part==='.'||part==='..'));
    assert.ok(!seen.has(row.path),'duplicate frozen path: '+row.path);seen.add(row.path);
    assert.ok(row.mode==='100644'||row.mode==='100755',row.path+' valid mode');
    assert.ok(Number.isSafeInteger(row.bytes)&&row.bytes>=0,row.path+' valid byte count');
    assert.match(row.sha256,/^[a-f0-9]{64}$/);assert.match(row.gitBlob,/^[a-f0-9]{40}$/);
    const actual=read(row.path);
    assert.equal(actual.regular,true,row.path+' regular file');
    assert.equal(actual.mode,row.mode,row.path+' mode');
    assert.ok(Buffer.isBuffer(actual.bytes),row.path+' Buffer bytes');
    assert.equal(actual.bytes.length,row.bytes,row.path+' byte count');
    assert.equal(createHash('sha256').update(actual.bytes).digest('hex'),row.sha256,row.path+' SHA256');
    assert.equal(createHash('sha1').update(`blob ${actual.bytes.length}\0`).update(actual.bytes).digest('hex'),row.gitBlob,row.path+' Git blob');
    total+=actual.bytes.length;
  }
  return {files:seen.size,bytes:total};
}

export function frozenReadbackSelfCheck() {
  const bytes=Buffer.from('frozen\n');
  const row={path:'tests/example.mjs',mode:'100644',bytes:bytes.length,
    sha256:createHash('sha256').update(bytes).digest('hex'),
    gitBlob:createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')};
  const read=()=>({bytes,mode:'100644',regular:true});
  assert.deepEqual(verifyFrozenRows([row],read),{files:1,bytes:bytes.length});
  const cases=[
    ['changed bytes',[row],()=>({...read(),bytes:Buffer.from('changed\n')})],
    ['wrong SHA256',[{...row,sha256:'0'.repeat(64)}],read],
    ['wrong Git blob',[{...row,gitBlob:'0'.repeat(40)}],read],
    ['wrong mode',[row],()=>({...read(),mode:'100755'})],
    ['nonregular file',[row],()=>({...read(),regular:false})],
    ['missing file',[row],()=>{throw Error('ENOENT')}],
    ['duplicate path',[row,row],read],
    ['path traversal',[{...row,path:'tests/../example.mjs'}],read],
  ];
  for(const [name,rows,reader]of cases)assert.throws(()=>verifyFrozenRows(rows,reader),undefined,name);
  return {passed:true,positiveCases:1,negativeCases:cases.map(([name])=>name),productTestsRun:false};
}
