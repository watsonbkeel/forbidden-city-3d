import fs from 'node:fs';import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createServer} from 'vite';
import {fileURLToPath} from 'node:url';
import {recheckToolchain} from './preflight.mjs';
import {sha256,writeResultJSON} from './common.mjs';
import {assertSourceLimits,assertBrowserArguments,repositoryRoot,assertMemoryPhases,assertMemoryAdmission} from './ui-oracles.mjs';
import {chromium} from 'playwright';
const base=repositoryRoot(import.meta.url),output=process.env.BILINGUAL_UI_EVIDENCE_DIR;
const workRoot=process.env.BILINGUAL_UI_WORK_ROOT,scratch=process.env.BILINGUAL_UI_SCRATCH_DIR,inputsPath=process.env.BILINGUAL_UI_INPUTS;
if(!workRoot||!path.isAbsolute(workRoot)||output!==path.join(workRoot,'receipts','ui-components','evidence')||scratch!==path.join(workRoot,'scratch'))throw Error('Exact same-run evidence and scratch paths required');
const resultPath=path.join(output,'RESULT.json');
let browser,vite;const result={scope:'real browser UI components, no World construction or GPU/mobile hardware acceptance',layouts:[],errors:[],pass:false,memoryPhases:[]};
fs.writeFileSync(resultPath,JSON.stringify({...result,status:'starting'},null,2)+'\n',{flag:'wx'});
const check=(value,message)=>{if(!value)throw Error(message);};
const phaseStart=process.hrtime.bigint();
function recordMemoryPhase(phase){
 const memory=process.memoryUsage();
 const elapsedMs=Number(process.hrtime.bigint()-phaseStart)/1e6;
 const memoryPhases=[...result.memoryPhases,{phase,elapsedMs,rss:memory.rss,heapTotal:memory.heapTotal,heapUsed:memory.heapUsed,external:memory.external,arrayBuffers:memory.arrayBuffers}];
 assertMemoryPhases(memoryPhases,false);
 writeResultJSON(resultPath,{...result,status:'running',memoryPhases});
 result.memoryPhases=memoryPhases;
}
// Inspect only this process's descendants. Never accept Playwright's default
// chromiumSandbox:false or an unnoticed disabling flag in generated arguments.
function browserProcesses(){
 const rows=[];for(const name of fs.readdirSync('/proc')){if(!/^\d+$/.test(name))continue;try{const stat=fs.readFileSync(`/proc/${name}/stat`,'utf8'),parts=stat.slice(stat.lastIndexOf(')')+2).split(' '),args=fs.readFileSync(`/proc/${name}/cmdline`,'utf8').split('\0').filter(Boolean);rows.push({pid:Number(name),parent:Number(parts[1]),args,executable:fs.realpathSync(`/proc/${name}/exe`)});}catch{}}
 const descendants=new Set([process.pid]);let changed=true;while(changed){changed=false;for(const row of rows)if(descendants.has(row.parent)&&!descendants.has(row.pid)){descendants.add(row.pid);changed=true;}}
 return rows.filter(row=>descendants.has(row.pid)&&/chrom(?:e|ium)$/.test(row.args[0]??''));
}
async function settleLocale(page,value){await page.waitForFunction(value=>document.documentElement.lang===value&&window.fixture.localeStore.locale===value,value);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function locale(page,value){await page.evaluate(value=>window.fixture.localeStore.setLocale(value),value);await settleLocale(page,value);}
async function snapshot(page){return page.evaluate(()=>{const f=window.fixture,b=window.uiBefore,rect=document.activeElement.getBoundingClientRect(),panelRect=f.map.placePanel.element.getBoundingClientRect();return{focusVisible:rect.top>=panelRect.top-1&&rect.bottom<=panelRect.bottom+1,focusTop:rect.top,panelMax:Math.max(0,f.map.placePanel.element.scrollHeight-f.map.placePanel.element.clientHeight),selected:f.map.selectedPlaceId,selection:f.map.selection,query:document.querySelector('#place-search').value,view:{...f.map.view},panelScroll:f.map.placePanel.element.scrollTop,quality:f.settings.currentQuality,sound:f.settings.soundEnabled,teleports:[...f.teleports],sameReferences:b.map===f.map&&b.panel===f.map.placePanel&&b.catalog===f.map.placeCatalog&&b.settings===f.settings&&b.time===f.time&&b.environment===f.environment,focusId:document.activeElement.id,focusHref:document.activeElement.getAttribute('href'),focusConnected:document.activeElement.isConnected,lang:document.documentElement.lang,title:document.querySelector('#place-title').textContent,overflow:document.documentElement.scrollWidth-innerWidth,missing:[...f.missingTranslations]};});}
const same=(before,after,keys)=>{for(const key of keys)check(JSON.stringify(before[key])===JSON.stringify(after[key]),`State changed on locale toggle: ${key}`);};
async function captureSourceLimits(page,lang){
 const view=await page.evaluate(()=>{
  const section=document.querySelector('#place-name-provenance');
  const links=nodes=>[...nodes].map(n=>({id:n.id,href:n.getAttribute('href'),target:n.getAttribute('target'),rel:n.getAttribute('rel'),text:n.textContent}));
  return{selected:window.fixture.map.selectedPlaceId,title:document.querySelector('#place-title').innerText,directoryTitle:document.querySelector('#place-directory button[data-place-id="taihe"]').textContent,
   headings:[...document.querySelectorAll('#place-info h3')].map(n=>n.textContent),notes:[...document.querySelectorAll('#place-info .place-note')].map(n=>n.textContent),
   links:links([...document.querySelectorAll('#place-info a')].filter(n=>!n.closest('#place-name-provenance'))),
   nameProvenance:section?{count:document.querySelectorAll('#place-name-provenance').length,id:section.id,status:section.getAttribute('data-name-status'),headings:[...section.querySelectorAll('h3')].map(n=>n.textContent),notes:[...section.querySelectorAll('.place-note')].map(n=>n.textContent),quotes:[...section.querySelectorAll(':scope > div > p:first-child')].map(n=>n.textContent),links:links(section.querySelectorAll('a'))}:null};
 });
 return assertSourceLimits(view,lang);
}
try{
 recordMemoryPhase('before-preflight');
 const receipt=await recheckToolchain({repo:base,workRoot,inputsPath});
 result.identity=receipt.identity;result.toolchainSHA256=sha256(fs.readFileSync(path.join(workRoot,'receipts','toolchain.json')));
 recordMemoryPhase('after-preflight');
 for(const name of ['tmp','home','xdg-config','xdg-cache','xdg-data'])fs.mkdirSync(path.join(scratch,name));
 recordMemoryPhase('before-vite');
 vite=await createServer({configFile:fileURLToPath(new URL('./vite.config.mjs',import.meta.url))});await vite.listen();
 const url='http://127.0.0.1:4179/tests/bilingual/browser/fixture.html';
 for(let i=0;i<80;i++){try{if((await fetch(url)).ok)break;}catch{}if(i===79)throw Error('UI server unavailable');await new Promise(r=>setTimeout(r,100));}
 recordMemoryPhase('vite-ready');
 result.memoryAdmission=JSON.parse(execFileSync('python3',[fileURLToPath(new URL('./memory_budget.py',import.meta.url)),'--admission'],{cwd:base,env:process.env,timeout:5000,maxBuffer:65536,encoding:'utf8',stdio:['ignore','pipe','pipe']}));
 assertMemoryAdmission(result.memoryAdmission,result.identity);
 recordMemoryPhase('before-chrome-launch');
 browser=await chromium.launch({headless:true,chromiumSandbox:true,channel:'chrome',args:['--disable-dev-shm-usage'],env:{...process.env,TMPDIR:path.join(scratch,'tmp'),HOME:path.join(scratch,'home'),XDG_CONFIG_HOME:path.join(scratch,'xdg-config'),XDG_CACHE_HOME:path.join(scratch,'xdg-cache'),XDG_DATA_HOME:path.join(scratch,'xdg-data')}});
 recordMemoryPhase('after-chrome-launch');
 result.browserProcesses=browserProcesses();result.browserArguments=result.browserProcesses.map(row=>row.args);assertBrowserArguments(result.browserArguments);result.browserVersion=browser.version();check(result.browserVersion===receipt.toolchain.chrome.version,'Browser version differs from same-run preflight');check(result.browserProcesses.every(row=>row.executable===receipt.toolchain.chrome.realpath),'Launched executable differs from same-run preflight');check(result.browserArguments.length>0,'Browser arguments unavailable');check(result.browserArguments.every(args=>!args.some(arg=>['--no-sandbox','--disable-setuid-sandbox','--disable-namespace-sandbox'].includes(arg))),'Browser sandbox disabled');
 for(const mobile of [false,true]){
  const width=mobile?390:1280,height=mobile?844:900,context=await browser.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(url+'?mobile='+(mobile?'1':'0'),{waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.fixture);
  const orientation=[];if(mobile){orientation.push(await page.evaluate(()=>({lang:document.documentElement.lang,content:getComputedStyle(document.body,'::before').content,display:getComputedStyle(document.body,'::before').display,overflow:document.documentElement.scrollWidth-innerWidth})));check(orientation[0].content.includes('为了更好的体验'),'Chinese orientation hint missing');}
  const select=page.locator('#tour-language');await select.focus();await page.keyboard.press('End');await page.keyboard.press('Enter');await settleLocale(page,'en');
  if(mobile){orientation.push(await page.evaluate(()=>({lang:document.documentElement.lang,content:getComputedStyle(document.body,'::before').content,display:getComputedStyle(document.body,'::before').display,overflow:document.documentElement.scrollWidth-innerWidth})));check(orientation[1].content.includes('For a better experience, rotate your device')&&orientation[1].display!=='none'&&orientation[1].overflow<=1,'English portrait hint or viewport incorrect');}
  await page.evaluate(()=>{document.activeElement.blur();window.fixture.map.toggle();});
  await page.locator('#place-search').fill('');
  const directoryBefore=await page.evaluate(()=>{const e=document.querySelector('#place-directory'),input=document.querySelector('#place-search');input.focus({preventScroll:true});e.scrollTop=80;return{scroll:e.scrollTop,height:e.scrollHeight,client:e.clientHeight,query:input.value,focus:document.activeElement.id};});
  check(directoryBefore.height>directoryBefore.client&&directoryBefore.scroll>0,'Directory scroll precondition failed');
  const directoryStates=[];for(const lang of ['zh-CN','en']){await locale(page,lang);const state=await page.evaluate(()=>({scroll:document.querySelector('#place-directory').scrollTop,query:document.querySelector('#place-search').value,focus:document.activeElement.id}));same(directoryBefore,state,['scroll','query','focus']);directoryStates.push({lang,...state});}
  await page.locator('#place-search').fill('taihedian');const taihe=page.locator('#place-directory button[data-place-id="taihe"]');check(await taihe.isVisible()&&await taihe.textContent()==='Hall of Supreme Harmony','Official Taihe directory name missing');await taihe.click();
  const dimensions=await page.evaluate(()=>{const f=window.fixture;window.uiBefore={map:f.map,panel:f.map.placePanel,catalog:f.map.placeCatalog,settings:f.settings,time:f.time,environment:f.environment,oldButton:document.querySelector('#place-travel')};const panel=f.map.placePanel.element;document.querySelector('#place-travel').focus({preventScroll:true});panel.scrollTop=80;return{height:panel.scrollHeight,client:panel.clientHeight,scroll:panel.scrollTop};});
  check(dimensions.height>dimensions.client&&dimensions.scroll>0,'Card scroll precondition failed');const before=await snapshot(page),cardStates=[],sourceLimits=[];
  const kept=['selected','selection','query','view','panelScroll','quality','sound','teleports','focusId','focusHref'];
  for(const lang of ['zh-CN','en']){await locale(page,lang);const state=await snapshot(page);same(before,state,kept);check(state.sameReferences&&state.focusConnected,'UI reference or focus replaced');check(state.overflow<=1,'Page overflows viewport');cardStates.push(state);sourceLimits.push(await captureSourceLimits(page,lang));if(lang==='zh-CN')await page.screenshot({path:path.join(output,`${width}-chinese-card.png`),fullPage:true});}
  await page.evaluate(()=>window.uiBefore.oldButton.click());same(before,await snapshot(page),['teleports']);
  await page.locator('#place-info a').first().focus();const sourceBefore=await snapshot(page),sourceStates=[];check(sourceBefore.focusHref,'No source link focused');
  for(const lang of ['zh-CN','en']){await locale(page,lang);const state=await snapshot(page);same(sourceBefore,state,kept.filter(key=>key!=='panelScroll'));check(state.focusConnected&&state.focusVisible,'Source focus detached or scrolled out of view');check(state.panelScroll>=0&&state.panelScroll<=state.panelMax,'Invalid source scroll position');sourceStates.push(state);}
  await page.evaluate(()=>document.querySelector('#place-info').scrollTop=0);
  const hitTests=await page.evaluate(()=>['#map-language','#place-travel','#place-back'].map(selector=>{const e=document.querySelector(selector),r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2,hit=document.elementFromPoint(x,y);return{selector,rect:{x:r.x,y:r.y,width:r.width,height:r.height},hit:!!hit&&(hit===e||e.contains(hit))};}));check(hitTests.every(x=>x.hit),'Visible control is obscured');
  await page.screenshot({path:path.join(output,`${width}-english-card.png`),fullPage:true});
  await page.locator('#place-back').click();check(await page.locator('#place-search').inputValue()==='taihedian','Search query lost');
  await page.locator('#structural-preview-button').click();await page.locator('#settings-language').selectOption('zh-CN');await settleLocale(page,'zh-CN');await page.locator('#settings-language').selectOption('en');await settleLocale(page,'en');
  await page.screenshot({path:path.join(output,`${width}-english-settings.png`),fullPage:true});
  const settings=await page.evaluate(()=>{const root=document.querySelector('#settings-panel'),han=/[\u3400-\u9fff]/,attributes=['aria-label','aria-valuetext','title','placeholder','alt'],miss=[];for(const n of [root,...root.querySelectorAll('*')]){if(n.closest('[translate="no"]'))continue;for(const key of attributes)if(han.test(n.getAttribute(key)??''))miss.push({id:n.id,key,text:n.getAttribute(key)});if(!['TEXTAREA','SCRIPT','STYLE','CODE','PRE'].includes(n.tagName))for(const child of n.childNodes)if(child.nodeType===3&&han.test(child.nodeValue))miss.push({id:n.id,key:'text',text:child.nodeValue.slice(0,120)});}return{overflow:document.documentElement.scrollWidth-innerWidth,focus:document.activeElement.id,quality:window.fixture.settings.currentQuality,sound:window.fixture.settings.soundEnabled,missing:[...window.fixture.missingTranslations],untranslated:miss};});
  check(settings.overflow<=1,'Settings page overflows');check(settings.untranslated.length===0,'Chinese UI copy remains in English settings');
  await page.locator('#resume-btn').click();
  const facilities=[];for(const query of ['Inner Jinshui','Wuying','Banbi Bridge','Sanzuo']){await page.locator('#place-search').fill(query);await page.locator('#bridge-facility-directory button:visible').first().click();check(await page.locator('#place-travel').count()===0,'Bridge facility invented a travel action');facilities.push(await page.locator('#place-title').textContent());await page.locator('#place-back').click();}check(await page.evaluate(()=>window.fixture.teleports.length)===0,'Reading facilities moved the user');
  await page.evaluate(()=>{if(window.fixture.map.visible)window.fixture.map.toggle();window.fixture.help.setExpanded(true);window.fixture.time.root.open=true;});
  await page.locator('#beijing-hour').fill('99');await page.locator('#beijing-minute').fill('17');await page.locator('#beijing-apply').click();
  await page.waitForFunction(()=>document.querySelector('#beijing-time-error').textContent.includes('23'));
  const toolStates=[];for(const lang of ['zh-CN','en']){await locale(page,lang);toolStates.push(await page.evaluate(()=>({lang:document.documentElement.lang,hour:document.querySelector('#beijing-hour').value,minute:document.querySelector('#beijing-minute').value,open:window.fixture.time.root.open,dirty:window.fixture.time.dirty,help:window.fixture.help.expanded,error:document.querySelector('#beijing-time-error').textContent,helpText:document.querySelector('#help-panel-body').textContent})));}check(toolStates.every(s=>s.hour==='99'&&s.minute==='17'&&s.open&&s.dirty&&s.help),'Time draft/help state lost');check(!/[\u3400-\u9fff]|unavailable/.test(toolStates[1].error+toolStates[1].helpText),'Tool text not translated');
  await page.evaluate(()=>window.fixture.failure.show('graphics',{scope:'synthetic browser test',message:'保留诊断原始数据'}));await page.locator('#tour-copy-diagnostic').click();await page.waitForFunction(()=>document.querySelector('#tour-copy-status').textContent.length>0);await page.locator('#tour-reload-btn').click();await locale(page,'en');
  const failure=await page.evaluate(()=>({value:document.querySelector('#tour-failure-diagnostic').value,label:document.querySelector('#tour-failure-diagnostic').getAttribute('aria-label'),copy:document.querySelector('#tour-copy-status').textContent,error:document.querySelector('#tour-failure-description').textContent}));check(failure.value.includes('保留诊断原始数据'),'Diagnostic value modified');check(!/[\u3400-\u9fff]|unavailable/.test(failure.label+failure.copy+failure.error),'Failure UI not translated');await page.evaluate(()=>window.fixture.failure.dispose());
  await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>!!window.fixture);check(await page.locator('#tour-language').inputValue()==='en','Preference not restored on reload');
  result.layouts.push({width,height,mobileEmulation:mobile,orientation,directoryBefore,directoryStates,dimensions,before,cardStates,sourceLimits,sourceBefore,sourceStates,hitTests,settings,facilities,toolStates,failure,errors});result.errors.push(...errors);await context.close();
 }
 check(result.errors.length===0,'Console/page errors occurred');check(result.layouts.every(x=>x.settings.missing.length===0),'Untranslated UI messages detected');result.pass=true;
}catch(error){result.pass=false;result.failure=error.stack;process.exitCode=1;}
finally{
 const cleanupFailure=(name,error)=>{result.pass=false;process.exitCode=1;result.errors.push(`${name}: ${error.message}`);};
 try{await browser?.close();}catch(error){cleanupFailure('browser.close',error);}
 finally{try{await vite?.close();}catch(error){cleanupFailure('vite.close',error);}
 finally{try{const after=await recheckToolchain({repo:base,workRoot,inputsPath});check(JSON.stringify(after.identity)===JSON.stringify(result.identity),'Postflight event identity changed');check(sha256(fs.readFileSync(path.join(workRoot,'receipts','toolchain.json')))===result.toolchainSHA256,'Toolchain receipt changed');result.toolchainRechecked=true;}catch(error){cleanupFailure('toolchain.postflight',error);}
 writeResultJSON(path.join(output,'RESULT.json'),result);console.log(JSON.stringify({pass:result.pass,failure:result.failure,layouts:result.layouts.length,errors:result.errors}));}}
}
