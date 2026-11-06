import test from 'node:test';
import assert from 'node:assert/strict';
import {assertSourceLimits,assertBrowserArguments,EXPECTED_TAIHE,repositoryRoot} from './ui-oracles.mjs';
test('source limitation oracle refuses an empty source and limit view',()=>{
 for(const lang of ['zh-CN','en'])assert.throws(()=>assertSourceLimits({selected:'taihe',headings:[],notes:[],links:[]},lang));
});
test('actual browser argument oracle rejects sandbox switches including equals values',()=>{
 for(const flag of ['--no-sandbox','--disable-setuid-sandbox','--disable-namespace-sandbox','--disable-gpu-sandbox','--disable-seccomp-filter-sandbox','--no-zygote','--single-process'])
  for(const value of [flag,flag+'=true'])assert.throws(()=>assertBrowserArguments([['/opt/google/chrome/chrome',value]]));
 assert.throws(()=>assertBrowserArguments([]));
 assert.throws(()=>assertBrowserArguments([['/usr/bin/chromium']]));
 assert.equal(assertBrowserArguments([['/opt/google/chrome/chrome','--headless']]),true);
});

test('source limitation oracle accepts exact reviewed content and rejects independent field mutations',()=>{
 for(const lang of ['zh-CN','en']){
  const good={...officialNameFields(lang),selected:'taihe',headings:[...EXPECTED_TAIHE[lang].headings],notes:[...EXPECTED_TAIHE[lang].notes],links:EXPECTED_TAIHE.links.map(link=>({...link,text:'Reviewed source'}))};
  assert.equal(assertSourceLimits(good,lang).passed,true);
  for(const mutate of [view=>{view.selected='other'},view=>{view.headings.pop()},view=>{view.notes.pop()},view=>{view.links.pop()},view=>{view.links[0].href+='?wrong'},view=>{view.links[0].rel='opener'},view=>{view.links[0].text=''}]){
   const bad=structuredClone(good);mutate(bad);assert.throws(()=>assertSourceLimits(bad,lang));
  }
 }
});

test('portable repository root is canonical without URL directory trailing slash',()=>{
 assert.equal(repositoryRoot('file:///tmp/project/scripts/ci/bilingual-ui/browser-qa.mjs'),'/tmp/project');
 assert.equal(repositoryRoot('file:///tmp/project%20space/scripts/ci/bilingual-ui/browser-qa.mjs'),'/tmp/project space');
});

test('source limitation oracle requires the separate full model evidence boundary in both locales',()=>{
 for(const lang of ['zh-CN','en']){
  const good={...officialNameFields(lang),selected:'taihe',headings:[...EXPECTED_TAIHE[lang].headings],notes:[...EXPECTED_TAIHE[lang].notes],links:EXPECTED_TAIHE.links.map(link=>({...link,text:'Reviewed source'}))};
  const missingModel=structuredClone(good);missingModel.notes=missingModel.notes.filter(note=>!note.includes(lang==='zh-CN'?'六根贴金柱':'six gilded columns'));
  assert.throws(()=>assertSourceLimits(missingModel,lang),'Access guidance must not replace model fidelity limitations');
  const missingHeading=structuredClone(good);missingHeading.headings=missingHeading.headings.filter(heading=>heading!==(lang==='zh-CN'?'本版模型说明':"About this version's model"));
  assert.throws(()=>assertSourceLimits(missingHeading,lang));
 }
});

