import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

const base = new URL('../../',import.meta.url);
const sha = b => createHash('sha256').update(b).digest('hex');
const blob = b => createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const side = 'side-gate-render-geometry.test.mjs';
const tiren = 'r58-tiren-lower-leaves.test.mjs';
const xihe = 'r58-xihe-corbels.test.mjs';
const cases = {
  2: {
    [tiren]: [
      'Tiren replaces only six lower window groups with twelve separately framed straight-lattice leaves',
      'Hongyi, including its six original windows and upper gallery, is byte-identical',
    ],
    [xihe]: [
      'six curved Xihe rear corbels are added while all baseline geometry, materials and registrations stay exact',
      ...['xiehe','jingyun','longzong'].map(p=>p+' remains byte-identical and gets no copied Xihe silhouette'),
    ],
  },
  4: {
    [side]: [
      'xiehe: all cardinal rotations, open/closed leaves and plaque modes keep exact premerge state',
      'fresh gates own disjoint geometry; merging and unloading never dispose shared library materials',
    ],
  },
};
const pins = {
  2:{archive:'fbd4c65f8a96febed1c3e52476d85986a9585bff92e61e2b56a3c2f0fc54473c',manifest:'ef78ca7ab481dc15c1594ad9ffb307945a84462227d8295e109eb1f20d2db950',n:51,
    tests:{[tiren]:'e81e711ce1beec1296169e6d912991cd084fffee',[xihe]:'8d54895f9c0fc845ac9dee4b65156d2eb4563d47'}},
  4:{archive:'4d717a1becc924e505b4e67d42a59f86d8ee2998e3c1481a0fb6ec145cfb6974',manifest:'4e19f91221a3fcacc40ca304e0f078356903d93b06b33489fdaeb5a40c4ca258',n:43,
    tests:{[side]:'c16ee8c8ac14450375a3574edd6acf538437815f'}},
};
const threeFiles = {
  'package.json':'2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30',
  'build/three.module.js':'ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b',
  'examples/jsm/utils/BufferGeometryUtils.js':'b0c64fe6f3b9907262921b73fafc4ade874c07ba6b4876e164c87a830c2c2113',
};
const read = p => readFileSync(new URL(p,base));
function archive(name, digest, limit) {
  const b=read('tests/fixtures/r58-authored-facade/'+name+'.json.gz');
  assert.equal(sha(b),digest,'exact archived source bundle: '+name);
  return JSON.parse(gunzipSync(b,{maxOutputLength:limit}));
}
function safe(p) {
  assert.ok(/^[\p{L}\p{N}/_.-]+$/u.test(p)&&!p.startsWith('/')&&!p.split('/').some(x=>!x||x==='.'||x==='..'),'canonical fixture path: '+p);
}
function stageWrite(dir,p,b) {
  safe(p);
  const target=path.join(dir,p);
  mkdirSync(path.dirname(target),{recursive:true});
  writeFileSync(target,b,{flag:'wx'});
}
export function authoredFacade(epoch,file,name) {
  assert.ok(cases[epoch]?.[file]?.includes(name),'only named R58-A facade cases can replay');
  const runTest='tests/current-state/'+file;
  return () => {
    const pin=pins[epoch], snapshot=archive('batch'+epoch,pin.archive,800_000);
    assert.equal(snapshot.baselineTag,'R58-A internal batch '+epoch);
    assert.equal(snapshot.manifestSHA256,pin.manifest,'correct independent batch manifest');
    assert.equal(snapshot.delivery,'82d8ab9d2b7cf13af6d2233ef3d262f183ce8cbd');
    assert.equal(Object.keys(snapshot.files).length,pin.n);
    assert.deepEqual(snapshot.missing,{});
    assert.equal(snapshot.files[runTest].gitBlob,pin.tests[file],'unaltered authored test blob');
    const dir=mkdtempSync(path.join(tmpdir(),'palace-facade-batch'+epoch+'-'));
    try {
      for(const [p,row] of Object.entries(snapshot.files)) {
        assert.ok(!p.startsWith('node_modules/'));
        const b=Buffer.from(row.source,'utf8');
        assert.equal(b.length,row.size,p);assert.equal(sha(b),row.sha256,p);assert.equal(blob(b),row.gitBlob,p);
        stageWrite(dir,p,b);
      }
      const prefix='node_modules/three/';
      const installed = new URL('../',import.meta.resolve('three'));
      const lock=JSON.parse(snapshot.files['package-lock.json'].source).packages['node_modules/three'];
      assert.equal(lock.version,'0.162.0');
      for(const [p,digest] of Object.entries(threeFiles)) {
        const b=readFileSync(new URL(p,installed));
        assert.equal(sha(b),digest,'exact historical Three input: '+p);
        stageWrite(dir,prefix+p,b);
      }
      const exact='^'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$';
      // A fresh temp tree and process, not an ESM/global resolver hook. Do not
      // inherit NODE_TEST_CONTEXT, loader flags, or private artifact paths.
      const r=spawnSync(process.execPath,
        ['--max-old-space-size=1536','--test','--test-concurrency=1','--test-reporter=tap','--test-name-pattern='+exact,runTest],
        {cwd:dir,env:{TZ:'UTC',LC_ALL:'C'},encoding:'utf8',timeout:25_000,maxBuffer:512_000});
      assert.ifError(r.error);
      assert.equal(r.status,0,r.stdout+'\n'+r.stderr);
      const tap=r.stdout.split(/\r?\n/);
      assert.deepEqual(tap.filter(row=>/^\s*(?:not )?ok\s/.test(row)),['ok 1 - '+name],'the sole replayed assertion has its original exact name');
      for(const row of ['1..1','# tests 1','# pass 1','# fail 0','# cancelled 0','# skipped 0','# todo 0']) assert.ok(tap.includes(row),'missing full TAP result '+row);
    } finally {rmSync(dir,{recursive:true,force:true});}
  };
}
