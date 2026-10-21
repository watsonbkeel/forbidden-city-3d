import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex'),hash=v=>sha(JSON.stringify(v));
const raw=fs.readFileSync(new URL('../fixtures/r32-route-delta.json',import.meta.url));
assert.equal(sha(raw),'4c2f8e59620b2d30e2b9a135c5b53f85651fa3e4ac32cddb23bf512c784f0403');
export const r32RouteDelta=JSON.parse(raw);
/** Exact descriptor comparison only. Actual current routes use the unchanged
 * controller/driver and are validated separately against current geometry. */
export function restorePreR32Routes(routes,kind='auto'){
 const d=r32RouteDelta[kind];assert.ok(d);if(hash(routes)===d.beforeSHA256)return routes;
 assert.equal(hash(routes),d.afterSHA256,'exact R32 complete ordered descriptors');assert.equal(routes.length,d.afterCount);
 const byName=new Map(routes.map(r=>[r.name,r]));assert.equal(byName.size,routes.length);
 for(const r of d.afterChanged){assert.deepEqual(byName.get(r.name),r);byName.delete(r.name);}
 for(const r of d.beforeChanged){assert.equal(byName.has(r.name),false);byName.set(r.name,structuredClone(r));}
 const out=d.beforeOrder.map(n=>{assert.ok(byName.has(n));return byName.get(n);});assert.equal(out.length,d.beforeCount);assert.equal(hash(out),d.beforeSHA256);return out;
}
export function restoreR32RoutesIfPresent(routes,kind='auto'){return hash(routes)===r32RouteDelta[kind].afterSHA256?restorePreR32Routes(routes,kind):routes;}
