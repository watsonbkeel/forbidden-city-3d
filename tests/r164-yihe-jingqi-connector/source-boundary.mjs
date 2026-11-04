import assert from'node:assert/strict';
export const importLine="import {buildYiheJingqiConnector} from '../palace/special/YiheJingqiConnector.js';\n",callLine="    buildYiheJingqiConnector(this.kit,this.zoneJson);\n";
export function stripYiheConnectorDelta(s){for(const p of[importLine,callLine]){assert.equal(s.split(p).length,2,'exact unique Yihe/Jingqi delta');s=s.replace(p,'')}return s}
