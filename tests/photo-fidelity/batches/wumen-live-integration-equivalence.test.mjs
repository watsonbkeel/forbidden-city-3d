import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {R157_COMMITTED_VERSIONS} from '../../lib/r157-committed-versions.mjs';
const worker=fileURLToPath(new URL('../../lib/r157-wumen-component-capture.mjs',import.meta.url));
const loader=fileURLToPath(new URL('../../lib/r157-committed-source-loader.mjs',import.meta.url));
function capture(mode,version,negative){
 const env={...process.env};delete env.R157_FROZEN_SOURCE_COMMIT;delete env.NODE_TEST_CONTEXT;
 const args=[];if(version){env.R157_FROZEN_SOURCE_COMMIT=R157_COMMITTED_VERSIONS[version];args.push('--import',loader);}
 const r=spawnSync(process.execPath,[...args,worker,mode,...(negative?[negative]:[])],{cwd:process.cwd(),env,encoding:'utf8',timeout:120_000,maxBuffer:4*1024*1024});
 assert.equal(r.status,0,`Capture ${mode}/${version??'LIVE'} failed: ${r.signal??''}\n${r.error??''}\n${r.stderr?.slice(-2000)??''}`);
 const result=JSON.parse(r.stdout);assert.equal(result.provenance.frozenCommit,version?R157_COMMITTED_VERSIONS[version]:null);return result;
}
test('LIVE integrated Wumen preserves all 12 independent wing/pavilion/link/roof target signatures, 16 scoped colliders and 280 real foot contacts',t=>{
 const source=capture('wings','wings'),live=capture('wings');assert.equal(live.provenance.source,'LIVE_WORKING_TREE_NO_FREEZE');
 assert.equal(Object.keys(source.targets).length,12);assert.deepEqual(Object.keys(live.targets),Object.keys(source.targets));
 for(const id of Object.keys(source.targets))assert.deepEqual(live.targets[id],source.targets[id],`LIVE target ${id}: complete ordered geometry/material/render/metadata/local-proxy/share signature`);
 assert.equal(source.scopedRuntimePhysics.count,16);assert.deepEqual(live.scopedRuntimePhysics,source.scopedRuntimePhysics);
 assert.equal(source.actualDeckFootSamples,280);assert.equal(live.actualDeckFootSamples,280);
 t.diagnostic(`Whole global counts are deliberately NOT asserted unchanged: independent=${JSON.stringify(source.wholeRuntimeCounts)} live=${JSON.stringify(live.wholeRuntimeCounts)}. Lower-base/main-tower own contracts cover authorized deltas.`);
});
test('LIVE NE enclosure, its six original north columns/local proxies and actual closed-body collider equal independent enclosure candidate',()=>{
 const source=capture('neEnclosure','neEnclosure'),live=capture('neEnclosure');assert.equal(live.provenance.source,'LIVE_WORKING_TREE_NO_FREEZE');
 assert.deepEqual(live.enclosure,source.enclosure);assert.deepEqual(live.northColumns,source.northColumns);
 // Later independently tested outward-side additions append proxies. Every
 // original NE proxy remains in original order; no original one is normalized.
 assert.ok(live.localProxies.length>=source.localProxies.length);assert.deepEqual(live.localProxies.slice(0,source.localProxies.length),source.localProxies);
 assert.equal(live.closedBodyRuntime,source.closedBodyRuntime);assert.equal(source.actualDeckFootSamples,30);assert.equal(live.actualDeckFootSamples,30);
});

test('LIVE equivalence negative controls detect group hiding, a moved column and material state changes',()=>{
 const source=capture('wings','wings');
 for(const control of ['hide-east-wing','move-ne-column','material-opacity']){const changed=capture('wings',undefined,control);assert.notDeepEqual(changed.targets,source.targets,`LIVE negative control ${control} must be observable`);}
});
