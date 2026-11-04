import assert from'node:assert/strict';
export const zoneLines=["import {buildXiefangHillPavilion} from '../palace/special/XiefangHillPavilion.js';\n","    yield {phase:'hook',index:141};\n","    buildXiefangHillPavilion(this.kit,this.zoneJson);\n"];
export function stripXiefangDelta(s){for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Xiefang delta');s=s.replace(line,'')}return s}
