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

// E46 fixtures use only committed independent literals, never product translators.
function e46Content(E,lang,width=390,height=844){
 const copy=E[lang],blocks=copy.blocks;
 const observation=(key,text,interactive=false,scope='panel')=>({key,text,scope,interactive,connected:true,effectiveVisible:true,inert:false,rect:{x:24,y:120,width:300,height:44},panelRect:{x:16,y:100,width:350,height:600},viewport:{width,height},clipRect:{x:16,y:100,width:350,height:600},documentOverflow:0,panelOverflow:0,scrollTop:100,scrollMax:1600,hit:interactive?true:null});
 return {lang,documentLang:lang,panelLang:lang,role:'region',selected:E.id,selection:{name:'祥旭门',placeId:E.id},directoryTitle:copy.title,title:copy.title,tag:copy.tag,summary:copy.summary,notes:[...copy.notes],panelText:blocks.map(b=>b.text).join(''),visibleAttributes:[],missing:[],travelCount:0,catalog:{id:E.id,sourceObjectId:'FC-4D8561AE5D',navigationMode:'information-only',teleportTargetName:null,mapBinding:null,sources:E.sources.map(s=>({...s}))},links:E.links.map((link,i)=>({...link,text:copy.labels[i],notice:copy.sourceNotice})),nameProvenance:{count:1,id:'place-name-provenance',status:'project-unverified',headings:[copy.nameHeading],notes:[...copy.nameNotes],links:[]},observations:[...blocks.map((b,i)=>observation('block:'+i,b.text,b.tag==='a')),...['#place-back','#map-language'].map(key=>observation(key,'control',true,'viewport'))],screenshot:{file:`${width}-e46-${lang==='en'?'english':'chinese'}-card.png`,panelScroll:0,selected:E.id,lang,width,height}};
}
test('E46 exposes a separate required oracle without changing the Taihe oracle',async()=>{
 const api=await import('./ui-oracles.mjs');for(const key of ['assertE46','assertE46Content','assertE46Observation'])assert.equal(typeof api[key],'function',key);
 assert.equal(api.EXPECTED_E46.id,'supp-fc-4d8561ae5d');assert.equal(api.EXPECTED_E46.selector,'#supplemental-place-directory button[data-place-id="supp-fc-4d8561ae5d"]');
});
test('E46 exact bilingual content rejects independently altered identity copy sources and naming claims',async()=>{
 const {EXPECTED_E46:E,assertE46Content}=await import('./ui-oracles.mjs');assert.equal(typeof assertE46Content,'function');
 for(const lang of ['zh-CN','en']){
  const good=e46Content(E,lang);assertE46Content(good,lang,390,844);
  for(const mutate of [x=>x.selected='taihe',x=>x.selection.placeId='other',x=>x.title='Other',x=>x.directoryTitle='Other',x=>x.tag='Other',x=>x.summary+=' changed',x=>x.notes.pop(),x=>x.notes[0]='',x=>x.panelText+=' Translation unavailable',x=>x.travelCount=1,x=>x.role='dialog',x=>x.panelLang='fr',x=>x.catalog.sourceObjectId='FC-other',x=>x.catalog.navigationMode='existing-teleport',x=>x.catalog.teleportTargetName='祥旭门',x=>x.catalog.mapBinding={},x=>x.catalog.sources[0].reviewedAt='2026-11-06',x=>x.catalog.sources[1].reviewType='new-review',x=>x.links.pop(),x=>x.links.push(x.links[0]),x=>x.links[0].href+='?prefix-only',x=>x.links[0].text='Wrong but nonempty label',x=>[x.links[0].text,x.links[1].text]=[x.links[1].text,x.links[0].text],x=>x.links[1].notice='',x=>x.links[0].rel='opener',x=>x.nameProvenance.count=2,x=>x.nameProvenance.status='official-display',x=>x.nameProvenance.notes[0]='Verified official English name: Xiangxu Gate',x=>x.nameProvenance.links.push(x.links[0]),x=>x.nameProvenance.notes.pop(),x=>x.nameProvenance.headings=['Sources'],x=>x.missing.push('e46'),x=>x.visibleAttributes.push({name:'title',value:'未翻译'})]){
   const bad=structuredClone(good);mutate(bad);if(lang==='en'||!bad.visibleAttributes.length)assert.throws(()=>assertE46Content(bad,lang,390,844),String(mutate));
  }
 }
});
test('E46 staged copy visibility rejects hidden clipped nonfinite obscured and overflowing observations',async()=>{
 const {EXPECTED_E46:E,assertE46Content}=await import('./ui-oracles.mjs');assert.equal(typeof assertE46Content,'function');const good=e46Content(E,'en');
 for(const mutate of [x=>x.observations=[],x=>x.observations.pop(),x=>x.observations.push(x.observations[0]),x=>x.observations[0].text='wrong',x=>x.observations[0].effectiveVisible=false,x=>x.observations[0].connected=false,x=>x.observations[0].inert=true,x=>x.observations[0].rect.width=0,x=>x.observations[0].rect.x=NaN,x=>x.observations[0].rect.y=-100,x=>x.observations[0].rect.height=1000,x=>x.observations[0].panelOverflow=2,x=>x.observations[0].documentOverflow=2,x=>x.observations[0].scrollTop=-1,x=>x.observations[0].scrollTop=1601,x=>x.observations.at(-1).hit=false,x=>x.observations.find(o=>o.interactive&&o.scope==='panel').hit=false,x=>x.screenshot.panelScroll=20,x=>x.screenshot.file='390-chinese-card.png']){const bad=structuredClone(good);mutate(bad);assert.throws(()=>assertE46Content(bad,'en',390,844),String(mutate));}
 for(const phrase of [E.en.summary,E.en.modelNote,E.en.siteAccess,...E.en.nameNotes]){const bad=structuredClone(good);bad.observations.find(o=>o.text===phrase).effectiveVisible=false;assert.throws(()=>assertE46Content(bad,'en',390,844));}
});
