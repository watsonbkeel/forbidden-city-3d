import assert from'node:assert/strict';
export const remainingLines=["import {fitQingshouConnectionApproach} from './QingshouConnectionApproach.js';\n",' fitQingshouConnectionApproach(p);\n'];
export const zoneLines=["import {buildQingshouRaisedWalk} from '../palace/special/QingshouRaisedWalk.js';\n",'    buildQingshouRaisedWalk(this.kit,this.zoneJson);\n'];
const strip=(s,lines)=>{for(const line of lines){assert.equal(s.split(line).length,2,'unique exact Qingshou delta');s=s.replace(line,'')}return s};
export const stripQingshouRemainingDelta=s=>strip(s,remainingLines),stripQingshouZoneDelta=s=>strip(s,zoneLines);
