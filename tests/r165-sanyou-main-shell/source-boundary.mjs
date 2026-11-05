import{stripYizhaiDelta}from'../r165-yizhai-main-shell/source-boundary.mjs';
import assert from'node:assert/strict';
export const zoneLines=["import {buildSanyouMainShell} from '../palace/special/SanyouMainShell.js';\n","    buildSanyouMainShell(this.kit,this.zoneJson);\n"];
export function stripSanyouDelta(s){s=stripYizhaiDelta(s);for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Sanyou dispatch');s=s.replace(line,'')}return s}
