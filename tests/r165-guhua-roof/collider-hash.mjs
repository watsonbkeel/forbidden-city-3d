import crypto from'node:crypto';import assert from'node:assert/strict';
// Exact original snapshot replacer. All fields remain native JSON data.
const canonical=(k,v)=>typeof v==='string'?v.replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g,'RUNTIME_UUID'):v;
/** Test evidence only: native JSON tokens, unchanged SHA256 byte sequence.
 * A one-property null-prototype holder preserves each global array index for
 * element toJSON. Never stringify an entire real-region collider array at once.
 * Optional native sparse-array oracle preserves that SAME absolute index. */
export function hashColliderSequence(rows,{verifyNative=false,proof,onToken}={}){
 if(!Array.isArray(rows)||Object.getPrototypeOf(rows)!==Array.prototype)throw TypeError('ordinary collider array required');
 for(let p=rows;p;p=Object.getPrototypeOf(p))if(Object.hasOwn(p,'toJSON'))throw TypeError('root collider array toJSON forbidden');
 const h=crypto.createHash('sha256'),len=rows.length;let bytes=2,maxTokenBytes=0;h.update('[');
 for(let i=0;i<len;i++){
  const key=String(i),value=rows[i],holder=Object.create(null);holder[key]=value;
  const encoded=JSON.stringify(holder,canonical),prefix='{'+JSON.stringify(key)+':';
  assert.ok(encoded==='{}'||encoded.startsWith(prefix)&&encoded.endsWith('}'),'native single-key JSON container');
  const token=encoded==='{}'?'null':encoded.slice(prefix.length,-1);
  if(verifyNative){const padded=new Array(i+1);padded[i]=value;const oracle=JSON.stringify(padded,canonical);assert.equal(token,oracle.slice(1+5*i,-1),'native absolute-index JSON token '+i)}
  if(i)h.update(',');h.update(token);onToken?.(i,token);const n=Buffer.byteLength(token);bytes+=n+(i?1:0);maxTokenBytes=Math.max(maxTokenBytes,n);
 }
 h.update(']');if(proof)Object.assign(proof,{rows:len,bytes,maxTokenBytes,nativeOracleMatched:verifyNative,scope:'ALL_COLLIDER_JSON_FIELDS_ABSOLUTE_INDEX_NATIVE_TOKEN_SHA256'});return h.digest('hex');
}
