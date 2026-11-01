// QA-only bounded nonmutation digest. NOT the original whole-JSON digest and
// never used instead of a fixed historical golden or a physics-retention hash.
// Fixed root key order + array types; each row retains all JSON fields/key order,
// row hashes retain sequence/count; supports and rivers retain their whole JSON.
import assert from'node:assert/strict';import{createHash}from'node:crypto';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export function physicalNonmutationFingerprint(p){
 assert.deepEqual(Object.keys(p),['rows','walkables','rivers'],'physical snapshot exact root fields and order');
 for(const key of['rows','walkables','rivers'])assert.ok(Array.isArray(p[key]),'physical snapshot '+key+' must be an array');
 return hash([p.rows.map(hash),hash(p.walkables),hash(p.rivers)]);
}
