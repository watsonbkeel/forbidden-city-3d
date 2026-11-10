// Candidate destination: tests/production-smoke.mjs. Execute only in normal CI.
// Real production dist, real UI, no fixture, request mock, injected app hook or source imports.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {createCanvas, loadImage} from '@napi-rs/canvas';
import {verifyBuildSource} from '../scripts/build-identity.mjs';

const base='/forbidden-city-3d/', dist=path.resolve('dist'), out=process.env.EVIDENCE_DIR;
const place='place-outer-west-6cae88b6a2';
const plaque='textures/dafotang/wanshou-wujiang-modern-tc-r259.png';
const plaqueHash='8b814c7439788f2eb0f4bedbe08f7e674de18120d0bb4f1d38e1175943f8e70e';
const hash=b=>createHash('sha256').update(b).digest('hex');
assert.ok(out && path.isAbsolute(out),'absolute evidence directory required');
fs.mkdirSync(out,{recursive:true});
const result={kind:'actual production desktop Chromium UI and WebGL smoke',status:'FAIL',started:new Date().toISOString(),
  releaseAccepted:false,hardwareGpuTested:false,physicalPhoneTested:false,
  visualReview:{status:'REQUIRED',criteria:['Actual hall and interior geometry are visible, not just UI or sky.','The historical main plaque is visibly mounted above the interior, rather than only a downloaded PNG.','Entry frames show movement across the central doorway without black or frozen frames.']},
  untested:['Qianxing Gate precise 0.8m passage crossing','Four-character complete state matrix','Physical phone and hardware GPU performance'],
  boundary:'A sampled desktop software-rendered production smoke, not all-zone completion, hardware GPU, mobile performance, or historical visual fidelity acceptance.',
  assertions:[],screenshots:[],console:[],pageErrors:[],requestFailures:[],responses:[],stages:[]};
