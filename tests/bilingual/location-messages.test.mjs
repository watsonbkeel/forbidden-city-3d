import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {registerHooks} from 'node:module';
import {translateText} from '../../src/i18n/Messages.js';
const BASE='16e9e8224c1a4e3b0ed6b47793d5566ef05aeec2';
const oldIds=['axis-courts','east-six','west-six','ningshou','outer-east','outer-west','garden'];
const newId='yuqing-south-entry',newName='前星门与毓庆宫南入口';
const newEnglish='Qianxing Gate and the Southern Entrance to Yuqing Palace';
const prior=p=>JSON.parse(execFileSync('git',['show',BASE+':'+p],{maxBuffer:2**22}));
const expected=oldIds.map(id=>prior(`data/zones/${id}.json`));
for(const zone of expected)if(['axis-courts','east-six'].includes(zone.id))zone.neighbors.push(newId);
expected.push({id:newId,name:newName,bounds:{x0:-145,x1:-130.25,z0:184,z1:205},neighbors:['east-six','axis-courts'],items:[]});
const hook=registerHooks({load(url,context,next){return next(url,url.endsWith('.json')?{...context,importAttributes:{...context.importAttributes,type:'json'}}:context);}});
let zones;try{({ZONES:zones}=await import('../../data/zones/index.js'));}finally{hook.deregister();}
function assertCurrentZones(actual){assert.equal(actual.length,8);assert.deepEqual(actual,expected,'complete public seven in original order, two exact neighbor appends and the single independent eighth host');}
const collision=readFileSync(new URL('../../src/utils/Collision.js',import.meta.url),'utf8');
const fallbacks=[...collision.slice(collision.indexOf('  getCurrentLocation(position)')).matchAll(/'([^']+)'/gu)].map(m=>m[1]).filter(s=>/[\u3400-\u9fff]/u.test(s));
test('all eight actual zone names and collision fallback labels translate in the main location and flight compositions',()=>{
 assertCurrentZones(zones);
 assert.deepEqual(readdirSync(new URL('../../data/zones/',import.meta.url)).filter(f=>f.endsWith('.json')).sort(),zones.map(z=>z.id+'.json').sort(),'no unregistered zone JSON is silently excluded');
 assert.ok(fallbacks.length>=20);
 const labels=[];
 for(const zone of [...zones.map(z=>z.name),'宫城']){
  const flight=`虚拟飞行 · 25m · ${zone}`,englishFlight=translateText(flight,'en');
  assert.doesNotMatch(englishFlight,/unavailable|[\u3400-\u9fff]/u,zone);assert.equal(translateText(flight,'zh-CN'),flight);
  labels.push({zone,flight:englishFlight,locations:[]});
  for(const label of fallbacks){const source=`${zone} › ${label}`,english=translateText(source,'en');assert.doesNotMatch(english,/unavailable|[\u3400-\u9fff]/u,`${zone} > ${label}`);assert.equal(translateText(source,'zh-CN'),source);labels.at(-1).locations.push({source,english});}
 }
 assert.equal(translateText(`${newName} › 前星门`,'en'),`${newEnglish} › Qianxing Gate`);
 assert.equal(translateText(`虚拟飞行 · 25m · ${newName}`,'en'),`Virtual flight · 25m · ${newEnglish}`);
 if(process.env.E45_LOCATION_EVIDENCE)writeFileSync(process.env.E45_LOCATION_EVIDENCE,JSON.stringify({scope:'REAL_EIGHT_CONFIGURATIONS_AND_BUNDLED_TRANSLATOR_NO_ZONE_BUILD',zoneIds:zones.map(z=>z.id),fallbackCount:fallbacks.length,labels}),{flag:'wx'});
});
test('zone enumeration rejects a filtered eighth host, old configuration drift, wrong adjacency, missing and reordered configurations',()=>{
 const changes=[x=>x.pop(),x=>x[0].bounds.z0+=1,x=>x[1].items.push({id:'unknown'}),x=>x[0].neighbors.pop(),x=>x[7].bounds.z0+=1,x=>x[7].name='前星门',x=>x.reverse(),x=>x.push(structuredClone(x[7])),x=>x.splice(2,1),x=>x[3].id='unknown'];
 for(const change of changes){const bad=structuredClone(zones);change(bad);assert.throws(()=>assertCurrentZones(bad));}
});
test('the only dictionary change is the precise new zone message and every public message remains intact',()=>{
 const old=prior('data/i18n/ui-en.json'),current=JSON.parse(readFileSync(new URL('../../data/i18n/ui-en.json',import.meta.url)));
 assert.equal(Object.hasOwn(old.messages,newName),false);
 assert.equal(current.messages[newName],newEnglish);
 delete current.messages[newName];assert.deepEqual(current,old);
});
