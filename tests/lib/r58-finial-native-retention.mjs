import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

const prefix='tests/current-state/inner-jinshui-';
const originalFiles={
  [prefix+'finial-contact-blocker.test.mjs']:'6862c6995eaad837968b162c066cf62062396fdd',
  [prefix+'finial-replacement-prototype.test.mjs']:'390613bdb3fca3a894227db22b3363d967c29111',
  [prefix+'side-finials.test.mjs']:'4e32e05a1d76f13b279bd354a2d8f17504b96b1d',
};
const contactOut='reports/r58-a-bridge-contact-fix';
const replacementOut='reports/r58-a-bridge-replacement-prototype';
const cases=new Map([
  ...[10,60].flatMap(fps=>['jump','rail-walk'].map(mode=>[
    `unhooked experimental caps reproduce ${mode} penetration at ${fps}Hz`,
    {file:prefix+'finial-contact-blocker.test.mjs',out:contactOut,
      trace:`${mode}-${fps}hz.json`,frames:fps*(mode==='jump'?4:7)},
  ])),
  ['height-preserving local replacement exposes inherited support gap at 10Hz',
    {file:prefix+'finial-replacement-prototype.test.mjs',out:replacementOut,trace:'jump-10hz.json',frames:40}],
  ['only the four side bridges receive caps on their 88 existing posts',
    {file:prefix+'side-finials.test.mjs'}],
]);
const permitted=name=>/^[a-zA-Z0-9_./-]+$/.test(name)&&
  !name.split('/').some(part=>!part||part==='.'||part==='..')&&
  (/^(src|data|tests\/lib)\//.test(name)||Object.hasOwn(originalFiles,name)||['package.json','package-lock.json'].includes(name));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const blob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const threeFiles={
  'build/three.module.js':'ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b',
  'examples/jsm/controls/PointerLockControls.js':'b6ac6e2331d02fc877c49727c879b3f78e974dc56f43f2fcb89b03230e1f52ca',
  'examples/jsm/utils/BufferGeometryUtils.js':'b0c64fe6f3b9907262921b73fafc4ade874c07ba6b4876e164c87a830c2c2113',
  'package.json':'2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30',
};

let pinned;
function inputs(){
  if(pinned)return pinned;
  const archive=readFileSync(new URL('../fixtures/r58-finial-native-sources.json.gz',import.meta.url));
  assert.equal(sha(archive),'130557b96bd4d9e5f5318b616a9b3aefeee91d5418ca9c5a0425d7edc5a6b2b6','immutable published R58 source archive');
  const epoch=JSON.parse(gunzipSync(archive,{maxOutputLength:1_400_000}));
  assert.equal(epoch.commit,'82d8ab9d2b7cf13af6d2233ef3d262f183ce8cbd');
  assert.equal(epoch.tree,'e37c7e99852d2b2e15c3bb87f0b59942aa3339a5');
  const names=Object.keys(epoch.files).sort();
  assert.equal(names.length,122);
  assert.equal(sha(names.map(n=>n+' '+epoch.files[n].gitBlob).join('\n')+'\n'),
    '876852508b9f2e04068852f5cad50c89d53cd2bb9491285161eb7769616daa6e','exact published R58 source path/blob manifest');
  for(const [name,digest] of Object.entries(originalFiles)){
    assert.equal(epoch.files[name].gitBlob,digest,'original test source '+name);
  }
  const files=new Map();
  for(const name of names){
    assert.ok(permitted(name),'safe archived source path: '+name);
    const row=epoch.files[name],bytes=Buffer.from(row.source,'utf8');
    assert.equal(bytes.length,row.size,name);
    assert.equal(sha(bytes),row.sha256,name);
    assert.equal(blob(bytes),row.gitBlob,name);
    files.set(name,bytes);
  }
  assert.equal([...files.values()].reduce((n,bytes)=>n+bytes.length,0),1_303_421);
  const lock=JSON.parse(files.get('package-lock.json')).packages['node_modules/three'];
  assert.equal(lock.version,'0.162.0');
  assert.equal(lock.integrity,'sha512-xfCYj4RnlozReCmUd+XQzj6/5OjDNHBy5nT6rVwrOKGENAvpXe2z1jL+DZYaMu4/9pNsjH/4Os/VvS9IrH7IOQ==');
  const installed=new URL('../',import.meta.resolve('three'));
  for(const [name,digest] of Object.entries(threeFiles)){
    const bytes=readFileSync(new URL(name,installed));
    assert.equal(sha(bytes),digest,'exact historical Three input: '+name);
    files.set('node_modules/three/'+name,bytes);
  }
  pinned=files;
  return pinned;
}

