// Test/export-only baseline adapter: do not route the old item through the
// integrated buildHall dispatch. Verify the exact R61 method bytes first.
import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
export const R61_JINGYANG_BASELINE=JSON.parse(fs.readFileSync(new URL('../fixtures/r62-jingyang-rear/r61-baseline.json',import.meta.url)));
export function buildR61JingyangRearBaseline(controller,item){
 const source=controller.buildHallBaseline.toString(),frozen=R61_JINGYANG_BASELINE;
 assert.equal(source,frozen.methodSource,'baseline method byte-for-byte R61 proof');assert.equal(Buffer.byteLength(source),frozen.methodBytes);assert.equal(createHash('sha256').update(source).digest('hex'),frozen.methodSha256);assert.deepEqual(item,frozen.item);
 return controller.buildHallBaseline(item);
}
