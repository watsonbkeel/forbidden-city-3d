import assert from 'node:assert/strict';
import delta from '../fixtures/r6-ningshou-route-delta.json' with {type:'json'};
/** Only historical identity comparisons restore this one explicit descriptor.
 * Actual current routes are tested separately; no controller threshold changes.
 */
export function withLegacyNingshouForVersionComparison(routes){
 return routes.map(r=>{if(r.name!==delta.after.name)return r;assert.deepEqual(r,delta.after,'exact R6 compound route');return structuredClone(delta.before);});
}
