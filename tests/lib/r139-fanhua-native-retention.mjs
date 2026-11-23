import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

export const r139FanhuaRetentionName = 'Fanhua only previous front rail is replaced: all other meshes, floor holes, rooms and navigation preserved';
const original = 'tests/r139/details.test.mjs';
const prior = 'tests/fixtures/r139/RemainingNingshouHalls-r138.js.txt';
const otherPrior = 'tests/fixtures/r139/GuhuaPavilion-r138.js.txt';
const permitted = name => /^[a-zA-Z0-9_./-]+$/.test(name) &&
  !name.split('/').some(part=>!part||part==='.'||part==='..') &&
  (/^(src|data|tests\/lib)\//.test(name)||[original,prior,otherPrior,'package.json','package-lock.json'].includes(name));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const threeFiles = {
  'build/three.module.js': 'ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b',
  'examples/jsm/controls/PointerLockControls.js': 'b6ac6e2331d02fc877c49727c879b3f78e974dc56f43f2fcb89b03230e1f52ca',
  'examples/jsm/utils/BufferGeometryUtils.js': 'b0c64fe6f3b9907262921b73fafc4ade874c07ba6b4876e164c87a830c2c2113',
  'package.json': '2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30'
};

function inputs() {
  const archive = readFileSync(new URL('../fixtures/r139/fanhua-native-retention-sources.json.gz',import.meta.url));
  assert.equal(sha(archive),'74ed744dcf903d05971ad903371f16ce3263034035df6678359eb7b25a33f55c','immutable historical R139 source archive');
  const epoch = JSON.parse(gunzipSync(archive,{maxOutputLength:1_100_000}));
  assert.equal(epoch.commit,'c815629b66b7b3e3d1954b41d10cb573e2054e9f');
  assert.equal(epoch.tree,'4999219acdf1b6f08c5da027ea9a22c0c07884c0');
  assert.equal(epoch.predecessor,'fbc08b6c25fd8dee6fdc71bde2d1763826cf6fbe');
  const names = Object.keys(epoch.files).sort();
  assert.equal(names.length,94);
  assert.equal(sha(names.map(name=>name+' '+epoch.files[name].gitBlob).join('\n')+'\n'),
    'e7ba488d2a5faa7dc26fbfef5dc19ef64a9b71c28bbacea0532b417bbe82fe23','exact published R139 runtime paths and Git blobs');
  assert.equal(epoch.files[original].gitBlob,'d6d8906b0af90061acac69a3c39b156451569c19','untouched original R139 test');
  assert.equal(epoch.files[prior].gitBlob,'6261ff963b5bf411f1c52343cc5f48741fffdd93','verified delivered R138 Fanhua builder');
  assert.equal(epoch.files[otherPrior].gitBlob,'6e08019b64a25fd45be6874706936edc007ae63d','delivered R138 Guhua import at original test loading');
  const files = new Map();
  for(const name of names){
    assert.ok(permitted(name),'safe historical input path: '+name);
    const row=epoch.files[name], bytes=Buffer.from(row.source,'utf8');
    assert.equal(bytes.length,row.size,name);
    assert.equal(sha(bytes),row.sha256,name);
    assert.equal(blob(bytes),row.gitBlob,name);
    files.set(name,bytes);
  }
  assert.equal([...files.values()].reduce((n,bytes)=>n+bytes.length,0),997_616);
  const lock=JSON.parse(files.get('package-lock.json')).packages['node_modules/three'];
  assert.equal(lock.version,'0.162.0');
  assert.equal(lock.integrity,'sha512-xfCYj4RnlozReCmUd+XQzj6/5OjDNHBy5nT6rVwrOKGENAvpXe2z1jL+DZYaMu4/9pNsjH/4Os/VvS9IrH7IOQ==');
  const installed=new URL('../',import.meta.resolve('three'));
  for(const [name,digest] of Object.entries(threeFiles)){
    const bytes=readFileSync(new URL(name,installed));
    assert.equal(sha(bytes),digest,'exact historical Three input: '+name);
    files.set('node_modules/three/'+name,bytes);
  }
  return files;
}

function verifyTAP(output) {
  const lines=output.replaceAll('\r\n','\n').trimEnd().split('\n');
  assert.equal(lines[0],'TAP version 13');
  assert.deepEqual(lines.filter(x=>x.startsWith('# Subtest: ')),['# Subtest: '+r139FanhuaRetentionName]);
  assert.deepEqual(lines.filter(x=>/^(?:not )?ok \d+ - /.test(x)),['ok 1 - '+r139FanhuaRetentionName]);
  assert.deepEqual(lines.filter(x=>/^\d+\.\.\d+/.test(x)),['1..1']);
  for(const [label,value] of Object.entries({tests:1,suites:0,pass:1,fail:0,cancelled:0,skipped:0,todo:0})){
    assert.deepEqual(lines.filter(x=>x.startsWith('# '+label+' ')),['# '+label+' '+value]);
  }
}

/** Only the exact authored R139 rail comparison uses delivered prior files.
 * In particular, roof and current headroom routes are not moved to R139. */
export function replayR139FanhuaRetention() {
  const files=inputs();
  const dir=mkdtempSync(path.join(tmpdir(),'palace-r139-fanhua-'));
  try{
    for(const [name,bytes] of files){
      const location=path.join(dir,name);
      mkdirSync(path.dirname(location),{recursive:true});
      writeFileSync(location,bytes,{flag:'wx',mode:0o444});
    }
    const env={TZ:'UTC',LC_ALL:'C'};
    if(process.platform==='win32'&&process.env.SystemRoot!==undefined)env.SystemRoot=process.env.SystemRoot;
    const child=spawnSync(process.execPath,['--max-old-space-size=1536','--test','--test-concurrency=1',
      '--test-reporter=tap','--test-name-pattern=^'+r139FanhuaRetentionName+'$',original],
    {cwd:dir,env,encoding:'utf8',maxBuffer:512_000,timeout:30_000,windowsHide:true});
    assert.ifError(child.error);
    assert.equal(child.signal,null,child.stderr);
    assert.equal(child.status,0,`${child.stdout}\n${child.stderr}`);
    verifyTAP(child.stdout);
  }finally{rmSync(dir,{recursive:true,force:true});}
}
