import assert from 'node:assert/strict';
import delta from '../fixtures/r6-western-route-delta.json' with {type:'json'};
/** Only historical identity checks use these two finite restorations.
 * Real current descriptors are separately walked against the actual world.
 */
export function withLegacyWesternCourtsForVersionComparison(routes){
 return routes.map(r=>{const d=delta.delta.find(d=>d.after.name===r.name);if(!d)return r;
  assert.deepEqual(r,d.after,'exact R6 western-court route');return structuredClone(d.before);});
}
