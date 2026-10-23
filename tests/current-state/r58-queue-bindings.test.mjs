import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {PALACE_LAYOUT} from '../../src/scene/Layout.js';
import {southWaterProfile} from '../../src/scene/palace/special/SouthWaterSystem.js';

test('three Wuying review IDs bind to the actual three retained profile IDs, not invented aliases',()=>{
 const queueCli=fileURLToPath(new URL('../../scripts/photo-fidelity/queue.py',import.meta.url));
 const q=JSON.parse(execFileSync('python3',['-B',queueCli,'read','--queue',process.env.R58_QUEUE_BINDING_INPUT??'docs/photo-fidelity/QUEUE.json'],{maxBuffer:64*1024*1024}));
 const river=PALACE_LAYOUT.find(p=>p.type==='river'&&p.southWaterProfile);
 const ids=southWaterProfile(river).bridges.filter(b=>b.family==='wuying').map(b=>b.id);
 assert.deepEqual(ids,['wuying-1','wuying-2','wuying-3']);
 for(const [i,id]of ids.entries()){
  const row=q.items.find(x=>x.id===`INSTANCE-A-WUYING-BRIDGE-${i+1}`);
  assert.equal(row.runtimeInstanceKey,id);
  assert.equal(row.runtimeBindings[0].instanceKey,id);
  assert.ok(row.runtimeBindings[0].ref.endsWith(':'+id));
  assert.equal(row.entityId,null,'An existing instance review is not a new building');
 }
});
