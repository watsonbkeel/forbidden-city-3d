import fs from 'node:fs';import assert from 'node:assert/strict';
import {inventory} from './r72-source-inventory.mjs';
export const ALLOWED_PATHS=Object.freeze(['data/architecture/yangxin-court-entrance.json','data/zones/west-six.json','src/scene/palace/special/YangxinCourtEntrance.js','src/scene/zones/ZoneBase.js','release.json']);
export function validateSuccessor(base,delta,actual){
 const map=new Map(base.map(f=>[f.path,f])),seen=new Set();assert.equal(map.size,base.length);
 for(const d of delta){assert.ok(!seen.has(d.path),'duplicate delta');seen.add(d.path);assert.deepEqual(map.get(d.path)??null,d.before);assert.equal(d.after.path,d.path);map.set(d.path,d.after);}
 const sort=a=>[...a].sort((a,b)=>a.path.localeCompare(b.path));assert.deepEqual(sort(actual),sort([...map.values()]));return true;
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const base=JSON.parse(fs.readFileSync('reports/r72-nightlife-safety/source-inventory.json')).files,actual=inventory(process.cwd()),file='reports/r73-yangxin-courtyard/source-delta.json';
 if(process.argv.includes('--record')){const old=new Map(base.map(f=>[f.path,f]));const delta=actual.filter(f=>JSON.stringify(f)!==JSON.stringify(old.get(f.path))).map(f=>({path:f.path,before:old.get(f.path)??null,after:f}));assert.deepEqual(delta.map(d=>d.path).sort(),[...ALLOWED_PATHS].sort());validateSuccessor(base,delta,actual);fs.writeFileSync(file,JSON.stringify({baseline:'5246e5da6f25e812aac67d8154a74858d60d40ec',delta},null,2)+'\n');}
 const {delta}=JSON.parse(fs.readFileSync(file));assert.deepEqual(delta.map(d=>d.path).sort(),[...ALLOWED_PATHS].sort());validateSuccessor(base,delta,actual);console.log('R73 exact successor inventory verified; R72 frozen inventory unchanged');
}
