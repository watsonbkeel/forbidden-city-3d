import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

test('real finish and construction release allow the original F49 branch to collect while kit survives, with rooted and held-record controls',()=>{
  const child=spawnSync(process.execPath,['--expose-gc','--max-old-space-size=256','--max-semi-space-size=16',fileURLToPath(new URL('./gc-probe.mjs',import.meta.url))],{encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
  assert.equal(child.error,undefined);
  assert.equal(child.status,0,child.stderr);
  const result=JSON.parse(child.stdout);console.log(JSON.stringify(result));
  const byName=Object.fromEntries(result.first.map(s=>[s.name,s]));
  for(const name of ['unmodified-released','applied-released','postcommit-error-released']){
    assert.ok(Object.values(byName[name].alive).every(alive=>!alive),name+' must release every original scene/record weak target');
  }
  for(const name of ['applied-rooted','externally-held-record'])assert.ok(Object.values(byName[name].alive).every(Boolean),name+' must stay live');
  assert.ok(Object.values(result.afterDrop.alive).every(alive=>!alive),'dropping external record must release the branch');
  assert.deepEqual(result.rebuiltOriginal,{staged:0,disposed:0},'collected identity must still reject a reconstructed original frame');
  for(const row of result.first){
    assert.equal(row.meshes,35);assert.equal(row.geometries,24);
    assert.equal(row.frameBytes,row.name==='unmodified-released'?94008:97080);
    assert.equal(row.counts.material,0,'shared material remains borrowed');
    if(row.name!=='unmodified-released')assert.equal(row.counts.old,1);
    if(row.name!=='applied-rooted'&&row.name!=='unmodified-released')assert.equal(row.counts.applied,1,'finish disposes applied geometry once');
  }
  assert.equal(byName['applied-released'].cost.geometryBytes-byName['unmodified-released'].cost.geometryBytes,3072,'final merged geometry cost stays unchanged');
});
