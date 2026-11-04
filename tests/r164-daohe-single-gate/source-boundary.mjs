import assert from'node:assert/strict';
export const zoneLines=["import {buildDaoheGate} from '../palace/special/DaoheGate.js';\n","    if(this.zoneJson.id==='ningshou'&&this.zoneJson.items.indexOf(item)===5){const b=buildDaoheGate(this.kit,item,{zoneId:this.zoneJson.id,itemIndex:5,zoneJson:this.zoneJson});this.gateGeometries.set(item.name,b.geometry);return b.width;}\n"];
export function stripDaoheDelta(s){for(const line of zoneLines){assert.equal(s.split(line).length,2,'exact unique Daohe delta');s=s.replace(line,'')}return s}
