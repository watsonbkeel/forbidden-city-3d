import {stripForiFanhuaDelta} from '../r164-fori-fanhua-stair/source-boundary.mjs';
import assert from'node:assert/strict';
export const zoneLines=["import {buildLushunGate} from '../palace/special/LushunGate.js';\n", "    if(this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===4){const b=buildLushunGate(this.kit,item,{zoneId:this.zoneJson.id,itemIndex:4,zoneJson:this.zoneJson});this.gateGeometries.set(item.name,b.geometry);return b.width;}\n"];
export function stripLushunDelta(s){s=stripForiFanhuaDelta(s);for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Lushun delta');s=s.replace(line,'')}return s}
