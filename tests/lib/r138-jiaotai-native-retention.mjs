import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

export const r138JiaotaiRetentionName = 'all previous palace geometry and contacts retained; no extra flat walkable added';
const original = 'tests/r138/jiaotai-low-rooms.test.mjs';
const prior = 'tests/fixtures/r138/PalaceBuilder-r137.js.txt';
const permitted = name => /^[a-zA-Z0-9_./-]+$/.test(name) &&
  !name.split('/').some(part=>!part||part==='.'||part==='..') &&
  (/^(src|data|tests\/lib)\//.test(name)||[original,prior,'package.json','package-lock.json'].includes(name));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const blob = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const threeFiles = {
  "build/three.module.js": "ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b",
  "examples/jsm/controls/PointerLockControls.js": "b6ac6e2331d02fc877c49727c879b3f78e974dc56f43f2fcb89b03230e1f52ca",
  "examples/jsm/utils/BufferGeometryUtils.js": "b0c64fe6f3b9907262921b73fafc4ade874c07ba6b4876e164c87a830c2c2113",
  "package.json": "2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30"
};

function inputs() {
  const archive = readFileSync(new URL('../fixtures/r138/jiaotai-native-retention-sources.json.gz',import.meta.url));
  assert.equal(sha(archive),'3160fa4bc2f8f5f0b46fcd11588bed0b5b982f474571d7a522f27467653532aa','immutable historical R138 source archive');
  const epoch = JSON.parse(gunzipSync(archive,{maxOutputLength:2_200_000}));
  assert.equal(epoch.commit,'fbc08b6c25fd8dee6fdc71bde2d1763826cf6fbe');
  assert.equal(epoch.tree,'a71eb74bc2945a8e414ef6481ecfe0e2ea1653ad');
  assert.equal(epoch.predecessor,'22d1e72818a3731fef00cbf5117f1eb9fcac76de');
  const names = Object.keys(epoch.files).sort();
  assert.equal(names.length,155);
  assert.equal(sha(names.map(name=>name+' '+epoch.files[name].gitBlob).join('\n')+'\n'),
    '847fdd8e2b5dbd09a85489fde09c8c50b50d76900b10e277a40a85b7107e0108','exact published R138 runtime paths and Git blobs');
  assert.equal(epoch.files[original].gitBlob,'3cf71c04f067ac1be2227c140400bb37f6bea1f0','untouched native test');
  assert.equal(epoch.files[prior].gitBlob,'b352c1e2c00b2f25dd4f9a58d6bbbbe8899b0bf6','verified delivered R137 predecessor');
  const files = new Map();
  for(const name of names){
    assert.ok(permitted(name),'safe historical input path: '+name);
    const row=epoch.files[name], bytes=Buffer.from(row.source,'utf8');
    assert.equal(bytes.length,row.size,name);
    assert.equal(sha(bytes),row.sha256,name);
    assert.equal(blob(bytes),row.gitBlob,name);
    files.set(name,bytes);
  }
  assert.equal([...files.values()].reduce((n,bytes)=>n+bytes.length,0),1_583_475);
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

export function verifyR138JiaotaiRetentionTAP(output) {
  const lines=output.replaceAll('\r\n','\n').trimEnd().split('\n');
  assert.equal(lines[0],'TAP version 13');
  assert.deepEqual(lines.filter(x=>x.startsWith('# Subtest: ')),['# Subtest: '+r138JiaotaiRetentionName]);
  assert.deepEqual(lines.filter(x=>/^(?:not )?ok \d+ - /.test(x)),['ok 1 - '+r138JiaotaiRetentionName]);
  assert.deepEqual(lines.filter(x=>/^\d+\.\.\d+/.test(x)),['1..1']);
  for(const [label,value] of Object.entries({tests:1,suites:0,pass:1,fail:0,cancelled:0,skipped:0,todo:0})){
    assert.deepEqual(lines.filter(x=>x.startsWith('# '+label+' ')),['# '+label+' '+value]);
  }
}

/** Run the unmodified authored comparison against delivered R138 and the
 * original, Git-verified R137 builder fixture. The other five live cases still
 * build the current game; neither they nor unrelated product files are pinned. */
export function replayR138JiaotaiRetention() {
  const files=inputs();
  const dir=mkdtempSync(path.join(tmpdir(),'palace-r138-jiaotai-'));
  try{
    for(const [name,bytes] of files){
      const destination=path.join(dir,name);
      mkdirSync(path.dirname(destination),{recursive:true});
      writeFileSync(destination,bytes,{flag:'wx',mode:0o444});
    }
    const env={TZ:'UTC',LC_ALL:'C'};
    if(process.platform==='win32'){
      const systemRoot=process.env.SystemRoot??process.env.SYSTEMROOT;
      if(systemRoot!==undefined)env.SystemRoot=systemRoot;
    }
    const child=spawnSync(process.execPath,['--max-old-space-size=1536','--test','--test-concurrency=1',
      '--test-reporter=tap','--test-name-pattern=^'+r138JiaotaiRetentionName+'$',original],
      {cwd:dir,env,encoding:'utf8',maxBuffer:512_000,timeout:45_000,windowsHide:true});
    assert.ifError(child.error);
    assert.equal(child.signal,null,child.stderr);
    assert.equal(child.status,0,`${child.stdout}\n${child.stderr}`);
    verifyR138JiaotaiRetentionTAP(child.stdout);
  }finally{rmSync(dir,{recursive:true,force:true});}
}