// Fixed synthetic DOM receipt; independent of runtime translations and name registry.
function officialNameFields(lang){
 const en=lang==='en';
 return {title:en?'Hall of Supreme Harmony':'太和殿',directoryTitle:en?'Hall of Supreme Harmony':'太和殿',nameProvenance:{
  count:1,id:'place-name-provenance',status:'official-display',headings:[en?'English name sources':'英文名称出处'],
  notes:en?[
   'Verified official English name: Hall of Supreme Harmony',
   'Name evidence is separate from the descriptions. English descriptions remain project translations; naming does not expand model scope or visitor access.',
   'Project name also searchable: Taihe Hall'
  ]:[
   '已核官方英文展示名：Hall of Supreme Harmony',
   '名称证据与介绍正文分开；英文介绍仍为项目译文，名称不扩大模型范围或现场开放许可。',
   '原项目译名仍可检索：Taihe Hall'
  ],
  quotes:['Hall of Supreme Harmony (Taihe dian)','Hall of Supreme Harmony (Taihe dian)'],
  links:[['directory-74','https://intl.dpm.org.cn/explore/build_maps.html'],['taihe-title','https://intl.dpm.org.cn/hallsinfo/374.html']].map(([id,href])=>({id:'place-name-source-taihe-'+id,href,target:'_blank',rel:'noopener noreferrer',text:en?'The Palace Museum · English naming source · checked 2026-11-06':'故宫博物院 · 英文名称来源 · 核对于 2026-11-06'}))
 }};
}
function officialView(lang){return {...officialNameFields(lang),selected:'taihe',headings:[...EXPECTED_TAIHE[lang].headings],notes:[...EXPECTED_TAIHE[lang].notes],links:EXPECTED_TAIHE.links.map(link=>({...link,text:'Reviewed source'}))};}
test('official name oracle rejects old project names as card or directory display',()=>{
 for(const lang of ['zh-CN','en'])for(const field of ['title','directoryTitle'])for(const value of ['Taihe Hall','',lang==='en'?'太和殿':'Hall of Supreme Harmony']){
  const view=officialView(lang);view[field]=value;assert.throws(()=>assertSourceLimits(view,lang));
 }
});
test('official name oracle requires a unique separate correctly identified provenance section',()=>{
 for(const lang of ['zh-CN','en'])for(const mutate of [v=>delete v.nameProvenance,v=>v.nameProvenance.count=0,v=>v.nameProvenance.count=2,v=>v.nameProvenance.id='place-info',v=>v.nameProvenance.status='project-unverified']){
  const view=officialView(lang);mutate(view);assert.throws(()=>assertSourceLimits(view,lang));
 }
});
test('official name oracle requires fixed bilingual heading and all name scope notes',()=>{
 for(const lang of ['zh-CN','en'])for(const mutate of [v=>v.headings=[],v=>v.headings=['Sources'],...Array.from({length:3},(_,i)=>v=>v.notes.splice(i,1)),v=>v.notes[1]+=' changed',v=>v.notes=v.notes.join('\n'),v=>v.notes.push('')]){
  const view=officialView(lang);mutate(view.nameProvenance);assert.throws(()=>assertSourceLimits(view,lang));
 }
});
test('official name oracle requires both exact ordered quotes and source link fields',()=>{
 for(const lang of ['zh-CN','en'])for(const mutate of [v=>v.quotes.pop(),v=>v.quotes[0]='Taihe Hall',v=>v.links.pop(),v=>v.links.reverse(),...['id','href','target','rel','text'].flatMap(field=>[v=>v.links[0][field]='',v=>v.links[0][field]+=' wrong'])]){
  const view=officialView(lang);mutate(view.nameProvenance);assert.throws(()=>assertSourceLimits(view,lang));
 }
});
test('history and official name link lists reject omissions reordering and cross-contamination separately',()=>{
 for(const lang of ['zh-CN','en'])for(const mutate of [v=>v.links.reverse(),v=>v.links.push(v.nameProvenance.links[0]),v=>v.nameProvenance.links.push(v.links[0]),v=>[v.links,v.nameProvenance.links]=[v.nameProvenance.links,v.links]]){
  const view=officialView(lang);mutate(view);assert.throws(()=>assertSourceLimits(view,lang));
 }
});
test('official name oracle preserves the description translation boundary independently',()=>{
 const view=officialView('en');
 view.notes=view.notes.filter(note=>!note.startsWith('English descriptions:'));
 assert.throws(()=>assertSourceLimits(view,'en'));
});
