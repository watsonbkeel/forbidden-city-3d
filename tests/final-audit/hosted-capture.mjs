// Fixed, one-pass hosted DEV-browser evidence. Parent runner owns memory/time admission.
// Never calls app movement/teleport/render APIs or changes camera/model state.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium} from 'playwright';
const root=fs.realpathSync(process.cwd()),out=process.env.EVIDENCE_DIR;
assert.equal(process.env.CI,'true');assert.equal(process.env.GITHUB_ACTIONS,'true');
assert.ok(out&&path.isAbsolute(out));fs.mkdirSync(out,{recursive:true});const evidence=fs.realpathSync(out);assert.ok(evidence!==root&&!evidence.startsWith(root+path.sep),'External evidence required');
const base='/forbidden-city-3d/',origin='http://127.0.0.1:4189',subjects=['amitabha','shakyamuni','bhaisajyaguru'];
const result={schema:1,mode:'VITE_DEV_REAL_ROOT_UI_ONLY',sourceCommit:process.env.GITHUB_SHA??null,releaseAccepted:false,artAccepted:false,limits:['Headless hosted Chromium, not physical desktop/mobile GPU.','Map arrival is teleport, not walking through the hall entrance.','Projection checks do not establish visibility through columns/walls or artistic quality.','Screenshots require independent pixel inspection.','One fixed workflow per viewport, no rerun or pose injection.'],runs:[],serverErrors:[],startedAt:new Date().toISOString()};
const save=()=>fs.writeFileSync(path.join(evidence,'hosted-capture.json'),JSON.stringify(result,null,2)+'\n');
const cap=(a,v)=>{if(a.length<512)a.push(v);else result.truncatedEvidence=true;};
const cache=fs.mkdtempSync(path.join(os.tmpdir(),'triad-vite-cache-'));
let server,browser,activeContext;const deadline=setTimeout(()=>{result.timeout=true;save();void activeContext?.close();void browser?.close();void server?.close();},600000);deadline.unref();
async function snapshot(page){return page.evaluate(()=>{
 const app=window.__forbiddenCityApp,c=app?.camera,entry=app?.zoneManager?.loaded?.get('outer-west'),s=entry?.builder?.dafotangOriginalSession;
 const slots=s?Object.entries(s.slots).map(([subjectId,v])=>{const mesh=v.presentation;const p=mesh?.position?.clone();if(p&&c)p.project(c);return{subjectId,status:v.status,name:mesh?.name??null,parent:mesh?.parent?.name??null,visible:mesh?.visible??null,textureUUID:mesh?.material?.map?.uuid??null,imageWidth:mesh?.material?.map?.image?.width??null,imageHeight:mesh?.material?.map?.image?.height??null,projectedOrigin:p?{x:p.x,y:p.y,z:p.z}:null};}):[];
 return{ready:!!app?.minimap,camera:c?{position:c.position.toArray(),quaternion:c.quaternion.toArray(),fov:c.fov}:null,currentZone:app?.zoneManager?.currentId??null,loaded:[...app?.zoneManager?.loaded?.keys()??[]],mapVisible:app?.minimap?.visible??null,isMobile:app?.isMobile??null,triadOptIn:app?.zoneManager?.triadTextureFirst??null,triadStatus:s?.status??null,slots,welcomeVisible:!!document.getElementById('welcome-overlay')&&getComputedStyle(document.getElementById('welcome-overlay')).display!=='none',loadingText:document.getElementById('progress-text')?.textContent??null,bodyOverflow:document.documentElement.scrollWidth>innerWidth};
 });}
