import{stripDaoheDelta}from'../r164-daohe-single-gate/source-boundary.mjs';
import assert from'node:assert/strict';
export const zoneLines=["import {buildZhenshunGate} from '../palace/special/ZhenshunGate.js';\n","    if(this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===9){const b=buildZhenshunGate(this.kit,item,{zoneId:this.zoneJson.id,itemIndex:9,zoneJson:this.zoneJson});this.gateGeometries.set(item.name,b.geometry);return b.width;}\n"];
export function stripZhenshunDelta(s){s=stripDaoheDelta(s);for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Zhenshun delta');s=s.replace(line,'')}return s}
