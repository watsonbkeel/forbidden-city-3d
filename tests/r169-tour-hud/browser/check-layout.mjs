import {execFileSync} from 'node:child_process';
import {root,repo,repoRequire} from './fixture-config.mjs';
import {startFixtureServer} from './server.mjs';
const {chromium}=repoRequire('playwright');
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const out=root+'/evidence';
await fs.mkdir(out,{recursive:true});
const results={kind:'real Chromium independent UI fixture; actual product modules; no World/WebGL',started:new Date().toISOString(),cases:[],assertions:[],pageErrors:[]};
const checks=(caseName,condition,message,data)=>results.assertions.push({case:caseName,pass:!!condition,message,...(data?{data}: {})});
let browser,server;
try {
 results.sourceCommit=execFileSync('git',['-C',repo,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
 if(process.env.EXPECTED_COMMIT&&results.sourceCommit!==process.env.EXPECTED_COMMIT)throw Error('Checkout differs from EXPECTED_COMMIT: '+results.sourceCommit);
 server=await startFixtureServer();
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,headless:true,chromiumSandbox:true,args:['--disable-gpu']}); results.browser=browser.version();
 const mobileAgent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
 async function state(page,name){
  await page.waitForTimeout(160);
  const data=await page.evaluate(()=>{
   const names=['#location-panel','#structural-preview-button','#help-panel','#tour-language-control','#tour-language','#tour-tools','#day-night-panel','#beijing-apply','#beijing-live','#beijing-close','#minimap-preview','#minimap','#minimap-close','#minimap-size-toggle','#map-language-control','#map-language','#place-info','#place-travel','#settings-panel','#settings-close-btn','#resume-btn','.joystick-base','.jump-button','.look-lock-button'];
   const rects=Object.fromEntries(names.map(sel=>{const el=document.querySelector(sel);if(!el)return[sel,null];const r=el.getBoundingClientRect(),s=getComputedStyle(el);const visible=r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!el.closest('[hidden]');const center=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return[sel,{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,visible,centerHit:!!center&&(el===center||el.contains(center)),scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,text:el.innerText?.slice(0,180),parent:el.parentElement?.id}]}));
   return{width:innerWidth,height:innerHeight,lang:document.documentElement.lang,rects,teleports:window.qa.teleports.slice(),teleportKeys:[...document.querySelectorAll('[data-teleport]')].map(el=>el.dataset.teleport),bodyClass:document.body.className};
  });
  await page.screenshot({path:out+'/'+name+'.png'});results.cases.push({name,...data});return {name,...data};
 }
 const overlap=(a,b)=>a?.visible&&b?.visible&&Math.min(a.right,b.right)-Math.max(a.x,b.x)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)>1;
 const inside=(r,s,insets={})=>r?.visible&&r.x>=(insets.left||0)-.5&&r.y>=(insets.top||0)-.5&&r.right<=s.width-(insets.right||0)+.5&&r.bottom<=s.height-(insets.bottom||0)+.5;
 function closedChecks(s,name,mobile,insets={}){
  const r=s.rects, ids=['#tour-language-control','#structural-preview-button','#help-panel','#location-panel','#day-night-panel'];
  for(const id of ids)checks(name,inside(r[id],s,insets),id+' visible within safe viewport',r[id]);
  for(const id of ['#tour-language','#structural-preview-button'])checks(name,r[id]?.height>=44&&r[id]?.centerHit,id+' >=44px and unobstructed',r[id]);
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)checks(name,!overlap(r[ids[i]],r[ids[j]]),ids[i]+' clear of '+ids[j]);
  if(!mobile){checks(name,r['#location-panel'].bottom<=r['#structural-preview-button'].y&&r['#structural-preview-button'].bottom<=r['#help-panel'].y,'PC order location → settings → help');checks(name,r['#tour-language-control'].bottom<=r['#day-night-panel'].y,'PC language above clock');checks(name,r['#tour-language-control'].x>s.width*.5,'PC language at right');}
  if(mobile){checks(name,r['#minimap-preview']?.centerHit,'closed map preview remains unobstructed',r['#minimap-preview']);checks(name,!overlap(r['#tour-tools'],r['#minimap-preview']),'right dock is clear of map preview');for(const id of ids)for(const action of ['.joystick-base','.jump-button','.look-lock-button','#minimap-preview'])checks(name,!overlap(r[id],r[action]),id+' clear of '+action);}
 }
 const matrix=[
  {name:'pc-1280',width:1280,height:800,mobile:false,insets:{}},
  {name:'phone-390',width:390,height:844,mobile:true,insets:{top:47,bottom:34,left:0,right:0}},
  {name:'phone-360',width:360,height:740,mobile:true,insets:{}},
  {name:'landscape-844',width:844,height:390,mobile:true,insets:{top:0,bottom:21,left:44,right:44}},
  {name:'tablet-810',width:810,height:1080,mobile:true,insets:{}},
  {name:'tablet-1180',width:1180,height:820,mobile:true,insets:{}},
 ];
 for(const m of matrix){
  const context=await browser.newContext({viewport:{width:m.width,height:m.height},isMobile:m.mobile,hasTouch:m.mobile,userAgent:m.mobile?mobileAgent:undefined,reducedMotion:'reduce'}),page=await context.newPage();
  page.on('pageerror',error=>results.pageErrors.push({case:m.name,message:error.message}));
  const cdp=await context.newCDPSession(page); await cdp.send('Emulation.setSafeAreaInsetsOverride',{insets:m.insets});
  await page.goto('http://127.0.0.1:4179');await page.waitForFunction(()=>window.qaReady);
  let s=await state(page,m.name+'-zh-closed');closedChecks(s,s.name||m.name+'-zh-closed',m.mobile,m.insets);
  await page.locator('#tour-language').focus();await page.keyboard.press('End');await page.keyboard.press('Tab');
  checks(m.name,(await page.locator('#tour-language').inputValue())==='en','native keyboard End selects English');
  s=await state(page,m.name+'-en-closed');closedChecks(s,m.name+'-en-closed',m.mobile,m.insets);
  checks(m.name,s.lang==='en','document language updates');
  if(m.name==='phone-360'||m.name==='landscape-844'){
   await page.locator('#help-panel > button').tap();await page.locator('#day-night-panel > summary').tap();
   checks(m.name,await page.evaluate(()=>window.qa.help.expanded&&window.qa.clock.root.open),'help and clock disclosures open through native touch');
   await state(page,m.name+'-expanded-help-clock');
   await page.locator('#beijing-hour').fill('18');await page.locator('#beijing-minute').fill('30');await page.locator('#beijing-apply').tap();
   checks(m.name,await page.evaluate(()=>window.qa.env.previewDate instanceof Date),'scrolled clock Apply executes');
   await page.locator('#beijing-live').tap();checks(m.name,await page.evaluate(()=>window.qa.env.previewDate===null),'scrolled clock restore executes');
   await page.locator('#beijing-close').tap();checks(m.name,await page.locator('#day-night-panel > summary').evaluate(el=>el===document.activeElement&&!el.parentElement.open),'clock close returns focus to native summary');
   await page.locator('#help-panel > button').tap();checks(m.name,await page.evaluate(()=>!window.qa.help.expanded),'expanded help can be dismissed');
  }
  const keys=s.teleportKeys;
  if(m.mobile)await page.locator('#structural-preview-button').tap();else{await page.locator('#structural-preview-button').focus();await page.keyboard.press('Enter');}
  await page.waitForFunction(()=>window.qa.settings.visible);s=await state(page,m.name+'-en-settings');
  for(const id of ['#settings-panel','#settings-close-btn','#resume-btn'])checks(m.name,inside(s.rects[id],s,m.insets),id+' inside safe viewport',s.rects[id]);
  await page.locator('#quality-toggle-btn').click();await page.locator('#performance-mode-toggle-btn').click();
  const prefs=await page.evaluate(()=>({q:localStorage.getItem('fc3d-quality-v1'),p:localStorage.getItem('fc3d-performance-mode-v1'),lang:localStorage.getItem('palace.locale')}));
  checks(m.name,prefs.q==='low'&&prefs.p==='smooth'&&prefs.lang==='en','explicit quality/performance/language saved',prefs);
  await page.keyboard.press('Escape');await page.waitForFunction(()=>!window.qa.settings.visible);
  checks(m.name,await page.locator('#structural-preview-button').evaluate(el=>el===document.activeElement),'Escape returns focus to launcher');
  await page.reload();await page.waitForFunction(()=>window.qaReady);checks(m.name,await page.evaluate(()=>window.qa.localeStore.locale==='en'&&window.qa.settings.currentQuality==='low'&&window.qa.settings.performanceMode==='smooth'),'reload restores preferences through actual product stores');
  if(m.mobile)await page.locator('#minimap-preview').tap();else{await page.locator('#help-panel > button').focus();await page.keyboard.press('m');}
  await page.waitForFunction(()=>window.qa.minimap.visible);checks(m.name,await page.evaluate(()=>document.pointerLockElement===null),'map interaction has no pointer lock');s=await state(page,m.name+'-en-map');
  checks(m.name,s.rects['#structural-preview-button'].parent==='minimap','same settings launcher moves into map');checks(m.name,JSON.stringify(s.teleportKeys)===JSON.stringify(keys),'locale leaves original DOM teleport keys unchanged');
  checks(m.name,s.rects['#minimap-close']?.centerHit,'map close remains unobstructed by right clock HUD',s.rects['#minimap-close']);
  // Existing map presentation overflow is recorded separately from the new HUD.
  const mapLang=s.rects['#map-language'];checks(m.name,mapLang?.centerHit,'map language select remains reachable',mapLang);
  const placeId=await page.evaluate(()=>window.qa.minimap.placeCatalog.places.find(p=>p.modelExperience.navigationMode!=='information-only')?.id);
  await page.evaluate(id=>window.qa.minimap.showPlace(id),placeId);s=await state(page,m.name+'-en-detail');
  checks(m.name,s.rects['#place-info']?.visible,'real catalog detail opened');
  checks(m.name,s.rects['#minimap-close']?.centerHit,'detail map close remains unobstructed',s.rects['#minimap-close']);
  for(const control of ['#structural-preview-button','#place-travel'])checks(m.name,s.rects[control]?.centerHit,control+' reachable in detail',s.rects[control]);
  if(s.rects['#place-travel']?.visible){const expected=await page.evaluate(()=>window.qa.minimap.selection.name);await page.locator('#place-travel').click();checks(m.name,await page.evaluate(key=>window.qa.teleports.at(-1)===key,expected),'translated detail travels with original Chinese key');}
  if(await page.evaluate(()=>window.qa.minimap.visible))await page.evaluate(()=>window.qa.minimap.toggle());
  for(let i=0;i<2;i++){await page.evaluate(()=>window.qa.minimap.toggle());await page.evaluate(()=>window.qa.minimap.setCompact(true));s=await state(page,m.name+'-en-compact-'+i);checks(m.name,s.rects['#structural-preview-button'].parent==='minimap','compact preserves same settings binding');for(const control of ['#structural-preview-button','#minimap-size-toggle','#minimap-close'])checks(m.name,s.rects[control]?.centerHit,control+' unobstructed in compact map',s.rects[control]);await page.evaluate(()=>window.qa.minimap.toggle());}
  s=await state(page,m.name+'-en-map-closed');closedChecks(s,m.name+'-en-map-closed',m.mobile,m.insets);
  // Actual browser focus and DOM-removal evidence, not a fake-DOM lifecycle test.
  await page.evaluate(()=>{const help=document.getElementById('help-panel');window.qa.helpRemovals=[];window.qa.helpObserver=new MutationObserver(records=>{for(const record of records)if([...record.removedNodes].includes(help))window.qa.helpRemovals.push(record.target.id);});window.qa.helpObserver.observe(document.getElementById('tour-primary-tools'),{childList:true});});
  await page.locator('#help-panel > button').focus();await page.keyboard.press('m');await page.waitForFunction(()=>window.qa.minimap.visible);await page.locator('#minimap-close').click();
  await page.evaluate(()=>new Promise(resolve=>queueMicrotask(resolve)));
  checks(m.name,await page.locator('#help-panel > button').evaluate(el=>el===document.activeElement),'map close preserves focused help after HUD microtask');
  const helpRemovals=await page.evaluate(()=>{window.qa.helpObserver.disconnect();return window.qa.helpRemovals;});checks(m.name,helpRemovals.length===0,'closing map does not detach an already docked help node',helpRemovals);
  await page.locator('#structural-preview-button').focus();await page.keyboard.press('m');await page.waitForFunction(()=>window.qa.minimap.visible);await page.locator('#structural-preview-button').focus();await page.keyboard.press('m');
  await page.evaluate(()=>new Promise(resolve=>queueMicrotask(resolve)));
  checks(m.name,await page.locator('#structural-preview-button').evaluate(el=>el===document.activeElement&&el.parentElement.id==='tour-primary-tools'),'focused settings launcher survives map-to-HUD reparent');
  await state(page,m.name+'-focus-return');
  if(m.name==='phone-360'){
   await page.setViewportSize({width:740,height:360});s=await state(page,'resize-360-to-landscape');closedChecks(s,'resize-360-to-landscape',true,{});
   await page.setViewportSize({width:1280,height:800});s=await state(page,'resize-phone-to-pc-width');closedChecks(s,'resize-phone-to-pc-width',true,{});
   await page.setViewportSize({width:360,height:740});s=await state(page,'resize-back-360');closedChecks(s,'resize-back-360',true,{});
  }
  await context.close();
 }
 checks('all-contexts',results.pageErrors.length===0,'no uncaught browser page errors',results.pageErrors);
 results.files={};for(const f of ['style.css','src/ui/TourHudLayout.js','src/ui/LanguageControl.js','src/ui/HelpPanel.js','src/ui/SettingsMenu.js']){try{const bytes=await fs.readFile(repo+'/'+f);results.files[f]=createHash('sha256').update(bytes).digest('hex');}catch{}}
}catch(error){results.blocker={message:error.message,stack:error.stack};process.exitCode=2;}finally{
 try{await browser?.close();}
 catch(error){results.cleanupErrors=[{target:'browser',message:String(error?.message??error)}];process.exitCode=2;}
 finally{
  try{await server?.close();}
  catch(error){(results.cleanupErrors??=[]).push({target:'server',message:String(error?.message??error)});process.exitCode=2;}
  finally{
   results.completed=new Date().toISOString();results.passed=results.assertions.filter(x=>x.pass).length;results.failed=results.assertions.filter(x=>!x.pass).length;
   try{await fs.writeFile(out+'/results.json',JSON.stringify(results,null,2));}
   finally{console.log(JSON.stringify({browser:results.browser,cases:results.cases.length,passed:results.passed,failed:results.failed,blocker:results.blocker?.message,pageErrors:results.pageErrors,cleanupErrors:results.cleanupErrors}));}
   if(results.failed&&!process.exitCode)process.exitCode=1;
  }
 }
}
