import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
export const WUMEN_SOURCE_DELTA=JSON.parse(fs.readFileSync(new URL('../fixtures/wumen-vertical-source-deltas.json',import.meta.url)));
export function restorePreWumenVerticalSource(path,current){
 const record=WUMEN_SOURCE_DELTA.sources[path];if(!record)return current;
 let source=current.toString('utf8');
 for(const {before,after}of record.deltas){assert.equal(source.split(after).length-1,1,`Exact Wumen delta must occur once: ${path}`);source=source.replace(after,before);}
 assert.equal(createHash('sha256').update(source).digest('hex'),record.historicalSha256,`All unscoped ${path} bytes must equal V14`);
 return Buffer.from(source);
}
