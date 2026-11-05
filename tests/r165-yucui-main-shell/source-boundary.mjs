import{stripSanyouDelta}from'../r165-sanyou-main-shell/source-boundary.mjs';
import assert from'node:assert/strict';
export const zoneLines=["import {buildYucuiMainShell} from '../palace/special/YucuiMainShell.js';\n","    buildYucuiMainShell(this.kit,this.zoneJson);\n"];
export function stripYucuiDelta(s){s=stripSanyouDelta(s);for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Yucui dispatch');s=s.replace(line,'')}return s}
