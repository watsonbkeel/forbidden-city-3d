import assert from'node:assert/strict';
export const zoneLines=["import {buildYizhaiMainShell} from '../palace/special/YizhaiMainShell.js';\n","    buildYizhaiMainShell(this.kit,this.zoneJson);\n"];
export function stripYizhaiDelta(s){for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Yizhai dispatch');s=s.replace(line,'')}return s}
