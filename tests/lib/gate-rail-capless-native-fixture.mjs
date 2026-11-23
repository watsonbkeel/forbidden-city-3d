import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,mkdtempSync,readFileSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';

const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const blob=bytes=>createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
const root=new URL('../fixtures/',import.meta.url);
const epoch={commit:'efedaa7495bc66834cbb6e0a6a47da299458a1b7',tree:'5edbfe051fc9efd162ec9bdeecffeef65425a8cb'};
const entry='tests/current-state/gate-rail-capless.test.mjs';
function checkedArchive(name,zipSha,rawSha,rawMax){
  const zipped=readFileSync(new URL(name,root));
  assert.equal(digest(zipped),zipSha,name+' compressed identity');
  const raw=gunzipSync(zipped,{maxOutputLength:rawMax});
  assert.equal(digest(raw),rawSha,name+' source identity');
  const parsed=JSON.parse(raw);
  for(const [k,v] of Object.entries(epoch))assert.equal(parsed[k],v,name+' '+k);
  return parsed;
}
function validPath(name){
  return (name===entry||name==='package.json'||/^public\/textures\/(?:hd|sd)\/manifest\.json$/.test(name)||/^(src|data|tests\/lib|tests\/fixtures)\//.test(name))
    && /^[\w./-]+$/.test(name) && !name.split('/').some(k=>!k||k==='.'||k==='..');
}

// Shared files are also exact efedaa749 published bytes, not linked to current
// src. Only the 52 independently authenticated rail files are materialized.
export function stageNativeGateRails(){
  const ground=checkedArchive('gate-ground-door-native-sources.json.gz','517877dca5d8fe3d3c1bae7e1e8a66cca8fbdb1bdea276095b00fc257d4b3c42','999949129c7bcd4431170fd7dbf04d64b95b2fdde476d76b206e14c9ab7a8d9d',1147575);
  const rail=checkedArchive('gate-rail-capless-native-sources.json.gz','f057ae3b157337fc1c41926020a79eef491ebed3d1a3cd7e07f8e6736679f276','9d9eb2ae296b48c84e1336f64793420599965e219027be17283d47056232258f',39965);
  assert.equal(Object.keys(ground.files).length,80);
  assert.equal(Object.keys(rail.shared).length,46);
  assert.equal(Object.keys(rail.extra).length,6);
  assert.equal(rail.extra[entry].sha256,'6aa36508d0088781b8bea65a407044171e31810ecd1556eefa37c79cc68d70be');
  assert.deepEqual(ground.three,rail.three);
  const rows=Object.entries({...rail.shared,...rail.extra});
  assert.equal(rows.length,52);
  const lock=JSON.parse(readFileSync(new URL('../../package-lock.json',import.meta.url))).packages['node_modules/three'];
  for(const key of ['version','integrity','resolved'])assert.equal(lock[key],rail.three[key]);
  const pkgURL=new URL('../package.json',import.meta.resolve('three'));
  assert.equal(JSON.parse(readFileSync(pkgURL)).version,rail.three.version);
  const dir=mkdtempSync(join(tmpdir(),'palace-gate-rail-native-')),dispose=()=>rmSync(dir,{recursive:true,force:true});
  try{
    for(const [p,expected] of rows){
      assert.ok(validPath(p),p);
      const record=Object.hasOwn(rail.extra,p)?rail.extra[p]:ground.files[p];
      assert.ok(record,p);
      const bytes=Buffer.from(record.utf8,'utf8');
      assert.equal(bytes.length,expected.bytes,p);
      assert.equal(digest(bytes),expected.sha256,p);
      assert.equal(blob(bytes),expected.blob,p);
      const target=join(dir,p);
      mkdirSync(dirname(target),{recursive:true});writeFileSync(target,bytes,{flag:'wx'});
    }
    mkdirSync(join(dir,'node_modules'));symlinkSync(dirname(fileURLToPath(pkgURL)),join(dir,'node_modules','three'),'dir');
    return {entry:pathToFileURL(join(dir,entry)),dispose};
  }catch(error){dispose();throw error;}
}
