import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {meshFingerprint} from './gate-tower-fixture.mjs';
import {restorePreWumenAscent} from './wumen-ascent-retention.mjs';
export const baseline=JSON.parse(fs.readFileSync(new URL('../fixtures/v14-wumen-vertical-profile-controls.json',import.meta.url)));
export const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function unscopedWumen(c){
 c=restorePreWumenAscent(c);
 assert.equal(c.group.children[28].userData.structure?.id,'axis/wumen-upper-tower');
 assert.equal(c.group.children[29].name,'roof_wudian');
 assert.equal(c.group.children[30].name,'wumen-south-gate-name-plaque');
 assert.equal(c.group.children.length,41,'No unreviewed objects may be inserted into the Wumen group');
 const copy=c.group.clone(true),removed=[28,29,30].map(i=>copy.children[i]);removed.forEach(m=>copy.remove(m));return copy;
}
export function assertUnscopedWumen(c){assert.equal(meshFingerprint(unscopedWumen(c)),baseline.unscopedGeometry,'Unscoped Wumen geometry must equal V14');}
export const footRoundoff=JSON.parse(fs.readFileSync(new URL('../fixtures/wumen-collider-foot-roundoff.json',import.meta.url)));
export function restoreWumenFootRoundoff(colliders){
 const copy=colliders.map(b=>b.clone());assert.equal(footRoundoff.changes.length,46);
 for(const row of footRoundoff.changes){
  const b=copy[row.index];assert.ok(b,`missing collider ${row.index}`);
  assert.deepEqual({min:b.min.toArray(),max:b.max.toArray()},row.after,`only exact approved foot rounding at collider ${row.index}`);
  assert.deepEqual(row.after.max,row.before.max);for(const axis of [0,2])assert.equal(row.after.min[axis],row.before.min[axis]);
  assert.ok(Math.abs(row.deltaY)<=5e-7);assert.ok(Math.abs(row.before.min[1]-12.3)<=5e-7);assert.ok(Math.abs(row.after.min[1]-12.3)<=5e-7);
  b.min.y=row.before.min[1];
 }return copy;
}
