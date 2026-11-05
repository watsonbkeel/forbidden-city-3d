import{stripBuildStepDelta}from'../r165-synchronous-build-steps/source-boundary.mjs';
import assert from'node:assert/strict';
export const zoneLines=["import {buildYizhaiMainShell} from '../palace/special/YizhaiMainShell.js';\n","    buildYizhaiMainShell(this.kit,this.zoneJson);\n"];
export function stripYizhaiDelta(s){s=stripBuildStepDelta(s);for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Yizhai dispatch');s=s.replace(line,'')}return s}
