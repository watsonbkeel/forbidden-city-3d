import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const blob=bytes=>createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
const entry='tests/current-state/gate-ground-door-colliders.test.mjs';
const validPath=p=>(p===entry||p==='package.json'||/^(src|data|tests\/lib|tests\/fixtures)\//.test(p))
  && /^[\w./-]+$/.test(p) && !p.split('/').some(k=>!k||k==='.'||k==='..');

// Exact historical source graph only: no live-world overrides or loader
// hooks. The original test module registers its own fifty cases directly.
export function stageNativeGateGroundDoors(){
  const zipped=readFileSync(new URL('../fixtures/gate-ground-door-native-sources.json.gz',import.meta.url));
  assert.equal(digest(zipped),'517877dca5d8fe3d3c1bae7e1e8a66cca8fbdb1bdea276095b00fc257d4b3c42');
  const raw=gunzipSync(zipped,{maxOutputLength:1147575});
  assert.equal(digest(raw),'999949129c7bcd4431170fd7dbf04d64b95b2fdde476d76b206e14c9ab7a8d9d');
  const archive=JSON.parse(raw);
  assert.equal(archive.commit,'efedaa7495bc66834cbb6e0a6a47da299458a1b7');
  assert.equal(archive.tree,'5edbfe051fc9efd162ec9bdeecffeef65425a8cb');
  const rows=Object.entries(archive.files);
  assert.equal(rows.length,80);
  assert.equal(archive.files[entry].sha256,'7956accf2767ad38689561110bb500da9db3856a73317ad9e056e1dc568e0789');
  const lock=JSON.parse(readFileSync(new URL('../../package-lock.json',import.meta.url))).packages['node_modules/three'];
  for(const key of ['version','integrity','resolved'])assert.equal(lock[key],archive.three[key]);
  const pkgURL=new URL('../package.json',import.meta.resolve('three'));
  assert.equal(JSON.parse(readFileSync(pkgURL)).version,archive.three.version);
  const dir=mkdtempSync(join(tmpdir(),'palace-gate-ground-native-')),dispose=()=>rmSync(dir,{recursive:true,force:true});
  try{
    for(const [p,v] of rows){
      assert.ok(validPath(p),p);
      const bytes=Buffer.from(v.utf8,'utf8');
      assert.equal(bytes.length,v.bytes,p);
      assert.equal(digest(bytes),v.sha256,p);
      assert.equal(blob(bytes),v.blob,p);
      const target=join(dir,p);
      mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes,{flag:'wx'});
    }
    mkdirSync(join(dir,'node_modules'));symlinkSync(dirname(fileURLToPath(pkgURL)),join(dir,'node_modules','three'),'dir');
    return {entry:pathToFileURL(join(dir,entry)),dispose};
  }catch(error){dispose();throw error;}
}
