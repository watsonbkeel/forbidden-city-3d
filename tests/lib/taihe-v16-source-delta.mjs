import {restorePreColumnMaterialSource} from './taihe-column-material-retention.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
export const TAIHE_SOURCE_DELTA=JSON.parse(fs.readFileSync(new URL('../fixtures/taihe-v16-source-deltas.json',import.meta.url)));
/** Strip only enumerated Taihe edits; old historical fixtures are never refreshed. */
export function restorePreTaiheCoreSource(path,current) {
 const record=TAIHE_SOURCE_DELTA[path];if(!record)return current;
 let source=restorePreColumnMaterialSource(path,current).toString('utf8');
 if(!source.includes('TaiheCore')&&!source.includes('taiheCore'))return current;
 for(const {before,after}of record.deltas){assert.equal(source.split(after).length-1,1,`Exact Taihe delta must occur once: ${path}`);source=source.replace(after,before);}
 assert.equal(createHash('sha256').update(source).digest('hex'),record.historicalSHA256,`Unscoped ${path} bytes must remain exact V15`);
 return Buffer.from(source);
}
