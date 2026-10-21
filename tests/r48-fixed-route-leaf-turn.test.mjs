import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/r48-fixed33-before-leaf-turn.json',import.meta.url)));
test('fixed 33 routes retain 31 exact definitions and only move the Wuying/Wenhua leaf-clear turns',()=>{
 const current=JSON.parse(execFileSync(process.execPath,[new URL('./stepwalk.cjs',import.meta.url).pathname,'60,10','0,1','all'],{encoding:'utf8',env:{...process.env,DUMP:'',DUMP_JSON:'1'}}));
 assert.equal(current.length,33);
 assert.deepEqual(current.map(r=>r.name),baseline.routes.map(r=>r.name));
 let changes=0;
 for(let i=0;i<current.length;i++){
  const expected=structuredClone(baseline.routes[i]);
  if(expected.name==='熙和门→武英门→武英殿内'){
   for(const p of expected.pts)if((p[0]===219.5||p[0]===224.5)&&Math.abs(p[1]+205.5)<1e-8){p[1]=-199.2-5.95;changes++;}
  }
  if(expected.name==='协和门→文华门→文华殿内'){
   for(const p of expected.pts)if((p[0]===-186.4||p[0]===-175.4)&&Math.abs(p[1]+205.3)<1e-8){p[1]=-205;changes++;}
  }
  assert.deepEqual(current[i],expected,current[i].name);
 }
 assert.equal(changes,4);
});
