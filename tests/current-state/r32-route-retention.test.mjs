import test from'node:test';import assert from'node:assert/strict';import{createHash}from'node:crypto';
import{replayFrozenR32RouteDescriptors}from'../lib/zhaode-v7-r32-historical.mjs';
import{r32RouteDelta as D,restorePreR32Routes,restoreR32RoutesIfPresent}from'../lib/r32-route-retention.mjs';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex'),{fixed,auto}=replayFrozenR32RouteDescriptors();
for(const[k,rs]of Object.entries({fixed,auto})){
 test(`${k}: exact current descriptors restore only registered R31 changes for historical comparisons`,()=>{assert.equal(hash(rs),D[k].afterSHA256);const old=restorePreR32Routes(rs,k);assert.equal(hash(old),D[k].beforeSHA256);assert.equal(restorePreR32Routes(old,k),old);});
 test(`${k}: unknown points, omission, reorder and added routes fail strict restoration`,()=>{for(const mutation of[r=>r.slice(1),r=>r.toReversed(),r=>[...r,{name:'unknown',pts:[]}],r=>{r[0].pts[0][0]+=.01;return r;}]){const bad=mutation(structuredClone(rs));assert.throws(()=>restorePreR32Routes(bad,k));assert.equal(restoreR32RoutesIfPresent(bad,k),bad);}});
}
test('current automatic set removes the fictional Yanxi room route and adds all three real Huangji openings',()=>{assert.equal(auto.length,61);assert.equal(fixed.length,33);assert.equal(auto.some(r=>r.name==='[east-six] 延禧门→延禧宫→返回'),false);assert.equal(auto.filter(r=>r.name.startsWith('[ningshou] 皇极门门道')).length,3);assert.equal(D.auto.beforeChanged[0].name,'[east-six] 延禧门→延禧宫→返回');assert.equal(D.fixed.beforeChanged.length,5);});
