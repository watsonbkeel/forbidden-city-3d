import {encodeMetadata} from './codec.mjs';
import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';
import {ROOT,HEAD,ZONES,validateZoneOrder,validateReceipt} from './contract.mjs';
assert.equal(process.argv.length,2,'no command override');assert.equal(process.cwd(),ROOT);const evidence=process.env.EVIDENCE_DIR;assert.ok(path.isAbsolute(evidence??''));
// The entire sequential chain must be one child of gate.py's unmodified observer.
assert.ok(fs.existsSync(path.join(evidence,'export-attempt.json')),'outer guarded admission required');
validateZoneOrder(fs.readFileSync(path.join(ROOT,'data/zones/index.js'),'utf8'));
fs.mkdirSync(path.join(evidence,'zones'));let mapItems=[],counts=[];
for(const zone of ZONES){
 await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[fileURLToPath(new URL('./worker.mjs',import.meta.url)),zone],{cwd:ROOT,env:process.env,stdio:'inherit'});child.once('error',reject);child.once('exit',(code,signal)=>code===0&&!signal?resolve():reject(Error(`zone ${zone} failed ${code}/${signal}`)));});
 const row=JSON.parse(fs.readFileSync(path.join(evidence,'zones',zone+'.json'),'utf8'));mapItems.push(...validateReceipt(row,zone));counts.push({zone,count:row.count});
}
fs.writeFileSync(path.join(evidence,'map-items.json'),JSON.stringify({head:HEAD,complete:true,zoneOrder:ZONES,counts,mapItemsEncoded:encodeMetadata(mapItems),scope:'Production builder metadata only; not full World/ZoneManager lifecycle/GPU acceptance'},null,2),{flag:'wx'});
