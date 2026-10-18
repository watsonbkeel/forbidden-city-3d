import assert from 'node:assert/strict';import{createHash}from'node:crypto';
import delta from '../fixtures/r12-inner-source-deltas.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex');
export function restorePreR12InnerSource(path,bytes){
 const d=delta.files[path];if(!d||sha(bytes)===d.beforeSHA256)return bytes;
 if(!d.deltas.some(h=>bytes.toString().includes(h.after)))return bytes;
 assert.equal(sha(bytes),d.afterSHA256,'exact source-bounded R12 rear-palace integration');let s=bytes.toString();
 for(const h of d.deltas){assert.equal(s.split(h.after).length,2);s=s.replace(h.after,h.before);}
 assert.equal(sha(s),d.beforeSHA256);return Buffer.from(s);
}
