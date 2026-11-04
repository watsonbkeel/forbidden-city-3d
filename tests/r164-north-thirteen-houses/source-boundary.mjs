import assert from'node:assert/strict';
export const importLine="import {buildNorthThirteenHouses} from '../palace/special/NorthThirteenHouses.js';\n",callLine="    buildNorthThirteenHouses(this.kit,this.zoneJson);\n";
export function stripNorthThirteenDelta(s){for(const part of[importLine,callLine]){assert.equal(s.split(part).length,2,'exact unique North Thirteen delta');s=s.replace(part,'')}return s}
