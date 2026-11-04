import{stripNorthThirteenDelta}from'../r164-north-thirteen-houses/source-boundary.mjs';
import assert from'node:assert/strict';
export const importLine="import {buildSouthThirteenHouses} from '../palace/special/SouthThirteenHouses.js';\n",callLine="    buildSouthThirteenHouses(this.kit,this.zoneJson);\n";
export function stripSouthThirteenDelta(s){if(s.includes('buildNorthThirteenHouses'))s=stripNorthThirteenDelta(s);for(const part of[importLine,callLine]){assert.equal(s.split(part).length,2,'exact unique South Thirteen delta');s=s.replace(part,'')}return s}
