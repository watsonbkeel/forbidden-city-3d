import assert from'node:assert/strict';
export const zoneLines=["import {buildForiFanhuaStair} from '../palace/special/ForiFanhuaStair.js';\n","    buildForiFanhuaStair(this.kit,this.zoneJson);\n"];
export function stripForiFanhuaDelta(s){for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique shared stair delta');s=s.replace(line,'')}return s}
