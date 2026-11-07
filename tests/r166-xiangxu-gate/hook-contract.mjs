import assert from 'node:assert/strict';
const importLine="import {buildXiangxuGlazedGate} from '../palace/special/XiangxuGlazedGate.js';\n";
const stepLine="    yield {phase:'hook',index:153};\n";
const callLine='    buildXiangxuGlazedGate(this.kit,this.zoneJson);\n';
const prior="    yield {phase:'hook',index:152};\n    buildDailouWaitingHouse(this.kit,this.zoneJson);\n";
const merge="    yield {phase:'merge',index:0};\n    this.group = this.kit.finish();\n";
/** Behavior-contract projection, not the strict source hash inverse. Preserve
 * mutations in original statements so the original190 controls still test
 * their original assertions after the independently pinned E46 extension. */
export function assertXiangxuHookExtension(current){
 for(const line of[importLine,stepLine,callLine])assert.equal(current.split(line).length,2,'one exact E46 operation');
 assert.ok(current.startsWith(importLine+"import {buildDailouWaitingHouse} from '../palace/special/DailouWaitingHouse.js';\n"),'absolute E46 import prefix');
 assert.equal(current.split(prior+stepLine+callLine+merge).length,2,'old152 then exactly153 then original merge');
 return current.slice(importLine.length).replace(stepLine+callLine,'');
}
