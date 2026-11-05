import{stripXiefangDelta}from'../r165-xiefang-hill-pavilion/source-boundary.mjs';
import assert from'node:assert/strict';
export const zoneLines=["import {buildSongxiuHillPavilion} from '../palace/special/SongxiuHillPavilion.js';\n","    yield {phase:'hook',index:140};\n","    buildSongxiuHillPavilion(this.kit,this.zoneJson);\n"];
export function stripSongxiuDelta(s){if(s.includes("buildXiefangHillPavilion"))s=stripXiefangDelta(s);for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Songxiu delta');s=s.replace(line,'')}return s}