function verifyTAP(output,name){
  const lines=output.replaceAll('\r\n','\n').trimEnd().split('\n');
  assert.equal(lines[0],'TAP version 13');
  assert.deepEqual(lines.filter(x=>x.startsWith('# Subtest: ')),['# Subtest: '+name]);
  assert.deepEqual(lines.filter(x=>/^(?:not )?ok \d+ - /.test(x)),['ok 1 - '+name]);
  assert.deepEqual(lines.filter(x=>/^\d+\.\.\d+/.test(x)),['1..1']);
  for(const [label,value] of Object.entries({tests:1,suites:0,pass:1,fail:0,cancelled:0,skipped:0,todo:0})){
    assert.deepEqual(lines.filter(x=>x.startsWith('# '+label+' ')),['# '+label+' '+value]);
  }
}

/** Execute exactly one original R58 diagnostic, with its intentionally
 * unhooked visual overlay or unintegrated local shaft replacement. The old
 * results do not certify or govern the current R87 bridge-2 solid contacts. */
export function replayR58FinialDiagnostic(name){
  const test=cases.get(name);
  assert.ok(test,'unknown R58 diagnostic name');
  const files=inputs(),dir=mkdtempSync(path.join(tmpdir(),'palace-r58-finials-'));
  try{
    for(const [file,bytes] of files){
      const location=path.join(dir,file);
      mkdirSync(path.dirname(location),{recursive:true});
      writeFileSync(location,bytes,{flag:'wx',mode:0o444});
    }
    // Reports are output only. Never copy the old measured trajectory into
    // the child, and never overwrite any historical report in the checkout.
    const reports=[contactOut,replacementOut];
    for(const folder of reports)mkdirSync(path.join(dir,folder),{recursive:true});
    const env={TZ:'UTC',LC_ALL:'C'};
    if(process.platform==='win32'&&process.env.SystemRoot!==undefined)env.SystemRoot=process.env.SystemRoot;
    assert.match(name,/^[A-Za-z0-9 -]+$/);
    const pattern='^'+name+'$';
    const child=spawnSync(process.execPath,['--max-old-space-size=1536','--test','--test-concurrency=1',
      '--test-reporter=tap','--test-name-pattern='+pattern,test.file],
    {cwd:dir,env,encoding:'utf8',maxBuffer:512_000,timeout:30_000,windowsHide:true});
    assert.ifError(child.error);
    assert.equal(child.signal,null,child.stderr);
    assert.equal(child.status,0,`${child.stdout}\n${child.stderr}`);
    verifyTAP(child.stdout,name);
    for(const folder of reports)assert.deepEqual(readdirSync(path.join(dir,folder)),test.out===folder?[test.trace]:[]);
    if(test.trace){
      const trace=JSON.parse(readFileSync(path.join(dir,test.out,test.trace),'utf8'));
      assert.equal(trace.frames.length,test.frames);
      assert.equal(trace.end.airborne,false);
      assert.ok(Number.isFinite(trace.actualCapSurfaceY)&&Number.isFinite(trace.penetration),'fresh physical trace');
    }
  }finally{rmSync(dir,{recursive:true,force:true});}
}
