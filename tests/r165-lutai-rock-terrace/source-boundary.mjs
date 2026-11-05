import{stripSongxiuDelta}from'../r165-songxiu-hill-pavilion/source-boundary.mjs';
import assert from'node:assert/strict';
export const zoneLines=["import {buildLutaiRockTerrace} from '../palace/special/LutaiRockTerrace.js';\n","    yield {phase:'hook',index:139};\n","    buildLutaiRockTerrace(this.kit,this.zoneJson);\n"];
export function stripLutaiDelta(s){if(s.includes("buildSongxiuHillPavilion"))s=stripSongxiuDelta(s);for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Lutai delta');s=s.replace(line,'')}return s}
