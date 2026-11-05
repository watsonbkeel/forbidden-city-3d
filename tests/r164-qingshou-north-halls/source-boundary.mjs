import{stripYucuiDelta}from'../r165-yucui-main-shell/source-boundary.mjs';
import assert from'node:assert/strict';
export const zoneLines=["import {buildQingshouNorthHalls} from '../palace/special/QingshouNorthHalls.js';\n","    buildQingshouNorthHalls(this.kit,this.zoneJson);\n"];
export function stripQingshouNorthDelta(s){s=stripYucuiDelta(s);for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique north hall dispatch');s=s.replace(line,'')}return s}
