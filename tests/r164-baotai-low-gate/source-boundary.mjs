import{stripQingshouNorthDelta}from'../r164-qingshou-north-halls/source-boundary.mjs';
import assert from'node:assert/strict';
export const zoneLines=["import {buildBaotaiGate} from '../palace/special/BaotaiGate.js';\n","    if(this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===6){const b=buildBaotaiGate(this.kit,item,{zoneId:this.zoneJson.id,itemIndex:6,zoneJson:this.zoneJson});this.gateGeometries.set(item.name,b.geometry);return b.width;}\n"];
export function stripBaotaiDelta(s){s=stripQingshouNorthDelta(s);for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Baotai source delta');s=s.replace(line,'')}return s}
