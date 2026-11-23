import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

export const r134ZhongheRetentionName = 'integrated Zhonghe plinth retains six walking flights and excludes the two central carved stones';
const original = 'tests/current-state/square-halls.test.mjs';
const oldPolicy = 'src/scene/palace/ZhongheImperialApproach.js';
const permitted = name => /^[a-zA-Z0-9_./-]+$/.test(name) &&
  !name.split('/').some(part=>!part||part==='.'||part==='..') &&
  (/^(src|data)\//.test(name)||[original,'package.json','package-lock.json'].includes(name));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const threeFiles = {
  'build/three.module.js': 'ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b',
  'examples/jsm/utils/BufferGeometryUtils.js': 'b0c64fe6f3b9907262921b73fafc4ade874c07ba6b4876e164c87a830c2c2113',
  'package.json': '2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30'
};

function inputs() {
  const archive = readFileSync(new URL('../fixtures/r134-zhonghe-native-retention-sources.json.gz',import.meta.url));
  assert.equal(sha(archive),'05b6eb1b84b3404807c274bbb9c1ac4f7ff162d12bf79b2d80d606ca57a45d3e','immutable historical R134 source archive');
  const epoch = JSON.parse(gunzipSync(archive,{maxOutputLength:1_450_000}));
  assert.equal(epoch.commit,'65a4f5a3da4a38054c85edf85ceb136d521fd9cb');
  assert.equal(epoch.tree,'ea200d33945795435df3b40a51cf05b90301bfe9');
  const names = Object.keys(epoch.files).sort();
  assert.equal(names.length,130);
  assert.equal(sha(names.map(name=>name+' '+epoch.files[name].gitBlob).join('\n')+'\n'),
    '3f46bf30023a976db09611e364241ccb1a42e2f28689e418a99ab77fc3388eef','exact published R134 runtime paths and Git blobs');
  assert.equal(epoch.files[original].gitBlob,'f77ecad47e51970aec0cef65c3507e2e8caef78f','untouched original R134 test');
  assert.equal(epoch.files[oldPolicy].gitBlob,'02fe0ac599a1d74d2b96988d6e1dac45eefa9bcd','actual pre-R163 nonwalkable central stone policy');
  const files = new Map();
  for(const name of names){
    assert.ok(permitted(name),'safe historical input path: '+name);
    const row=epoch.files[name], bytes=Buffer.from(row.source,'utf8');
    assert.equal(bytes.length,row.size,name);
    assert.equal(sha(bytes),row.sha256,name);
    assert.equal(blob(bytes),row.gitBlob,name);
    files.set(name,bytes);
  }
  assert.equal([...files.values()].reduce((n,bytes)=>n+bytes.length,0),1_349_839);
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
  assert.deepEqual(lines.filter(x=>x.startsWith('# Subtest: ')),['# Subtest: '+r134ZhongheRetentionName]);
  assert.deepEqual(lines.filter(x=>/^(?:not )?ok \d+ - /.test(x)),['ok 1 - '+r134ZhongheRetentionName]);
  assert.deepEqual(lines.filter(x=>/^\d+\.\.\d+/.test(x)),['1..1']);
  for(const [label,value] of Object.entries({tests:1,suites:0,pass:1,fail:0,cancelled:0,skipped:0,todo:0})){
    assert.deepEqual(lines.filter(x=>x.startsWith('# '+label+' ')),['# '+label+' '+value]);
  }
}

/** Replay only the old six-stairs/no-central-gameplay assertion on the
 * exact published R134 source. R163 purposely adds two walkable carved
 * stones; all other current square-hall checks still use today's product. */
export function replayR134ZhongheRetention() {
  const files=inputs();
  const dir=mkdtempSync(path.join(tmpdir(),'palace-r134-zhonghe-'));
  try{
    for(const [name,bytes] of files){
      const location=path.join(dir,name);
      mkdirSync(path.dirname(location),{recursive:true});
      writeFileSync(location,bytes,{flag:'wx',mode:0o444});
    }
    const env={TZ:'UTC',LC_ALL:'C'};
    if(process.platform==='win32'&&process.env.SystemRoot!==undefined)env.SystemRoot=process.env.SystemRoot;
    const child=spawnSync(process.execPath,['--max-old-space-size=1536','--test','--test-concurrency=1',
      '--test-reporter=tap','--test-name-pattern=^'+r134ZhongheRetentionName+'$',original],
    {cwd:dir,env,encoding:'utf8',maxBuffer:512_000,timeout:30_000,windowsHide:true});
    assert.ifError(child.error);
    assert.equal(child.signal,null,child.stderr);
    assert.equal(child.status,0,`${child.stdout}\n${child.stderr}`);
    verifyTAP(child.stdout);
  }finally{rmSync(dir,{recursive:true,force:true});}
}
