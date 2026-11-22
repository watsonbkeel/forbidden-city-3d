import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {gunzipSync} from 'node:zlib';

const sha=b=>createHash('sha256').update(b).digest('hex');
const blob=b=>createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');
const reduction='longzong: real production materials achieve only the exact bounded covered-face reduction';
const rotations='longzong: all cardinal rotations, open/closed leaves and plaque modes keep exact premerge state';
const merging='longzong: final material merging retains exact surviving triangle streams and first surfaces';
const authored=[reduction,rotations,merging];
const testFile='tests/current-state/side-gate-render-geometry.test.mjs';
const installed=new URL('../',import.meta.resolve('three'));
const dependencies={
  'package.json':'2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30',
  'build/three.module.js':'ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b',
  'examples/jsm/utils/BufferGeometryUtils.js':'b0c64fe6f3b9907262921b73fafc4ade874c07ba6b4876e164c87a830c2c2113',
};
function stageWrite(dir,p,b) {
  assert.ok(/^[\p{L}\p{N}/_.-]+$/u.test(p)&&!p.startsWith('/')&&!p.split('/').some(x=>x===''||x==='.'||x==='..'),'canonical archive path: '+p);
  const file=path.join(dir,p);
  mkdirSync(path.dirname(file),{recursive:true});
  writeFileSync(file,b,{flag:'wx'});
}
export function authoredLongzong(name) {
  assert.ok(authored.includes(name),'only the three original delivered Longzong checks may replay');
  return () => {
    const packed=readFileSync(new URL('../fixtures/longzong-authored-delivery.json.gz',import.meta.url));
    assert.equal(sha(packed),'0129a87574d4a26685c8605bbc2def7af28640b478754d7019f686fcc24790c3','exact delivered Longzong source archive');
    const source=JSON.parse(gunzipSync(packed,{maxOutputLength:750_000}));
    assert.equal(source.commit,'4823cccbb1ff7c55a40ef4e787460a2247c9dd06');
    assert.equal(source.tree,'449e2200721a857c6a0a4d112e59739ce79de433');
    assert.equal(source.test,testFile);
    assert.deepEqual(source.caseNames,authored);
    assert.equal(Object.keys(source.files).length,55);
    assert.equal(source.files[testFile].gitBlob,'7c02f725be6f7a5655d6b24d60f38cc720b8b579');
    assert.equal(source.files['src/scene/palace/special/SideGate.js'].gitBlob,'60fc6d9d74cf174d59e60fc4701b7bda7d431ad9');
    assert.equal(source.files['src/scene/palace/special/LongzongHallFrontFit.js'].gitBlob,'bb819cd1a4e28a5330245a94f1c2dfc8c2a40b5b');
    const lock=JSON.parse(source.files['package-lock.json'].source).packages['node_modules/three'];
    assert.equal(lock.version,source.three);
    assert.equal(lock.version,'0.162.0');
    const dir=mkdtempSync(path.join(tmpdir(),'palace-longzong-delivered-'));
    try{
      for(const [p,row] of Object.entries(source.files)){
        assert.ok(!p.startsWith('node_modules/'));
        const b=Buffer.from(row.source,'utf8');
        assert.equal(b.length,row.size,p);assert.equal(sha(b),row.sha256,p);assert.equal(blob(b),row.gitBlob,p);
        stageWrite(dir,p,b);
      }
      for(const [p,digest] of Object.entries(dependencies)){
        const b=readFileSync(new URL(p,installed));
        assert.equal(sha(b),digest,'exact Three implementation '+p);
        stageWrite(dir,'node_modules/three/'+p,b);
      }
      // The authentic merge case needs same-process reduction evidence.
      // Run that unmodified prerequisite privately, not as an outer case.
      const names=name===merging?[reduction,merging]:[name];
      const exact='^(?:'+names.map(n=>n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')$';
      const out=spawnSync(process.execPath,['--max-old-space-size=1536','--test','--test-concurrency=1','--test-reporter=tap','--test-name-pattern='+exact,testFile],{
        cwd:dir,env:{TZ:'UTC',LC_ALL:'C'},encoding:'utf8',timeout:25_000,maxBuffer:512_000,
      });
      assert.ifError(out.error);
      assert.equal(out.status,0,out.stdout+'\n'+out.stderr);
      const lines=out.stdout.split(/\r?\n/);
      assert.deepEqual(lines.filter(row=>/^\s*(?:not )?ok\s/.test(row)),names.map((n,i)=>`ok ${i+1} - ${n}`),'exact original Longzong authored order');
      const len=names.length;
      for(const row of [`1..${len}`,`# tests ${len}`,`# pass ${len}`,'# fail 0','# cancelled 0','# skipped 0','# todo 0'])assert.ok(lines.includes(row),'missing complete native TAP '+row);
    }finally{rmSync(dir,{recursive:true,force:true});}
  };
}
