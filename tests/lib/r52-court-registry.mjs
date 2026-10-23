// Additive test registry supports both frozen 38 and the owner's later combined registry.
// Never replace a committed matching ID; conflicting additions are a hard failure.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
export const ORIGINAL_38_IDS = ["taihe-emperor-01","taihe-official-east-01-01","taihe-official-east-01-02","taihe-official-east-02-01","taihe-official-east-02-02","taihe-official-east-03-01","taihe-official-east-03-02","taihe-official-east-04-01","taihe-official-east-04-02","taihe-official-west-01-01","taihe-official-west-01-02","taihe-official-west-02-01","taihe-official-west-02-02","taihe-official-west-03-01","taihe-official-west-03-02","taihe-official-west-04-01","taihe-official-west-04-02","taihe-attendant-east-01","taihe-attendant-west-01","taihe-guard-east-01","taihe-guard-east-02","taihe-guard-west-01","taihe-guard-west-02","wumen-guard-east-01","wumen-guard-west-01","shenwu-guard-east-01","shenwu-guard-west-01","qianqing-guard-east-01","qianqing-guard-west-01","west-lane-guard-01","west-lane-guard-02","west-lane-guard-03","chuxiu-consort-01","chuxiu-maid-01","yikun-consort-01","yikun-eunuch-01","yongshou-consort-01","yongshou-maid-01"];
export const ORIGINAL_38_SHA256 = 'ac392a830fc3a0682b0edfc40088b247c76857d71d2534dad3725d418d50f8ec';
export function original38(registry){return ORIGINAL_38_IDS.map(id=>{const actor=registry.actors.find(a=>a.id===id);assert.ok(actor,'Missing original required actor '+id);return actor;});}
export function assertOriginal38(registry){assert.equal(createHash('sha256').update(JSON.stringify(original38(registry))).digest('hex'),ORIGINAL_38_SHA256,'Original 38 records must remain byte-equivalent in canonical JSON');}
export function withCourtLifeFragment(base,fragment){
 assertOriginal38(base);const registry={...base};
 for(const key of ['actors','anchors','surfaces','paths']){const entries=[...base[key]],map=new Map(entries.map(x=>[x.id,x]));for(const item of fragment[key]){if(map.has(item.id))assert.deepEqual(map.get(item.id),item,'Conflicting integrated fragment '+key+'/'+item.id);else entries.push(item);}registry[key]=entries;}
 assertOriginal38(registry);return registry;
}
