import assert from'node:assert/strict';
export const zoneLines=["import {buildZhuxiangMainShell} from '../palace/special/ZhuxiangMainShell.js';\n","    yield {phase:'hook',index:136};\n","    buildZhuxiangMainShell(this.kit,this.zoneJson);\n"];
export function stripZhuxiangDelta(s){for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Zhuxiang delta');s=s.replace(line,'')}return s}