let server,browser,context,page,origin,stage='preflight';
const plaqueResponses=[];
function check(ok,message,data){result.assertions.push({stage,pass:!!ok,message,...(data===undefined?{}:{data})});if(!ok)throw Error(message);}
function mark(value){stage=value;result.stages.push({stage,at:new Date().toISOString()});console.log('STAGE '+value);}
function appendBounded(list,value){if(list.length>=2000)throw Error('Evidence event count exceeded fixed 2000 bound');list.push(value);}
async function snapshot(name){
  const status=await page.evaluate(()=>{
    const canvas=document.querySelector('#scene-canvas');
    const gl=canvas?.getContext('webgl2')||canvas?.getContext('webgl');
    const ext=gl?.getExtension('WEBGL_debug_renderer_info');
    return {href:location.href,lang:document.documentElement.lang,location:document.querySelector('#location-panel')?.innerText,
      mapOpen:document.body.classList.contains('map-open'),pointerLocked:!!document.pointerLockElement,
      failure:document.querySelector('#tour-failure-dialog')?.innerText??null,
      diagnostic:document.querySelector('#tour-failure-diagnostic')?.value??null,
      loading:document.querySelector('#progress-text')?.textContent,
      devHook:typeof window.__forbiddenCityApp,perf:document.querySelector('#perf-hud')?.textContent,
      gl:gl?{lost:gl.isContextLost(),width:gl.drawingBufferWidth,height:gl.drawingBufferHeight,
        version:gl.getParameter(gl.VERSION),renderer:gl.getParameter(gl.RENDERER),
        unmaskedRenderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null}:null};
  });
  const filename=name+'.png';
  const perfVisible=await page.locator('#perf-hud').isVisible();
  if(perfVisible)await page.keyboard.press('F3');
  const perfHiddenForCapture=!await page.locator('#perf-hud').isVisible();
  const bytes=await page.screenshot({path:path.join(out,filename),timeout:60000});
  if(perfVisible&&perfHiddenForCapture)await page.keyboard.press('F3');
  const im=await loadImage(bytes),c=createCanvas(160,100),ctx=c.getContext('2d');
  // Center-region image diversity is only a nonblank check, never semantic model acceptance.
  ctx.drawImage(im,im.width*.2,im.height*.25,im.width*.6,im.height*.6,0,0,160,100);
  const pixels=ctx.getImageData(0,0,160,100).data,colors=new Set();let min=255,max=0;
  for(let i=0;i<pixels.length;i+=4){const v=(pixels[i]+pixels[i+1]+pixels[i+2])/3;min=Math.min(min,v);max=Math.max(max,v);colors.add((pixels[i]>>4)*256+(pixels[i+1]>>4)*16+(pixels[i+2]>>4));}
  const row={name,file:filename,bytes:bytes.length,sha256:hash(bytes),perfHiddenForCapture,centerPixels:{quantizedColors:colors.size,luminanceRange:max-min},...status};
  result.screenshots.push(row);
  check(status.devHook==='undefined','production has no development app hook');
  const calls=Number(status.perf?.match(/Calls (\d+)/)?.[1]),tris=Number(status.perf?.match(/Tris ([\d,]+)/)?.[1]?.replaceAll(',',''));
  check(calls>10&&tris>1000,'public F3 HUD reports actual scene draws and triangles',{calls,tris,perf:status.perf});
  check(!status.failure,'no terminal tour failure',status.diagnostic);
  check(status.gl&&!status.gl.lost&&status.gl.width>0&&status.gl.height>0,'real scene canvas has live WebGL context',status.gl);
  check(colors.size>12&&max-min>24,'rendered center is not a uniform blank screen',row.centerPixels);
  return row;
}
async function healthy(){
  check(result.pageErrors.length===0,'no uncaught page errors',result.pageErrors);
  const fatal=result.console.filter(m=>m.type==='error'||/context lost|GL_INVALID|GL_OUT_OF_MEMORY|shader error|VALIDATE_STATUS.*false/i.test(m.text));
  check(!fatal.length,'no console errors or fatal WebGL messages',fatal);
  check(!result.requestFailures.length,'no failed production resource requests',result.requestFailures);
  check(!result.responses.some(r=>r.status>=400),'no HTTP resource errors',result.responses.filter(r=>r.status>=400));
  check(await page.locator('#tour-failure-dialog').count()===0,'no failure recovery dialog');
}
async function openMap(){
  if(await page.locator('#minimap').isVisible())return;
  await page.locator('#help-panel > button').focus();
  await page.keyboard.press('m');
  await page.locator('#minimap').waitFor({state:'visible',timeout:60000});
}
async function resume(){
  if(!await page.evaluate(()=>!!document.pointerLockElement))await page.mouse.click(640,420);
  await page.waitForFunction(()=>!!document.pointerLockElement,null,{timeout:15000});
  await page.locator('#welcome-overlay').waitFor({state:'hidden'});
}
async function enterHall(prefix){
  // Short real key pulses avoid >2s auto-sprint; the real region HUD, not elapsed time, ends the approach.
  for(let i=1;i<=24;i++){
    await page.keyboard.down('w');await page.waitForTimeout(250);await page.keyboard.up('w');
    await page.waitForTimeout(200);
    const location=await page.locator('#location-panel').innerText();
    result.stages.push({stage:'entry pulse',prefix,pulse:i,location});
    if(i%4===0||/慈宁宫后殿|大佛堂/.test(location))await snapshot(prefix+'-step-'+i);
    if(/慈宁宫后殿|大佛堂/.test(location))break;
  }
  const interior=await snapshot(prefix+'-interior');
  check(/慈宁宫后殿|大佛堂/.test(interior.location),'real XZ-region HUD identifies the hall after walking (not a full collision trajectory proof)',interior.location);
  // Retain the actual entrance-facing camera. At this doorway the plaque is
  // within its 70-degree vertical field; uncertain pointer deltas would add yaw.
  await page.waitForTimeout(1000);await snapshot(prefix+'-plaque-view');await healthy();
}
try {
  check(process.env.CI==='true'&&process.env.GITHUB_ACTIONS==='true','run only in admitted ordinary GitHub Actions');
  const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  check(commit===process.env.GITHUB_SHA,'checkout is exact event source');
  check(execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{encoding:'utf8'}).trim()==='','clean checkout before browser');
  const build=verifyBuildSource({expectedBase:base});result.build=build;
  check(build.sourceCommit===commit&&build.sourceDirty===false&&build.release==='R262'&&/^R262-[a-f0-9]{12}$/.test(build.buildId),'normal clean R262 production build belongs to event commit');
  result.playwright=JSON.parse(fs.readFileSync('node_modules/playwright/package.json','utf8')).version;
  check(result.playwright==='1.64.0','exact locked Playwright');
  check(hash(fs.readFileSync(path.join(dist,plaque)))===plaqueHash,'production plaque bytes match approved asset');
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.wasm':'application/wasm','.glb':'model/gltf-binary','.txt':'text/plain; charset=utf-8'};
  server=http.createServer((req,res)=>{
    try{
      const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(!['GET','HEAD'].includes(req.method)||!pathname.startsWith(base)||pathname.includes('\\')){res.writeHead(404);res.end();return;}
      const file=path.resolve(dist,pathname.slice(base.length)||'index.html');
      if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.lstatSync(file).isFile()){res.writeHead(404);res.end();return;}
      res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':fs.statSync(file).size,'Cache-Control':'no-store'});
      if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
    }catch{res.writeHead(500);res.end();}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  origin='http://127.0.0.1:'+server.address().port;result.url=origin+base;
  mark('launch official managed Chromium');
  result.launch={headless:true,chromiumSandbox:true,args:['--use-angle=swiftshader','--enable-automation'],ignoreDefaultArgs:['--enable-unsafe-swiftshader'],rendererPolicy:'Explicit ANGLE software renderer. Remove Playwright 1.64 unsafe SwiftShader default. No sandbox/GPU/security disabling flags.'};
  browser=await chromium.launch({headless:true,chromiumSandbox:true,args:result.launch.args,ignoreDefaultArgs:result.launch.ignoreDefaultArgs,timeout:60000});result.browser=browser.version();
  const browserCDP=await browser.newBrowserCDPSession();
  result.browserCommandLine=await browserCDP.send('Browser.getBrowserCommandLine');
  check(!result.browserCommandLine.arguments.some(a=>/^--(no-sandbox|disable-setuid-sandbox|disable-web-security|disable-gpu|enable-unsafe-swiftshader)(=|$)/.test(a)),'no browser security or GPU disabling flags');
  context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
  page=await context.newPage();page.setDefaultTimeout(30000);
  page.on('pageerror',e=>appendBounded(result.pageErrors,{stage,message:e.message,stack:e.stack}));
  page.on('console',m=>{if(['error','warning'].includes(m.type()))appendBounded(result.console,{stage,type:m.type(),text:m.text()});});
  page.on('requestfailed',r=>appendBounded(result.requestFailures,{stage,url:r.url(),error:r.failure()}));
  page.on('response',r=>{appendBounded(result.responses,{stage,url:r.url(),status:r.status(),type:r.request().resourceType()});if(r.url()===origin+base+plaque)plaqueResponses.push({response:r,stage,at:new Date().toISOString()});});
  mark('production boot');
  const navigation=await page.goto(origin+base,{waitUntil:'domcontentloaded',timeout:120000});
  check(navigation.status()===200,'production HTML served at real Pages base');
  await page.locator('#loading-screen').waitFor({state:'hidden',timeout:240000});
  await page.locator('#scene-canvas').waitFor({state:'visible'});
  check(await page.locator('meta[name="palace-build-id"]').getAttribute('content')===build.buildId,'browser HTML build identity matches verified dist');
  const servedBuild=await page.evaluate(async()=>{const r=await fetch('./build-info.json');if(!r.ok)throw Error('build identity fetch failed');return r.json();});
  check(JSON.stringify(servedBuild)===JSON.stringify(build),'browser HTTP build identity matches disk');
  // Set a reproducible daytime through existing public UI, not fake time or an app hook.
  await page.locator('#day-night-panel > summary').click();
  await page.locator('#beijing-hour').fill('12');await page.locator('#beijing-minute').fill('00');
  await page.locator('#beijing-apply').click();await page.locator('#beijing-close').click();
  check((await page.locator('#release-loading').textContent()).includes('R262'),'actual loading UI displays R262');
  await resume();await page.keyboard.press('F3');
  await page.waitForFunction(()=>/Calls [1-9]/.test(document.querySelector('#perf-hud')?.textContent??''),null,{timeout:60000});
  check((await page.locator('#perf-hud').textContent()).includes('Startup yuqing-south-entry'),'public startup metric reaches eighth and last registered zone');
  await snapshot('01-startup');await healthy();
  mark('map detail and bilingual recovery');
  await openMap();await page.locator('#place-search').fill('大佛堂');
  const button=page.locator(`button[data-place-id="${place}"]`);
  check(await button.isVisible(),'search exposes actual Dafotang catalog button');
  await button.click();
  check(await page.locator('#place-title').innerText()==='大佛堂','Chinese detail title is actual public place identity',await page.locator('#place-title').innerText());
  await page.locator('#map-language').selectOption('en');
  await page.waitForFunction(()=>document.documentElement.lang==='en');
  check((await page.locator('#place-title').innerText()).includes('Back hall of Palace of Compassion and Tranquility'),'detail switches to actual English title');
  check(await page.locator('#place-travel').isVisible(),'real travel action survives language change');
  await snapshot('02-dafotang-detail-en');
  await page.locator('#place-back').click();
  check(await page.locator('#place-search').inputValue()==='大佛堂','return restores search query');
  check(await button.evaluate(e=>document.activeElement===e),'return restores selection focus');
  await button.click();await page.locator('#map-language').selectOption('zh-CN');
  await page.waitForFunction(()=>document.documentElement.lang==='zh-CN');
  mark('real UI travel to complete outer-west');
  await page.locator('#place-travel').click({timeout:180000});
  if(!plaqueResponses.length)await page.waitForResponse(r=>r.url()===origin+base+plaque,{timeout:180000});
  const actualRequest=plaqueResponses.at(-1),response=actualRequest.response;
  check(response.status()===200&&response.request().resourceType()==='image','actual app issued the plaque image request before independent decode');
  const responseBytes=await response.body();
  check(hash(responseBytes)===plaqueHash,'actual app plaque response has exact approved PNG bytes');
  result.plaque={url:response.url(),sha256:hash(responseBytes),bytes:responseBytes.length,requestOrigin:'production ImageLoader before independent decode',stage:actualRequest.stage};
  await page.locator('#minimap').waitFor({state:'hidden',timeout:180000});
  await resume();
  result.plaque.nativeDecode=await page.evaluate(async url=>{const img=new Image();img.src=url;await img.decode();return{complete:img.complete,width:img.naturalWidth,height:img.naturalHeight};},origin+base+plaque);
  check(result.plaque.nativeDecode.complete&&result.plaque.nativeDecode.width===768&&result.plaque.nativeDecode.height===286,'browser native PNG decode succeeds with source dimensions');
  await page.waitForFunction(()=>/^Loaded .*outer-west/m.test(document.querySelector('#perf-hud')?.textContent??''),null,{timeout:60000});
  await page.waitForTimeout(1500);await snapshot('03-dafotang-outside');await healthy();
  mark('walk through actual central door');
  await enterHall('04-dafotang');
  mark('one native jump and cold outer-west return');
  await page.keyboard.press('Space');await page.waitForTimeout(180);await snapshot('06-jump-input');
  await page.waitForTimeout(1400);await snapshot('06-jump-settled');
  result.jump={input:'native Space',evidence:['06-jump-input.png','06-jump-settled.png'],boundary:'Input and visual smoke only; no internal trajectory instrumentation.'};
  await openMap();await page.locator('#place-search').fill('奉先殿');
  await page.locator('button[data-place-id]').filter({hasText:/^奉先殿$/}).click();
  await page.locator('#place-travel').click({timeout:180000});await page.locator('#minimap').waitFor({state:'hidden',timeout:180000});await resume();
  await page.waitForFunction(()=>{const s=document.querySelector('#perf-hud')?.textContent??'';return /^Zone  east-six$/m.test(s)&&!/^Loaded .*outer-west/m.test(s);},null,{timeout:60000});
  await snapshot('08-east-six-outer-west-unloaded');
  result.outerWestUnloadedPerf=await page.locator('#perf-hud').textContent();
  // No fabricated gate teleport. Its actual crossing remains a separate route review.
  await openMap();await page.locator('#place-search').fill('前星门');
  await page.locator('button[data-place-id="supp-fc-e8cc6a03c1"]').click();
  check(await page.locator('#place-travel').count()===0,'Qianxing information-only card does not invent a teleport');
  await snapshot('09-qianxing-information-only');await page.locator('#place-back').click();
  await page.locator('#place-search').fill('大佛堂');await button.click();
  const countBeforeReturn=plaqueResponses.length;
  const [returned]=await Promise.all([page.waitForResponse(r=>r.url()===origin+base+plaque,{timeout:180000}),page.locator('#place-travel').click({timeout:180000})]);
  check(plaqueResponses.length>countBeforeReturn&&hash(await returned.body())===plaqueHash,'cold outer-west return loads actual plaque bytes again');
  await page.locator('#minimap').waitFor({state:'hidden',timeout:180000});await resume();
  await page.waitForFunction(()=>/^Loaded .*outer-west/m.test(document.querySelector('#perf-hud')?.textContent??''),null,{timeout:60000});
  result.returnNativeDecode=await page.evaluate(async url=>{const img=new Image();img.src=url;await img.decode();return{width:img.naturalWidth,height:img.naturalHeight};},origin+base+plaque);
  check(result.returnNativeDecode.width===768&&result.returnNativeDecode.height===286,'returned plaque also decodes natively');
  await page.waitForTimeout(1200);await snapshot('10-dafotang-cold-return');await healthy();
  await enterHall('11-returned-dafotang');
  mark('repeat map close and settings recovery');
  await openMap();await page.locator('#minimap-close').click();await resume();
  // Open the real launcher from the unlocked map, without depending on browser Escape/lock delivery.
  await openMap();await page.locator('#structural-preview-button').click();await page.locator('#settings-panel').waitFor({state:'visible'});
  const releaseText=await page.locator('#release-current').innerText();
  check(releaseText.includes('R262')&&releaseText.includes(build.buildId.split('-').at(-1))&&!/不一致/.test(releaseText),'visible settings release identity agrees with R262 HTML and bundle',releaseText);
  await page.locator('#release-details > summary').click();
  await page.locator('#release-check-btn').click();
  await page.waitForFunction(()=>document.querySelector('#release-status')?.textContent==='当前版本与服务器一致。');
  await snapshot('07-release-identity');
  await page.locator('#resume-btn').click();await page.locator('#settings-panel').waitFor({state:'hidden'});
  check(await page.locator('#minimap').isVisible(),'settings resume restores the previous map');
  await page.locator('#minimap-close').click();await resume();
  await snapshot('07-recovered-tour');await healthy();
  check(execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{encoding:'utf8'}).trim()==='','source checkout remains unchanged after browser');
  result.status='AUTOMATED_SMOKE_PASS_VISUAL_REVIEW_REQUIRED';
}catch(error){result.failure={stage,message:error.message,stack:error.stack};process.exitCode=1;
  try{if(page&&!page.isClosed())await page.screenshot({path:path.join(out,'failure.png'),timeout:15000});}catch(e){result.failureScreenshotError=e.message;}
}finally{
  try{await context?.close();await browser?.close();}catch(e){result.cleanupError=e.message;result.status='FAIL';process.exitCode=1;}
  if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
  result.completed=new Date().toISOString();
  fs.writeFileSync(path.join(out,'production-smoke.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({status:result.status,stage,build:result.build,failure:result.failure,screenshots:result.screenshots.length,visualReview:result.visualReview.status,hardwareGpuTested:false,physicalPhoneTested:false}));
}
