import {stripQingshouRemainingDelta} from '../r164-qingshou-raised-walk/source-boundary.mjs';
import assert from'node:assert/strict';
export const importLine="import {fitXunyanSouthApproach} from './XunyanSouthApproach.js';\n",callLine=" fitXunyanSouthApproach(p);\n";
export function stripXunyanApproachDelta(s){s=stripQingshouRemainingDelta(s);for(const p of[importLine,callLine]){assert.equal(s.split(p).length,2);s=s.replace(p,'')}return s}
