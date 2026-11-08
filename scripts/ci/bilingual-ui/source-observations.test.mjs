import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {createDOM} from '../../../tests/lib/ui-dom.mjs';
import {PlaceCatalog} from '../../../src/ui/PlaceCatalog.js';
import {PlaceInfoPanel} from '../../../src/ui/PlaceInfoPanel.js';
import {localeStore} from '../../../src/i18n/LocaleStore.js';
import * as oracle from './ui-oracles.mjs';
import {writeResultJSON} from './common.mjs';

const descendants=root=>root.children.flatMap(child=>[child,...descendants(child)]);
const notes=root=>descendants(root).filter(n=>(n.className??'').split(' ').includes('place-note')).map(n=>n.textContent);
const links=nodes=>nodes.map(n=>({id:n.id,href:n.getAttribute('href'),target:n.getAttribute('target'),rel:n.getAttribute('rel'),text:n.textContent}));
function renderView(lang){
 const oldDocument=globalThis.document,oldLocale=localeStore.locale,{document}=createDOM();globalThis.document=document;let panel;
 try{
  localeStore.setLocale(lang);const catalog=new PlaceCatalog(),place=catalog.places.find(p=>p.id==='taihe');assert.ok(place);panel=new PlaceInfoPanel();document.body.appendChild(panel.element);panel.render({place,name:place.name,sources:catalog.sourcesFor(place),canTravel:true,onTravel:()=>{}});
  const root=panel.element,section=root.querySelector('#place-name-provenance'),title=root.querySelector('#place-title').textContent;
  return {selected:place.id,title,directoryTitle:title,headings:root.querySelectorAll('h3').map(n=>n.textContent),notes:notes(root),links:links(root.querySelectorAll('a').filter(n=>!section.contains(n))),nameProvenance:{count:root.querySelectorAll('#place-name-provenance').length,id:section.id,status:section.getAttribute('data-name-status'),headings:section.querySelectorAll('h3').map(n=>n.textContent),notes:notes(section),quotes:section.children.filter(n=>n.tagName==='DIV').map(n=>n.children.find(p=>p.tagName==='P').textContent),links:links(section.querySelectorAll('a'))}};
 }finally{panel?.dispose();localeStore.setLocale(oldLocale);globalThis.document=oldDocument;}
}
for(const lang of ['zh-CN','en'])test(`real PlaceInfoPanel composed ${lang} model note satisfies the independent full oracle`,()=>{
 const view=renderView(lang);assert.equal(oracle.assertSourceLimits(view,lang).passed,true);
});

const slots=[[1280,900,'zh-CN'],[1280,900,'en'],[390,844,'zh-CN'],[390,844,'en']];
const row=(i,view=renderView(slots[i][2]))=>({ordinal:i+1,width:slots[i][0],height:slots[i][1],locale:slots[i][2],selected:view.selected,view});
const rows=()=>slots.map((_,i)=>row(i));
const layouts=rs=>[0,1].map(i=>({width:slots[i*2][0],height:slots[i*2][1],sourceLimits:rs.slice(i*2,i*2+2).map(r=>oracle.assertSourceLimits(r.view,r.locale))}));
const prefixAPI=()=>{assert.equal(typeof oracle.assertSourceLimitObservations,'function');return oracle.assertSourceLimitObservations;};

