import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import adapters from './source-test-adapters.json' with {type:'json'};
const sha=b=>createHash('sha256').update(b).digest('hex'),rows=new Map(adapters.map(r=>[r.path,r]));
/** Used only when checking historical test-source bytes, never when executing tests. */
export function stripXiangxuTestDelta(path,bytes){const row=rows.get(path);if(!row)return bytes;assert.equal(sha(bytes),row.afterSha256,path+' exact source-test adapter');let text=bytes.toString();assert.ok(text.startsWith(row.prefix));text=text.slice(row.prefix.length);for(const edit of row.edits){assert.equal(text.split(edit.after).length,2,path+' unique source-read edit');text=text.replace(edit.after,edit.before);}assert.equal(sha(text),row.beforeSha256,path+' exact original test bytes');return typeof bytes==='string'?text:Buffer.from(text);}
