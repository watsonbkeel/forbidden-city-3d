import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,mkdtempSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';

const original='tests/current-state/qinan-exterior-routes.test.mjs';
const runner='tests/stepwalk.cjs';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const blob=bytes=>createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const allowed=name=>/^[A-Za-z0-9_./-]+$/.test(name)&&
  !name.split('/').some(part=>!part||part==='.'||part==='..')&&
  (/^(src|data|tests\/lib|tests\/fixtures)\//.test(name)||
    [original,runner,'package.json','package-lock.json'].includes(name));
const packages={
  three:['0.162.0','sha512-xfCYj4RnlozReCmUd+XQzj6/5OjDNHBy5nT6rVwrOKGENAvpXe2z1jL+DZYaMu4/9pNsjH/4Os/VvS9IrH7IOQ=='],
  playwright:['1.64.0','sha512-kVzTnYFYEyQ9RGzBjNCd2+yEqWmVbxl3AHPynv3qQ6JTjv4a+kwRcnqQwIpuP3NnrnIrE/Q6wWAIAvMfIE2/Yg=='],
  'playwright-core':['1.64.0','sha512-T9r+MZkTECl2+oUcZ26YgZzTrYidTsIhYYkJix+6iDOymOb1FB2RLLSOxRGnZGv5DStt+aduIVbt+E8WygXYpg=='],
};
const threeFiles={
  'build/three.module.js':'ec3ddc3897ec75288b5502057456c471c2eb7d6e7cf36140d0a5224e94a1984b',
  'examples/jsm/controls/PointerLockControls.js':'b6ac6e2331d02fc877c49727c879b3f78e974dc56f43f2fcb89b03230e1f52ca',
  'examples/jsm/utils/BufferGeometryUtils.js':'b0c64fe6f3b9907262921b73fafc4ade874c07ba6b4876e164c87a830c2c2113',
  'package.json':'2c5b740385ede44b4963ef366c3d29dd8e2e542a354af0ae2063f7dcb3dcde30',
};
const playwrightFiles={
  playwright:[60,5_033_957,'3d0de7557a421671a4f06d4d199a51e2498b02125f35930a4f29b780d46b13ea'],
  'playwright-core':[115,13_655_528,'369d6c5b588ab168f21c88dba6776403aac8ffd1653299e9ccd746479dd75e0e'],
};

function packageFiles(root,prefix=''){
  const rows=[];
  for(const entry of readdirSync(new URL(prefix,root),{withFileTypes:true})){
    const name=prefix+entry.name;
    assert.match(name,/^[A-Za-z0-9_./-]+$/);
    if(entry.isDirectory()) rows.push(...packageFiles(root,name+'/'));
    else {
      assert.ok(entry.isFile(),'regular locked dependency file: '+name);
      rows.push([name,readFileSync(new URL(name,root))]);
    }
  }
  return rows;
}

/** Prepare the byte-identical published R32 callback and its transitive
 * inputs. Node itself registers and reports the original 38 assertions.
 * The historical runner's original DUMP=1 branch does not start a browser. */
export function stageR32QinanExterior(){
  const archive=readFileSync(new URL('../fixtures/r32-qinan-exterior-native-sources.json.gz',import.meta.url));
  assert.equal(sha(archive),'d45a357918654863ba539ada0528464923c439a08a03943e42e2e371afed1af7');
  const raw=gunzipSync(archive,{maxOutputLength:7_907_801});
  assert.equal(raw.length,7_907_801);
  const epoch=JSON.parse(raw);
  assert.equal(epoch.commit,'d0c7342c53c501f27ec73b1607aa4cdee16cdcca');
  assert.equal(epoch.tree,'169eebbe58cd27d5a37d69a2a2a50fae6b9fe8b1');
  assert.equal(epoch.files[original].gitBlob,'c88c23611f5853723628c1625fa25bc3e8bb7a14');
  assert.equal(epoch.files[runner].gitBlob,'d0fae760e70c24bb4fa10c6f3830808cbb544c6a');
  const names=Object.keys(epoch.files).sort();
  assert.equal(names.length,254);
  assert.equal(sha(names.map(name=>`${name} ${epoch.files[name].gitBlob}\n`).join('')),
    'e4b4a22960c519d96238d3952e7eff0df386771b8eb917e89f7242c8b6eb8eb9');
  const files=new Map(names.map(name=>{
    assert.ok(allowed(name),'safe historical source name: '+name);
    const row=epoch.files[name],bytes=Buffer.from(row.source,'utf8');
    assert.equal(bytes.length,row.size,name);
    assert.equal(sha(bytes),row.sha256,name);
    assert.equal(blob(bytes),row.gitBlob,name);
    return [name,bytes];
  }));
  assert.equal([...files.values()].reduce((n,b)=>n+b.length,0),7_371_826);
  const oldLock=JSON.parse(files.get('package-lock.json')).packages;
  const liveLock=JSON.parse(readFileSync(new URL('../../package-lock.json',import.meta.url))).packages;
  for(const [name,[version,integrity]] of Object.entries(packages)){
    const key='node_modules/'+name;
    for(const lock of [oldLock,liveLock]){
      assert.equal(lock[key].version,version);
      assert.equal(lock[key].integrity,integrity);
    }
  }
  const three=new URL('../',import.meta.resolve('three'));
  for(const [name,digest] of Object.entries(threeFiles)){
    const bytes=readFileSync(new URL(name,three));
    assert.equal(sha(bytes),digest,'historical dependency: three/'+name);
    files.set('node_modules/three/'+name,bytes);
  }
  for(const [pkg,[count,total,digest]] of Object.entries(playwrightFiles)){
    const root=new URL('./',import.meta.resolve(pkg+'/package.json'));
    const rows=packageFiles(root).sort(([a],[b])=>a<b?-1:a>b?1:0);
    assert.equal(rows.length,count,pkg);
    assert.equal(rows.reduce((n,[,bytes])=>n+bytes.length,0),total,pkg);
    assert.equal(sha(rows.map(([name,bytes])=>`${name}\0${sha(bytes)}\n`).join('')),digest,pkg);
    // Copy the pinned dependency closure, not a symlink crossing into current source.
    for(const [name,bytes] of rows)files.set('node_modules/'+pkg+'/'+name,bytes);
  }
  const dir=mkdtempSync(path.join(tmpdir(),'palace-r32-qinan-'));
  const dispose=()=>rmSync(dir,{recursive:true,force:true});
  try{
    for(const [name,bytes] of files){
      const target=path.join(dir,name);
      mkdirSync(path.dirname(target),{recursive:true});
      writeFileSync(target,bytes,{flag:'wx',mode:0o444});
    }
    return {original:pathToFileURL(path.join(dir,original)),dispose};
  }catch(error){
    dispose();
    throw error;
  }
}