test('full composed model identity retains every reviewed specific and public limitation',()=>{
 assert.ok(oracle.REQUIRED_TAIHE_SPECIFIC);
 for(const lang of ['zh-CN','en']){
  const view=renderView(lang),specific=oracle.REQUIRED_TAIHE_SPECIFIC[lang],at=view.notes.findIndex(s=>s.endsWith(specific));assert.ok(at>=0);const full=view.notes[at];assert.notEqual(full,specific);
  for(const wrong of [specific,full.slice(0,-specific.length),full.slice(0,-1),full.replace(specific,specific.slice(0,-20)),full.replace(specific,'Generic access notice.'),renderView(lang==='en'?'zh-CN':'en').notes.find(s=>s.endsWith(oracle.REQUIRED_TAIHE_SPECIFIC[lang==='en'?'zh-CN':'en'])),full.replace(lang==='en'?'Actual hanging heights':'匾联真实挂高','')]){const bad=structuredClone(view);bad.notes[at]=wrong;assert.throws(()=>oracle.assertSourceLimits(bad,lang));}
 }
});
test('source observations accept only ordered bounded prefixes and complete strict layout replay',()=>{
 const check=prefixAPI(),rs=rows();for(let n=0;n<=4;n++)check(rs.slice(0,n),false);check(rs,true,layouts(rs));
 for(let n=0;n<4;n++)assert.throws(()=>check(rs.slice(0,n),true,layouts(rs)));
 for(const mutate of [x=>x.push(x[0]),x=>x.reverse(),x=>x[1]=x[0],x=>x[0].ordinal=2,x=>x[0].width=390,x=>x[0].height=844,x=>x[0].locale='en',x=>x[0].selected='other',x=>delete x[0].view.notes,x=>x[0].extra=true,x=>x[0].view.extra=true,x=>x[0].view.notes[0]=null,x=>x[0].view.notes=Array(33).fill(''),x=>x[0].view.nameProvenance.count=NaN,x=>x[0].view.nameProvenance.count=33,x=>x[0].view.title='\ud800',x=>x[0].view.title='x'.repeat(16385),x=>x[0].view.links[0].href=Infinity,x=>x[0].view.nameProvenance=new Date()]){const bad=structuredClone(rs);mutate(bad);assert.throws(()=>check(bad,false));}
 const bad=structuredClone(rs);bad[0].view.selected=null;bad[0].selected=null;check(bad.slice(0,1),false);assert.throws(()=>check(bad,true,layouts(rs)));
 const ls=layouts(rs);ls[0].sourceLimits[0].notes[0]+=' ';assert.throws(()=>check(rs,true,ls));
});
function paddedRow(i,target){const r=row(i);r.view.notes=['x'.repeat(16000),'x'.repeat(16000),'x'.repeat(16000),''];const size=()=>Buffer.byteLength(JSON.stringify(r,null,2)+'\n');r.view.notes[3]='x'.repeat(target-size());assert.equal(size(),target);return r;}
test('each complete observation and the actual nested field enforce separate UTF8 byte limits',()=>{
 const check=prefixAPI(),one=paddedRow(0,65536);check([one],false);one.view.notes[3]+='x';assert.throws(()=>check([one],false));
 const four=slots.map((_,i)=>paddedRow(i,65536));assert.ok(Buffer.byteLength(JSON.stringify({sourceLimitObservations:four},null,2)+'\n')>262144);assert.throws(()=>check(four,false));
 const inside=slots.map((_,i)=>paddedRow(i,64000));check(inside,false);
});

