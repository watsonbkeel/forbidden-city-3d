/** R7 registration repair for the frozen pre-R6 Huangji furnishing asset.
 * The R6 rear-door flag moves CourtKit's B throne 0.8m toward the front.
 * Move the complete S furnishing group by that same computed delta, keeping
 * its floor, original compressed mesh bytes, materials and every proxy intact.
 * This corrects layer alignment; it is not a surveyed furniture relocation.
 * Usage: node assets-src/interiors/align_huangji_backdoor.mjs
 * The original huangji.py/huangji.glb remain the reproducible source input.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
export const BASE_SHA='53213f0c2247820ca15cd44c1b99e8104e309a93cf9ac962b9a24aaa59f1cf80';
const ROOTS=['COL_0','COL_1','COL_2','COL_3','COL_dais','dais_low','floor_base','floor_tiles','merged_caisson_blue','merged_gold_lacquer','merged_mirror_pearl','merged_red_lacquer','merged_stone','throne_cushion','WALK_dais_low'];
export function alignHuangji(bytes,hall){
 assert.equal(sha(bytes),BASE_SHA,'only the exact pre-R6 asset can be registered; no repeated shift');
 assert.equal(hall.name,'皇极殿');assert.equal(hall.backDoor,true);assert.equal(hall.d,26.3);assert.equal(hall.w,49.8);assert.equal(hall.rot??0,0);
 const oldTZ=hall.d/2-Math.min(2.6,hall.d*.3),tz=hall.d/2-Math.min(3.4,hall.d*.36),delta=tz-oldTZ;
 assert.ok(Math.abs(delta+.8)<1e-12);
 const n=bytes.readUInt32LE(12),j=JSON.parse(bytes.subarray(20,20+n));
 assert.deepEqual(j.nodes.map(n=>n.name),ROOTS);assert.deepEqual(j.scenes[j.scene??0].nodes,ROOTS.map((_,i)=>i));
 for(const node of j.nodes){
  assert.equal(node.children,undefined);assert.equal(node.matrix,undefined);assert.equal(node.rotation,undefined);assert.equal(node.scale,undefined);
  if(node.name==='floor_base'||node.name==='floor_tiles')continue;
  const t=node.translation??[0,0,0];node.translation=[t[0],t[1],t[2]+delta];
 }
 const json=Buffer.from(JSON.stringify(j)),pad=Buffer.alloc((4-json.length%4)%4,0x20),body=Buffer.concat([json,pad]),tail=bytes.subarray(20+n);
 const head=Buffer.from(bytes.subarray(0,20));head.writeUInt32LE(20+body.length+tail.length,8);head.writeUInt32LE(body.length,12);
 const output=Buffer.concat([head,body,tail]);return{bytes:output,sha256:sha(output),delta,tz,sourceSHA256:BASE_SHA};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=new URL('../../',import.meta.url),hall=JSON.parse(fs.readFileSync(new URL('data/zones/ningshou.json',root))).items.find(x=>x.name==='皇极殿');
 const result=alignHuangji(fs.readFileSync(new URL('public/models/interiors/huangji.glb',root)),hall);
 const name=`huangji-aligned-${result.sha256.slice(0,12)}.glb`,out=new URL('public/models/interiors/'+name,root);fs.writeFileSync(out,result.bytes);
 console.log(JSON.stringify({model:'/models/interiors/'+name,bytes:result.bytes.length,sha256:result.sha256,sourceSHA256:result.sourceSHA256,delta:result.delta,throneTZ:result.tz}));
}
