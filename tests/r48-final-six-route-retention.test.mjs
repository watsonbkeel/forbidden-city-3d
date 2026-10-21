import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';
import {buildWorld} from './lib/world.mjs';import {buildAutoRoutes} from './lib/auto-routes.mjs';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/r48-before-final-six-routes.json',import.meta.url)));
const W=await buildWorld({realMaterials:true}),current=buildAutoRoutes(W,W.zones.map(z=>z.json)).filter(r=>r.gateProfile!=='zhaode');
function expected(old){const r=structuredClone(old);let changes=0;
 if(['文华殿','主敬殿'].includes(r.hall))for(const p of r.pts){
  if((p[0]===-186.4||p[0]===-175.4)&&Math.abs(p[1]+205.3)<1e-8){p[1]=-205;changes++;}
  else if(r.hall==='主敬殿'&&p[0]===-186.4&&p[1]===-172){p[1]=-172.6;changes++;}
  else if(r.hall==='主敬殿'&&p[0]===-184.1&&p[1]===-172){p[1]=-171.8;changes++;}
 }return {r,changes};
}
test('R48 final six preserve 61 of 63 preceding route objects; only explicit Wenhua and Zhujing points change',()=>{
 assert.equal(current.length,63);assert.deepEqual(current.map(r=>r.name),baseline.auto63.map(r=>r.name));let affected=0,points=0;
 for(const old of baseline.auto63){const {r,changes}=expected(old);assert.deepEqual(current.find(x=>x.name===old.name),r,old.name);if(changes)affected++;points+=changes;}
 assert.equal(affected,2);assert.equal(points,12);
 const unrelated=structuredClone(current.find(r=>r.hall==='文华殿'));unrelated.pts[0][0]+=.01;
 assert.notDeepEqual(unrelated,expected(baseline.auto63.find(r=>r.name===unrelated.name)).r,'an unrelated mutation must not match the scoped inverse');
});
test('R48 final six preserve 32 of 33 preceding fixed definitions and only the two Wenhua front-turn points change',()=>{
 const actual=JSON.parse(execFileSync(process.execPath,[new URL('./stepwalk.cjs',import.meta.url).pathname,'60,10','0,1','all'],{encoding:'utf8',env:{...process.env,DUMP_JSON:'1',DUMP:''}}));let points=0;
 assert.equal(actual.length,33);
 for(let i=0;i<actual.length;i++){const old=structuredClone(baseline.fixed33[i]);if(old.name==='协和门→文华门→文华殿内')for(const p of old.pts)if((p[0]===-186.4||p[0]===-175.4)&&Math.abs(p[1]+205.3)<1e-8){p[1]=-205;points++;}assert.deepEqual(actual[i],old,old.name);}
 assert.equal(points,2);
});
