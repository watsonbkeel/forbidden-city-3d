import assert from'node:assert/strict';
export const base='14d81f71b3acd0eedfe1f2e12bd01190765f77ea';
export const zoneLines=["import {buildXuhuiGallery} from '../palace/special/XuhuiGallery.js';\n","    yield {phase:'hook',index:142};\n","    buildXuhuiGallery(this.kit,this.zoneJson);\n"];
export function stripXuhuiDelta(s){for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Xuhui delta');s=s.replace(line,'')}return s}
