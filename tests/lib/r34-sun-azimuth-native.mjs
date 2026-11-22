// Run only the historical V7 source-freeze case on the private, exact R34 tree.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

const entry='tests/current-state/sun-azimuth.test.mjs';
const caseName='protected sources match V7 with only the exact accepted skyline, V9 map/gate, V10 lifecycle and V13 entry deltas';
const sha=value=>createHash('sha256').update(value).digest('hex');
const blob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

function inputs(){
  const fixtures=new URL('../fixtures/',import.meta.url);
  const legacy=readFileSync(new URL('r34-legacy-source-guards.json.gz',fixtures));
  assert.equal(sha(legacy),'c2bad93afee0342046292bd2d3ff72e72a0784435c6eb65cf425acd08155d20a','exact R34 legacy archive');
  const record=JSON.parse(gunzipSync(legacy,{maxOutputLength:10_000_000}));
  assert.equal(record.commit,'12682c3d1bcf2b5da13a18fda7d07b4a31f0c274');
  assert.equal(record.tree,'8c8252249bbd261f96abed9c0e413ffc21269ce3');
  const old=record.files;
  const extra=readFileSync(new URL('r34-sun-azimuth-native-extra.json.gz',fixtures));
  assert.equal(sha(extra),'459cb3c3454e0677e67ef0c4195ea0c520ffd98ea82e27d72ae217640c3bc589','exact R34 sun source guard sidecar');
  const r34=JSON.parse(gunzipSync(extra,{maxOutputLength:650_000}));
  assert.equal(r34.commit,'12682c3d1bcf2b5da13a18fda7d07b4a31f0c274');
  assert.equal(r34.tree,'8c8252249bbd261f96abed9c0e413ffc21269ce3');
  assert.equal(r34.entry,entry);
  assert.equal(r34.roster.length,132);
  assert.deepEqual(r34.roster.map(r=>r[0]),[...new Set(r34.roster.map(r=>r[0]))].sort());
  assert.equal(Object.keys(r34.files).length,30);
  assert.deepEqual(Object.keys(r34.files),r34.roster.filter(r=>r[4]==='extra').map(r=>r[0]));
  const files=new Map(),ids=[];
  for(const [name,gitBlob,digest,size,from] of r34.roster){
    assert.ok(/^[0-9A-Za-z_.\/-]+$/.test(name)&&!name.split('/').some(p=>!p||p==='.'||p==='..'),name);
    assert.ok(name===entry||/^(src|data|tests\/(lib|fixtures))\//.test(name)||['package.json','package-lock.json','main.js','tests/perf.cjs','tests/perf-p2.json','public/textures/hd/manifest.json','public/textures/sd/manifest.json'].includes(name),name);
    assert.ok(from==='legacy'||from==='extra',name);
    const source=from==='extra'?r34.files[name]:old[name]?.source;
    assert.equal(typeof source,'string',name);
    const bytes=Buffer.from(source,'utf8');
    assert.equal(bytes.length,size,name);
    assert.equal(sha(bytes),digest,name);
    assert.equal(blob(bytes),gitBlob,name);
    ids.push(name+' '+gitBlob+'\n');
    files.set(name,bytes);
  }
  assert.equal(sha(ids.join('')),'9e4cff9066b295c016cbc4b004db909a3385ac8ef961c5133e213855b1e309f7','only the exact R34 imports and data');
  assert.equal(blob(files.get(entry)),'f0d4fb9922e9d1422d7cfc8f4580c83ad8a0eb0f','untouched authored test source');
  const lock=JSON.parse(files.get('package-lock.json')).packages['node_modules/three'];
  assert.equal(lock.version,'0.162.0');
  assert.equal(lock.resolved,'https://registry.npmjs.org/three/-/three-0.162.0.tgz');
  assert.equal(lock.integrity,'sha512-xfCYj4RnlozReCmUd+XQzj6/5OjDNHBy5nT6rVwrOKGENAvpXe2z1jL+DZYaMu4/9pNsjH/4Os/VvS9IrH7IOQ==');
  const packageRoot=new URL('../../node_modules/three/',import.meta.url);
  for(const [name,size,digest] of [
    ['package.json',4167,'2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30'],
    ['build/three.module.js',1285851,'ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b'],
  ]){
    const bytes=readFileSync(new URL(name,packageRoot));
    assert.equal(bytes.length,size,name);
    assert.equal(sha(bytes),digest,'exact locked Three ESM input '+name);
    files.set('node_modules/three/'+name,bytes);
  }
  return files;
}

export function replayR34SunSourceGuard(){
  const files=inputs();
  const dir=mkdtempSync(path.join(tmpdir(),'palace-r34-sun-source-'));
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
