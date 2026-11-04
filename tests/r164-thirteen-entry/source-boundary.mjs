import assert from'node:assert/strict';
export const importLine="import {buildThirteenSouthEntry} from '../palace/special/ThirteenSouthEntry.js';\n",callLine="    buildThirteenSouthEntry(this.kit,this.zoneJson);\n";
export function stripThirteenEntryDelta(s){for(const p of[importLine,callLine]){assert.equal(s.split(p).length,2,'exact unique South entrance delta');s=s.replace(p,'')}return s}
