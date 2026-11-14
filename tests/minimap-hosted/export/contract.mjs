import {encodeMetadata,decodeMetadata} from './codec.mjs';
import assert from 'node:assert/strict';
export const ROOT='/tmp/minimap-r379-exact';
export const HEAD='7feaaca1b6bb34d456f87b90f7bf4a872add703f';
export const ZONES=['axis-courts','east-six','west-six','ningshou','outer-east','outer-west','garden','yuqing-south-entry'];
export function validateZoneOrder(source){
 const imports=[...source.matchAll(/import\s+(\w+)\s+from\s+['"]\.\/([^'"]+)\.json['"]/g)];
 const names=new Map(imports.map(m=>[m[1],m[2]]));
 const list=/export\s+const\s+ZONES\s*=\s*\[([^\]]+)\]/.exec(source);
 assert.ok(list,'missing static ZONES');
 const order=list[1].split(',').map(x=>names.get(x.trim()));
 assert.deepEqual(order,ZONES,'production zone order changed');return order;
}
export function validatePlain(value){encodeMetadata(value);}
export function validateReceipt(row,zone){
 assert.equal(row.head,HEAD);assert.equal(row.zone,zone);assert.equal(row.complete,true);assert.equal(row.cleanupComplete,true);
 const items=decodeMetadata(row.mapItemsEncoded);assert.ok(Array.isArray(items));assert.ok(items.length>0||zone==='yuqing-south-entry','unexpected empty production zone');assert.equal(row.count,items.length);
 validatePlain(items);for(const item of items){assert.equal(typeof item.kind,'string');for(const key of ['x','z','w','d'])assert.ok(Number.isFinite(item[key]),'invalid map '+key);}
 return items;
}
