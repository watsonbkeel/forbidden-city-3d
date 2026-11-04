import{stripSouthThirteenDelta}from'../r164-south-thirteen-houses/source-boundary.mjs';
import assert from'node:assert/strict';
export const importLine="import {buildLianxiGate,lianxiWallGaps} from '../palace/special/LianxiGate.js';\n";
export const gateLine="    if(this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===1){const b=buildLianxiGate(this.kit,item,{zoneId:this.zoneJson.id,itemIndex:1,zoneJson:this.zoneJson});this.gateGeometries.set(item.name,b.geometry);return b.width;}\n";
export const wallPart="this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===43 ? lianxiWallGaps(item,this.gateGeometries.get('敛禧门'),this.gateWidths) : ";
export function stripLianxiDelta(s){if(s.includes('buildSouthThirteenHouses'))s=stripSouthThirteenDelta(s);for(const part of[importLine,gateLine,wallPart]){assert.equal(s.split(part).length,2,'exact unique Lianxi delta');s=s.replace(part,'')}return s}
