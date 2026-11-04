import assert from'node:assert/strict';
export const zoneLines=["import {buildYunguangMainShell} from '../palace/special/YunguangMainShell.js';\n","    yield {phase:'hook',index:138};\n","    buildYunguangMainShell(this.kit,this.zoneJson);\n"];
export function stripYunguangDelta(s){for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Yunguang delta');s=s.replace(line,'')}return s}
