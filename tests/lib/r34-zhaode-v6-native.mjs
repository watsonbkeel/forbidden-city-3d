// R34's historical V6 digest runs on a private, byte-verified R34 tree.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

const entry='tests/current-state/zhaode-gate.test.mjs';
const caseName='four old profile gates and fourteen unrelated corridor assemblies are byte-equivalent to delivered V6';
const sha=value=>createHash('sha256').update(value).digest('hex');
const blob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

function inputs(){
  const fixtures=new URL('../fixtures/',import.meta.url);
  const r32=readFileSync(new URL('zhaode-v7-r32/route-sources.json.gz',fixtures));
  assert.equal(sha(r32),'8cb051b833d7f4cbb875e0214fb7c1cf4652123af001c799bdb183f13e07b5fe','original R32 route archive');
  const old=JSON.parse(gunzipSync(r32,{maxOutputLength:4_000_000}));
  const extra=readFileSync(new URL('r34-zhaode-v6-native-extra.json.gz',fixtures));
  assert.equal(sha(extra),'cca96caa00dee374c67531393da8b3057a7f008e7cf28044669f56b3195ab1be','exact R34 V6 native sidecar');
  const r34=JSON.parse(gunzipSync(extra,{maxOutputLength:180_000}));
  assert.equal(r34.commit,'12682c3d1bcf2b5da13a18fda7d07b4a31f0c274');
  assert.equal(r34.tree,'8c8252249bbd261f96abed9c0e413ffc21269ce3');
  assert.equal(r34.entry,entry);
  assert.equal(r34.roster.length,44);
  assert.deepEqual(r34.roster.map(r=>r[0]),[...new Set(r34.roster.map(r=>r[0]))].sort());
  assert.equal(Object.keys(r34.files).length,6);
  assert.deepEqual(Object.keys(r34.files),r34.roster.filter(r=>r[4]==='r34').map(r=>r[0]));
  const files=new Map(),ids=[];
  for(const [name,gitBlob,digest,size,from] of r34.roster){
    assert.ok(/^[0-9A-Za-z_.\/-]+$/.test(name)&&!name.split('/').some(p=>!p||p==='.'||p==='..'),name);
    assert.ok(name===entry||/^(src|data)\//.test(name)||['package.json','package-lock.json'].includes(name),name);
    assert.ok(from==='r32'||from==='r34',name);
    const sources=from==='r34'?r34.files:old;
    assert.ok(Object.hasOwn(sources,name)&&typeof sources[name]==='string',name);
    const bytes=Buffer.from(sources[name],'utf8');
    assert.equal(bytes.length,size,name);
    assert.equal(sha(bytes),digest,name);
    assert.equal(blob(bytes),gitBlob,name);
    ids.push(name+' '+gitBlob+'\n');
    files.set(name,bytes);
  }
  assert.equal(sha(ids.join('')),'6be291f8102a92233929c114cd64ff4c513b6c6b02174feb42993b58219db01b','only the exact R34 imports and data');
  assert.equal(blob(files.get(entry)),'7bf8ec28e99225969239cbdb24fb53cb3815aef5','untouched authored test source');
  const lock=JSON.parse(files.get('package-lock.json')).packages['node_modules/three'];
  assert.equal(lock.version,'0.162.0');
  assert.equal(lock.resolved,'https://registry.npmjs.org/three/-/three-0.162.0.tgz');
  assert.equal(lock.integrity,'sha512-xfCYj4RnlozReCmUd+XQzj6/5OjDNHBy5nT6rVwrOKGENAvpXe2z1jL+DZYaMu4/9pNsjH/4Os/VvS9IrH7IOQ==');
  const packageRoot=new URL('../../node_modules/three/',import.meta.url);
  for(const [name,size,digest] of [
    ['package.json',4167,'2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30'],
    ['build/three.module.js',1285851,'ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b'],
    ['examples/jsm/utils/BufferGeometryUtils.js',31554,'b0c64fe6f3b9907262921b73fafc4ade874c07ba6b4876e164c87a830c2c2113'],
  ]){
    const bytes=readFileSync(new URL(name,packageRoot));
    assert.equal(bytes.length,size,name);
    assert.equal(sha(bytes),digest,'exact locked Three ESM input '+name);
    files.set('node_modules/three/'+name,bytes);
  }
  return files;
}

export function replayR34ZhaodeV6Geometry(){
  const files=inputs();
  const dir=mkdtempSync(path.join(tmpdir(),'palace-r34-zhaode-v6-'));
  try{
    for(const [name,bytes] of files){
      const destination=path.join(dir,name);
      mkdirSync(path.dirname(destination),{recursive:true});
      writeFileSync(destination,bytes,{flag:'wx',mode:0o444});
    }
    const env={TZ:'UTC',LC_ALL:'C'};
    if(process.platform==='win32'&&process.env.SystemRoot)env.SystemRoot=process.env.SystemRoot;
    const child=spawnSync(process.execPath,['--max-old-space-size=768','--test','--test-concurrency=1','--test-reporter=tap',
      '--test-name-pattern=^'+caseName+'$',entry],
      {cwd:dir,env,encoding:'utf8',maxBuffer:512_000,timeout:15_000,windowsHide:true});
    assert.ifError(child.error);
    assert.equal(child.signal,null,child.stderr);
    assert.equal(child.status,0,child.stdout+'\n'+child.stderr);
    const lines=child.stdout.replaceAll('\r\n','\n').trimEnd().split('\n');
    assert.equal(lines[0],'TAP version 13');
    assert.deepEqual(lines.filter(line=>line.startsWith('# Subtest: ')),['# Subtest: '+caseName]);
    assert.deepEqual(lines.filter(line=>/^(?:not )?ok \d+ - /.test(line)),['ok 1 - '+caseName]);
    assert.deepEqual(lines.filter(line=>/^\d+\.\.\d+/.test(line)),['1..1']);
    for(const [key,val] of Object.entries({tests:1,suites:0,pass:1,fail:0,cancelled:0,skipped:0,todo:0})){
      assert.deepEqual(lines.filter(line=>line.startsWith('# '+key+' ')),['# '+key+' '+val]);
    }
  }finally{rmSync(dir,{recursive:true,force:true});}
}
