import {restorePreR12InnerSource} from './r12-inner-source-retention.mjs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

// Explicit, finite owner-approved exception. This is not a replacement hash
// baseline or a normalizer: all other historical bytes remain mandatory.
export const SHENWU_CONSTANTS_DELTA=Object.freeze({
 before:'  // 神武门\n  SHENWU: {\n    width: 50,\n    depth: 20,\n    height: 22,\n  },',
 after:'  // 神武门：公布城台名义外廓，暂作顶面边界；顶/底测量端点未明（GateTowerMeasurements.js）。\n  SHENWU: {\n    width: 50.18,\n    depth: 26.46,\n    height: 22,\n  },',
});
export function expectedGateConstantsBytes(historical){
 const source=historical.toString('utf8');
 assert.equal(source.split(SHENWU_CONSTANTS_DELTA.before).length-1,1,'Shenwu constants replacement anchor must occur exactly once');
 assert.equal(createHash('sha256').update(historical).digest('hex'),'485f52c51d4f532c585171f7d28c13acd0e984a4ae296a91d21dcac70155ec20','Only exact historical V7/V8 constants bytes are accepted');
 return Buffer.from(source.replace(SHENWU_CONSTANTS_DELTA.before,SHENWU_CONSTANTS_DELTA.after),'utf8');
}
export function assertGateConstantsBytes(historical,current){assert.deepEqual(restorePreR12InnerSource('src/config/constants.js',current),expectedGateConstantsBytes(historical),'Constants must equal historical bytes plus only the approved finite Shenwu nominal-boundary/provenance delta');}