const qaURL=new URL('./browser-qa.mjs',import.meta.url),qaSource=()=>fs.readFileSync(qaURL,'utf8');
async function callerHarness(t,io=fs){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'source-limit-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));const resultPath=path.join(root,'RESULT.json'),result={pass:false,errors:[],layouts:[],sourceLimitObservations:[],identity:{eventSha:'a'.repeat(40)},toolchainSHA256:'bound'};fs.writeFileSync(resultPath,JSON.stringify(result),{flag:'wx'});
 const src=qaSource(),start=src.indexOf('function recordSourceLimitObservation('),end=src.indexOf('// BEGIN E46 supplemental UI evidence');assert.ok(start>=0&&end>start,'Actual observer/capture caller missing');
 const fragment=src.slice(start,end);const capture=new Function('result','resultPath','assertSourceLimitObservations','writeResultJSON','assertSourceLimits',fragment+';return captureSourceLimits;')(result,resultPath,prefixAPI(),(p,v)=>writeResultJSON(p,v,io),oracle.assertSourceLimits);
 return {result,resultPath,capture,root};
}
test('actual source capture caller durably records before semantic assertion failure',async t=>{
 const h=await callerHarness(t),v=renderView('zh-CN');v.notes=[];let evaluations=0;
 await assert.rejects(h.capture({evaluate:async()=>{evaluations++;return v;}},'zh-CN',1280,900),/Missing model\/access\/provenance/);
 assert.equal(evaluations,1);assert.equal(h.result.pass,false);assert.equal(h.result.sourceLimitObservations.length,1);const saved=JSON.parse(fs.readFileSync(h.resultPath));assert.deepEqual(saved.sourceLimitObservations[0].view,v);assert.equal(saved.pass,false);
});
test('actual source caller write and rename failure preserve memory and committed prefix through cleanup',async t=>{
 for(const kind of ['partial','rename']){
  let fail=false;const io=Object.create(fs);if(kind==='partial')io.writeFileSync=(fd,data)=>{if(fail){fs.writeSync(fd,data.subarray(0,17));throw Error('synthetic source partial write');}return fs.writeFileSync(fd,data);};else io.renameSync=(a,b)=>{if(fail)throw Error('synthetic source rename failure');return fs.renameSync(a,b);};
  const h=await callerHarness(t,io);await h.capture({evaluate:async()=>renderView('zh-CN')},'zh-CN',1280,900);const before=fs.readFileSync(h.resultPath);fail=true;await assert.rejects(h.capture({evaluate:async()=>renderView('en')},'en',1280,900),/synthetic source/);assert.equal(h.result.sourceLimitObservations.length,1);assert.deepEqual(fs.readFileSync(h.resultPath),before);assert.equal(fs.existsSync(h.resultPath+'.pending'),false);
  fail=false;const src=qaSource(),at=src.indexOf('}catch(error){result.pass=false;result.failure='),tail=src.slice(at+1);assert.ok(at>=0);let closed=0;const fakeProcess={exitCode:0};const finalizer=new Function('result','resultPath','writeResultJSON','process','browser','vite','recheckToolchain','base','workRoot','inputsPath','console','e','check','sha256','fs','path','output',`return (async()=>{try{throw e;} ${tail}})();`);
  await finalizer(h.result,h.resultPath,writeResultJSON,fakeProcess,{close:async()=>{closed++;}},{close:async()=>{closed++;}},async()=>({identity:h.result.identity}),'/repo','/work','/inputs',{log(){}},new Error('synthetic capture failure'),assert.ok,()=> 'bound',{readFileSync:()=>Buffer.from('bound')},path,h.root);
  const saved=JSON.parse(fs.readFileSync(h.resultPath));assert.equal(fakeProcess.exitCode,1);assert.equal(closed,2);assert.equal(saved.pass,false);assert.match(saved.failure,/synthetic capture failure/);assert.deepEqual(saved.sourceLimitObservations,JSON.parse(before).sourceLimitObservations);
 }
});
test('actual source caller rejects oversize or invalid shape without advancing prefix',async t=>{
 const h=await callerHarness(t),v=renderView('zh-CN');v.title='x'.repeat(16385);const before=fs.readFileSync(h.resultPath);await assert.rejects(h.capture({evaluate:async()=>v},'zh-CN',1280,900));assert.deepEqual(fs.readFileSync(h.resultPath),before);assert.deepEqual(h.result.sourceLimitObservations,[]);
});

test('reviewed full and specific model literals retain their independent byte identities',()=>{
 const expected={"zh-CN": {"specific": "0abdc5f39f1b9d2aa01bb038658fd436ce9d1b20d5b9da950dae809aa0750306", "fullNote": "ea81f6165900a8bb144a0574a2963d1268a92a131536fad19533625175d24a01"}, "en": {"specific": "06872144913deda92a8f9c0a703e88b28339eeedf5a2431f21153039508ba8f5", "fullNote": "65fd9cd25497ffadaf088e1ebaff8194293b816d71a7e6645b356de911dcfb8c"}};
 for(const lang of ['zh-CN','en']){const specific=oracle.REQUIRED_TAIHE_SPECIFIC[lang],full=oracle.EXPECTED_TAIHE[lang].notes.find(s=>s.endsWith(specific));assert.ok(full);assert.equal(createHash('sha256').update(specific).digest('hex'),expected[lang].specific);assert.equal(createHash('sha256').update(full).digest('hex'),expected[lang].fullNote);}
});

test('actual source caller commits all four slots without marking the observation as acceptance',async t=>{const h=await callerHarness(t);for(const [width,height,lang]of slots){const returned=await h.capture({evaluate:async()=>renderView(lang)},lang,width,height);assert.equal(returned.passed,true);}const saved=JSON.parse(fs.readFileSync(h.resultPath));assert.equal(saved.pass,false);assert.equal(saved.sourceLimitObservations.length,4);prefixAPI()(saved.sourceLimitObservations,true,layouts(saved.sourceLimitObservations));});
