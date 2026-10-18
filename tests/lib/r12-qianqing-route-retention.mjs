import assert from 'node:assert/strict';
import delta from '../fixtures/r12-qianqing-route-delta.json' with {type:'json'};
// Only historical descriptor identity checks use this finite conversion. The
// actual updated outer-stair route is independently walked against real boxes.
export function withLegacyQianqingApproach(rows) {
 return rows.map(row=>{
  const d=delta.delta.find(d=>d.after.name===row.name);if(!d)return row;
  if(JSON.stringify(row)===JSON.stringify(d.before))return row;
  assert.deepEqual(row,d.after,'exact R12 outer-stair approach only');return structuredClone(d.before);
 });
}
