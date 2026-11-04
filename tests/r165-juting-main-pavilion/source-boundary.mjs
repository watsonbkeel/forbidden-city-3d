import assert from'node:assert/strict';
export const zoneLines=["import {buildJutingMainPavilion} from '../palace/special/JutingMainPavilion.js';\n","    yield {phase:'hook',index:137};\n","    buildJutingMainPavilion(this.kit,this.zoneJson);\n"];
export function stripJutingDelta(s){for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Juting delta');s=s.replace(line,'')}return s}