async function enterWorld(page,run){const overlay=page.locator('#welcome-overlay');if(await overlay.isVisible()){await overlay.locator('h2').click();await overlay.waitFor({state:'hidden',timeout:10000});run.actions.push('Click genuine desktop welcome overlay to enter pointer lock');}}
async function capture(page,run,label){const file=`${run.name}-${label}.png`;await page.screenshot({path:path.join(evidence,file),timeout:20000});run.screenshots.push(file);run.snapshots.push({label,...await snapshot(page)});save();}
async function interact(page,locator,touch){await locator.waitFor({state:'visible',timeout:12000});if(touch)await locator.tap();else await locator.click();}
async function walkInput(page,touch){if(!touch){await page.keyboard.down('KeyW');try{await page.waitForTimeout(900);}finally{await page.keyboard.up('KeyW');}return;}
 const box=await page.locator('.joystick-base').boundingBox();assert.ok(box,'touch joystick visible');const cdp=await page.context().newCDPSession(page);const x=box.x+box.width/2,y=box.y+box.height/2;try{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-30,id:1}]});await page.waitForTimeout(900);}finally{await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}}
try{
 process.env.VITE_BASE=base;
 server=await createServer({root,base,server:{host:'127.0.0.1',port:4189,strictPort:true,hmr:{host:'127.0.0.1',port:4189,clientPort:4189},headers:{'Content-Security-Policy':"connect-src 'self' ws://127.0.0.1:4189 blob: data:;"}},cacheDir:cache});server.httpServer?.on('error',e=>{cap(result.serverErrors,String(e));save();});await server.listen();
 browser=await chromium.launch({headless:true,chromiumSandbox:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],timeout:30000});
 for(const profile of[{name:'desktop',viewport:{width:1280,height:800},touch:false},{name:'touch',viewport:{width:390,height:844},touch:true}]){
  const run={...profile,status:'RUNNING',console:[],pageErrors:[],requestFailures:[],httpErrors:[],blockedRequests:[],webSockets:[],pngResponses:[],screenshots:[],snapshots:[],actions:[]};result.runs.push(run);save();
  let page;
  try{
   activeContext=await browser.newContext({viewport:profile.viewport,deviceScaleFactor:1,isMobile:profile.touch,hasTouch:profile.touch,locale:'zh-CN',serviceWorkers:'block',...(profile.touch?{userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'}:{})});
   assert.equal(typeof activeContext.routeWebSocket,'function','Pinned Playwright must support WebSocket interception');
   await activeContext.routeWebSocket('**/*',ws=>{const u=new URL(ws.url());if(u.protocol==='ws:'&&u.hostname==='127.0.0.1'&&u.port==='4189'&&u.pathname===base){cap(run.webSockets,{url:u.origin+u.pathname,kind:'LOCAL_VITE_HMR'});ws.connectToServer();}else{cap(run.blockedRequests,'WEBSOCKET:'+u.origin+u.pathname);ws.close();}});
   await activeContext.route('**/*',route=>{const url=route.request().url();if(url.startsWith(origin+'/')||url.startsWith('data:')||url.startsWith('blob:'))return route.continue();cap(run.blockedRequests,url);return route.abort('blockedbyclient');});
   page=await activeContext.newPage();page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(45000);
   page.on('console',m=>cap(run.console,{type:m.type(),text:m.text().slice(0,1500)}));page.on('pageerror',e=>cap(run.pageErrors,String(e.stack??e)));page.on('requestfailed',r=>cap(run.requestFailures,{url:r.url(),failure:r.failure()?.errorText}));page.on('response',r=>{if(r.status()>=400)cap(run.httpErrors,{url:r.url(),status:r.status()});if(/dafotang-original\/(amitabha|shakyamuni|bhaisajyaguru)-refined-v2\.png$/.test(r.url()))cap(run.pngResponses,{url:r.url(),status:r.status()});});
   await page.goto(origin+base+'?triad=texture-first',{waitUntil:'domcontentloaded'});
   await page.locator('#loading-screen').waitFor({state:'hidden',timeout:180000});await page.waitForFunction(()=>!!window.__forbiddenCityApp?.minimap,{},{timeout:20000});
   if(!profile.touch)await enterWorld(page,run);await capture(page,run,'initial-axis');assert.equal((await snapshot(page)).triadOptIn,true);
   if(profile.touch)await interact(page,page.getByRole('button',{name:'打开故宫平面图',exact:true}),true);else await page.keyboard.press('KeyM');run.actions.push('Open normal map');
   const search=page.getByRole('searchbox',{name:'搜索地点名称',exact:true});await search.waitFor({state:'visible'});await search.fill('大佛堂');
   await interact(page,page.getByRole('button',{name:'了解大佛堂',exact:true}),profile.touch);await capture(page,run,'hall-card');
   await interact(page,page.getByRole('button',{name:'前往大佛堂',exact:true}),profile.touch);run.actions.push('Select actual hall card and 前往');
   await page.waitForFunction(()=>{const s=window.__forbiddenCityApp?.zoneManager?.loaded?.get('outer-west')?.builder?.dafotangOriginalSession;return s&&s.status!=='LOADING';},{},{timeout:90000});
   const close=page.locator('#minimap-close');if(await close.isVisible())await interact(page,close,profile.touch);
   if(!profile.touch)await enterWorld(page,run);await capture(page,run,'map-arrival');const arrived=await snapshot(page);assert.equal(arrived.triadStatus,'READY_FOR_HALL_QA');assert.equal(arrived.slots.length,3);assert.deepEqual(arrived.slots.map(s=>s.subjectId).sort(),[...subjects].sort());assert.equal(new Set(arrived.slots.map(s=>s.textureUUID)).size,3);assert.ok(arrived.slots.every(s=>s.status==='READY_FOR_HALL_QA'&&s.imageWidth===1024&&s.imageHeight===1536&&s.visible));
   // A single short ordinary movement probe, not a scripted route certification.
   // Desktop map mode explicitly supports keyboard movement without pointer lock.
   if(!profile.touch){await page.keyboard.press('KeyM');await page.locator('#minimap').waitFor({state:'visible'});}
   run.beforeInput=await snapshot(page);await walkInput(page,profile.touch);run.afterInput=await snapshot(page);run.actions.push(profile.touch?'900ms touchscreen joystick forward':'900ms W while normal map open');
   if(!profile.touch)await interact(page,page.locator('#minimap-close'),false);
   if(!profile.touch)await enterWorld(page,run);await capture(page,run,'after-short-input');const a=run.beforeInput.camera.position,b=run.afterInput.camera.position;run.inputDistance=Math.hypot(...a.map((v,i)=>b[i]-v));run.inputMoved=run.inputDistance>.01;
   run.pngDistinctSuccessful=new Set(run.pngResponses.filter(x=>x.status===200).map(x=>x.url)).size;assert.equal(run.pngDistinctSuccessful,3);assert.deepEqual(run.pageErrors,[]);assert.deepEqual(run.httpErrors,[]);assert.deepEqual(run.blockedRequests,[],'Third-party requests or unexpected WebSockets are not a clean pass');assert.deepEqual(run.console.filter(x=>x.type==='error'),[],'Console errors are not a clean pass');assert.ok(run.snapshots.filter(x=>['initial-axis','map-arrival','after-short-input'].includes(x.label)).every(x=>!x.welcomeVisible),'World screenshots must not be hidden by welcome overlay');
   run.status=run.inputMoved?'TECHNICAL_UI_AND_LOAD_PASS_PIXELS_PENDING':'LOADED_INPUT_NOT_PROVEN';run.hallInteriorWalkVerified=false;
  }catch(error){run.status='FAILED_OR_BLOCKED';run.error=String(error.stack??error);if(page&&!page.isClosed()){try{await capture(page,run,'failure');}catch(e){run.failureCaptureError=String(e);}}}
  finally{await activeContext?.close();activeContext=null;save();}
 }
}catch(error){result.fatalError=String(error.stack??error);}
finally{clearTimeout(deadline);await activeContext?.close();await browser?.close();await server?.close();fs.rmSync(cache,{recursive:true,force:true});result.finishedAt=new Date().toISOString();result.status=!result.fatalError&&!result.timeout&&result.runs.length===2&&result.runs.every(r=>r.status==='TECHNICAL_UI_AND_LOAD_PASS_PIXELS_PENDING')?'TECHNICAL_PASS_PIXELS_PENDING':'FAILED_OR_INCOMPLETE';save();}
if(result.status!=='TECHNICAL_PASS_PIXELS_PENDING')process.exitCode=1;
