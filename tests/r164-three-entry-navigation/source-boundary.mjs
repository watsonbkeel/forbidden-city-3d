import{stripCuishangRemaining}from'../r164-cuishang-entry-support/source-boundary.mjs';
import assert from'node:assert/strict';
export const importLine="import {fitThreeHallSouthApproaches} from './ThreeHallSouthApproaches.js';\n",callLine=' fitThreeHallSouthApproaches(p);\n';
export function stripThreeApproachDelta(s){s=stripCuishangRemaining(s);assert.equal(s.split(importLine).length,2,'one exact import');assert.equal(s.split(callLine).length,3,'two exact factory calls');return s.replace(importLine,'').replaceAll(callLine,'')}
