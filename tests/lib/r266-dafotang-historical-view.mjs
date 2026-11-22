import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

const archiveSHA='821abb5d586adbda1cdaf0a9af2a64abe02edabb9db4d6647319ccb4245b0c33';
const sourceRosterSHA='54a504ce39bd93e02f94d12234e0e67ff988dc8688baff602d12b1280673dd49';
const paths=[
  "data/zones/outer-west.json",
  "package-lock.json",
  "package.json",
  "public/textures/dafotang/wanshou-wujiang-modern-tc-r259.SOURCE-LICENSE.txt",
  "public/textures/dafotang/wanshou-wujiang-modern-tc-r259.png",
  "src/scene/palace/special/DafotangEastCabinets.js",
  "src/scene/palace/special/DafotangHistoricLayout.js",
  "src/scene/palace/special/DafotangMainPlaque.js",
  "src/scene/palace/special/DafotangPhotoPresentation.js",
  "src/scene/palace/special/DafotangWeituo.js",
  "src/scene/palace/special/DafotangWoodPagodas.js",
  "src/scene/palace/special/RemainingOuterHalls.js",
  "src/utils/MergeUtils.js",
  "src/utils/TriangleSupport.js",
  "tests/current-state/dafotang-east-cabinets.test.mjs",
  "tests/current-state/dafotang-main-plaque.test.mjs",
  "tests/current-state/dafotang-west-cabinet-height.test.mjs",
  "tests/r265-dafotang-frieze/fixtures/beam-contract.json",
  "tests/r265-dafotang-frieze/fixtures/r264-layout.js.txt",
  "tests/r265-dafotang-frieze/pins.json",
  "tests/r265-dafotang-frieze/snapshot-view.mjs",
  "tests/r265-dafotang-frieze/source-view.mjs",
  "tests/r266-dafotang-upper-band/prior-host.mjs",
];
const exactCases=new Map(Object.entries({
  "tests/current-state/dafotang-east-cabinets.test.mjs": "R257 HISTORICAL_HOST_VIEW: unique call and old evidence except explicit R258 west inset height delta",
  "tests/current-state/dafotang-main-plaque.test.mjs": "R259 HISTORICAL_HOST_VIEW restored by exact R266 inverse calls real plaque builder after beams; not current new-band host runtime",
  "tests/current-state/dafotang-west-cabinet-height.test.mjs": "R258 HISTORICAL_HOST_VIEW: three explicit west edits reverse to old source and leave all other geometry unchanged"
}));
const three={
  "build/three.module.js": "ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b",
  "examples/jsm/utils/BufferGeometryUtils.js": "b0c64fe6f3b9907262921b73fafc4ade874c07ba6b4876e164c87a830c2c2113",
  "package.json": "2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30"
};
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const gitBlob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');

function stageInputs(){
  const compressed=readFileSync(new URL('../fixtures/r266-dafotang-historical-view.json.gz',import.meta.url));
  assert.equal(sha256(compressed),archiveSHA,'exact delivered R266 historical test archive');
  const native=JSON.parse(gunzipSync(compressed,{maxOutputLength:557056}));
  assert.equal(native.commit,'aa11a2b92fcd858581397bac58c4ac637e04ed57');
  assert.equal(native.tree,'8ac63f05ae9c968ab00d1b52711cff30144c4290');
  assert.equal(native.parent,'6c08a02ff09c60b56e94e16a6a47cbfa7f2f7c9c');
  assert.equal(native.r259,'64842aaf4c7a08de8bc274882bb4200e16b37429');
  assert.deepEqual(Object.keys(native.files).sort(),paths,'canonical R266 input roster and boundaries');
  assert.equal(sha256(paths.map(p=>p+' '+native.files[p].gitBlob+'\n').join('')),sourceRosterSHA);
  const files=new Map();
  for(const p of paths){
    const {payload,bytes,sha256:digest,gitBlob:blob}=native.files[p];
    const data=Buffer.from(payload,'base64');
    assert.equal(data.toString('base64'),payload,p);
    assert.equal(data.length,bytes,p);
    assert.equal(sha256(data),digest,p);
    assert.equal(gitBlob(data),blob,p);
    files.set(p,data);
  }
  assert.equal([...files.values()].reduce((total,b)=>total+b.length,0),413850);
  const lock=JSON.parse(files.get('package-lock.json')).packages['node_modules/three'];
  assert.equal(lock.version,'0.162.0');
  assert.equal(lock.integrity,'sha512-xfCYj4RnlozReCmUd+XQzj6/5OjDNHBy5nT6rVwrOKGENAvpXe2z1jL+DZYaMu4/9pNsjH/4Os/VvS9IrH7IOQ==');
  const moduleRoot=new URL('../',import.meta.resolve('three'));
  for(const [p,digest] of Object.entries(three)){
    const data=readFileSync(new URL(p,moduleRoot));
    assert.equal(sha256(data),digest,'exact historical Three input '+p);
    files.set('node_modules/three/'+p,data);
  }
  return files;
}

function checkExactTAP(text,name){
  const rows=text.replaceAll('\r\n','\n').trimEnd().split('\n');
  assert.equal(rows[0],'TAP version 13');
  assert.deepEqual(rows.filter(row=>row.startsWith('# Subtest: ')),['# Subtest: '+name]);
  assert.deepEqual(rows.filter(row=>/^\s*(?:not )?ok \d+ - /.test(row)),['ok 1 - '+name]);
  assert.deepEqual(rows.filter(row=>/^\d+\.\.\d+/.test(row)),['1..1']);
  for(const [key,expected] of Object.entries({tests:1,suites:0,pass:1,fail:0,cancelled:0,skipped:0,todo:0})){
    assert.deepEqual(rows.filter(row=>row.startsWith('# '+key+' ')),['# '+key+' '+expected]);
  }
}

/** Integrity-pinned archived callback, not a security sandbox. The staged
 * original test uses the original exact source and predecessor guards. The
 * other seventeen cases still run against the live tree in their own files. */
export function replayR266DafotangHistoricalView(file,name){
  const original='tests/current-state/'+file;
  assert.equal(exactCases.get(original),name,'recognized exact historical test only');
  return ()=>{
    const inputs=stageInputs(), dir=mkdtempSync(path.join(tmpdir(),'palace-r266-native-'));
    try {
      for(const [p,data] of inputs){
        const dest=path.join(dir,p);
        mkdirSync(path.dirname(dest),{recursive:true});
        writeFileSync(dest,data,{flag:'wx',mode:0o444});
      }
      const selector='^'+name.replace(/[.*+?^$()|[\]\\]/g,'\\$&')+'$';
      const env={TZ:'UTC',LC_ALL:'C'};
      const systemRoot=process.platform==='win32'&&(process.env.SystemRoot??process.env.SYSTEMROOT);
      if(systemRoot)env.SystemRoot=systemRoot;
      const r=spawnSync(process.execPath,['--max-old-space-size=512','--test','--test-concurrency=1',
        '--test-reporter=tap','--test-name-pattern='+selector,original],
        {cwd:dir,env,encoding:'utf8',timeout:15_000,maxBuffer:512_000,windowsHide:true});
      assert.ifError(r.error);
      assert.equal(r.signal,null,r.stderr);
      assert.equal(r.status,0,r.stdout+'\n'+r.stderr);
      checkExactTAP(r.stdout,name);
    } finally {
      rmSync(dir,{force:true,recursive:true});
    }
  };
}
