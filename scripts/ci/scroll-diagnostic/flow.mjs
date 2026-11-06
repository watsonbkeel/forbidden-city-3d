import fs from 'node:fs';import path from 'node:path';
import {publish,publishThenAssert,classify,controlAllowed} from './contract.mjs';
const check=(value,message)=>{if(!value)throw Error(message);};
const same=(before,after,keys)=>{for(const key of keys)check(JSON.stringify(before[key])===JSON.stringify(after[key]),`State changed on locale toggle: ${key}`);};
async function settleLocale(page,value){await page.waitForFunction(value=>document.documentElement.lang===value&&window.fixture.localeStore.locale===value,value);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
export async function runCase({browser,caseId,output,url,identity,deadline,clock=()=>Number(process.hrtime.bigint())/1e9}){
 check(['primary','control'].includes(caseId),'Unknown diagnostic case');check(browser.contexts().length===0,'Contexts must be serial');
 const directory=path.join(output,caseId);fs.mkdirSync(directory,{mode:0o700});const resultPath=path.join(directory,'RESULT.json');
 const record={schema:1,identity,caseId,diagnosticOnly:true,releaseAcceptance:false,baseline:null,transitions:[],errors:[],assertionEvaluated:false,completed:false,closed:false,controlEligible:false,screenshots:[],primaryContract:'not_run'};
 fs.writeFileSync(resultPath,JSON.stringify(record)+'\n',{flag:'wx',mode:0o600});
 let context;const persist=()=>publish(resultPath,record);const within=()=>{check(clock()<deadline,'90-second diagnostic browser deadline exceeded');};
 try{
  within();context=await browser.newContext({viewport:{width:1280,height:900},isMobile:false,hasTouch:false,deviceScaleFactor:1});
  context.setDefaultTimeout(Math.max(1,Math.min(30000,(deadline-clock())*1000)));context.setDefaultNavigationTimeout(Math.max(1,Math.min(30000,(deadline-clock())*1000)));
  const page=await context.newPage();const error=message=>{if(record.errors.length<16)record.errors.push(String(message).slice(0,2048));else record.errorsTruncated=true;};page.on('pageerror',e=>error(e.message));page.on('console',m=>{if(m.type()==='error')error(m.text());});
  await page.goto(url+'?mobile=0',{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.fixture);
  const select=page.locator('#tour-language');await select.focus();await page.keyboard.press('End');await page.keyboard.press('Enter');await settleLocale(page,'en');
  record.anchor=await page.evaluate(control=>{document.activeElement.blur();window.fixture.map.toggle();const e=document.querySelector('#place-directory'),original=control?getComputedStyle(e).overflowAnchor:null;window.scrollDiagnosticEvents=[];window.scrollDiagnosticEventCount=0;e.addEventListener('scroll',()=>{const sequence=++window.scrollDiagnosticEventCount;if(window.scrollDiagnosticEvents.length<64)window.scrollDiagnosticEvents.push({sequence,target:'place-directory',scrollTop:e.scrollTop,time:performance.now()});});if(control)e.style.overflowAnchor='none';return{original,override:control?'none':null,actual:control?getComputedStyle(e).overflowAnchor:null};},caseId==='control');
  await page.locator('#place-search').fill('');
  check(caseId!=='control'||record.anchor.actual==='none','Control override not applied');
  const directoryBefore=await page.evaluate(()=>{const e=document.querySelector('#place-directory'),input=document.querySelector('#place-search');input.focus({preventScroll:true});e.scrollTop=80;return{scroll:e.scrollTop,height:e.scrollHeight,client:e.clientHeight,query:input.value,focus:document.activeElement.id};});
  check(directoryBefore.height>directoryBefore.client&&directoryBefore.scroll>0,'Directory scroll precondition failed');
  record.baseline=directoryBefore;
  for(const lang of ['zh-CN','en']){
   const transition=await page.evaluate(value=>{const scalar=()=>({scroll:document.querySelector('#place-directory').scrollTop,query:document.querySelector('#place-search').value,focus:document.activeElement.id,locale:document.documentElement.lang,storeLocale:window.fixture.localeStore.locale,fontStatus:document.fonts?.status??'unsupported',readyState:document.readyState});const pre=scalar();window.fixture.localeStore.setLocale(value);return{pre,afterSet:scalar()};},lang);
   await settleLocale(page,lang);
   const state=await page.evaluate(()=>({scroll:document.querySelector('#place-directory').scrollTop,query:document.querySelector('#place-search').value,focus:document.activeElement.id}));
   const detail=await page.evaluate(()=>{
    const f=window.fixture,e=document.querySelector('#place-directory'),m=document.querySelector('#minimap'),a=document.activeElement,c=getComputedStyle(e);
    const rect=n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,right:r.right,bottom:r.bottom,left:r.left};};
    const nodes=[...e.querySelectorAll('button[data-place-id]')];if(nodes.length>164)throw Error('Maximum 164 directory buttons');
    const buttons=nodes.map(n=>({id:n.getAttribute('data-place-id'),text:n.textContent.slice(0,256),hidden:n.hidden,rect:rect(n),offsetTop:n.offsetTop,offsetHeight:n.offsetHeight}));
    let activePath=[],p=a;for(let i=0;p&&i<6;i++,p=p.parentElement)activePath.push(p.tagName.toLowerCase()+(p.id?'#'+p.id.slice(0,100):''));
    return{time:performance.now(),locale:document.documentElement.lang,storeLocale:f.localeStore.locale,fontStatus:document.fonts?.status??'unsupported',readyState:document.readyState,active:{id:a.id,tag:a.tagName,path:activePath},documentScrollXY:{x:scrollX,y:scrollY},query:document.querySelector('#place-search').value,
     directory:{scroll:e.scrollTop,scrollLeft:e.scrollLeft,max:Math.max(0,e.scrollHeight-e.clientHeight),client:e.clientHeight,height:e.scrollHeight,clientWidth:e.clientWidth,scrollWidth:e.scrollWidth,rect:rect(e),computed:{overflowY:c.overflowY,overflowAnchor:c.overflowAnchor,display:c.display,flexWrap:c.flexWrap,rowGap:c.rowGap,columnGap:c.columnGap,font:c.font,lineHeight:c.lineHeight}},
     map:{scroll:m.scrollTop,scrollHeight:m.scrollHeight,clientHeight:m.clientHeight,rect:rect(m),view:{...f.map.view}},selectedPlaceId:f.map.selectedPlaceId,buttons,scrollEvents:[...window.scrollDiagnosticEvents],scrollEventsOmitted:Math.max(0,window.scrollDiagnosticEventCount-64)};
   });
   check(detail.buttons.length===164&&new Set(detail.buttons.map(b=>b.id)).size===164,'Expected 164 unique original directory buttons');
   const entry={target:lang,baseline:directoryBefore,...transition,after:{...state,locale:detail.locale,storeLocale:detail.storeLocale,fontStatus:detail.fontStatus,readyState:detail.readyState},range:{scroll:detail.directory.scroll,max:detail.directory.max,client:detail.directory.client,height:detail.directory.height},detail,errors:[...record.errors],elapsedSeconds:clock()};record.transitions.push(entry);
   let assertionFailure;
   // A failed publication aborts. Only the original comparison is caught here.
   publishThenAssert(entry,()=>persist(),()=>{try{same(directoryBefore,state,['scroll','query','focus']);}catch(error){assertionFailure=error.message;}});
   record.assertionEvaluated=true;
   if(assertionFailure){record.primaryContract='failed';record.failure=assertionFailure;record.controlEligible=caseId==='primary'&&controlAllowed(record.transitions)&&!record.errorsTruncated;record.completed=true;persist();break;}
   check(record.errors.length===0&&!record.errorsTruncated,'Console/page errors occurred');within();
  }
  if(!record.completed){record.primaryContract='passed';record.completed=true;persist();}
  // Values and original assertion verdict are fixed before either endpoint image.
  within();check(record.errors.length===0&&!record.errorsTruncated,'Console/page errors occurred');
  await page.screenshot({path:path.join(output,`${caseId}-endpoint.png`),fullPage:false});record.screenshots.push(`${caseId}-endpoint.png`);persist();
  within();await page.locator('#place-directory').screenshot({path:path.join(output,`${caseId}-directory-endpoint.png`)});record.screenshots.push(`${caseId}-directory-endpoint.png`);persist();
  within();check(record.errors.length===0&&!record.errorsTruncated,'Console/page errors occurred');
 }catch(error){record.unexpectedError=String(error.stack??error).slice(0,4096);record.controlEligible=false;record.completed=false;persist();}
 finally{try{await context?.close();record.closed=true;}catch(error){record.closed=false;record.completed=false;record.controlEligible=false;record.closeError=String(error.message).slice(0,2048);}persist();}
 return record;
}
